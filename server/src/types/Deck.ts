export enum Suit { Club, Heart, Spade, Diamond, Joker }

/**
 * Contains a suit and value, and has comparison method
 */
export class Card {
    private _suit: Suit;
    private _value: number;

    /**
      * Creates a new {@link Card} with the specified suit and value
      *
      * @param suit - The {@link Suit} of the card.
      *
      * @param value - The value of the card, where A=1 (or 14), J=11, Q=12, K=13.
      * If the suit is Joker, the value may be 0 or 1 black/white or colored Joker.
      * If suit == {@link Suit.Joker}, must be 0 or 1.
      * Otherwise, must be >=1 and <=14.
      */
    constructor(suit: Suit, value: number) {
        this._suit = suit;
        if (suit == Suit.Joker) {
            if (value != 0 && value != 1) {
                throw Error("Invalid card value");
            } else {
                this._value = value;
            }
        } else {
            if (value < 1 || value > 14) {
                throw Error("Invalid card value");
            }
            this._value = value;
        }
    }

    /**
      * Function to check if a {@link Card} is equal to this one.
      * Cards are equal if the suit and value are both the same.
      *
      * @param other the Card to compare to
      * 
      * @returns whether the cards are the same
      */
    public equals(other: Card): boolean {
        return (
            this._suit === other.suit &&
            this._value === other.value
        );
    }

    public get suit() { return this._suit; }
    public get value() { return this._value; }
}

export class Deck {
    private _deck: Card[];

    /**
      * Creates a new blank Deck.
      *
      * @param init - Whether to initialize the deck with 52 cards.
      * Defaults to false if omitted.
      *
      * @param jokers - Whether to include 2 jokers when initializing.
      * Defaults to false if omitted.
      */
    constructor(init = false, jokers = false) {
        if (init) this.init(jokers);
        else this._deck = [];
    }

    /**
      * Initializes the {@link Deck} with a standard set of 54 cards.
      *
      * @param jokers - Whether to include 2 jokers.
      * These will be added to the top of stack to be easily removable before shuffling.
      */
    public init(jokers: boolean) {
        this._deck = [];
        for (let i = 2; i <= 14; i++) {
            this._deck.push(new Card(Suit.Club, i));
            this._deck.push(new Card(Suit.Heart, i));
            this._deck.push(new Card(Suit.Spade, i));
            this._deck.push(new Card(Suit.Diamond, i));
        }
        if (jokers) {
            this._deck.push(new Card(Suit.Joker, -1));
            this._deck.push(new Card(Suit.Joker, 0));
        }
    }

    /**
      * Shuffles the current deck using the {@link https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle | Fisher Yates shuffle}
      */
    public shuffle() {
        for (let i = this._deck.length - 1; i >= 1; i--) {
            let choice = Math.floor(Math.random() * (i + 1));
            let temp = this._deck[i];
            this._deck[i] = this._deck[choice];
            this._deck[choice] = temp;
        }
    }

    /**
      * Returns the top of the deck without removing it.
      *
      * @param n the card number from the top to draw. If <= 1, defaults to the top card
      * @returns the nth {@link Card } from the top, or null if such a card doesn't exist.
      */
    public peek(n: number = 1): Card | null {
        if (n < 1) n = 1;
        if (this._deck.length - n < 0) return null;
        return this._deck[this._deck.length - n];
    }

    /**
      * Removes and returns the specified number of cards from the top of the deck.
      *
      * @param count - the maximum number of cards to draw.
      * @returns up to the specified number of {@link Card | Cards}.
      * May return fewer cards if the deck has fewer cards than specified.
      */
    public draw(count: number): Card[] | null {
        let output = [];
        for (let i = 0; i < count; i++) {
            let card = this._deck.pop();
            if (card) output.push(card);
            else break;
        }
        return output;
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
    public get cards(): Card[] {
        return this._deck;
    }
    public clear() {
        this._deck = [];
    }
    public get length() {
        return this._deck.length;
    }

}
