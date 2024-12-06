import { Player } from "../types/Player";
import { Card, Deck, Suit } from "../types/Deck";
import { BroadcastOperator } from "socket.io";
import { ServerToClientEvents, SocketData } from "types/Socket";
import { DecorateAcknowledgementsWithMultipleResponses } from "socket.io/dist/typed-events";

type Room = BroadcastOperator<DecorateAcknowledgementsWithMultipleResponses<ServerToClientEvents>, SocketData>;

export enum CardEffects {
    THREE_FORCEGIVE = 1 << 0,
    SEVEN_BELOW = 1 << 1,
    EIGHT_SKIP = 1 << 2,
    NINE_REVERSE = 1 << 3,
    TEN_BOMB = 1 << 4,
}

const defaultEffects = [CardEffects.THREE_FORCEGIVE, CardEffects.SEVEN_BELOW, CardEffects.EIGHT_SKIP, CardEffects.TEN_BOMB];

export enum PalaceState {
    SETTING,
    IN_GAME,
}

export interface PalacePlayer extends Player {
    hidden: Card[],
    revealed: Card[],
    hand: Card[],
    ready: boolean,
}


const ordering: {[value: number]: number} = {
    1: 10,
    2: 11,
    3: 13,
    4: 1,
    5: 2,
    6: 3,
    7: 4,
    8: 5,
    9: 6,
    10: 12,
    11: 7,
    12: 8,
    13: 9,
    14: 10,
}

export default class Palace {
    private _room: Room;
    private _roomID: string;
    private _gameState: PalaceState;

    public _drawPile: Deck;
    public _discardPile: Deck;

    public _players: PalacePlayer[];
    public _indexOf: { [uuid: string]: number }

    public _currentPlayer: number;

    public _cardEffects: number;

    public _reversed: boolean;

    public _threePlayed: string;
    public _threeTarget: string;

    private done = false;
    constructor(room: Room, roomID: string, players: Player[], cardRules: CardEffects[] = defaultEffects) {
        this._room = room;
        this._roomID = roomID;
        if (players.length < 1) throw Error("Requires at least 2 players");
        this._drawPile = new Deck(true);
        this._drawPile.shuffle();
        this._discardPile = new Deck();
        this._gameState = PalaceState.SETTING;
        this._indexOf = {};
        this._players = [];
        for (let i = 0; i < players.length; i++) {
            let p = players[i].uuid;
            this._indexOf[p] = i;
            this._players.push({
                ...players[i],
                hidden: this._drawPile.draw(3),
                revealed: [],
                hand: this._drawPile.draw(6),
                ready: false,
            });
            this.sortHand(p);
        }
        this._reversed = false;
        this._cardEffects = 0;
        cardRules.forEach(e => this._cardEffects |= e);

        room.emit('gameStart', "palace");

        room.emit('playerList', this._players.map((p, i) => ({ name: p.name, id: i, displayed: [{ back: 1 }, { back: 1 }, { back: 1 }], inHand: 6 })));

        this._players.forEach(p => {
            let thePlayer = this._players[this._indexOf[p.uuid]];

            p.conn.on('ready', () => {
                if (!this.done) {
                    this.done = true;
                    this._players.forEach(p => {
                        p.conn.emit('initialize', p.hand.map((c: Card) => ({ suit: c.suit, value: c.value })), this._drawPile.length);
                    });
                }
            });

            p.conn.on('setup', inds => {
                if (this.revealCards(p.uuid, inds[0], inds[1], inds[2])) {
                    p.conn.emit('setupResponse', true, thePlayer.hand.map((c: Card) => ({ suit: c.suit, value: c.value })));
                    room.emit('updateInfo', this._indexOf[p.uuid], this.getPlayerInfo(thePlayer));
                    let flag = false;
                    this._players.forEach(i => {
                        if (!i.ready) flag = true;
                    });
                    if (!flag) {
                        this._gameState = PalaceState.IN_GAME;
                        this._currentPlayer = 0;
                        this._room.emit('setupComplete');
                        this._players[this._currentPlayer].conn.emit('startTurn');
                    }
                } else {
                    p.conn.emit('setupResponse', false, thePlayer.hand);
                }
            });

            p.conn.on('playCards', inds => {
                if (this.playCards(p.uuid, inds)) {
                    if (this._drawPile.length > 0 && thePlayer.hand.length < 3) {
                        p.conn.emit('playSuccess', this.drawCard(p.uuid, 3 - thePlayer.hand.length).map((c: Card) => ({ suit: c.suit, value: c.value })));
                    } else {
                        p.conn.emit('playSuccess', []);
                    }
                    room.emit('updateInfo', this._indexOf[p.uuid], this.getPlayerInfo(thePlayer));
                    room.emit('updateCenter', inds.map((_, i) => ({ suit: this._discardPile.peek(i+1).suit, value: this._discardPile.peek(i+1).value })), this._drawPile.length);
                    this._players[this._currentPlayer].conn.emit('startTurn');
                }
            });

            p.conn.on('takeCards', () => {
                if (this._indexOf[p.uuid] != this._currentPlayer) return;
                if (this._discardPile.length > 0) {
                    p.conn.emit('playSuccess', this.takeCards(p.uuid).map((c: Card) => ({ suit: c.suit, value: c.value })));
                }
                this.nextPlayer();
                room.emit('updateInfo', this._indexOf[p.uuid], this.getPlayerInfo(thePlayer));
                room.emit('updateCenter', [], this._drawPile.length);
                this._players[this._currentPlayer].conn.emit('startTurn');
            });
        });
    }

