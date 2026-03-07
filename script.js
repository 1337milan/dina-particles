class ParticleText {
    constructor() {
        this.particles = [];
        this.container = document.getElementById('particles-container');
        this.overlay = document.getElementById('regeneration-overlay');
        this.resizeTimeout = null;
        this.basePoints = [];
        this.init();
    }

    init() {
        this.buildPoints();
        this.createParticles();
        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener('mousemove', this.handleInteraction.bind(this));
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleInteraction(e.touches[0]);
        }, { passive: false });
        this.animate();
    }

    buildPoints() {
        const W = 1000;
        const H = 300;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let fontSize = 220;
        ctx.font = `bold ${fontSize}px Georgia, "Times New Roman", serif`;
        let measured = ctx.measureText('Дина').width;
        while (measured > W * 0.92 && fontSize > 10) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px Georgia, "Times New Roman", serif`;
            measured = ctx.measureText('Дина').width;
        }

        ctx.fillText('Дина', W / 2, H / 2);

        const data = ctx.getImageData(0, 0, W, H).data;
        const raw = [];

        for (let y = 0; y < H; y += 2) {
            for (let x = 0; x < W; x += 2) {
                const idx = (y * W + x) * 4;
                if (data[idx + 3] > 128) {
                    raw.push({ x: x - W / 2, y: y - H / 2 });
                }
            }
        }

        this.basePoints = raw;
        this.canvasW = W;
        this.canvasH = H;
    }

    samplePoints(count) {
        const raw = this.basePoints;
        if (raw.length === 0) return [];
        const result = [];
        for (let i = 0; i < count; i++) {
            const p = raw[Math.floor(i / count * raw.length)];
            result.push({
                x: p.x + (Math.random() - 0.5) * 2,
                y: p.y + (Math.random() - 0.5) * 2
            });
        }
        return result;
    }

    createParticles() {
        const particleCount = 1200;
        const points = this.samplePoints(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            this.particles.push({
                element: particle,
                baseX: points[i].x,
                baseY: points[i].y,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0
            });

            this.container.appendChild(particle);
        }

        this.updatePositions(true);
    }

    getScale() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const scaleX = (vw * 0.90) / this.canvasW;
        const scaleY = (vh * 0.55) / this.canvasH;
        return Math.min(scaleX, scaleY);
    }

    updatePositions(immediate = false) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const scale = this.getScale();

        this.particles.forEach(particle => {
            const targetX = centerX + particle.baseX * scale;
            const targetY = centerY + particle.baseY * scale;

            if (immediate) {
                particle.x = targetX;
                particle.y = targetY;
            }

            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        });
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.updatePositions(true);
        }, 100);
    }

    handleInteraction(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const force = 5;
        const radius = 120;

        this.particles.forEach(particle => {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius && dist > 0) {
                const angle = Math.atan2(dy, dx);
                const strength = (1 - dist / radius) * force;
                particle.vx += Math.cos(angle) * strength;
                particle.vy += Math.sin(angle) * strength;
            }
        });
    }

    animate() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const scale = this.getScale();

        this.particles.forEach(particle => {
            const targetX = centerX + particle.baseX * scale;
            const targetY = centerY + particle.baseY * scale;

            const homeForceX = (targetX - particle.x) * 0.018;
            const homeForceY = (targetY - particle.y) * 0.018;

            particle.vx += homeForceX;
            particle.vy += homeForceY;

            particle.vx *= 0.82;
            particle.vy *= 0.82;

            particle.x += particle.vx;
            particle.y += particle.vy;

            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        });

        requestAnimationFrame(this.animate.bind(this));
    }
}

new ParticleText();
