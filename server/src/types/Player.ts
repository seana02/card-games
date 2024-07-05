import { Socket } from 'socket.io';
import {Card} from './Deck'

export type Player = {
    uuid: string;
    name: string;
    conn: Socket;

}
export type Action = {
    uuid: string;
    affected_cards: Card[];
}
