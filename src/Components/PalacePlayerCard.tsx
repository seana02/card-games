import { Component, ReactElement } from "react";
import Card from "../Card";

interface CardProps {
    players: {
        name: string,
        id: number,
        displayed: ({ suit: number, value: number } | { back: number })[],
        inHand: number,
    }[]
}

interface PlayerProps {
    player: {
        name: string,
        id: number,
        displayed: ({ suit: number, value: number } | { back: number })[],
        inHand: number,
    }
}

export default function PalacePlayerCard(props: CardProps) {
    let content: ReactElement[] = [];

    props.players.forEach(p => {
        content.push(
            <PlayerCard player={p} />
        );
    });

    return (
        <div className="playerList">
            {content}
        </div>
    );
}

class PlayerCard extends Component<PlayerProps, {}> {

    private getCard(c: { suit: number, value: number } | { back: number }) {
        return (
            <Card 
                card={c}
                className={"small"}
                onClick={() => {}}
            />
        );
    }

    public render() {
        return (
            <div className="player-card">
                {this.props.player.name}
                <div className="display-card-group">
                    <div className="display-card">{this.props.player.inHand || 0}</div>
                    <div className="display-card">{this.getCard(this.props.player.displayed[0])}</div>
                    <div className="display-card">{this.getCard(this.props.player.displayed[1])}</div>
                    <div className="display-card">{this.getCard(this.props.player.displayed[2])}</div>
                </div>
            </div>
        );
    }
}

