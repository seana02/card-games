import { Server } from "socket.io";
import * as socketTypes from './types/Socket';
import express from 'express';
import Palace from "games/palace";
import { Player } from "types/Player";

const app = express();
const httpServer = require('http').createServer(app);

const io = new Server<
    socketTypes.ClientToServerEvents,
    socketTypes.ServerToClientEvents,
    socketTypes.InterServerEvents,
    socketTypes.SocketData
>(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

let games: { [room: number]: Palace } = {}
let waiting: { [room: number]: Player[] } = {}

io.on('connection', socket => {
    let room: number = null;
    console.log(`${socket.id} connected`);

    socket.on('joinGame', (roomID: number, name: string) => {
        if (games[roomID]) {
            socket.emit('join', false);
            return;
        }
        room = roomID;

        if (!waiting[roomID]) {
            waiting[roomID] = [];
        }

        socket.join(`${roomID}`);

        waiting[roomID].push({ uuid: socket.id, name: name, conn: socket });
        socket.emit('join', true);
        socket.to(`${roomID}`).emit('playerJoined', name);
    });
});

httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});
