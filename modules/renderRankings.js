// New module: renderRankings.js
// Contains the large renderRankings implementation previously inside modules/rankingsApp.js
export function renderRankings(data) {
  // 'this' is expected to be the RankingsApp instance (we use .call(this, data) from RankingsApp)
  const container = document.querySelector('.rankings-container');
  container.style.display = '';

  const map = { 
    'Class 1A': '../data/1a.js', 
    'Class 2A': '../data/2a.js', 
    'Class 4A': '../data/4a.js', 
    'Class 5A': '../data/5a.js', 
    'Class 6A': '../data/6a.js', 
    'Class 7A': '../data/7a.js', 
    'Class 8A': '../data/8a.js' 
  };

  const normalize = s => (s||'').toString().toLowerCase().replace(/[^a-z0-9]/g,'');

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

  const useMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  container.innerHTML = useMobile ? cardHTML : tableHTML;

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

  // Viewport-change listener to swap layouts; minimal debounce
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
    try { mq.removeEventListener && mq.removeEventListener('change', this._mqListener); } catch(e){}
    mq.addEventListener && mq.addEventListener('change', onChange);
    this._mqListener = onChange;
  }
}