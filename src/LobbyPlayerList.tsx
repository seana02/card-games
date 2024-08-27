import { Component } from "react";

export default class LobbyPlayerList extends Component<{ players: { name: string, leader: boolean }[] }, {}> {
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

class PlayerCard extends Component<{ name: string, leader: boolean }, {}> {
    public static defaultProps = {
        leader: false
    };

    public render() {
        return (
            <div className="player-card">
                {this.props.name}
            </div>
        );
    }
}

