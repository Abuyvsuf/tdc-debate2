const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

document.addEventListener('DOMContentLoaded', () => {
  const nav = $('.site-nav');
  const hamburger = $('.hamburger');
  const overlay = $('.mobile-overlay');
  const setNavState = () => nav && nav.classList.toggle('scrolled', scrollY > 60);

  setNavState();
  addEventListener('scroll', setNavState, { passive: true });

  const page = location.pathname.split('/').pop() || 'index.html';
  $$('[data-nav]').forEach((link) => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  hamburger?.addEventListener('click', () => overlay?.classList.toggle('open'));
  $$('.mobile-overlay a').forEach((link) => link.addEventListener('click', () => overlay?.classList.remove('open')));

  $$('.hero-title').forEach((title) => {
    title.innerHTML = title.textContent
      .split('\n')
      .map((line) => `<span class="line ${line.includes('SHAPE') ? 'gold' : ''}">${line.trim().split(' ').map((word) => `<span class="hero-word">${word}</span>`).join(' ')}</span>`)
      .join('');
  });

  if (window.gsap) {
    gsap.registerPlugin?.(ScrollTrigger);
    gsap.from('.hero-word', { y: 80, opacity: 0, rotateX: -20, duration: 1, ease: 'power4.out', stagger: 0.08, delay: 0.3 });
    gsap.utils.toArray('.fade-up').forEach((element) => {
      gsap.from(element, { scrollTrigger: { trigger: element, start: 'top 85%' }, y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' });
    });
    if (window.ScrollTrigger) {
      $$('.pin-section').forEach((section) => {
        ScrollTrigger.create({ trigger: section, start: 'top top', end: '+=600', pin: true, scrub: 1 });
        const beats = $$('.beat', section);
        const timeline = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=600', scrub: 1 } });
        beats.forEach((beat, beatIndex) => {
          timeline.from(beat, beatIndex === 1 ? { opacity: 0, x: 60 } : { opacity: 0, y: 40 });
        });
      });
    }
  } else {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('in');
    }), { threshold: 0.15 });
    $$('.fade-up').forEach((element) => observer.observe(element));
  }

  const counters = $$('[data-count]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const end = parseFloat(element.dataset.count);
      const suffix = element.dataset.suffix || '';
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / 1200, 1);
        element.textContent = (end * progress).toLocaleString(undefined, { maximumFractionDigits: 0 }) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(element);
    }), { threshold: 0.5 });
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  $$('.filter-btn').forEach((button) => button.addEventListener('click', () => {
    const scope = button.closest('[data-filter-scope]') || document;
    $$('.filter-btn', button.parentElement).forEach((peer) => peer.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    $$('[data-category]', scope).forEach((item) => {
      item.classList.toggle('hidden', filter !== 'all' && !item.dataset.category.split(' ').includes(filter));
    });
    document.dispatchEvent(new CustomEvent('tdc:filterChanged'));
  }));

  $$('.tab-btn').forEach((button) => button.addEventListener('click', () => {
    const group = button.closest('[data-tabs]');
    $$('.tab-btn', group).forEach((peer) => peer.classList.remove('active'));
    button.classList.add('active');
    $$('[data-tab-panel]', group).forEach((panel) => panel.classList.toggle('hidden', panel.dataset.tabPanel !== button.dataset.tab));
    const message = $('#audience-message');
    if (message && button.dataset.message) message.textContent = button.dataset.message;
  }));

  $$('.blog-card .gold-link, .blog-card h3').forEach((trigger) => trigger.addEventListener('click', (event) => {
    const card = event.target.closest('.blog-card');
    if (card?.querySelector('.post-full')) {
      event.preventDefault();
      card.classList.toggle('expanded');
    }
  }));
});
