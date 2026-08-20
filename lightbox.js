(() => {
  let items = [];
  let index = 0;
  let startX = 0;
  const overlay = document.createElement('div');

  overlay.className = 'lb-overlay';
  overlay.innerHTML = `<button class="lb-close" aria-label="Close">×</button><button class="lb-prev" aria-label="Previous">‹</button><div class="lb-stage"><div class="lb-visual"><div class="lb-icon">◌</div></div><div class="lb-caption"></div></div><button class="lb-next" aria-label="Next">›</button>`;

  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));

  const captionElement = () => overlay.querySelector('.lb-caption');
  const visualElement = () => overlay.querySelector('.lb-visual');

  function refreshItems() {
    items = [...document.querySelectorAll('.lightbox-trigger')].filter((element) => !element.classList.contains('hidden') && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
  }

  function show(nextIndex) {
    refreshItems();
    if (!items.length) return;
    index = (nextIndex + items.length) % items.length;
    const element = items[index];
    const caption = element.dataset.caption || element.textContent.trim() || 'The Debate Circle';
    const image = element.matches('img') ? element : element.querySelector('img');

    visualElement().innerHTML = '';
    if (image?.src) {
      const clone = new Image();
      clone.src = image.src;
      clone.alt = caption;
      clone.style.maxWidth = '100%';
      clone.style.maxHeight = '100%';
      clone.style.objectFit = 'contain';
      visualElement().appendChild(clone);
    } else {
      visualElement().innerHTML = `<div style="display:grid;place-items:center;gap:12px"><div style="font-size:54px;opacity:.45">◌</div><div>${caption}</div></div>`;
    }

    captionElement().textContent = `${element.dataset.category || ''} ${caption}`.trim();
    overlay.classList.add('open');
  }

  function close() {
    overlay.classList.remove('open');
  }

  function move(delta) {
    show(index + delta);
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.lightbox-trigger');
    if (!trigger) return;
    event.preventDefault();
    refreshItems();
    show(items.indexOf(trigger));
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.closest('.lb-close')) close();
    if (event.target.closest('.lb-prev')) move(-1);
    if (event.target.closest('.lb-next')) move(1);
  });

  document.addEventListener('keydown', (event) => {
    if (!overlay.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });

  overlay.addEventListener('touchstart', (event) => {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });

  overlay.addEventListener('touchend', (event) => {
    const deltaX = event.changedTouches[0].clientX - startX;
    if (Math.abs(deltaX) > 50) move(deltaX > 0 ? -1 : 1);
  }, { passive: true });

  document.addEventListener('tdc:filterChanged', refreshItems);
})();
