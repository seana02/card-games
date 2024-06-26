enum Suit { Club, Heart, Spade, Diamond }

class Card {
    private _suit: Suit;
    private _value: number; // A=1, J=11, Q=12, K=13

    constructor(s: Suit, v: number) {
        this._suit = s;
        if (v < 1 || v > 14) {
            throw Error;
        }
        this._value = v;
    }
}

class Deck {
    private _deck: Card[];

    constructor() {
        for (let i = 1; i <= 13; i++) {
            this._deck.push(new Card(Suit.Club, i));
            this._deck.push(new Card(Suit.Heart, i));
            this._deck.push(new Card(Suit.Spade, i));
            this._deck.push(new Card(Suit.Diamond, i));
        }
    }

    public shuffle() {
        for (let i = this._deck.length - 1; i >= 1; i--) {
            let choice = Math.floor(Math.random() * (i+1));
            let temp = this._deck[i];
            this._deck[i] = this._deck[choice];
            this._deck[choice] = temp;
        }
    }

}
