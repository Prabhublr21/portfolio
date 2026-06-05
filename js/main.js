/* ============================================================
   PRABHAKAR SEENAPPA — PORTFOLIO
   Main JavaScript
   ============================================================ */

'use strict';

/* ------------------------------------------------------------
   LOADER
------------------------------------------------------------ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('hidden'), 1300);
});

/* ------------------------------------------------------------
   NAVIGATION — scroll state + hamburger
------------------------------------------------------------ */
const nav = document.querySelector('.nav');
const hamburger = document.querySelector('.nav__hamburger');
const mobileMenu = document.querySelector('.nav__mobile');

if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  mobileMenu.querySelectorAll('.nav__mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* Active nav link on scroll */
const navLinks = document.querySelectorAll('.nav__link[data-section]');
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ------------------------------------------------------------
   SMOOTH SCROLL for anchor links
------------------------------------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ------------------------------------------------------------
   INTERSECTION OBSERVER — fade-up animations (.fu → .on)
------------------------------------------------------------ */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('on');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fu').forEach(el => fadeObserver.observe(el));

/* ------------------------------------------------------------
   STATS COUNTER ANIMATION
------------------------------------------------------------ */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const isDecimal = el.dataset.decimal === 'true';
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;
    el.textContent = isDecimal ? current.toFixed(1) + suffix : Math.floor(current) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('[data-target]').forEach(animateCounter);
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);

/* ------------------------------------------------------------
   SKILLS PROGRESS BARS (.skill__fill)
------------------------------------------------------------ */
const skillsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.skill__fill').forEach(fill => {
      const pct = fill.dataset.pct || '0';
      fill.style.width = pct + '%';
    });
    skillsObserver.unobserve(entry.target);
  });
}, { threshold: 0.2 });

const skillsSection = document.querySelector('#skills');
if (skillsSection) skillsObserver.observe(skillsSection);

/* ------------------------------------------------------------
   PORTFOLIO FILTER (.pf__filter / .pf-card)
------------------------------------------------------------ */
const filterBtns = document.querySelectorAll('.pf__filter');
const projectCards = document.querySelectorAll('.pf-card[data-cat]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      if (match) {
        card.style.opacity = '1';
        card.style.transform = '';
        card.style.pointerEvents = '';
      } else {
        card.style.opacity = '0.2';
        card.style.transform = 'scale(0.97)';
        card.style.pointerEvents = 'none';
      }
    });
  });
});

/* ------------------------------------------------------------
   TESTIMONIALS SLIDER (.testi__list / .testi__dot / .testi__btn)
------------------------------------------------------------ */
(function initTestimonials() {
  const track   = document.querySelector('.testi__track');
  const list    = document.querySelector('.testi__list');
  if (!list || !track) return;

  const items   = list.querySelectorAll('.testi-card');
  const dots    = document.querySelectorAll('.testi__dot');
  const prevBtn = document.querySelector('.testi__btn--prev');
  const nextBtn = document.querySelector('.testi__btn--next');
  let current = 0;
  let autoplay;

  /* Use pixel translation so it's reliable at every viewport width */
  function slideWidth() {
    return track.offsetWidth;
  }

  function goTo(index) {
    current = (index + items.length) % items.length;
    list.style.transform = `translateX(${-current * slideWidth()}px)`;
    dots.forEach((d, i) => d.classList.toggle('on', i === current));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { clearInterval(autoplay); goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { clearInterval(autoplay); goTo(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { clearInterval(autoplay); goTo(i); startAuto(); }));

  /* Recalculate position on window resize so cards stay aligned */
  window.addEventListener('resize', () => goTo(current), { passive: true });

  function startAuto() {
    autoplay = setInterval(() => goTo(current + 1), 5000);
  }

  goTo(0);
  startAuto();
})();

/* ------------------------------------------------------------
   CONTACT FORM — Web3Forms (sends to prabhublr21@gmail.com)
------------------------------------------------------------ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.form-btn');
    if (!btn) return;

    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(contactForm)
      });
      const data = await res.json();

      if (data.success) {
        contactForm.style.display = 'none';
        const success = document.querySelector('.form-success');
        if (success) success.style.display = 'block';
      } else {
        alert('Something went wrong. Please try again or email me directly.');
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }
    } catch (err) {
      alert('Network error. Please check your connection and try again.');
      btn.textContent = 'Send Message';
      btn.disabled = false;
    }
  });
}

/* ------------------------------------------------------------
   BACK TO TOP (.btt → .show)
------------------------------------------------------------ */
const btt = document.querySelector('.btt');
if (btt) {
  window.addEventListener('scroll', () => {
    btt.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ------------------------------------------------------------
   PROGRESS BARS — case study pages (.skill__fill)
------------------------------------------------------------ */
document.querySelectorAll('.skill__fill[data-pct]').forEach(fill => {
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fill.style.width = fill.dataset.pct + '%';
        skillObserver.unobserve(fill);
      }
    });
  }, { threshold: 0.5 });
  skillObserver.observe(fill);
});
