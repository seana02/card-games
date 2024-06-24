import { Server } from "socket.io";
import * as types from './types/types';
import express from 'express';

const app = express();
const httpServer = require('http').createServer(app);

const io = new Server<
  types.ClientToServerEvents,
  types.ServerToClientEvents,
  types.InterServerEvents,
  types.SocketData
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
