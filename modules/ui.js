// UI helpers extracted from RankingsApp to declutter the main class
export function hidePreloaderAfterLoad(delay = 150) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const p = document.getElementById('preloader');
      if (p) p.classList.add('hidden');
    }, delay);
  });
}

// Smooth-scroll the generate bracket button/rankings header into view on mobile
export function scrollToGenerateIfMobile() {
  try {
    if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
      const target = document.getElementById('generateBracket') || document.querySelector('.rankings-container');
      if (!target) return;
      // use smooth scroll and align so the target is at top of viewport (immediate)
      target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  } catch (e) {
    // fail silently
    console.warn('scrollToGenerateIfMobile failed', e);
  }
}

// Scroll the viewport to the first ranking row (table row or mobile card) on small screens
export function scrollToFirstRowIfMobile(currentClass) {
  try {
    if (!(window.matchMedia && window.matchMedia('(max-width: 768px)').matches)) return;
    if (!['Class 1A','Class 2A','Class 8A'].includes(currentClass)) return;
    // Immediately attempt to scroll to the first ranking element (no extra delay)
    const firstCard = document.querySelector('.standings-list .team-card');
    if (firstCard) { firstCard.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' }); return; }
    const firstRow = document.querySelector('.rankings-table tbody tr');
    if (firstRow) { firstRow.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' }); return; }
    const rc = document.querySelector('.rankings-container');
    if (rc) rc.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  } catch (e) {
    console.warn('scrollToFirstRowIfMobile failed', e);
  }
}