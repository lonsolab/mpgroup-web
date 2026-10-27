// Asistente de MP Group: respuestas automáticas, preguntas armadas y diagnóstico guiado que termina en WhatsApp.
// Se carga recién cuando alguien abre el chat. Los datos salen de /assets/chat-data.json (generado en el build).
window.MPChat = (() => {
  const d = document;
  const WA = '5491152490898';
  const waUrl = t => `https://api.whatsapp.com/send?phone=${WA}&text=${encodeURIComponent(t)}`;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'mp-chat-v1';
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const push = (event, extra = {}) => { (window.dataLayer = window.dataLayer || []).push({ event, ...extra }); };

  let DATA = null, root, log, chipsEl, input, busy = false;
  let state = { msgs: [], flow: null };

  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento */ } };
  const load = () => { try { const s = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (s && Array.isArray(s.msgs)) state = s; } catch (e) { /* nada */ } };

  // ---------- render
  const bubble = m => {
    const el = d.createElement('div');
    el.className = `msg msg--${m.who}`;
    let html = `<div class="msg-b">${m.html}</div>`;
    if (m.cta) html += `<a class="btn btn--wa btn--sm msg-cta" href="${esc(m.cta.href)}" target="_blank" rel="noopener" data-cta="chat">${d.querySelector('#i-wa') ? '<svg class="ico" aria-hidden="true"><use href="#i-wa"/></svg>' : ''}${esc(m.cta.label)}</a>`;
    if (m.links) html += `<div class="msg-links">${m.links.map(l => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</div>`;
    el.innerHTML = html;
    return el;
  };
  const renderAll = () => { log.innerHTML = ''; state.msgs.forEach(m => log.append(bubble(m))); log.scrollTop = log.scrollHeight; };
  const setChips = list => {
    chipsEl.innerHTML = '';
    (list || []).forEach(c => {
      const b = d.createElement('button');
      b.type = 'button'; b.className = 'qr'; b.textContent = c.label;
      b.addEventListener('click', () => { if (!busy) handle(c.label, c.act); });
      chipsEl.append(b);
    });
    state.chips = list; save();
    log.scrollTop = log.scrollHeight;
  };
  const add = m => { state.msgs.push(m); log.append(bubble(m)); log.scrollTop = log.scrollHeight; save(); };
  const user = t => add({ who: 'user', html: esc(t) });

  // el bot "escribe" un momento antes de cada respuesta
  const bot = async (msgs, chips) => {
    busy = true; setChips([]);
    for (const m of [].concat(msgs)) {
      const typing = d.createElement('div');
      typing.className = 'msg msg--bot'; typing.innerHTML = '<div class="msg-b typing"><span></span><span></span><span></span></div>';
      log.append(typing); log.scrollTop = log.scrollHeight;
      await new Promise(r => setTimeout(r, reduce ? 120 : Math.min(1100, 380 + (m.html || '').length * 6)));
      typing.remove();
      add({ who: 'bot', ...m });
    }
    busy = false; setChips(chips || MENU());
  };

  // ---------- contenido
  const statusLine = () => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()).map(x => [x.type, x.value]));
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), h = +p.hour;
    const open = day !== 0 && h >= 9 && h < (day === 6 ? 15 : 18);
    return open ? 'Ahora estamos atendiendo.' : 'Ahora estamos fuera de horario, pero podés escribirnos igual y te respondemos apenas abramos.';
  };
  const MENU = () => [
    { label: 'Se me rompió un equipo', act: 'broken' },
    { label: '¿Llegan a mi barrio?', act: 'zone' },
    { label: '¿Cuánto tarda el técnico?', act: 'time' },
    { label: '¿Cuánto cuesta la visita?', act: 'price' },
    { label: 'Formas de pago', act: 'pay' },
    { label: 'Garantía', act: 'warranty' },
    { label: 'Horarios', act: 'hours' },
    { label: 'Hablar con una persona', act: 'human' },
  ];
  const handoff = (text = 'Hola MP Group, quiero consultar por un service.', label = 'Seguir por WhatsApp') => ({ html: 'Te paso con una persona del equipo por WhatsApp, con tu consulta ya escrita.', cta: { href: waUrl(text), label } });

  const A = {
    greet: () => bot([{ html: '¡Hola! Soy <b>Soledad</b>, la asistente virtual de MP Group.' }, { html: `Te ayudo con dudas rápidas y a pedir la visita del técnico. ${statusLine()} ¿Qué necesitás?` }]),
    broken: () => { state.flow = { step: 'app' }; save(); return bot({ html: '¿Qué electrodoméstico es?' }, DATA.apps.map(a => ({ label: a.name, act: `app:${a.slug}` }))); },
    time: () => bot({ html: 'Una vez que cargamos el servicio, el técnico va a tu casa <b>en el día o dentro de las 24 horas</b> y lleva los repuestos para resolverlo en la misma visita. En épocas de mucha demanda puede haber alguna excepción.' }),
    price: () => bot([{ html: 'El costo depende del equipo, de la falla y de los repuestos, así que no hay un precio fijo que te pueda dar por acá.' }, { ...handoff('Hola MP Group, quiero saber el costo de un service.', 'Pedir presupuesto por WhatsApp'), html: 'Escribinos con la marca y qué le pasa, y te pasamos el presupuesto por WhatsApp.' }]),
    pay: () => bot({ html: 'Podés pagar en <b>efectivo o por transferencia</b>. Emitimos <b>factura A o B</b>, según corresponda.' }),
    warranty: () => bot({ html: 'Sí: <b>todos los trabajos tienen garantía</b> y usamos repuestos originales.' }),
    hours: () => bot({ html: `Atendemos de <b>lunes a viernes de 9 a 18 h</b> y los <b>sábados de 9 a 15 h</b>. ${statusLine()}` }),
    human: () => bot([handoff(), { html: `Si preferís llamar: <a href="tel:+541145014998">011 4501-4998</a>.` }]),
    zone: () => { state.flow = { step: 'zone' }; save(); return bot({ html: 'Vamos a domicilio en <b>toda la Ciudad de Buenos Aires</b> y en <b>Zona Norte</b> (Vicente López, Olivos, La Lucila, San Isidro, Martínez, Acassuso, Béccar y Tigre). Escribime tu barrio y te confirmo.' }, []); },
    brands: () => bot({ html: `Reparamos las marcas más usadas: ${DATA.brands.map(b => b.name).join(', ')}, entre otras.`, links: DATA.brands.filter(b => b.url).slice(0, 4).map(b => ({ label: `Service ${b.name}`, href: b.url })) }),
    gas: () => bot([{ html: '<b>Si sentís olor a gas:</b> cerrá la llave de paso, abrí puertas y ventanas, y no prendas ni apagues luces ni aparatos eléctricos. Salí del lugar y llamá al servicio de emergencias de tu distribuidora de gas.' }, { html: 'Una vez que sea seguro, revisamos el equipo.', cta: { href: waUrl('Hola MP Group, tuve un problema de gas con un equipo y necesito que lo revisen.'), label: 'Pedir revisión por WhatsApp' } }]),
    thanks: () => bot({ html: '¡De nada! Si necesitás algo más, acá estoy.' }),
    jobs: () => bot({ html: 'Si sos técnico y querés sumarte, mandanos tu CV por mail.', links: [{ label: 'Trabajá con nosotros', href: '/trabaja-con-nosotros/' }] }),
    unknown: () => bot({ html: 'No estoy seguro de haber entendido. Elegí una opción o, si preferís, te paso con una persona.' }),
  };

  const appFlow = async slug => {
    const a = DATA.apps.find(x => x.slug === slug);
    state.flow = { step: 'fault', app: slug }; save();
    return bot({ html: `¿Qué le pasa a tu ${esc(a.noun)}?` }, [...a.faults.map((f, i) => ({ label: f.t, act: `fault:${i}` })), { label: 'Otra cosa', act: 'fault:x' }]);
  };
  const faultFlow = async (idx, knownBrand) => {
    const a = DATA.apps.find(x => x.slug === state.flow.app);
    state.flow = { ...state.flow, step: 'brand', fault: idx }; save();
    const f = idx === 'x' ? null : a.faults[+idx];
    const msgs = [];
    if (f) msgs.push({ html: `${esc(f.d)} El técnico lo diagnostica en tu casa y, en la mayoría de los casos, lo resuelve en la misma visita.` });
    if (knownBrand) { await bot(msgs, []); return brandFlow(knownBrand); }
    msgs.push({ html: '¿De qué marca es?' });
    return bot(msgs, [...a.brands.map(b => ({ label: b, act: `brand:${b}` })), { label: 'Otra marca', act: 'brand:' }]);
  };
  const brandFlow = async brand => {
    const a = DATA.apps.find(x => x.slug === state.flow.app);
    const f = state.flow.fault === 'x' || state.flow.fault == null ? null : a.faults[+state.flow.fault];
    let phrase = f ? f.wa : `necesito service para mi ${a.noun}`;
    if (brand) { const m = phrase.match(/\bmi (aire acondicionado|horno o cocina|\S+)/i); phrase = m ? phrase.replace(m[0], `${m[0]} ${brand}`) : `${phrase} (marca ${brand})`; }
    const text = `Hola MP Group, ${phrase}. ¿Me pueden dar un turno para la visita?`;
    state.flow = null; save();
    push('chat_diagnostico', { appliance: a.slug, brand: brand || 'otra' });
    return bot([{ html: '¡Listo! Te armé el mensaje para coordinar la visita:' }, { html: `<i>“${esc(text)}”</i>`, cta: { href: waUrl(text), label: 'Enviar por WhatsApp' }, links: [{ label: `Ver service de ${a.noun}`, href: `/${a.slug}/` }] }]);
  };
  const zoneCheck = async txt => {
    const t = norm(txt);
    state.flow = null; save();
    const hit = DATA.zones.find(z => t.includes(norm(z.name)));
    if (hit) return bot({ html: `Sí, <b>llegamos a ${esc(hit.name)}</b>. ¿Coordinamos la visita?`, cta: { href: waUrl(`Hola MP Group, estoy en ${hit.name} y necesito un service.`), label: `Pedir visita en ${hit.name}` } });
    return bot({ html: `Trabajamos en toda CABA y Zona Norte. Para "${esc(txt)}" te confirmamos por WhatsApp si llegamos.`, cta: { href: waUrl(`Hola MP Group, estoy en ${txt}, ¿llegan hasta acá?`), label: 'Consultar mi zona' } });
  };

  // ---------- texto libre: intenciones por palabras clave
  const intent = txt => {
    const t = ` ${norm(txt)} `;
    const has = (...w) => w.some(x => t.includes(x));
    if (has(' gas ', 'olor a gas', 'huele a gas', 'perdida de gas', 'fuga de gas')) return ['gas'];
    const app = DATA.apps.find(a => a.keys.some(k => t.includes(` ${k}`)));
    if (app) {
      // si además dice la falla, la buscamos por palabras en común
      const words = t.split(' ').filter(w => w.length > 3);
      let best = -1, score = 0;
      app.faults.forEach((f, i) => { const s = norm(f.t + ' ' + f.wa).split(' ').filter(w => w.length > 3 && words.includes(w)).length; if (s > score) { score = s; best = i; } });
      return score >= 1 ? ['appfault', app.slug, best] : ['app', app.slug];
    }
    if (has('precio', 'cuanto sale', 'cuanto cuesta', 'cuanto cobran', 'presupuesto', 'valor', 'costo', 'tarifa')) return ['price'];
    if (has('garantia')) return ['warranty'];
    if (has('pago', 'pagar', 'tarjeta', 'efectivo', 'transferencia', 'factura', 'mercado pago')) return ['pay'];
    if (has('horario', 'abren', 'atienden', 'sabado', 'domingo', 'feriado', 'abierto')) return ['hours'];
    if (has('tarda', 'demora', 'cuando vienen', 'cuando pueden', 'urgente', 'hoy mismo', 'manana', 'rapido')) return ['time'];
    const zone = DATA.zones.find(z => t.includes(` ${norm(z.name)}`));
    if (zone || has('zona', 'barrio', 'llegan', 'cubren', 'domicilio', 'van a')) return zone ? ['zonehit', txt] : ['zone'];
    if (DATA.brands.some(b => t.includes(` ${norm(b.name)}`))) return ['brands'];
    if (has('persona', 'humano', 'operador', 'whatsapp', 'llamar', 'telefono', 'hablar con')) return ['human'];
    if (has('trabajo', 'empleo', ' cv ', 'curriculum', 'trabajar')) return ['jobs'];
    if (has('gracias', 'genial', 'perfecto', 'buenisimo')) return ['thanks'];
    if (has('hola', 'buenas', 'buen dia', 'buenos dias', 'buenas tardes')) return ['greet'];
    if (has('roto', 'rompio', 'no anda', 'no funciona', 'falla', 'arreglar', 'reparar', 'service')) return ['broken'];
    return ['unknown'];
  };

  const handle = async (label, act) => {
    if (label) user(label);
    push('chat_mensaje', { chat_accion: act || 'texto' });
    if (act) {
      const [k, v] = act.split(':');
      if (k === 'app') return appFlow(v);
      if (k === 'fault') return faultFlow(v);
      if (k === 'brand') return brandFlow(v);
      return A[k] ? A[k]() : A.unknown();
    }
    // texto escrito
    if (state.flow?.step === 'zone') return zoneCheck(label);
    const [k, a, b] = intent(label);
    if (k === 'app') return appFlow(a);
    if (k === 'appfault') {
      state.flow = { step: 'fault', app: a };
      const app = DATA.apps.find(x => x.slug === a);
      const known = [...app.brands, ...DATA.brands.map(x => x.name)].find(n => ` ${norm(label)} `.includes(` ${norm(n)} `));
      return faultFlow(String(b), known);
    }
    if (k === 'zonehit') return zoneCheck(a);
    return A[k]();
  };

  // ---------- montaje
  const mount = async () => {
    root = d.getElementById('chat');
    log = root.querySelector('.chat-log');
    chipsEl = root.querySelector('.chat-chips');
    input = root.querySelector('.chat-input');
    root.querySelector('.chat-form').addEventListener('submit', e => {
      e.preventDefault();
      const v = input.value.trim();
      if (!v || busy) return;
      input.value = '';
      handle(v);
    });
    DATA = await fetch('/assets/chat-data.json').then(r => r.json());
    load();
    if (state.msgs.length) { renderAll(); setChips(state.chips && state.chips.length ? state.chips : MENU()); }
    else await A.greet();
  };
  return { mount, reset: () => { state = { msgs: [], flow: null }; save(); renderAll(); A.greet(); } };
})();
