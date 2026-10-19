/**
 * WYTHOFF'S GAME MATHEMATICAL ENGINE
 * Willem Abraham Wythoff (1907)
 * Implements Beatty sequence mathematics and impartial combinatorial game evaluation.
 */

const PHI = (1 + Math.sqrt(5)) / 2; // Golden Ratio φ ≈ 1.618033988749895
const PHI_SQ = PHI + 1;             // φ² = φ + 1 ≈ 2.618033988749895

class WythoffEngine {
    constructor() {
        this.coldPairsCache = [];
        this.precomputeColdPairs(250);
    }

    /**
     * Precomputes cold pairs (P-positions) using the Beatty sequence:
     * a_n = floor(n * φ)
     * b_n = floor(n * φ²) = a_n + n
     */
    precomputeColdPairs(maxN = 250) {
        this.coldPairsCache = [];
        for (let n = 0; n <= maxN; n++) {
            const a = Math.floor(n * PHI);
            const b = a + n;
            this.coldPairsCache.push({ n, a, b });
        }
    }

    /**
     * Get cold pair for given index n
     */
    getColdPair(n) {
        if (n < this.coldPairsCache.length) {
            return this.coldPairsCache[n];
        }
        const a = Math.floor(n * PHI);
        return { n, a, b: a + n };
    }

    /**
     * Checks if a 2-pile position (x, y) is a Cold Position (P-position / losing to move from).
     */
    isCold2Piles(x, y) {
        const [a, b] = x <= y ? [x, y] : [y, x];
        const diff = b - a;
        const expectedA = Math.floor(diff * PHI);
        return a === expectedA;
    }

    /**
     * Solves the winning move for standard 2-pile Wythoff's game.
     * Returns null if the position is already cold (no winning move exists against optimal play).
     * Otherwise returns: { type: 'single' | 'both', piles: number[], amount: number }
     */
    findWinningMove2Piles(x, y, cap = Infinity) {
        const isSwapped = x > y;
        const [a, b] = isSwapped ? [y, x] : [x, y];
        const diff = b - a;

        // Check if already cold
        const coldA = Math.floor(diff * PHI);
        if (a === coldA) {
            return null; // Position is Cold!
        }

        const candidateMoves = [];

        // 1. Diagonal move: take same amount from BOTH piles
        // Difference remains diff. Target cold pair is (coldA, coldA + diff)
        if (a > coldA) {
            const take = a - coldA;
            if (take <= cap) {
                candidateMoves.push({
                    type: 'both',
                    amount: take,
                    piles: [0, 1]
                });
            }
        }

        // 2. Reduce larger pile (b) to b_k or a_k
        for (let k = 0; k <= a + 2; k++) {
            const pair = this.getColdPair(k);
            if (pair.a === a && b > pair.b) {
                const take = b - pair.b;
                if (take <= cap) {
                    candidateMoves.push({
                        type: 'single',
                        piles: [isSwapped ? 0 : 1],
                        amount: take
                    });
                }
            }
            if (pair.b === a && b > pair.a) {
                const take = b - pair.a;
                if (take <= cap) {
                    candidateMoves.push({
                        type: 'single',
                        piles: [isSwapped ? 0 : 1],
                        amount: take
                    });
                }
            }
        }

        // 3. Reduce smaller pile (a) to a_k where b_k = b
        for (let k = 0; k <= b + 2; k++) {
            const pair = this.getColdPair(k);
            if (pair.b === b && a > pair.a) {
                const take = a - pair.a;
                if (take <= cap) {
                    candidateMoves.push({
                        type: 'single',
                        piles: [isSwapped ? 1 : 0],
                        amount: take
                    });
                }
            }
        }

        if (candidateMoves.length > 0) {
            return candidateMoves[0];
        }

        return null;
    }

    /**
     * Checks if a move is valid given pile counts, rules, and optional cap.
     */
    isValidMove(piles, selectedPileIndices, amount, cap = Infinity) {
        if (!selectedPileIndices || selectedPileIndices.length === 0) return false;
        if (amount <= 0 || amount > cap) return false;

        for (const idx of selectedPileIndices) {
            if (idx < 0 || idx >= piles.length) return false;
            if (piles[idx] < amount) return false;
        }

        return true;
    }

    /**
     * Applies a move to the piles and returns new pile state.
     */
    applyMove(piles, selectedPileIndices, amount) {
        const next = [...piles];
        for (const idx of selectedPileIndices) {
            next[idx] -= amount;
        }
        return next;
    }

    /**
     * Checks if all piles are empty (game over).
     */
    isGameOver(piles) {
        return piles.every(p => p === 0);
    }

