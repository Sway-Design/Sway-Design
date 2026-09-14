const navbar    = document.getElementById('navbar');
const navBrand  = document.querySelector('.nav-brand');
const heroTitle = document.querySelector('.hero-logo');
const hero      = document.querySelector('.hero');

// ─── Cached layout measurements ─────────────────────────────────────────────
// getBoundingClientRect() forces a synchronous layout (expensive on every
// scroll tick). We read these values once and keep them up-to-date on resize.
let titleDocBottom = 0;   // hero-title bottom edge in document coordinates
let rafId          = null; // pending rAF handle (prevents duplicate frames)

function cacheMeasurements() {
    if (heroTitle) titleDocBottom = heroTitle.getBoundingClientRect().bottom + window.scrollY;
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
}

function onScroll() {
    if (!rafId) rafId = requestAnimationFrame(applyScrollState);
}

window.addEventListener('DOMContentLoaded', cacheMeasurements);
window.addEventListener('resize', cacheMeasurements, { passive: true });
window.addEventListener('scroll', onScroll, { passive: true });

// ─── Hero animated gradient (WebGL shader) ──────────────────────────────────
// Flowing warm-embers gradient: cream → orange → red-orange → maroon → near-black.
const heroCanvas = document.getElementById('heroGradient');
if (heroCanvas) {
    const gl = heroCanvas.getContext('webgl') || heroCanvas.getContext('experimental-webgl');
    if (gl) {
        const vsSource = `
            attribute vec2 a_pos;
            void main() {
                gl_Position = vec4(a_pos, 0.0, 1.0);
            }
        `;
        const fsSource = `
            precision highp float;
            uniform vec2 u_resolution;
            uniform float u_time;
            // Areas behind text (canvas pixels: x0, y0, x1, y1) that must stay dark.
            uniform vec4 u_rect0;
            uniform vec4 u_rect1;
            uniform vec4 u_rect2;

            vec3 palette(float t) {
                vec3 c0 = vec3(1.0000, 0.9765, 0.7686); // #fff9c4
                vec3 c1 = vec3(1.0000, 0.6510, 0.2000); // #ffa633
                vec3 c2 = vec3(1.0000, 0.2353, 0.0000); // #ff3c00
                vec3 c3 = vec3(0.2627, 0.0000, 0.0000); // #430000
                vec3 c4 = vec3(0.0235, 0.0000, 0.0000); // #060000
                t = clamp(t, 0.0, 1.0);
                if (t < 0.25) return mix(c0, c1, smoothstep(0.0, 1.0, t / 0.25));
                if (t < 0.50) return mix(c1, c2, smoothstep(0.0, 1.0, (t - 0.25) / 0.25));
                if (t < 0.75) return mix(c2, c3, smoothstep(0.0, 1.0, (t - 0.50) / 0.25));
                return mix(c3, c4, smoothstep(0.0, 1.0, (t - 0.75) / 0.25));
            }

            float hash(vec2 p) {
                p = fract(p * vec2(123.34, 456.21));
                p += dot(p, p + 45.32);
                return fract(p.x * p.y);
            }

            float valueNoise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            float fbm(vec2 p) {
                float value = 0.0;
                float amp = 0.5;
                for (int i = 0; i < 2; i++) {
                    value += amp * valueNoise(p);
                    p *= 2.0;
                    amp *= 0.5;
                }
                return value;
            }

            // 1.0 inside an ellipse that fully contains the rectangle, fading to 0.0
            // over feather pixels. The shape is pushed around by up to bend pixels so
            // its edge flows, and the ellipse is sized so the rectangle itself always
            // stays covered no matter how it's pushed.
            float textMask(vec4 r, vec2 px, vec2 offset, float bend, float feather) {
                if (r.z <= r.x) return 0.0;
                vec2 axes = ((r.zw - r.xy) * 0.5 + bend) * 1.4143;
                vec2 q = (px + offset * bend - (r.xy + r.zw) * 0.5) / axes;
                float dist = (length(q) - 1.0) * min(axes.x, axes.y);
                return 1.0 - smoothstep(0.0, feather, dist);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
                p *= 2.4; // zoom in so noise cells don't span the whole canvas

                // Warp field — bends the stripe axis into flowing curves.
                vec2 flow = vec2(
                    valueNoise(p + u_time * 0.055),
                    valueNoise(p - u_time * 0.05 + 4.2)
                );
                vec2 warped = p + flow * 1.6;

                // A broader noise layer used both to wobble the stripe axis and
                // to blend in some turbulence, so the bands aren't perfectly regular.
                float n = fbm(warped * 0.7 + u_time * 0.02);

                // Directional "stripe" wave (diagonal sine), phase-shifted by the
                // noise — this is what gives the flowing-ribbon look rather than a
                // blobby noise texture.
                float axis  = warped.x * 0.8 + warped.y * 0.5 + (n - 0.5) * 2.4;
                float band  = sin(axis * 1.8) * 0.5 + 0.5;

                float t = mix(band, n, 0.3);
                // Gentle contrast stretch: enough for all 5 colors to show, low
                // enough that the bands blend smoothly into each other.
                t = clamp((t - 0.5) * 1.6 + 0.5, 0.0, 1.0);

                // Keep the wallpaper dark behind the hero text and nav. Each dark area
                // is a soft blob bent by the same flow field as the stripes, so it
                // blends into the motion instead of reading as a box.
                vec2 px = gl_FragCoord.xy;
                float m = min(u_resolution.x, u_resolution.y);
                vec2 offset = (flow - 0.5) * 2.0;
                float mask = max(textMask(u_rect0, px, offset, m * 0.10, m * 0.28),
                             max(textMask(u_rect1, px, offset, m * 0.03, m * 0.16),
                                 textMask(u_rect2, px, offset, m * 0.03, m * 0.16)));
                t = mix(t, max(t, 0.85), mask);

                gl_FragColor = vec4(palette(t), 1.0);
            }
        `;

        function compileShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        }

        const vs = compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.useProgram(program);

            const posBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            // One oversized triangle covering the full clip space — cheaper than a quad.
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

            const posLoc = gl.getAttribLocation(program, 'a_pos');
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

            const resLoc  = gl.getUniformLocation(program, 'u_resolution');
            const timeLoc = gl.getUniformLocation(program, 'u_time');
            const rectLocs = [0, 1, 2].map(i => gl.getUniformLocation(program, 'u_rect' + i));

            // Everything white that sits on the wallpaper: the hero text block,
            // the desktop nav links and the mobile menu button.
            const heroContent = document.querySelector('.hero-content');
            const darkTargets = [
                { pad: 16, rects: () => heroContent ? [...heroContent.children].map(el => el.getBoundingClientRect()) : [] },
                { pad: 12, rects: () => [document.querySelector('.nav-links')?.getBoundingClientRect()] },
                { pad: 12, rects: () => [document.querySelector('.nav-toggle')?.getBoundingClientRect()] },
            ];

            // Measured every frame so the dark areas follow layout changes,
            // font loading, intro animations and the fixed navbar while scrolling.
            function updateDarkRects() {
                const c = heroCanvas.getBoundingClientRect();
                const sx = heroCanvas.width / c.width;
                const sy = heroCanvas.height / c.height;
                darkTargets.forEach((target, i) => {
                    const rects = target.rects().filter(r => r && r.width > 0 && r.height > 0 &&
                        r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top);
                    if (!rects.length) {
                        gl.uniform4f(rectLocs[i], 0, 0, 0, 0);
                        return;
                    }
                    const left   = Math.min(...rects.map(r => r.left))   - c.left - target.pad;
                    const right  = Math.max(...rects.map(r => r.right))  - c.left + target.pad;
                    const top    = Math.min(...rects.map(r => r.top))    - c.top  - target.pad;
                    const bottom = Math.max(...rects.map(r => r.bottom)) - c.top  + target.pad;
                    // WebGL's y axis points up, so flip vertically.
                    gl.uniform4f(rectLocs[i], left * sx, heroCanvas.height - bottom * sy,
                                              right * sx, heroCanvas.height - top * sy);
                });
            }

            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            function resizeHeroCanvas() {
                // Render well under CSS-pixel resolution — the browser upscales
                // the canvas, which is imperceptible for a soft blurred gradient
                // and cuts the per-pixel shader cost substantially.
                const renderScale = 0.55;
                const w = Math.round(heroCanvas.clientWidth * renderScale);
                const h = Math.round(heroCanvas.clientHeight * renderScale);
                if (heroCanvas.width !== w || heroCanvas.height !== h) {
                    heroCanvas.width = w;
                    heroCanvas.height = h;
                    gl.viewport(0, 0, w, h);
                }
            }

            // Cap the animation at ~30fps — plenty smooth for a slow-moving
            // gradient and halves the GPU work compared to a 60Hz+ display.
            const frameInterval = 1000 / 30;
            let lastFrameTime = 0;

            function renderHeroCanvas(now) {
                if (now - lastFrameTime >= frameInterval) {
                    lastFrameTime = now;
                    resizeHeroCanvas();
                    updateDarkRects();
                    gl.uniform2f(resLoc, heroCanvas.width, heroCanvas.height);
                    gl.uniform1f(timeLoc, now * 0.001);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                }
                if (!reducedMotion) requestAnimationFrame(renderHeroCanvas);
            }

            window.addEventListener('resize', resizeHeroCanvas, { passive: true });
            requestAnimationFrame(renderHeroCanvas);
        }
    }
}

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
// Sends the message in the background via FormSubmit (no account/sign-up needed).
// The visitor just fills in the form and clicks Send — no mail app opens.
// NB: the FIRST time the form is submitted, FormSubmit e-mails Jonathan a
// one-time activation link that must be clicked once. After that it works.
const CONTACT_ENDPOINT = 'https://formsubmit.co/ajax/jonathan.kindingstad@gmail.com';
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

function resetSubmitBtn(delay) {
    setTimeout(() => {
        submitBtn.textContent = 'Send';
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
    }, delay);
}

if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.textContent = 'Sender …';
    submitBtn.disabled = true;

    const data = new FormData(form);
    data.append('_subject', 'Ny henvendelse fra swaydesign.no');
    data.append('_captcha', 'false');
    data.append('_template', 'table');

    try {
        const res = await fetch(CONTACT_ENDPOINT, {
            method:  'POST',
            headers: { 'Accept': 'application/json' },
            body:    data
        });
        if (!res.ok) throw new Error('server');

        submitBtn.textContent = 'Sendt ✓';
        submitBtn.style.background = '#30D158';
        submitBtn.style.color = '#fff';
        form.reset();
        resetSubmitBtn(4000);
    } catch {
        submitBtn.textContent = 'Feil — prøv igjen';
        submitBtn.style.background = '#FF453A';
        submitBtn.style.color = '#fff';
        resetSubmitBtn(3000);
    }
});
