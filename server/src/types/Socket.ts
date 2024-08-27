export type ServerToClientEvents = {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    join: (roomCreated: boolean) => void;
    joinSpectator: () => void;
    playerJoined: (name: string) => void;
}

export type ClientToServerEvents = {
    joinGame: (roomID: number, name: string) => void;
}

export type InterServerEvents = {
    ping: () => void;
}

export type SocketData = {
    name: string;
    age: number;
}
