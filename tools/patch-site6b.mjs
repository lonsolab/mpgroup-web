import fs from 'fs';
const F = 'site/assets/js/site.js';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('No encontrado: ' + a.slice(0, 80)); s = s.split(a).join(b); };
// que "desde las 9" no quede partido en dos renglones
rep('`${dot(true)}Fuera de horario: escribinos igual y te respondemos ${status.next}`', '`${dot(true)}Fuera de horario: escribinos igual y te respondemos <span class="nw">${status.next}</span>`');
rep('`${dot(true)}Fuera de horario. Te respondemos ${status.next}.`', '`${dot(true)}Fuera de horario. Te respondemos <span class="nw">${status.next}</span>.`');
rep('  // ---------- Tuerca (el robot', `  // ---------- Reseñas de Google: carrusel con flechas, puntos y avance solo (se frena al pasar el mouse o tocar)
  d.querySelectorAll('[data-greviews]').forEach(box => {
    const vp = box.querySelector('.gr-viewport'), cards = [...box.querySelectorAll('.gr-card')], dots = box.querySelector('.gr-dots');
    const perView = () => Math.max(1, Math.round(vp.clientWidth / cards[0].getBoundingClientRect().width));
    const pages = () => Math.max(1, cards.length - perView() + 1);
    const idx = () => Math.round(vp.scrollLeft / (cards[1].offsetLeft - cards[0].offsetLeft));
    const goTo = i => { const n = pages(); i = (i + n) % n; vp.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' }); };
    const paint = () => {
      const n = pages(), cur = Math.min(n - 1, idx());
      if (dots.children.length !== n) dots.innerHTML = '<i></i>'.repeat(n);
      [...dots.children].forEach((dt, k) => dt.classList.toggle('on', k === cur));
    };
    box.querySelectorAll('[data-gr]').forEach(b => b.addEventListener('click', () => { goTo(idx() + +b.dataset.gr); hold = Date.now(); }));
    let raf = 0, hold = 0, over = false;
    vp.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); }); }, { passive: true });
    box.addEventListener('pointerenter', () => { over = true; });
    box.addEventListener('pointerleave', () => { over = false; });
    box.addEventListener('focusin', () => { over = true; });
    box.addEventListener('focusout', () => { over = false; });
    vp.addEventListener('touchstart', () => { hold = Date.now(); }, { passive: true });
    let visible = false;
    const vis = io(es => es.forEach(en => { visible = en.isIntersecting; }), { threshold: .3 });
    if (vis) vis.observe(box);
    setInterval(() => { if (visible && !over && Date.now() - hold > 9000 && !d.hidden) goTo(idx() + 1); }, 5500);
    addEventListener('resize', paint, { passive: true });
    paint();
  });

  // ---------- Tuerca (el robot`);
fs.writeFileSync(F, s);
console.log('ok');
