import { io, Socket } from 'socket.io-client';
import * as types from '@backend/types';

const socket: Socket<
    types.ServerToClientEvents,
    types.ClientToServerEvents
> = io('http://localhost:3000', {
    autoConnect: false
});

socket.onAny((e, ...args) => {
    console.log(e, args);
})

export function conn() {
    socket.connect();
}
