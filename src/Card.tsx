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

let cards: {[key: string]: ReactElement} = {
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
 * The format for the base 52 cards are {Suit}{Value} where
 * Suit can be C, H, S, D and Value can be 1-9, T, J, Q, K
 * e.g. C2 represents the 2 of Clubs and SQ represents the queen of Spades.
 * Special cards are represented as B1 or BBl for the black back,
 * B2 or BRe for the red back,
 * J1 for the colorful joker and J2 for the monochrome joker.
 */
export default function Card(props: { card: string }) {
    return cards[props.card];
}


