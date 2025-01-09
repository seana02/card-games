import { ClientToServerEvents, ServerToClientEvents } from "@backend/Socket";
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import '../styles/palace.css';
import '../styles/App.css';
import Card, { Suit } from "../Card";
import PalacePlayerCard from "../Components/PalacePlayerCard";
import { PalaceData } from "@backend/Palace";

interface PalaceProps {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>
    name: string
    id: number
}

enum Game {
    SETUP,
    IN_TURN,
    OUT_TURN,
    THREE_MENU,
}

interface PlayerListTemplate {
    name: string,
    id: number,
    displayed: ({ suit: number, value: number } | { back: number })[],
    inHand: number,
}

const ordering: {[value: number]: number} = {
     1: 10,  2: 11, 3: 13,
     4: 1,   5: 2,  6: 3,
     7: 4,   8: 5,  9: 6,
    10: 12, 11: 7, 12: 8,
    13: 9,  14: 10,
}

export default function Palace(props: PalaceProps) {

    const [hand, _setHand] = useState<{ suit: number, value: number, selected: boolean }[]>([]);
    function setHand(newHand: { suit: number, value: number, selected: boolean }[]) {
        sortHand(newHand);
        _setHand(newHand);
    }
    const [hidden, setHidden] = useState<({ suit: number, value: number, selected: boolean}|{ back: number, selected: boolean })[]>([]);
    const [state, setState] = useState(Game.SETUP);
    const [playerList, setPlayerList] = useState<PlayerListTemplate[]>([]);
    const refPlayerList = useRef(playerList);

    const [discard, setDiscard] = useState<{ suit: number, value: number }[]>([]);
    const [pileCount, setPileCount] = useState(0);

    const [completionButton, setCompletionButton] = useState("enabled");

    // update refPlayerList when playerList updates
    useEffect(() => { refPlayerList.current = playerList; }, [playerList]);

    // sets listeners emits ready only on first load
    useEffect(() => {
        props.socket.on('updatePublicData', (players: { name: string, id: number }[]) => {
            let pList: PlayerListTemplate[] = [];
            players.forEach((p, i) => {
                pList.push({
                    name: p.name,
                    id: p.id,
                    // displayed: refPlayerList.current[i]?.displayed || [],
                    displayed: [],
                    // inHand: refPlayerList.current[i]?.inHand || 0,
                    inHand: 0,
                });
            });
            setPlayerList(pList);
        });

        props.socket.on('updateData', (data: PalaceData) => {
            if (data.id !== props.id) console.log('ERROR: incorrect data sent');
            setHand(data.cards.map(c => ({ ...c, selected: false })));
            setHidden(data.shared.displayed[props.id].map(c => ({ ...c, selected: false })));
            let pList: PlayerListTemplate[] = [];
            refPlayerList.current.forEach((p, i) => {
                pList.push({
                    name: p.name,
                    id: p.id,
                    displayed: data.shared.displayed[i],
                    inHand: data.shared.count[i],
                });
            });
            setPlayerList(pList);
            setPileCount(data.shared.draw_count);
            setDiscard(data.shared.center);
            setCompletionButton("enabled");
        });

        props.socket.on('startTurn', () => {
            setState(Game.IN_TURN);
        });

        props.socket.on('completionInterrupt', () => setState(Game.OUT_TURN));

        props.socket.on('promptThreeTarget', () => setState(Game.THREE_MENU));

        props.socket.emit('ready');

        return () => {
            props.socket.off('updatePublicData', () => console.log('Unsubscribed from updatePublicData'));
            props.socket.off('updateData', () => console.log('Unsubscribed from updateData'));
            props.socket.off('startTurn', () => console.log('Unsubscribed from startTurn'));
            props.socket.off('completionInterrupt', () => console.log('Unsubscribed from completionInterrupt'));
            props.socket.off('promptThreeTarget', () => console.log('Unsubscribed from promptThreeTarget'))
        }
    }, []);

    // useEffect(() => { props.socket.emit('ready') });

    return (
        <div className="game-board" id="palace-board">
            {state === Game.THREE_MENU ? getThreeMenu() : <></>}
            <div className="top">
                <div className="main">
                    <div className="main-deck">
                        {getDiscardPile()}
                        <div className="draw-pile">
                            <Card card={{ back: 0 }} className={""} onClick={() => { }}>
                                <div className="draw-pile-count">{pileCount}</div>
                            </Card>
                        </div>
                    </div>
                    <div className="action-buttons">
                        <div className={`action button-submit ${isSubmitActive()}`} onClick={submit}>
                            Send
                        </div>
                        <div className={`action button-completion ${completionButton}`} onClick={completion}>
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
        if (isHiddenShown()) {
            let chosen = -1;
            for (let i = 0; i < 3; i++) {
                if (hidden[i].selected) {
                    if (chosen === -1) {
                        chosen = i;
                    }
                    else {
                        console.log('too many cards selected');
                        return; 
                    }
                }
            }
            if (chosen === -1) {
                console.log('not enough cards');
                return;
            }
            props.socket.emit('playHidden', chosen);
        } else {
            const inds = hand.map((c, i) => c.selected ? i : -1).filter(i => i !== -1);
            switch (state) {
                case Game.SETUP: {
                    if (inds.length < 3) {
                        console.log('not enough cards');
                        return;
                    } else {
                        props.socket.emit('setup', inds);
                    }
                    break;
                }
                case Game.IN_TURN: {
                    if (inds.length < 0) {
                        console.log('not enough cards');
                        return;
                    } else {
                        props.socket.emit('playCards', inds);
                    }
                    break;
                }
            }
        }
        setState(Game.OUT_TURN);
    }

    function completion() {
        props.socket.emit('complete');
        setCompletionButton("disabled");
    }

    function sortHand(newHand: { suit: number, value: number, selected: boolean }[]) {
        return newHand.sort((a, b) => {
            if (a.suit == Suit.Joker && b.suit == Suit.Joker) return a.value - b.value;
            else if (a.suit == Suit.Joker) return 1;
            else if (b.suit == Suit.Joker) return -1;
            return ordering[a.value] - ordering[b.value];
        });
    }

    function clickCard(i: number) {
        if (isHiddenShown()) {
            setHidden(hidden.map((ca, ia) => {
                if (ia == i && (ca.selected || hidden.reduce((x,c) => x + (+c.selected), 0) < 1)) {
                    ca.selected = !ca.selected;
                }
                return ca;
            }));
        } else {
            setHand(hand.map((ca, ia) => {
                if (ia == i && (state !== 0 || ca.selected || hand.reduce((x, c) => x + (+c.selected), 0) < 3)) {
                    ca.selected = !ca.selected;
                }
                return ca;
            }));
        }
    }

    function getCards() {
        const content: React.JSX.Element[] = [];

        if (isHiddenShown()) {
            hidden.forEach((c,i) => {
                content.push(
                    <Card
                        card={c}
                        onClick={() => clickCard(i)}
                        className={"interactable " + (hidden[i].selected ? "selected" : "")}
                        clickable={true}
                    />
                );
            });
            return (
                <div className="card-group" style={{ gridTemplateColumns: `repeat(3, 20vw)` }}>{content}</div>
            );
        }

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
            <div className="card-group" style={{ gridTemplateColumns: `repeat(${content.length}, calc(60vw / ${content.length}))` }}>{content}</div>
        );
    }

    function getDiscardPile() {
        let content: React.JSX.Element[] = [];
        discard.forEach(c => content.push(
            <Card card={c} className={""} onClick={() => { }} />
        ));

        return (
            <div className="discard-pile" style={{ gridTemplateColumns: `repeat(${content.length}, 1vw)`, width: `max(8rem, calc(8rem + ${content.length - 1}vw))` }} onClick={takeDiscard}>
                {content}
            </div>
        );
    }

    function getThreeMenu() {
        let content: React.JSX.Element[] = [];
        playerList.forEach((p, i) => {
            if (props.id == p.id) return;
            let minicards = [0,1,2].map(i => <div className="display-card">{<Card card={p.displayed[i]} className={"small"} onClick={() => { }} />}</div>);
            content.push(
                <div className="player-card" onClick={() => targetPlayer(i)}>
                    {p.name}
                    <div style={{ width: "8px" }}></div>
                    <div className="display-card-group">
                        <div className="display-card">{p.inHand || 0}</div>
                        <div style={{ width: "8px" }}></div>
                        {minicards}
                    </div>
                </div>
            );
        });

        return (
            <>
                <div className="overlay"></div>
                <div className="threemenu">
                    <div className="threemenu-text">Select target player</div>
                    {content}
                </div>
            </>
        );
    }

    function targetPlayer(index: number) {
        props.socket.emit('targetPlayer', playerList[index].id);
        setState(Game.OUT_TURN);
    }

    function takeDiscard() {
        props.socket.emit('takeCards');
        setState(Game.OUT_TURN);
    }

    function isSubmitActive() {
        switch (state) {
            case Game.SETUP:
            case Game.IN_TURN:
                return "enabled";
            case Game.OUT_TURN:
            case Game.THREE_MENU:
            default:
                return "disabled";
        }
    } 

    function isHiddenShown() {
        if (!playerList) return false;
        if (!playerList[props.id]) return false;
        if (hand.length !== 0) return false;
        for (let i = 0; i < 3; i++) {
            if (playerList[props.id].displayed[i] && "back" in playerList[props.id].displayed[i]) {
                return true;
            }
        }
        return false;
    }

}

function logMessage(message: string) {
    console.log(`%c[Palace]%c: ${message}`, "color: blue", "color: initial");
}

function logWarning(message: string) {
    console.log(`%c[WARN]%c: ${message}`, "color: yellow", "color: initial");
}

function logError(message: string) {
    console.log(`%c[ERROR]%c: ${message}`, "color: red", "color: initial");
}
