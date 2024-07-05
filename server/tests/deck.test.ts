import { Card, Deck, Suit } from "../src/types/Deck"

let global_deck: Deck = new Deck();
global_deck.init();

describe('Card class', () => {
    test('create card with too low value', () => {
        expect(() => new Card(Suit.Club, 0)).toThrow('Invalid card value');
    });

    test('create card with negative value', () => {
        expect(() => new Card(Suit.Heart, -9)).toThrow('Invalid card value');
    });

    test('create card with too high value', () => {
        expect(() => new Card(Suit.Spade, 14)).toThrow('Invalid card value');
    });

    test('create valid Joker', () => {
        expect(new Card(Suit.Joker, 0)).toEqual({ '_suit': Suit.Joker, '_value': 0 });
    });

    test('create invalid Joker', () => {
        expect(() => new Card(Suit.Joker, 1)).toThrow('Invalid card value');
    });

    test('get suit', () => {
        let sp = new Card(Suit.Spade, 1);
        let he = new Card(Suit.Heart, 1);
        let cl = new Card(Suit.Club, 1);
        let di = new Card(Suit.Diamond, 1);

        expect(sp.suit).toBe(Suit.Spade);
        expect(he.suit).toBe(Suit.Heart);
        expect(cl.suit).toBe(Suit.Club);
        expect(di.suit).toBe(Suit.Diamond);
    });

    test('get value', () => {
        for (let i = 0; i < 5; i++) {
            let rand = Math.floor(Math.random() * 13 + 1);
            let card = new Card(Suit.Heart, rand);

            expect(card.val).toBe(rand);
        }
    });

});

describe('Deck class', () => {

    test('test draw+add', () => {
        let top: Card = global_deck.peek() as Card;
        let curr_card: Card | null = global_deck.draw();
        let curr_card_2: Card | null = global_deck.draw();
        global_deck.add(curr_card_2 as Card);
        global_deck.add(curr_card as Card);
        expect((global_deck.peek() as Card).suit).toBe(top.suit);
    });

    // add more tests inside this describe function
});
