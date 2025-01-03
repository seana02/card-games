import { Player } from "../types/Player";
import { Card, Deck, Suit } from "../types/Deck";
import { BroadcastOperator } from "socket.io";
import { ServerToClientEvents, SocketData } from "types/Socket";
import { DecorateAcknowledgementsWithMultipleResponses } from "socket.io/dist/typed-events";
import { GameState } from "./palace_new";
import { PalacePlayer } from "types/Palace";

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
    public _globalState: GameState
    private _room: Room;
    private _roomID: string;
    private done = false;


    constructor(room: Room, roomID: string, players: Player[], cardRules: CardEffects[] = defaultEffects) {
        this._room = room;
        this._roomID = roomID;
        if (players.length < 1) throw Error("Requires at least 2 players");
        this._globalState = new GameState(players);
 

        room.emit('gameStart', "palace");

        room.emit('playerList', this._globalState.playerList.map((p, i) => ({ name: p.name, id: i, displayed: [{ back: 1 }, { back: 1 }, { back: 1 }], inHand: 6 })));

        this._globalState.playerList.forEach((p, i) => {
            p.sock.on('ready', () => {
                if (!this.done) {
                    this.done = true;
                    this._globalState.playerList.forEach(p => {
                        p.sock.emit('initialize', p.hand.map((c: Card) => ({ suit: c.suit, value: c.value })), this._globalState.drawPile.length, p.id);
                    });
                }
            });

            p.sock.on('setup', inds => {
                if (this.revealCards(p.id, inds[0], inds[1], inds[2])) {
                    p.sock.emit('setupResponse', true, this._globalState.playerList[i].hand.map((c: Card) => ({ suit: c.suit, value: c.value })));
                    room.emit('updateInfo', p.id, this.getPlayerInfo(this._globalState.playerList[i]));
                    let flag = false;
                    this._globalState.playerList.forEach(i => {
                        if (i.revealed.length != 3) flag = true;
                    });
                    if (!flag) {
                        this._room.emit('setupComplete');
                        this._globalState.playerList[this._globalState.currentPlayer].sock.emit('startTurn');
                    }
                } else {
                    p.sock.emit('setupResponse', false, this._globalState.playerList[i].hand);
                }
            });

            p.sock.on('playCards', inds => {
                this.playCards(p.id, inds);
            });

            p.sock.on('takeCards', () => {
                if (p.id != this._globalState.currentPlayer) return;
                if (this._globalState.centerPile.length > 0) {
                    p.sock.emit('takeSuccess', this.takeCards(p.id).map((c: Card) => ({ suit: c.suit, value: c.value })));
                }
                room.emit('updateInfo', p.id, this.getPlayerInfo(this._globalState.playerList[i]));
                room.emit('updateCenter', [], this._globalState.drawPile.length);
                this._globalState.playerList[this._globalState.currentPlayer].sock.emit('startTurn');
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
    public revealCards(uuid: number, i1: number, i2: number, i3: number): boolean {
        if (this._globalState.playerList[uuid].revealed.length === 3) return false;
        this._globalState = this._globalState.setup(uuid, [i1, i2, i3]);
        return this._globalState.playerList[uuid].revealed.length === 3;

        /*
        // ensure that 0 <= i1 < i2 < i3 < 6
        if (!this.checkValidIndices(uuid, [i1, i2, i3])) return false;
        const inds = [i1, i2, i3].sort((a, b) => b - a);

        // If the player already made their choice, don't try again
        if (this._globalState.playerList[uuid].revealed.length == 3) return false;

        const player: PalacePlayer = this._globalState.playerList[uuid];
        // highest index first to avoid position shifting
        inds.forEach(i => player.revealed.push(player.hand.splice(i, 1)[0]));
        return true;
        */
    }


    public sortHand(uuid: number) {
        this._globalState.playerList[uuid].hand.sort((a, b) => {
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
    public playCards(uuid: number, cards: number[]): boolean {
        if (uuid != this._globalState.currentPlayer) return false;
        let newState = this._globalState.playCards(cards);
        if (this._globalState.equals(newState)) return false;
        let arr = [];
        for (let i of newState.playerList[uuid].hand) {
            if (!this._globalState.playerList[uuid].hand.includes(i)) {
                arr.push(i);
            }
        }
        this._globalState.playerList[uuid].sock.emit("playSuccess", arr.map((c: Card) => ({ suit: c.suit, value: c.value })))
        this._room.emit('updateInfo', uuid, this.getPlayerInfo(newState.playerList[uuid]));
    
        this._room.emit('updateCenter', newState.lastPlayed.map((c: Card) => ({ suit: c.suit, value: c.value })), newState.drawPile.length);
    
        (this._globalState = newState).playerList[newState.currentPlayer].sock.emit('startTurn')
        return true;
    }

    /**
     * Verifies that the given value is higher than the top of the deck
     *
     * @param value the value of the card played
     * @returns validity
     */
    public checkPlayableOnTop(value: number): boolean {
        const top = this._globalState.centerPile.peek()?.value;
        if (!top) return true;

        // Note: Ace is 14
        const reverse_flag: boolean = top === 7;
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
        this._globalState.centerPile.clear();
    }

    /**
     * Determines if the given cards completes a set of 4.
     *
     * @param cards the list of cards played
     * @returns boolean representing the given cards complete the set
     */
    public completes(cards: Card[]): boolean {
        const val: number = cards[0].value;
        const n: number = cards.length;
        for (let i = 1; i <= 4 - n; i++) {
            if (!this._globalState.centerPile.peek(i) || val !== this._globalState.centerPile.peek(i).value) {
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
    public checkValidIndices(uuid: number, indeces: number[]): boolean {
        // if there are too many cards specified, it is invalid
        const hand_length = this._globalState.playerList[uuid].hand.length;
        if (indeces.length > hand_length) return false;

        // if there are duplicate indices, is it invalid
        const map: boolean[] = Array(hand_length).fill(false);
        for (let i of indeces) {
            if (i < 0 || i >= hand_length || map[i]) return false;
            map[i] = true;
        }
        return true;
    }

    /**
     * Verifies that every card in the list is the same value
     *
     * @param cards set of cards
     * @return whether the cards are the same value or not
     */
    public checkIdenticalValues(uuid: number, cards: number[]) {
        const playerHand = this._globalState.playerList[uuid].hand;
        const value = playerHand[cards[0]].value;
        let flag = true;
        for (let val of cards) {
            if (playerHand[val].value !== value) {
                flag = false;
            }
        }
        return flag;
    }

    /**
     * Removes cards from center pile and returns it
     * @param uuid player to take
     */
    public takeCards(uuid: number): Card[] {
        if (uuid != this._globalState.currentPlayer) {
            return [];
        }
        const cards = [...this._globalState.centerPile.cards];
        this._globalState = this._globalState.takeCards();
        if (!cards || cards.length < 1) return [];
        /*
        this._globalState.playerList[uuid].hand.push(...cards);
        this.sortHand(uuid);
        this._globalState.centerPile.clear();
        */
        return cards;
    }

    /**
     * Draw a card from the deck
     */
    public drawCard(uuid: number, count: number): Card[] {
        const cards = this._globalState.drawPile.draw(count);
        if (!cards || cards.length < 1) return [];
        cards.forEach(c => this._globalState.playerList[uuid].hand.push(c));
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
