import { conn } from './socket';
import './App.css';
import './Card.css';
import { useRef, useState } from 'react';
import Card from './Card';

interface LobbyProps {

}

export default function App() {
    let [screen, setScreen] = useState('');
    let [name, setName] = useState('');
    let [room, setRoom] = useState(0);

    function Login() {
        // let roomFieldRef = useRef(null);

        return (
            <>
                <input type='string' placeholder='Name' value={name} onChange={e => setName(e.target.value)} />
                <input type='number' /*ref={roomFieldRef}*/ placeholder='Room ID' value={room} onChange={e => setRoom(+e.target.value)} />
                <button onClick={() => { conn(room, name) }}>Connect</button>
                <div className="card-row">{getRow("C")}</div>
                <div className="card-row">{getRow("H")}</div>
                <div className="card-row">{getRow("S")}</div>
                <div className="card-row">{getRow("D")}</div>
            </>
        );

        function getRow(suit: string) {
            let arr = [<Card card={`${suit}1`} />];
            for (let i = 2; i <= 9; i++) {
                arr.push(<Card card={`${suit}${i}`} />);
            }
            arr.push(<Card card={`${suit}T`} />);
            arr.push(<Card card={`${suit}J`} />);
            arr.push(<Card card={`${suit}Q`} />);
            arr.push(<Card card={`${suit}K`} />);
            return arr;
        }
    }

    switch (screen) {
        case "lobby":
            return <Lobby />;
        default:
            return <Login />;
    }

    function Lobby(props: LobbyProps) {
        return (<></>);
    }

}

