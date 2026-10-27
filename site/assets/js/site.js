(() => {
// Todo arranca después del primer cuadro: así no se fuerza un layout de la página entera antes de pintar
const run = () => {
  const WA = '5491152490898';
  // api.whatsapp.com (no wa.me): el GTM de MP Group mide la conversión de Ads con clics a esa URL
  const waUrl = t => `https://api.whatsapp.com/send?phone=${WA}&text=${encodeURIComponent(t)}`;
  const d = document;
  // Con las animaciones del sistema apagadas solo se frena lo que va atado al scroll (inclinación de las cintas); el resto es suave o lo dispara la persona
  const reduceScroll = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduce = false;
  const io = (cb, opts) => ('IntersectionObserver' in window ? new IntersectionObserver(cb, opts) : null);
  d.documentElement.classList.add('js');

  // ---------- Cabecera con borde al hacer scroll
  const header = d.querySelector('.header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Menús desplegables (hover en escritorio, clic y teclado siempre)
  d.querySelectorAll('.nav-item[data-menu]').forEach(item => {
    const btn = item.querySelector('.nav-link');
    let t;
    const open = v => { item.classList.toggle('is-open', v); btn.setAttribute('aria-expanded', v); };
    item.addEventListener('mouseenter', () => { clearTimeout(t); open(true); });
    item.addEventListener('mouseleave', () => { t = setTimeout(() => open(false), 140); });
    btn.addEventListener('click', () => open(!item.classList.contains('is-open')));
    item.addEventListener('keydown', e => { if (e.key === 'Escape') { open(false); btn.focus(); } });
    item.addEventListener('focusout', e => { if (!item.contains(e.relatedTarget)) open(false); });
  });

  // ---------- Menú móvil: el resto de la página queda inerte mientras está abierto
  const drawer = d.getElementById('drawer');
  const menuBtn = d.querySelector('.header .menu-btn');
  if (drawer && menuBtn) {
    const outside = [...d.body.children].filter(el => el !== drawer && el.tagName !== 'SCRIPT');
    const setOpen = v => {
      drawer.classList.toggle('is-open', v);
      menuBtn.setAttribute('aria-expanded', v);
      d.body.style.overflow = v ? 'hidden' : '';
      outside.forEach(el => { el.inert = v; });
      if (v) setTimeout(() => drawer.querySelector('.drawer-close').focus(), 40); else menuBtn.focus();
    };
    menuBtn.addEventListener('click', () => setOpen(true));
    drawer.querySelector('.drawer-close').addEventListener('click', () => setOpen(false));
    drawer.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }

  // ---------- Medición: cada clic a WhatsApp, teléfono o mail va al dataLayer con el botón de origen
  window.dataLayer = window.dataLayer || [];
  // UTM de los anuncios (los arma Amir): se guardan en la visita y viajan al final del mensaje de WhatsApp
  // como "Ref: fuente/campaña", así en el CRM se ve de qué anuncio llegó cada consulta
  const utm = (() => {
    const q = new URLSearchParams(location.search), k = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'gclid'];
    let v = Object.fromEntries(k.filter(x => q.get(x)).map(x => [x, q.get(x).slice(0, 60)]));
    try { if (Object.keys(v).length) sessionStorage.setItem('mp-utm', JSON.stringify(v)); else v = JSON.parse(sessionStorage.getItem('mp-utm') || '{}'); } catch (e) { /* nada */ }
    return v;
  })();
  const ref = utm.utm_source || utm.utm_campaign ? [utm.utm_source, utm.utm_campaign].filter(Boolean).join('/') : (utm.gclid ? 'google-ads' : '');
  d.addEventListener('click', e => {
    const a = e.target.closest('a[href*="api.whatsapp.com"], a[href^="tel:"], a[href^="mailto:"]');
    if (!a) return;
    const type = a.href.includes('whatsapp') ? 'whatsapp_click' : a.href.startsWith('tel:') ? 'phone_click' : 'email_click';
    if (type === 'whatsapp_click' && ref) {
      const u = new URL(a.href), t = u.searchParams.get('text') || '';
      // %20 y no "+": así lo arma el resto del sitio y lo lee bien WhatsApp
      if (!t.includes('Ref: ')) a.href = `https://api.whatsapp.com/send?phone=${u.searchParams.get('phone')}&text=${encodeURIComponent(`${t}\n\n(Ref: ${ref})`)}`;
    }
    window.dataLayer.push({ event: type, cta_location: a.dataset.cta || 'sin-etiqueta', page_path: location.pathname, ...utm });
  }, true);

  // ---------- Arcos del hero
  const arcs = d.querySelector('.hero-arcs');
  if (arcs) requestAnimationFrame(() => setTimeout(() => arcs.classList.add('is-in'), 80));

  // ---------- Estado de atención con la hora de Argentina (L-V 9-18, sáb 9-15)
  const status = (() => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).map(p => [p.type, p.value]));
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const h = +parts.hour;
    const close = day === 6 ? 15 : day === 0 ? 0 : 18;
    const open = day !== 0 && h >= 9 && h < close;
    let next = '';
    if (!open) {
      if (day !== 0 && h < 9) next = 'hoy desde las 9';
      else next = (day === 6 || day === 0) ? (day === 0 ? 'mañana desde las 9' : 'el lunes desde las 9') : 'mañana desde las 9';
    }
    return { open, next };
  })();
  const dot = off => `<span class="status-dot${off ? ' is-off' : ''}"></span>`;
  d.querySelectorAll('[data-status]').forEach(el => {
    el.innerHTML = status.open ? `${dot()}<span>Estamos atendiendo ahora</span>` : `${dot(true)}<span>Fuera de horario: escribinos igual y te respondemos <span class="nw">${status.next}</span></span>`;
  });
  d.querySelectorAll('[data-status-note]').forEach(el => {
    el.innerHTML = status.open ? `${dot()}<span>Estamos atendiendo ahora.</span>` : `${dot(true)}<span>Fuera de horario. Te respondemos <span class="nw">${status.next}</span>.</span>`;
  });
  d.querySelectorAll('[data-status-mini]').forEach(el => {
    el.classList.toggle('is-off', !status.open);
    el.innerHTML = status.open ? `${dot()}Atendiendo` : `${dot(true)}Fuera de horario`;
  });
  d.querySelectorAll('[data-status-dot]').forEach(el => el.classList.toggle('is-off', !status.open));

  // ---------- Títulos que se revelan al entrar en pantalla
  const heads = d.querySelectorAll('.section-head h2, .cta h2, .two-col .section-head h2');
  const revealObs = io(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealObs.unobserve(en.target); } }), { rootMargin: '0px 0px -12% 0px' });
  if (revealObs && !reduce) heads.forEach(h => { if (h.getBoundingClientRect().top > window.innerHeight) { h.classList.add('rv-h'); revealObs.observe(h); } });

  // ---------- Contadores: los anima fx.js (cuentakilómetros)

  // ---------- Pasos: la línea se llena con el scroll
  const steps = d.querySelector('[data-steps]');
  if (steps) {
    const items = [...steps.children];
    let raf = 0;
    const upd = () => {
      raf = 0;
      const r = steps.getBoundingClientRect(), mid = window.innerHeight * .62;
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const tops = items.map(li => li.getBoundingClientRect().top);
      const p = Math.max(0, Math.min(1, (mid - r.top - 42) / (r.height - 84)));
      steps.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
      items.forEach((li, k) => li.classList.toggle('on', tops[k] + 22 < mid || reduce));
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    upd();
  }

  // ---------- CTA: luz que sigue al cursor
  d.querySelectorAll('[data-spot]').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  // ---------- Mapa de cobertura: se baja cuando el bloque se acerca y se puede tocar cada barrio
  d.querySelectorAll('[data-map]').forEach(box => {
    const canvas = box.querySelector('.cov-map-canvas');
    const hint = box.querySelector('.cov-card-hint');
    const hit = box.querySelector('.cov-card-hit');
    const card = box.querySelector('.cov-card');
    const name = box.querySelector('.cov-card-name');
    const go = hit.querySelector('a');
    let loaded = false;
    const select = (path, sticky) => {
      box.querySelectorAll('.on').forEach(p => p.classList.remove('on'));
      if (!path) return;
      path.classList.add('on');
      const n = path.dataset.n, z = path.dataset.z;
      name.textContent = z === 'Zona Norte' ? `${n}, Zona Norte` : n;
      go.href = waUrl(`Hola MP Group, estoy en ${n}${z === 'Zona Norte' ? ' (Zona Norte)' : ''} y necesito un service.`);
      hint.hidden = true; hit.hidden = false;
      if (sticky) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
    };
    const load = () => {
      if (loaded) return; loaded = true;
      fetch('/assets/mapa.svg').then(r => r.text()).then(svgText => {
        canvas.innerHTML = svgText;
        const svg = canvas.querySelector('svg');
        const show = io(es => es.forEach(en => { if (en.isIntersecting) { svg.classList.add('in'); show.disconnect(); } }), { threshold: .3 });
        if (show && !reduce) show.observe(svg); else svg.classList.add('in');
        let picked = null;
        svg.addEventListener('pointerover', e => { const p = e.target.closest('[data-n]'); if (p && e.pointerType === 'mouse') select(p, false); });
        svg.addEventListener('pointerleave', () => { select(picked, false); if (!picked) { hint.hidden = false; hit.hidden = true; } });
        svg.addEventListener('click', e => { const p = e.target.closest('[data-n]'); if (p) { picked = p; select(p, true); } });
      }).catch(() => { box.hidden = true; });
    };
    const near = io(es => es.forEach(en => { if (en.isIntersecting) { load(); near.disconnect(); } }), { rootMargin: '500px 0px' });
    if (near) near.observe(box); else load();
  });

  // ---------- Reseñas de Google: carrusel con flechas, puntos y avance solo (se frena al pasar el mouse o tocar)
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
    // los puntos se arman recién cuando el carrusel se acerca (medir antes fuerza un layout al cargar)
    const vis = io(es => es.forEach(en => { visible = en.isIntersecting; if (visible && !dots.children.length) paint(); }), { threshold: .3 });
    if (vis) vis.observe(box);
    setInterval(() => { if (visible && !over && Date.now() - hold > 9000 && !d.hidden) goTo(idx() + 1); }, 5500);
    addEventListener('resize', paint, { passive: true });
    if (!vis) paint();
  });

  // ---------- Celular: las listas largas pasan a carruseles con puntitos, los barrios y "qué reparamos" se pliegan
  if (window.matchMedia('(max-width: 640px)').matches) {
    d.querySelectorAll('.bento, .stack, .posts, .products, .tips, .faults, .rgal').forEach(rail => {
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
      b.innerHTML = `<span>${label}</span><svg class="ico" aria-hidden="true"><use href="#i-chevron"/></svg>`;
      el.classList.add('m-folded'); el.before(b);
      b.addEventListener('click', () => { const v = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', v); el.classList.toggle('m-open', v); });
    };
    d.querySelectorAll('.zones').forEach(z => fold(z, 'Ver la lista de barrios'));
    d.querySelectorAll('.checks').forEach(c => { if (c.children.length > 4) { c.classList.add('m-more'); const b = d.createElement('button'); b.type = 'button'; b.className = 'm-fold m-fold--more'; b.innerHTML = '<span>Ver todo lo que reparamos</span><svg class="ico" aria-hidden="true"><use href="#i-chevron"/></svg>'; c.after(b); b.addEventListener('click', () => { c.classList.add('m-open'); b.remove(); }); } });
  }

  // ---------- Pie en el celular: los grupos de links se pliegan y se abren tocando el título
  if (window.matchMedia('(max-width: 640px)').matches) {
    d.querySelectorAll('.footer nav h2').forEach((h, k) => {
      const ul = h.nextElementSibling;
      if (!ul || ul.tagName !== 'UL') return;
      ul.id = ul.id || 'f-grp-' + k;
      h.classList.add('f-acc');
      h.innerHTML = `<button type="button" aria-expanded="false" aria-controls="${ul.id}">${h.textContent}<svg class="ico" aria-hidden="true"><use href="#i-chevron"/></svg></button>`;
      ul.classList.add('f-acc-list');
      const b = h.firstChild;
      b.addEventListener('click', () => { const v = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', v); ul.classList.toggle('open', v); });
    });
  }

  // ---------- Soledad (la asistente virtual): aparece a los segundos, saluda y se queda chiquito con la pregunta
  const launch = d.querySelector('.chat-launch');
  if (launch) {
    let seen = false;
    try { seen = sessionStorage.getItem('mp-bot') === '1'; } catch (e) { /* sin almacenamiento */ }
    const mobile = window.innerWidth <= 960;
    const busy = () => d.documentElement.classList.contains('chat-open') || d.getElementById('drawer')?.classList.contains('is-open');
    if (seen) { if (!mobile) launch.classList.add('is-in'); }
    else setTimeout(() => {
      if (busy()) { if (!mobile) launch.classList.add('is-in'); return; }
      launch.classList.add('is-in', 'is-intro');
      try { sessionStorage.setItem('mp-bot', '1'); } catch (e) { /* nada */ }
      // en el celular se esconde en el botón "Dudas" de la barra; en la compu queda la pastilla con la pregunta
      setTimeout(() => { launch.classList.remove('is-intro'); if (mobile) launch.classList.remove('is-in'); }, 6500);
    }, mobile ? 6000 : 3500);
  }

  // ---------- Asistente (chat): el script se baja recién al abrirlo; queda abierto entre páginas
  const chat = d.getElementById('chat');
  if (chat) {
    const openers = d.querySelectorAll('[data-chat-open]');
    let loaded = false, lastOpener = null;
    const ensure = () => new Promise(res => {
      if (loaded) return res();
      const s = d.createElement('script');
      s.src = '/assets/js/chat.js?v=' + (d.querySelector('script[src*="site.js"]')?.src.split('v=')[1] || '1');
      s.onload = () => { loaded = true; window.MPChat.mount().then(res); };
      d.body.append(s);
    });
    const setChat = async (v, focus = true) => {
      chat.hidden = !v;
      d.documentElement.classList.toggle('chat-open', v);
      openers.forEach(o => o.setAttribute('aria-expanded', v));
      try { sessionStorage.setItem('mp-chat-open', v ? '1' : '0'); } catch (e) { /* nada */ }
      if (v) {
        const t = d.getElementById('wa-teaser'); if (t) t.hidden = true;
        await ensure();
        if (focus && window.innerWidth > 960) chat.querySelector('.chat-input').focus();
      } else if (focus && lastOpener) lastOpener.focus();
    };
    openers.forEach(o => o.addEventListener('click', () => {
      lastOpener = o;
      const v = chat.hidden;
      if (v) window.dataLayer.push({ event: 'chat_open', page_path: location.pathname });
      setChat(v);
    }));
    chat.querySelector('.chat-close').addEventListener('click', () => setChat(false));
    chat.querySelector('.chat-reset').addEventListener('click', () => ensure().then(() => window.MPChat.reset()));
    chat.addEventListener('keydown', e => { if (e.key === 'Escape') setChat(false); });
    let wasOpen = false;
    try { wasOpen = sessionStorage.getItem('mp-chat-open') === '1'; } catch (e) { /* nada */ }
    if (wasOpen && window.innerWidth > 960) setChat(true, false);
  }

  // ---------- Pasada 3: detalles que dependen del mouse, del scroll o del soporte
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sdSupport = window.CSS && CSS.supports('animation-timeline: scroll()');

  // Brillo en el borde de la tarjeta, siguiendo al cursor
  if (fine) d.addEventListener('pointermove', e => {
    const c = e.target.closest('.fault, .product, .post-card, .bento-cell, .tip, .contact-card, .quote');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`);
    c.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  // Botones magnéticos (solo los grandes de WhatsApp)
  if (fine && !reduce) d.querySelectorAll('.btn--wa:not(.btn--sm):not(.btn--block)').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .22, y = (e.clientY - r.top - r.height / 2) * .32;
      b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transition = 'transform .45s cubic-bezier(.2,.7,.2,1)'; b.style.transform = ''; setTimeout(() => { b.style.transition = ''; }, 460); });
  });

  // Foto de la lista de electrodomésticos: aparece al costado del ítem, del lado que no tapa el texto
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
      peek.style.setProperty('--px', `${x.toFixed(1)}px`);
      peek.style.setProperty('--py', `${y.toFixed(1)}px`);
      raf = item || Math.abs(ty - y) > .5 ? requestAnimationFrame(loop) : 0;
    };
    const aim = (cx, cy) => {
      const r = item.getBoundingClientRect(), g = peekList.getBoundingClientRect();
      const col = (r.left + r.width / 2 - g.left) / g.width;
      const s2 = col > .66 ? 1 : col < .34 ? -1 : (cx > r.left + r.width / 2 ? 1 : -1);
      // si el margen de la pantalla es angosto, la foto se achica (de 200 a 150 px) para tapar lo menos posible
      const room = s2 > 0 ? innerWidth - r.right - GAP - 8 : r.left - GAP - 8;
      const w = Math.max(150, Math.min(PW, room));
      if (w !== peek._w) { peek._w = w; peek.style.width = w + 'px'; }
      tx = s2 > 0 ? Math.min(innerWidth - w - 8, r.right + GAP) : Math.max(8, r.left - GAP - w);
      ty = Math.max(8, Math.min(innerHeight - PH - 8, cy - (peek._w || PW) * .375));
      if (s2 !== side) { side = s2; x = tx; y = ty; peek.classList.toggle('is-left', s2 < 0); }
    };
    peekList.querySelectorAll('[data-peek]').forEach(el => {
      if (!el.dataset.peek) return;
      el.addEventListener('pointerenter', e => { item = el; img.src = el.dataset.peek; side = 0; aim(e.clientX, e.clientY); peek.classList.add('on'); if (!raf) raf = requestAnimationFrame(loop); });
      el.addEventListener('pointermove', e => { if (item === el) aim(e.clientX, e.clientY); });
      el.addEventListener('pointerleave', () => { item = null; peek.classList.remove('on'); });
    });
  }

  // Notas del blog: progreso de lectura (si el navegador no lo hace por CSS) e índice con la sección actual
  const rp = d.querySelector('.read-progress');
  if (rp && !sdSupport) {
    const upd = () => { const h = d.documentElement.scrollHeight - innerHeight; rp.style.setProperty('--rp', h > 0 ? (scrollY / h).toFixed(3) : 0); };
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }
  const tocLinks = [...d.querySelectorAll('.toc a')];
  if (tocLinks.length) {
    const map = new Map(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const tocObs = io(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      tocLinks.forEach(a => a.classList.remove('is-active'));
      map.get(en.target.id)?.classList.add('is-active');
    }), { rootMargin: '-20% 0px -70% 0px' });
    if (tocObs) d.querySelectorAll('[data-article] h2[id]').forEach(h => tocObs.observe(h));
  }

  // ---------- Armá tu consulta
  const form = d.getElementById('consulta');
  if (!form) return;
  const data = JSON.parse(d.getElementById('consulta-data').textContent);
  const brandSel = form.querySelector('#c-marca');
  const faultsBox = form.querySelector('#c-fallas');
  const barrio = form.querySelector('#c-barrio');
  const msgEl = form.querySelector('.display-msg');
  const icoBox = form.querySelector('.display-ico');
  const live = form.querySelector('#c-live');
  const send = form.querySelector('#c-enviar');
  let typing, liveT;
  const state = { app: null, brand: '', fault: null };

  const withBrand = (phrase, brand) => {
    if (!brand) return phrase;
    const m = phrase.match(/\bmi (aire acondicionado|horno o cocina|\S+)/i);
    return m ? phrase.replace(m[0], `${m[0]} ${brand}`) : `${phrase} (marca ${brand})`;
  };
  const compose = () => {
    if (!state.app) return '';
    const app = data[state.app];
    const brand = state.brand && state.brand !== 'otra' ? state.brand : '';
    const s = state.fault !== null && state.fault !== 'otra' ? withBrand(app.faults[state.fault].wa, brand) : withBrand(`necesito service para mi ${app.noun}`, brand);
    let msg = `Hola MP Group, ${s}.`;
    const b = barrio.value.trim();
    if (b) msg += ` Estoy en ${b}.`;
    return msg + ' ¿Me pueden dar un turno para la visita?';
  };
  const caret = '<span class="caret"></span>';
  const render = animate => {
    const msg = compose();
    clearInterval(typing);
    if (!msg) {
      msgEl.innerHTML = `<span class="ph">Elegí el electrodoméstico y te armamos el mensaje para WhatsApp.</span>${caret}`;
      send.href = waUrl('Hola MP Group, quiero consultar por un service.');
      return;
    }
    send.href = waUrl(msg);
    clearTimeout(liveT);
    liveT = setTimeout(() => { live.textContent = `Mensaje listo: ${msg}`; }, 700);
    if (!animate || reduce) { msgEl.textContent = msg; msgEl.insertAdjacentHTML('beforeend', caret); return; }
    const prev = msgEl.textContent;
    let i = 0;
    while (i < prev.length && i < msg.length && prev[i] === msg[i]) i++;
    const step = Math.max(1, Math.ceil((msg.length - i) / 28));
    typing = setInterval(() => {
      i = Math.min(msg.length, i + step);
      msgEl.textContent = msg.slice(0, i);
      msgEl.insertAdjacentHTML('beforeend', caret);
      if (i >= msg.length) clearInterval(typing);
    }, 18);
  };
  const mark = () => {
    form.querySelector('[data-step="1"]').classList.toggle('is-done', !!state.app);
    form.querySelector('[data-step="2"]').classList.toggle('is-done', !!state.brand);
    form.querySelector('[data-step="3"]').classList.toggle('is-done', state.fault !== null);
    if (state.app && state.fault !== null) { send.classList.remove('is-ready'); void send.offsetWidth; send.classList.add('is-ready'); }
  };
  const drawIcon = slug => {
    const src = form.querySelector(`label[for="a-${slug}"] svg`);
    if (!src) return;
    const clone = src.cloneNode(true);
    icoBox.innerHTML = '';
    icoBox.append(clone);
    icoBox.classList.remove('draw'); void icoBox.offsetWidth;
    icoBox.classList.add('has', 'draw');
  };

  form.querySelectorAll('input[name="app"]').forEach(r => r.addEventListener('change', () => {
    state.app = r.value; state.fault = null; state.brand = '';
    const app = data[state.app];
    brandSel.disabled = false;
    brandSel.innerHTML = '<option value="">Elegí la marca</option>' + app.brands.map(b => `<option>${b}</option>`).join('') + '<option value="otra">Otra marca</option>';
    faultsBox.innerHTML = app.faults.map((f, i) => `<div class="opt"><input type="radio" name="falla" id="f${i}" value="${i}"><label class="chip" for="f${i}">${f.t}</label></div>`).join('')
      + '<div class="opt"><input type="radio" name="falla" id="fo" value="otra"><label class="chip" for="fo">Otra falla</label></div>';
    faultsBox.querySelectorAll('input').forEach(fr => fr.addEventListener('change', () => {
      state.fault = fr.value === 'otra' ? 'otra' : +fr.value; mark(); render(true);
      // en el celular el botón de enviar queda fuera de pantalla: lo traemos a la vista
      const r = send.getBoundingClientRect();
      if (r.bottom > innerHeight - 90) send.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }));
    drawIcon(state.app);
    mark(); render(true);
  }));
  brandSel.addEventListener('change', () => { state.brand = brandSel.value; mark(); render(true); });
  // Marca: lista propia igual a la de barrios. El select real queda oculto y sigue guardando el valor
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
      btn.innerHTML = `<span class="combo-val${sel.value ? '' : ' is-ph'}">${o ? o.text : ''}</span><svg class="ico combo-chev" aria-hidden="true"><use href="#i-chevron"/></svg>`;
      btn.disabled = sel.disabled;
    };
    const close = () => { clearTimeout(idle); list.hidden = true; wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); act = -1; };
    const arm = () => { clearTimeout(idle); idle = setTimeout(close, 4000); };
    const items = () => [...list.children];
    const hi = k => { const it = items(); act = (k + it.length) % it.length; it.forEach((li, j) => li.classList.toggle('on', j === act)); it[act].scrollIntoView({ block: 'nearest' }); arm(); };
    const open = () => {
      if (sel.disabled) return;
      list.innerHTML = [...sel.options].filter(o => o.value !== '').map((o, k) => `<li role="option" id="c-marca-o${k}" data-v="${o.value}" aria-selected="${o.selected}">${o.text}</li>`).join('');
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

  // Barrio: sugerencias que se abren y cierran con la flechita y se van solas si no las tocás
  const combo = form.querySelector('[data-combo]');
  if (combo) {
    const opts = combo.dataset.opts.split('|'), list = combo.querySelector('.combo-list'), cbtn = combo.querySelector('.combo-btn');
    const norm = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    let idle, act = -1;
    const close = () => { clearTimeout(idle); list.hidden = true; combo.classList.remove('is-open'); barrio.setAttribute('aria-expanded', 'false'); barrio.removeAttribute('aria-activedescendant'); act = -1; };
    const arm = () => { clearTimeout(idle); idle = setTimeout(close, 4000); };
    const open = all => {
      const q = all ? '' : norm(barrio.value.trim());
      const hits = opts.filter(o => !q || norm(o).includes(q));
      if (!hits.length) return close();
      list.innerHTML = hits.map((o, k) => `<li role="option" id="cb-${k}">${o}</li>`).join('');
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
  }
  barrio.addEventListener('input', () => render(false));
  form.addEventListener('submit', e => { e.preventDefault(); send.click(); });
  render(false);
};
// después del primer cuadro; si la pestaña está oculta (abierta de fondo) el cuadro no llega: a los 1,2 s arranca igual
let started = false;
const go = () => { if (started) return; started = true; run(); };
if ("requestAnimationFrame" in window) requestAnimationFrame(() => setTimeout(go, 0));
setTimeout(go, 1200);
// Microinteracciones (fx.js): se bajan con la primera interacción del usuario, así no pesan en la carga
(() => {
  const evs = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart'];
  let done = false;
  const go = () => {
    if (done) return; done = true;
    evs.forEach(e => removeEventListener(e, go, true));
    const s = document.createElement('script');
    s.src = '/assets/js/fx.js?v=' + (document.querySelector('script[src*="site.js"]')?.src.split('v=')[1] || '1');
    document.body.append(s);
  };
  evs.forEach(e => addEventListener(e, go, { passive: true, capture: true }));
})();
})();
