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
    window.addEventListener('load', () => {
      setTimeout(() => {
        const p = document.getElementById('preloader');
        if (p) p.classList.add('hidden');
      }, 150);
    });

    document.querySelectorAll('.classification-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.classification-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentClass = e.target.dataset.class;
        this.resetBracket();
        // wait for the async loadRankings to complete, then toggle playoff button and (on mobile) scroll
        this.loadRankings(this.currentClass).then(() => {
          this.togglePlayoffButton();
          this.scrollToGenerateIfMobile();
        }).catch(() => {
          // still toggle and try to scroll even if load failed
          this.togglePlayoffButton();
          this.scrollToGenerateIfMobile();
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
  scrollToGenerateIfMobile() {
    try {
      if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
        const target = document.getElementById('generateBracket') || document.querySelector('.rankings-container');
        if (!target) return;
        // use smooth scroll and align so the target is at top of viewport
        target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        // removed delayed second scroll to eliminate initial delay before animation starts
      }
    } catch (e) {
      // fail silently
      console.warn('scrollToGenerateIfMobile failed', e);
    }
  }

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
    const container = document.querySelector('.rankings-container');
    container.style.display = '';

    // shared import map for lazy-loading logo datasets (used by onChange listener)
    const map = { 
      'Class 1A': '../data/1a.js', 
      'Class 2A': '../data/2a.js', 
      'Class 4A': '../data/4a.js', 
      'Class 5A': '../data/5a.js', 
      'Class 6A': '../data/6a.js', 
      'Class 7A': '../data/7a.js', 
      'Class 8A': '../data/8a.js' 
    };

    // Helper to normalize keys
    const normalize = s => (s||'').toString().toLowerCase().replace(/[^a-z0-9]/g,'');

    // Build desktop table HTML (kept for larger screens)
    const tableHTML = `
      <table class="rankings-table">
        <thead>
          <tr>
            <th style="width: 80px; text-align: center;">#</th>
            <th style="text-align: left;">TEAM</th>
            <th style="width: 100px; text-align: center;">RECORD</th>
            <th style="width: 90px; text-align: center;">WP</th>
            <th style="width: 90px; text-align: center;">OPW</th>
            <th style="width: 90px; text-align: center;">OOPW</th>
            <th style="width: 120px; text-align: center;">RPI</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((row, index) => `
            <tr style="animation-delay: ${index * 0.05}s" class="fade-in">
              <td><div class="fade-in cell-center"><div class="rank-number">${row[0] || '-'}</div></div></td>
              <td class="team-name" style="text-align: left;">
                ${(() => {
                  const name = (row[1]||'Unknown').trim();
                  return `<div style="display:flex;align-items:center;gap:15px">
                            <img src="" loading="lazy" decoding="async" width="52" height="52" data-team="${name}" class="team-logo" 
                            style="width:64px;height:64px;object-fit:contain;border-radius:8px;background:rgba(255,255,255,0.65);padding:6px"/>
                            <span>${name}</span>
                          </div>`;
                })()}
              </td>
              <td class="record" style="text-align: center;">${row[2] || '-'}</td>
              <td class="wp" style="text-align: center;">${row[3] || '-'}</td>
              <td class="opw" style="text-align: center;">${row[4] || '-'}</td>
              <td class="oopw" style="text-align: center;">${row[5] || '-'}</td>
              <td style="text-align: center;">
                <div class="fade-in cell-center"><div class="rpi-score">${row[6] || '-'}</div></div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Mobile card/list HTML
    const cardHTML = `
      <div class="standings-list" aria-live="polite">
        ${data.map((row, index) => {
          const rank = row[0] || '-';
          const name = (row[1]||'Unknown').trim();
          const record = row[2] || '-';
          const rpi = row[6] || '-';
          return `
            <div class="team-card fade-in" style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem;margin-bottom:0.6rem;border-radius:8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.03)">
              <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
                <div class="rank-number" style="flex:0 0 auto;width:56px;height:56px;display:flex;align-items:center;justify-content:center">${rank}</div>
                <img src="" data-team="${name}" alt="${name}" class="team-logo" style="width:56px;height:56px;padding:6px;background:rgba(255,255,255,0.75);border-radius:8px;flex:0 0 56px;object-fit:contain"/>
                <div style="flex:1;min-width:0;display:flex;flex-direction:column;">
                  <div class="team-name-text" style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
                  <div class="team-record" style="color:var(--text-secondary);font-size:0.9rem;margin-top:4px">${record}</div>
                </div>
              </div>
              <div style="display:flex;flex-direction:column;align-items:flex-end;flex:0 0 auto;min-width:84px;margin-left:12px;">
                <div class="rpi-score" style="font-weight:800;padding:6px 8px;border-radius:8px;background:rgba(16,185,129,0.06)">${rpi}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Decide which to render based on viewport width
    const useMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;

    container.innerHTML = useMobile ? cardHTML : tableHTML;

    // Logo assignment helper (same approach as before)
    const setLogosFromLookup = (lookup) => {
      const normMap = {};
      Object.keys(lookup || {}).forEach(k => { const n = normalize(k); if (n) normMap[n] = lookup[k]; });
      const assign = () => {
        document.querySelectorAll('.team-logo').forEach(img=>{
          const team = img.dataset.team||'';
          const tn = normalize(team);
          let src = normMap[tn] || lookup[team] || '';
          if (!src) {
            const found = Object.keys(normMap).find(k => k.includes(tn) || tn.includes(k));
            if (found) src = normMap[found];
          }
          img.src = src || '';
          img.style.display = src ? 'inline-block' : 'none';
        });
      };
      (window.requestIdleCallback ? requestIdleCallback(assign) : setTimeout(assign, 0));
    };

    // Attach logos for current classification (lazy import for other classes)
    if (this.currentClass === 'Class 3A') {
      setLogosFromLookup(this.logoData);
    } else {
      const map = { 
        'Class 1A': '../data/1a.js', 
        'Class 2A': '../data/2a.js', 
        'Class 4A': '../data/4a.js', 
        'Class 5A': '../data/5a.js', 
        'Class 6A': '../data/6a.js', 
        'Class 7A': '../data/7a.js', 
        'Class 8A': '../data/8a.js' 
      };
      const path = map[this.currentClass];
      if (!path) {
        document.querySelectorAll('.team-logo').forEach(img => img.style.display = 'none');
        return;
      }
      import(path).then(mod => {
        const lookup = mod.logoData8A || mod.logoData4A || mod.logoData5A || mod.logoData6A || mod.logoData7A || mod.logoData || {};
        setLogosFromLookup(lookup);
      }).catch(err => {
        console.warn('Failed to load logos for', this.currentClass, err);
        document.querySelectorAll('.team-logo').forEach(img => img.style.display = 'none');
      });
    }

    // Listen for viewport changes to swap layouts on-the-fly
    if (window.matchMedia) {
      const mq = window.matchMedia('(max-width: 768px)');
      const onChange = (e) => {
        if (e.matches && container.innerHTML !== cardHTML) container.innerHTML = cardHTML;
        if (!e.matches && container.innerHTML !== tableHTML) container.innerHTML = tableHTML;
        // re-run logo assignment after swapping
        setTimeout(() => {
          if (this.currentClass === 'Class 3A') setLogosFromLookup(this.logoData);
          else {
            const path = map && map[this.currentClass];
            if (!path) return;
            import(path).then(mod => {
              const lookup = mod.logoData8A || mod.logoData4A || mod.logoData5A || mod.logoData6A || mod.logoData7A || mod.logoData || {};
              setLogosFromLookup(lookup);
            }).catch(()=>{});
          }
        }, 30);
      };
      // ensure only one listener attached
      try { mq.removeEventListener && mq.removeEventListener('change', this._mqListener); } catch(e){}
      mq.addEventListener && mq.addEventListener('change', onChange);
      this._mqListener = onChange;
    }
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