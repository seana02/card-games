import { Socket } from "socket.io"
import { Card, Deck, Suit } from "types/Deck"
import { Player } from "types/Player"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "types/Socket"

export type PalacePlayer = {
    name: string,
    id: number,
    sock: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    hand: Card[],
    hidden: Card[],
    revealed: Card[]
};
export type GameState = {
    drawPile: Deck,
    centerPile: Deck,
    lastPlayed: Card[],
    playerList: PalacePlayer[],
    currentPlayer: number,
    threeUser: number,
}