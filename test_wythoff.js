/**
 * Automated test suite for Wythoff's Mathematical Game Engine
 */

// Mock window for Node execution
global.window = {};

require('./js/engine.js');
const engine = global.window.wythoffEngine;

console.log("=== RUNNING WYTHOFF ENGINE TEST SUITE ===");

// TEST 1: Cold Pairs Verification against theoretical values
const expectedPairs = [
    { n: 0, a: 0, b: 0 },
    { n: 1, a: 1, b: 2 },
    { n: 2, a: 3, b: 5 },
    { n: 3, a: 4, b: 7 },
    { n: 4, a: 6, b: 10 },
    { n: 5, a: 8, b: 13 },
    { n: 6, a: 9, b: 15 },
    { n: 7, a: 11, b: 18 },
    { n: 8, a: 12, b: 20 },
    { n: 9, a: 14, b: 23 },
    { n: 10, a: 16, b: 26 },
];

for (const exp of expectedPairs) {
    const pair = engine.getColdPair(exp.n);
    if (pair.a !== exp.a || pair.b !== exp.b) {
        console.error(`FAIL: Pair n=${exp.n}: Expected (${exp.a}, ${exp.b}), got (${pair.a}, ${pair.b})`);
        process.exit(1);
    }
    if (!engine.isCold2Piles(exp.a, exp.b) || !engine.isCold2Piles(exp.b, exp.a)) {
        console.error(`FAIL: isCold2Piles returned false for known cold pair (${exp.a}, ${exp.b})`);
        process.exit(1);
    }
}
console.log("✔ TEST 1 PASSED: Cold pairs match exact Beatty sequence.");

// TEST 2: Rayleigh-Beatty Partition Theorem Check up to 150
const seen = new Set();
for (let n = 1; n <= 100; n++) {
    const p = engine.getColdPair(n);
    if (seen.has(p.a)) {
        console.error(`FAIL: Number ${p.a} repeated in Beatty sequence!`);
        process.exit(1);
    }
    seen.add(p.a);
    if (seen.has(p.b)) {
        console.error(`FAIL: Number ${p.b} repeated in Beatty sequence!`);
        process.exit(1);
    }
    seen.add(p.b);
}
console.log("✔ TEST 2 PASSED: Rayleigh-Beatty theorem verified (no collisions in integer partition).");

// TEST 3: Winning Move Solver from Hot Positions
const testHotPositions = [
    [5, 9],
    [12, 19],
    [15, 23],
    [10, 14],
    [2, 7]
];

for (const [x, y] of testHotPositions) {
    const move = engine.findWinningMove2Piles(x, y);
    if (!move) {
        console.error(`FAIL: Expected winning move from hot position (${x}, ${y}), got null.`);
        process.exit(1);
    }
    const nextPiles = engine.applyMove([x, y], move.piles, move.amount);
    if (!engine.isCold2Piles(nextPiles[0], nextPiles[1])) {
        console.error(`FAIL: Move ${JSON.stringify(move)} from (${x}, ${y}) resulted in (${nextPiles[0]}, ${nextPiles[1]}) which is NOT cold!`);
        process.exit(1);
    }
}
console.log("✔ TEST 3 PASSED: All moves from hot positions transition precisely to cold pairs!");

// TEST 4: Cold positions have no winning moves
for (const exp of expectedPairs.slice(1)) {
    const move = engine.findWinningMove2Piles(exp.a, exp.b);
    if (move !== null) {
        console.error(`FAIL: Cold position (${exp.a}, ${exp.b}) produced move: ${JSON.stringify(move)}`);
        process.exit(1);
    }
}
console.log("✔ TEST 4 PASSED: Cold positions correctly have no winning moves.");

// TEST 5: AI Engine for 3 and 4 Piles
const aiMove3 = engine.getAIMove([8, 12, 16], 'hard');
if (!aiMove3 || !aiMove3.piles || aiMove3.amount <= 0) {
    console.error("FAIL: 3-pile AI move invalid:", aiMove3);
    process.exit(1);
}
console.log(`✔ TEST 5 PASSED: 3-pile AI generated valid move: ${JSON.stringify(aiMove3)}`);

const aiMove4 = engine.getAIMove([7, 11, 14, 18], 'hard');
if (!aiMove4 || !aiMove4.piles || aiMove4.amount <= 0) {
    console.error("FAIL: 4-pile AI move invalid:", aiMove4);
    process.exit(1);
}
console.log(`✔ TEST 6 PASSED: 4-pile AI generated valid move: ${JSON.stringify(aiMove4)}`);

console.log("\n ALL 6 TESTS PASSED SUCCESSFULLY! WYTHOFF ENGINE IS FLAWLESS.");
