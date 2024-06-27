/**
  * Represents the possible suit values.
  */
enum Suit { Club, Heart, Spade, Diamond, Joker }

/**
  * Represents a single Card with a suit and value.
  */
class Card {
    private _suit: Suit;
    private _value: number;

    /**
      * Creates a new {@link Card} with the specified suit and value
      *
      * @param suit - The {@link Suit} of the card.
      *
      * @param value - The value of the card, where A=1, J=11, Q=12, K=13.
      * If the suit is Joker, the value may be -1 or 0 black/white or colored Joker.
      * If suit == {@link Suit.Joker}, must be 0 or -1.
      * Otherwise, must be >=1 and <=13.
      */
    constructor(suit: Suit, value: number) {
        this._suit = suit;
        if (suit == Suit.Joker) {
            if (value != 0 && value != -1) {
                this._value = value;
            }
        } else {
            if (value < 1 || value > 14) {
                throw Error("Invalid card value");
            }
            this._value = value;
        }
    }

    public get suit() { return this._suit; }
    public get val() { return this._value; }
}

/**
  * Represents a deck of {@link Card | Cards}
  */
class Deck {
    private _deck: Card[];

    /**
      * Creates a new blank Deck.
      *
      * @param init - Whether to initialize with 52 cards.
      * Defaults to false if omitted.
      */
    constructor(init = false) {
        if (init) this.init();
        else this._deck = [];
    }

    /**
      * Initializes the {@link Deck} with a standard set of 54 cards.
      */
    public init() {
        this._deck = [];
        for (let i = 1; i <= 13; i++) {
            this._deck.push(new Card(Suit.Club, i));
            this._deck.push(new Card(Suit.Heart, i));
            this._deck.push(new Card(Suit.Spade, i));
            this._deck.push(new Card(Suit.Diamond, i));
        }
        this._deck
    }

    /**
      * Shuffles the current deck using the {@link https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle | Fisher Yates shuffle}
      */
    public shuffle() {
        for (let i = this._deck.length - 1; i >= 1; i--) {
            let choice = Math.floor(Math.random() * (i+1));
            let temp = this._deck[i];
            this._deck[i] = this._deck[choice];
            this._deck[choice] = temp;
        }
    }

    /**
      * Returns the top of the deck without removing it.
      *
      * @returns the top {@link Card}, or null if the deck is empty.
      */
    public peek(): Card | null {
        return this._deck[this._deck.length - 1];
    }

    /**
      * Removes and returns the top of the deck.
      *
      * @returns the top {@link Card}, or null if the deck is empty.
      */
    public draw(): Card | null {
        return this._deck.pop();
    }

    /**
      * Add the card to the top of the deck.
      *
      * @param card - The {@link Card} to add to the deck.
      */
    public add(card: Card) {
        this._deck.push(card);
    }

    /**
      * Add all cards in the passed-in deck to the top of this deck.
      *
      * @param deck - The {@link Deck} to add to this one.
      */
    public addDeck(deck: Deck) {
        this._deck.push(...deck._deck);
    }

}
