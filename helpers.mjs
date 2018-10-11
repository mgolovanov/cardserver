/* jshint esversion: 6 */
import { randomBytes } from 'crypto';

/**
 * Function that calculates the number of bits needed to represent an integer N
 * 
 * @param {integer} N Integer number
 * @returns {number} Number of bits needed to represent a number N
 */
export function bitlength(N) {
  if (typeof N !== 'number') throw TypeError(`${typeof N} is not a number!`);
  if (!Number.isInteger(N)) throw TypeError(`${N} is not integer!`);

  return N === 0 ? 0 : Math.floor(Math.log2(N)) + 1;
}

/**
 * Function that calculates the number of bytes needed to represent an integer N
 * 
 * @param {integer} N Integer number
 * @returns {number} Number of bytes needed to represent a number N
 */
export function bytelength(N) {
  if (typeof N !== 'number') throw TypeError(`${typeof N} is not a number!`);
  if (!Number.isInteger(N)) throw TypeError(`${N} is not integer!`);
  let s = 1;
  while (s < 8 && N >= (1 << (s * 8))) s++;
  return s;
}

/**
 * Returns a cryptographically secure random value in range [minN..maxN]
 * 
 * @param {integer} minN min 
 * @param {integer} maxN max
 * @returns {integer} Random value in given range
 */
export function randomRange(minN, maxN) {
  if (minN===maxN)
    return minN;
  let buff = randomBytes(bytelength(maxN));
  let result = 0;
  for(let i=0; i<buff.length; i++)
    result = (result<<8) + buff[i];
  return minN + result % (maxN+1-minN);
}

/**
 * This function returns a random selection of N elements from input array in random order
 * 
 * @param {array}   inArr         Input array
 * @param {number}  numElements  Number of elements to select from input array
 * @returns {array} Random selection of N elements from input array in random order 
 */
export function randomSelection(inArr, numElements) {
  if (!Number.isInteger(numElements)) throw TypeError(`${numElements} is not integer!`);
  if (!Array.isArray(inArr)) throw TypeError(`${typeof inArr} is not Array!`);

  let arr = inArr.slice();
  let result = [];
  for (let i = 0; i < numElements; i++) {
    let idx = randomRange(0, arr.length - 1);
    result.push(arr[idx]);
    arr.splice(idx, 1);
  }
  return result;
}

/**
 * This function 'cuts' an array like a card deck at given position
 * @param {array}  a            Array to cut
 * @param {number} pos          Position to cut at
 * @returns {array} Cut array
 */
export function cut(a, pos) {
  if (!Number.isInteger(pos)) throw TypeError(`${pos} is not integer!`);
  let a2 = a.slice();      // deep copy - keeping const 'a'
  let b = a2.splice(pos);
  return b.concat(a2); 
}
