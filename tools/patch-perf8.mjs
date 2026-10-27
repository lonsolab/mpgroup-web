// Pasada 8b: scroll más liviano (camioneta por transform, sin inclinar cintas, malla quieta al hacer scroll)
import fs from 'fs';
const ed = (F, a, b) => { let s = fs.readFileSync(F, 'utf8'); if (!s.includes(a)) throw new Error(F + ': ' + a.slice(0, 80)); s = s.split(a).join(b); fs.writeFileSync(F, s); };

// 1. Camioneta: se mueve con transform (no con left, que repintaba toda la cabecera en cada cuadro)
ed('site/assets/js/fx.js', `    let raf = 0, last = scrollY;
    const upd = () => {
      raf = 0;
      const h = root.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
      road.style.setProperty('--sp', p.toFixed(4));
      road.style.setProperty('--wh', \`\${(scrollY * 1.6) % 360}deg\`);
      road.classList.toggle('is-start', p < .004);
      road.classList.toggle('is-end', p > .996);
      if (scrollY !== last) road.classList.toggle('is-back', scrollY < last);
      last = scrollY;
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    raf = requestAnimationFrame(upd);`,
`    const van = road.querySelector('.fx-van'), fill = road.querySelector('.fx-road-fill'), wheels = road.querySelectorAll('.v-wh');
    // las medidas se guardan y se actualizan solo cuando cambia el tamaño (leerlas en cada cuadro fuerza un layout)
    let raf = 0, last = scrollY, RW = 0, DH = 0, st = '', back = false;
    const measure = () => { RW = road.clientWidth; DH = root.scrollHeight - innerHeight; };
    const upd = () => {
      raf = 0;
      if (!RW) measure();
      const p = DH > 0 ? Math.min(1, Math.max(0, scrollY / DH)) : 0, x = 28 + p * (RW - 86);
      van.style.transform = \`translate3d(\${x.toFixed(1)}px,0,0)\`;
      fill.style.transform = \`scaleX(\${((x + 2) / RW).toFixed(4)})\`;
      const w = \`\${((scrollY * 1.6) % 360).toFixed(0)}deg\`;
      wheels.forEach(g => { g.style.rotate = back ? \`-\${w}\` : w; });
      const s2 = p < .004 ? 'is-start' : p > .996 ? 'is-end' : '';
      if (s2 !== st) { if (st) road.classList.remove(st); if (s2) road.classList.add(s2); st = s2; }
      if (scrollY !== last && (scrollY < last) !== back) { back = scrollY < last; road.classList.toggle('is-back', back); }
      last = scrollY;
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(() => { RW = 0; if (!raf) raf = requestAnimationFrame(upd); }).observe(d.body);
    else addEventListener('resize', () => { RW = 0; if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    raf = requestAnimationFrame(upd);`);

// 2. Cintas: sin la inclinación según la velocidad del scroll (recalculaba estilos en cada cuadro)
const S = 'site/assets/js/site.js';
let s = fs.readFileSync(S, 'utf8');
const a = s.indexOf('  // Marquees que se inclinan');
const b = s.indexOf('  // Notas del blog: progreso de lectura');
if (a < 0 || b < 0) throw new Error('skew');
s = s.slice(0, a) + s.slice(b);
fs.writeFileSync(S, s);

// 3. Fondo: mientras hacés scroll, la malla del mouse se apaga (vuelve al mover el mouse)
ed('site/assets/js/bg.js', `    sraf = requestAnimationFrame(() => { sraf = 0; par(); if (mouse.a > .01) kick(); });`,
  `    sraf = requestAnimationFrame(() => { sraf = 0; par(); if (mouse.ta > 0) { mouse.ta = 0; kick(); } });`);

// 4. CSS
fs.appendFileSync('site/assets/css/fx.css', `
/* ---------- Scroll liviano: la camioneta y la línea van por transform */
.fx-van{left:0;will-change:transform}
.fx-road-fill{right:0;width:auto;transform-origin:0 50%;will-change:transform}
.v-wh{rotate:none}
.marquee-row,.brand-run{transform:none;will-change:auto}
/* modo liviano: sin animaciones atadas al scroll */
.lite :is(.appliance,.fault,.product,.post-card,.tip,.bento-cell,.checks li,.contact-card,.faq details,.zones>div,.office,.page-hero-media img,.process-photo img,.article-cover img,.b-years img,.manifesto span,.footer-mark span,.stack-card){animation:none!important}
`);
console.log('ok');
