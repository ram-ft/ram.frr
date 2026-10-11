// ===== BACKGROUND MUSIC PLAYER =====
(function () {
    const audio = document.getElementById('bg-music');
    const toggleBtn = document.getElementById('music-toggle');
    
    if (!audio || !toggleBtn) {
        console.error('Music player elements not found!');
        return;
    }

    console.log('Music player initialized');

    let isPlaying = false;

    // Set volume
    audio.volume = 0.3; // 30% volume

    // Function to start music
    function startMusic() {
        audio.play()
            .then(() => {
                console.log('Music started playing automatically');
                isPlaying = true;
                toggleBtn.classList.add('playing');
            })
            .catch(err => {
                console.log('Autoplay blocked, waiting for user interaction:', err);
                // Try again on first user interaction
                const retry = () => {
                    audio.play()
                        .then(() => {
                            isPlaying = true;
                            toggleBtn.classList.add('playing');
                            console.log('Music started after user interaction');
                        })
                        .catch(e => console.log('Still blocked:', e));
                    document.removeEventListener('click', retry);
                    document.removeEventListener('touchstart', retry);
                    document.removeEventListener('keydown', retry);
                };
                document.addEventListener('click', retry, { once: true });
                document.addEventListener('touchstart', retry, { once: true });
                document.addEventListener('keydown', retry, { once: true });
            });
    }

    // Try to start music immediately
    startMusic();

    // Also try after a short delay (helps with some browsers)
    setTimeout(startMusic, 100);

    // Toggle button handler
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            toggleBtn.classList.remove('playing');
            console.log('Music paused');
        } else {
            audio.play()
                .then(() => {
                    isPlaying = true;
                    toggleBtn.classList.add('playing');
                    console.log('Music playing');
                })
                .catch(err => {
                    console.error('Failed to play music:', err);
                });
        }
    });
})();

// ===== SCROLL PROGRESS BAR =====
(function () {
    console.log('Initializing scroll progress bar');
    
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '3px';
    progressBar.style.width = '0%';
    progressBar.style.background = 'linear-gradient(90deg, #1a1a18 0%, #5a5a54 100%)';
    progressBar.style.zIndex = '10001';
    progressBar.style.transition = 'width 0.1s ease-out';
    progressBar.style.boxShadow = '0 0 10px rgba(26,26,24,0.3)';
    
    document.body.prepend(progressBar);
    console.log('Progress bar element created');

    // Update progress on scroll
    function updateProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Calculate scroll percentage
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        progressBar.style.width = Math.min(scrollPercent, 100) + '%';
    }

    // Listen to scroll events
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('resize', updateProgress);
    
    // Initial update
    updateProgress();
    console.log('Progress bar initialized successfully');
})();


// ===== INSTAGRAM BANNER =====
(function () {
    const banner = document.getElementById('ig-banner');
    const backdrop = document.getElementById('ig-banner-backdrop');
    const ignoreBtn = document.getElementById('ig-banner-ignore');
    
    if (!banner || !backdrop || !ignoreBtn) {
        console.error('Instagram banner elements not found!');
        return;
    }

    console.log('Instagram banner initialized');

    const STORAGE_KEY = 'ig_banner_closed';

    // Check if user has already closed the banner
    const isClosed = localStorage.getItem(STORAGE_KEY);
    console.log('Banner closed status:', isClosed);
    
    if (isClosed === 'true') {
        console.log('Banner was previously closed. To see it again, run: localStorage.removeItem("ig_banner_closed")');
        banner.style.display = 'none';
        backdrop.style.display = 'none';
        return;
    }

    // Force display
    banner.style.display = 'block';
    backdrop.style.display = 'block';
    
    console.log('Banner will appear in 2 seconds...');

    // Show banner after a short delay
    setTimeout(() => {
        backdrop.classList.add('visible');
        banner.classList.add('visible');
        console.log('Banner is now visible!');
    }, 2000);

    // Function to close banner
    function closeBanner() {
        console.log('Closing banner');
        backdrop.classList.remove('visible');
        banner.classList.remove('visible');
        setTimeout(() => {
            banner.style.display = 'none';
            backdrop.style.display = 'none';
            localStorage.setItem(STORAGE_KEY, 'true');
            console.log('Banner closed and saved to localStorage');
        }, 600);
    }

    // Ignore button handler
    ignoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeBanner();
    });

    // Close on backdrop click
    backdrop.addEventListener('click', () => {
        closeBanner();
    });
})();

