import { io, Socket } from 'socket.io-client';
import * as socketTypes from '@backend/Socket';

const socket: Socket<
    socketTypes.ServerToClientEvents,
    socketTypes.ClientToServerEvents
> = io('http://localhost:3000', {
    autoConnect: false
});

socket.onAny((e, ...args) => {
    console.log(e, args);
})

export function conn() {
    socket.connect();
}
