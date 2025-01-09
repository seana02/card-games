import { GameState, PalaceData, Shared } from "types/Palace"

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
        let player_data: PalaceData = {
            id: i,
            cards: game.playerList[i].hand,
            shared
        }
        console.log(player_data);
        console.log("\n")
    }
}
