import { Socket } from "socket.io"
import { Card, Deck, Suit } from "../types/Deck"
import { Player } from "../types/Player"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "types/Socket"

type PalacePlayer = {
    name: string,
    id: number,
    sock: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    hand: Card[],
    hidden: Card[],
    revealed: Card[]
};

const ordering: {[value: number]: number} = {
    1: 10,
    2: 11,
    3: 13,
    4: 1,
    5: 2,
    6: 3,
    7: 4,
    8: 5,
    9: 6,
    10: 12,
    11: 7,
    12: 8,
    13: 9,
    14: 10,
}

export class GameState {
    drawPile: Deck;
    centerPile: Deck;
    lastPlayed: Card[];
    playerList: PalacePlayer[];
    currentPlayer: number;
    threeUser: number;

    /**
      * Initializes a Palace game with the given player information
      * Currently only supports one deck, so having more than 5 players
      * results in an error
      * 
      * @param players - list of players with name and socket information
      */
    constructor(players: Player[]) {
        if (players.length > 5) throw new Error("Not enough cards!");

        this.drawPile = new Deck(true);
        this.centerPile = new Deck();
        this.lastPlayed = [];
        this.playerList = [];
        this.currentPlayer = 0;
        this.threeUser = -1;

        this.drawPile.shuffle();
        players.forEach((p, i) => {
            this.playerList.push({
                name: p.name,
                id: i,
                sock: p.conn,
                hand: addToHand([], this.drawPile.draw(6)),
                hidden: this.drawPile.draw(3),
                revealed: []
            });
        });
    }

    /**
      * Sets the selected cards as face up cards.
      * Does not change the state if the player has already
      * selected cards or did not select three cards.
      *
      * @param id - the player id of the player to setup
      * @param indices - the indices of the selected cards
      */
    setup(id: number, indices: number[]): GameState {
        // invalid ID
        if (id < 0 || id >= this.playerList.length) return this;
        // incorrect number of cards selected
        if (indices.length !== 3) return this;
        // already selected
        if (this.playerList[id].revealed.length !== 0) return this;
        // invalid selection
        if (!checkValidIndices(this.playerList[id].hand, indices)) return this;

        let newState = cloneState(this);

        // sort high to low
        indices.sort((a,b) => b-a);

        const player = newState.playerList[id];
        indices.forEach(i => player.revealed.push(player.hand.splice(i, 1)[0]));

        return newState;
    }

    /**
      * Plays the card at index of current player's hand
      * Does not change the state if the selected card cannot be played
      * or the index is invalid
      *
      * @param indeices - the indices of cards to be played
      */
    playCards(indices: number[]): GameState {
        // invalid indices
        if (!checkValidIndices(this.playerList[this.currentPlayer].hand, indices)) return this;

        let player = this.playerList[this.currentPlayer];
        let card = player.hand[indices[0]];
        for (let index of indices) {
            // playing two different values
            if (player.hand[indices[index]].value !== card.value) return this;
        }

        // check if the value is playable
        if (!checkPlayable(this.centerPile, card)) return this;

        indices.sort((a,b) => b - a);

        let newState = cloneState(this);
        player = newState.playerList[newState.currentPlayer];

        // if completes, do that instead
        if (checkCompletes(this.centerPile, card.value, indices.length)) {
            indices.forEach(i => player.hand.splice(i,1)[0]);
            newState.centerPile.clear();
            return newState;
        } 

        // move cards to center pile
        indices.forEach(i => newState.centerPile.add(player.hand.splice(i, 1)[0]));

        applyEffectsHelper(newState, card.value);

        // draw cards
        player.hand = addToHand(player.hand, newState.drawPile.draw(Math.max(1, 3 - indices.length)));

        // if the draw pile is empty and the hand is empty, then take displayed
        if (player.hand.length === 0) {
            player.hand = addToHand(player.hand, player.revealed);
            player.revealed = [];
        }

        return newState;
    }

