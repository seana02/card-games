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
        // if rooms already has an active game, join as spectator
        if (games[roomID]) {
            socket.emit('joinSpectator');
            return;
        }
        room = roomID;

        let roomCreated: boolean = false;
        if (!waiting[roomID]) {
            waiting[roomID] = [];
            roomCreated = true;
        }

        socket.join(`${roomID}`);

        waiting[roomID].push({ uuid: socket.id, name: name, conn: socket });
        socket.emit('join', roomCreated); // emits to only socket
        socket.to(`${roomID}`).emit('playerJoined', name); // emits to all in roomID except socket
    });
});

httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});
