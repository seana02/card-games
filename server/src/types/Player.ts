import { Socket } from 'socket.io';
import { Card } from './Deck'
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from './Socket';

export type Player = {
    uuid: string;
    name: string;
    conn: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    leader: boolean;
}
export type Action = {
    uuid: string;
    affected_cards: Card[];
}
