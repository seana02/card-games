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
    lastPlayed: { suit: number, value: number }[],
    playerList: PalacePlayer[],
    currentPlayer: number,
    threeUser: number,
}
export type Shared = {
    names: { [id: number]: string }
    center: { suit: number, value: number }[],
    draw_count: number,
    displayed: {[id: number]: ({ suit: number, value: number } | { back: number })[]},
    count: {[id: number]: number}
}
export type PalaceData = {
    id: number,
    cards: { suit: number, value: number }[],
    shared: Shared
}
