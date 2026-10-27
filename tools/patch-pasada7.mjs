// Pasada 7: foto al costado, tuerca que gira, ticket de factura, cursor sin "Ver", línea de la camioneta, P del pie
import fs from 'fs';
const ed = (F, a, b) => { let s = fs.readFileSync(F, 'utf8'); if (!s.includes(a)) throw new Error(F + ': ' + a.slice(0, 70)); s = s.split(a).join(b); fs.writeFileSync(F, s); };

// 1. Foto de la lista de equipos: chica y al costado del ítem (del lado donde no tapa)
const S = 'site/assets/js/site.js';
let s = fs.readFileSync(S, 'utf8');
const a = s.indexOf('  // Foto que sigue al cursor en la lista de electrodomésticos');
const b = s.indexOf('  // Marquees que se inclinan');
if (a < 0 || b < 0) throw new Error('peek');
s = s.slice(0, a) + `  // Foto de la lista de electrodomésticos: aparece al costado del ítem, del lado que no tapa el texto
  // (a la derecha en las columnas de la izquierda y del medio; a la izquierda en la última)
  const peekList = d.querySelector('[data-peek-list]');
  if (peekList && fine && window.innerWidth > 960) {
    const peek = d.createElement('div');
    peek.className = 'peek'; peek.setAttribute('aria-hidden', 'true');
    peek.innerHTML = '<img alt="">';
    d.body.append(peek);
    const img = peek.firstChild;
    const PW = 200, PH = 150, GAP = 14;
    let item = null, side = 0, tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * .2; y += (ty - y) * .2;
      peek.style.setProperty('--px', \`\${x.toFixed(1)}px\`);
      peek.style.setProperty('--py', \`\${y.toFixed(1)}px\`);
      raf = item || Math.abs(ty - y) > .5 ? requestAnimationFrame(loop) : 0;
    };
    const aim = cy => {
      const r = item.getBoundingClientRect();
      const s2 = r.left + r.width / 2 > innerWidth * .62 ? -1 : 1;
      tx = s2 > 0 ? r.right + GAP : r.left - GAP - PW;
      ty = Math.max(8, Math.min(innerHeight - PH - 8, cy - PH / 2));
      if (s2 !== side) { side = s2; x = tx; y = ty; peek.classList.toggle('is-left', s2 < 0); }
    };
    peekList.querySelectorAll('[data-peek]').forEach(el => {
      if (!el.dataset.peek) return;
      el.addEventListener('pointerenter', e => { item = el; img.src = el.dataset.peek; side = 0; aim(e.clientY); peek.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); });
      el.addEventListener('pointermove', e => { if (item === el) aim(e.clientY); });
      el.addEventListener('pointerleave', () => { item = null; peek.classList.remove('on'); });
    });
  }

` + s.slice(b);
fs.writeFileSync(S, s);

// 2. Cursor: sin la etiqueta "Ver"; sobre tarjetas, el mismo círculo azul que en los enlaces
ed('site/assets/js/fx.js', "{ m = 'view'; l = 'Ver'; }", "m = 'link';");

// 3. Línea de la cabecera: llega justo hasta la camioneta
ed('site/assets/css/fx.css', '.fx-van{left:calc(28px + var(--sp) * (100% - 86px))}', '.fx-van{left:calc(28px + var(--sp) * (100% - 86px))}\n.fx-road-fill{right:auto;width:calc(30px + var(--sp) * (100% - 86px));transform:none}');

// 4. Bento: tuerca que gira y ticket de factura
let bm = fs.readFileSync('build.mjs', 'utf8');
const NUT = `<svg class="ico nut" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6 20.1 7.3v9.4L12 21.4 3.9 16.7V7.3z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.7" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 8.3v-1.6M15.2 13.9l1.4.8M8.8 13.9l-1.4.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".55"/></svg>`;
const rep = (x, y) => { if (!bm.includes(x)) throw new Error('build: ' + x.slice(0, 70)); bm = bm.split(x).join(y); };
rep("<div class=\"bento-cell b-parts\"><span class=\"b-ico\">${icon('tool')}</span>", `<div class="bento-cell b-parts"><span class="b-ico">${NUT}</span>`);
rep("<div class=\"bento-cell b-pay\"><span class=\"b-ico\">${icon('receipt')}</span><h3>Pagás como te quede cómodo</h3><p>Efectivo o transferencia, con factura A o B.</p></div>",
  "<div class=\"bento-cell b-pay\"><span class=\"b-ico\">${icon('receipt')}</span><h3>Pagás como te quede cómodo</h3><p>Efectivo o transferencia, con factura A o B.</p>\n" +
  `      <div class="b-ticket" aria-hidden="true"><div class="tk-paper">
        <div class="tk-top"><span class="tk-co">MP GROUP S.R.L.</span><span class="tk-type"><i>A</i><i>B</i></span></div>
        <span class="tk-title">FACTURA</span>
        <span class="tk-line"></span><span class="tk-line tk-line--s"></span><span class="tk-line"></span>
        <div class="tk-pay"><span>Efectivo</span><span>Transferencia</span></div>
        <span class="tk-stamp">PAGADO</span>
      </div></div></div>`);
fs.writeFileSync('build.mjs', bm);

