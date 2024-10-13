import {Card, Deck, Suit} from "../src/types/Deck"
import {Palace, CardEffects, PalacePlayer, PalaceState} from "../src/games/palace"
import {Player} from "../src/types/Player"
import { printCard, printCards, cardEquals, cardSetEquals } from "./testingutils";

describe("Test palace with 4 players", () => {
    let players : Player[] = [];
    players.push({
        uuid: "37fhhrfjk",
        name: "seangean",
        conn: null
    });
    players.push({
        uuid: "eufbeiyf8r",
        name: "elvingelvin",
        conn: null
    });
    players.push({
        uuid: "hf39hfj0bsdf",
        name: "Aryan",
        conn: null
    });
    players.push({
        uuid: "jbfheh390fsj",
        name: "Ray",
        conn: null
    });
    let palace : Palace = new Palace(players);
    test("Ensure starting hands make sense", () => {
        let cards : Card[] = [];
        let uniqueFlag = true;
        for (let player of players) {
            let i = palace._players[palace._indexOf[player.uuid]];
            // log statements below for sanity checks, uncomment if needed
          /*console.log("Player: " + player.name + "\n");
            console.log("Hand:\n");
            printCards(i.hand);
            console.log("Hidden\n");
            printCards(i.hidden);
            console.log("Revealed:");
            printCards(i.revealed);
            */
           for (let currCard of i.hand.concat(i.hidden)) {
                for (let currCard2 of cards) {
                    if (cardEquals(currCard, currCard2)) {
                        uniqueFlag = false;
                    }
                }
                cards.push(currCard);
           }
           // proper starting hand sizes
            expect(i.hand.length).toBe(6);
            expect(i.hidden.length).toBe(3);

        }
        // all cards must be unique !!
        expect(uniqueFlag).toBe(true);
        expect(1).toBe(1);
    })
    test("Ensure revealing works correctly", () => {
        for (let player of players) {
            let i = palace._players[palace._indexOf[player.uuid]];
            let hand_arr = [i.hand[0], i.hand[4], i.hand[5]];
            expect(palace._gameState).toBe(PalaceState.SETTING);
            let revealed_arr = [i.hand[1], i.hand[2], i.hand[3]];
            expect(palace.revealCards(i.uuid, 1, 2, 3)).toBe(true);
            printCards(hand_arr);
            printCards(i.hand);
            expect(cardSetEquals(hand_arr, i.hand)).toBe(true);
            expect(cardSetEquals(revealed_arr, i.revealed)).toBe(true);
            expect(i.ready).toBe(true);
        }
        expect(palace._gameState).toBe(PalaceState.IN_GAME);
    })

})