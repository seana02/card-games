import "./styles/App.css";
import "./styles/Card.css";
import { useState } from "react";
//import Card from './Card';
import { Socket, io } from "socket.io-client";
import * as socketTypes from "@backend/Socket";
import Login from "./Screens/Login";
import Lobby from "./Screens/Lobby";
import Palace from "./GameBoards/Palace";

export default function App() {
    const [screen, setScreen] = useState("login");
    const [name, setName] = useState("");
    const [room, setRoom] = useState(0);
    const [roomLeader, setLeader] = useState(false);
    const [playerList, setPlayerList] = useState<Array<{ name: string, leader: boolean }>>([]);
    const [id, setID] = useState(-1);
    const [socket, _]: [Socket<socketTypes.ServerToClientEvents, socketTypes.ClientToServerEvents>, any] = useState(io('http://localhost:3000', {
        autoConnect: false
    }));

    socket.on("lobbyPlayerUpdate", (newPlayerList) => {
        if (newPlayerList[0].leader && newPlayerList[0].name === name) {
            setLeader(true);
        }
        setPlayerList(newPlayerList);
    });

    socket.on("join", (roomCreated, players, id) => {
        if (roomCreated) {
            setLeader(true);
        }
        setPlayerList(players);
        setScreen("lobby");
        setID(id);
    });

    socket.on("joinSpectator", () => {
        // TODO
        console.log("Joined as spectator not yet implemented");
    });

    socket.on("startFailed", (msg: string) => {
        console.log("Start failed:", msg);
    });

    socket.on("gameStart", (game: string) => {
        setScreen(game);
    });

    switch (screen) {
        case "lobby":
            return <Lobby
                socket={socket}
                name={name}
                room={room}
                roomLeader={roomLeader}
                gameType='Palace'
                playerList={playerList}
            />;
        case "palace":
            return <Palace
                    name={name}
                    socket={socket}
                    id={id}
                />
        default:
            return <Login
                join={(name: string, room: number) => {
                    socket.connect();
                    socket.emit("attemptJoin", room, name);
                    setName(name);
                    setRoom(room);
                }} />;
    }

}


