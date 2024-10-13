import {Card, Deck, Suit} from '../src/types/Deck';
export function printCard(card : Card) : void {
    let card_map : {[rank : number] : String}= {
    }
    card_map[1] = "Ace";
    for (let i = 2; i <= 10; i++) {
        card_map[i] = i.toString();
    }
    card_map[11] = "Jack";
    card_map[12] = "Queen";
    card_map[13] = "King";
    card_map[14] = "Ace";
    card_map[0] = "Red Joker";
    card_map[-1] = "Black Joker";

    let suit_map : {[suit: number]: string}  = {
    };
    suit_map[Suit.Club as number] = "Clubs";
    suit_map[Suit.Diamond as number] = "Diamonds";
    suit_map[Suit.Heart as number ] = "Hearts";
    suit_map[Suit.Spade as number] = "Spades"
    if (card.value <= 0) {
        console.log(card_map[card.value] + "\n");

    } else {
        console.log(card_map[card.value] + " of " + suit_map[card.suit as number] + "\n");
    }

}
export function printCards(cards: Card[]) : void {
    for (let i of cards) {
        printCard(i);
    }
}
export function cardEquals(card1 : Card, card2 : Card) : boolean {
    return (card1.value === card2.value) && (card1.suit === card2.suit);
}
export function cardSetEquals(card1: Card[], card2 : Card[]) : boolean {
    if (card1.length != card2.length) return false;
    for (let currCard of card1) {
        if (card2.find((card) => cardEquals(currCard, card)) === undefined) {
            return false;
        }
    }
    return true;
}
export function isUnique(cards: Card[]) : boolean {
    for (let i = 0; i < cards.length; i++) {
        for (let j = i-1; j >= 0; j--) {
            if (cardEquals(cards[i], cards[j])) return false;
        }
    }
    return true;
}