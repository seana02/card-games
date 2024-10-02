export type ServerToClientEvents = {
    withAck: (d: string, callback: (e: number) => void) => void;
    join: (roomCreated: boolean, players: { name: string, leader: boolean }[]) => void;
    joinSpectator: () => void;
    lobbyPlayerUpdate: (newPlayer: {name: string, leader: boolean}[]) => void;
    gameStart: () => void;
    initialize: (hand: { suit: number, value: number }[]) => void;
    startFailed: (msg: string) => void;
}

export type ClientToServerEvents = {
    attemptJoin: (roomID: number, name: string) => void;
    startGame: (options: { nineReverse: boolean }) => void;
    test: () => void;
}

export type InterServerEvents = {
    ping: () => void;
}

export type SocketData = {
    name: string;
    age: number;
}
