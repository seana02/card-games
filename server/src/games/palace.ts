import { Player } from "Player";

interface PalacePlayer extends Player {
    hidden: Card[],
    revealed: Card[],
    hand: Deck,
}

class Palace {
    private _center: Deck;
    private _discard: Deck;

    private _player: PalacePlayer[];

    constructor(players: Player[]) {
        if (players.length < 1) throw Error("Requires at least 2 players");
        this._center = new Deck(true);
        players.forEach(p => this._player.push({
            ...p,
            hidden: [],
            revealed: [],
            hand: new Deck()
        }));
    }
}
