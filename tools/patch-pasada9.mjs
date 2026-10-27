// Pasada 9: lista de marcas igual a la de barrios; "repuestos" con la tuerca en todo el sitio
import fs from 'fs';
const ed = (F, a, b) => { let s = fs.readFileSync(F, 'utf8'); if (!s.includes(a)) throw new Error(F + ': ' + a.slice(0, 80)); s = s.split(a).join(b); fs.writeFileSync(F, s); };

// 1. Tuerca en el sprite y en todo lo que dice "Repuestos originales"
ed('site/assets/icons.svg', '<symbol id="i-tool"', '<symbol id="i-nut" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M12 2.6 20.1 7.3v9.4L12 21.4 3.9 16.7V7.3z"/><circle cx="12" cy="12" r="3.7"/><path d="M12 8.3V6.7M15.2 13.9l1.4.8M8.8 13.9l-1.4.8" stroke-width="1.4" stroke-linecap="round" opacity=".55"/></symbol>\n<symbol id="i-tool"');
ed('build.mjs', "['tool', 'Repuestos originales']", "['nut', 'Repuestos originales']");
ed('build.mjs', "<li>${icon('tool')}Repuestos originales</li>", "<li>${icon('nut')}Repuestos originales</li>");
let bm = fs.readFileSync('build.mjs', 'utf8');
bm = bm.replace("const FACTS = [", "// la tuerca de \"repuestos\" gira despacio en todo el sitio (fx.css: use[href=\"#i-nut\"])\nconst FACTS = [");
fs.writeFileSync('build.mjs', bm);

// 2. Marca: lista propia con el mismo aspecto y comportamiento que la de barrios
ed('site/assets/js/site.js', '  // Barrio: sugerencias que se abren y cierran con la flechita y se van solas si no las tocás', `  // Marca: lista propia igual a la de barrios. El select real queda oculto y sigue guardando el valor
  {
    const sel = brandSel;
    const wrap = d.createElement('div'); wrap.className = 'combo combo--select';
    sel.before(wrap); wrap.append(sel);
    sel.classList.add('combo-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const btn = d.createElement('button'); btn.type = 'button'; btn.className = 'control combo-trigger'; btn.id = 'c-marca-btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'c-marca-list');
    const lab = form.querySelector('label[for="c-marca"]'); if (lab) lab.htmlFor = btn.id;
    const list = d.createElement('ul'); list.className = 'combo-list'; list.id = 'c-marca-list'; list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Marcas'); list.hidden = true;
    wrap.append(btn, list);
    let idle, act = -1;
    const sync = () => {
      const o = sel.options[sel.selectedIndex];
      btn.innerHTML = \`<span class="combo-val\${sel.value ? '' : ' is-ph'}">\${o ? o.text : ''}</span><svg class="ico combo-chev" aria-hidden="true"><use href="#i-chevron"/></svg>\`;
      btn.disabled = sel.disabled;
    };
    const close = () => { clearTimeout(idle); list.hidden = true; wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); act = -1; };
    const arm = () => { clearTimeout(idle); idle = setTimeout(close, 4000); };
    const items = () => [...list.children];
    const hi = k => { const it = items(); act = (k + it.length) % it.length; it.forEach((li, j) => li.classList.toggle('on', j === act)); it[act].scrollIntoView({ block: 'nearest' }); arm(); };
    const open = () => {
      if (sel.disabled) return;
      list.innerHTML = [...sel.options].filter(o => o.value !== '').map((o, k) => \`<li role="option" id="c-marca-o\${k}" data-v="\${o.value}" aria-selected="\${o.selected}">\${o.text}</li>\`).join('');
      list.hidden = false; wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); arm();
    };
    const pick = v => { sel.value = v; sel.dispatchEvent(new Event('change')); sync(); close(); };
    btn.addEventListener('click', () => (list.hidden ? open() : close()));
    list.addEventListener('pointerdown', e => { const li = e.target.closest('li'); if (li) { e.preventDefault(); pick(li.dataset.v); btn.focus(); } });
    list.addEventListener('pointermove', arm, { passive: true });
    list.addEventListener('scroll', arm, { passive: true });
    btn.addEventListener('keydown', e => {
      if (list.hidden) { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); open(); hi(0); } return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); hi(act + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); hi(act - 1); }
      else if ((e.key === 'Enter' || e.key === ' ') && act >= 0) { e.preventDefault(); pick(items()[act].dataset.v); }
      else if (e.key === 'Escape' || e.key === 'Tab') close();
    });
    d.addEventListener('pointerdown', e => { if (!wrap.contains(e.target)) close(); });
    new MutationObserver(sync).observe(sel, { childList: true, attributes: true, attributeFilter: ['disabled'] });
    sync();
  }

  // Barrio: sugerencias que se abren y cierran con la flechita y se van solas si no las tocás`);

// 3. CSS
fs.appendFileSync('site/assets/css/fx.css', `
/* =====================================================================
   Pasada 9
   ===================================================================== */
/* ---------- Marca: lista propia (igual a la de barrios) */
.combo-native{position:absolute!important;width:1px;height:1px;opacity:0;pointer-events:none}
.combo-trigger{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;text-align:left;font:inherit;font-size:1rem;color:var(--ink);cursor:pointer;padding-right:12px}
.combo-trigger .is-ph{color:var(--muted)}
.combo-val{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.combo-chev{flex:none;width:18px;height:18px;color:var(--slate);transition:transform .25s}
.combo.is-open .combo-chev{transform:rotate(180deg)}
.combo-trigger:disabled{cursor:not-allowed}
.combo-trigger:disabled .combo-chev{opacity:.5}

/* ---------- Repuestos: la tuerca gira despacio en todo el sitio */
svg.ico:has(use[href="#i-nut"]){animation:nut-spin 9s linear infinite}
`);
console.log('ok');