    private getPlayerInfo(player: PalacePlayer) {
        return ({
            displayed: [
                player.revealed[0] ? ({ suit: player.revealed[0].suit, value: player.revealed[0].value }) : (player.hidden[0] ? { back: 1 } : null),
                player.revealed[1] ? ({ suit: player.revealed[1].suit, value: player.revealed[1].value }) : (player.hidden[1] ? { back: 1 } : null),
                player.revealed[2] ? ({ suit: player.revealed[2].suit, value: player.revealed[2].value }) : (player.hidden[2] ? { back: 1 } : null),
            ],
            inHand: player.hand.length
        });
    }

    /**
     * Sets up face up cards chosen by the player.
     * Can be out of order, so requires identification.
     *
     * @param uuid - the uuid of the player making the choice
     * @param i1 - first choice of face up card
     * @param i2 - second choice of face up card
     * @param i3 - third choice of face up card
     *
     * @return whether the action was successful.
     * May be unsuccessful if duplicate or out-of-bounds cards were selected,
     * or if the player has already chosen cards.
     */
    public revealCards(uuid: string, i1: number, i2: number, i3: number): boolean {
        // ensure that 0 <= i1 < i2 < i3 < 6
        if (!this.checkValidIndices(uuid, [i1, i2, i3])) return false;
        const inds = [i1, i2, i3].sort((a, b) => b - a);

        // If the player already made their choice, don't try again
        if (this._players[this._indexOf[uuid]].ready) return false;

        const player: PalacePlayer = this._players[this._indexOf[uuid]];
        // highest index first to avoid position shifting
        inds.forEach(i => player.revealed.push(player.hand.splice(i, 1)[0]));
        player.ready = true;
        return true;
    }

    /**
     * Determines and goes to the next player
     */
    public nextPlayer(skip: number = 0) {
        this._players[this._currentPlayer].conn.emit('endTurn');
        this._currentPlayer = (this._currentPlayer + (this._reversed ? -1 : 1) * (1 + skip)) % this._players.length;
    }

    public sortHand(uuid: string) {
        this._players[this._indexOf[uuid]].hand.sort((a, b) => {
            if (a.suit == Suit.Joker && b.suit == Suit.Joker) return a.value - b.value;
            else if (a.suit == Suit.Joker) return 1;
            else if (b.suit == Suit.Joker) return -1;
            return ordering[a.value] - ordering[b.value];
        });
    }

    /**
     * Plays a set of cards for a player
     *
     * @param uuid player to play
     * @param cards set of cards played
     * @returns if successful, true
     */
    public playCards(uuid: string, cards: number[]): boolean {
        if (!this.checkValidIndices(uuid, cards)) return false;

        // only same-valued cards may be played at the same time
        if (!this.checkIdenticalValues(uuid, cards)) return false;

        const playerHand = this._players[this._currentPlayer].hand;
        const value = playerHand[cards[0]].value;

        // completions can be out of turn
        if (this.completes(uuid, playerHand)) {
            cards.sort((a, b) => (b - a));
            cards.forEach(i => this._discardPile.add(playerHand.splice(i, 1)[0]));
            this.bombCenter();
            this._currentPlayer = this._indexOf[uuid];
            return true;
        }

        if (this._indexOf[uuid] !== this._currentPlayer) {
            return false;
        }

        if (!this.checkPlayableOnTop(value)) return false;

        cards.sort((a, b) => (b - a));

        cards.forEach(i => this._discardPile.add(playerHand.splice(i, 1)[0]));

        let skipCount = 0;
        if (this._cardEffects & CardEffects.THREE_FORCEGIVE && value === 3) {
            // 3 is played
        } else if (this._cardEffects & CardEffects.EIGHT_SKIP && value === 8) {
            skipCount = cards.length;
        } else if (this._cardEffects & CardEffects.NINE_REVERSE && value === 9) {
            this._reversed = !this._reversed;
        } else if (this._cardEffects & CardEffects.TEN_BOMB && value === 10) {
            this.bombCenter();
            return; // don't move players
        }

        this.nextPlayer(skipCount);

        return true;
    }

    public playThree(uuid: string, target: string, cards: number[]): boolean {
        if (!this.checkValidIndices(uuid, cards)) return false;
        if (!this.checkIdenticalValues(uuid, cards)) return false;
        if (this._threeTarget && this._threeTarget != target) return false;

        const playerHand = this._players[this._currentPlayer].hand;
        const value = playerHand[cards[0]].value;
        if (value !== 3) return this.playCards(uuid, cards);

        if (!this._indexOf[target]) return false;

        this._threePlayed = uuid;
        this._threeTarget = target;
        this._currentPlayer = this._indexOf[target];
        return true;
    }

