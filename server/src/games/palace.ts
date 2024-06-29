import { Player } from "types/Player";
import { Card, Deck } from "deck/deck";


interface PalacePlayer extends Player {
    hidden: Card[],
    revealed: Card[],
    hand: Card[],
    ready: boolean,
}

class Palace {
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
        if (i1 < 0 || i2 < 0 || i3 < 0 ||
            i1 == i2 || i1 == i3 || i2 == i3 ||
            i1 > 6 || i2 > 6 || i3 > 6) return false;
        [i1, i2, i3] = [i1, i2, i3].sort((a,b) => a-b);

        // If the player already made their choice, don't try again
        if (this._players[this._indexOf[uuid]].ready) return false;

        let player: PalacePlayer = this._players[this._indexOf[uuid]];
        // highest index first to avoid position shifting
        player.revealed.push(player.hand.splice(i3)[0]);
        player.revealed.push(player.hand.splice(i2)[0]);
        player.revealed.push(player.hand.splice(i1)[0]);
        player.ready = true;
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