    /**
     * Generates all legal moves from current state.
     */
    getAllLegalMoves(piles, cap = Infinity, maxPilesToPick = piles.length) {
        const moves = [];
        const n = piles.length;

        // 1. Single pile moves
        for (let i = 0; i < n; i++) {
            const limit = Math.min(piles[i], cap);
            for (let amt = 1; amt <= limit; amt++) {
                moves.push({
                    piles: [i],
                    amount: amt,
                    type: 'single'
                });
            }
        }

        // 2. Multi-pile equal moves (subsets of size 2, 3, ... up to maxPilesToPick)
        const getSubsets = (arr, size) => {
            if (size === 1) return arr.map(x => [x]);
            const result = [];
            for (let i = 0; i <= arr.length - size; i++) {
                const head = arr[i];
                const tailSubsets = getSubsets(arr.slice(i + 1), size - 1);
                for (const sub of tailSubsets) {
                    result.push([head, ...sub]);
                }
            }
            return result;
        };

        const indices = piles.map((_, i) => i);
        for (let size = 2; size <= Math.min(n, maxPilesToPick); size++) {
            const subsets = getSubsets(indices, size);
            for (const sub of subsets) {
                const minTokens = Math.min(...sub.map(idx => piles[idx]));
                const limit = Math.min(minTokens, cap);
                for (let amt = 1; amt <= limit; amt++) {
                    moves.push({
                        piles: sub,
                        amount: amt,
                        type: size === n ? 'all' : 'multi'
                    });
                }
            }
        }

        return moves;
    }

    /**
     * Evaluates general multi-pile state using minimax with depth limit & memoization.
     */
    solveMultiPile(piles, cap = Infinity, maxDepth = 4) {
        const memo = new Map();
        const serialize = (p) => [...p].sort((a, b) => a - b).join(',');

        const isWinningState = (state, depth) => {
            if (state.every(x => x === 0)) return false;
            if (depth >= maxDepth) return false;
            const key = serialize(state);
            if (memo.has(key)) return memo.get(key);

            const legalMoves = this.getAllLegalMoves(state, cap);
            for (const m of legalMoves) {
                const nextState = this.applyMove(state, m.piles, m.amount);
                if (!isWinningState(nextState, depth + 1)) {
                    memo.set(key, true);
                    return true;
                }
            }

            memo.set(key, false);
            return false;
        };

        const legalMoves = this.getAllLegalMoves(piles, cap);
        for (const m of legalMoves) {
            const nextState = this.applyMove(piles, m.piles, m.amount);
            if (!isWinningState(nextState, 0)) {
                return m;
            }
        }

        return null;
    }

    /**
     * Selects an AI move based on difficulty: 'easy', 'medium', 'hard'.
     */
    getAIMove(piles, difficulty = 'hard', cap = Infinity) {
        const legalMoves = this.getAllLegalMoves(piles, cap);
        if (legalMoves.length === 0) return null;

        // 1-move win is directly available (take all remaining tokens)
        for (const m of legalMoves) {
            const next = this.applyMove(piles, m.piles, m.amount);
            if (this.isGameOver(next)) {
                return m;
            }
        }

        // Find optimal move
        let optimalMove = null;
        if (piles.length === 2 && cap === Infinity) {
            const winMove = this.findWinningMove2Piles(piles[0], piles[1], cap);
            if (winMove) {
                optimalMove = {
                    piles: winMove.piles,
                    amount: winMove.amount,
                    type: winMove.type
                };
            }
        } else {
            optimalMove = this.solveMultiPile(piles, cap);
        }

        // DIFFICULTY LOGIC
        if (difficulty === 'hard') {
            if (optimalMove) return optimalMove;
            return this.selectStallMove(piles, legalMoves);
        } else if (difficulty === 'medium') {
            if (optimalMove && Math.random() < 0.65) {
                return optimalMove;
            }
            return this.selectPlausibleMove(piles, legalMoves);
        } else {
            // Easy
            if (optimalMove && Math.random() < 0.25) {
                return optimalMove;
            }
            return legalMoves[Math.floor(Math.random() * legalMoves.length)];
        }
    }

    /**
     * Stalling move when AI is in a losing position
     */
    selectStallMove(piles, legalMoves) {
        let maxIdx = 0;
        let maxVal = piles[0];
        for (let i = 1; i < piles.length; i++) {
            if (piles[i] > maxVal) {
                maxVal = piles[i];
                maxIdx = i;
            }
        }
        const stall = legalMoves.find(m => m.piles.length === 1 && m.piles[0] === maxIdx && m.amount === 1);
        return stall || legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }

    /**
     * Human-like plausible move
     */
    selectPlausibleMove(piles, legalMoves) {
        const equalMove = legalMoves.find(m => m.piles.length > 1 && m.amount <= 3);
        if (equalMove && Math.random() < 0.5) return equalMove;
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];
    }
}

// Global instance
window.wythoffEngine = new WythoffEngine();
