
export default function Toggle(props: { text: string, tooltip: string, state: boolean, onClick: () => void }) {
    return (
        <div className="settings-individual">
            <div title={props.tooltip} className="settings-individual-text">{props.text}</div>
            <div className="settings-individual-checkbox" onClick={props.onClick}>{props.state ? "On" : "Off"}</div>
        </div>
    );
}
