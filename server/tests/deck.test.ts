import {Card, Deck, Suit} from "../src/deck/deck"
let global_deck : Deck = new Deck();
global_deck.init();
describe('test basic stack ops', () => {
    test('test draw+add', () => {
      let top : Card = global_deck.peek() as Card;
      let curr_card : Card | null = global_deck.draw();
      let curr_card_2 : Card | null = global_deck.draw();
      global_deck.add(curr_card_2 as Card);
      global_deck.add(curr_card as Card);
      expect((global_deck.peek() as Card).suit).toBe(top.suit);

    });

    // add more tests inside this describe function
  });