// ===== ANTIGRAVITY — CTA SECTION (ring orbit style) =====
(function () {
    const canvas = document.getElementById('cta-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Config matching the React component props
    const COUNT          = 300;
    const MAGNET_RADIUS  = 120;   // px — when particles start orbiting
    const RING_RADIUS    = 60;    // px — orbit ring size
    const WAVE_SPEED     = 0.4;
    const WAVE_AMP       = 1;
    const LERP_SPEED     = 0.1;
    const PARTICLE_SIZE  = 3.5;
    const PARTICLE_VAR   = 1;
    const PULSE_SPEED    = 3;
    const FIELD_STRENGTH = 10;
    const DEPTH_FACTOR   = 1;
    const ROTATION_SPEED = 0;
    const INK            = '26,26,24';

    let W, H, t = 0;
    const mouse    = { x: -9999, y: -9999 };
    const vMouse   = { x: 0, y: 0 };   // smoothed virtual mouse
    let lastMove   = 0;
    let autoMode   = false;

    function resize() {
        const r = canvas.parentElement.getBoundingClientRect();
        W = canvas.width  = Math.round(r.width);
        H = canvas.height = Math.round(r.height);
        // Re-scatter origins on resize
        if (particles.length) particles.forEach(p => p.init());
    }

    function Particle() { this.init(); }
    Particle.prototype.init = function () {
        this.mx    = Math.random() * (W || 800);
        this.my    = Math.random() * (H || 400);
        this.mz    = (Math.random() - 0.5) * 20;
        this.cx    = this.mx;
        this.cy    = this.my;
        this.cz    = this.mz;
        this.t     = Math.random() * 100;
        this.speed = 0.01 + Math.random() / 200;
        this.rOff  = (Math.random() - 0.5) * 2;
        this.size  = PARTICLE_SIZE * (0.5 + Math.random() * PARTICLE_VAR * 0.5);
    };

    Particle.prototype.update = function (targetX, targetY, globalRot) {
        this.t += this.speed / 2;
        const t = this.t;

        const dx   = this.mx - targetX;
        const dy   = this.my - targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let tx = this.mx, ty = this.my;

        if (dist < MAGNET_RADIUS) {
            const angle = Math.atan2(dy, dx) + globalRot;
            const wave  = Math.sin(t * WAVE_SPEED + angle) * (0.5 * WAVE_AMP);
            const dev   = this.rOff * (5 / (FIELD_STRENGTH + 0.1));
            const rr    = RING_RADIUS + wave + dev;
            tx = targetX + rr * Math.cos(angle);
            ty = targetY + rr * Math.sin(angle);
        }

        this.cx += (tx - this.cx) * LERP_SPEED;
        this.cy += (ty - this.cy) * LERP_SPEED;

        const curDist  = Math.sqrt((this.cx - targetX) ** 2 + (this.cy - targetY) ** 2);
        const fromRing = Math.abs(curDist - RING_RADIUS);
        const scale    = Math.max(0.3, Math.min(1, 1 - fromRing / 20));
        const pulse    = 0.8 + Math.sin(t * PULSE_SPEED) * 0.2;
        this.drawSize  = scale * pulse * this.size;
        this.angle     = Math.atan2(targetY - this.cy, targetX - this.cx) + Math.PI / 2;
    };

    Particle.prototype.draw = function () {
        const alpha = 0.55;
        ctx.fillStyle = `rgba(${INK},${alpha})`;
        const r   = this.drawSize * 0.5;
        const len = this.drawSize * 1.8;
        ctx.save();
        ctx.translate(this.cx, this.cy);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.arc(0, -len / 2, r, Math.PI, 0);
        ctx.arc(0,  len / 2, r, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    let particles = [];

    function init() {
        resize();
        particles = Array.from({ length: COUNT }, () => new Particle());
    }

    function loop() {
        t += 0.016;
        ctx.clearRect(0, 0, W, H);

        // Only animate when canvas is visible (mouse is over section)
        const isActive = canvas.classList.contains('active');

        let destX, destY;
        if (isActive) {
            destX = mouse.x;
            destY = mouse.y;
        } else {
            // Park particles off-screen when inactive
            destX = -9999;
            destY = -9999;
        }

        // Smooth virtual mouse
        vMouse.x += (destX - vMouse.x) * 0.05;
        vMouse.y += (destY - vMouse.y) * 0.05;

        const globalRot = t * ROTATION_SPEED;

        particles.forEach(p => {
            p.update(vMouse.x, vMouse.y, globalRot);
            p.draw();
        });

        requestAnimationFrame(loop);
    }

    const section = canvas.parentElement;
    section.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        lastMove = Date.now();
        canvas.classList.add('active');
    });
    section.addEventListener('mouseleave', () => {
        lastMove = 0;
        canvas.classList.remove('active');
    });

    window.addEventListener('resize', () => {
        resize();
        particles.forEach(p => p.init());
    });

    // Wait for layout to settle before init
    requestAnimationFrame(() => {
        init();
        loop();
    });
})();

// ===== LOGO LOOP =====
const logos = [
    {
        title: 'HTML5',
        href: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"/></svg>`
    },
    {
        title: 'CSS3',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"/></svg>`
    },
    {
        title: 'JavaScript',
        href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>`
    },
    {
        title: 'React',
        href: 'https://react.dev',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/></svg>`
    },
    {
        title: 'Next.js',
        href: 'https://nextjs.org',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"/></svg>`
    },
    {
        title: 'TypeScript',
        href: 'https://www.typescriptlang.org',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/></svg>`
    },
    {
        title: 'Vue.js',
        href: 'https://vuejs.org',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z"/></svg>`
    },
    {
        title: 'Tailwind',
        href: 'https://tailwindcss.com',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/></svg>`
    },
    {
        title: 'Sass',
        href: 'https://sass-lang.com',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.144 19.166s-.34.198-.126.28c.215.082.34.082.34.082s.126.082.126.082c-.126.082-.34.082-.34.082s-.215 0-.34-.082c-.126-.082-.126-.082-.126-.082s-.215-.082-.126-.28c.082-.198.34-.198.34-.198s.34 0 .252.116zm3.402-1.402c-.082.198-.34.198-.34.198s-.34 0-.34-.198c0-.198.34-.198.34-.198s.34 0 .34.198zm-6.804 0c-.082.198-.34.198-.34.198s-.34 0-.34-.198c0-.198.34-.198.34-.198s.34 0 .34.198zm3.402-1.402s-.34.198-.126.28c.215.082.34.082.34.082s.126.082.126.082c-.126.082-.34.082-.34.082s-.215 0-.34-.082c-.126-.082-.126-.082-.126-.082s-.215-.082-.126-.28c.082-.198.34-.198.34-.198s.34 0 .252.116z"/></svg>`
    },
    {
        title: 'Git',
        href: 'https://git-scm.com',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"/></svg>`
    },
    {
        title: 'Figma',
        href: 'https://figma.com',
        svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.098-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"/></svg>`
    }
];

const track = document.querySelector('.logoloop-track');

if (track) {
    const items = logos.map(logo => {
        const a = document.createElement('a');
        a.href = logo.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'logo-item';
        a.title = logo.title;
        a.innerHTML = `${logo.svg}<span>${logo.title}</span>`;
        return a;
    });

    // Append two sets for seamless loop
    items.forEach(el => track.appendChild(el.cloneNode(true)));
    items.forEach(el => track.appendChild(el.cloneNode(true)));
}

// Navbar — hide on scroll down, show on scroll up, solid when past hero
const nav = document.querySelector('.nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const current = window.scrollY;

    // Past hero — add solid background
    if (current > window.innerHeight - 80) {
        nav.style.backgroundColor = 'rgba(240, 237, 230, 0.92)';
        nav.style.backdropFilter = 'blur(12px)';
        nav.style.borderBottom = '1px solid var(--border)';
    } else {
        nav.style.backgroundColor = 'transparent';
        nav.style.backdropFilter = 'none';
        nav.style.borderBottom = 'none';
    }

    // Hide on scroll down, show on scroll up
    if (current > lastScroll && current > 80) {
        nav.style.transform = 'translateY(-100%)';
    } else {
        nav.style.transform = 'translateY(0)';
    }

    lastScroll = current <= 0 ? 0 : current;
});

