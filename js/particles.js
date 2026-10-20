/**
 * CONFETTI & PARTICLES ENGINE
 * Lightweight canvas confetti simulator for victory celebrations.
 */

class ParticleEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animId = null;
        this.colors = ['#f59e0b', '#fbbf24', '#fef08a', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    }

    init() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'fx-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '9999';
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    launchConfetti(count = 120) {
        this.init();
        this.resize();

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: this.canvas.width * (0.2 + Math.random() * 0.6),
                y: this.canvas.height * 0.4 + (Math.random() * 80 - 40),
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() * -14) - 4,
                size: Math.random() * 8 + 4,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                gravity: 0.35,
                drag: 0.98,
                opacity: 1,
                decay: Math.random() * 0.008 + 0.006
            });
        }

        if (!this.animId) {
            this.loop();
        }
    }

    loop() {
        if (this.particles.length === 0) {
            if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.animId = null;
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.opacity);
            this.ctx.fillStyle = p.color;

            // Draw rectangle or circle
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            this.ctx.restore();
        }

        this.animId = requestAnimationFrame(() => this.loop());
    }

    clear() {
        this.particles = [];
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// Global instance
window.particleEngine = new ParticleEngine();
