import { useState } from "react";

interface Props {
    join: (name: string, room: number) => void;
}

export default function Login(props: Props) {
    const [name, setName] = useState("");
    const [room, setRoom] = useState(0);
    return (
        <>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="number"
                /*ref={roomFieldRef}*/
                placeholder="Room ID"
                value={room}
                onChange={(e) => setRoom(+e.target.value)}
            />
            <button
                onClick={() => props.join(name, room)}
            >
                Connect
            </button>
        </>
    );
}
