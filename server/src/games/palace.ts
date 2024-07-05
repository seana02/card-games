import { Action, Player } from "types/Player";
import { Card, Deck } from "types/Deck";

enum PalaceState {
    SETTING,
    IN_GAME,
}

interface PalacePlayer extends Player {
    hidden: Card[],
    revealed: Card[],
    hand: Card[],
    ready: boolean,
}

class Palace {
    /**
     * The socket.io room id of the game
     */
    private _room: string;

    /**
     * Current state of the game
     */
    private _state : PalaceState;

    /**
     * Face-down center pile to draw from.
     */
    private _center: Deck;

    /**
     * Face-up card to discard cards. These cards are not yet out of play.
     */
    private _discard: Deck;

    private _players: PalacePlayer[];
    private _indexOf: { [uuid: string]: number }

    /**
     * The index of the current PalacePlayer
     */
    private _current: number;

    /**
     * Initializes a Palace game and deals out cards.
     */
    constructor(players: Player[]) {
        if (players.length < 1) throw Error("Requires at least 2 players");
        this._center = new Deck(true);
        this._center.shuffle();
        this._state = PalaceState.SETTING;
        for (let i = 0; i < players.length; i++) {
            this._indexOf[players[i].uuid] = i;
            this._players.push({
                ...players[i],
                hidden: this._center.draw(3),
                revealed: [],
                hand: this._center.draw(6),
                ready: false,
            });
        }
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
        if (this.checkValidIndices(uuid, [i1, i2, i3])) return false;
        [i1, i2, i3] = [i1, i2, i3].sort((a,b) => b-a);

        // If the player already made their choice, don't try again
        if (this._players[this._indexOf[uuid]].ready) return false;

        let player: PalacePlayer = this._players[this._indexOf[uuid]];
        // highest index first to avoid position shifting
        player.revealed.push(player.hand.splice(i1)[0]);
        player.revealed.push(player.hand.splice(i2)[0]);
        player.revealed.push(player.hand.splice(i3)[0]);
        player.ready = true;
        this._players.forEach(i => {
            if (!i.ready) return true;
        });
        this._state = PalaceState.IN_GAME;
        return true;
    }

    /**
     * Determines and goes to the next player
     */
    public nextPlayer() {
        this._current = (this._current + 1) % this._players.length;
    }

    /**
     * Plays a set of cards for a player
     *
     * @param uuid player to play
     * @param cards set of cards played
     * @returns if successful, true
     */
    public playCards(uuid: string, cards: number[]): boolean {
        if (this._indexOf[uuid] !== this._current) {
            return false;
        }

        let playerHand = this._players[this._current].hand;
        cards.forEach(val => {
            if (playerHand[val].value !== playerHand[cards[0]].value) {
                return false;
            }
        });

        if (!this.checkValidIndices(uuid, cards)) return false;

        cards.sort((a, b) => (b - a));

        cards.forEach(i => this._center.add(playerHand.splice(i)[0]) );

        this.nextPlayer();

        return true;
    }

    /**
     * Verifies that list of cards is a subset of the player's deck
     *
     * @param uuid player in question
     * @param indeces set of cards
     * @returns validity
     */
    private checkValidIndices(uuid: string, indeces: number[]) : boolean  {
        // if there are too many cards specified, it is invalid
        let hand_length  = this._players[this._indexOf[uuid]].hand.length;
        if (indeces.length > hand_length) return false;

        // if there are duplicate indices, is it invalid
        let map : boolean[] = Array(hand_length).fill(false);
        indeces.forEach(i => {
            if (i < 0 || i >= hand_length || map[i]) return false;
            map[i] = true;
        });
        return true;
    }

    /**
     * Takes from the deck
     * @param uuid player to take
     */
    public takeCards(uuid: string) : boolean {
        if (this._indexOf[uuid] != this._current) {
            return false;
        }
        this._players[this._current].hand.push(...this._center.cards);
        this._center.clear();
        return true;
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
