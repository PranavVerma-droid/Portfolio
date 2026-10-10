/*
    Copyright (C) 2024  Pranav Verma
    Licensed under GNU AGPL v3

    Small behaviours shared by every page: a gentle rise-in for static
    content and a nav bar that turns solid once you scroll.
*/

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
})();
