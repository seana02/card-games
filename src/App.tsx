import "./App.css";
import "./Card.css";
import { useState } from "react";
//import Card from './Card';
import LobbyPlayerList from "./LobbyPlayerList";
import PalaceSettings from "./Settings/Palace";
import { Socket, io } from "socket.io-client";
import * as socketTypes from "@backend/Socket";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [name, setName] = useState("");
  const [room, setRoom] = useState(0);
  const [roomLeader, setLeader] = useState(false);

  const socket: Socket<
    socketTypes.ServerToClientEvents,
    socketTypes.ClientToServerEvents
  > = io("http://localhost:3000", {
    autoConnect: false,
  });

  socket.onAny((e, ...args) => {
    console.log(e, args);
  });

  socket.on("join", (roomCreated) => {
    if (roomCreated) {
      setLeader(true);
    }
    setScreen("lobby");
  });

  socket.on("joinSpectator", () => {
    console.log("Joined as spectator");
  });

  function conn(roomID: number, name: string) {
    socket.connect();
    socket.emit("joinGame", roomID, name);
  }

  let login = (
    <>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        /*ref={roomFieldRef}*/ placeholder="Room ID"
        value={room}
        onChange={(e) => setRoom(+e.target.value)}
      />
      <button
        onClick={() => {
          conn(room, name);
          setScreen("lobby");
        }}
      >
        Connect
      </button>
    </>
  );

  switch (screen) {
    case "lobby":
      return <Lobby />;
    default:
      return login;
  }

  function Lobby(props: {}) {
    return (
      <div id="lobby">
        <div id="lobby-left">
          <RoomHeader
            name={name}
            room={room}
            leader={roomLeader}
            gameType="Palace"
          />
          <PalaceSettings
            start={(options: { nineReverse: boolean }) => {
                
            }}
          />
        </div>
        <LobbyPlayerList
          players={[
            { name: "a", leader: false },
            { name: "b", leader: false },
            { name: "c", leader: true },
          ]}
        />
      </div>
    );
  }

  function RoomHeader(props: {
    name: string;
    room: number;
    leader: boolean;
    gameType: string;
  }) {
    return (
      <div className="room-header">
        <div className="header-name">{props.name}</div>
        {props.leader ? getCrownSVG() : <></>}
        <div className="header-room">{props.room}</div>
        <div className="header-game">{props.gameType}</div>
      </div>
    );
  }

  function getCrownSVG() {
    return (
      <svg
        className="leader-crown"
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 220 220"
        data-darkreader-inline-fill=""
      >
        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          <path d="M220,98.865c0-12.728-10.355-23.083-23.083-23.083s-23.083,10.355-23.083,23.083c0,5.79,2.148,11.084,5.681,15.14 l-23.862,21.89L125.22,73.002l17.787-20.892l-32.882-38.623L77.244,52.111l16.995,19.962l-30.216,63.464l-23.527-21.544 c3.528-4.055,5.671-9.344,5.671-15.128c0-12.728-10.355-23.083-23.083-23.083C10.355,75.782,0,86.137,0,98.865 c0,11.794,8.895,21.545,20.328,22.913l7.073,84.735H192.6l7.073-84.735C211.105,120.41,220,110.659,220,98.865z"></path>
        </g>
      </svg>
    );
  }
}
