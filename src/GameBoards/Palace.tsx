import { ClientToServerEvents, ServerToClientEvents } from "@backend/Socket";
import { useState } from "react";
import { Socket } from "socket.io-client";
import '../styles/palace.css';
import '../styles/App.css';
import Card from "../Card";

interface PalaceProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
}

export default function Palace(props: PalaceProps) {

    const [hand, setHand] = useState<{suit:number, value:number}[]>([]);

    props.socket.on('initialize', (h: { suit: number, value: number }[]) => {
        console.log('received initialize', h);
        setHand(h);
    });
    
    props.socket.emit('ready');

    return (
        <div className="game-board" id="palace-board">
            <div className="top">
                <div className="main">

                </div>
                <div className="playerlist">

                </div>
            </div>
            <div className="bottom">
                {getCards()}
            </div>
        </div>
    );

    function getCards() {
        let content = [];

        for (let c of hand) {
            content.push(
                <Card
                    card={c}
                    onClick={() => console.log(c.suit + " " + c.value)}
                />
            );
        }
        return (
            <div className="card-group" style={{gridTemplateColumns: `repeat(${content.length}, calc(60vw / ${content.length}))`}}>{content}</div>
        );
    }
}

