// Pasada 8: lista de barrios propia, cursor sin etiquetas, foto del mismo lado, rendimiento en PCs lentas
import fs from 'fs';
const ed = (F, a, b) => { let s = fs.readFileSync(F, 'utf8'); if (!s.includes(a)) throw new Error(F + ': ' + a.slice(0, 80)); s = s.split(a).join(b); fs.writeFileSync(F, s); };

// ---------- build.mjs
let bm = fs.readFileSync('build.mjs', 'utf8');
const i0 = bm.indexOf('<input class="control" id="c-barrio" list="barrios"');
const i1 = bm.indexOf('</datalist>', i0) + '</datalist>'.length;
if (i0 < 0 || i1 < 20) throw new Error('barrio');
bm = bm.slice(0, i0) + '<div class="combo" data-combo data-opts="${[...ZONES.CABA, ...ZONES[\'Zona Norte\']].join(\'|\')}"><input class="control" id="c-barrio" role="combobox" aria-expanded="false" aria-controls="c-barrios" aria-autocomplete="list" autocomplete="off" placeholder="Por ejemplo, Belgrano"><button class="combo-btn" type="button" tabindex="-1" aria-label="Mostrar u ocultar los barrios">${icon(\'chevron\')}</button><ul class="combo-list" id="c-barrios" role="listbox" aria-label="Barrios" hidden></ul></div>' + bm.slice(i1);
// la grilla de puntos del fondo es CSS: va en el HTML y se ve desde el primer cuadro
if (!bm.includes('<body>\n<noscript>')) throw new Error('body');
bm = bm.replace('<body>\n<noscript>', '<body>\n<div class="bg-dots" aria-hidden="true"></div>\n<noscript>');
// equipos con poca memoria o pocos núcleos: modo liviano desde el arranque
bm = bm.replace("<script>document.documentElement.classList.add('js');", "<script>document.documentElement.classList.add('js');if((navigator.deviceMemory||8)<=2||(navigator.hardwareConcurrency||8)<=2)document.documentElement.classList.add('lite');");
// minificado de CSS y JS al final del build (esbuild, si está; si no, quedan legibles)
const minMark = "// solo las fotos que se usan";
if (!bm.includes(minMark)) throw new Error('min');
bm = bm.replace(minMark, `// CSS y JS minificados: menos para bajar y para leer en equipos lentos
try {
  const { pathToFileURL } = await import('url');
  const ESB = process.env.ESBUILD || 'C:/Users/needf/AppData/Roaming/npm/node_modules/omniroute/node_modules/esbuild/lib/main.js';
  const esb = await import(pathToFileURL(ESB).href).then(m => m.default || m);
  const mini = (file, loader) => { const p = path.join(DIST, file); fs.writeFileSync(p, esb.transformSync(fs.readFileSync(p, 'utf8'), { loader, minify: true, legalComments: 'none' }).code); };
  mini('assets/css/site.css', 'css');
  for (const f of fs.readdirSync(path.join(DIST, 'assets/js'))) if (f.endsWith('.js')) mini('assets/js/' + f, 'js');
} catch (e) { console.log('sin minificar:', e.message); }
${minMark}`);
fs.writeFileSync('build.mjs', bm);

// ---------- site.js
const S = 'site/assets/js/site.js';
// pasos: primero se mide todo y después se escribe (antes forzaba un layout en cada cuadro del scroll)
ed(S, `      const r = steps.getBoundingClientRect(), mid = window.innerHeight * .62;
      const p = Math.max(0, Math.min(1, (mid - r.top - 42) / (r.height - 84)));
      steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
      items.forEach(li => li.classList.toggle('on', li.getBoundingClientRect().top + 22 < mid || reduce));`,
`      const r = steps.getBoundingClientRect(), mid = window.innerHeight * .62;
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const tops = items.map(li => li.getBoundingClientRect().top);
      const p = Math.max(0, Math.min(1, (mid - r.top - 42) / (r.height - 84)));
      steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
      items.forEach((li, k) => li.classList.toggle('on', tops[k] + 22 < mid || reduce));`);
