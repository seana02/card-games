type Card = { suit: number, value: number };
type Back = { back: number };

export type ServerToClientEvents = {
    withAck: (d: string, callback: (e: number) => void) => void;
    join: (roomCreated: boolean, players: { name: string, leader: boolean }[]) => void;
    joinSpectator: () => void;
    lobbyPlayerUpdate: (newPlayer: {name: string, leader: boolean}[]) => void;
    gameStart: (game: string) => void;
    initialize: (hand: { suit: number, value: number }[], pileCount: number) => void;
    startFailed: (msg: string) => void;
    setupResponse: (success: boolean, hand: { suit: number, value: number }[]) => void;
    playerList: (players: { name: string, id: number, displayed: (Card | Back)[], inHand: number }[]) => void;
    updateInfo: (id: number, data: { displayed: (Card | Back)[], inHand: number }) => void;
    setupComplete: () => void;
    startTurn: () => void;
    endTurn: () => void;
    playSuccess: (cards: Card[]) => void;
    updateCenter: (cards: Card[], count: number) => void;
}

export type ClientToServerEvents = {
    attemptJoin: (roomID: number, name: string) => void;
    startGame: (options: { nineReverse: boolean }) => void;
    ready: () => void;
    setup: (inds: number[]) => void;
    playCards: (inds: number[]) => void;
    takeCards: () => void;
}

export type InterServerEvents = {
    ping: () => void;
}

export type SocketData = {
    name: string;
    age: number;
}
