import { Component } from "react";
import { Socket } from "socket.io-client"
import crownSVG from "../assets/crown"
import PalaceSettings from "../Settings/Palace"
import PlayerCard from "../Components/PlayerCard";
import '../styles/lobby.css';
import { ClientToServerEvents, ServerToClientEvents } from "@backend/Socket";

interface Props {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    name: string;
    room: number;
    roomLeader: boolean;
    gameType: string;
    playerList: { name: string, leader: boolean }[];
}

export default function Lobby(props: Props) {
    return (
        <div id="lobby">
            <div id="lobby-left">
                <RoomHeader
                    name={props.name}
                    room={props.room}
                    leader={props.roomLeader}
                    gameType="Palace"
                />
                <PalaceSettings
                    socket={props.socket}
                />
            </div>
            <LobbyPlayerList
                players={props.playerList}
            />
        </div>
    );

    function RoomHeader(props: {
        name: string;
        room: number;
        leader: boolean;
        gameType: string;
    }) {
        return (
            <div className="room-header">
                <div className="header-name">{props.name}</div>
                {props.leader ? crownSVG() : <></>}
                <div className="header-room">{props.room}</div>
                <div className="header-game">{props.gameType}</div>
            </div>
        );
    }
}

class LobbyPlayerList extends Component<{ players: { name: string, leader: boolean }[] }, {}> {
    public static defaultProps = {
        players: []
    };

    public render() {
        return (
            <div id="lobby-right">
                {this.props.players.map((p, i) => <PlayerCard key={i} name={p.name} leader={p.leader} />)}
            </div>
        );
    }
}

