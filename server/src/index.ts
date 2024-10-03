import { Server } from "socket.io";
import * as socketTypes from './types/Socket';
import express from 'express';
import Palace from "./games/palace";
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

let games: { [room: number]: Palace } = {};
let waiting: { [room: number]: Player[] } = {};
let playerList = (room: number) => waiting[room].map((p: Player) => ({ name: p.name, leader: p.leader }));

io.on('connection', socket => {
    let room: number = null;
    let name: string = null;
    console.log(`${socket.id} connected`);

    socket.on('attemptJoin', (roomID: number, _name: string) => {
        room = roomID;
        name = _name;

        // if rooms already has an active game, join as spectator
        if (games[roomID]) {
            socket.emit('joinSpectator');
            return;
        }

        let roomCreated: boolean = false;
        if (!waiting[roomID]) {
            waiting[roomID] = [];
            roomCreated = true;
        }

        socket.join(`${roomID}`);

        waiting[roomID].push({ uuid: socket.id, name: _name, conn: socket, leader: roomCreated });
        socket.emit('join', roomCreated, playerList(roomID)); // emits to only socket
        socket.to(`${roomID}`).emit('lobbyPlayerUpdate', playerList(roomID)); // emits to all in roomID except socket
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
        if(waiting[room]) {
            let removed = waiting[room].splice(waiting[room].findIndex((p: Player) => p.conn == socket), 1)[0];
            if (waiting[room]?.length < 1) {
                delete waiting[room];
            } else {
                if (removed.leader) {
                    waiting[room][0].leader = true;
                }
                socket.to(`${room}`).emit('lobbyPlayerUpdate', playerList(room));
            }
        }
    });

    socket.on('startGame', (options: { nineReverse: boolean }) => {
        console.log('received startGame');
        if (waiting[room].length < 2) {
            socket.emit('startFailed', 'Not enough players');
            return;
        }

        // TODO: card effects parameter
        games[room] = new Palace(io.to(`${room}`), waiting[room]);
        delete waiting[room];
    });
});

httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});