    /**
      * Identifies the player that is the target of a 3 card
      * Fails if the id is invalid or not in play
      *
      * @param id - the player id of the target
      */
    targetPlayer(id: number): GameState {
        // id is not a valid id
        if (id < 0 || id >= this.playerList.length) return this;
        // selected player is not in play
        if (!playerInPlay(this.playerList[id])) return this;

        let newState = cloneState(this);
        newState.currentPlayer = id;
        return newState;
    }

    /**
      * Current player takes the center pile cards
      * If this is the result of a 3, then it removes the 3 from the center pile
      * and gives control to the player that played the 3
      */
    takeCards(): GameState {
        if (!this.centerPile || this.centerPile.length < 1) return this;

        let newState = cloneState(this);

        while (newState.centerPile.peek(1).value === 3) {
            newState.centerPile.draw(1);
        }

        let player = newState.playerList[newState.currentPlayer];
        player.hand = addToHand(player.hand, this.centerPile.cards);
        newState.centerPile.clear();
        if (newState.threeUser === -1) {
            newState.currentPlayer = getNextPlayer(newState.playerList, newState.currentPlayer);
        } else {
            newState.currentPlayer = newState.threeUser;
            newState.threeUser = -1;
        }
        return newState;
    }

    /**
      * Plays a face down card. Does not change state if the index is invalid
      * or it expects a take
      *
      * @param index - the index of the hidden card to play
      */
    playHidden(index: number): GameState {
        // invalid index selection
        if (!this.playerList[this.currentPlayer].hidden[index]) return this;
        // stack is invalid
        if (!checkPlayable(this.centerPile)) return this;
        
        let newState = cloneState(this);
        let player = newState.playerList[newState.currentPlayer];
        let cardVal = player.hidden[index].value;
        newState.centerPile.add(player.hidden[index]);
        player.hidden[index] = null;

        // card already moved to center pile
        if (checkCompletes(this.centerPile, cardVal, 0)) {
            newState.centerPile.clear();
            return newState;
        } 

        if (checkPlayable(this.centerPile)) {
            applyEffectsHelper(newState, newState.centerPile.peek(1).value);
        }

        return newState;
    }

    /**
      * Completes the center pile. Can be played by anyone, so requires
      * the playerID. Fails if the player id is invalid, the player is not
      * in play, or completion is not legal/possible.
      *
      * @param playerID - the player ID of the player attempting to complete
      */
    complete(playerID: number): GameState {
        // invalid player ID
        if (playerID < 0 || playerID >= this.playerList.length) return this;
        // player not in play
        if (!playerInPlay(this.playerList[playerID])) return this;
        // board state invalid
        if (!checkPlayable(this.centerPile)) return this;
        let value = this.centerPile.peek(1).value;
        let currCount = 1;

        while (value === this.centerPile.peek(currCount + 1).value) {
            currCount++;
        }

        let player = this.playerList[playerID];
        let indices = [];
        for (let i = 0; i < player.hand.length && currCount + indices.length < 4; i++) {
            if (player.hand[i].value === value) {
                indices.push(i);
            }
        }

        if (currCount + indices.length === 4) {
            let newState = cloneState(this);
            newState.currentPlayer = playerID;
            return this.playCards(indices);
        }

        return this;
    }
}

/**
  * Helper function to apply card effects to passed in state.
  * Typically used when constructing new state to return.
  *
  * @param state - the state to apply the effect to
  * @param value - the card value played
  */
function applyEffectsHelper(state: GameState, value: number) {
    // apply effect
    if (value === 3) {
        state.threeUser = state.currentPlayer;
    } else if (value === 8) {
        state.currentPlayer = getNextPlayer(state.playerList, state.currentPlayer);
        state.currentPlayer = getNextPlayer(state.playerList, state.currentPlayer);
    } else if (value === 10) {
        state.centerPile.clear();
    } else {
        state.currentPlayer = getNextPlayer(state.playerList, state.currentPlayer);
    }
}


/**************************************
 *                                    * 
 *                                    * 
 *                                    * 
 *          HELPER FUNCTIONS          *  
 *                                    * 
 *                                    * 
 *                                    * 
 **************************************/

