// Pasada 5: microinteracciones y detalles que no trae un sitio común.
// Todo lo que hay acá es decorativo o de ayuda: si este archivo no carga, el sitio funciona igual.
(() => {
const start = () => {
  const d = document, root = d.documentElement;
  // los efectos de acá los dispara la persona (mouse, clic) o son cortos: corren aunque el sistema tenga las animaciones apagadas
  const reduce = false;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const WA = 'a[href*="api.whatsapp.com"]';
  const ACT = 'a,button,label,summary,select,input,textarea,[role=button]';
  const mk = (tag, cls, html) => { const e = d.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const use = id => `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const io = (cb, o) => ('IntersectionObserver' in window ? new IntersectionObserver(cb, o) : null);
  const vibrate = ms => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* nada */ } };
  const push = o => { window.dataLayer = window.dataLayer || []; window.dataLayer.push(o); };
  const dark = el => !!el.closest('.section--ink, .cta, .footer, .display, .stack-card, .aside-card');

  // ---------- ¿La PC da? Si en los primeros segundos muchos cuadros tardan más de 34 ms, se pasa al modo liviano
  //            (sin malla, sin onda, sin luz del mouse, sin desenfoques ni inclinación de tarjetas)
  setTimeout(() => {
    let n = 0, slow = 0, last = performance.now();
    const t0 = performance.now();
    const probe = now => { if (now - last > 34) slow++; last = now; n++; if (n < 60 && now - t0 < 1500) requestAnimationFrame(probe); else if (slow > n * .3) root.classList.add("lite"); };
    requestAnimationFrame(probe);
  }, 1500);
  const lite = () => root.classList.contains('lite');

  // ---------- Capa de efectos de clic
  const layer = mk('div', 'fx-layer'); layer.setAttribute('aria-hidden', 'true'); d.body.append(layer);
  const spawn = (cls, x, y, html = '', life = 900, style = '') => {
    const e = mk('span', cls, html);
    e.style.cssText = `left:${x}px;top:${y}px;${style}`;
    layer.append(e);
    setTimeout(() => e.remove(), life);
    return e;
  };
  const burst = (x, y, { n = 8, cls = 'fx-bub', html = '', spread = 80, up = 50, life = 1100, arc = 1.3, colors } = {}) => {
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (Math.random() - .5) * Math.PI * arc;
      const dist = spread * (.55 + Math.random() * .7);
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - up * Math.random();
      const c = colors ? `--c:${colors[i % colors.length]};` : '';
      spawn(cls, x, y, typeof html === 'function' ? html(i) : html, life,
        `${c}--dx:${dx.toFixed(0)}px;--dy:${dy.toFixed(0)}px;--rot:${((Math.random() - .5) * 140).toFixed(0)}deg;--s:${(.65 + Math.random() * .55).toFixed(2)};animation-delay:${i * 16}ms`);
    }
  };

  // ---------- Avisos cortitos (abajo al centro)
  const tbox = mk('div', 'fx-toast'); tbox.setAttribute('role', 'status'); d.body.append(tbox);
  let tT, tC, lastToast = 0;
  const toast = (html, { ms = 3800, action } = {}) => {
    clearTimeout(tT); clearTimeout(tC);
    tbox.innerHTML = `<div class="fx-toast-in">${html}</div>`;
    if (action) {
      const b = mk('button', 'fx-toast-btn', action.label); b.type = 'button';
      b.addEventListener('click', () => action.run(b));
      tbox.firstChild.append(b);
    }
    tbox.classList.remove('on'); void tbox.offsetWidth; tbox.classList.add('on');
    lastToast = Date.now();
    tT = setTimeout(() => { tbox.classList.remove('on'); tC = setTimeout(() => { tbox.innerHTML = ''; }, 400); }, ms);
  };
  const copy = async (text, btn, done = 'Copiado') => {
    let ok = true;
    try { await navigator.clipboard.writeText(text); } catch (e) {
      const t = mk('textarea'); t.value = text; t.style.cssText = 'position:fixed;opacity:0'; d.body.append(t); t.select();
      try { ok = d.execCommand('copy'); } catch (er) { ok = false; } t.remove();
    }
    if (!btn) return ok;
    const prev = btn.innerHTML;
    btn.classList.add('is-done');
    btn.innerHTML = ok ? `${use('check')}<span>${done}</span>` : 'No se pudo copiar';
    setTimeout(() => { btn.classList.remove('is-done'); btn.innerHTML = prev; }, 1800);
    return ok;
  };

  // ---------- Clics: cada lugar responde distinto
  const telShow = a => (a.textContent.match(/\d[\d\s-]{6,}\d/) || [a.getAttribute('href').replace('tel:', '')])[0].trim();
  d.addEventListener('click', e => {
    const kb = e.detail === 0;
    const t = e.target;
    const hit = t.closest(ACT);
    let x = e.clientX, y = e.clientY;
    if (kb && hit) { const r = hit.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }

    // navegación interna: la página nueva se abre en círculo desde el punto del clic (ver head)
    const a = t.closest('a[href]');
    if (a && !a.target && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
      const u = new URL(a.href, location.href);
      if (u.origin === location.origin && !(u.pathname === location.pathname && u.hash)) {
        try { sessionStorage.setItem('mp-vt', JSON.stringify({ x: Math.round(x), y: Math.round(y), t: Date.now() })); } catch (er) { /* nada */ }
      }
    }
    if (reduce) {
      if (a && a.matches(WA) && Date.now() - lastToast > 4000) toast(`${use('wa')}Abriendo WhatsApp con tu mensaje listo`);
      return;
    }

    if (a && a.matches(WA)) {
      // WhatsApp: burbujas verdes que salen volando + aviso
      spawn('fx-ring', x, y, '', 700, '--c:#25d366;--to:6');
      burst(x, y, { n: 9, html: () => use('wa'), spread: 95, up: 70 });
      vibrate(14);
      if (Date.now() - lastToast > 4000) toast(`<span class="fx-typing" aria-hidden="true"><i></i><i></i><i></i></span>Abriendo WhatsApp con tu mensaje listo`);
      return;
    }
    if (a && a.href.startsWith('tel:')) {
      // Teléfono: ondas como de timbre y el ícono que vibra
      [0, 140, 280].forEach(dl => spawn('fx-ring fx-ring--soft', x, y, '', 1000, `--c:${dark(a) ? '#fff' : '#405965'};--to:7;animation-delay:${dl}ms`));
      const ic = a.querySelector('svg'); if (ic) { ic.classList.remove("fx-shake"); void ic.getBoundingClientRect(); ic.classList.add('fx-shake'); setTimeout(() => ic.classList.remove('fx-shake'), 800); }
      vibrate([10, 40, 10]);
      if (fine) {
        const n = telShow(a);
        toast(`${use('phone')}<span>Desde la compu, marcá el <b>${n}</b></span>`, { ms: 6000, action: { label: 'Copiar número', run: b => { copy(n, b); push({ event: 'phone_copy', page_path: location.pathname }); } } });
      }
      return;
    }
    if (a && a.href.startsWith('mailto:')) {
      burst(x, y, { n: 4, cls: 'fx-bub fx-bub--mail', html: () => use('mail'), spread: 70, up: 40, arc: .6 });
      if (fine) {
        const m = a.href.slice(7).split('?')[0];
        toast(`${use('mail')}<span>¿No se abrió tu correo? Escribinos a <b>${m}</b></span>`, { ms: 6000, action: { label: 'Copiar mail', run: b => { copy(m, b); push({ event: 'email_copy', page_path: location.pathname }); } } });
      }
      return;
    }
    if (hit) {
      // Cualquier otro control: un anillo chico del color de la zona
      spawn('fx-ring', x, y, '', 600, `--c:${dark(hit) ? 'rgba(255,255,255,.8)' : '#289eba'};--to:4`);
      if (hit.matches('.chip, .app-tile, .chat-chip')) vibrate(8);
      return;
    }
    // Fondo: una onda que empuja los puntos de la grilla y una marca de plano
    spawn('fx-mark', x, y, '', 900, `--c:${dark(t) ? 'rgba(127,211,230,.9)' : '#289eba'}`);
    window.dispatchEvent(new CustomEvent('mp:shock', { detail: { x, y } }));
  });

  // ---------- Mouse: círculo de luz tenue sobre el fondo (turquesa en lo claro, blanco en lo oscuro)
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
      cur.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      spot.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`;
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
      else if (t.closest(WA)) m = 'link';
      else if (t.closest('a[href^="tel:"]')) m = 'link';
      else if (t.closest('a[href^="mailto:"]')) m = 'link';
      else if (t.closest('.cov-map-canvas [data-n]')) m = 'pick';
      else if (t.closest('.appliance, .post-card, .product, .brand-word, a.bento-cell')) m = 'link';
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

  // ---------- Botones con borde: se llenan desde el lado por donde entra el mouse
  if (fine) {
    const at = (e, b) => { const r = b.getBoundingClientRect(); b.style.setProperty('--fx', `${e.clientX - r.left}px`); b.style.setProperty('--fy', `${e.clientY - r.top}px`); };
    d.addEventListener('pointerover', e => { const b = e.target.closest('.btn--line'); if (b && !b.contains(e.relatedTarget)) at(e, b); });
    d.addEventListener('pointerout', e => { const b = e.target.closest('.btn--line'); if (b && !b.contains(e.relatedTarget)) at(e, b); });
  }

  // ---------- Menú principal: una píldora que se desliza entre los ítems
  const nav = d.querySelector('.nav-list');
  if (nav && fine) {
    const pill = mk('span', 'fx-nav-pill'); pill.setAttribute('aria-hidden', 'true');
    nav.append(pill); nav.classList.add('fx-nav');
    const to = (el, instant) => {
      if (!el) { pill.classList.remove('on'); return; }
      const lr = nav.getBoundingClientRect(), r = el.getBoundingClientRect();
      if (instant) pill.style.transition = 'none';
      pill.style.width = `${r.width}px`; pill.style.height = `${r.height}px`;
      pill.style.transform = `translate(${(r.left - lr.left).toFixed(1)}px,${(r.top - lr.top).toFixed(1)}px)`;
      pill.classList.add('on');
      if (instant) { void pill.offsetWidth; pill.style.transition = ''; }
    };
    const current = () => nav.querySelector('.nav-item.is-open > .nav-link') || nav.querySelector('.nav-link[aria-current]');
    nav.addEventListener('pointerover', e => { const l = e.target.closest('.nav-link'); if (l) to(l, !pill.classList.contains('on')); });
    nav.addEventListener('pointerleave', () => setTimeout(() => to(current()), 160));
    to(current(), true);
    addEventListener('resize', () => to(current(), true), { passive: true });
  }

  // ---------- La camioneta recorre la página con el scroll (debajo de la cabecera)
  const header = d.querySelector('.header');
  if (header) {
    const wheel = cx => `<g class="v-wh"><circle cx="${cx}" cy="14.6" r="2.7"/><path d="M${cx} 12.4v4.4M${cx - 2.2} 14.6h4.4"/></g>`;
    const road = mk('div', 'fx-road', `<span class="fx-road-fill"></span><span class="fx-van"><svg viewBox="0 0 32 18"><path class="v-body" d="M2 4.6a2 2 0 0 1 2-2h15.4a2 2 0 0 1 1.7.9l3.7 5.4 3.6 1.1a2 2 0 0 1 1.4 1.9v2.4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/><path class="v-win" d="M19.7 4.5h-3v4.3h5.9z"/><rect class="v-stripe" x="2" y="9.6" width="15.6" height="1.7"/>${wheel(8)}${wheel(23.6)}</svg></span><span class="fx-hq" title="MP Group"><svg viewBox="0 0 16 16"><path d="M2.5 14.5V4.2L8.5 1.8v12.7M8.5 14.5V6.5h5v8M1 14.5h14"/><path class="w" d="M4.6 5.6h1.6M4.6 8.2h1.6M4.6 10.8h1.6M10.2 8.6h1.6M10.2 11.2h1.6"/></svg></span><span class="fx-home"><svg viewBox="-8 -8 16 16"><path d="M-6.5 0 0-6 6.5 0M-4.6-1.6v7.6h9.2v-7.6"/><path class="w" d="M-1.4 6v-3.4h2.8V6"/></svg></span>`);
    road.setAttribute('aria-hidden', 'true');
    header.append(road);
    const van = road.querySelector('.fx-van'), fill = road.querySelector('.fx-road-fill'), wheels = road.querySelectorAll('.v-wh');
    // las medidas se guardan y se actualizan solo cuando cambia el tamaño (leerlas en cada cuadro fuerza un layout)
    let raf = 0, last = scrollY, RW = 0, DH = 0, st = '', back = false;
    const measure = () => { RW = road.clientWidth; DH = root.scrollHeight - innerHeight; };
    const upd = () => {
      raf = 0;
      if (!RW) measure();
      const p = DH > 0 ? Math.min(1, Math.max(0, scrollY / DH)) : 0, x = 28 + p * (RW - 86);
      van.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      fill.style.transform = `scaleX(${((x + 2) / RW).toFixed(4)})`;
      const w = `${((scrollY * 1.6) % 360).toFixed(0)}deg`;
      wheels.forEach(g => { g.style.rotate = back ? `-${w}` : w; });
      const s2 = p < .004 ? 'is-start' : p > .996 ? 'is-end' : '';
      if (s2 !== st) { if (st) road.classList.remove(st); if (s2) road.classList.add(s2); st = s2; }
      if (scrollY !== last && (scrollY < last) !== back) { back = scrollY < last; road.classList.toggle('is-back', back); }
      last = scrollY;
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(() => { RW = 0; if (!raf) raf = requestAnimationFrame(upd); }).observe(d.body);
    else addEventListener('resize', () => { RW = 0; if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    raf = requestAnimationFrame(upd);
  }

  // ---------- Índice lateral de secciones (pantallas grandes)
  const RAIL = { 'ap-t': 'Equipos', 'bt-t': 'Por qué elegirnos', 'pr-t': 'Cómo es el service', 'rv-t': 'Reseñas', 'mk-t': 'Marcas', 'cob-t': 'Cobertura', 'faq-t': 'Preguntas', 'bl-t': 'Consejos' };
  const secs = [...d.querySelectorAll('main > section')].filter(s => s.matches('.hero, .page-hero') || s.querySelector('h2'));
  if (secs.length >= 4 && fine) {
    const short = s => {
      if (s.matches('.hero, .page-hero')) return 'Inicio';
      const h = s.querySelector('h2');
      if (RAIL[h.id]) return RAIL[h.id];
      if (s.getAttribute('aria-label') === 'Contacto') return 'Contacto';
      const t = h.textContent.trim();
      return t.length > 26 ? t.slice(0, 26).replace(/\s+\S*$/, '') + '…' : t;
    };
    const rail = mk('div', 'fx-rail'); rail.setAttribute('aria-hidden', 'true');
    const items = secs.map((s, i) => {
      const b = mk('button', 'fx-rail-i', `<span class="fx-rail-l"><b>${String(i + 1).padStart(2, '0')}</b>${short(s)}</span>`);
      b.type = 'button'; b.tabIndex = -1;
      b.addEventListener('click', () => s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }));
      rail.append(b);
      return b;
    });
    d.body.append(rail);
    let flash;
    const obs = io(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      const i = secs.indexOf(en.target);
      items.forEach((b, k) => b.classList.toggle('is-on', k === i));
      rail.classList.toggle('is-dark', en.target.matches('.section--ink'));
      rail.classList.add('show'); clearTimeout(flash);
      flash = setTimeout(() => rail.classList.remove('show'), 1500);
    }), { rootMargin: '-48% 0px -48% 0px' });
    if (obs) secs.forEach(s => obs.observe(s));
  }

  // ---------- Contadores tipo cuentakilómetros
  const odoObs = io(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('go'); odoObs.unobserve(en.target); } }), { threshold: .6 });
  if (odoObs && !reduce) d.querySelectorAll('[data-count]').forEach(el => {
    const v = el.dataset.count;
    const col = n => `<span class="odo-d"><span class="odo-s" style="--n:${+n + 10};--i:${0}">${'01234567890123456789'.split('').map(c => `<span>${c}</span>`).join('')}</span></span>`;
    el.innerHTML = `<span class="sr-only">${v}</span><span class="odo" aria-hidden="true">${[...v].map(col).join('')}</span>`;
    el.querySelectorAll('.odo-s').forEach((s, i) => s.style.setProperty('--i', i));
    odoObs.observe(el.querySelector('.odo'));
  });

  // ---------- Números de los pasos: se "decodifican" al entrar
  const scr = io(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    scr.unobserve(en.target);
    const el = en.target, final = el.textContent, t0 = performance.now();
    const tick = now => {
      const p = (now - t0) / 650;
      el.textContent = p >= 1 ? final : [...final].map((c, i) => (p > .5 + i * .2 ? c : String(Math.floor(Math.random() * 10)))).join('');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: .8 });
  if (scr && !reduce) d.querySelectorAll('.stack-n').forEach(el => scr.observe(el));

  // ---------- Armá tu consulta: manómetro de avance y vibración al elegir
  const form = d.getElementById('consulta');
  if (form) {
    const top = form.querySelector('.display-top');
    const ticks = [-90, -45, 0, 45, 90].map(a => { const r = a * Math.PI / 180; return `<line x1="${(24 + Math.sin(r) * 15.5).toFixed(1)}" y1="${(25 - Math.cos(r) * 15.5).toFixed(1)}" x2="${(24 + Math.sin(r) * 18.6).toFixed(1)}" y2="${(25 - Math.cos(r) * 18.6).toFixed(1)}"/>`; }).join('');
    const g = mk('span', 'fx-gauge', `<svg viewBox="0 0 48 28"><path class="g-track" d="M5 25a19 19 0 0 1 38 0"/><path class="g-fill" pathLength="1" d="M5 25a19 19 0 0 1 38 0"/><g class="g-ticks">${ticks}</g><line class="g-needle" x1="24" y1="25" x2="24" y2="11"/><circle class="g-hub" cx="24" cy="25" r="2.6"/></svg><span class="fx-gauge-t">0/3</span>`);
    g.setAttribute('aria-hidden', 'true');
    const mini = top && top.querySelector('[data-status-mini]');
    if (mini) {
      mini.before(g);
      const steps = form.querySelectorAll('.step');
      const upd = () => {
        const n = form.querySelectorAll('.step.is-done').length;
        g.style.setProperty('--g', (n / 3).toFixed(3));
        g.lastChild.textContent = n === 3 ? 'Listo' : `${n}/3`;
        g.classList.toggle('is-full', n === 3);
      };
      const mo = new MutationObserver(upd);
      steps.forEach(s => mo.observe(s, { attributes: true, attributeFilter: ['class'] }));
      upd();
    }
  }

  // ---------- Bento "Visita en el día": la camioneta va hasta la casa cuando pasás el mouse (en el celular, al verla)
  d.querySelectorAll('.b-visit').forEach(cell => {
    const path = cell.querySelector('.b-route-line'), van = cell.querySelector('.b-van');
    if (!path || !van || !path.getTotalLength) return;
    const wheels = van.querySelectorAll('.bv-wh');
    const L = path.getTotalLength();
    let t = 0, tw = null, raf = 0;
    const place = () => {
      const at = t * L, p = path.getPointAtLength(at), a = path.getPointAtLength(Math.max(0, at - 1.5)), b = path.getPointAtLength(Math.min(L, at + 1.5));
      van.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(Math.atan2(b.y - a.y, b.x - a.x) * 57.2958).toFixed(1)}) scale(.9)`);
      wheels.forEach(w => w.setAttribute('transform', `rotate(${((at * 13.6) % 360).toFixed(0)})`));
    };
    const step = now => {
      const k = Math.min(1, (now - tw.t0) / tw.dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      t = tw.from + (tw.to - tw.from) * e; place();
      cell.classList.toggle('is-arrived', t > .995);
      raf = k < 1 ? requestAnimationFrame(step) : 0;
    };
    const go = to => {
      if (Math.abs(to - t) < .001) return;
      tw = { from: t, to, t0: performance.now(), dur: Math.abs(to - t) * (to > t ? 1700 : 1100) };
      cell.classList.toggle('is-driving', to > t);
      if (!raf) raf = requestAnimationFrame(step);
    };
    cell.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') go(1); });
    cell.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') go(0); });
    if (!fine) {
      const vo = io(es => es.forEach(en => { if (en.isIntersecting) { vo.disconnect(); setTimeout(() => go(1), 400); } }), { threshold: .7 });
      if (vo) vo.observe(cell);
    }
  });

  // ---------- Bento "Pagás como te quede cómodo": sale un ticket de factura con el mouse, se queda un ratito y se va
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

  // ---------- Tarjetas que se inclinan hacia el cursor
  if (fine && !reduce) d.querySelectorAll('.post-card, .product, a.contact-card').forEach(c => {
    c.classList.add('fx-tilt');
    c.addEventListener('pointermove', e => {
      if (lite()) return;
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-4px)`;
    });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });

  // ---------- "MP GROUP" gigante del pie: las letras se ensanchan cerca del mouse (tipografía variable)
  const markSpan = d.querySelector('.footer-mark span');
  const foot = d.querySelector('.footer');
  if (markSpan && foot && fine && !reduce) {
    markSpan.innerHTML = [...markSpan.textContent].map(ch => (ch === ' ' ? ' ' : `<i>${ch}</i>`)).join('');
    const L = [...markSpan.querySelectorAll('i')];
    const cur = L.map(() => ({ w: 76, g: 900, l: 0 }));
    let centers = [], mx = 0, active = false, raf = 0;
    const measure = () => { centers = L.map(l => { const r = l.getBoundingClientRect(); return r.left + r.width / 2; }); };
    const loop = () => {
      let moving = false;
      L.forEach((l, i) => {
        const dist = Math.abs(mx - centers[i]), k = active ? Math.exp(-(dist * dist) / (2 * 125 * 125)) : 0;
        const tw = active ? 63 + 46 * k : 76, tg = active ? 560 + 340 * k : 900, tl = k;
        const c = cur[i];
        c.w += (tw - c.w) * .16; c.g += (tg - c.g) * .16; c.l += (tl - c.l) * .16;
        if (Math.abs(tw - c.w) > .2 || Math.abs(tg - c.g) > 2) moving = true;
        l.style.fontVariationSettings = `"wdth" ${c.w.toFixed(1)}, "wght" ${c.g.toFixed(0)}`;
        l.style.setProperty('--lit', c.l.toFixed(3));
      });
      raf = moving ? requestAnimationFrame(loop) : 0;
    };
    foot.addEventListener('pointerenter', () => { measure(); active = true; });
    foot.addEventListener('pointermove', e => { mx = e.clientX; active = true; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    foot.addEventListener('pointerleave', () => { active = false; if (!raf) raf = requestAnimationFrame(loop); });
  }

  // ---------- Copiar el mail sin abrir el correo
  d.querySelectorAll('.footer-contact a[href^="mailto:"], .company-card a[href^="mailto:"]').forEach(a => {
    const b = mk('button', 'fx-copy', '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Copiar</span>');
    b.type = 'button'; b.setAttribute('aria-label', 'Copiar el mail');
    b.addEventListener('click', e => { e.stopPropagation(); copy(a.href.slice(7), b); push({ event: 'email_copy', page_path: location.pathname }); });
    a.after(b);
  });

  // ---------- Si te vas a otra pestaña, la pestaña te llama
  const title0 = d.title;
  d.addEventListener('visibilitychange', () => { d.title = d.hidden ? '¿Seguimos? Te esperamos · MP Group' : title0; });

  // ---------- 404: la página está "rota" y se arregla ajustando tres tornillos
  const nf = d.querySelector('.notfound');
  if (nf) {
    const h1 = nf.querySelector('h1');
    const plate = mk('div', 'nf-plate'); h1.before(plate); plate.append(h1);
    const hintP = mk('p', 'nf-hint', `${use('tool')}Esta página se rompió. Ajustá los 3 tornillos y queda como nueva.`);
    plate.after(hintP);
    nf.classList.add('nf-broken');
    let fixed = 0;
    [['-12px', '-10px'], ['calc(100% - 26px)', '-18px'], ['58%', 'calc(100% - 10px)']].forEach(([l, tp], i) => {
      const s = mk('button', 'nf-screw'); s.type = 'button';
      s.setAttribute('aria-label', `Ajustar el tornillo ${i + 1} de 3`);
      s.style.left = l; s.style.top = tp;
      s.addEventListener('click', e => {
        if (s.classList.contains('is-in')) return;
        s.classList.add('is-in'); s.disabled = true; fixed++;
        nf.style.setProperty('--fix', fixed);
        vibrate(12);
        if (fixed === 3) {
          nf.classList.add('nf-fixed');
          const r = plate.getBoundingClientRect();
          if (!reduce) burst(r.left + r.width / 2, r.top + r.height / 2, { n: 26, cls: 'fx-conf', spread: 260, up: 120, arc: 2, life: 1600, colors: ['#289eba', '#405965', '#25d366', '#f5b400', '#7fd3e6'] });
          hintP.innerHTML = `${use('check')}¡Arreglado! Así de rápido trabajamos. Elegí qué equipo hay que reparar:`;
          e.stopPropagation();
        }
      });
      plate.append(s);
    });
  }
};
// site.js baja este archivo recién con la primera interacción del usuario
if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 700 }); else setTimeout(start, 60);
})();
