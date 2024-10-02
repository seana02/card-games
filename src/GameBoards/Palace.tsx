import { ClientToServerEvents, ServerToClientEvents } from "@backend/Socket";
import { useState } from "react";
import { Socket } from "socket.io-client";
import '../styles/palace.css';
import '../styles/App.css';

interface PalaceProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
}

export default function Palace(props: PalaceProps) {

    const [hand, setHand] = useState([{}]);

    props.socket.on('initialize', (h: { suit: number, value: number }[]) => {
        setHand(h);
    });
    
    return (
        <div className="game-board" id="palace-board">
            <div className="top">
                <div className="main">

                </div>
                <div className="playerlist">

                </div>
            </div>
            <div className="bottom">

            </div>
        </div>
    );
}

