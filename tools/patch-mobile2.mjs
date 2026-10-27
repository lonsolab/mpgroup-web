// Pasada 11: celular rehecho (menos largo, menos gigante): carruseles deslizables, grilla de íconos, listas plegables,
// tipografía más contenida y barra inferior que no se rompe en iPhone
import fs from 'fs';
const ed = (F, a, b) => { let s = fs.readFileSync(F, 'utf8'); if (!s.includes(a)) throw new Error(F + ': ' + a.slice(0, 80)); s = s.split(a).join(b); fs.writeFileSync(F, s); };

// ---------- JS: puntos de los carruseles, barrios plegados y "qué reparamos" con "ver más"
ed('site/assets/js/site.js', '  // ---------- Pie en el celular:', `  // ---------- Celular: las listas largas pasan a carruseles con puntitos, los barrios y "qué reparamos" se pliegan
  if (window.matchMedia('(max-width: 640px)').matches) {
    d.querySelectorAll('.bento, .stack, .posts, .products, .tips, .faults').forEach(rail => {
      const kids = [...rail.children];
      if (kids.length < 2) return;
      rail.classList.add('m-rail');
      const dots = d.createElement('div'); dots.className = 'm-dots'; dots.setAttribute('aria-hidden', 'true');
      dots.innerHTML = '<i></i>'.repeat(kids.length);
      rail.after(dots);
      let raf = 0;
      const paint = () => {
        raf = 0;
        const step = kids[1].offsetLeft - kids[0].offsetLeft || 1;
        const k = Math.min(kids.length - 1, Math.round(rail.scrollLeft / step));
        [...dots.children].forEach((dt, j) => dt.classList.toggle('on', j === k));
      };
      rail.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
      dots.firstChild.classList.add('on');
    });
    const fold = (el, label, extra = '') => {
      const b = d.createElement('button'); b.type = 'button'; b.className = 'm-fold' + extra; b.setAttribute('aria-expanded', 'false');
      b.innerHTML = \`<span>\${label}</span><svg class="ico" aria-hidden="true"><use href="#i-chevron"/></svg>\`;
      el.classList.add('m-folded'); el.before(b);
      b.addEventListener('click', () => { const v = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', v); el.classList.toggle('m-open', v); });
    };
    d.querySelectorAll('.zones').forEach(z => fold(z, 'Ver la lista de barrios'));
    d.querySelectorAll('.checks').forEach(c => { if (c.children.length > 4) { c.classList.add('m-more'); const b = d.createElement('button'); b.type = 'button'; b.className = 'm-fold m-fold--more'; b.innerHTML = '<span>Ver todo lo que reparamos</span><svg class="ico" aria-hidden="true"><use href="#i-chevron"/></svg>'; c.after(b); b.addEventListener('click', () => { c.classList.add('m-open'); b.remove(); }); } });
  }

  // ---------- Pie en el celular:`);

