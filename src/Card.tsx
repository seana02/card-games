import C1 from './assets/C1'; import H1 from './assets/H1'; import S1 from './assets/S1'; import D1 from './assets/D1';  
import C2 from './assets/C2'; import H2 from './assets/H2'; import S2 from './assets/S2'; import D2 from './assets/D2';  
import C3 from './assets/C3'; import H3 from './assets/H3'; import S3 from './assets/S3'; import D3 from './assets/D3';  
import C4 from './assets/C4'; import H4 from './assets/H4'; import S4 from './assets/S4'; import D4 from './assets/D4';  
import C5 from './assets/C5'; import H5 from './assets/H5'; import S5 from './assets/S5'; import D5 from './assets/D5';  
import C6 from './assets/C6'; import H6 from './assets/H6'; import S6 from './assets/S6'; import D6 from './assets/D6';  
import C7 from './assets/C7'; import H7 from './assets/H7'; import S7 from './assets/S7'; import D7 from './assets/D7';  
import C8 from './assets/C8'; import H8 from './assets/H8'; import S8 from './assets/S8'; import D8 from './assets/D8';  
import C9 from './assets/C9'; import H9 from './assets/H9'; import S9 from './assets/S9'; import D9 from './assets/D9';  
import CT from './assets/CT'; import HT from './assets/HT'; import ST from './assets/ST'; import DT from './assets/DT';  
import CJ from './assets/CJ'; import HJ from './assets/HJ'; import SJ from './assets/SJ'; import DJ from './assets/DJ';  
import CQ from './assets/CQ'; import HQ from './assets/HQ'; import SQ from './assets/SQ'; import DQ from './assets/DQ';  
import CK from './assets/CK'; import HK from './assets/HK'; import SK from './assets/SK'; import DK from './assets/DK';  
import B1 from './assets/BBl'; import B2 from './assets/BRe'; import J1 from './assets/J1'; import J2 from './assets/J2'; 
import { ReactElement } from 'react';

export enum Suit { Club, Heart, Spade, Diamond, Joker }

let cards: { [suit: number]: { [val: number]: ReactElement } } = {
    [Suit.Club]: {
        1: <C1 />, 2: <C2 />, 3: <C3 />, 4: <C4 />,
        5: <C5 />, 6: <C6 />, 7: <C7 />, 8: <C8 />,
        9: <C9 />, 10: <CT />, 11: <CJ />, 12: <CQ />,
        13: <CK />, 14: <C1 />
    },
    [Suit.Heart]: {
        1: <H1 />, 2: <H2 />, 3: <H3 />, 4: <H4 />,
        5: <H5 />, 6: <H6 />, 7: <H7 />, 8: <H8 />,
        9: <H9 />, 10: <HT />, 11: <HJ />, 12: <HQ />,
        13: <HK />, 14: <H1 />
    },
    [Suit.Spade]: {
        1: <S1 />, 2: <S2 />, 3: <S3 />, 4: <S4 />,
        5: <S5 />, 6: <S6 />, 7: <S7 />, 8: <S8 />,
        9: <S9 />, 10: <ST />, 11: <SJ />, 12: <SQ />,
        13: <SK />, 14: <S1 />
    },
    [Suit.Diamond]: {
        1: <D1 />, 2: <D2 />, 3: <D3 />, 4: <D4 />,
        5: <D5 />, 6: <D6 />, 7: <D7 />, 8: <D8 />,
        9: <D9 />, 10: <DT />, 11: <DJ />, 12: <DQ />,
        13: <DK />,
        14: <D1 />
    },
    [Suit.Joker]: {
        0: <J2 />,
        1: <J1 />
    }
}

let cardsStr: {[key: string]: ReactElement} = {
    "C1": <C1 />, "H1": <H1 />, "S1": <S1 />, "D1": <D1 />, 
    "C2": <C2 />, "H2": <H2 />, "S2": <S2 />, "D2": <D2 />, 
    "C3": <C3 />, "H3": <H3 />, "S3": <S3 />, "D3": <D3 />, 
    "C4": <C4 />, "H4": <H4 />, "S4": <S4 />, "D4": <D4 />, 
    "C5": <C5 />, "H5": <H5 />, "S5": <S5 />, "D5": <D5 />, 
    "C6": <C6 />, "H6": <H6 />, "S6": <S6 />, "D6": <D6 />, 
    "C7": <C7 />, "H7": <H7 />, "S7": <S7 />, "D7": <D7 />, 
    "C8": <C8 />, "H8": <H8 />, "S8": <S8 />, "D8": <D8 />, 
    "C9": <C9 />, "H9": <H9 />, "S9": <S9 />, "D9": <D9 />, 
    "CT": <CT />, "HT": <HT />, "ST": <ST />, "DT": <DT />, 
    "CJ": <CJ />, "HJ": <HJ />, "SJ": <SJ />, "DJ": <DJ />, 
    "CQ": <CQ />, "HQ": <HQ />, "SQ": <SQ />, "DQ": <DQ />, 
    "CK": <CK />, "HK": <HK />, "SK": <SK />, "DK": <DK />, 
    "B1": <B1 />, "B2": <B2 />, "J1": <J1 />, "J2": <J2 />,
    "BBl": <B1 />, "BRe": <B2 />,
};

/**
 * Component to get a Card.
 * A card can be returned by either (1) a two-character
 * identifier string, or (2) a suit and value.
 * For (1), the first character is the suit (either C, H, S, D) and a value
 * (anything from 1-9 or T, J, Q, K for ten, jack, queen, king, respectively).
 * The identifiers for the jokers are J1 (colorful) and J2 (monochrome).
 * The identifiers for the card backs are BBl (black) and BRe (red).
 * For (2), the suit is one of the suit enum values (Club, Heart, Spade, Diamond),
 * and the value is a number from 1-14.
 * Jokers can be obtained by passing the "joker" prop with value either 0 (monochrome) or 1 (colorful).
 * Card backs can be obtained by passing the "back" prop with value either 0 (black) or 1 (red).
 */
export default function Card(props: { card: string } | { suit: Suit, value: number } | { joker: number } | { back: number }) {
    if ("card" in props) return cardsStr[props.card];
    else if ("suit" in props && "value" in props) return cards[props.suit][props.value];
    else if ("joker" in props) return cards[Suit.Joker][props.joker];
    else if ("back" in props) {
        if (props.back == 1) return <B2 />
    }
    return <B1 />;
}


