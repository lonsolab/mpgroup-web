import fs from 'fs';
const F = 'site/assets/js/fx.js';
let s = fs.readFileSync(F, 'utf8');
const between = (a, b, repl) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error(a); s = s.slice(0, i) + repl + s.slice(j); };

// 1. Cursor: sin anillo sobre el fondo; en su lugar, un círculo de luz tenue que contrasta con la zona
between('  // ---------- Cursor que cambia', '  // ---------- Botones con borde', `  // ---------- Mouse: círculo de luz tenue sobre el fondo (turquesa en lo claro, blanco en lo oscuro)
  //            y, sobre botones y tarjetas, una etiqueta que dice qué pasa al hacer clic
  if (fine) {
    const cur = mk('div', 'fx-cursor', '<span class="fx-cursor-ring"></span><span class="fx-cursor-label"></span>');
    const spot = mk('div', 'fx-spot');
    cur.setAttribute('aria-hidden', 'true'); spot.setAttribute('aria-hidden', 'true');
    d.body.append(spot, cur);
    const lab = cur.lastChild;
    let x = -100, y = -100, sx = -100, sy = -100, tx = -100, ty = -100, raf = 0, mode = '-';
    const loop = () => {
      x += (tx - x) * .28; y += (ty - y) * .28;
      sx += (tx - sx) * .14; sy += (ty - sy) * .14;
      cur.style.transform = \`translate3d(\${x.toFixed(1)}px,\${y.toFixed(1)}px,0)\`;
      spot.style.transform = \`translate3d(\${sx.toFixed(1)}px,\${sy.toFixed(1)}px,0)\`;
      raf = Math.abs(tx - sx) + Math.abs(ty - sy) > .3 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!cur.classList.contains('on')) { x = sx = tx; y = sy = ty; cur.classList.add('on'); spot.classList.add('on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    d.addEventListener('pointerover', e => {
      const t = e.target;
      let m = '', l = '';
      if (t.closest('input, textarea, select, .chat, .fx-rail')) m = 'hide';
      else if (t.closest(WA)) { m = 'wa'; l = 'Abrir el chat'; }
      else if (t.closest('a[href^="tel:"]')) { m = 'tel'; l = 'Llamar'; }
      else if (t.closest('a[href^="mailto:"]')) { m = 'mail'; l = 'Escribir'; }
      else if (t.closest('.cov-map-canvas [data-n]')) { m = 'pick'; l = 'Elegir'; }
      else if (t.closest('.appliance, .post-card, .product, .brand-word, a.bento-cell')) { m = 'view'; l = 'Ver'; }
      else if (t.closest(ACT)) m = 'link';
      const dk = dark(t);
      cur.classList.toggle('is-dark', dk); spot.classList.toggle('is-dark', dk);
      spot.classList.toggle('is-dim', m !== '');
      if (m !== mode) { mode = m; cur.dataset.m = m; lab.textContent = l; }
    });
    d.addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
    root.addEventListener('pointerleave', () => { cur.classList.remove('on'); spot.classList.remove('on'); });
  }

`);

// 2. Sin "vista técnica"
between('  // ---------- Vista técnica', '  // ---------- Bento "Visita en el día"', '');

// 3. Camioneta de la cabecera: sale de la empresa (izquierda) y llega a la casa (derecha)
const oldEnd = '<span class="fx-home">${use(\'check\')}</span>`);';
if (!s.includes(oldEnd)) throw new Error('road');
s = s.replace(oldEnd, '<span class="fx-hq" title="MP Group"><svg viewBox="0 0 16 16"><path d="M2.5 14.5V4.2L8.5 1.8v12.7M8.5 14.5V6.5h5v8M1 14.5h14"/><path class="w" d="M4.6 5.6h1.6M4.6 8.2h1.6M4.6 10.8h1.6M10.2 8.6h1.6M10.2 11.2h1.6"/></svg></span><span class="fx-home"><svg viewBox="-8 -8 16 16"><path d="M-6.5 0 0-6 6.5 0M-4.6-1.6v7.6h9.2v-7.6"/><path class="w" d="M-1.4 6v-3.4h2.8V6"/></svg></span>`);');
fs.writeFileSync(F, s);
console.log('ok', s.includes('data-xray'));