// Scroll reveal — single unified observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.service, .wcard, .cta-inner, .services-head, .work-head, .footer').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================================
//  ANIMATION ADDITIONS
// ============================================================

// ===== 1. PAGE LOAD PROGRESS BAR =====
(function () {
    const bar = document.createElement('div');
    bar.id = 'page-progress-bar';
    document.body.prepend(bar);

    // Animate to ~80% quickly, then finish on load
    let width = 0;
    const step = () => {
        if (width < 80) {
            width += (80 - width) * 0.08 + 0.4;
            bar.style.width = width + '%';
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);

    window.addEventListener('load', () => {
        bar.style.width = '100%';
        setTimeout(() => bar.classList.add('done'), 600);
    });
})();

// ===== 2. CUSTOM CURSOR (desktop only) =====
(function () {
    // Only attach on devices that support hover (desktop)
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.innerWidth <= 1024) return;

    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(dot);

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let rafId = null;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.classList.add('visible');
    });

    document.addEventListener('mouseleave', () => {
        dot.classList.remove('visible');
    });

    // Lerp loop
    const LERP = 0.18;
    function tick() {
        dotX += (mouseX - dotX) * LERP;
        dotY += (mouseY - dotY) * LERP;
        dot.style.left = dotX + 'px';
        dot.style.top  = dotY + 'px';
        rafId = requestAnimationFrame(tick);
    }
    tick();

    // Grow on interactive elements
    const hoverTargets = 'a, button, [role="button"], .wcard, .service, .logo-item';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverTargets)) {
            dot.classList.add('hovering');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverTargets)) {
            dot.classList.remove('hovering');
        }
    });
})();

