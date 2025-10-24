import { renderRankings as externalRenderRankings } from './renderRankings.js';

export class RankingsApp {
  constructor(logoData, longitudeData) {
    this.currentClass = "Class 1A";
    this.logoData = logoData;
    this.longitudeData = longitudeData;
    this.bracketShown = false;
    this.init();
    this.togglePlayoffButton();
  }

  init() {
    this.bindEvents();
    this.loadRankings(this.currentClass);
  }

  bindEvents() {
    // NOTE: preloader hide moved to modules/ui.js (see tombstone below)
    // removed function hidePreloaderAfterLoad() {}

    document.querySelectorAll('.classification-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.classification-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentClass = e.target.dataset.class;
        this.resetBracket();
        // wait for the async loadRankings to complete, then toggle playoff button and (on mobile) scroll
        this.loadRankings(this.currentClass).then(() => {
          this.togglePlayoffButton();
          // mobile scrolling logic moved to modules/ui.js (see tombstone below)
          // removed function scrollToGenerateIfMobile() {}
          // removed function scrollToFirstRowIfMobile() {}
          // retained invocation placeholders will be handled where imported
          if (this._scrollToGenerateIfMobile) this._scrollToGenerateIfMobile();
          if (this._scrollToFirstRowIfMobile) this._scrollToFirstRowIfMobile(this.currentClass);
        }).catch(() => {
          // still toggle and try to scroll even if load failed
          this.togglePlayoffButton();
          if (this._scrollToGenerateIfMobile) this._scrollToGenerateIfMobile();
          if (this._scrollToFirstRowIfMobile) this._scrollToFirstRowIfMobile(this.currentClass);
        });
      });
    });

    const genBtn = document.getElementById('generateBracket');
    if (genBtn) genBtn.addEventListener('click', () => {
      if (this.bracketShown) this.exitBracket(); 
      else this.generatePlayoffBracket();
    });
  }

  // Smooth-scroll the generate bracket button/rankings header into view on mobile
  // removed inner implementation, now using injected helper (tombstone)
  // removed function scrollToGenerateIfMobile() {}

  // Scroll the viewport to the first ranking row (table row or mobile card) on small screens
  // removed inner implementation, now using injected helper (tombstone)
  // removed function scrollToFirstRowIfMobile() {}

  togglePlayoffButton() {
    const playoffBtn = document.getElementById('generateBracket');
    if (!playoffBtn) return;
    const label = `View ${this.currentClass} Projected Playoff Matchups`;
    if (['Class 3A','Class 4A','Class 5A','Class 6A','Class 7A'].includes(this.currentClass)) {
      playoffBtn.classList.add('visible');
      playoffBtn.textContent = label;
    } else {
      playoffBtn.classList.remove('visible');
      playoffBtn.textContent = label;
      this.resetBracket();
    }
  }

  resetBracket() {
    const container = document.getElementById('bracketContainer');
    if (container) container.classList.remove('visible');
    const east = document.getElementById('eastTeams'); if (east) east.innerHTML = '';
    const west = document.getElementById('westTeams'); if (west) west.innerHTML = '';
    const rc = document.querySelector('.rankings-container'); if (rc) rc.style.display = '';
    const btn = document.getElementById('generateBracket'); if (btn) { btn.textContent = `View ${this.currentClass} Projected Playoff Matchups`; }
    this.bracketShown = false;
  }

  async loadRankings(classification) {
    const container = document.querySelector('.rankings-container');
    container.innerHTML = '<div class="loading">Loading rankings...</div>';
    try {
      const classificationParam = classification.replace("Class", "Division").trim();
      const proxyUrl = 'https://corsproxy.io/?';
      const targetUrl = encodeURIComponent(`https://www.nchsaa.org/sports/football/`);
      const formData = new URLSearchParams();
      formData.append('classification', classificationParam);

      const response = await fetch(proxyUrl + targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const html = await response.text();
      const tableMatch = html.match(/<table[\s\S]*?<\/table>/i);
      if (!tableMatch) throw new Error('No table found');
      const tableHtml = tableMatch[0];
      const rowMatches = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];

      let data = rowMatches.map(row => {
        const cellMatches = row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi);
        if (!cellMatches) return [];
        return cellMatches.map(cell => cell.replace(/<[^>]+>/g, '').trim());
      });

      if (data.length > 2) data = data.slice(2); // skip header rows
      if (data && data.length > 0) {
        this.renderRankings(data);
      } else {
        container.innerHTML = '<div class="error-message">No rankings available for this classification.</div>';
      }
    } catch (e) {
      console.error('Error fetching rankings:', e);
      try {
        await this.loadRankingsFallback(classification);
      } catch {
        container.innerHTML = '<div class="error-message">Error loading rankings. Please try again later.</div>';
      }
    }
  }

  async loadRankingsFallback(classification) {
    const container = document.querySelector('.rankings-container');
    const classificationParam = classification.replace("Class", "Division").trim();
    const response = await fetch(`https://api.codetabs.com/cors-proxy/?https://www.nchsaa.org/sports/football/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `classification=${encodeURIComponent(classificationParam)}`
    });
    if (!response.ok) throw new Error('Fallback failed');
    const html = await response.text();
    const tableMatch = html.match(/<table[\s\S]*?<\/table>/i);
    if (!tableMatch) throw new Error('No table found');
    const tableHtml = tableMatch[0];
    const rowMatches = tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
    let data = rowMatches.map(row => {
      const cellMatches = row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi);
      if (!cellMatches) return [];
      return cellMatches.map(cell => cell.replace(/<[^>]+>/g, '').trim());
    });
    if (data.length > 2) data = data.slice(2);
    if (data && data.length > 0) {
      this.renderRankings(data);
    } else throw new Error('No data found');
  }

  renderRankings(data) {
    // removed large renderRankings implementation (moved to modules/renderRankings.js)
    // removed function renderRankings(data) {}
    // tombstone: implementation moved to ./modules/renderRankings.js
    // delegate to new renderer which keeps RankingsApp slimmer
    externalRenderRankings.call(this, data);
  }

  generatePlayoffBracket() {
    const titleEl = document.querySelector('.bracket-title');
    if (titleEl) titleEl.textContent = `Projected ${this.currentClass} Playoff Matchups`;

    // Support both desktop table and mobile card/list layouts
    const teams = [];
    const tbody = document.querySelector('.rankings-table tbody');
    if (tbody) {
      tbody.querySelectorAll('tr').forEach((row, index) => {
        const logoImg = row.querySelector('.team-logo');
        const nameEl = row.querySelector('.team-name span') || row.querySelector('.team-name-text') || row.querySelector('.team-name-bracket');
        const rpiEl = row.querySelector('.rpi-score');
        const recordEl = row.querySelector('.record') || row.querySelector('.team-record');
        const name = (logoImg && logoImg.dataset && logoImg.dataset.team) || (nameEl ? nameEl.textContent.trim() : `Team ${index+1}`);
        const rpi = rpiEl ? parseFloat(rpiEl.textContent) || 0 : 0;
        const record = recordEl ? recordEl.textContent.trim() : '-';
        teams.push({ name, rpi, rank: index + 1, record });
      });
    } else {
      // mobile card layout
      document.querySelectorAll('.standings-list .team-card').forEach((card, index) => {
        const logoImg = card.querySelector('.team-logo');
        const nameEl = card.querySelector('.team-name-text') || card.querySelector('.team-name-bracket') || card.querySelector('span');
        const rpiEl = card.querySelector('.rpi-score');
        const recordEl = card.querySelector('.team-record');
        const name = (logoImg && logoImg.dataset && logoImg.dataset.team) || (nameEl ? nameEl.textContent.trim() : `Team ${index+1}`);
        const rpi = rpiEl ? parseFloat(rpiEl.textContent) || 0 : 0;
        const record = recordEl ? recordEl.textContent.trim() : '-';
        teams.push({ name, rpi, rank: index + 1, record });
      });
      if (teams.length === 0) return alert('No rankings available to build a bracket.');
    }

    const top48 = teams.slice(0, 48);
    const normalize = s => (s || '').toString().toLowerCase().replace(/[^\w]/g,'');

    const applyDataset = (logoLookup, longitudeLookup) => {
      const longitudeIndex = {};
      Object.keys(longitudeLookup || {}).forEach(k => longitudeIndex[normalize(k)] = longitudeLookup[k]);
      top48.forEach(team => {
        const exact = team.name && (longitudeLookup ? longitudeLookup[team.name] : undefined);
        const norm = longitudeIndex[normalize(team.name)];
        team.longitude = exact || norm || 80.0;
        const foundKey = Object.keys(logoLookup || {}).find(k => normalize(k) === normalize(team.name));
        team.logo = (logoLookup && (logoLookup[team.name] || (foundKey ? logoLookup[foundKey] : ''))) || '';
      });
      const sortedByLng = [...top48].sort((a, b) => a.longitude - b.longitude);
      const east = sortedByLng.slice(0, 24).sort((a, b) => b.rpi - a.rpi);
      const west = sortedByLng.slice(24, 48).sort((a, b) => b.rpi - a.rpi);
      return { east, west };
    };

    const finalize = ({ east, west }) => import('./bracket.js').then(m => {
      const eastMatchups = m.createMatchups(east);
      const westMatchups = m.createMatchups(west);
      m.renderBracketWithMatchups(east, west, eastMatchups, westMatchups);
    }).then(() => {
      const rc = document.querySelector('.rankings-container'); if (rc) rc.style.display = 'none';
      const bc = document.getElementById('bracketContainer'); if (bc) bc.classList.add('visible');
      const btn = document.getElementById('generateBracket'); if (btn) { btn.textContent = 'Back to RPI Standings'; btn.classList.add('visible'); }
      this.bracketShown = true;
      // Open collapsible regions by default and apply small mobile tweaks
      setTimeout(() => {
        document.querySelectorAll('.collapsible-region .collapsible-header').forEach(h => h.setAttribute('aria-expanded','true'));
        document.querySelectorAll('.collapsible-region .collapsible-content').forEach(c => c.style.display = '');
        document.querySelectorAll('.collapsible-region .chev').forEach(ch => ch.style.transform = 'rotate(0deg)');
        // enforce compact sizing for mobile devices
        const styleId = 'bracket-mobile-style';
        if (!document.getElementById(styleId)) {
          const s = document.createElement('style');
          s.id = styleId;
          s.innerHTML = `
            @media (max-width: 768px) {
              #bracketContainer { padding-left: 0.6rem; padding-right: 0.6rem; }
              .collapsible-region .team-item { display:flex; align-items:center; gap:10px; padding: 0; margin-bottom: 0; }
              .collapsible-region .team-logo { width:44px !important; height:44px !important; padding:4px !important; }
              .collapsible-region .team-seed { width:34px; height:34px; font-size:1rem; }
              .collapsible-region .team-name-bracket { font-size:0.95rem; }
              .collapsible-region .team-rpi { font-size:0.85rem; min-width:48px; text-align:right; }
            }
          `;
          document.head.appendChild(s);
        }
      }, 50);
    });

    if (this.currentClass === 'Class 3A') {
      const ds = applyDataset(this.logoData, this.longitudeData);
      return finalize(ds);
    }

    const importMap = { 
      'Class 4A': '../data/4a.js', 
      'Class 5A': '../data/5a.js', 
      'Class 6A': '../data/6a.js', 
      'Class 7A': '../data/7a.js' 
    };
    const importPathFinal = importMap[this.currentClass];
    if (!importPathFinal) return alert('Bracket not available for this classification.');

    import(importPathFinal).then(module => {
      const logoLookup = module.logoData4A || module.logoData5A || module.logoData6A || module.logoData7A || module.logoData || {};
      const longitudeLookup = module.longitudeData4A || module.longitudeData5A || module.longitudeData6A || module.longitudeData7A || module.longitudeData || {};
      const ds = applyDataset(logoLookup, longitudeLookup);
      finalize(ds);
    }).catch(err => {
      console.error('Error loading dataset for bracket:', err);
      alert('Error generating bracket.');
    });
  }

  exitBracket() {
    this.resetBracket();
    this.togglePlayoffButton();
  }
}

// After refactor: allow injecting small UI helpers to avoid direct dependencies in constructor.
// This keeps the class testable and lean.
// Example usage from main.js:
// import { hidePreloaderAfterLoad, scrollToGenerateIfMobile, scrollToFirstRowIfMobile } from './modules/ui.js';
// const app = new RankingsApp(logoData, longitudeData);
// app._scrollToGenerateIfMobile = scrollToGenerateIfMobile;
// app._scrollToFirstRowIfMobile = scrollToFirstRowIfMobile;
// hidePreloaderAfterLoad();