import { Player } from "../types/Player";
import { Card, Deck, Suit } from "../types/Deck";
import { BroadcastOperator } from "socket.io";
import { ServerToClientEvents, SocketData } from "types/Socket";
import { DecorateAcknowledgementsWithMultipleResponses } from "socket.io/dist/typed-events";
import { GameState } from "./palace_new";
import { PalaceData, PalacePlayer, Shared } from "types/Palace";

type Room = BroadcastOperator<DecorateAcknowledgementsWithMultipleResponses<ServerToClientEvents>, SocketData>;

export enum CardEffects {
    THREE_FORCEGIVE = 1 << 0,
    SEVEN_BELOW = 1 << 1,
    EIGHT_SKIP = 1 << 2,
    NINE_REVERSE = 1 << 3,
    TEN_BOMB = 1 << 4,
}

const defaultEffects = [CardEffects.THREE_FORCEGIVE, CardEffects.SEVEN_BELOW, CardEffects.EIGHT_SKIP, CardEffects.TEN_BOMB];

export enum PalaceState {
    SETTING,
    IN_GAME,
}

const ordering: {[value: number]: number} = {
     1: 10,  2: 11, 3: 13,
     4: 1,   5: 2,  6: 3,
     7: 4,   8: 5,  9: 6,
    10: 12, 11: 7, 12: 8,
    13: 9,  14: 10,
}

export default class Palace {
    public _globalState: GameState
    private _room: Room;
    private readyState: number[];
    private completionBlocked: boolean[];

    constructor(room: Room, players: Player[], cardRules: CardEffects[] = defaultEffects) {
        this._room = room;
        if (players.length < 1) throw Error("Requires at least 2 players");
        this._globalState = new GameState(players);
        this.readyState = new Array(players.length).fill(0);
        this.completionBlocked = new Array(players.length).fill(false);

        this._globalState.playerList.forEach((p, i) => {
            p.sock.on('ready', () => {
                this.ready[p.id] = true;

                console.log('received ready from player', p.id, 'ready array:', this.ready, 'filter:');
                if (this.ready.filter(b => !b).length === 0) {
                    console.log('initializing');
                    this.send();
                }
            });

            p.sock.on('setup', (inds: number[]) => {
                console.log('received setup from player', p.id);
                this._globalState = this._globalState.setup(i, inds);
                console.log('setup sending state', this._globalState.playerList);
                this.send();
                let ready = true;
                for (let i = 0; i < this._globalState.playerList.length && ready; i++) {
                    if (this._globalState.playerList[i].revealed.length !== 3) ready = false;
                }
                if (ready) {
                    console.log('ready to start');
                    this._globalState.playerList[this._globalState.currentPlayer].sock.emit('startTurn');
                }
            });

            p.sock.on('playCards', (inds: number[]) => {
                if (p.id === this._globalState.currentPlayer) {
                    this._globalState = this._globalState.playCards(inds);
                }
                this.completionBlocked.fill(false);
                this.send();
                if (this._globalState.threeUser === this._globalState.currentPlayer) {
                    this._globalState.playerList[this._globalState.currentPlayer].sock.emit('promptThreeTarget');
                } else {
                    this._globalState.playerList[this._globalState.currentPlayer].sock.emit('startTurn');
                }
            });

            p.sock.on('playHidden', (ind: number) => {
                if (p.id === this._globalState.currentPlayer) {
                    this._globalState = this._globalState.playHidden(ind);
                }
                this.send();
                if (this._globalState.threeUser === this._globalState.currentPlayer) {
                    this._globalState.playerList[this._globalState.currentPlayer].sock.emit('promptThreeTarget');
                } else {
                    this._globalState.playerList[this._globalState.currentPlayer].sock.emit('startTurn');
                }
            });

            p.sock.on('takeCards', () => {
                if (p.id === this._globalState.currentPlayer) {
                    this._globalState = this._globalState.takeCards();
                }
                this.completionBlocked.fill(false);
                this.send();
                this._globalState.playerList[this._globalState.currentPlayer].sock.emit('startTurn');
            });

            p.sock.on('complete', () => {
                // prevent spamming completions, re-enabled on card play or take
                if (this.completionBlocked[p.id]) return;
                // if center pile is empty, completion is impossible
                if (this._globalState.centerPile.length === 0) return;
                this.completionBlocked[p.id] = true;
                this._globalState.playerList[this._globalState.currentPlayer].sock.emit('completionInterrupt');
                this._globalState = this._globalState.complete(p.id);
                // only sends if completion succeeded, indicated by empty center pile
                // possibility of being empty beforehand considered earlier
                if (this._globalState.centerPile.length === 0) {
                    this.send();
                }
                this._globalState.playerList[this._globalState.currentPlayer].sock.emit('startTurn');
            });

            p.sock.on('targetPlayer', (targetID: number) => {
                if (p.id !== this._globalState.currentPlayer) return;
                this._globalState = this._globalState.targetPlayer(targetID);
                if (this._globalState.threeUser === this._globalState.currentPlayer) {
                    this._globalState.playerList[this._globalState.currentPlayer].sock.emit('promptThreeTarget');
                } else {
                    this._globalState.playerList[this._globalState.currentPlayer].sock.emit('startTurn');
                }
            });

        });

        room.emit('gameStart', "palace");
    }

