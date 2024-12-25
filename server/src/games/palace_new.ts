import { Socket } from "socket.io"
import { Card, Deck, Suit } from "types/Deck"
import { Player } from "types/Player"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "types/Socket"

type PalacePlayer = {
    name: string,
    id: number,
    sock: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    hand: Card[],
    hidden: Card[],
    revealed: Card[]
};

type GameState = {
    drawPile: Deck,
    centerPile: Deck,
    lastPlayed: Card[],
    playerList: PalacePlayer[],
    currentPlayer: number,
    threeUser: number,
}

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

/**
  * Initializes a Palace game with the given player information
  * Currently only supports one deck, so having more than 5 players
  * results in an error
  * 
  * @param players - list of players with name and socket information
  */
function initialize(players: Player[]) {
    if (players.length > 5) throw new Error("Not enough cards!");

    let state: GameState = {
        drawPile: new Deck(true),
        centerPile: new Deck(),
        lastPlayed: [],
        playerList: [],
        currentPlayer: 0,
        threeUser: -1,
    };

    state.drawPile.shuffle();
    players.forEach((p, i) => {
        state.playerList.push({
            name: p.name,
            id: i,
            sock: p.conn,
            hand: addToHand([], state.drawPile.draw(6)),
            hidden: state.drawPile.draw(3),
            revealed: []
        });
    });

    return state;
}

/**
  * Sets the selected cards as face up cards.
  * Does not change the state if the player has already
  * selected cards or did not select three cards.
  *
  * @param state - current Game State
  * @param id - the player id of the player to setup
  * @param indices - the indices of the selected cards
  */
function setup(state: GameState, id: number, indices: number[]) {
    // invalid ID
    if (id < 0 || id >= state.playerList.length) return state;
    // incorrect number of cards selected
    if (indices.length !== 3) return state;
    // already selected
    if (state.playerList[id].revealed.length !== 0) return state;
    // invalid selection
    if (!checkValidIndices(state.playerList[id].hand, indices)) return state;

    let newState = cloneState(state);

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
  * @param state - current Game State
  * @param indeices - the indices of cards to be played
  */
function playCard(state: GameState, indices: number[]) {
    // invalid indices
    if (!checkValidIndices(state.playerList[state.currentPlayer].hand, indices)) return state;

    let player = state.playerList[state.currentPlayer];
    let card = player.hand[indices[0]];
    for (let index of indices) {
        // playing two different values
        if (player.hand[indices[index]].value !== card.value) return state;
    }

    // check if the value is playable
    if (!checkPlayable(state.centerPile, card)) return state;

    indices.sort((a,b) => b - a);

    let newState = cloneState(state);
    player = newState.playerList[newState.currentPlayer];

    // if completes, do that instead
    if (checkCompletes(state.centerPile, card.value, indices.length)) {
        indices.forEach(i => player.hand.splice(i,1)[0]);
        newState.centerPile.clear();
        return newState;
    } 

    // move cards to center pile
    indices.forEach(i => newState.centerPile.add(player.hand.splice(i, 1)[0]));

    // apply effect
    if (card.value === 3) {
        newState.threeUser = newState.currentPlayer;
    } else if (card.value === 8) {
        newState.currentPlayer = getNextPlayer(newState.playerList, newState.currentPlayer);
        newState.currentPlayer = getNextPlayer(newState.playerList, newState.currentPlayer);
    } else if (card.value === 10) {
        newState.centerPile.clear();
    } else {
        newState.currentPlayer = getNextPlayer(newState.playerList, newState.currentPlayer);
    }

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
  * @param state - current Game State
  * @param id - the player id of the target
  */
function targetPlayer(state: GameState, id: number) {
    // id is not a valid id
    if (id < 0 || id >= state.playerList.length) return state;
    // selected player is not in play
    if (!playerInPlay(state.playerList[id])) return state;

    let newState = cloneState(state);
    newState.currentPlayer = id;
    return newState;
}

function takeCards(state: GameState) {
    if (!state.centerPile || state.centerPile.length < 1) return state;

    let newState = cloneState(state);
    let player = newState.playerList[newState.currentPlayer];
    player.hand = addToHand(player.hand, state.centerPile.cards);
    newState.centerPile.clear();
    return newState;
}

function playHidden(state: GameState, index: number) {
    // invalid index selection
    if (!state.playerList[state.currentPlayer].hidden[index]) return state;
    
    let newState = cloneState(state);

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
    let newState: GameState =  {
        drawPile: state.drawPile.clone(),
        centerPile: state.centerPile.clone(),
        playerList: [],
        lastPlayed: [...state.lastPlayed],
        currentPlayer: state.currentPlayer,
        threeUser: state.threeUser,
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





