/*
    Copyright (C) 2024  Pranav Verma
    Licensed under GNU AGPL v3

    The night sky shared by every page: a twinkling star field with the odd
    shooting star, a loader that always carries a fact, gentle rise-in for
    static content, and a nav bar that turns solid once you scroll.
*/

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- facts: shown on every loading state ---------- */
    const FACTS = [
        'There are 88 officially recognised constellations, covering the whole sky between them.',
        'The Big Dipper is not a constellation on its own. It is an asterism inside Ursa Major, the Great Bear.',
        'Polaris, the North Star, sits less than one degree from the north celestial pole, so it barely moves all night.',
        'Light from the Sun takes about eight minutes and twenty seconds to reach Earth.',
        'The International Space Station circles the Earth roughly every ninety minutes.',
        'Voyager 1, launched in 1977, is the most distant object humans have ever built.',
        'Placed where the Sun is, the red supergiant Betelgeuse would swallow the orbit of Mars.',
        'On a clear, dark night away from city lights, the naked eye can see a few thousand stars at once.',
        'Cassiopeia’s five bright stars make a W in the northern sky, opposite the Big Dipper across Polaris.',
        'A shooting star is usually a grain of dust no bigger than sand, burning up about 100 km above the ground.'
    ];

    function randomFact() {
        return FACTS[Math.floor(Math.random() * FACTS.length)];
    }

    document.querySelectorAll('[data-fact]').forEach(el => {
        el.textContent = randomFact();
    });

    /* ---------- loader: hides once the page is in, never longer than ~3 s ---------- */
    const loader = document.getElementById('loader');
    if (loader) {
        let hidden = false;
        const hide = () => {
            if (hidden) return;
            hidden = true;
            loader.classList.add('done');
            setTimeout(() => loader.remove(), 1000);
        };
        if (document.readyState === 'complete') {
            setTimeout(hide, 400);
        } else {
            window.addEventListener('load', () => setTimeout(hide, 400));
        }
        setTimeout(hide, 3000);
    }

    /* ---------- nav: solid once the page scrolls ---------- */
    document.querySelectorAll('[data-solid-nav]').forEach(el => {
        const update = () => el.classList.toggle('solid', window.scrollY > 40);
        update();
        window.addEventListener('scroll', update, { passive: true });
    });

    /* ---------- rise-in: content is visible at rest, it only drifts into place ---------- */
    const rises = document.querySelectorAll('.rise');
    if (!reduceMotion && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        rises.forEach(el => io.observe(el));
    } else {
        rises.forEach(el => el.classList.add('in'));
    }

    /* ---------- star field ---------- */
    const canvas = document.getElementById('sky');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const GOLD = '244,212,142';
    const ROSE = '242,169,162';
    const MOON = '244,237,225';
    let w = 0, h = 0, dpr = 1;
    let stars = [];
    let meteors = [];
    let nextMeteor = 0;
    let running = true;

    function makeStars() {
        const count = Math.min(420, Math.round((w * h) / 4200));
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.1 + 0.2,
            p: Math.random() * Math.PI * 2,
            s: 0.4 + Math.random() * 1.4,
            d: 0.02 + Math.random() * 0.08,
            c: Math.random() < 0.12 ? GOLD : Math.random() < 0.1 ? ROSE : MOON
        }));
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        makeStars();
        if (reduceMotion) draw(0);
    }

    function spawnMeteor(t) {
        const fromLeft = Math.random() < 0.5;
        meteors.push({
            x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
            y: Math.random() * h * 0.4,
            vx: (fromLeft ? 1 : -1) * (5 + Math.random() * 4),
            vy: 2 + Math.random() * 2,
            life: 0,
            max: 50 + Math.random() * 30
        });
        nextMeteor = t + 4000 + Math.random() * 7000;
    }

    function draw(t) {
        ctx.clearRect(0, 0, w, h);
        const scroll = window.scrollY || 0;

        for (const st of stars) {
            const twinkle = reduceMotion ? 0.8 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.001 * st.s + st.p));
            let y = (st.y - scroll * st.d) % h;
            if (y < 0) y += h;
            ctx.beginPath();
            ctx.arc(st.x, y, st.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${st.c},${twinkle})`;
            ctx.fill();
        }

        if (reduceMotion) return;

        if (t > nextMeteor) spawnMeteor(t);
        meteors = meteors.filter(m => m.life < m.max);
        for (const m of meteors) {
            m.life++;
            m.x += m.vx;
            m.y += m.vy;
            const fade = 1 - m.life / m.max;
            const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 14, m.y - m.vy * 14);
            grad.addColorStop(0, `rgba(${GOLD},${0.9 * fade})`);
            grad.addColorStop(1, `rgba(${GOLD},0)`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - m.vx * 14, m.y - m.vy * 14);
            ctx.stroke();
        }
    }

    function loop(t) {
        if (!running) return;
        draw(t);
        requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);

    if (!reduceMotion) {
        nextMeteor = 2500;
        requestAnimationFrame(loop);
        document.addEventListener('visibilitychange', () => {
            running = !document.hidden;
            if (running) requestAnimationFrame(loop);
        });
    } else {
        window.addEventListener('scroll', () => draw(0), { passive: true });
    }
})();
