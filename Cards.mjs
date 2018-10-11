/* jshint esversion: 6 */

import { bitlength, cut, randomSelection, randomRange } from './helpers';

const MAX_CARDS       = 52;

// Second bit denotes the color
const CARD_SPADES     = 0; // ♠ - black
const CARD_CLUBS      = 1; // ♣ - black
const CARD_HEARTS     = 2; // ♥ - red
const CARD_DIAMONDS   = 3; // ♦ - red

const CARD_VALUE_MAX  = 13;

const CardEncoding    = ["A", "N", "a", "n"];
const CardValueNames  = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"];
const CardSuitNames   = ["Spades", "Clubs", "Hearts", "Diamonds"];

const CardGraphics          = [];
CardGraphics[CARD_SPADES]   = Array.from('🂡🂢🂣🂤🂥🂦🂧🂨🂩🂪🂫🂬🂭🂮'); // ♠
CardGraphics[CARD_HEARTS]   = Array.from('🂱🂲🂳🂴🂵🂶🂷🂸🂹🂺🂻🂼🂽🂾'); // ♥
CardGraphics[CARD_DIAMONDS] = Array.from('🃁🃂🃃🃄🃅🃆🃇🃈🃉🃊🃋🃌🃍🃎'); // ♦
CardGraphics[CARD_CLUBS]    = Array.from('🃑🃒🃓🃔🃕🃖🃗🃘🃙🃚🃛🃜🃝🃞'); // ♣

const SuitGraphics          = [];
SuitGraphics[CARD_SPADES]   = '♠';
SuitGraphics[CARD_HEARTS]   = '♥';
SuitGraphics[CARD_DIAMONDS] = '♦';
SuitGraphics[CARD_CLUBS]    = '♣';

export class Card {

    /**
     * Construct card object from hash code.
     * @param {number} code Code (number) or String
     */
    constructor(code) {
        if (typeof code !== 'number')
        {
            code = code.charCodeAt(0);
        }
        this.code  = code;
        let obj = Card.decode(code);
        this.suit  = obj.suit;
        this.value = obj.value;
    }

    /**
     * Encode Card object into card hash code.
     * @param {*} suit      Card suit or Card object {.value, .suit}
     * @param {*} value     Card value or empty if 1st parameter is Card object
     * @returns {string}    Card hash code
     */
    static encode(suit, value = 0) {
        let _suit = suit;
        if (typeof suit === 'object') {
            value = suit.value;
            _suit = suit.suit;
        }
        return CardEncoding[_suit].charCodeAt(0) + value;
    }

    /**
     * Decode the card object from card hash code
     * @param {number} code Card hash code
     * @returns {object}    Card object
     */
    static decode(code) {
        for (let i = 0; i < CardEncoding.length; i++) {
            let base = CardEncoding[i].charCodeAt(0);
            if ((base <= code) && (code < base+CARD_VALUE_MAX))
                return {
                    "suit": i,
                    "value": (code-base)
                };
        }
        throw RangeError(`Invalid card code: ${code}`);
    }

    /**
     * Card label
     * @param {*} suit        Card object | Card suit
     * @param {number} value  Empty       | Card Value
     * @returns {string}      Card label
     */
    static label(suit, value = 0) {
        let _suit = suit;
        if (typeof suit === 'object') {
            value = suit.value;
            _suit = suit.suit;
        }
        return CardValueNames[value] + " of " + CardSuitNames[_suit];
    }

    /**
     * Card glyph
     * @param {*} suit          Card object | Card suit
     * @param {number} value    Empty       | Card Value
     * @returns {string}        Card glyph
     */
    static glyph(suit, value = 0)
    {
        let _suit = suit;
        if (typeof suit === 'object') {
            value = suit.value;
            _suit = suit.suit;
        }
        return CardGraphics[_suit][value];
    }

}

export class CardDeck {

    get length() { return this.items.length; }

    /**
     * Construct a card deck using array of items, hashcode or generate a random deck.
     * @param {object} param1 Array of card items OR hash code (String) of the deck
     */
    constructor(param1 = 0) {
        this.popItems = [];
        if (Array.isArray(param1)) {
            this.items = param1;
            this.hash = this.hashCode;
        } else {
            if (param1 !== 0) {
                this.fromHash(param1);
            } else {
                // random deck
                let deck = CardDeck.randomDeck();
                /* TODO: [MG] - better way to avoid the assign, pass by ref? */
                this.items = deck.items;
                this.hash  = deck.hash;
            }
        }
    }

    /**
     * Convert card deck from collection of items to hashcode.
     */
    get hashCode() {
        let hashValue = [];
        for(let item of this.items)
            hashValue.push(String.fromCharCode(item.code));
        if (this.popItems.length)
        {
            hashValue.push('-');
            for(let item of this.popItems)
                hashValue.push(String.fromCharCode(item.code) );
        }
        return hashValue.join("");
    }

    get glyphs()
    {
        let result = [];
        for(let item of this.items)
            result.push(Card.glyph(item));
        console.log("popItems: ", this.popItems);
        if (this.popItems.length)
        {
            result.push('-');
            for(let item of this.popItems)
                result.push(Card.glyph(item));
        }
        return result.join('');
    }

    shuffle()
    {
        this.items = randomSelection(this.items, this.items.length);
    }

    /**
     * Cut the card deck at given position.
     * @param {integer} pos Position to cut at
     */
    cutAt(pos)
    {
        this.items = cut(this.items, pos);
        this.hash  = this.hashCode;
    }

    pop(count = 1)
    {
        let result = this.items.splice(this.items.length-count, count);
        this.popItems = this.popItems.concat(result);
        console.log("pop", this.popItems);
        this.hash = this.hashCode; // recalculate hash
        console.log("hashCode = ", this.hash);
        return result;
    }

    /**
     * Internal method to populate card deck object from hash.
     * @param {string} hashValue Card deck hash
     */
    fromHash(hashValue) {
        this.hash = hashValue;
        this.items = [];
        this.popItems = [];
        let chars = hashValue.split('');
        let stage = 0;
        for(let i=0; i<chars.length; i++)
        {
            if (chars[i]==='-')
            {
                stage++;
                continue;
            }
            // main set of cards
            if (stage===0)
                this.items.push(new Card(chars[i]));
            else
            // cards that have been already dealt to the user
            if (stage===1)
                this.popItems.push(new Card(chars[i]));
        }
    }

    static decode(hashValue)
    {
        return new CardDeck(hashValue);
    }

    /**
     * Obtains default complete ordered card deck.
     * @returns {object} CardDeck New default-ordered 'full' card deck
     */
    static defaultDeck() {
        let items = [];
        for (let i = 0; i < CARD_DIAMONDS + 1; i++)
            for (let j = 0; j < CARD_VALUE_MAX; j++)
                items.push(new Card(Card.encode(i, j)));
        return new CardDeck(items);
    }

    /**
     * Generates a random card deck.
     * @param {*} customDeck      Custom card deck to choose cards from.
     * @param {number} deckSize   Card deck size (optional)
     * @returns {object} CardDeck New random card deck.
     */
    static randomDeck(customDeck = 0, deckSize = 0) {
        let items = (customDeck === 0) ? CardDeck.defaultDeck().items : customDeck;
        deckSize = (deckSize === 0) ? items.length : deckSize;
        items = randomSelection(items, deckSize);
        return new CardDeck(items);
    }

}
