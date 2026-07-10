/* ============================================================
   LALJI PANDEY SCRAP TRADERS — JavaScript
   Features: Canvas particles, scroll reveal, counters,
   carousel, mobile menu, navbar scroll effect, form
   ============================================================ */

'use strict';

// ---- UTILITY: throttle ----
function throttle(fn, ms) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, args); }
  };
}

// ==============================================================
// 1. NAVBAR — scroll effect + hamburger
// ==============================================================
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let menuOpen = false;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', throttle(onScroll, 50), { passive: true });
  onScroll();

  function toggleMenu(open) {
    menuOpen = open;
    mobileMenu.style.display = open ? 'flex' : 'none';
    requestAnimationFrame(() => {
      mobileMenu.classList.toggle('open', open);
    });
    hamburger.setAttribute('aria-expanded', open.toString());
    document.body.style.overflow = open ? 'hidden' : '';
    // Animate hamburger bars
    const bars = hamburger.querySelectorAll('span');
    if (open) {
      bars[0].style.transform = 'translateY(8px) rotate(45deg)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'translateY(-8px) rotate(-45deg)';
    } else {
      bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  }

  hamburger.addEventListener('click', () => toggleMenu(!menuOpen));

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on overlay click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) toggleMenu(false);
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) toggleMenu(false);
  });
})();


// ==============================================================
// 2. CANVAS PARTICLE ANIMATION — Hero background
// ==============================================================
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  let W, H, particles;
  const ACCENT    = 'rgba(212, 116, 58,';
  const LIGHT     = 'rgba(232, 147, 78,';
  const SUBTLE    = 'rgba(255,255,255,';
  const COUNT     = window.innerWidth < 768 ? 35 : 70;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x    = Math.random() * W;
      this.y    = initial ? Math.random() * H : H + 20;
      this.size = Math.random() * 2.5 + 0.5;
      this.vx   = (Math.random() - 0.5) * 0.35;
      this.vy   = -(Math.random() * 0.6 + 0.15);
      this.life = 0;
      this.maxLife = Math.random() * 300 + 180;
      const r = Math.random();
      this.colorFn = r < 0.55 ? ACCENT : r < 0.75 ? LIGHT : SUBTLE;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
      this.isHex = Math.random() < 0.3;
    }
    update() {
      this.x  += this.vx;
      this.y  += this.vy;
      this.rotation += this.rotSpeed;
      this.life++;
      if (this.life > this.maxLife || this.y < -20) this.reset(false);
    }
    draw() {
      const progress = this.life / this.maxLife;
      const alpha = Math.min(progress * 4, 1) * (1 - Math.pow(progress, 2)) * 0.55;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = alpha;
      if (this.isHex) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = Math.cos(angle) * this.size * 1.8;
          const py = Math.sin(angle) * this.size * 1.8;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = this.colorFn + alpha + ')';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      } else {
        // Diamond shard
        ctx.beginPath();
        ctx.moveTo(0, -this.size * 2);
        ctx.lineTo(this.size * 1.2, 0);
        ctx.lineTo(0, this.size * 2);
        ctx.lineTo(-this.size * 1.2, 0);
        ctx.closePath();
        ctx.fillStyle = this.colorFn + alpha * 0.3 + ')';
        ctx.fill();
        ctx.strokeStyle = this.colorFn + alpha + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  let rafId;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    rafId = requestAnimationFrame(animate);
  }

  init();
  animate();

  window.addEventListener('resize', throttle(() => {
    resize();
  }, 200));

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animate();
    }
  });
})();


// ==============================================================
// 3. SCROLL REVEAL — Intersection Observer
// ==============================================================
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


// ==============================================================
// 4. ANIMATED COUNTERS — Trust Bar
// ==============================================================
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const dur     = 2000;
    const start   = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const eased = easeOutExpo(progress);
      const value = Math.round(eased * target);
      el.textContent = value.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