/**
  * Adds cards and sorts them, returning the result.
  * 
  * @param currHand - the original hand
  * @param toAdd - set of Cards to add
  */
function addToHand(currHand: Card[], toAdd: Card[]): Card[] {
    let newHand = [...currHand, ...toAdd];
    newHand.sort((a,b) => {
        if (a.suit == Suit.Joker && b.suit == Suit.Joker) return a.value - b.value;
        else if (a.suit == Suit.Joker) return 1;
        else if (b.suit == Suit.Joker) return -1;
        return ordering[a.value] - ordering[b.value];
    });
    return newHand;
}

/**
  * Checks if the indices array is valid for the given array.
  * Returns true if the indices are unique and exist in the array.
  *
  * @param array - the array to check the indices for
  * @param indices - the list of indices to check
  */
function checkValidIndices(array: any[], indices: number[]): boolean {
    const map: boolean[] = Array(array.length).fill(false);
    for (let index of indices) {
        if (index < 0 || index >= array.length || map[index]) return false;
        map[index] = true;
    }
    return true;
}

/**
  * Checks if the top of the center pile follows rules
  * and optionally if the given card can be played on top
  *
  * @param center - the center pile to check validity of
  * @param card - (optional) if given, checks if playable on top of center pile
  */
function checkPlayable(center: Deck, card?: Card): boolean {
    let top = center.peek(1).value;
    let prev = center.peek(2).value;
    let ind = 3;
    while (prev !== top) {
        prev = center.peek(ind).value;
        ind++;
    }
    if (!check(top, prev)) return false;

    if (!card) return true;

    return check(card.value, top);

    function check(toPlay: number, prev: number) {
        switch (top) {
            case 2:
            case 3:
            case 10: break;
            case 4:
            case 5:
            case 6:
            case 7:
                if (toPlay < prev && prev !== 7) return false;
                break;
            case 8:
            case 9:
            case 11:
            case 12:
            case 13:
            case 14:
                if (toPlay < prev || prev === 7) return false;
                break;
            case 1: if (prev === 7) return false;
        }
        return true;
    }
}

/**
  * Checks if a completion occurs if len cards of value is played
  *
  * @param center - the center pile to check validity of
  * @param value - the value of the cards to be played
  * @param len - the count of cards to be played
  */
function checkCompletes(center: Deck, value: number, len: number): boolean {
    if (value === 3) return false;

    for (let i = 1; i <= 4 - len; i++) {
        if (center.peek(i).value != value) return false;
    }
    return true;
}

/**
  * Returns the id of the next player that is still in game
  *
  * @param playerList - the list of players used to determine who is left
  * @param currentPlayer - the current player before changing
  */
function getNextPlayer(playerList: PalacePlayer[], currentPlayer: number): number {
    currentPlayer = (currentPlayer + 1) % playerList.length;
    while (playerInPlay(playerList[currentPlayer])) {
        currentPlayer = (currentPlayer + 1) % playerList.length;
    }
    return currentPlayer;
}

/**
  * Returns whether the given player is still in play
  *
  * @param player - PalacePlayer object to check
  */
function playerInPlay(player: PalacePlayer): boolean {
    return player.hand.length > 0 || player.hidden.length > 0;
}

/**
  * Deep clones a state object and returns the cloned object
  *
  * @param state - the state object to deep clone
  */
function cloneState(state: GameState): GameState {
    let newState: GameState = {
        drawPile: state.drawPile.clone(),
        centerPile: state.centerPile.clone(),
        playerList: [],
        lastPlayed: [...state.lastPlayed],
        currentPlayer: state.currentPlayer,
        threeUser: state.threeUser,
        setup: state.setup,
        playCards: state.playCards,
        targetPlayer: state.targetPlayer,
        takeCards: state.takeCards,
        playHidden: state.playHidden,
        complete: state.complete
    };

    state.playerList.forEach(p => {
        newState.playerList.push({
            name: p.name,
            id: p.id,
            sock: p.sock,
            hand: [...p.hand],
            hidden: [...p.hidden],
            revealed: [...p.revealed],
        });
    });
    return newState;
}





