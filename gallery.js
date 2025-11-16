/* gallery.js
   Upgraded lightbox with keyboard, touch-swipe, preload, and nice animations.
*/

(() => {
  // Helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Ensure images are lazy-loaded for performance
  const thumbs = $$('.gallery .photo img');
  thumbs.forEach(img => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    img.style.willChange = 'transform, opacity';
  });

  // Build lightbox elements
  const overlay = document.createElement('div');
  overlay.className = 'bl-lightbox-overlay';
  overlay.innerHTML = `
    <div class="bl-lightbox-inner" role="dialog" aria-modal="true">
      <button class="bl-close" aria-label="Close (Esc)">&times;</button>
      <button class="bl-prev" aria-label="Previous (←)">‹</button>
      <figure class="bl-figure">
        <img class="bl-image" src="" alt="">
        <figcaption class="bl-caption"></figcaption>
      </figure>
      <button class="bl-next" aria-label="Next (→)">›</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Style (minimal runtime safety styles in case CSS hasn't loaded yet)
  const runtimeStyle = document.createElement('style');
  runtimeStyle.textContent = `
    .bl-lightbox-overlay { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; background: rgba(0,0,0,0.7); z-index:2000; }
    .bl-lightbox-overlay.show { display: flex; animation: bl-fade .18s ease both; }
    .bl-lightbox-inner { position: relative; max-width: 95vw; max-height: 95vh; display:flex; align-items:center; gap: 18px; }
    .bl-figure { margin:0; display:flex; flex-direction:column; align-items:center; gap:12px; width: min(1100px, 92vw); }
    .bl-image { max-width:100%; max-height:82vh; border-radius:14px; box-shadow: 0 12px 40px rgba(0,0,0,0.5); transform: translateY(8px) scale(.995); opacity:0; transition: transform .32s cubic-bezier(.2,.9,.2,1), opacity .28s ease; }
    .bl-image.show { transform: translateY(0) scale(1); opacity:1; }
    .bl-caption { color: #e8e8e8; font-size: 0.95rem; text-align:center; opacity:0.9; max-width: 90%; }
    .bl-close, .bl-prev, .bl-next { background: rgba(255,255,255,0.06); border: none; color: white; padding: 10px 14px; border-radius: 12px; backdrop-filter: blur(6px); cursor:pointer; font-size: 1.1rem; }
    .bl-prev, .bl-next { font-size: 1.4rem; }
    .bl-close { position:absolute; top: -8px; right: -8px; background: rgba(0,0,0,0.45); }
    .bl-prev { margin-left: 6px; }
    .bl-next { margin-right: 6px; }
    @keyframes bl-fade { from {opacity:0} to{opacity:1} }
    @media (max-width:700px){ .bl-figure{ width: 100%; } .bl-close{ top:6px; right:8px; } }
  `;
  document.head.appendChild(runtimeStyle);

  // State
  let currentIndex = -1;
  const galleryPhotos = $$('.gallery .photo');
  const total = galleryPhotos.length;

  // Get image src list (resolves src attribute exactly as used)
  const srcList = galleryPhotos.map(p => {
    const img = p.querySelector('img');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') || '' : '',
      node: img || null,
      category: p.dataset.category || 'uncategorized'
    };
  });

  // Query selectors in overlay
  const imgEl = $('.bl-image', overlay);
  const captionEl = $('.bl-caption', overlay);
  const closeBtn = $('.bl-close', overlay);
  const prevBtn = $('.bl-prev', overlay);
  const nextBtn = $('.bl-next', overlay);

  // Utility: open lightbox at index
  function openAt(index) {
    if (index < 0 || index >= srcList.length) return;
    currentIndex = index;
    const item = srcList[index];
    // sanitize spaces in src: browsers handle spaces but encodeURI for safety
    imgEl.src = encodeURI(item.src);
    imgEl.alt = item.alt || '';
    captionEl.textContent = item.alt || '';
    overlay.classList.add('show');
    // small delay for animation class
    requestAnimationFrame(() => imgEl.classList.add('show'));
    // prefetch neighbors
    preloadIndex(index + 1);
    preloadIndex(index - 1);
    lockScroll(true);
    updateButtons();
  }

  function closeLightbox() {
    overlay.classList.remove('show');
    imgEl.classList.remove('show');
    lockScroll(false);
    currentIndex = -1;
  }

  function updateButtons() {
    prevBtn.style.visibility = (currentIndex > 0) ? 'visible' : 'hidden';
    nextBtn.style.visibility = (currentIndex < srcList.length - 1) ? 'visible' : 'hidden';
  }

  function showNext() { if (currentIndex < srcList.length - 1) openAt(currentIndex + 1); }
  function showPrev() { if (currentIndex > 0) openAt(currentIndex - 1); }

  function preloadIndex(i) {
    if (i < 0 || i >= srcList.length) return;
    const pre = new Image();
    pre.src = encodeURI(srcList[i].src);
  }

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  // Event: open when thumb clicked (delegation)
  galleryPhotos.forEach((p, i) => {
    const img = p.querySelector('img');
    if (!img) return;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      // If the clicked photo is hidden by a filter, ignore
      if (getComputedStyle(p).display === 'none') return;
      openAt(i);
    });
  });

  // Close on overlay click (but not when clicking inner content)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  // Buttons
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (currentIndex === -1) return; // only when open
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Touch / swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  overlay.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, {passive: true});

  overlay.addEventListener('touchmove', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchEndX = e.touches[0].clientX;
  }, {passive: true});

  overlay.addEventListener('touchend', (e) => {
    const dx = touchEndX - touchStartX;
    const dy = Math.abs((e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0) - touchStartY);
    const threshold = 40; // minimal px to count as swipe
    if (Math.abs(dx) > threshold && dy < 80) {
      if (dx < 0) showNext();
      else showPrev();
    } else {
      // tap outside the image closes
      const rect = imgEl.getBoundingClientRect();
      if (touchStartX < rect.left || touchStartX > rect.right) closeLightbox();
    }
    touchStartX = touchEndX = 0;
  });

  // Accessibility: focus trap basics - return focus to last clicked thumb
  let lastActiveThumb = null;
  galleryPhotos.forEach((p, i) => {
    const img = p.querySelector('img');
    if (!img) return;
    img.addEventListener('click', () => lastActiveThumb = img);
  });
  closeBtn.addEventListener('click', () => {
    if (lastActiveThumb) lastActiveThumb.focus({preventScroll: true});
  });

  // Observe gallery changes (if you add/remove images later)
  const galleryRoot = $('.gallery');
  if (galleryRoot) {
    const mo = new MutationObserver(muts => {
      // rebuild srcList if nodes change
      const newPhotos = $$('.gallery .photo');
      if (newPhotos.length !== srcList.length) {
        // simple page reload of state (works well for small galleries)
        window.location.reload();
      }
    });
    mo.observe(galleryRoot, { childList: true, subtree: true });
  }

  // Expose minimal debugging on window (optional)
  window.BL_LIGHTBOX = {
    openAt, closeLightbox, showNext, showPrev
  };

})();
