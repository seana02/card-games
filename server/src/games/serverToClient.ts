import { GameState } from "types/Palace"
import { Card, Deck, Suit} from "types/Deck"
type Shared = {
    center: Card[],
    draw_count: number,
    displayed: {[id: number]: Card[]},
    count: {[id: number]: number}
}
function serverToClient(game: GameState) {
    let shared: Shared = {
        center: game.centerPile.cards,
        draw_count: game.drawPile.length,
        displayed: {},
        count: {}
    }
    for (let i = 0; i < game.playerList.length; i++) {
        shared.displayed[game.playerList[i].id] = game.playerList[i].revealed;
        shared.count[game.playerList[i].id] = game.playerList[i].hand.length; 
    }
    for (let i = 0; i < game.playerList.length; i++) {
        console.log("Player " + i + ":");
        let player_data = {
            cards: game.playerList[i].hand,
            shared
        }
        console.log(player_data);
        console.log("\n")
    }
}