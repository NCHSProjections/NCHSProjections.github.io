export function createMatchups(teams) {
  const matchups = [];
  // order: 24vs9, 23vs10, 22vs11, 21vs12, 20vs13, 19vs14, 18vs15, 17vs16
  const pairs = [
    [23,8],[22,9],[21,10],[20,11],
    [19,12],[18,13],[17,14],[16,15]
  ];
  pairs.forEach(([h,l]) => {
    if (teams[h] && teams[l]) {
      matchups.push({
        highSeed: teams[h],
        lowSeed: teams[l],
        highSeedRank: h + 1,
        lowSeedRank: l + 1
      });
    }
  });
  return matchups;
}

export function renderBracketWithMatchups(eastTeams, westTeams, eastMatchups, westMatchups) {
  const eastContainer = document.getElementById('eastTeams');
  const westContainer = document.getElementById('westTeams');
  const bracketContainer = document.getElementById('bracketContainer');
  if (!eastContainer || !westContainer || !bracketContainer) return;

  eastContainer.innerHTML = '';
  westContainer.innerHTML = '';

  // Center the title
  const titleElement = document.querySelector('.bracket-title');
  if (titleElement) {
    titleElement.style.textAlign = 'center';
    titleElement.style.marginBottom = '3rem';
  }

  // helper to create a collapsible region wrapper
  const createRegionWrapper = (titleText) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'collapsible-region';
    wrapper.style.width = '100%';
    wrapper.style.marginBottom = '1.25rem';

    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'collapsible-header';
    header.setAttribute('aria-expanded', 'true');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.width = '100%';
    header.style.background = 'transparent';
    header.style.border = 'none';
    header.style.color = 'var(--text)';
    header.style.cursor = 'pointer';
    header.style.padding = '0';
    header.style.fontFamily = "Oswald, sans-serif";
    header.style.fontSize = '1.2rem';

    const h = document.createElement('div');
    h.textContent = titleText;
    h.style.fontWeight = '700';
    header.appendChild(h);

    const chevron = document.createElement('div');
    chevron.className = 'chev';
    chevron.innerHTML = '▾';
    chevron.style.transition = 'transform .2s ease';
    chevron.style.opacity = '0.9';
    header.appendChild(chevron);

    const content = document.createElement('div');
    content.className = 'collapsible-content';
    content.style.marginTop = '1rem';

    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      content.style.display = expanded ? 'none' : '';
      chevron.style.transform = expanded ? 'rotate(-90deg)' : 'rotate(0deg)';
    });

    wrapper.appendChild(header);
    wrapper.appendChild(content);
    return { wrapper, header, content, chevron };
  };

  // ===== EAST BYES =====
  const eastByes = createRegionWrapper('FIRST ROUND BYES');
  {
    const titleEl = document.createElement('h4');
    titleEl.style.color = 'var(--accent-glow)';
    titleEl.style.margin = '0 0 0.5rem 0';
    titleEl.style.fontFamily = "Oswald, sans-serif";
    titleEl.style.fontSize = '1rem';
    titleEl.style.display = 'none'; // kept for semantics if needed
    eastByes.content.appendChild(titleEl);

    eastTeams.slice(0,8).forEach((t,i) => {
      const d = document.createElement('div');
      d.className = 'team-item';
      d.style.justifyContent = 'space-between';
      d.style.padding = '0.6rem';
      d.style.marginBottom = '0.5rem';
      d.style.alignItems = 'center';
      const rpiText = String(t.rpi || '').replace(/^RPI:\s*/i, '');
      d.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; min-width:0; flex:1;">
          <div class="team-seed">${i+1}</div>
          <img src="${t.logo||''}" alt="${t.name}" class="team-logo" loading="lazy" decoding="async" style="width:56px;height:56px;padding:6px;background:rgba(255,255,255,0.65);border-radius:8px;flex:0 0 56px;object-fit:contain">
          <div class="team-name-bracket" style="flex:1; min-width:0; text-overflow:ellipsis; overflow:hidden;">${t.name} ${t.record?`(${t.record})`:''}</div>
        </div>
        <div class="team-rpi" style="flex:0 0 auto; margin-left:10px;">${rpiText}</div>
      `;
      eastByes.content.appendChild(d);
    });
    eastContainer.appendChild(eastByes.wrapper);
  }

  // ===== EAST MATCHUPS =====
  const eastMatchupsWrapper = createRegionWrapper('FIRST ROUND MATCHUPS');
  {
    const title = document.createElement('div');
    title.style.color = '#FFFFFF';
    title.style.fontWeight = '600';
    title.style.marginBottom = '0.5rem';
    title.style.fontSize = '1rem';
    eastMatchupsWrapper.content.appendChild(title);

    eastMatchups.forEach((m, idx) => {
      const md = document.createElement('div');
      md.className = 'team-list matchup-card';
      md.style.margin = '0 auto 1rem auto';
      md.style.width = '100%';
      md.style.border = '2px solid rgba(220, 20, 60, 0.18)';
      md.style.borderRadius = '10px';
      md.style.padding = '0.75rem';
      md.style.background = 'rgba(220, 20, 60, 0.06)';
      
      const title = document.createElement('div');
      title.className = 'matchup-title';
      title.style.color = '#FFFFFF';
      title.style.fontWeight = '600';
      title.style.marginBottom = '0.5rem';
      title.style.fontSize = '0.95rem';
      const seedNumber = 8 - idx;
      title.textContent = `Winner Plays: #${seedNumber} seed`;
      md.appendChild(title);

      const rowFactory = (teamObj, rankLabel) => {
        const row = document.createElement('div');
        row.className = 'team-item';
        row.style.marginBottom = '0.5rem';
        row.style.padding = '0.4rem 0';
        const rpiText = String(teamObj.rpi || '').replace(/^RPI:\s*/i, '');
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;min-width:0;">
            <div class="team-seed">${rankLabel}</div>
            <img src="${teamObj.logo||''}" alt="${teamObj.name}" class="team-logo" loading="lazy" decoding="async" style="width:48px;height:48px;padding:6px;background:rgba(255,255,255,0.65);border-radius:6px;flex:0 0 48px;object-fit:contain">
            <div class="team-name-bracket" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;">${teamObj.name} ${teamObj.record?`(${teamObj.record})`:''}</div>
          </div>
          <div class="team-rpi" style="flex:0 0 auto; margin-left:8px;">${rpiText}</div>
        `;
        return row;
      };

      md.appendChild(rowFactory(m.highSeed, m.highSeedRank));
      md.appendChild(rowFactory(m.lowSeed, m.lowSeedRank));
      eastMatchupsWrapper.content.appendChild(md);
    });

    eastContainer.appendChild(eastMatchupsWrapper.wrapper);
  }

  // ===== WEST BYES =====
  const westByes = createRegionWrapper('FIRST ROUND BYES');
  {
    westTeams.slice(0,8).forEach((t,i) => {
      const d = document.createElement('div');
      d.className = 'team-item';
      d.style.justifyContent = 'space-between';
      d.style.padding = '0.6rem';
      d.style.marginBottom = '0.5rem';
      d.style.alignItems = 'center';
      const rpiText = String(t.rpi || '').replace(/^RPI:\s*/i, '');
      d.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
          <div class="team-seed">${i+1}</div>
          <img src="${t.logo||''}" alt="${t.name}" class="team-logo" loading="lazy" decoding="async" style="width:56px;height:56px;padding:6px;background:rgba(255,255,255,0.65);border-radius:8px;flex:0 0 56px;object-fit:contain">
          <div class="team-name-bracket" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;">${t.name} ${t.record?`(${t.record})`:''}</div>
        </div>
        <div class="team-rpi" style="flex:0 0 auto; margin-left:10px;">${rpiText}</div>
      `;
      westByes.content.appendChild(d);
    });
    westContainer.appendChild(westByes.wrapper);
  }

  // ===== WEST MATCHUPS =====
  const westMatchupsWrapper = createRegionWrapper('FIRST ROUND MATCHUPS');
  {
    westMatchups.forEach((m, idx) => {
      const md = document.createElement('div');
      md.className = 'team-list matchup-card';
      md.style.margin = '0 auto 1rem auto';
      md.style.width = '100%';
      md.style.border = '2px solid rgba(220, 20, 60, 0.18)';
      md.style.borderRadius = '10px';
      md.style.padding = '0.75rem';
      md.style.background = 'rgba(220, 20, 60, 0.06)';
      
      const title = document.createElement('div');
      title.className = 'matchup-title';
      title.style.color = '#FFFFFF';
      title.style.fontWeight = '600';
      title.style.marginBottom = '0.5rem';
      title.style.fontSize = '0.95rem';
      const seedNumber = 8 - idx;
      title.textContent = `Winner Plays: #${seedNumber} seed`;
      md.appendChild(title);

      const rowFactory = (teamObj, rankLabel) => {
        const row = document.createElement('div');
        row.className = 'team-item';
        row.style.marginBottom = '0.5rem';
        row.style.padding = '0.4rem 0';
        const rpiText = String(teamObj.rpi || '').replace(/^RPI:\s*/i, '');
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;min-width:0;">
            <div class="team-seed">${rankLabel}</div>
            <img src="${teamObj.logo||''}" alt="${teamObj.name}" class="team-logo" loading="lazy" decoding="async" style="width:48px;height:48px;padding:6px;background:rgba(255,255,255,0.65);border-radius:6px;flex:0 0 48px;object-fit:contain">
            <div class="team-name-bracket" style="flex:1;min-width:0;white-space:normal;word-break:break-word;">${teamObj.name} ${teamObj.record?`(${teamObj.record})`:''}</div>
          </div>
          <div class="team-rpi" style="flex:0 0 auto; margin-left:8px;">${rpiText}</div>
        `;
        return row;
      };

      md.appendChild(rowFactory(m.highSeed, m.highSeedRank));
      md.appendChild(rowFactory(m.lowSeed, m.lowSeedRank));
      westMatchupsWrapper.content.appendChild(md);
    });
    westContainer.appendChild(westMatchupsWrapper.wrapper);
  }

  // Show bracket
  bracketContainer.classList.add('visible');
}