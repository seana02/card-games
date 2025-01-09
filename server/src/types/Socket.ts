import { PalaceData } from "./Palace";

type Card = { suit: number, value: number };
type Back = { back: number };

export type ServerToClientEvents = {
    join: (roomCreated: boolean, players: { name: string, leader: boolean }[]) => void;
    joinSpectator: () => void;
    lobbyPlayerUpdate: (newPlayer: {name: string, leader: boolean}[]) => void;
    gameStart: (game: string) => void;
    // initialize: (hand: { suit: number, value: number }[], pileCount: number, id: number) => void;
    startFailed: (msg: string) => void;
    // setupResponse: (success: boolean, hand: { suit: number, value: number }[]) => void;
    // playerList: (players: { name: string, id: number, displayed: (Card | Back)[], inHand: number }[]) => void;
    // updateInfo: (id: number, data: { displayed: (Card | Back)[], inHand: number }) => void;
    // setupComplete: () => void;
    // startTurn: () => void;
    // endTurn: () => void;
    // playSuccess: (cards: Card[]) => void;
    // takeSuccess: (cards: Card[]) => void;
    // updateCenter: (cards: Card[], count: number) => void;
    // playThree: () => void;

    // Palace
    initialize: (id: number) => void;
    updateData: (data: PalaceData) => void;
    startTurn: () => void;
    completionInterrupt: () => void;
    promptThreeTarget: () => void;
}

export type ClientToServerEvents = {
    attemptJoin: (roomID: number, name: string) => void;
    startGame: (options: { nineReverse: boolean }) => void;
    ready: () => void;

    // Palace
    setup: (inds: number[]) => void;
    playCards: (inds: number[]) => void;
    takeCards: () => void;
    complete: () => void;
    targetPlayer: (targetID: number) => void;
}

export type InterServerEvents = {
    ping: () => void;
}

export type SocketData = {
    name: string;
    age: number;
}
