/* ==========================================================================
   BURGER STATION — main.js
   Handles: mobile nav, active nav link, header scroll state,
   scroll-reveal animations, menu tabs, FAQ accordion,
   contact form validation, back-to-top button.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  initHeaderScroll();
  initMobileNav();
  setActiveNavLink();
  initScrollReveal();
  initMenuTabs();
  initFaqAccordion();
  initContactForm();
  initBackToTop();
});

/* -------------------------- Footer copyright year ------------------------- */
function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------------------------- Header scroll state -------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const applyState = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  applyState();
  window.addEventListener('scroll', applyState, { passive: true });
}

/* ------------------------------- Mobile nav -------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('navMobile');
  if (!toggle || !mobileNav) return;

  const closeNav = () => {
    toggle.classList.remove('is-active');
    mobileNav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openNav = () => {
    toggle.classList.add('is-active');
    mobileNav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('is-open');
    isOpen ? closeNav() : openNav();
  });

  // Close menu whenever a mobile link is tapped
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

/* --------------------------- Dynamic active nav link ------------------------ */
function setActiveNavLink() {
  // Determine current page from the URL (defaults to index)
  let path = window.location.pathname.split('/').pop();
  if (path === '' || path === undefined) path = 'index.html';
  const currentPage = path.replace('.html', '') || 'index';

  document.querySelectorAll('[data-nav]').forEach(link => {
    const linkPage = link.getAttribute('data-nav');
    if (linkPage === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/* ------------------------------ Scroll reveal ------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  // If IntersectionObserver isn't supported, just show everything
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
}

/* -------------------------------- Menu tabs ---------------------------------- */
function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      panels.forEach(panel => {
        const isMatch = panel.getAttribute('data-panel') === target;
        panel.classList.toggle('is-active', isMatch);
        panel.hidden = !isMatch;
      });
    });
  });
}

/* ------------------------------ FAQ accordion -------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all other items (single-open accordion)
      faqItems.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq-a').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ----------------------------- Contact form validation ------------------------ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successBox = document.getElementById('formSuccess');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+\-()\s]{7,}$/;

  const validators = {
    name: value => value.trim().length >= 2,
    email: value => emailPattern.test(value.trim()),
    phone: value => phonePattern.test(value.trim()),
    guests: value => value.trim().length > 0,
    date: value => value.trim().length > 0,
    time: value => value.trim().length > 0
  };

  const showError = (fieldId, hasError) => {
    const wrapper = document.getElementById(`field-${fieldId}`);
    if (wrapper) wrapper.classList.toggle('has-error', hasError);
  };

  // Clear error state as the user fixes a field
  Object.keys(validators).forEach(fieldId => {
    const input = form.elements[fieldId];
    if (!input) return;
    input.addEventListener('input', () => {
      if (validators[fieldId](input.value)) showError(fieldId, false);
    });
    input.addEventListener('change', () => {
      if (validators[fieldId](input.value)) showError(fieldId, false);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    Object.keys(validators).forEach(fieldId => {
      const input = form.elements[fieldId];
      if (!input) return;
      const fieldValid = validators[fieldId](input.value);
      showError(fieldId, !fieldValid);
      if (!fieldValid) isValid = false;
    });

    if (!isValid) {
      const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstError) firstError.focus();
      if (successBox) successBox.classList.remove('is-visible');
      return;
    }

    // Simulate a successful submission (no backend wired up)
    if (successBox) {
      successBox.classList.add('is-visible');
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    form.reset();
  });
}

/* -------------------------------- Back to top -------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('toTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}