// foto: del mismo lado que el ítem (columna derecha → a la derecha, izquierda → a la izquierda; en el medio, según el mouse)
ed(S, `    const aim = cy => {
      const r = item.getBoundingClientRect();
      const s2 = r.left + r.width / 2 > innerWidth * .62 ? -1 : 1;
      tx = s2 > 0 ? r.right + GAP : r.left - GAP - PW;`,
`    const aim = (cx, cy) => {
      const r = item.getBoundingClientRect(), g = peekList.getBoundingClientRect();
      const col = (r.left + r.width / 2 - g.left) / g.width;
      const s2 = col > .66 ? 1 : col < .34 ? -1 : (cx > r.left + r.width / 2 ? 1 : -1);
      tx = s2 > 0 ? Math.min(innerWidth - PW - 8, r.right + GAP) : Math.max(8, r.left - GAP - PW);`);
ed(S, `el.addEventListener('pointerenter', e => { item = el; img.src = el.dataset.peek; side = 0; aim(e.clientY);`, `el.addEventListener('pointerenter', e => { item = el; img.src = el.dataset.peek; side = 0; aim(e.clientX, e.clientY);`);
ed(S, `el.addEventListener('pointermove', e => { if (item === el) aim(e.clientY); });`, `el.addEventListener('pointermove', e => { if (item === el) aim(e.clientX, e.clientY); });`);
// lista de barrios propia (la del navegador no se podía cerrar ni se iba sola)
ed(S, `  brandSel.addEventListener('change', () => { state.brand = brandSel.value; mark(); render(true); });`,
`  brandSel.addEventListener('change', () => { state.brand = brandSel.value; mark(); render(true); });
  // Barrio: sugerencias que se abren y cierran con la flechita y se van solas si no las tocás
  const combo = form.querySelector('[data-combo]');
  if (combo) {
    const opts = combo.dataset.opts.split('|'), list = combo.querySelector('.combo-list'), cbtn = combo.querySelector('.combo-btn');
    const norm = t => t.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase();
    let idle, act = -1;
    const close = () => { clearTimeout(idle); list.hidden = true; combo.classList.remove('is-open'); barrio.setAttribute('aria-expanded', 'false'); barrio.removeAttribute('aria-activedescendant'); act = -1; };
    const arm = () => { clearTimeout(idle); idle = setTimeout(close, 4000); };
    const open = all => {
      const q = all ? '' : norm(barrio.value.trim());
      const hits = opts.filter(o => !q || norm(o).includes(q));
      if (!hits.length) return close();
      list.innerHTML = hits.map((o, k) => \`<li role="option" id="cb-\${k}">\${o}</li>\`).join('');
      list.hidden = false; combo.classList.add('is-open'); barrio.setAttribute('aria-expanded', 'true'); act = -1; arm();
    };
    const pick = v => { barrio.value = v; close(); render(false); };
    cbtn.addEventListener('pointerdown', e => e.preventDefault());
    cbtn.addEventListener('click', () => { if (list.hidden) { open(true); barrio.focus(); } else close(); });
    barrio.addEventListener('input', () => open(false));
    barrio.addEventListener('click', () => { if (list.hidden) open(!barrio.value.trim()); });
    barrio.addEventListener('blur', () => setTimeout(close, 120));
    list.addEventListener('pointerdown', e => { const li = e.target.closest('li'); if (li) { e.preventDefault(); pick(li.textContent); } });
    list.addEventListener('pointermove', arm, { passive: true });
    list.addEventListener('scroll', arm, { passive: true });
    barrio.addEventListener('keydown', e => {
      if (list.hidden) { if (e.key === 'ArrowDown') { e.preventDefault(); open(true); } return; }
      const items = [...list.children];
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        act = (act + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach((li, k) => li.classList.toggle('on', k === act));
        barrio.setAttribute('aria-activedescendant', items[act].id);
        items[act].scrollIntoView({ block: 'nearest' });
        arm();
      } else if (e.key === 'Enter' && act >= 0) { e.preventDefault(); pick(items[act].textContent); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
  }`);

