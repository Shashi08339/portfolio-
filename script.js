/* ═══════════════════════════════════════════════
   script.js — Performance-first JS
   - RAF loop for cursor (no per-mousemove style writes)
   - Canvas starfield (replaces CSS animated blobs)
   - Passive event listeners everywhere possible
   - IntersectionObserver for reveal (no blur filter)
   - Zero layout thrashing
═══════════════════════════════════════════════ */

/* ── LOADER ─────────────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 850);
}, { passive: true });


/* ── STARFIELD CANVAS ───────────────────────── */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random(),          // alpha
      da: (Math.random() - 0.5) * 0.005, // twinkle speed
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,210,255,${s.a})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
})();


/* ── CUSTOM CURSOR (RAF loop, no per-event write) ── */
(function initCursor() {
  const cursor  = document.querySelector('.cursor');
  const ring    = cursor?.querySelector('.cursor-ring');
  const dot     = cursor?.querySelector('.cursor-dot');
  if (!ring || !dot) return;

  // Only show on non-touch
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let mx = -100, my = -100;     // raw mouse
  let rx = -100, ry = -100;     // ring (lerped)
  let rafId;

  window.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  }, { passive: true });

  function tick() {
    // dot follows exactly
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
    // ring lerps for smooth lag
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    rafId = requestAnimationFrame(tick);
  }

  tick();

  // Hover state
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a,button,[data-tilt]')) cursor.classList.add('hovered');
  }, { passive: true });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a,button,[data-tilt]')) cursor.classList.remove('hovered');
  }, { passive: true });
})();


/* ── CARD SPOTLIGHT (CSS var, no layout) ────── */
(function initSpotlight() {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = ((e.clientX - left) / width  * 100).toFixed(1) + '%';
      const y = ((e.clientY - top)  / height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', x);
      card.style.setProperty('--my', y);
    }, { passive: true });
  });
})();


/* ── SCROLL REVEAL (IntersectionObserver) ───── */
(function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();


/* ── PORTRAIT PARALLAX (hero only, RAF) ─────── */
(function initParallax() {
  const portrait = document.getElementById('portrait');
  if (!portrait) return;

  let tx = 0, ty = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', e => {
    const { innerWidth: W, innerHeight: H } = window;
    tx = (e.clientX / W - 0.5) * -18;
    ty = (e.clientY / H - 0.5) * -14;
  }, { passive: true });

  function tick() {
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    // combine with the existing float animation offset
    portrait.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    requestAnimationFrame(tick);
  }

  // Only run when hero is visible
  const hero = document.querySelector('.hero');
  let running = false;

  const heroObs = new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    if (visible && !running) { running = true; tick(); }
    if (!visible && running) { running = false; }
  });

  if (hero) heroObs.observe(hero);
})();


/* ── NAV HIDE ON SCROLL DOWN ────────────────── */
(function initNavBehavior() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 80) {
      nav.style.top = '-80px';
    } else {
      nav.style.top = '20px';
    }
    lastY = y;
  }, { passive: true });
})();


/* ── MOBILE NAV TOGGLE ──────────────────────── */
(function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    links.style.display = open ? '' : 'flex';
    links.style.flexDirection = open ? '' : 'column';
    links.style.position = open ? '' : 'absolute';
    links.style.top = open ? '' : '64px';
    links.style.right = open ? '' : '20px';
    links.style.background = open ? '' : 'rgba(4,4,14,.96)';
    links.style.padding = open ? '' : '16px';
    links.style.borderRadius = open ? '' : '16px';
    links.style.border = open ? '' : '1px solid rgba(200,136,255,.15)';
  });
})();


/* ── FORM ENHANCEMENT ───────────────────────── */
(function initForm() {
  const form = document.querySelector('.contact-form');
  const btn  = form?.querySelector('.submit-btn');
  if (!form || !btn) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const label = btn.querySelector('span');
    const orig  = label.textContent;
    label.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        label.textContent = 'Sent ✓';
        btn.style.background = 'linear-gradient(120deg,#3dff7b,#00c8a0)';
        form.reset();
        setTimeout(() => {
          label.textContent = orig;
          btn.style.background = '';
          btn.disabled = false;
        }, 3500);
      } else {
        throw new Error('Server error');
      }
    } catch {
      label.textContent = 'Failed — try email';
      btn.style.background = 'linear-gradient(120deg,#ff4f7b,#c0003e)';
      btn.disabled = false;
      setTimeout(() => {
        label.textContent = orig;
        btn.style.background = '';
      }, 3000);
    }
  });
})();