// 5. fx.js: el ticket aparece con el mouse, se queda un ratito y se va
ed('site/assets/js/fx.js', '  // ---------- Tarjetas que se inclinan hacia el cursor', `  // ---------- Bento "Pagás como te quede cómodo": sale un ticket de factura con el mouse, se queda un ratito y se va
  d.querySelectorAll('.b-pay').forEach(cell => {
    let t;
    const show = () => { clearTimeout(t); cell.classList.remove('tk-out'); cell.classList.add('tk-on'); };
    const hide = ms => { clearTimeout(t); t = setTimeout(() => { cell.classList.add('tk-out'); cell.classList.remove('tk-on'); }, ms); };
    cell.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(); });
    cell.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hide(1800); });
    if (!fine) {
      const vo = io(es => es.forEach(en => { if (en.isIntersecting) { vo.disconnect(); setTimeout(() => { show(); hide(3500); }, 500); } }), { threshold: .7 });
      if (vo) vo.observe(cell);
    }
  });

  // ---------- Tarjetas que se inclinan hacia el cursor`);

// 6. CSS
fs.appendFileSync('site/assets/css/fx.css', `
/* =====================================================================
   Pasada 7
   ===================================================================== */
/* ---------- Foto de la lista de equipos: más chica y al costado */
.peek{width:200px;transform:translate3d(var(--px,0),var(--py,0),0) rotate(-2deg);transform-origin:0 50%;scale:.85}
.peek.is-left{transform:translate3d(var(--px,0),var(--py,0),0) rotate(2deg);transform-origin:100% 50%}
.peek.on{scale:1}

/* ---------- Repuestos: una tuerca que gira (más rápido con el mouse) */
.b-parts .nut{animation:nut-spin 9s linear infinite;transition:rotate 1.4s cubic-bezier(.3,.7,.2,1)}
.b-parts:hover .nut{rotate:240deg}
@keyframes nut-spin{to{transform:rotate(360deg)}}

/* ---------- Pagás: ticket de factura */
.b-pay h3,.b-pay p{position:relative;z-index:1;max-width:calc(100% - 200px)}
.b-ticket{position:absolute;right:34px;bottom:-14px;width:168px;pointer-events:none;transform:translateY(105%) rotate(5deg);transition:transform .6s cubic-bezier(.5,0,.75,0)}
.b-pay.tk-on .b-ticket{transform:translateY(0) rotate(-3deg);transition:transform .9s cubic-bezier(.2,1.25,.35,1)}
.b-pay.tk-out .b-ticket{transform:translateY(105%) rotate(6deg)}
.tk-paper{position:relative;display:grid;gap:7px;padding:14px 14px 26px;background:#fff;border-radius:8px 8px 0 0;box-shadow:0 18px 36px -14px rgba(28,43,51,.45),0 0 0 1px var(--line)}
.tk-paper::after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:8px;background:linear-gradient(135deg,#fff 50%,transparent 50%) 0 0/12px 8px repeat-x,linear-gradient(225deg,#fff 50%,transparent 50%) 0 0/12px 8px repeat-x}
.tk-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.tk-co{font-size:.62rem;font-weight:800;letter-spacing:.06em;color:var(--slate)}
.tk-type{position:relative;width:28px;height:28px;border:2px solid var(--ink);border-radius:6px;display:grid;place-items:center;font-style:italic;font-weight:900;font-size:1.05rem;color:var(--ink)}
.tk-type i{grid-area:1/1;font-style:inherit}
.tk-type i:last-child{opacity:0}
.b-pay.tk-on .tk-type i:first-child{animation:tk-a 2.4s steps(1) infinite}
.b-pay.tk-on .tk-type i:last-child{animation:tk-b 2.4s steps(1) infinite}
@keyframes tk-a{50%{opacity:0}}
@keyframes tk-b{0%{opacity:0}50%{opacity:1}}
.tk-title{font-size:.72rem;font-weight:800;letter-spacing:.18em;color:var(--muted)}
.tk-line{height:6px;border-radius:3px;background:var(--enamel)}
.tk-line--s{width:62%}
.tk-pay{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}
.tk-pay span{padding:3px 7px;border-radius:999px;background:var(--teal-soft);color:var(--teal-deep);font-size:.62rem;font-weight:700}
.tk-stamp{position:absolute;right:10px;bottom:30px;padding:2px 8px;border:2px solid var(--wa);border-radius:6px;color:#16a34a;background:rgba(255,255,255,.85);font-size:.7rem;font-weight:900;letter-spacing:.12em;transform:rotate(-14deg) scale(1.6);opacity:0;transition:transform .35s cubic-bezier(.3,1.6,.5,1),opacity .2s}
.b-pay.tk-on .tk-stamp{opacity:1;transform:rotate(-14deg) scale(1);transition-delay:.75s}
@media (max-width:640px){
  .b-pay h3,.b-pay p{max-width:calc(100% - 128px)}
  .b-ticket{right:14px;width:120px}
  .tk-paper{padding:10px 10px 22px;gap:5px}
  .tk-pay{display:none}
}

/* ---------- "MP GROUP" del pie: que la P no quede cortada */
.footer-mark span{font-size:15.2vw;padding-right:.14em;margin-right:-.07em}
`);
console.log('ok');