// ==============================================================
// 5. TESTIMONIALS CAROUSEL
// ==============================================================
(function initCarousel() {
  const track     = document.getElementById('testimonials-track');
  const prevBtn   = document.getElementById('prev-btn');
  const nextBtn   = document.getElementById('next-btn');
  const dotsWrap  = document.getElementById('carousel-dots');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getVisible() {
    return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
  }

  function goTo(index) {
    const visible = getVisible();
    const maxIndex = Math.max(0, total - visible);
    current = Math.max(0, Math.min(index, maxIndex));

    // Calculate card width + gap
    const cardEl = cards[0];
    const trackWidth = track.offsetWidth;
    const gap = 24; // 1.5rem gap
    const cardWidth = visible === 1
      ? cardEl.offsetWidth + gap
      : (trackWidth + gap) / visible;

    track.style.transform = `translateX(-${current * cardWidth}px)`;

    // Update dots
    const dots = dotsWrap.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active.toString());
    });

    // Restart auto
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1 > Math.max(0, total - getVisible()) ? 0 : current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard
  prevBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(current - 1); } });
  nextBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(current + 1); } });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) goTo(dx > 0 ? current + 1 : current - 1);
  });

  window.addEventListener('resize', throttle(() => goTo(current), 200));

  // Auto-advance
  autoTimer = setInterval(() => goTo(current + 1 > Math.max(0, total - getVisible()) ? 0 : current + 1), 5000);

  // Pause on hover
  track.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.addEventListener('mouseleave', () => {
    autoTimer = setInterval(() => goTo(current + 1 > Math.max(0, total - getVisible()) ? 0 : current + 1), 5000);
  });
})();


// ==============================================================
// 6. QUOTE FORM — submission (WhatsApp redirect)
// ==============================================================
(function initForm() {
  const form    = document.getElementById('quote-form');
  const success = document.getElementById('form-success');
  const btn     = document.getElementById('submit-form-btn');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const name     = form.name.value.trim();
    const phone    = form.phone.value.trim();
    const material = form.material.value;

    if (!name || !phone || !material) {
      // Highlight empty required fields
      [form.name, form.phone, form.material].forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
        }
      });
      return;
    }

    // Build WhatsApp message
    const qty  = form.quantity ? form.quantity.value.trim() : '';
    const area = form.address  ? form.address.value.trim()  : '';
    const msg  = form.message  ? form.message.value.trim()  : '';

    const waMsg = encodeURIComponent(
      `Hi Lalji Pandey Scrap Traders! I want to sell scrap.\n\n` +
      `Name: ${name}\nPhone: ${phone}\nMaterial: ${material}` +
      (qty  ? `\nQuantity: ${qty}`   : '') +
      (area ? `\nPickup Area: ${area}` : '') +
      (msg  ? `\nDetails: ${msg}`    : '') +
      `\n\nPlease share the rates and schedule pickup.`
    );

    // Show success
    btn.disabled = true;
    btn.textContent = 'Sending…';
    success.classList.add('show');

    // Open WhatsApp in 600ms
    setTimeout(() => {
      window.open(`https://wa.me/918779585113?text=${waMsg}`, '_blank', 'noopener,noreferrer');
      btn.disabled = false;
      btn.innerHTML = 'Send Quote Request <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
      form.reset();
    }, 600);
  });
})();


// ==============================================================
// 7. ACTIVE NAV LINK on scroll
// ==============================================================
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--accent)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
})();


// ==============================================================
// 8. LAZY LOAD images polyfill fallback
// ==============================================================
(function lazyLoadFallback() {
  if ('loading' in HTMLImageElement.prototype) return; // native support
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        io.unobserve(img);
      }
    });
  });
  imgs.forEach(img => io.observe(img));
})();


// ==============================================================
// 9. MOBILE STICKY BAR — hide during hero, show on scroll
// ==============================================================
(function initStickyBar() {
  const bar  = document.getElementById('mobile-sticky-bar');
  const hero = document.getElementById('hero');
  if (!bar || !hero) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Show bar only when hero is NOT visible
      bar.style.opacity = entry.isIntersecting ? '0' : '1';
      bar.style.pointerEvents = entry.isIntersecting ? 'none' : 'all';
    });
  }, { threshold: 0.1 });

  observer.observe(hero);
})();
