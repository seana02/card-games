import C1 from './assets/cards/C1'; import H1 from './assets/cards/H1'; import S1 from './assets/cards/S1'; import D1 from './assets/cards/D1';  
import C2 from './assets/cards/C2'; import H2 from './assets/cards/H2'; import S2 from './assets/cards/S2'; import D2 from './assets/cards/D2';  
import C3 from './assets/cards/C3'; import H3 from './assets/cards/H3'; import S3 from './assets/cards/S3'; import D3 from './assets/cards/D3';  
import C4 from './assets/cards/C4'; import H4 from './assets/cards/H4'; import S4 from './assets/cards/S4'; import D4 from './assets/cards/D4';  
import C5 from './assets/cards/C5'; import H5 from './assets/cards/H5'; import S5 from './assets/cards/S5'; import D5 from './assets/cards/D5';  
import C6 from './assets/cards/C6'; import H6 from './assets/cards/H6'; import S6 from './assets/cards/S6'; import D6 from './assets/cards/D6';  
import C7 from './assets/cards/C7'; import H7 from './assets/cards/H7'; import S7 from './assets/cards/S7'; import D7 from './assets/cards/D7';  
import C8 from './assets/cards/C8'; import H8 from './assets/cards/H8'; import S8 from './assets/cards/S8'; import D8 from './assets/cards/D8';  
import C9 from './assets/cards/C9'; import H9 from './assets/cards/H9'; import S9 from './assets/cards/S9'; import D9 from './assets/cards/D9';  
import CT from './assets/cards/CT'; import HT from './assets/cards/HT'; import ST from './assets/cards/ST'; import DT from './assets/cards/DT';  
import CJ from './assets/cards/CJ'; import HJ from './assets/cards/HJ'; import SJ from './assets/cards/SJ'; import DJ from './assets/cards/DJ';  
import CQ from './assets/cards/CQ'; import HQ from './assets/cards/HQ'; import SQ from './assets/cards/SQ'; import DQ from './assets/cards/DQ';  
import CK from './assets/cards/CK'; import HK from './assets/cards/HK'; import SK from './assets/cards/SK'; import DK from './assets/cards/DK';  
import B1 from './assets/cards/BBl'; import B2 from './assets/cards/BRe'; import J1 from './assets/cards/J1'; import J2 from './assets/cards/J2'; 
import { ReactElement, useState } from 'react';

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

interface CardProps {
    card: { card: string } | { suit: Suit, value: number } | { joker: number } | { back: number };
    className: string;
    onClick: () => void;
    clickable?: boolean;
    children?: JSX.Element;
}

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
export default function Card(props: CardProps) {
    let [selected, setSelected] = useState(false);

    let toReturn;
    if (!props.card) toReturn = <></>;
    else if ("card" in props.card) toReturn = cardsStr[props.card.card];
    else if ("suit" in props.card && "value" in props.card) toReturn = cards[props.card.suit][props.card.value];
    else if ("joker" in props.card) toReturn = cards[Suit.Joker][props.card.joker];
    else if ("back" in props.card && props.card.back == 1) toReturn = <B2 />;
    else toReturn = <B1 />;
    return (
        <div className={`card-wrapper ${props.className} ${props.clickable || false}`} onClick={() => {
                if (props.clickable) {
                    setSelected(!selected);
                    props.onClick();
                }
            }}>
            {toReturn}
            {props.children ? props.children : <></>}
        </div>
    );
}


