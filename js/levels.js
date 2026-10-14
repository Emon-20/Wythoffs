/**
 * WYTHOFF'S GAME LEVEL CONFIGURATIONS
 * 5 progressive game levels featured in both Play with Computer and Play with Friend.
 */

const WYTHOFF_LEVELS = [
    {
        id: 1,
        title: "Level 1: The Classic Wythoff",
        badge: "Classic 2-Pile",
        piles: [12, 19],
        cap: Infinity,
        timeLimit: 0, // 0 = Untimed
        allowMulti: true, // Same amount from both piles
        maxPilesPerTake: 2,
        description: "The pure mathematical Wythoff's game. Take any number from one pile, or the exact same number from both piles. Last to take wins!",
        mathHint: "Watch the difference between piles: Cold positions follow (⌊nφ⌋, ⌊nφ²⌋).",
        icon: "⚖️"
    },
    {
        id: 2,
        title: "Level 2: The Golden Blitz",
        badge: "15s Timed Clock",
        piles: [15, 23],
        cap: Infinity,
        timeLimit: 15, // 15 seconds per move
        allowMulti: true,
        maxPilesPerTake: 2,
        description: "Classic 2-pile Wythoff under time pressure! You have only 15 seconds per turn. If the timer runs out, you forfeit the turn.",
        mathHint: "Calculate fast! Look for differences that match Beatty sequence cold pairs.",
        icon: "⚡"
    },
    {
        id: 3,
        title: "Level 3: Triad Matrix",
        badge: "3 Piles Expansion",
        piles: [8, 12, 16],
        cap: Infinity,
        timeLimit: 0,
        allowMulti: true,
        maxPilesPerTake: 3, // Can take same from any 2 or all 3 piles
        description: "Expanded to 3 piles! You may take any number from 1 pile, OR the same number from any 2 piles, OR the same number from all 3 piles!",
        mathHint: "Multi-pile equal reductions allow powerful diagonal shifts.",
        icon: "🔺"
    },
    {
        id: 4,
        title: "Level 4: The Crucible",
        badge: "Max 5 Removal Cap",
        piles: [17, 24],
        cap: 5, // Maximum 5 tokens per move
        timeLimit: 0,
        allowMulti: true,
        maxPilesPerTake: 2,
        description: "Bounded Wythoff! You can take at most 5 tokens per turn (whether from one pile or both). Massive sweeps are forbidden.",
        mathHint: "With a cap of 5, endgame control requires step-by-step arithmetic traps.",
        icon: "🛡️"
    },
    {
        id: 5,
        title: "Level 5: Quad Citadel",
        badge: "4 Piles + 20s Blitz",
        piles: [7, 11, 14, 18],
        cap: Infinity,
        timeLimit: 20, // 20 seconds per move
        allowMulti: true,
        maxPilesPerTake: 4,
        description: "The Grandmaster challenge! 4 piles with simultaneous multi-pile reductions and a 20-second turn timer. Only the sharpest minds triumph.",
        mathHint: "Balance reductions across all 4 fronts before the clock runs out.",
        icon: "👑"
    }
];

// Attach to window
window.WYTHOFF_LEVELS = WYTHOFF_LEVELS;
