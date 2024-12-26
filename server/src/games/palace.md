# Client (players)
### info needed to display:
- player's cards
- card pile
- draw pile
- all players' face-up cards/used face-down cards
- all players' card count

```json
static data: {
    public player information: {
        name: string,
        id: number,
    }[]
}

data: {
    cards: { suit, value }[]
    shared: {
        center: { suit, value }[],
        draw count: number,
        displayed cards: { [id: number]: { suit, value }[] } // may be face-down to indicate taken
        count: { [id: number]: number }
    }
}
```

# Server (game)

```json
Game State: {
    draw pile: { suit, value }[],
    center pile: { suit, value }[],
    last played: { suit, value }[], // contains only the last played set of cards
    player information: {
        name: string,
        socket: Socket object,
        id: number,
        hand: { suit, value }[],
        hidden: { suit, value }[],
        revealed: { suit, value }[]
    }[],
    current player: number, // id number
    three played by: number, // the player that targeted the current player, or -1 if not in that state
}
```

### state changers
* initialize (player count)
    - sets up players, deals cards, and creates game object
* setup (player id, indices)
    - takes the cards at indices and moves them to revealed
* play card (hand indices)
    - take cards at indices of current player's hand
    - make sure they are the same and playable
    - move to center pile
    - copy to last played
    - check if completable
    - draw cards
* target player (player id)
    - set current player for three response
* take cards
    - put all center pile cards into current player's hand
* play hidden card (hand index)
    - take card of index of current player's hidden
    - move to center pile
    - copy to last played
    - if invalid, force a take
* completions (player id)
    - determine how many cards are needed
    - figure out if the player has the cards
    - if they do, remove them, bomb, give them control
    - if not, do nothing
* move to next player
    - change current player to the next in-play player

### helper functions
* clone state
    - creates a new state object cloning most data
* check valid (center pile array, selected card (optional))
    - check if top card of center pile follows rules
    - check if selected card can be legally played
* check playable
    - check if pile follows rules, and card can be played
* check completes
    - check if card value and count results in a completion
- check if message comes from current player (socket id)
    - find the socket id of the current player, compare to input

### client to server messages
- play card (index: number)
    - check if sender is current player
- target player (player id: number)
- take cards
- complete

### server to client messages
- update public information (public information object)
- update data (data object) 
- revealed (player id: number)
- choose three target
- your turn


