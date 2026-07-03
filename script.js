const navbar    = document.getElementById('navbar');
const navBrand  = document.querySelector('.nav-brand');
const heroTitle = document.querySelector('.hero-logo');
const heroBg    = document.querySelector('.hero-bg');
const hero      = document.querySelector('.hero');

// ─── Cached layout measurements ─────────────────────────────────────────────
// getBoundingClientRect() forces a synchronous layout (expensive on every
// scroll tick). We read these values once and keep them up-to-date on resize.
let titleDocBottom = 0;   // hero-title bottom edge in document coordinates
let heroDocHeight  = 0;   // hero section height (parallax upper bound)
let rafId          = null; // pending rAF handle (prevents duplicate frames)

function cacheMeasurements() {
    if (heroTitle) titleDocBottom = heroTitle.getBoundingClientRect().bottom + window.scrollY;
    if (hero)      heroDocHeight  = hero.offsetHeight;
}

// ─── Single rAF-batched scroll handler ──────────────────────────────────────
function applyScrollState() {
    rafId = null;
    const scrollY = window.scrollY;

    // Navbar frosted-glass effect — only toggle on pages with a hero. On other
    // pages (om-meg, arbeid) the navbar stays solid so its height is constant.
    if (hero) {
        navbar.classList.toggle('scrolled', scrollY > 60);
    }

    // Show SWAY DESIGN logo once hero title has scrolled past navbar
    navBrand.classList.toggle('visible', (titleDocBottom - scrollY) < 72);

    // GPU-accelerated parallax — skip once hero is off-screen
    if (heroBg && scrollY < heroDocHeight) {
        heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
    }
}

function onScroll() {
    if (!rafId) rafId = requestAnimationFrame(applyScrollState);
}

window.addEventListener('DOMContentLoaded', cacheMeasurements);
window.addEventListener('resize', cacheMeasurements, { passive: true });
window.addEventListener('scroll', onScroll, { passive: true });