// ===== 3. HERO PAGE-LOAD STAGGER =====
(function () {
    // Elements to stagger: avatar-group, hero-sub, hero-btn
    // NOTE: hero-title is excluded here — it's handled by the word-split animation below.
    // We only need the container to be visible (not opacity-animated) so words show through.
    const heroLeft = document.querySelector('.hero-left');
    if (!heroLeft) return;

    const items = [
        heroLeft.querySelector('.avatar-group'),
        heroLeft.querySelector('.hero-sub'),
        heroLeft.querySelector('.hero-btn'),
    ].filter(Boolean);

    items.forEach(el => el.classList.add('hero-load-item'));

    const BASE_DELAY = 100; // ms between each item
    const START_DELAY = 120; // initial delay after page paint

    items.forEach((el, i) => {
        setTimeout(() => {
            el.classList.add('hero-visible');
        }, START_DELAY + i * BASE_DELAY);
    });
})();

// ===== 4. HERO TITLE WORD SPLIT =====
(function () {
    const title = document.querySelector('.hero-title');
    if (!title) return;

    // Walk text nodes and wrap each word in a span, preserving <br> and <em>
    function wrapWords(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (!text.trim()) return;
            const frag = document.createDocumentFragment();
            // Split on spaces but keep the space as a separate text node
            const parts = text.split(/(\s+)/);
            parts.forEach(part => {
                if (/^\s+$/.test(part)) {
                    frag.appendChild(document.createTextNode(part));
                } else if (part.length > 0) {
                    const span = document.createElement('span');
                    span.className = 'hero-word';
                    span.textContent = part;
                    frag.appendChild(span);
                }
            });
            node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'BR') {
            // Clone children list before iterating (DOM changes in place)
            Array.from(node.childNodes).forEach(wrapWords);
        }
    }

    wrapWords(title);

    const words = title.querySelectorAll('.hero-word');
    const WORD_BASE = 220;  // start after avatar stagger (120ms + ~100ms)
    const WORD_STEP = 55;   // ms per word

    words.forEach((w, i) => {
        setTimeout(() => {
            w.classList.add('word-visible');
        }, WORD_BASE + i * WORD_STEP);
    });
})();