// ---------- fx.js: cursor sin etiquetas (solo el círculo azul), modo liviano si la PC no da
const X = 'site/assets/js/fx.js';
ed(X, "{ m = 'wa'; l = 'Abrir el chat'; }", "m = 'link';");
ed(X, "{ m = 'tel'; l = 'Llamar'; }", "m = 'link';");
ed(X, "{ m = 'mail'; l = 'Escribir'; }", "m = 'link';");
ed(X, "{ m = 'pick'; l = 'Elegir'; }", "m = 'pick';");
ed(X, '  // ---------- Capa de efectos de clic', `  // ---------- ¿La PC da? Si en los primeros segundos muchos cuadros tardan más de 34 ms, se pasa al modo liviano
  //            (sin malla, sin onda, sin luz del mouse, sin desenfoques ni inclinación de tarjetas)
  setTimeout(() => {
    let n = 0, slow = 0, last = performance.now();
    const probe = now => { if (now - last > 34) slow++; last = now; if (++n < 90) requestAnimationFrame(probe); else if (slow > 18) root.classList.add('lite'); };
    requestAnimationFrame(probe);
  }, 1500);
  const lite = () => root.classList.contains('lite');

  // ---------- Capa de efectos de clic`);
// en modo liviano la tarjeta no se inclina
ed(X, `    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), px`, `    c.addEventListener('pointermove', e => {
      if (lite()) return;
      const r = c.getBoundingClientRect(), px`);

// ---------- bg.js: modo liviano leído en vivo
const B = 'site/assets/js/bg.js';
ed(B, "  const lite = root.classList.contains('lite');", "  const isLite = () => root.classList.contains('lite');");
ed(B, '      if (!lite) {', '      if (!isLite()) {');
ed(B, "  if (!lite) addEventListener('mp:shock', e => {", "  addEventListener('mp:shock', e => { if (isLite()) return;");

// ---------- CSS
fs.appendFileSync('site/assets/css/fx.css', `
/* =====================================================================
   Pasada 8
   ===================================================================== */
/* ---------- Grilla de puntos del fondo (CSS, la desplaza bg.js con transform) */
.bg-dots{position:fixed;left:0;right:0;top:0;bottom:-56px;z-index:-2;pointer-events:none;background:radial-gradient(circle,rgba(64,89,101,.2) 1.05px,transparent 1.6px) 0 0/28px 56px,radial-gradient(circle,rgba(64,89,101,.2) 1.05px,transparent 1.6px) 14px 28px/28px 56px;will-change:transform}
.bg-grid{animation:none}

/* ---------- Barrio: lista de sugerencias propia */
.combo{position:relative}
.combo .control{padding-right:46px}
.combo-btn{position:absolute;right:5px;top:50%;translate:0 -50%;width:40px;height:40px;padding:0;border:0;border-radius:10px;background:none;display:grid;place-items:center;color:var(--slate);cursor:pointer;transition:background-color .2s}
.combo-btn:hover{background:var(--enamel)}
.combo-btn .ico{width:18px;height:18px;transition:transform .25s}
.combo.is-open .combo-btn .ico{transform:rotate(180deg)}
.combo-list{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:30;max-height:232px;overflow:auto;margin:0;padding:6px;list-style:none;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 20px 44px -18px rgba(28,43,51,.45);overscroll-behavior:contain;animation:combo-in .18s ease both}
.combo-list[hidden]{display:none}
.combo-list li{padding:10px 12px;border-radius:9px;font-size:.95rem;color:var(--ink);cursor:pointer}
.combo-list li:hover,.combo-list li.on{background:var(--teal-soft);color:var(--teal-deep)}
@keyframes combo-in{from{opacity:0;transform:translateY(-4px)}}

/* ---------- Cursor: sin etiquetas, solo el círculo azul */
.fx-cursor-label{display:none!important}
.fx-cursor[data-m=pick] .fx-cursor-ring{width:48px;height:48px;background:rgba(40,158,186,.12);border-color:var(--teal)}

/* ---------- Modo liviano (PCs lentas): se apagan los efectos que más cuestan */
.lite .header,.lite .facts-strip,.lite .fx-rail,.lite .chat-launch,.lite .cl-bubble{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
.lite .header{background:#fff}
.lite .marquee{-webkit-mask-image:none;mask-image:none}
.lite .fx-spot{display:none}
.lite .stack-card{animation:none!important;filter:none!important}
.lite .tone::after,.lite .page-hero-media::after,.lite .article-cover::after{mix-blend-mode:normal;opacity:.5}
.lite .fx-tilt{transform:none!important}
`);
console.log('ok');
