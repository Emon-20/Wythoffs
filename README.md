# Wythoff's Game (The Golden Ratio Nim)

A modern, responsive web implementation of **Wythoff's Game**—a classic two-player impartial mathematical game introduced by Dutch mathematician Willem Abraham Wythoff in 1907.

The game features an optimal mathematical AI engine driven by the **Golden Ratio ($\phi$)** and **Beatty Sequences**, supporting both classic 2-pile play and advanced multi-pile variants.

---

## 🎯 Game Overview & Core Rules

The game is played with two piles of tokens (represented as numbers or counters). Players take turns removing tokens according to two simple rules:

1. **Single-Pile Move:** Remove any positive number of tokens from **one** pile.
2. **Double-Pile Move:** Remove the **exact same number** of tokens from **both** piles simultaneously.

### Victory Condition
* **Normal Play Convention:** The player who takes the last remaining token(s)—leaving the board at `(0, 0)`—**wins the game**.
* The player left with no legal moves on their turn loses.

---

## 🧠 Game Logic: Hot vs. Cold Positions

Wythoff's game belongs to combinatorial game theory and is solved completely by classifying every game state into one of two categories:

### 1. Cold Positions (P-Positions / Losing to Move From)
* A position where the player whose turn it is **will lose** if the opponent plays optimally.
* **Key Property:** *Any* legal move from a cold position leads to a **hot position**.
* The terminal state `(0, 0)` is the ultimate Cold Position.

### 2. Hot Positions (N-Positions / Winning to Move From)
* A position from which the active player **can force a win**.
* **Key Property:** There is *always at least one* legal move that transitions the board into a **cold position**, handing a losing state to the opponent.

---

## 🏆 How to Win (The Optimal Strategy)

To win Wythoff's game, follow one fundamental principle:

> **Always end your turn by leaving the board in a Cold Position.**

When you leave a Cold Position for your opponent:
1. Every move they make is guaranteed to produce a Hot Position.
2. On your subsequent turn, you can always move the game back to a smaller Cold Position.
3. Repeating this sequence inexorably forces the board down to `(0, 0)`, securing your victory.

### Quick Cold Positions Reference Table

Cold pairs $(a_n, b_n)$ with difference $n = b_n - a_n$:

| $n$ | $a_n = \lfloor n \cdot \phi \rfloor$ | $b_n = a_n + n$ | Cold Pair $(x, y)$ | Notes |
|:---:|:---:|:---:|:---:|:---|
| **0** | 0 | 0 | **(0, 0)** | **Winning State** (Goal) |
| **1** | 1 | 2 | **(1, 2)** | Trap state (opponent cannot escape) |
| **2** | 3 | 5 | **(3, 5)** | |
| **3** | 4 | 7 | **(4, 7)** | |
| **4** | 6 | 10 | **(6, 10)** | |
| **5** | 8 | 13 | **(8, 13)** | |
| **6** | 9 | 15 | **(9, 15)** | |
| **7** | 11 | 18 | **(11, 18)** | |
| **8** | 12 | 20 | **(12, 20)** | |

### Winning Move Execution Example
Suppose the current state is **(5, 9)**:
* Difference: $9 - 5 = 4$. The target cold pair with difference 4 is **(6, 10)**.
* Check smaller cold pairs: notice that **(3, 5)** has $a_2 = 3$ and $b_2 = 5$.
* Because one pile already has 5 tokens, you can simply remove 6 tokens from the pile of 9 to leave **(5, 3)** (equivalent to **(3, 5)**).
* Your opponent is now trapped in a Cold Position.

---

## ⚠️ How You Lose

You will lose Wythoff's game if:

1. **You begin your turn on a Cold Position against an optimal player:**
   * If your opponent knows the cold pairs (or when playing against the **Hard AI / Oracle**), any move you make converts the board into a hot state, which the AI will instantly exploit by putting you back in a lower cold pair.
2. **You make an inaccurate move from a Hot Position:**
   * If you fail to land on a Cold Pair, you leave another Hot Position on the board, giving your opponent the chance to seize control.
3. **Time Runs Out (Blitz Modes):**
   * In timed levels (such as Level 2 and Level 5), letting the turn timer expire forfeits your turn or results in a loss.

---

## 📐 The Mathematics Behind the Game

In 1907, Willem Wythoff proved that all cold pairs $(a_n, b_n)$ can be generated directly using the **Golden Ratio**:

$$\phi = \frac{1 + \sqrt{5}}{2} \approx 1.6180339887...$$

For any non-negative integer $n \ge 0$:

$$a_n = \lfloor n \cdot \phi \rfloor$$
$$b_n = \lfloor n \cdot \phi^2 \rfloor = a_n + n$$

### Properties:
* **Beatty's Theorem (Rayleigh Theorem):** Every positive integer appears exactly once in either sequence $a_n$ or sequence $b_n$. There are no gaps and no overlaps.
* **Instant Evaluation:** Given any pile configuration $(x, y)$ with $x \le y$, calculate the difference $d = y - x$. If $x = \lfloor d \cdot \phi \rfloor$, the state is **Cold**. Otherwise, it is **Hot**.

---

## ♛ The Chess Queen Analogy

Wythoff's game has an intuitive spatial representation:
* Imagine a single **Chess Queen** placed on square $(x, y)$ of a large grid (where $(0, 0)$ is the bottom-left corner).
* Valid moves:
  * Moving **West** (left) decreases Pile 1.
  * Moving **South** (down) decreases Pile 2.
  * Moving **Southwest** (diagonal) decreases both piles equally.
* **Objective:** Be the player to move the Queen into the corner square `(0, 0)`.

---

## 🎮 Game Modes & Progression

This application includes both single-player and multiplayer capabilities:

* **Game Modes:**
  * **Play with Computer (PvC):** Easy (casual play), Medium (balanced), and Hard / Oracle (plays optimal Beatty mathematics).
  * **Play with Friend (PvP):** Local pass-and-play on the same device.
* **5 Progressive Levels:**
  1. **Level 1: The Classic Wythoff** — Standard 2-pile unconstrained game `(12, 19)`.
  2. **Level 2: The Golden Blitz** — Classic 2-pile game with a 15-second move timer `(15, 23)`.
  3. **Level 3: Triad Matrix** — 3-pile expansion `(8, 12, 16)` allowing single, pair, or triple equal reductions.
  4. **Level 4: The Crucible** — Bounded Wythoff `(17, 24)` with a maximum removal cap of 5 tokens per turn.
  5. **Level 5: Quad Citadel** — 4-pile grandmaster challenge `(7, 11, 14, 18)` with a 20-second turn timer.

---

## 🚀 Getting Started

### Play in the Browser
No build tools or external dependencies are required. Simply open `index.html` in any modern web browser:

```bash
# Option 1: Direct file open (double-click index.html or launch via CLI)
start index.html

# Option 2: Run a local static server
npx serve .
# or
python -m http.server 8000
```

### Run Engine Unit Tests
To verify the mathematical accuracy of the Beatty sequence generator and game-tree solver:

```bash
node test_wythoff.js
```
All unit tests should pass with zero errors.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