    public loseThreeChallenge(uuid: string): boolean {
        this.takeCards(uuid);
        this._currentPlayer = this._indexOf[this._threePlayed];
        this._threePlayed = null;
        this._threeTarget = null;
        return true;
    }

    /**
     * Verifies that the given value is higher than the top of the deck
     *
     * @param value the value of the card played
     * @returns validity
     */
    public checkPlayableOnTop(value: number): boolean {
        const top = this._discardPile.peek()?.value;
        if (!top) return true;

        // Note: Ace is 14
        const reverse_flag: boolean = (this._cardEffects & CardEffects.SEVEN_BELOW) && (top === 7);
        switch (value) {
            case 2:
            case 3:
            case 10: return true;
            case 4:
            case 5:
            case 6:
            case 7: return top <= value || reverse_flag;
            case 8:
            case 9:
            case 11:
            case 12:
            case 13: return !reverse_flag && top <= value;
            case 14: return !reverse_flag;
        }
        return false;
    }

    /**
     * Handles when the discard pile is bombed via a completion or bomb card
     */
    public bombCenter() {
        this._discardPile.clear();
    }

    /**
     * Determines if the given cards completes a set of 4.
     *
     * @param cards the list of cards played
     * @returns boolean representing the given cards complete the set
     */
    public completes(uuid: string, cards: Card[]): boolean {
        const val: number = cards[0].value;
        const n: number = cards.length;
        for (let i = 1; i <= 4 - n; i++) {
            if (!this._discardPile.peek(i) || val !== this._discardPile.peek(i).value) {
                return false;
            }
        }
        return true;
    }

    /**
     * Verifies that list of cards is a subset of the player's deck
     *
     * @param uuid player in question
     * @param indeces set of cards
     * @returns validity
     */
    public checkValidIndices(uuid: string, indeces: number[]): boolean {
        // if there are too many cards specified, it is invalid
        const hand_length = this._players[this._indexOf[uuid]].hand.length;
        if (indeces.length > hand_length) return false;

        // if there are duplicate indices, is it invalid
        const map: boolean[] = Array(hand_length).fill(false);
        indeces.forEach(i => {
            if (i < 0 || i >= hand_length || map[i]) return false;
            map[i] = true;
        });
        return true;
    }

    /**
     * Verifies that every card in the list is the same value
     *
     * @param cards set of cards
     * @return whether the cards are the same value or not
     */
    public checkIdenticalValues(uuid: string, cards: number[]) {
        const playerHand = this._players[this._indexOf[uuid]].hand;
        const value = playerHand[cards[0]].value;
        cards.forEach(val => {
            if (playerHand[val].value !== value) {
                return false;
            }
        });
        return true;
    }

    /**
     * Removes cards from center pile and returns it
     * @param uuid player to take
     */
    public takeCards(uuid: string): Card[] {
        if (this._indexOf[uuid] != this._currentPlayer) {
            return [];
        }
        const cards = [...this._discardPile.cards];
        if (!cards || cards.length < 1) return [];
        this._players[this._indexOf[uuid]].hand.push(...cards);
        this.sortHand(uuid);
        this._discardPile.clear();
        return cards;
    }

    /**
     * Draw a card from the deck
     */
    public drawCard(uuid: string, count: number): Card[] {
        const cards = this._drawPile.draw(count);
        if (!cards || cards.length < 1) return [];
        cards.forEach(c => this._players[this._indexOf[uuid]].hand.push(c));
        this.sortHand(uuid);
        return cards;
    }
}

/*

Palace basic rules to implement:
Standard deck of 52 cards

1. Deal 3 cards to each player face down to be hidden
2. Deal 6 cards to each player to be seen
3. Each player chooses 3 of the 6 cards to be placed face up on top of the hidden cards
4. Player with the lowest value card in-hand starts

Loop:
1. Player plays a card that is equal or higher value than the top card in the discard pile
1a. Exceptions are 2 (playable on any card), 10 (bomb), 3 (force another player to take the pile), or if the top card is 7 (play <= 7)
1b. Multiple of the same value card may be played at any point
2. Draw enough cards to have at least 3 cards on hand.
2a. If the player already has 3 or more cards, they may choose to draw one.
2b. If there are no more cards in the center stack, they continue playing until their hand runs out. Then move to phase 2.
3. Play moves on to the next player.
Phase 2 Loop:
1. When the center stack runs out and a player runs out of cards in-hand, they take the 3 face up cards and continue playing like normal.
2. If the player has no cards in-hand to play, they choose a face-down card without knowing which to play.
3. If it is a valid play, continue like normal; if it is an invalid play, the player takes the entire center stack.
4. A player wins when they use all of their face-down cards and run out of cards on hand.

Exceptions to the Loop:
Bombs: the player playing the bomb retains their turn
Completions: any player may at any time play the remaining cards of the value on the top of the discard pile. The pile gets bombed, and play starts at the completer
3s: If the 3 is successful, the attacker retains their turn. If the receiver successfully counters, they take the turn instead.

*/
