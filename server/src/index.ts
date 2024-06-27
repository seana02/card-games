import { Server } from "socket.io";
import * as socketTypes from './types/Socket';
import express from 'express';

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

io.on('connection', () => {
    console.log('someone connected');
});

httpServer.listen(3000, () => {
    console.log('listening on port 3000');
});
