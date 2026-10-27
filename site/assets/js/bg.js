// Fondo vivo. La grilla de puntos es un fondo CSS (.bg-dots, viene en el HTML y no cuesta nada dibujarla);
// este archivo solo la desplaza con el scroll (parallax por transform, lo mueve la placa de video)
// y dibuja en un lienzo lo que pasa CERCA del mouse: puntos que crecen y se tiñen, una malla tenue
// y la onda del clic en el fondo. El lienzo se limpia y se pinta solo en esa zona, nunca la pantalla entera.
(() => {
const init = () => {
  const d = document, root = d.documentElement;
  const reduceScroll = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLite = () => root.classList.contains('lite');
  const dots = d.querySelector('.bg-dots');
  const GAP = 28, ROW = 56, R = 1.05, INFL = 170;

  // parallax: la grilla baja más lento que el contenido (un transform por cuadro, sin repintar)
  let off = 0;
  const par = () => { off = reduceScroll ? 0 : -((scrollY * .3) % ROW); if (dots) dots.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`; };

  const cv = d.createElement('canvas');
  cv.className = 'bg-grid';
  cv.setAttribute('aria-hidden', 'true');
  d.body.prepend(cv);
  const ctx = cv.getContext('2d', { alpha: true });
  let W = 0, H = 0, dpr = 1, dirty = null, raf = 0;
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, a: 0, ta: 0 };
  const shocks = [];

  const resize = () => {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = null; kick();
  };
  const near = (x, y) => {
    if (mouse.a < .01) return 0;
    const dist = Math.hypot(x - mouse.x, y - mouse.y);
    return dist < INFL ? (1 - dist / INFL) ** 2 * mouse.a : 0;
  };
  // recorre los puntos de la grilla dentro de un rectángulo
  const each = (x0, y0, x1, y1, fn) => {
    const r0 = Math.floor((y0 - off) / GAP) - 1, r1 = Math.ceil((y1 - off) / GAP) + 1;
    for (let r = r0; r <= r1; r++) {
      const y = off + r * GAP, sx = (r & 1) ? GAP / 2 : 0;
      for (let x = sx + Math.floor((x0 - sx) / GAP) * GAP; x <= x1 + GAP; x += GAP) fn(x, y, r);
    }
  };

  function draw(now) {
    if (dirty) ctx.clearRect(dirty[0], dirty[1], dirty[2] - dirty[0], dirty[3] - dirty[1]);
    dirty = null;
    const grow = (x0, y0, x1, y1) => { dirty = dirty ? [Math.min(dirty[0], x0), Math.min(dirty[1], y0), Math.max(dirty[2], x1), Math.max(dirty[3], y1)] : [x0, y0, x1, y1]; };
    const mx = mouse.x, my = mouse.y;

    // malla de plano alrededor del cursor
    if (mouse.a > .01) {
      const B = INFL + GAP;
      grow(mx - B - 4, my - B - 4, mx + B + 4, my + B + 4);
      if (!isLite()) {
        const buckets = [[], [], [], []];
        each(mx - INFL, my - INFL, mx + INFL, my + INFL, (x, y) => {
          for (const [nx, ny] of [[x + GAP, y], [x - GAP / 2, y + GAP], [x + GAP / 2, y + GAP]]) {
            const k = near((x + nx) / 2, (y + ny) / 2);
            if (k > .04) buckets[Math.min(3, Math.floor(k * 4))].push(x, y, nx, ny);
          }
        });
        ctx.lineWidth = 1;
        buckets.forEach((b, i) => {
          if (!b.length) return;
          ctx.strokeStyle = `rgba(40,158,186,${(.08 + i * .07).toFixed(2)})`;
          ctx.beginPath();
          for (let j = 0; j < b.length; j += 4) { ctx.moveTo(b[j], b[j + 1]); ctx.lineTo(b[j + 2], b[j + 3]); }
          ctx.stroke();
        });
      }
      each(mx - INFL, my - INFL, mx + INFL, my + INFL, (x, y) => {
        const k = near(x, y);
        if (k <= .02) return;
        const dx = x - mx, dy = y - my, dist = Math.hypot(dx, dy) || 1;
        const px = x + dx / dist * 6 * k, py = y + dy / dist * 6 * k;
        ctx.fillStyle = `rgba(${Math.round(64 - 24 * k)},${Math.round(89 + 69 * k)},${Math.round(101 + 85 * k)},${(.2 + .6 * k).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(px, py, R + 2 * k, 0, 6.2832); ctx.fill();
      });
    }

    // onda del clic: solo los puntos que están en el anillo
    for (let i = shocks.length - 1; i >= 0; i--) {
      const s = shocks[i], age = now - s.t, rad = age * .8, fall = 1 - age / 950;
      if (fall <= 0) { shocks.splice(i, 1); continue; }
      const out = rad + 60;
      const x0 = Math.max(0, s.x - out), y0 = Math.max(0, s.y - out), x1 = Math.min(W, s.x + out), y1 = Math.min(H, s.y + out);
      grow(x0 - 10, y0 - 10, x1 + 10, y1 + 10);
      each(x0, y0, x1, y1, (x, y) => {
        const dx = x - s.x, dy = y - s.y, dist = Math.hypot(dx, dy) || 1;
        const band = 1 - Math.abs(dist - rad) / 46;
        if (band <= 0) return;
        const q = band * fall;
        ctx.fillStyle = `rgba(40,158,186,${(.2 + .6 * q).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x + dx / dist * 12 * q, y + dy / dist * 12 * q, R + 1.7 * q, 0, 6.2832); ctx.fill();
      });
    }
  }

  const loop = now => {
    mouse.x += (mouse.tx - mouse.x) * .22; mouse.y += (mouse.ty - mouse.y) * .22;
    mouse.a += (mouse.ta - mouse.a) * .12;
    draw(now);
    const moving = Math.abs(mouse.tx - mouse.x) > .3 || Math.abs(mouse.ty - mouse.y) > .3 || Math.abs(mouse.ta - mouse.a) > .01 || shocks.length;
    raf = moving ? requestAnimationFrame(loop) : 0;
    if (!moving && mouse.a < .01 && dirty) draw(now); // deja el lienzo limpio
  };
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mouse.tx = e.clientX; mouse.ty = e.clientY; mouse.ta = 1;
    if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
    kick();
  }, { passive: true });
  d.addEventListener('pointerleave', () => { mouse.ta = 0; kick(); });
  addEventListener('blur', () => { mouse.ta = 0; kick(); });
  let sraf = 0;
  addEventListener('scroll', () => {
    if (sraf) return;
    sraf = requestAnimationFrame(() => { sraf = 0; par(); if (mouse.ta > 0) { mouse.ta = 0; kick(); } });
  }, { passive: true });
  addEventListener('mp:shock', e => { if (isLite()) return; shocks.push({ x: e.detail.x, y: e.detail.y, t: performance.now() }); if (shocks.length > 3) shocks.shift(); kick(); });
  resize(); par();

  // Arcos del hero: siguen al mouse (y giran apenas con el scroll)
  const hero = d.querySelector('.hero');
  const arcs = hero && hero.querySelector('.hero-arcs');
  if (arcs) {
    let ax = 0, ay = 0, tx = 0, ty = 0, r2 = 0;
    const tick = () => {
      ax += (tx - ax) * .08; ay += (ty - ay) * .08;
      arcs.style.translate = `${ax.toFixed(1)}px ${ay.toFixed(1)}px`;
      if (!reduceScroll && scrollY < innerHeight) arcs.style.rotate = `${(scrollY * .03).toFixed(2)}deg`;
      r2 = Math.abs(tx - ax) > .2 || Math.abs(ty - ay) > .2 ? requestAnimationFrame(tick) : 0;
    };
    addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || scrollY > innerHeight) return; tx = (e.clientX / innerWidth - .5) * -40; ty = (e.clientY / innerHeight - .5) * -30; if (!r2) r2 = requestAnimationFrame(tick); }, { passive: true });
    addEventListener('scroll', () => { if (!r2 && scrollY < innerHeight) r2 = requestAnimationFrame(tick); }, { passive: true });
  }
};
// se activa con la primera interacción del usuario (mouse, rueda, toque o teclado; no con un scroll hecho por código)
const wake = fn => { const evs = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart']; let done = false; const go = () => { if (done) return; done = true; evs.forEach(e => removeEventListener(e, go, true)); fn(); }; evs.forEach(e => addEventListener(e, go, { passive: true, capture: true })); };
wake(() => ('requestIdleCallback' in window ? requestIdleCallback(init, { timeout: 600 }) : setTimeout(init, 60)));
})();