// ---------- CSS
fs.appendFileSync('site/assets/css/fx.css', `
/* =====================================================================
   Pasada 11: celular rehecho
   ===================================================================== */
@media (max-width:640px){
  /* tipografía y aire: más contenido por pantalla */
  body{font-size:16px;line-height:1.55}
  h1{font-size:2rem;line-height:1.05}
  h2{font-size:1.62rem}
  h3{font-size:1.12rem}
  .lead{font-size:1rem}
  .section{padding-block:44px}
  .section-head{margin-bottom:18px}
  .section-head p,.split-head p{font-size:.95rem;margin-top:6px}
  .kicker{font-size:.85rem;margin-bottom:.4rem}

  /* hero compacto */
  .hero .wrap{gap:26px}
  .hero-copy .lead{margin-top:12px}
  .hero-cta{margin-top:18px;gap:10px}
  .hero-cta .btn{min-height:50px}
  .hero .facts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}
  .hero .facts li{font-size:.84rem;line-height:1.25;padding:9px 10px;border-radius:12px;background:#fff;border:1px solid var(--line);gap:7px;align-items:center}
  .hero .facts .ico{width:18px;height:18px;flex:none}
  .hero .rating{margin-top:14px;font-size:.86rem}
  .hero-alt{display:none}

  /* electrodomésticos: grilla de íconos de 3 columnas (antes 9 tarjetas largas) */
  .appliances{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;border:0}
  .appliance{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:8px;padding:14px 6px 12px;border:1px solid var(--line)!important;border-radius:16px;background:#fff;text-align:center;min-height:0}
  .appliance h3{font-size:.86rem;line-height:1.15;font-style:normal;font-stretch:100%;font-weight:650}
  .appliance p,.appliance .textlink{display:none}
  .appliance-ico{width:46px;height:46px;margin:0}
  .appliance-ico .ico{width:26px;height:26px}

  /* carruseles deslizables (con la siguiente tarjeta asomando) */
  .m-rail{display:flex!important;grid-template-columns:none!important;grid-template-areas:none!important;gap:12px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;margin-inline:calc(-1 * var(--gutter));padding:4px var(--gutter) 6px;scroll-padding-inline:var(--gutter);scrollbar-width:none;list-style:none}
  .m-rail::-webkit-scrollbar{display:none}
  .m-rail>*{flex:0 0 82%;scroll-snap-align:start;animation:none!important;opacity:1!important;transform:none!important;position:relative!important;top:auto!important;margin:0!important}
  .m-dots{display:flex;justify-content:center;gap:6px;margin-top:12px}
  .m-dots i{width:7px;height:7px;border-radius:4px;background:var(--line);transition:width .3s,background-color .3s}
  .m-dots i.on{width:20px;background:var(--teal)}
  .section--ink .m-dots i{background:rgba(255,255,255,.22)}
  .section--ink .m-dots i.on{background:#7fd3e6}

  /* bento como carrusel */
  .bento.m-rail>*{min-height:230px;flex-basis:78%}
  .bento.m-rail .b-years{flex-basis:86%}
  .bento.m-rail .b-parts,.bento.m-rail .b-warranty{display:flex;flex-direction:column;justify-content:flex-end;gap:6px}
  .bento.m-rail .b-parts .b-ico,.bento.m-rail .b-warranty .b-ico{margin-bottom:auto}
  .bento .b-big{font-size:4.6rem}

  /* cómo es el service: sin la foto, pasos deslizables */
  .process2 .process-photo{display:none}
  .stack.m-rail>*{flex-basis:80%;min-height:0;padding:20px}
  .stack-n{font-size:2.4rem}

  /* tarjetas de los servicios y marcas más bajas */
  .faults.m-rail>*{flex-basis:80%}
  .fault{padding:16px}
  .products.m-rail>*{flex-basis:70%}
  .product-media{height:150px;padding:12px}
  .product-media img{max-height:124px}
  .product h3{font-size:1.02rem}
  .product p{font-size:.88rem}
  .tips.m-rail>*{flex-basis:80%;padding:18px}
  .posts.m-rail>*{flex-basis:78%}
  .post-media{aspect-ratio:16/10}
  .post-card h3{font-size:1.02rem}
  .post-card p{display:none}

  /* "qué reparamos": primero 4 y "ver todo" */
  .checks{grid-template-columns:1fr;gap:0}
  .checks li{padding:12px 0}
  .checks.m-more:not(.m-open) li:nth-child(n+5){display:none}

  /* plegables */
  .m-fold{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:48px;margin:6px 0 10px;padding:0 16px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--ink);font:inherit;font-weight:650;font-size:.95rem;cursor:pointer}
  .m-fold .ico{width:18px;height:18px;transition:transform .25s}
  .m-fold[aria-expanded=true] .ico{transform:rotate(180deg)}
  .m-fold--more{justify-content:center;gap:8px;margin-top:10px}
  .m-folded:not(.m-open){display:none}

  /* cobertura y CTA más cortos */
  .coverage{gap:18px}
  .office{padding:16px}
  .cta{padding:26px 20px}
  .cta h2{font-size:1.55rem}
  .faq summary{font-size:.98rem;padding-block:14px}

  /* reseñas: tarjetas más bajas */
  .gr-card{padding:16px}
  .gr-card p{font-size:.9rem}

  /* barra inferior: entra siempre (en iPhone se pisaba) */
  .mobile-bar{grid-template-columns:auto auto minmax(0,1fr)!important;gap:8px!important;padding:8px 10px calc(8px + env(safe-area-inset-bottom))!important}
  .mobile-bar .btn{min-height:48px!important;padding:0 14px!important;font-size:.95rem;gap:7px}
  .mobile-bar .btn .ico,.mobile-bar .bot{width:22px;height:22px}
  .mobile-bar .hide-xs{display:none!important}
  .mobile-bar .btn--wa{min-width:0;overflow:hidden}
}
@media (max-width:360px){
  .mobile-bar .btn{padding:0 11px!important;font-size:.9rem}
  .appliance h3{font-size:.8rem}
}
`);
console.log('ok');