// ─── Mobile hamburger menu ──────────────────────────────────────────────────
const navToggle = document.querySelector('.nav-toggle');
if (navToggle && navbar) {
    const closeMenu = () => {
        navbar.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };
    navToggle.addEventListener('click', () => {
        const open = navbar.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close after picking a destination.
    navbar.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', closeMenu));
    // Close on Escape.
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

// ─── Programvare keys: click sound + press feedback ─────────────────────────
const swKeys = document.querySelectorAll('.sw-key');
if (swKeys.length) {
    const keySound = new Audio('Elementer/Knapp.mp3');
    keySound.preload = 'auto';
    swKeys.forEach(key => {
        key.addEventListener('click', () => {
            keySound.currentTime = 0;
            keySound.play().catch(() => {});
            // brief press so a quick tap/click still shows the key go down
            key.classList.add('pressed');
            setTimeout(() => key.classList.remove('pressed'), 110);
        });
    });
}

// ─── OM MEG portrait: subtle mouse-follow drift (desktop only) ──────────────
const omPortrait = document.querySelector('.om-portrait');
const canHoverDesktop = window.matchMedia('(min-width: 861px) and (hover: hover)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (omPortrait && canHoverDesktop && !reducedMotion) {
    const STRENGTH = 0.05;  // how strongly it follows the cursor
    const MAX = 14;         // px the image may drift in any direction
    const SCALE = 1.07;     // slight zoom gives overflow room so no edge gap shows
    const clamp = v => Math.max(-MAX, Math.min(MAX, v));

    omPortrait.style.transition = 'transform 0.35s ease-out';
    omPortrait.style.transform = `translate(0px, 0px) scale(${SCALE})`;

    let raf = null, tx = 0, ty = 0;
    window.addEventListener('mousemove', (e) => {
        tx = clamp((e.clientX - window.innerWidth / 2) * STRENGTH);
        ty = clamp((e.clientY - window.innerHeight / 2) * STRENGTH);
        if (!raf) raf = requestAnimationFrame(() => {
            raf = null;
            omPortrait.style.transform = `translate(${tx}px, ${ty}px) scale(${SCALE})`;
        });
    }, { passive: true });

    // recenter when the cursor leaves the window
    document.addEventListener('mouseleave', () => {
        omPortrait.style.transform = `translate(0px, 0px) scale(${SCALE})`;
    });
}

// ─── Scroll reveal (fade in upwards) ────────────────────────────────────────
// Elements get a .reveal class, then fade/slide in when they enter the
// viewport. Dynamically-added content (e.g. the Arbeid galleries) can be
// registered later via window.registerReveals().
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

// Default elements to animate across every page.
// (The footer is intentionally excluded — it should not fade in. The work
// folders are handled separately by revealWorkGrid() for a left→right cascade.)
const REVEAL_SELECTORS = [
    '.hero-content > *',
    '.display-heading',
    '.produkter-row',
    '.kontakt-card',
    '.arbeid-page-header',
    '.arbeid-section',
    '.poster-card',
    '.clothing-card',
    '.video-card',
    '.om-section',
    '.om-right'
];

function registerReveals(root = document) {
    // Stagger each element by its order *within its own parent*. For the Arbeid
    // image grids (which flow row-by-row) this produces a left→right, then
    // top→bottom cascade. Other groups (hero text, om-sections…) cascade too.
    const groupIndex = new Map();
    root.querySelectorAll(REVEAL_SELECTORS.join(',')).forEach((el) => {
        if (el.classList.contains('reveal')) return;
        el.classList.add('reveal');
        const parent = el.parentElement;
        const idx = groupIndex.get(parent) || 0;
        groupIndex.set(parent, idx + 1);
        el.style.transitionDelay = `${Math.min(idx, 8) * 70}ms`;
        revealObserver.observe(el);
    });
}
window.registerReveals = registerReveals;

// ─── Work folders: left→right cascade ───────────────────────────────────────
// The folder cards have their own hover transform, so once the entry animation
// finishes we strip the reveal styling entirely — leaving each card in its
// pristine state so hover stays crisp (no leftover transition-delay = no lag).
function revealWorkGrid() {
    const cards = document.querySelectorAll('.work-grid .work-card');
    cards.forEach((card, i) => {
        card.classList.add('reveal');
        card.style.transitionDelay = `${i * 120}ms`;

        card.addEventListener('transitionend', function cleanup(e) {
            // Only strip after the entry animation (when the card is visible),
            // not the initial fade-to-hidden that adding .reveal triggers.
            if (e.propertyName !== 'opacity' || !card.classList.contains('in-view')) return;
            card.classList.remove('reveal');
            card.style.transitionDelay = '';
            card.style.willChange = '';
            card.removeEventListener('transitionend', cleanup);
        });

        revealObserver.observe(card);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    registerReveals();
    revealWorkGrid();
});

// ─── Contact form ───────────────────────────────────────────────────────────
// Works with NO backend and NO sign-up: builds a pre-filled e-mail to Jonathan
// and opens the visitor's mail app. This works the moment the site is live (and
// already works locally). To send silently in the background instead — without
// opening a mail app — create a free form at formspree.io and swap this for a
// fetch() to that endpoint.
const CONTACT_EMAIL = 'jonathan.kindingstad@gmail.com';
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data    = new FormData(form);
    const name    = (data.get('name')    || '').toString().trim();
    const email   = (data.get('email')   || '').toString().trim();
    const company = (data.get('company') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    const subject = `Henvendelse fra ${name || 'nettsiden'}`;
    const body =
        `Navn: ${name}\n` +
        `E-post: ${email}\n` +
        `Bedrift: ${company}\n\n` +
        `${message}`;

    window.location.href =
        `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    submitBtn.textContent = 'Åpner e-post …';
    setTimeout(() => { submitBtn.textContent = 'Send'; }, 4000);
});
