"use strict";

import * as fs from 'fs';
import { bitlength, cut, randomSelection, randomRange } from 'helpers';
import { Card, CardDeck } from 'Cards';
import * as console from 'console';

const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');
const logger = new console.Console({ stdout: output, stderr: errorOutput });

/**
 * 
 */
test('cut works', () => {
  let a = [0, 1, 2, 3, 4, 5];
  let res = [
    [0, 1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5, 0],
    [2, 3, 4, 5, 0, 1],
    [3, 4, 5, 0, 1, 2],
    [4, 5, 0, 1, 2, 3],
    [5, 0, 1, 2, 3, 4],
  ];
  for (let i = 0; i < a.length; i++) {
    let c = cut(a, i);
    expect(c).toEqual(res[i]);
  }
});

/**
 * 
 */
test('test randomness', () => {

  for (let i = 0; i < 10; i++) {
    let result = randomRange(0, i);
    expect((0 <= result) && (result <= i)).toBe(true);
  }

  let j = 0;
  for (let i = 0; i < 10; i++ , j = i * 65536) {
    let result = randomRange(0, j);
    expect((0 <= result) && (result <= j)).toBe(true);
  }

  let b = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 10; i++) {
    let s = randomSelection(b, i);
    expect(s.length).toBe(i);
  }

  let c = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i < 10; i++) {
    let s = randomSelection(c, c.length);
    expect(s.length).toBe(c.length);
    expect(s.sort()).toEqual(c);
  }
});

/**
 * 
 */
test('deck can be created from array and hash', () => {
  // Verify that the deck can be created and copied using its hashcode
  let cardDeck = new CardDeck([
    new Card("A"),
    new Card("N"),
    new Card("a"),
    new Card("n")
  ]);
  let cardDeck2 = new CardDeck(cardDeck.hashCode);
  expect(cardDeck2).toEqual(cardDeck);

  for (const [k, v] of cardDeck.items.entries()) {
    logger.log(`items[${k}] = `, Card.label(v), Card.glyph(v));
  }
  logger.log(cardDeck.glyphs);
});

test('deck supports pop operation and has a dash marker for popped cards', () => {
  let cardDeck = new CardDeck("ABCDEF");
  expect(cardDeck.pop()[0]).toEqual({"code": 70, "suit": 0, "value": 5}); // F
  expect(cardDeck.pop()[0]).toEqual({"code": 69, "suit": 0, "value": 4}); // E
  expect(cardDeck.pop()[0]).toEqual({"code": 68, "suit": 0, "value": 3}); // D
  expect(cardDeck.pop()[0]).toEqual({"code": 67, "suit": 0, "value": 2}); // C
  expect(cardDeck.pop()[0]).toEqual({"code": 66, "suit": 0, "value": 1}); // B
  expect(cardDeck.hashCode[1]).toBe("-");
  // Last one standing is Ace of Spades
  expect(cardDeck.items.length).toBe(1);
  expect(cardDeck.items[0].suit).toBe(0);
  expect(cardDeck.items[0].value).toBe(0);
});
