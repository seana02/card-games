import { ClientToServerEvents, ServerToClientEvents } from "@backend/Socket";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import '../styles/palace.css';
import '../styles/App.css';
import Card from "../Card";
import PalacePlayerCard from "../Components/PalacePlayerCard";

interface PalaceProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
}

enum Game {
    SETUP,
    SETUP_DONE,
    IN_TURN,
    OUT_TURN,
    FINISHED,
}

interface playerListTemplate {
    name: string,
    id: number,
    displayed: ( { suit: number, value:number } | { back:number })[],
    inHand: number,
}

export default function Palace(props: PalaceProps) {

    const [hand, setHand] = useState<{suit:number, value:number, selected:boolean}[]>([]);
    const [state, setState] = useState(Game.SETUP);
    const [playerList, setPlayerList] = useState<playerListTemplate[]>([]);

    const [discard, setDiscard] = useState<{suit: number, value: number}|null>(null);
    const [pileCount, setPileCount] = useState(0);

    props.socket.on('initialize', (h: { suit: number, value: number }[], pC: number) => {
        console.log('received initialize', h);
        const hReady: { suit: number, value: number, selected: boolean }[] = [];
        h.forEach(c => hReady.push({ suit: c.suit, value: c.value, selected: false}));
        setHand(hReady);
        setPileCount(pC);
    });

    props.socket.on('playerList', players => {
        setPlayerList(players);
    });

    props.socket.on('setupResponse', (success: boolean, hand: { suit: number, value: number }[]) => {
        if (success) {
            setState(Game.SETUP_DONE);
            setHand(hand.map(c => ({ ...c, selected: false })));
        }
    });

    props.socket.on('updateInfo', updatePlayerList);

    props.socket.on('setupComplete', () => {
        setState(Game.OUT_TURN);
    });
    
    // emits the ready signal only on the first load
    useEffect(() => { props.socket.emit('ready') }, []);

    return (
        <div className="game-board" id="palace-board">
            <div className="top">
                <div className="main">
                    <div className="main-deck">
                        <div className="discard-pile">
                            {
                                discard ? <Card card={discard} className={""} onClick={() => {}} /> : <></>
                            }
                        </div>
                        <div className="draw-pile">
                            <Card card={{back: 0}} className={""} onClick={() => {}}>
                                <div className="draw-pile-count">{pileCount}</div>
                            </Card>
                        </div>
                    </div>
                    <div className="action-buttons">
                        <div className={`action button-submit ${isButtonActive()}`} onClick={submit}>
                            Send
                        </div>
                        <div className={`action button-completion ${isButtonActive()}`} onClick={completion}>
                            Complete
                        </div>
                    </div>
                </div>
                <div className="playerlist">
                    <PalacePlayerCard
                        players={playerList}
                    />
                </div>
            </div>
            <div className="bottom">
                {getCards()}
            </div>
        </div>
    );

    function submit() {
        if (state === Game.SETUP) {
            const inds = hand.map((c, i) => c.selected ? i : -1).filter(i => i !== -1);
            if (inds.length < 3) {
                console.log('not enough cards');
            } else {
                console.log(inds);
                props.socket.emit('setup', inds);               
            }
        }
    }

    function completion() {

    }
    
    function clickCard(i: number) {
        setHand(hand.map((ca, ia) => {
            if (ia == i && (state !== 0 || ca.selected || hand.reduce((x, c) => x + (+c.selected), 0) < 3)) {
                ca.selected = !ca.selected;
            }
            return ca;
        }));
    }

    function getCards() {
        const content: React.JSX.Element[] = [];

        hand.forEach((c, i) => {
            content.push(
                <Card
                    card={c}
                    onClick={() => clickCard(i)}
                    className={"interactable " + (hand[i].selected ? "selected" : "")}
                    clickable={true}
                />
            );
        });
        return (
            <div className="card-group" style={{gridTemplateColumns: `repeat(${content.length}, calc(60vw / ${content.length}))`}}>{content}</div>
        );
    }

    function isButtonActive() {
        switch (state) {
            case Game.SETUP:
            case Game.IN_TURN: return "enabled"
            default: return "disabled"
        }
    }

    type data = {
        displayed: ( {suit: number, value:number} | {back:number} )[],
        inHand: number
    }
    function updatePlayerList(id: number, data: data) {
        if (data.displayed) {
            setPlayerList(playerList.map(p => {
                if (p.id !== id) return p;
                return {
                    ...p,
                    displayed: data.displayed,
                    inHand: data.inHand,
                }
            }));
        }
    }

}

