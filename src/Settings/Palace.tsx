import { useState } from "react";
import Toggle from "../Components/Toggle";
import { Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@backend/Socket";

interface Props {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
}

export default function PalaceSettings(props: Props) {
    const [options, setOptions] = useState({ nineReverse: false });
    return (
        <div className="settings palace-settings">
            <div className="settings-category">
                <div className="settings-category-heading">Options</div>
                <Toggle
                    text="Nine Reverse"
                    tooltip="Reverses the order when a 9 is played"
                    state={options.nineReverse}
                    onClick={() =>
                        setOptions({ ...options, nineReverse: !options.nineReverse })
                    }
                />
            </div>
            <div className="start-button" onClick={() => {
                props.socket.emit("startGame", options);
            }}>Start</div>
        </div>
    );

}