    send() {
        let shared: Shared = {
            names: {},
            center: this._globalState.lastPlayed.map(c => ({ suit: c.suit, value: c.value })),
            draw_count: this._globalState.drawPile.length,
            displayed: {},
            count: {}
        }
        for (let i = 0; i < this._globalState.playerList.length; i++) {
            let player = this._globalState.playerList[i];
            shared.displayed[player.id] = [0,1,2].map(v => {
                if (player.revealed[v]) {
                    return { suit: player.revealed[v].suit, value: player.revealed[v].value };
                } else if (player.hidden[v]) {
                    return { back: 0 };
                } else {
                    return null;
                }
            });
            shared.count[player.id] = player.hand.length; 
            shared.names[player.id] = player.name
        }
        for (let i = 0; i < this._globalState.playerList.length; i++) {
            let player_data: PalaceData = {
                id: i,
                cards: this._globalState.playerList[i].hand.map(c => ({ suit: c.suit, value: c.value })),
                shared
            }
            console.log('sending updateData', player_data.shared.displayed);
            this._globalState.playerList[i].sock.emit('updateData', player_data);
        }
    }
    
}

/*

Palace basic rules to implement:
Standard deck of 52 cards

1. Deal 3 cards to each player face down to be hidden
2. Deal 6 cards to each player to be seen
3. Each player chooses 3 of the 6 cards to be placed face up on top of the hidden cards
4. Player with the lowest value card in-hand starts

Loop:
1. Player plays a card that is equal or higher value than the top card in the discard pile
1a. Exceptions are 2 (playable on any card), 10 (bomb), 3 (force another player to take the pile), or if the top card is 7 (play <= 7)
1b. Multiple of the same value card may be played at any point
2. Draw enough cards to have at least 3 cards on hand.
2a. If the player already has 3 or more cards, they may choose to draw one.
2b. If there are no more cards in the center stack, they continue playing until their hand runs out. Then move to phase 2.
3. Play moves on to the next player.
Phase 2 Loop:
1. When the center stack runs out and a player runs out of cards in-hand, they take the 3 face up cards and continue playing like normal.
2. If the player has no cards in-hand to play, they choose a face-down card without knowing which to play.
3. If it is a valid play, continue like normal; if it is an invalid play, the player takes the entire center stack.
4. A player wins when they use all of their face-down cards and run out of cards on hand.

Exceptions to the Loop:
Bombs: the player playing the bomb retains their turn
Completions: any player may at any time play the remaining cards of the value on the top of the discard pile. The pile gets bombed, and play starts at the completer
3s: If the 3 is successful, the attacker retains their turn. If the receiver successfully counters, they take the turn instead.

*/
