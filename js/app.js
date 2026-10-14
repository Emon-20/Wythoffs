/**
 * WYTHOFF'S GAME - MASTER APPLICATION CONTROLLER
 * Orchestrates game state, player turns, AI execution, tactile UI, sound, and timers.
 */

class WythoffApp {
    constructor() {
        // Core State
        this.mode = 'pvc'; // 'pvc' or 'pvp'
        this.difficulty = 'medium'; // 'easy' | 'medium' | 'hard'
        this.levelIndex = 0; // 0 to 4 (Levels 1 to 5)
        this.piles = [];
        this.turn = 1; // 1 = P1, 2 = P2 / AI
        this.turnCount = 0;
        this.isAiThinking = false;
        this.gameOver = false;

        // Selection State: amount per pile index
        this.pileSelections = []; // array of numbers [takeFrom0, takeFrom1, ...]

        // Timer State
        this.timerInterval = null;
        this.timeRemaining = 0;

        // Persistent Stats
        this.stats = this.loadStats();

        // DOM Element Cache
        this.dom = {};
    }

    init() {
        this.cacheDom();
        this.bindEvents();
        this.renderLevelsCarousel();
        this.startLevel(0);
        this.updateStatsUi();
        this.updateSoundUi();
    }

    cacheDom() {
        this.dom = {
            // Header
            btnSound: document.getElementById('btn-sound-toggle'),
            btnStats: document.getElementById('btn-stats'),
            btnHowToPlay: document.getElementById('btn-how-to-play'),

            // Modes & AI
            tabPvc: document.getElementById('tab-pvc'),
            tabPvp: document.getElementById('tab-pvp'),
            aiDiffContainer: document.getElementById('ai-difficulty-container'),
            diffBtns: document.querySelectorAll('.diff-btn'),

            // Level Carousel & Info
            levelCarousel: document.getElementById('level-carousel'),
            levelRuleBadge: document.getElementById('level-rule-badge'),
            levelCapBadge: document.getElementById('level-cap-badge'),
            levelTimerBadge: document.getElementById('level-timer-badge'),
            levelDesc: document.getElementById('level-description-text'),

            // HUD
            p1Card: document.getElementById('player1-card'),
            p2Card: document.getElementById('player2-card'),
            p1Name: document.getElementById('p1-name'),
            p2Name: document.getElementById('p2-name'),
            p1Role: document.getElementById('p1-role'),
            p2Role: document.getElementById('p2-role'),
            p1Score: document.getElementById('p1-score'),
            p2Score: document.getElementById('p2-score'),
            p2AvatarIcon: document.getElementById('p2-avatar-icon'),

            // Turn Status & Timer
            turnAnnouncement: document.getElementById('turn-announcement'),
            turnText: document.getElementById('turn-text'),
            timerWrapper: document.getElementById('turn-timer-wrapper'),
            timerBarFill: document.getElementById('timer-bar-fill'),
            timerCountdownText: document.getElementById('timer-countdown-text'),
            radarPill: document.getElementById('strategic-radar-pill'),
            radarLabel: document.getElementById('radar-label'),

            // Piles Board & Action Tray
            pilesBoard: document.getElementById('piles-board'),
            selectionDetail: document.getElementById('selection-detail'),
            btnClearSelection: document.getElementById('btn-clear-selection'),
            btnEqualAll: document.getElementById('btn-equal-all'),
            btnConfirmMove: document.getElementById('btn-confirm-move'),

            // History
            historyStream: document.getElementById('history-stream'),
            btnNewRound: document.getElementById('btn-new-round'),

            // Game Over Modal
            modalGameOver: document.getElementById('modal-gameover'),
            gameoverCard: document.getElementById('gameover-card'),
            gameoverBadge: document.getElementById('gameover-badge'),
            gameoverEmoji: document.getElementById('gameover-emoji'),
            gameoverTitle: document.getElementById('gameover-title'),
            gameoverSubtitle: document.getElementById('gameover-subtitle'),
            gameoverTurns: document.getElementById('gameover-turns'),
            gameoverMove: document.getElementById('gameover-move'),
            gameoverStreak: document.getElementById('gameover-streak'),
            btnRematch: document.getElementById('btn-rematch'),
            btnNextLevel: document.getElementById('btn-next-level'),

            // Rules & Stats Modals
            modalRules: document.getElementById('modal-rules'),
            btnCloseRules: document.getElementById('btn-close-rules'),
            btnUnderstood: document.getElementById('btn-understood'),
            modalStats: document.getElementById('modal-stats'),
            btnCloseStats: document.getElementById('btn-close-stats'),
            btnCloseStatsBtn: document.getElementById('btn-close-stats-btn'),
            btnResetStats: document.getElementById('btn-reset-stats'),

            // Stats values
            statEasy: document.getElementById('stat-easy'),
            statMedium: document.getElementById('stat-medium'),
            statHard: document.getElementById('stat-hard'),
            statP1: document.getElementById('stat-p1'),
            statP2: document.getElementById('stat-p2'),
            levelStarsGrid: document.getElementById('level-stars-grid')
        };
    }

