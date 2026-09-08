(() => {
    'use strict';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* ---------------- Loader ---------------- */
    const loader = $('#loader');
    const loaderFill = $('#loaderFill');
    const loaderPct = $('#loaderPct');
    const loaderLog = $('#loaderLog');
    const bootLines = [
        '> mounting /dev/machine_learning ........ ok',
        '> spinning up langchain pipeline ........ ok',
        '> building semantic index (FAISS) ....... ok',
        '> loading portfolio modules ............. ok',
    ];

    let boot = 0;
    let pct = 0;
    document.body.style.overflow = 'hidden';

    const bootTimer = setInterval(() => {
        if (boot < bootLines.length) {
            loaderLog.textContent = bootLines[boot];
            boot++;
        }
        pct = Math.min(100, pct + Math.ceil(Math.random() * 7));
        loaderFill.style.width = pct + '%';
        loaderPct.textContent = pct + '%';
        if (pct >= 100) {
            clearInterval(bootTimer);
            setTimeout(finishLoad, 380);
        }
    }, 130);

    function finishLoad() {
        document.body.classList.add('loaded');
        loader.classList.add('done');
        document.body.style.overflow = '';
        setTimeout(initAnimations, 120);
    }

    function initAnimations() {
        scrambleTitle();
        typewriter.start();
    }

    let started = false;
    function startAfterLoad() {
        if (started) return;
        started = true;
    }

    /* ---------------- Theme ---------------- */
    const themeBtn = $('#themeBtn');
    const html = document.documentElement;

    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) html.setAttribute('data-theme', savedTheme);

    themeBtn.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('portfolio-theme', next);
        if (window.particles) window.particles.refreshColors();
    });

    /* ---------------- Clock ---------------- */
    const navClock = $('#navClock');
    function tickClock() {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        navClock.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    }
    setInterval(tickClock, 1000);
    tickClock();

    /* ---------------- Scroll UI ---------------- */
    const scrollProgress = $('#scrollProgress');
    const nav = $('#nav');
    const toTop = $('#toTop');
    const navLinks = $$('.nav-link');

    function onScroll() {
        const y = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
        nav.classList.toggle('scrolled', y > 40);
        toTop.classList.toggle('show', y > 600);

        let current = 'home';
        for (const link of navLinks) {
            const sec = $(link.getAttribute('href'));
            if (sec && sec.offsetTop <= y + 120) current = link.getAttribute('href').slice(1);
        }
        for (const link of navLinks) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ---------------- Mobile menu ---------------- */
    const burger = $('#burger');
    const mobileNav = $('#navLinks');

    burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        mobileNav.classList.toggle('open');
    });

    mobileNav.addEventListener('click', e => {
        if (e.target.closest('.nav-link')) {
            burger.classList.remove('open');
            mobileNav.classList.remove('open');
        }
    });

    /* ---------------- Custom cursor ---------------- */
    const cDot = $('#cDot');
    const cRing = $('#cRing');
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        const el = e.target.closest('a, button, [data-cursor], input, textarea');
        cRing.classList.toggle('link', !!el);
    });

    (function lerpCursor() {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        cDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        cRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
        requestAnimationFrame(lerpCursor);
    })();

    /* ---------------- Particle network canvas ---------------- */
    const canvas = $('#net');
    const ctx = canvas.getContext('2d');
    let nodes = [];
    let mouse = { x: -9999, y: -9999 };
    let DPR = Math.min(devicePixelRatio || 1, 2);

    function sizeCanvas() {
        canvas.width = innerWidth * DPR;
        canvas.height = innerHeight * DPR;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        const count = innerWidth < 768 ? 34 : 68;
        nodes = Array.from({ length: count }, () => ({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            r: Math.random() * 1.6 + 0.6,
        }));
    }

    function readColors() {
        const cs = getComputedStyle(document.documentElement);
        return { line: cs.getPropertyValue('--netline').trim(), dot: cs.getPropertyValue('--netdot').trim() };
    }

    let palette = readColors();
    window.particles = {
        refreshColors: () => { palette = readColors(); },
    };

    document.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    document.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    const LINK = 140;

    function drawNet() {
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > innerWidth) n.vx *= -1;
            if (n.y < 0 || n.y > innerHeight) n.vy *= -1;

            const dm = Math.hypot(n.x - mouse.x, n.y - mouse.y);
            if (dm < 150) {
                n.x += (mouse.x - n.x) * 0.03;
                n.y += (mouse.y - n.y) * 0.03;
            }
        }

        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j];
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < LINK) {
                    ctx.strokeStyle = palette.line;
                    ctx.globalAlpha = (1 - d / LINK) * 0.55;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }
        }

        for (const n of nodes) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = palette.dot;
            ctx.shadowBlur = 8;
            ctx.shadowColor = palette.line;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
        requestAnimationFrame(drawNet);
    }

    addEventListener('resize', () => { sizeCanvas(); });
    sizeCanvas();
    drawNet();

    /* ---------------- Hero title scramble ---------------- */
    const heroTitle = $('#heroTitle');
    const TARGET = heroTitle.textContent.trim();
    const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#01AI';

    function scrambleTitle() {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const chars = [...TARGET];
        let frame = 0;
        const total = 14;
        const iv = setInterval(() => {
            frame++;
            heroTitle.textContent = chars.map(ch => {
                if (ch === ' ') return ' ';
                return (Math.random() < (frame / total) * 1.2) ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }).join('');
            if (frame >= total) {
                clearInterval(iv);
                heroTitle.textContent = TARGET;
            }
        }, 46);
    }

    /* ---------------- Typewriter ---------------- */
    const roles = [
        'AI / ML Developer',
        'Full-Stack Developer',
    ];
    const typedEl = $('#typed');
    let ri = 0, ci = 0, deleting = false;

    const typewriter = {
        start() {
            tick();
        },
    };

    function tick() {
        const word = roles[ri];
        typedEl.textContent = word.slice(0, ci);
        if (!deleting) {
            ci++;
            if (ci > word.length) {
                deleting = true;
                setTimeout(tick, 1500);
                return;
            }
            setTimeout(tick, 66);
        } else {
            ci--;
            if (ci <= 0) {
                deleting = false;
                ri = (ri + 1) % roles.length;
                setTimeout(tick, 260);
                return;
            }
            setTimeout(tick, 32);
        }
    }

    /* ---------------- Mouse parallax for cube ---------------- */
    const stage = $('#cubeStage');
    let spx = 0, spy = 0, tpx = 0, tpy = 0;

    document.addEventListener('mousemove', e => {
        tpx = (e.clientX / innerWidth - 0.5) * 34;
        tpy = (e.clientY / innerHeight - 0.5) * 34;
    });

    function floatCube(t) {
        const f = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : Math.sin(t / 1000 * 1.1) * 16;
        spx += (tpx - spx) * 0.05;
        spy += (tpy - spy) * 0.05;
        if (stage) stage.style.transform = `translate3d(${spx}px, ${f + spy}px, 0)`;
        requestAnimationFrame(floatCube);
    }
    if (stage) requestAnimationFrame(floatCube);

    /* ---------------- Reveal on scroll ---------------- */
    const revealEls = $$('.reveal');
    const io = new IntersectionObserver(entries => {
        for (const en of entries) {
            if (en.isIntersecting) {
                en.target.classList.add('in');
                io.unobserve(en.target);
            }
        }
    }, { threshold: 0.16 });

    revealEls.forEach((el, i) => {
        el.style.transitionDelay = Math.min(i * 60, 360) + 'ms';
        io.observe(el);
    });

    const countersEls = $$('.counter .num');
    const countIO = new IntersectionObserver(entries => {
        for (const en of entries) {
            if (en.isIntersecting) {
                countIO.unobserve(en.target);
                animateCounter(en.target);
            }
        }
    }, { threshold: 0.5 });
    countersEls.forEach(el => countIO.observe(el));

    function animateCounter(el) {
        const goal = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        const dur = 1300;
        const t0 = performance.now();
        (function step(t) {
            const p = Math.min((t - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * goal) + suffix;
            if (p < 1) requestAnimationFrame(step);
        })(performance.now());
    }

    const barEls = $$('.bar');
    const barIO = new IntersectionObserver(entries => {
        for (const en of entries) {
            if (en.isIntersecting) {
                barIO.unobserve(en.target);
                const fill = en.target.querySelector('.bar-fill');
                if (fill) fill.style.width = en.target.dataset.progress + '%';
            }
        }
    }, { threshold: 0.4 });
    barEls.forEach(el => barIO.observe(el));

    /* ---------------- 3D tilt ---------------- */
    function addTilt(el, max = 9, lift = 0) {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateY(${-lift}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform .45s ease';
            el.style.transform = '';
            setTimeout(() => { el.style.transition = ''; }, 450);
        });
    }

    $$('.tilt3d').forEach(el => addTilt(el, 8, 0));

    /* ---------------- Projects ---------------- */
    const GH = 'https://github.com/Saisuhas07/';
    const projects = [
        { cat: 'ai-ml', sym: '◉', title: 'ScoutIQ', desc: 'Data-driven football recruitment and scouting intelligence platform with player valuation and similarity analysis.', tags: ['Data Science', 'Analytics', 'Scouting'], lang: 'Python', repo: 'ScoutIQ' },
        { cat: 'ai-ml', sym: '◉', title: 'Ocean Plastic Risk Intelligence System', desc: 'ML pipeline predicting ocean plastic accumulation from environmental, demographic and climate data — feature engineering backed by regression models.', tags: ['Python', 'Pandas', 'scikit-learn', 'Matplotlib'], lang: 'Python', repo: 'Ocean_Plastic_PredictionML' },
        { cat: 'web', sym: '▣', title: 'Eco-Footprint Tracker', desc: 'Full-stack web app tracking and visualizing environmental impact — responsive React frontend, interactive Chart.js dashboards and a Django backend.', tags: ['React', 'Django', 'SQLite', 'Chart.js'], lang: 'Python', repo: 'Eco-Footprint-Tracker' },
        { cat: 'ai-ml', sym: '◉', title: 'IT Ticketing Chatbot', desc: 'AI chatbot for IT support built with LangChain and OpenAI — FAISS semantic search over tickets, Pandas-driven Excel processing and automated resolution suggestions.', tags: ['LangChain', 'OpenAI', 'FAISS', 'Pandas', 'Streamlit'], lang: 'Python', repo: 'IT-Ticketing-Chatbot' },
    ];

    const catLabel = { 'ai-ml': 'AI & ML', web: 'Web Dev' };
    const grid = $('#projectGrid');
    const filters = $('#filters');

    grid.innerHTML = projects.map((p, i) => `
        <div class="p-card reveal" data-cat="${p.cat}">
            <div class="p-card-head">
                <span>${p.sym}</span>
                <span class="p-card-cat" data-cat="${p.cat}">${catLabel[p.cat]}</span>
            </div>
            <div class="p-card-body">
                <h3 class="p-card-title">${p.title}</h3>
                <p class="p-card-desc">${p.desc}</p>
                <div class="p-card-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
            </div>
            <div class="p-card-foot">
                <span class="p-card-lang">${p.lang}</span>
                <a class="p-link" href="${GH}${p.repo}" target="_blank" rel="noopener" data-cursor>GitHub
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg>
                </a>
            </div>
        </div>`).join('');

    grid.querySelectorAll('.p-card').forEach((el, i) => {
        el.style.transitionDelay = (i % 3) * 70 + 'ms';
        io.observe(el);
        addTilt(el, 6, 6);
    });

    filters.addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filters.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
        const f = btn.dataset.filter;
        grid.querySelectorAll('.p-card').forEach(card => {
            const show = f === 'all' || card.dataset.cat === f;
            card.classList.toggle('hide', !show);
        });
    });

    /* ---------------- Marquee ---------------- */
    const marqueeTrack = $('#marqueeTrack');
    const mk = ['Python', 'Django', 'Machine Learning', 'LangChain', 'FAISS', 'Pandas', 'NumPy', 'React', 'Data Science', 'Large Language Models', 'Java', 'C++', 'OpenCV', 'SQLite'];
    const phrase = mk.map(w => `<span>${w} <b>✦</b></span>`).join('');
    marqueeTrack.innerHTML = phrase + phrase;
    marqueeTrack.style.width = 'max-content';

    /* ---------------- Toast ---------------- */
    const toastWrap = $('#toastWrap');
    function toast(msg, type = '') {
        const t = document.createElement('div');
        t.className = 'toast ' + type;
        t.textContent = msg;
        toastWrap.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => t.remove(), 400);
        }, 3200);
    }

    /* ---------------- Footer year ---------------- */
    $('#year').textContent = new Date().getFullYear();
    startAfterLoad();
})();