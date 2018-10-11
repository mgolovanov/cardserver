import * as assert from 'assert';
import * as _      from 'lodash';

export function RunAllTests()
{
  console.log("Run all tests...");
}

export function sayHello()
{
  return "Hello";
}

describe('setup2', function() {
  it('setup2 should succeed', function() { assert.equal(1, 1); });
});

test('says hello', () => {
  expect(sayHello()).toBe("Hello");
});

test('run all tests', () => {
  RunAllTests();
});
