import { useState } from "react";
import Toggle from "../Components/Toggle";

interface Props {
    start: (options: { nineReverse: boolean }) => void;
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
            <div className="start-button" onClick={startClicked}>Start</div>
        </div>
    );

    function startClicked() {
        props.start(options);
    }

}
