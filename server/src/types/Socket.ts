import { PalaceData } from "./Palace";

export type ServerToClientEvents = {
    join: (roomCreated: boolean, players: { name: string, leader: boolean }[], id: number) => void;
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
    updatePublicData: (players: {name: string, id: number}[]) => void;
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
    idReceived: () => void;

    // Palace
    setup: (inds: number[]) => void;
    playCards: (inds: number[]) => void;
    playHidden: (ind: number) => void;
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