    bindEvents() {
        // Sound toggle
        this.dom.btnSound.addEventListener('click', () => {
            const isMuted = window.soundEngine.toggleMute();
            this.updateSoundUi();
            if (!isMuted) window.soundEngine.playClick();
        });

        // Mode Navigation
        this.dom.tabPvc.addEventListener('click', () => this.setMode('pvc'));
        this.dom.tabPvp.addEventListener('click', () => this.setMode('pvp'));

        // AI Difficulty
        this.dom.diffBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const diff = btn.getAttribute('data-difficulty');
                this.setDifficulty(diff);
            });
        });

        // Modals triggers
        this.dom.btnHowToPlay.addEventListener('click', () => this.openRulesModal());
        this.dom.btnCloseRules.addEventListener('click', () => this.closeRulesModal());
        this.dom.btnUnderstood.addEventListener('click', () => this.closeRulesModal());

        this.dom.btnStats.addEventListener('click', () => this.openStatsModal());
        this.dom.btnCloseStats.addEventListener('click', () => this.closeStatsModal());
        this.dom.btnCloseStatsBtn.addEventListener('click', () => this.closeStatsModal());
        this.dom.btnResetStats.addEventListener('click', () => this.resetStats());

        // Game Over controls
        this.dom.btnRematch.addEventListener('click', () => {
            this.closeGameOverModal();
            this.startLevel(this.levelIndex);
        });
        this.dom.btnNextLevel.addEventListener('click', () => {
            this.closeGameOverModal();
            const nextLvl = (this.levelIndex + 1) % window.WYTHOFF_LEVELS.length;
            this.startLevel(nextLvl);
        });

        // In-game Action buttons
        this.dom.btnClearSelection.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.clearSelection();
        });
        this.dom.btnEqualAll.addEventListener('click', () => {
            this.syncSelectedPiles();
        });
        this.dom.btnConfirmMove.addEventListener('click', () => {
            this.executePlayerMove();
        });
        this.dom.btnNewRound.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.startLevel(this.levelIndex);
        });

        // Global Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeRulesModal();
                this.closeStatsModal();
            } else if (e.key === 'Enter' && !this.dom.btnConfirmMove.disabled) {
                this.executePlayerMove();
            }
        });
    }

    updateSoundUi() {
        const isMuted = window.soundEngine.isMuted();
        this.dom.btnSound.innerHTML = isMuted ? '🔇' : '🔊';
        this.dom.btnSound.classList.toggle('muted', isMuted);
    }

    setMode(newMode) {
        if (this.mode === newMode) return;
        window.soundEngine.playClick();
        this.mode = newMode;

        this.dom.tabPvc.classList.toggle('active', newMode === 'pvc');
        this.dom.tabPvc.setAttribute('aria-selected', newMode === 'pvc');
        this.dom.tabPvp.classList.toggle('active', newMode === 'pvp');
        this.dom.tabPvp.setAttribute('aria-selected', newMode === 'pvp');

        this.dom.aiDiffContainer.style.display = newMode === 'pvc' ? 'flex' : 'none';

        this.startLevel(this.levelIndex);
    }

    setDifficulty(diff) {
        if (this.difficulty === diff) return;
        window.soundEngine.playClick();
        this.difficulty = diff;

        this.dom.diffBtns.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-difficulty') === diff);
        });

        this.startLevel(this.levelIndex);
    }

    getCurrentLevel() {
        return window.WYTHOFF_LEVELS[this.levelIndex] || window.WYTHOFF_LEVELS[0];
    }

    renderLevelsCarousel() {
        const levels = window.WYTHOFF_LEVELS;
        this.dom.levelCarousel.innerHTML = '';

        levels.forEach((lvl, idx) => {
            const card = document.createElement('div');
            card.className = `level-card ${idx === this.levelIndex ? 'active' : ''}`;
            card.setAttribute('data-level-index', idx);

            const isCleared = !!this.stats.levelStars[lvl.id];

            card.innerHTML = `
                <div class="level-card-top">
                    <span class="level-num-pill">LVL ${lvl.id}</span>
                    <span class="level-status-star ${isCleared ? 'cleared' : ''}">★</span>
                </div>
                <div class="level-title">${lvl.title.replace(`Level ${lvl.id}: `, '')}</div>
                <div class="level-tag">${lvl.badge}</div>
            `;

            card.addEventListener('click', () => {
                if (this.levelIndex === idx) return;
                window.soundEngine.playClick();
                this.startLevel(idx);
            });

            this.dom.levelCarousel.appendChild(card);
        });
    }

    updateLevelCardsActive() {
        const cards = this.dom.levelCarousel.querySelectorAll('.level-card');
        cards.forEach((card, idx) => {
            card.classList.toggle('active', idx === this.levelIndex);
            const isCleared = !!this.stats.levelStars[window.WYTHOFF_LEVELS[idx].id];
            const star = card.querySelector('.level-status-star');
            if (star) star.classList.toggle('cleared', isCleared);
        });
    }

    startLevel(index) {
        this.stopTimer();
        this.levelIndex = index;
        const lvl = this.getCurrentLevel();

        // Clone starting piles
        this.piles = [...lvl.piles];
        this.pileSelections = new Array(this.piles.length).fill(0);
        this.turn = 1;
        this.turnCount = 0;
        this.isAiThinking = false;
        this.gameOver = false;

        this.updateLevelCardsActive();
        this.updateLevelBanner(lvl);
        this.updatePlayerHudNames();
        this.renderPilesBoard();
        this.updateSelectionUi();
        this.updateTurnUi();
        this.updateRadarUi();
        this.clearHistory();

        this.closeGameOverModal();

        // Start turn timer if level has timer
        if (lvl.timeLimit > 0) {
            this.startTurnTimer(lvl.timeLimit);
        }
    }

    updateLevelBanner(lvl) {
        this.dom.levelRuleBadge.textContent = lvl.badge;
        this.dom.levelDesc.textContent = lvl.description;

        if (lvl.cap !== Infinity) {
            this.dom.levelCapBadge.style.display = 'inline-block';
            this.dom.levelCapBadge.textContent = `Cap: Max ${lvl.cap} Tokens`;
        } else {
            this.dom.levelCapBadge.style.display = 'none';
        }

        if (lvl.timeLimit > 0) {
            this.dom.levelTimerBadge.style.display = 'inline-block';
            this.dom.levelTimerBadge.textContent = `⏱ ${lvl.timeLimit}s Clock`;
            this.dom.timerWrapper.style.display = 'flex';
        } else {
            this.dom.levelTimerBadge.style.display = 'none';
            this.dom.timerWrapper.style.display = 'none';
        }
    }

    updatePlayerHudNames() {
        if (this.mode === 'pvc') {
            this.dom.p1Name.textContent = 'You';
            this.dom.p1Role.textContent = 'Player 1';
            const diffCapital = this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1);
            this.dom.p2Name.textContent = `Computer (${diffCapital})`;
            this.dom.p2Role.textContent = 'AI Opponent';
            this.dom.p2AvatarIcon.textContent = '🤖';

            const record = this.stats.pvc[this.difficulty] || { w: 0, l: 0 };
            this.dom.p1Score.textContent = `${record.w} Wins`;
            this.dom.p2Score.textContent = `${record.l} Wins`;
        } else {
            this.dom.p1Name.textContent = 'Player 1';
            this.dom.p1Role.textContent = 'Cyan';
            this.dom.p2Name.textContent = 'Player 2';
            this.dom.p2Role.textContent = 'Purple';
            this.dom.p2AvatarIcon.textContent = '👥';

            this.dom.p1Score.textContent = `${this.stats.pvp.p1} Wins`;
            this.dom.p2Score.textContent = `${this.stats.pvp.p2} Wins`;
        }
    }

    renderPilesBoard() {
        const lvl = this.getCurrentLevel();
        const cap = lvl.cap;
        this.dom.pilesBoard.innerHTML = '';

        this.piles.forEach((count, pileIdx) => {
            const card = document.createElement('div');
            card.className = 'pile-card';
            card.id = `pile-card-${pileIdx}`;

            const isSelected = this.pileSelections[pileIdx] > 0;
            if (isSelected) card.classList.add('selected-for-take');

            // Header
            const header = document.createElement('div');
            header.className = 'pile-header';
            header.innerHTML = `
                <div class="pile-title-group">
                    <span class="pile-name">Pile ${pileIdx + 1}</span>
                    <span class="pile-count-badge" id="pile-count-${pileIdx}">${count} tokens</span>
                </div>
            `;

            // Tokens arena
            const tokensArena = document.createElement('div');
            tokensArena.className = 'tokens-arena-container';
            const tokensGrid = document.createElement('div');
            tokensGrid.className = 'tokens-grid';
            tokensGrid.id = `tokens-grid-${pileIdx}`;

            // Render 3D tokens
            this.renderTokenChips(tokensGrid, pileIdx, count);
            tokensArena.appendChild(tokensGrid);

            // Pile Controls
            const controls = document.createElement('div');
            controls.className = 'pile-controls';

            const currentTake = this.pileSelections[pileIdx] || 0;
            const maxTake = Math.min(count, cap);

            controls.innerHTML = `
                <div class="stepper-row">
                    <button class="stepper-btn" data-action="dec" data-pile="${pileIdx}" ${currentTake <= 0 ? 'disabled' : ''}>−</button>
                    <div class="take-input-display" id="take-display-${pileIdx}">
                        ${currentTake > 0 ? `Take ${currentTake}` : '0 selected'}
                    </div>
                    <button class="stepper-btn" data-action="inc" data-pile="${pileIdx}" ${currentTake >= maxTake ? 'disabled' : ''}>+</button>
                </div>
                <div class="quick-take-presets">
                    <button class="preset-btn ${currentTake === 1 ? 'active' : ''}" data-pile="${pileIdx}" data-amount="1" ${count < 1 ? 'disabled' : ''}>1</button>
                    <button class="preset-btn ${currentTake === 2 ? 'active' : ''}" data-pile="${pileIdx}" data-amount="2" ${count < 2 || 2 > cap ? 'disabled' : ''}>2</button>
                    <button class="preset-btn ${currentTake === 5 ? 'active' : ''}" data-pile="${pileIdx}" data-amount="5" ${count < 5 || 5 > cap ? 'disabled' : ''}>5</button>
                    <button class="preset-btn ${currentTake === maxTake && maxTake > 0 ? 'active' : ''}" data-pile="${pileIdx}" data-amount="${maxTake}" ${count === 0 ? 'disabled' : ''}>All</button>
                </div>
            `;

            // Bind Steppers and Presets
            controls.querySelectorAll('.stepper-btn').forEach(b => {
                b.addEventListener('click', (e) => {
                    const action = b.getAttribute('data-action');
                    const pIdx = parseInt(b.getAttribute('data-pile'));
                    this.modifyPileSelection(pIdx, action === 'inc' ? 1 : -1);
                });
            });

            controls.querySelectorAll('.preset-btn').forEach(b => {
                b.addEventListener('click', () => {
                    const pIdx = parseInt(b.getAttribute('data-pile'));
                    const amt = parseInt(b.getAttribute('data-amount'));
                    this.setPileSelection(pIdx, amt);
                });
            });

            card.appendChild(header);
            card.appendChild(tokensArena);
            card.appendChild(controls);

            this.dom.pilesBoard.appendChild(card);
        });
    }

    renderTokenChips(container, pileIdx, count) {
        container.innerHTML = '';
        const currentTake = this.pileSelections[pileIdx] || 0;

        for (let i = 1; i <= count; i++) {
            const chip = document.createElement('div');
            chip.className = 'token-chip';
            chip.textContent = i;
            chip.setAttribute('data-token-index', i);

            // Chips chosen to be removed are highlighted
            if (i > count - currentTake) {
                chip.classList.add('selected-to-take');
            }

            // Clicking a chip selects all chips from it to the top
            chip.addEventListener('click', () => {
                if (this.isAiThinking || this.gameOver) return;
                const tokensToTake = count - i + 1;
                const cap = this.getCurrentLevel().cap;
                if (tokensToTake <= cap) {
                    this.setPileSelection(pileIdx, tokensToTake);
                } else {
                    this.setPileSelection(pileIdx, cap);
                }
            });

            container.appendChild(chip);
        }
    }

    modifyPileSelection(pileIdx, delta) {
        if (this.isAiThinking || this.gameOver) return;
        const current = this.pileSelections[pileIdx] || 0;
        const count = this.piles[pileIdx];
        const cap = this.getCurrentLevel().cap;
        const maxTake = Math.min(count, cap);

        const next = Math.max(0, Math.min(maxTake, current + delta));
        this.setPileSelection(pileIdx, next);
    }

    setPileSelection(pileIdx, amount) {
        if (this.isAiThinking || this.gameOver) return;
        window.soundEngine.playClick();
        this.pileSelections[pileIdx] = amount;
        this.updateSelectionUi();
    }

    clearSelection() {
        this.pileSelections = new Array(this.piles.length).fill(0);
        this.updateSelectionUi();
    }

    syncSelectedPiles() {
        // Find non-zero selections
        const activeIndices = [];
        this.pileSelections.forEach((amt, idx) => {
            if (amt > 0) activeIndices.push(idx);
        });

        if (activeIndices.length < 2) {
            // Pick all piles with at least 1 token
            const eligible = [];
            this.piles.forEach((p, i) => { if (p > 0) eligible.push(i); });
            if (eligible.length >= 2) {
                const minTokens = Math.min(...eligible.map(i => this.piles[i]));
                const target = Math.min(1, minTokens, this.getCurrentLevel().cap);
                eligible.forEach(i => { this.pileSelections[i] = target; });
            }
        } else {
            // Sync all active to the minimum selected
            const minSelected = Math.min(...activeIndices.map(i => this.pileSelections[i]));
            activeIndices.forEach(i => { this.pileSelections[i] = minSelected; });
        }

        window.soundEngine.playClick();
        this.updateSelectionUi();
    }

    updateSelectionUi() {
        const lvl = this.getCurrentLevel();
        const cap = lvl.cap;

        // Check active piles in selection
        const activePiles = [];
        this.pileSelections.forEach((amt, idx) => {
            if (amt > 0) activePiles.push({ idx, amt });
        });

        // Update each pile card display
        this.piles.forEach((count, idx) => {
            const card = document.getElementById(`pile-card-${idx}`);
            const takeDisplay = document.getElementById(`take-display-${idx}`);
            const grid = document.getElementById(`tokens-grid-${idx}`);
            const currentTake = this.pileSelections[idx] || 0;
            const maxTake = Math.min(count, cap);

            if (card) {
                card.classList.toggle('selected-for-take', currentTake > 0);
            }
            if (takeDisplay) {
                takeDisplay.textContent = currentTake > 0 ? `Take ${currentTake}` : '0 selected';
            }

            // Update chips class
            if (grid) {
                const chips = grid.querySelectorAll('.token-chip');
                chips.forEach(chip => {
                    const tokenNum = parseInt(chip.getAttribute('data-token-index'));
                    chip.classList.toggle('selected-to-take', tokenNum > count - currentTake);
                });
            }

            // Update stepper buttons
            if (card) {
                const decBtn = card.querySelector('.stepper-btn[data-action="dec"]');
                const incBtn = card.querySelector('.stepper-btn[data-action="inc"]');
                if (decBtn) decBtn.disabled = currentTake <= 0;
                if (incBtn) incBtn.disabled = currentTake >= maxTake;

                const presetBtns = card.querySelectorAll('.preset-btn');
                presetBtns.forEach(pb => {
                    const pAmt = parseInt(pb.getAttribute('data-amount'));
                    pb.classList.toggle('active', pAmt === currentTake && currentTake > 0);
                });
            }
        });

        // Validate move
        const isValid = this.isCurrentSelectionValid(activePiles, lvl);

        // Update Summary Text & Confirm button
        if (activePiles.length === 0) {
            this.dom.selectionDetail.textContent = 'Select tokens or steppers on any pile';
            this.dom.btnConfirmMove.disabled = true;
        } else if (!isValid.valid) {
            this.dom.selectionDetail.textContent = `Invalid: ${isValid.reason}`;
            this.dom.btnConfirmMove.disabled = true;
        } else {
            if (activePiles.length === 1) {
                this.dom.selectionDetail.textContent = `Take ${activePiles[0].amt} token(s) from Pile ${activePiles[0].idx + 1}`;
            } else {
                const pileNames = activePiles.map(p => `Pile ${p.idx + 1}`).join(' & ');
                this.dom.selectionDetail.textContent = `Take ${activePiles[0].amt} token(s) from ${pileNames}`;
            }
            this.dom.btnConfirmMove.disabled = false || this.isAiThinking || this.gameOver;
        }
    }

    isCurrentSelectionValid(activePiles, lvl) {
        if (activePiles.length === 0) return { valid: false, reason: 'No tokens selected' };

        const takeAmt = activePiles[0].amt;

        // Check cap
        if (takeAmt > lvl.cap) {
            return { valid: false, reason: `Exceeds max removal limit of ${lvl.cap}` };
        }

        // Single pile take: always valid as long as amt <= pile size
        if (activePiles.length === 1) {
            if (takeAmt <= 0 || takeAmt > this.piles[activePiles[0].idx]) {
                return { valid: false, reason: 'Invalid token amount' };
            }
            return { valid: true };
        }

        // Multi-pile take
        if (activePiles.length > lvl.maxPilesPerTake) {
            return { valid: false, reason: `Max ${lvl.maxPilesPerTake} piles can be taken simultaneously` };
        }

        // Rule: All selected piles must have the EXACT SAME amount
        const allEqual = activePiles.every(p => p.amt === takeAmt);
        if (!allEqual) {
            return { valid: false, reason: 'Must remove identical amounts from multi-piles' };
        }

        // Check if all piles have sufficient tokens
        for (const p of activePiles) {
            if (p.amt > this.piles[p.idx]) {
                return { valid: false, reason: `Not enough tokens in Pile ${p.idx + 1}` };
            }
        }

        return { valid: true };
    }

    executePlayerMove() {
        if (this.isAiThinking || this.gameOver) return;

        const activePiles = [];
        this.pileSelections.forEach((amt, idx) => {
            if (amt > 0) activePiles.push({ idx, amt });
        });

        const lvl = this.getCurrentLevel();
        const validCheck = this.isCurrentSelectionValid(activePiles, lvl);
        if (!validCheck.valid) return;

        const selectedIndices = activePiles.map(p => p.idx);
        const amount = activePiles[0].amt;

        // Apply Move
        this.applyMoveAndAdvanceTurn(selectedIndices, amount, this.turn === 1 ? 'Player 1' : 'Player 2');
    }

    applyMoveAndAdvanceTurn(selectedIndices, amount, playerName) {
        this.stopTimer();
        window.soundEngine.playTokenTake(amount);

        // Update piles
        this.piles = window.wythoffEngine.applyMove(this.piles, selectedIndices, amount);
        this.turnCount++;

        // Log move
        const pileNames = selectedIndices.map(i => `Pile ${i + 1}`).join(' & ');
        const stateStr = `[${this.piles.join(', ')}]`;
        this.addHistoryEntry(this.turn, `${playerName} took ${amount} from ${pileNames}`, stateStr);

        // Clear player selection
        this.clearSelection();
        this.renderPilesBoard();
        this.updateRadarUi();

        // Check Game Over
        if (window.wythoffEngine.isGameOver(this.piles)) {
            this.handleGameOver(this.turn, `${playerName} took the final token!`);
            return;
        }

        // Switch turn
        this.turn = this.turn === 1 ? 2 : 1;
        this.updateTurnUi();

        // Restart timer if timed
        const lvl = this.getCurrentLevel();
        if (lvl.timeLimit > 0) {
            this.startTurnTimer(lvl.timeLimit);
        }

        // If PvC and Computer turn, trigger AI move
        if (this.mode === 'pvc' && this.turn === 2) {
            this.triggerAiTurn();
        }
    }

    triggerAiTurn() {
        this.isAiThinking = true;
        this.dom.btnConfirmMove.disabled = true;
        this.dom.turnAnnouncement.classList.add('ai-calculating');
        this.dom.turnText.textContent = 'AI is calculating...';

        // Add human-like calculation delay (700ms - 1300ms)
        const delay = 800 + Math.random() * 500;

        setTimeout(() => {
            if (this.gameOver) return;

            const lvl = this.getCurrentLevel();
            const aiMove = window.wythoffEngine.getAIMove(this.piles, this.difficulty, lvl.cap);

            this.isAiThinking = false;
            this.dom.turnAnnouncement.classList.remove('ai-calculating');

            if (aiMove) {
                this.applyMoveAndAdvanceTurn(aiMove.piles, aiMove.amount, `Computer (${this.difficulty})`);
            } else {
                // Stalling fallback: take 1 token from first non-empty pile
                const fallbackIdx = this.piles.findIndex(p => p > 0);
                if (fallbackIdx !== -1) {
                    this.applyMoveAndAdvanceTurn([fallbackIdx], 1, 'Computer');
                }
            }
        }, delay);
    }

    updateTurnUi() {
        if (this.turn === 1) {
            this.dom.p1Card.classList.add('active');
            this.dom.p2Card.classList.remove('active');
            this.dom.turnText.textContent = this.mode === 'pvc' ? 'Your Turn' : 'Player 1 Turn';
            this.dom.turnAnnouncement.className = 'turn-announcement p1-turn';
        } else {
            this.dom.p1Card.classList.remove('active');
            this.dom.p2Card.classList.add('active');
            this.dom.turnText.textContent = this.mode === 'pvc' ? 'Computer Turn' : 'Player 2 Turn';
            this.dom.turnAnnouncement.className = 'turn-announcement p2-turn';
        }
    }

    updateRadarUi() {
        // Cold / Hot radar evaluation (for 2 piles)
        if (this.piles.length === 2) {
            const isCold = window.wythoffEngine.isCold2Piles(this.piles[0], this.piles[1]);
            this.dom.radarPill.style.display = 'inline-flex';
            if (isCold) {
                this.dom.radarPill.className = 'strategic-radar-pill cold';
                this.dom.radarLabel.textContent = 'Cold Trap ❄️ (Beatty P-Position)';
                window.soundEngine.playColdFound();
            } else {
                this.dom.radarPill.className = 'strategic-radar-pill hot';
                this.dom.radarLabel.textContent = 'Hot Zone ⚡ (Winning Move Exists)';
            }
        } else {
            this.dom.radarPill.className = 'strategic-radar-pill';
            this.dom.radarLabel.textContent = `${this.piles.length} Piles In Play`;
        }
    }

    startTurnTimer(seconds) {
        this.stopTimer();
        this.timeRemaining = seconds;
        this.updateTimerUi(seconds, seconds);

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerUi(this.timeRemaining, seconds);

            if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
                window.soundEngine.playTick(true);
            }

            if (this.timeRemaining <= 0) {
                this.handleTimeExpired();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerUi(remaining, total) {
        const pct = Math.max(0, (remaining / total) * 100);
        this.dom.timerBarFill.style.width = `${pct}%`;
        this.dom.timerCountdownText.textContent = `${remaining}s`;

        const isUrgent = remaining <= 5;
        this.dom.timerBarFill.classList.toggle('urgent', isUrgent);
        this.dom.timerCountdownText.classList.toggle('urgent', isUrgent);
    }

    handleTimeExpired() {
        this.stopTimer();
        window.soundEngine.playTimeUp();

        const currentTurnName = this.turn === 1 ? 'Player 1' : (this.mode === 'pvc' ? 'Computer' : 'Player 2');
        this.addHistoryEntry(this.turn, `⏱ Time expired for ${currentTurnName}! Turn forfeited with 1 token penalty.`, '');

        // Auto-take 1 token penalty from largest pile
        let maxIdx = 0;
        let maxVal = this.piles[0];
        for (let i = 1; i < this.piles.length; i++) {
            if (this.piles[i] > maxVal) {
                maxVal = this.piles[i];
                maxIdx = i;
            }
        }

        if (maxVal > 0) {
            this.piles[maxIdx] -= 1;
            this.renderPilesBoard();
            if (window.wythoffEngine.isGameOver(this.piles)) {
                // If taking the penalty took the last token, the current player wins
                this.handleGameOver(this.turn, `${currentTurnName} took the last token on penalty!`);
                return;
            }
        }

        // Switch turn
        this.turn = this.turn === 1 ? 2 : 1;
        this.updateTurnUi();

        const lvl = this.getCurrentLevel();
        if (lvl.timeLimit > 0) {
            this.startTurnTimer(lvl.timeLimit);
        }

        if (this.mode === 'pvc' && this.turn === 2) {
            this.triggerAiTurn();
        }
    }

    handleGameOver(winnerTurn, winningMoveText) {
        this.gameOver = true;
        this.stopTimer();

        const isPlayer1Winner = winnerTurn === 1;
        const lvl = this.getCurrentLevel();

        // Update statistics
        if (this.mode === 'pvc') {
            const diffRecord = this.stats.pvc[this.difficulty];
            if (isPlayer1Winner) {
                diffRecord.w++;
                this.stats.currentStreak++;
                if (this.stats.currentStreak > this.stats.bestStreak) {
                    this.stats.bestStreak = this.stats.currentStreak;
                }
                // Award level star
                this.stats.levelStars[lvl.id] = true;
            } else {
                diffRecord.l++;
                this.stats.currentStreak = 0;
            }
        } else {
            if (isPlayer1Winner) {
                this.stats.pvp.p1++;
            } else {
                this.stats.pvp.p2++;
            }
            this.stats.levelStars[lvl.id] = true;
        }

        this.saveStats();
        this.updatePlayerHudNames();
        this.updateStatsUi();
        this.updateLevelCardsActive();

        // Show celebration or defeat
        if (this.mode === 'pvc') {
            if (isPlayer1Winner) {
                window.soundEngine.playWin();
                window.particleEngine.launchConfetti(140);
                this.dom.gameoverCard.className = 'modal-card victory-card';
                this.dom.gameoverBadge.textContent = 'CHAMPION';
                this.dom.gameoverEmoji.textContent = '👑';
                this.dom.gameoverTitle.textContent = 'VICTORY!';
                this.dom.gameoverSubtitle.textContent = `You outsmarted the ${this.difficulty.toUpperCase()} AI and claimed the final token!`;
            } else {
                window.soundEngine.playLose();
                this.dom.gameoverCard.className = 'modal-card victory-card defeat';
                this.dom.gameoverBadge.textContent = 'DEFEATED';
                this.dom.gameoverEmoji.textContent = '💀';
                this.dom.gameoverTitle.textContent = 'DEFEAT!';
                this.dom.gameoverSubtitle.textContent = `The AI found the Beatty cold sequence trap! Study the math and try again.`;
            }
        } else {
            // PvP
            window.soundEngine.playWin();
            window.particleEngine.launchConfetti(120);
            this.dom.gameoverCard.className = 'modal-card victory-card';
            this.dom.gameoverBadge.textContent = 'MATCH WON';
            this.dom.gameoverEmoji.textContent = isPlayer1Winner ? '💎' : '🔮';
            this.dom.gameoverTitle.textContent = isPlayer1Winner ? 'PLAYER 1 WINS!' : 'PLAYER 2 WINS!';
            this.dom.gameoverSubtitle.textContent = winningMoveText;
        }

        this.dom.gameoverTurns.textContent = this.turnCount;
        this.dom.gameoverMove.textContent = winningMoveText.slice(0, 24);
        this.dom.gameoverStreak.textContent = `🔥 ${this.stats.currentStreak}`;

        // Next level button display
        const hasNextLevel = this.levelIndex < window.WYTHOFF_LEVELS.length - 1;
        this.dom.btnNextLevel.style.display = hasNextLevel ? 'inline-flex' : 'none';

        // Open modal with slight delay for dramatic impact
        setTimeout(() => {
            this.dom.modalGameOver.style.display = 'flex';
        }, 400);
    }

    closeGameOverModal() {
        this.dom.modalGameOver.style.display = 'none';
        window.particleEngine.clear();
    }

    openRulesModal() {
        window.soundEngine.playClick();
        this.dom.modalRules.style.display = 'flex';
    }

    closeRulesModal() {
        this.dom.modalRules.style.display = 'none';
    }

    openStatsModal() {
        window.soundEngine.playClick();
        this.updateStatsUi();
        this.dom.modalStats.style.display = 'flex';
    }

    closeStatsModal() {
        this.dom.modalStats.style.display = 'none';
    }

    addHistoryEntry(turn, text, stateStr) {
        const item = document.createElement('div');
        item.className = `history-entry ${turn === 1 ? 'p1' : 'p2'}`;
        item.innerHTML = `
            <span class="history-text"><strong>#${this.turnCount}</strong> ${text}</span>
            <span class="history-state">${stateStr}</span>
        `;

        // Clear initial placeholder
        const empty = this.dom.historyStream.querySelector('.history-empty');
        if (empty) empty.remove();

        this.dom.historyStream.prepend(item);
    }

    clearHistory() {
        this.dom.historyStream.innerHTML = '<div class="history-empty">Game started. Make your first move!</div>';
    }

    loadStats() {
        const defaultStats = {
            pvc: {
                easy: { w: 0, l: 0 },
                medium: { w: 0, l: 0 },
                hard: { w: 0, l: 0 }
            },
            pvp: { p1: 0, p2: 0 },
            currentStreak: 0,
            bestStreak: 0,
            levelStars: {}
        };
        try {
            const raw = localStorage.getItem('wythoff_game_stats');
            return raw ? JSON.parse(raw) : defaultStats;
        } catch (e) {
            return defaultStats;
        }
    }

    saveStats() {
        try {
            localStorage.setItem('wythoff_game_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Failed to save stats', e);
        }
    }

    resetStats() {
        if (!confirm('Are you sure you want to reset all game statistics and stars?')) return;
        localStorage.removeItem('wythoff_game_stats');
        this.stats = this.loadStats();
        this.updatePlayerHudNames();
        this.updateStatsUi();
        this.updateLevelCardsActive();
        window.soundEngine.playClick();
    }

    updateStatsUi() {
        this.dom.statEasy.textContent = `${this.stats.pvc.easy.w}W - ${this.stats.pvc.easy.l}L`;
        this.dom.statMedium.textContent = `${this.stats.pvc.medium.w}W - ${this.stats.pvc.medium.l}L`;
        this.dom.statHard.textContent = `${this.stats.pvc.hard.w}W - ${this.stats.pvc.hard.l}L`;
        this.dom.statP1.textContent = `${this.stats.pvp.p1} Wins`;
        this.dom.statP2.textContent = `${this.stats.pvp.p2} Wins`;

        // Render level stars
        this.dom.levelStarsGrid.innerHTML = '';
        window.WYTHOFF_LEVELS.forEach(lvl => {
            const isCleared = !!this.stats.levelStars[lvl.id];
            const cell = document.createElement('div');
            cell.className = `level-star-cell ${isCleared ? 'cleared' : ''}`;
            cell.innerHTML = `
                <span class="cell-lvl">LVL ${lvl.id}</span>
                <span class="cell-star">${isCleared ? '★' : '☆'}</span>
            `;
            this.dom.levelStarsGrid.appendChild(cell);
        });
    }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.wythoffApp = new WythoffApp();
    window.wythoffApp.init();
});