// ===== 5. NUMBER COUNTER (was 6) =====
(function () {
    function parseCount(text) {
        const clean = text.trim();
        const match = clean.match(/^(\d+(?:\.\d+)?)(k|\+|%)?$/i);
        if (!match) return null;
        return {
            value: parseFloat(match[1]),
            suffix: match[2] || '',
            original: clean,
        };
    }

    function animateCount(el, target, suffix, duration) {
        const start = performance.now();
        const update = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    // Auto-detect stat numbers: look for elements with class .stat-number
    // or any element whose sole text content looks like a number
    const candidates = document.querySelectorAll('[data-count], .stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const raw = el.dataset.count || el.textContent;
            const parsed = parseCount(raw);
            if (!parsed) return;
            counterObserver.unobserve(el);
            animateCount(el, parsed.value, parsed.suffix, 1200);
        });
    }, { threshold: 0.5 });

    candidates.forEach(el => counterObserver.observe(el));
})();

// ============================================================
//  ANIMATION ADDITIONS
// ============================================================

// ===== 1. PAGE LOAD PROGRESS BAR =====
(function () {
    const bar = document.createElement('div');
    bar.id = 'page-progress-bar';
    document.body.prepend(bar);

    let width = 0;
    const step = () => {
        if (width < 80) {
            width += (80 - width) * 0.08 + 0.4;
            bar.style.width = width + '%';
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);

    window.addEventListener('load', () => {
        bar.style.width = '100%';
        setTimeout(() => bar.classList.add('done'), 600);
    });
})();

// ===== 2. CUSTOM CURSOR =====
(function () {
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.innerWidth <= 1024) return;

    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(dot);

    let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.classList.add('visible');
    });

    document.addEventListener('mouseleave', () => dot.classList.remove('visible'));

    const LERP = 0.18;
    (function tick() {
        dotX += (mouseX - dotX) * LERP;
        dotY += (mouseY - dotY) * LERP;
        dot.style.left = dotX + 'px';
        dot.style.top  = dotY + 'px';
        requestAnimationFrame(tick);
    })();

    const hoverTargets = 'a, button, [role="button"], .wcard, .service, .logo-item';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverTargets)) dot.classList.add('hovering');
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverTargets)) dot.classList.remove('hovering');
    });
})();

// ===== 3. HERO STAGGER =====
(function () {
    const heroLeft = document.querySelector('.hero-left');
    if (!heroLeft) return;

    const items = [
        heroLeft.querySelector('.avatar-group'),
        heroLeft.querySelector('.hero-sub'),
        heroLeft.querySelector('.hero-btn'),
    ].filter(Boolean);

    items.forEach(el => el.classList.add('hero-load-item'));
    items.forEach((el, i) => {
        setTimeout(() => el.classList.add('hero-visible'), 120 + i * 100);
    });
})();

// ===== 4. HERO TITLE WORD SPLIT =====
(function () {
    const title = document.querySelector('.hero-title');
    if (!title) return;

    function wrapWords(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (!text.trim()) return;
            const frag = document.createDocumentFragment();
            text.split(/(\s+)/).forEach(part => {
                if (/^\s+$/.test(part)) {
                    frag.appendChild(document.createTextNode(part));
                } else if (part.length > 0) {
                    const span = document.createElement('span');
                    span.className = 'hero-word';
                    span.textContent = part;
                    frag.appendChild(span);
                }
            });
            node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'BR') {
            Array.from(node.childNodes).forEach(wrapWords);
        }
    }

    wrapWords(title);

    title.querySelectorAll('.hero-word').forEach((w, i) => {
        setTimeout(() => w.classList.add('word-visible'), 220 + i * 55);
    });
})();

// ===== 6. NUMBER COUNTER =====
(function () {
    function parseCount(text) {
        const match = text.trim().match(/^(\d+(?:\.\d+)?)(k|\+|%)?$/i);
        if (!match) return null;
        return { value: parseFloat(match[1]), suffix: match[2] || '' };
    }

    function animateCount(el, target, suffix) {
        const start = performance.now();
        const update = (now) => {
            const p = Math.min((now - start) / 1200, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const parsed = parseCount(el.dataset.count || el.textContent);
            if (!parsed) return;
            obs.unobserve(el);
            animateCount(el, parsed.value, parsed.suffix);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count], .stat-number').forEach(el => obs.observe(el));
})();
