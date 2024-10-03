import { Component } from "react";
import crownSVG from "../assets/crown";

export default class PlayerCard extends Component<{ name: string, leader: boolean }, {}> {
    public static defaultProps = {
        leader: false
    };

    public render() {
        return (
            <div className="player-card">
                <div className="crown-space">
                    {this.props.leader ? crownSVG() : <></>}
                </div>
                {this.props.name}
            </div>
        );
    }
}

