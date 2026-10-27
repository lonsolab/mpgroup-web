// Genera el sitio estático de MP Group en dist/ (subir el contenido de dist/ a public_html en Hostinger).
// Uso: node build.mjs
import fs from 'fs';
import path from 'path';

const ROOT = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1');
// PREVIEW=1: copia para mostrar online antes de publicar. No carga el GTM (no ensucia Analytics ni las conversiones de Ads)
// y le pide a Google que no la indexe (meta robots, robots.txt y cabecera X-Robots-Tag)
const PREVIEW = !!process.env.PREVIEW;
const DIST = path.join(ROOT, PREVIEW ? 'dist-preview' : 'dist');
const SRC = path.join(ROOT, 'site');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const exists = f => fs.existsSync(path.join(ROOT, f));

const servicios = read('content/servicios.json');
const marcas = read('content/marcas.json');
const blog = exists('content/blog.json') ? read('content/blog.json') : [];
const POST_GEN = { 'errores-comunes-que-las-personas-cometen-con-sus-electrodomesticos-y-como-evitarlos': 'gen-blog-errores' };
const imgMap = read('site/assets/img/map.json');
const ASSET_V = Date.now().toString(36);

// ---------------------------------------------------------------- datos fijos
const SITE = {
  name: 'MP Group',
  legal: 'MP Group S.R.L.',
  url: 'https://mpgroup.com.ar',
  wa: '5491152490898',
  waShow: '11 5249-0898',
  tel: '+541145014998',
  telShow: '011 4501-4998',
  tel2: '+541152490898',
  tel2Show: '011 5249-0898',
  email: 'info@mpgroup.com.ar',
  street: 'Nueva York 3320, 1º 4',
  barrio: 'Villa Devoto',
  city: 'Ciudad Autónoma de Buenos Aires',
  cp: 'C1419',
  geo: [-34.5949664, -58.5031333],
  maps: 'https://www.google.com.ar/maps/place/MP+Group+S.R.L:+Reparaciones+y+Servicio+T%C3%A9cnico+de+Electrodom%C3%A9sticos/@-34.594962,-58.5057082,17z/data=!4m15!1m8!3m7!1s0x95bcb635d52b3da3:0xfe8257a08069e51c!2sNueva+York+3320+1ro+4,+C1419+Cdad.+Aut%C3%B3noma+de+Buenos+Aires!3b1!8m2!3d-34.5949664!4d-58.5031333!16s%2Fg%2F11q2xv8shr!3m5!1s0x95bcb78b9ae0d0bf:0x8f64ec06c760ba39!8m2!3d-34.5949664!4d-58.5031333!16s%2Fg%2F11h7v5yz3z?entry=ttu',
  gtm: 'GTM-M5SNQ63',
};
const HOURS = [['Lunes a viernes', '9 a 18 h'], ['Sábados', '9 a 15 h'], ['Domingos', 'Cerrado']];
const ZONES = {
  'CABA': ['Villa Devoto', 'Villa Urquiza', 'Belgrano', 'Palermo', 'Coghlan', 'Caballito', 'Flores', 'Paternal', 'Villa Real', 'Barrio Norte', 'Puerto Madero'],
  'Zona Norte': ['Vicente López', 'Olivos', 'La Lucila', 'San Isidro', 'Acassuso', 'Béccar', 'Tigre'],
};
const REVIEWS = [
  ['Héctor Forcher', '2024-04-26', 'Muy buen servicio, rápido, puntuales y eficiente en la resolución del problema. Excelente la predisposición y conocimiento por parte del técnico.'],
  ['Lorena Osimani', '2024-03-26', 'Muy buen servicio y atención. Por WhatsApp te dan un rango de horario, luego el técnico se comunica para avisar cuando va a pasar, por lo general 20 o 30 minutos antes. Destaco el trabajo de Maximiliano. Súper recomendable.'],
  ['Mónica Gallegos', '2024-04-19', 'Son rápidos y organizados para enviar visita técnica. Cumplen los horarios pactados. Técnicos capacitados y amables.'],
  ['Cecilia Armendáriz', '2024-03-24', 'Excelente trabajo. Muchas gracias a Damián, el técnico, a su compañero y a Soledad de Administración. Todos fueron muy atentos y eficientes; los hornos y anafes quedaron como nuevos.'],
  ['Jay Ali', '2024-04-20', 'Hace más de 3 años que son la empresa a la que le confío mi calefón y la estufa tiro balanceado. Servicio rápido y eficiente.'],
  ['Rocío Strada', '2024-04-23', 'Excelente servicio. Atención muy buena y muy amables. Solucionaron rápido las hornallas.'],
  ['Luis Tarutani', '2024-04-17', 'Excelente servicio y atención. Muy profesionales y confiables.'],
  ['Mónica Jajati', '2024-03-23', 'Muy buena atención, el técnico excelente. Para recomendar.'],
  ['Ángeles Ferraro', '2024-04-06', 'Excelente servicio, rápida respuesta.'],
  ['Jony Rat', '2024-03-27', 'Todo perfecto.'],
];
const SINGULAR = { lavarropas: 'lavarropas', secarropas: 'secarropas', lavavajillas: 'lavavajillas', heladeras: 'heladera', termotanques: 'termotanque', calefones: 'calefón', 'hornos-y-cocinas': 'horno o cocina', estufas: 'estufa', 'aire-acondicionado': 'aire acondicionado' };
const BRAND_PAGE = { Samsung: 'service-samsung', LG: 'service-lg', Ariston: 'service-ariston', Domec: 'service-domec', Orbis: 'service-orbis', Electrolux: 'service-electrolux', Longvie: 'service-longvie', Whirlpool: 'service-whirlpool', 'General Electric': 'service-general-electric' };
const SPECIFIC_BRAND_PAGE = { 'heladeras|Samsung': 'service-de-heladeras-samsung', 'calefones|Orbis': 'service-calefones-orbis', 'hornos-y-cocinas|Electrolux': 'service-de-hornos-y-cocinas-electrolux' };
const OTHER_BRANDS = ['Philco', 'Surrey', 'Carrier', 'BGH', 'Electra', 'Zenith', 'Volcán'];

// Fotos que el contenido dejó vacías y que sí están en el sitio actual
const HERO_FALLBACK = {
  heladeras: 'hero-heladera', lavavajillas: 'hero-lavavajillas', estufas: 'hero-estufas',
  'service-samsung': 'hero4', 'service-de-heladeras-samsung': 'hero3-3', 'service-lg': 'hero2-2', 'service-electrolux': 'hero-electrolux',
  'service-longvie': 'hero-longvie', 'service-orbis': 'hero-orbis', 'service-whirlpool': 'fondo-cta-lavarropas', 'service-general-electric': 'hero1-1',
  'service-ariston': 'hero-ariston', 'service-domec': 'hero-domec', 'service-calefones-orbis': 'hero-calefon', 'service-de-hornos-y-cocinas-electrolux': 'hero-hyc',
};
// Imágenes generadas para el sitio (content/gen): mismo técnico y misma estética en todas las páginas
const gen = base => (imgEntry('gen-' + base) ? 'gen-' + base : null);
// fotos reales de MP Group (content/real → real-*): cuando existen, van antes que las generadas
const real = base => (imgEntry('real-' + base) ? 'real-' + base : null);
// selección aprobada (tools/fotos-reales-publicar.py): servicio, equipo, marca y puntaje de cada foto
const REALS = (fs.existsSync('content/real-seleccion.json') ? JSON.parse(fs.readFileSync('content/real-seleccion.json', 'utf8')) : [])
  .filter(r => imgEntry(r.base));
// preferencias de MP Group (content/real-prefs.json): heros elegidos a mano y el acero inoxidable primero
const PREFS = fs.existsSync('content/real-prefs.json') ? JSON.parse(fs.readFileSync('content/real-prefs.json', 'utf8')) : { hero: {}, inox: [] };
const INOX = new Set(PREFS.inox);
for (let i = REALS.length - 1; i >= 0; i--) if ((PREFS.sinFotos || []).some(([sv, mk]) => REALS[i].servicio === sv && REALS[i].marcaSlug === mk)) REALS.splice(i, 1);
REALS.sort((a, b) => (INOX.has(b.base) - INOX.has(a.base)) || b.score - a.score);
const prefHero = (key, pool) => { const b = PREFS.hero[key]; return b && pool.some(r => r.base === b) ? b : null; };
const slugify = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const realFor = (svc, marcaSlug) => REALS.filter(r => (!svc || r.servicio === svc) && (!marcaSlug || r.marcaSlug === marcaSlug));
const realCap = r => (r.marca ? `${r.equipo} ${r.marca}` : r.equipo);
const realAlt = r => `${realCap(r)} en una visita de MP Group`;
// galería de fotos reales; "skip" evita repetir las que ya se usaron en la página
function realGallery({ id, title, sub, items, cls = '' }) {
  if (items.length < 3) return '';
  return `<section class="section section--real${cls}" aria-labelledby="${id}"><div class="wrap">
  <div class="section-head rv"><h2 id="${id}">${esc(title)}</h2><p>${esc(sub)}</p></div>
  <ul class="rgal${items.filter(r => !r.vertical).length > items.length / 2 ? ' rgal--wide' : ''}">${items.map(r => `<li class="rgal-i${r.vertical ? '' : ' is-wide'}"><figure>${picture(r.base, realAlt(r), { sizes: '(max-width:640px) 60vw, (max-width:1080px) 25vw, 230px' })}<figcaption>${icon('check')}${esc(realCap(r))}</figcaption></figure></li>`).join('')}</ul>
  <p class="rgal-note">${icon('shield')}Fotos de visitas de nuestros técnicos. Retocamos el fondo para cuidar la privacidad de cada casa.</p>
</div></section>`;
}
const realBadge = () => `<span class="real-badge">${icon('check')}Equipo real de una visita</span>`;
const heroForService = s => prefHero('svc:' + s.slug, realFor(s.slug)) || (realFor(s.slug)[0] || {}).base || gen('svc-' + s.slug) || s.heroImage || HERO_FALLBACK[s.slug];
const BRAND_GEN = {
  'service-samsung': 'svc-heladeras', 'service-de-heladeras-samsung': 'svc-heladeras', 'service-lg': 'svc-aire-acondicionado',
  'service-ariston': 'svc-hornos-y-cocinas', 'service-domec': 'svc-calefones', 'service-orbis': 'svc-estufas',
  'service-calefones-orbis': 'svc-calefones', 'service-electrolux': 'svc-lavarropas', 'service-de-hornos-y-cocinas-electrolux': 'svc-hornos-y-cocinas',
  'service-longvie': 'svc-termotanques', 'service-whirlpool': 'svc-secarropas', 'service-general-electric': 'svc-lavavajillas',
};
// Fotos de producto que faltaban o estaban cambiadas de marca (revisadas a ojo)
const PRODUCT_FIX = {
  'service-samsung|Lavarropas Samsung': 'lavarropas-s1', 'service-samsung|Aires acondicionados Samsung': 'aire-s1', 'service-samsung|Heladeras Samsung': 'heladeras-s1',
  'service-de-heladeras-samsung|Heladeras Samsung': 'heladeras-s1',
  'service-longvie|Calefones Longvie': 'longvie02', 'service-longvie|Lavarropas Longvie': 'longvie03', 'service-longvie|Cocinas Longvie': 'longvie06',
  'service-whirlpool|Freezers Whirlpool': 'service-de-freezers-whirlpool-mp-group', 'service-whirlpool|Lavavajillas Whirlpool': 'lavavajillas-lg-mp-group',
  'service-general-electric|Heladeras General Electric': 'heladeras1',
};

// ---------------------------------------------------------------- utilidades
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const icon = (id, cls = 'ico') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
// El sprite va dentro de cada página: un pedido menos y los íconos nunca quedan en blanco
const SPRITE = fs.readFileSync(path.join(ROOT, 'site/assets/icons.svg'), 'utf8').replace('<svg xmlns="http://www.w3.org/2000/svg">', '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">').replace(/\r?\n/g, '');
// api.whatsapp.com y no wa.me: el GTM de MP Group cuenta la conversión de Google Ads con clics a "https://api.whatsapp.com/"
const waUrl = text => `https://api.whatsapp.com/send?phone=${SITE.wa}&text=${encodeURIComponent(text)}`;
// Íconos de electrodomésticos en línea (no <use>), con pathLength para poder trazarlos y piezas animables (.p-*)
const SYMBOLS = Object.fromEntries([...fs.readFileSync(path.join(ROOT, 'site/assets/icons.svg'), 'utf8').matchAll(/<symbol id="i-([^"]+)" viewBox="([^"]+)"([^>]*)>(.*?)<\/symbol>/gs)].map(m => [m[1], { vb: m[2], attrs: m[3], inner: m[4] }]));
const iconLive = (id, cls = 'ico ico-live') => {
  const s = SYMBOLS[id];
  if (!s) return icon(id, cls);
  return `<svg class="${cls}" viewBox="${s.vb}"${s.attrs} aria-hidden="true">${s.inner.replace(/<(path|rect|circle)(?![^>]*pathLength)/g, '<$1 pathLength="1"')}</svg>`;
};
const svcBySlug = Object.fromEntries(servicios.map(s => [s.slug, s]));
const fmtDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
const lc1 = s => s.charAt(0).toLowerCase() + s.slice(1);
const initials = n => n.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();

function imgEntry(ref) {
  if (!ref) return null;
  if (imgMap[ref]) return imgMap[ref];
  const base = ref.replace(/^\d{4}_\d{2}_/, '').replace(/\.(webp|png|jpe?g)$/i, '').replace(/-scaled$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return Object.values(imgMap).find(e => e.base === base) || null;
}
const usedImages = new Set();
// versión por fecha del archivo: si una foto se reemplaza (p. ej. limpiada), el navegador no muestra la vieja guardada
const imgV = file => { try { return '?v=' + Math.round(fs.statSync(path.join(SRC, 'assets/img/m', file)).mtimeMs).toString(36).slice(-6); } catch (e) { return ''; } };
function picture(ref, alt, { sizes = '100vw', eager = false, cls = '' } = {}) {
  const e = imgEntry(ref);
  if (!e) return '';
  const s = [...e.sizes].sort((a, b) => a.w - b.w);
  s.forEach(x => usedImages.add(x.file));
  const big = s[s.length - 1];
  const srcset = s.length > 1 ? ` srcset="${s.map(x => `/assets/img/m/${x.file}${imgV(x.file)} ${x.w}w`).join(', ')}" sizes="${sizes}"` : '';
  return `<img${cls ? ` class="${cls}"` : ''} src="/assets/img/m/${(eager ? big : s[0]).file}${imgV((eager ? big : s[0]).file)}"${srcset} width="${big.w}" height="${big.h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
}
// ruta de la versión chica (para vistas previas que carga el JS)
function imgSrc(ref) {
  const e = imgEntry(ref);
  if (!e) return null;
  const small = [...e.sizes].sort((a, b) => a.w - b.w)[0];
  usedImages.add(small.file);
  return `/assets/img/m/${small.file}${imgV(small.file)}`;
}
function imgUrl(ref) {
  const e = imgEntry(ref);
  if (!e) return null;
  const big = [...e.sizes].sort((a, b) => b.w - a.w)[0];
  usedImages.add(big.file);
  return `${SITE.url}/assets/img/m/${big.file}${imgV(big.file)}`;
}

blog.forEach(p => { if (!p.image && POST_GEN[p.slug] && imgEntry(POST_GEN[p.slug])) p.image = POST_GEN[p.slug]; });
const pages = []; // {path, html, priority}
function emit(urlPath, html, priority = 0.6) {
  const dir = path.join(DIST, urlPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  pages.push({ path: urlPath, priority });
}

// ---------------------------------------------------------------- esquema
const ORG_ID = `${SITE.url}/#empresa`;
const business = {
  '@type': 'LocalBusiness',
  '@id': ORG_ID,
  name: SITE.name,
  legalName: SITE.legal,
  description: 'Servicio técnico y reparación de electrodomésticos a domicilio en CABA y Zona Norte.',
  url: SITE.url + '/',
  logo: `${SITE.url}/assets/img/logo-mp-512.png`,
  image: `${SITE.url}/assets/img/og.jpg`,
  telephone: SITE.tel,
  email: SITE.email,
  address: { '@type': 'PostalAddress', streetAddress: SITE.street, addressLocality: SITE.barrio, addressRegion: SITE.city, postalCode: SITE.cp, addressCountry: 'AR' },
  geo: { '@type': 'GeoCoordinates', latitude: SITE.geo[0], longitude: SITE.geo[1] },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '15:00' },
  ],
  areaServed: [{ '@type': 'City', name: 'Ciudad Autónoma de Buenos Aires' }, ...ZONES['Zona Norte'].map(n => ({ '@type': 'Place', name: `${n}, Buenos Aires` }))],
  hasMap: SITE.maps,
  contactPoint: [{ '@type': 'ContactPoint', telephone: SITE.tel2, contactType: 'customer service', areaServed: 'AR', availableLanguage: 'es' }],
};
const crumbsLd = items => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE.url + url })) });
const faqLd = faqs => faqs?.length ? ({ '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }) : null;

// ---------------------------------------------------------------- piezas comunes
function head({ title, description, url, image, type = 'website', ld = [], noindex = false }) {
  const og = image || `${SITE.url}/assets/img/og.jpg`;
  const graph = { '@context': 'https://schema.org', '@graph': [business, ...ld.filter(Boolean)] };
  return `<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${SITE.url}${url}">
${noindex || PREVIEW ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#1c2b33">
<meta property="og:locale" content="es_AR">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="MP Group">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${SITE.url}${url}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/archivo-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=${ASSET_V}">
<script>document.documentElement.classList.add('js');if((navigator.deviceMemory||8)<=2||(navigator.hardwareConcurrency||8)<=2)document.documentElement.classList.add('lite');window.dataLayer=window.dataLayer||[];${PREVIEW ? '' : `dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});addEventListener('load',function(){var go=function(){var j=document.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=${SITE.gtm}';document.head.appendChild(j)};'requestIdleCallback' in window?requestIdleCallback(go,{timeout:2000}):setTimeout(go,1000)});`}addEventListener('pagereveal',function(e){if(!e.viewTransition)return;try{var c=JSON.parse(sessionStorage.getItem('mp-vt')||'null');sessionStorage.removeItem('mp-vt');if(c&&Date.now()-c.t<5000){var r=document.documentElement;r.style.setProperty('--vx',c.x+'px');r.style.setProperty('--vy',c.y+'px');r.classList.add('vt-circle');e.viewTransition.finished.finally(function(){r.classList.remove('vt-circle')})}}catch(_){}});</script>
<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, '\\u003c')}</script>
</head>`;
}

const brandPagesForMenu = marcas.map(m => ({ slug: m.slug, name: m.name }));

function header(current) {
  const svcLinks = servicios.map(s => `<a href="/${s.slug}/">${icon(s.slug)}${esc(s.name)}</a>`).join('');
  const brandLinks = brandPagesForMenu.map(m => `<a href="/${m.slug}/">${esc(m.name)}</a>`).join('');
  const cur = p => current === p ? ' aria-current="page"' : '';
  return `<body>
<div class="bg-dots" aria-hidden="true"></div>
${PREVIEW ? '' : `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${SITE.gtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`}
${SPRITE}
<a class="skip" href="#contenido">Saltar al contenido</a>
<aside class="topbar" aria-label="Datos de contacto"><div class="wrap">
  <div class="topbar-group">
    <span class="topbar-item">${icon('phone')}<a href="tel:${SITE.tel}" data-cta="topbar">Tel. ${SITE.telShow}</a></span>
    <span class="topbar-item">${icon('wa')}<a href="${waUrl('Hola MP Group, quiero consultar por un service.')}" data-cta="topbar" target="_blank" rel="noopener">WhatsApp ${SITE.waShow}</a></span>
  </div>
  <div class="topbar-group">
    <span class="topbar-item topbar-hours">${icon('clock')}Lunes a viernes de 9 a 18 h, sábados de 9 a 15 h</span>
    <span class="topbar-item topbar-addr">${icon('pin')}${SITE.barrio}, CABA</span>
  </div>
</div></aside>
<header class="header"><div class="wrap">
  <a class="brand" href="/" aria-label="MP Group, ir al inicio"><img src="/assets/img/logo-mp-260.webp" width="260" height="158" alt="MP Group Reparaciones"></a>
  <nav class="nav" aria-label="Principal"><ul class="nav-list">
    <li class="nav-item" data-menu><button class="nav-link" aria-expanded="false" aria-controls="m-serv">Servicios${icon('chevron')}</button>
      <div class="mega" id="m-serv"><div class="mega-grid">${svcLinks}</div><div class="mega-foot">Reparamos línea blanca de todas las marcas en CABA y Zona Norte.</div></div></li>
    <li class="nav-item" data-menu><button class="nav-link" aria-expanded="false" aria-controls="m-marcas">Marcas${icon('chevron')}</button>
      <div class="mega" id="m-marcas"><div class="mega-grid mega-grid--brands">${brandLinks}</div></div></li>
    <li><a class="nav-link" href="/nosotros/"${cur('nosotros')}>Nosotros</a></li>
    <li><a class="nav-link" href="/blog/"${cur('blog')}>Blog</a></li>
    <li><a class="nav-link" href="/contacto/"${cur('contacto')}>Contacto</a></li>
  </ul></nav>
  <div class="header-cta">
    <a class="header-phone" href="tel:${SITE.tel}" data-cta="header">${icon('phone')}${SITE.telShow}</a>
    <a class="btn btn--wa btn--sm" href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="header">${icon('wa')}WhatsApp</a>
    <button class="menu-btn" aria-expanded="false" aria-controls="drawer" aria-label="Abrir menú">${icon('menu')}</button>
  </div>
</div></header>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menú">
  <div class="drawer-top"><a class="brand" href="/"><img src="/assets/img/logo-mp-260.webp" width="104" height="63" alt="MP Group"></a><button class="menu-btn drawer-close" aria-label="Cerrar menú">${icon('close')}</button></div>
  <div class="drawer-body">
    <details open><summary>Servicios${icon('chevron')}</summary><div class="drawer-sub">${svcLinks}</div></details>
    <details><summary>Marcas${icon('chevron')}</summary><div class="drawer-sub">${brandLinks}</div></details>
    <a class="drawer-link" href="/nosotros/">Nosotros</a>
    <a class="drawer-link" href="/blog/">Blog</a>
    <a class="drawer-link" href="/contacto/">Contacto</a>
    <a class="drawer-link" href="/trabaja-con-nosotros/">Trabajá con nosotros</a>
  </div>
  <div class="drawer-foot">
    <a class="btn btn--wa btn--block" href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="menu-movil">${icon('wa')}Escribinos por WhatsApp</a>
    <a class="btn btn--line btn--block" href="tel:${SITE.tel}" data-cta="menu-movil">${icon('phone')}Llamar al ${SITE.telShow}</a>
  </div>
</div>
<main id="contenido">`;
}

// Soledad, la asistente virtual (robot; el nombre lo eligió MP Group) (parpadea y mueve la antena por CSS)
const BOT = (cls = 'bot') => `<svg class="${cls}" viewBox="0 0 48 48" aria-hidden="true"><line x1="24" y1="5.5" x2="24" y2="11" stroke="#405965" stroke-width="2.4" stroke-linecap="round"/><circle class="bot-ant" cx="24" cy="5" r="3.3" fill="#289eba"/><rect x="5.5" y="19" width="4.5" height="11" rx="2.2" fill="#289eba"/><rect x="38" y="19" width="4.5" height="11" rx="2.2" fill="#289eba"/><rect x="8.5" y="10.5" width="31" height="28" rx="10.5" fill="#405965"/><rect x="12.5" y="15.5" width="23" height="14.5" rx="7.2" fill="#1c2b33"/><g class="bot-eyes"><ellipse cx="19.4" cy="22.8" rx="2.7" ry="3.3" fill="#8fe8f8"/><ellipse cx="28.6" cy="22.8" rx="2.7" ry="3.3" fill="#8fe8f8"/></g><path d="M19.6 33.6q4.4 2.8 8.8 0" stroke="#8fe8f8" stroke-width="2.1" fill="none" stroke-linecap="round"/></svg>`;

function footer({ waText = 'Hola MP Group, quiero consultar por un service.', builder = '' } = {}) {
  const year = new Date().getFullYear();
  return `</main>
<footer class="footer"><div class="wrap">
  <div class="footer-grid">
    <div class="footer-brand">
      <img src="/assets/img/logo-mp-white-300.webp" width="300" height="182" alt="MP Group Reparaciones" loading="lazy">
      <p>Servicio técnico y reparación de electrodomésticos a domicilio en CABA y Zona Norte. Más de 20 años resolviendo en el día.</p>
    </div>
    <nav aria-label="Servicios"><h2>Servicios</h2><ul>${servicios.map(s => `<li><a href="/${s.slug}/">Service de ${esc(s.noun || lc1(s.name))}</a></li>`).join('')}</ul></nav>
    <nav aria-label="Marcas y empresa"><h2>Marcas</h2><ul>${Object.entries(BRAND_PAGE).map(([b, s]) => `<li><a href="/${s}/">Service ${esc(b)}</a></li>`).join('')}</ul>
      <h2 style="margin-top:26px">Empresa</h2><ul><li><a href="/nosotros/">Nosotros</a></li><li><a href="/blog/">Blog</a></li><li><a href="/trabaja-con-nosotros/">Trabajá con nosotros</a></li><li><a href="/contacto/">Contacto</a></li></ul></nav>
    <div><h2>Contacto</h2><ul class="footer-contact">
      <li>${icon('wa')}<a href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="footer">WhatsApp ${SITE.waShow}</a></li>
      <li>${icon('phone')}<span><a href="tel:${SITE.tel}" data-cta="footer">${SITE.telShow}</a> / <a href="tel:${SITE.tel2}" data-cta="footer">${SITE.tel2Show}</a></span></li>
      <li>${icon('mail')}<a href="mailto:${SITE.email}" data-cta="footer">${SITE.email}</a></li>
      <li>${icon('pin')}<a href="${SITE.maps}" target="_blank" rel="noopener">${SITE.street}, ${SITE.barrio}, CABA</a></li>
      <li>${icon('clock')}<span>Lunes a viernes de 9 a 18 h<br>Sábados de 9 a 15 h</span></li>
    </ul></div>
  </div>
  <div class="footer-bottom">
    <p>Aviso legal: las marcas y logotipos mencionados en este sitio pertenecen a sus respectivos dueños y se nombran solo para indicar con qué equipos trabajamos. MP Group es un servicio técnico independiente.</p>
    <p>© ${year} ${SITE.legal}. Todos los derechos reservados.</p>
  </div>
</div>
<div class="footer-mark" aria-hidden="true"><span>MP GROUP</span></div>
</footer>
<button class="chat-launch" type="button" aria-controls="chat" aria-expanded="false" aria-label="¿Tenés alguna duda? Abrí a Soledad, la asistente virtual" data-chat-open><span class="cl-bubble" aria-hidden="true">¡Hola! Soy <b>Soledad</b>, la asistente virtual de MP Group.<br>¿Tenés alguna duda?</span><span class="chat-launch-ico">${BOT()}</span><span class="chat-launch-txt">¿Tenés alguna duda?</span></button>
<section class="chat" id="chat" role="dialog" aria-labelledby="chat-t" hidden>
  <header class="chat-head">
    <span class="chat-bot">${BOT()}</span>
    <div class="chat-who"><p class="chat-t" id="chat-t">Soledad <span>· asistente virtual de MP Group</span></p><p class="chat-s"><span class="status-dot" data-status-dot></span>Respuestas automáticas al instante</p></div>
    <button class="chat-icon-btn chat-reset" type="button" aria-label="Empezar de nuevo" title="Empezar de nuevo">${icon('reset')}</button>
    <button class="chat-icon-btn chat-close" type="button" aria-label="Cerrar el asistente">${icon('close')}</button>
  </header>
  <div class="chat-log" role="log" aria-live="polite"></div>
  <div class="chat-chips" aria-label="Preguntas sugeridas"></div>
  <form class="chat-form"><label class="sr-only" for="chat-in">Escribí tu consulta</label><input id="chat-in" class="chat-input" autocomplete="off" enterkeyhint="send" placeholder="Escribí tu consulta…"><button class="chat-send" type="submit" aria-label="Enviar">${icon('arrow')}</button></form>
  <p class="chat-foot">Para coordinar la visita te pasamos con una persona por WhatsApp.</p>
</section>
<a class="wa-float" href="${waUrl(waText)}" target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp" data-cta="flotante">${icon('wa')}</a>
<nav class="mobile-bar" aria-label="Contacto rápido">
  <button class="btn btn--line mobile-chat" type="button" aria-controls="chat" aria-expanded="false" data-chat-open>${BOT('bot bot--mini')}Dudas</button>
  <a class="btn btn--line" href="tel:${SITE.tel}" data-cta="barra-movil">${icon('phone')}Llamar</a>
  <a class="btn btn--wa" href="${waUrl(waText)}" target="_blank" rel="noopener" data-cta="barra-movil">${icon('wa')}<span class="hide-xs">Escribinos por&nbsp;</span>WhatsApp</a>
</nav>
${builder}<script src="/assets/js/site.js?v=${ASSET_V}" defer></script>
<script src="/assets/js/bg.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

const arcsSvg = (cls, a = 'var(--teal)', b = 'var(--slate)') => `<svg class="${cls}" viewBox="0 0 1000 1000" aria-hidden="true"><path class="arc-a" pathLength="1" d="M780 190 A420 420 0 1 0 820 760" style="stroke:${a}"/><path class="arc-b" pathLength="1" d="M700 260 A330 330 0 1 0 760 700" style="stroke:${b}"/></svg>`;

function crumbs(items) {
  return `<nav aria-label="Ubicación"><ol class="crumbs">${items.map(([n, u], i) => i < items.length - 1 ? `<li><a href="${u}">${esc(n)}</a></li>` : `<li aria-current="page">${esc(n)}</li>`).join('')}</ol></nav>`;
}

function faqBlock(faqs, title = 'Preguntas frecuentes', enamel = false) {
  if (!faqs?.length) return '';
  return `<section class="section${enamel ? ' section--enamel' : ''}" aria-labelledby="faq-t"><div class="wrap">
  <div class="section-head"><h2 id="faq-t">${esc(title)}</h2></div>
  <div class="faq">${faqs.map(f => `<details><summary>${esc(f.q)}<span class="plus" aria-hidden="true"></span></summary><div class="answer"><p>${esc(f.a)}</p></div></details>`).join('')}</div>
</div></section>`;
}

function coverageBlock(title = 'Zona de cobertura', intro = 'Vamos a domicilio en toda la Ciudad de Buenos Aires y en Zona Norte. Tocá tu barrio en el mapa y pedí la visita.') {
  const chip = b => `<li><a href="${waUrl(`Hola MP Group, estoy en ${b} y necesito un service.`)}" target="_blank" rel="noopener" data-cta="cobertura-lista">${b}</a></li>`;
  return `<section class="section section--enamel" aria-labelledby="cob-t"><div class="wrap coverage">
  <div>
    <div class="section-head rv"><h2 id="cob-t">${esc(title)}</h2><p>${esc(intro)}</p></div>
    <div class="zones">${Object.entries(ZONES).map(([z, list]) => `<div><h3>${icon('pin')}${z}</h3><ul class="zone-list">${list.map(chip).join('')}${z === 'CABA' ? '<li><span>y todos los barrios</span></li>' : ''}</ul></div>`).join('')}</div>
    <div class="office">
      <div class="office-row">${icon('pin')}<span><b>Oficina en ${SITE.barrio}</b><br>${SITE.street}, ${SITE.cp}, CABA</span></div>
      <div class="office-row">${icon('clock')}<span><b>Atención</b><br>Lunes a viernes de 9 a 18 h y sábados de 9 a 15 h</span></div>
      <a class="textlink" href="${SITE.maps}" target="_blank" rel="noopener">Ver en Google Maps${icon('arrow')}</a>
    </div>
  </div>
  <div class="cov-map" data-map>
    <div class="cov-map-canvas" aria-hidden="true"></div>
    <div class="cov-card" aria-live="polite">
      <p class="cov-card-hint">${icon('pin')}Tocá tu barrio en el mapa</p>
      <div class="cov-card-hit" hidden><div><span class="cov-card-name"></span><span class="cov-card-ok">${icon('check')}Llegamos a domicilio</span></div><a class="btn btn--wa btn--sm" href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="cobertura-mapa">${icon('wa')}Pedir visita</a></div>
    </div>
  </div>
</div></section>`;
}

function ctaBlock({ title = '¿Se rompió algo en casa? Escribinos y coordinamos la visita.', text = 'Contanos qué electrodoméstico es, la marca y qué le pasa. Te respondemos por WhatsApp y te damos un rango horario para la visita.', wa = 'Hola MP Group, quiero consultar por un service.', cta = 'cta-final' } = {}) {
  return `<section class="section" aria-label="Contacto"><div class="wrap"><div class="cta" data-spot>
  ${arcsSvg('cta-arcs')}
  <div style="position:relative"><h2 class="rv">${esc(title)}</h2><p>${esc(text)}</p></div>
  <div class="cta-actions">
    <a class="btn btn--wa" href="${waUrl(wa)}" target="_blank" rel="noopener" data-cta="${cta}">${icon('wa')}Escribinos por WhatsApp</a>
    <a class="btn btn--line" href="tel:${SITE.tel}" data-cta="${cta}">${icon('phone')}Llamar al ${SITE.telShow}</a>
    <div class="cta-hours" data-status>${icon('clock')}Lunes a viernes de 9 a 18 h, sábados de 9 a 15 h</div>
  </div>
</div></div></section>`;
}

// la tuerca de "repuestos" gira despacio en todo el sitio (fx.css: use[href="#i-nut"])
const FACTS = [['van', 'Técnico en el día o en 24 h'], ['nut', 'Repuestos originales'], ['shield', 'Trabajos con garantía'], ['receipt', 'Factura A o B']];
const factsStrip = () => `<div class="facts-strip"><div class="wrap"><ul>${FACTS.map(([i, t]) => `<li>${icon(i)}${t}</li>`).join('')}</ul></div></div>`;

// la foto lleva view-transition-name: al abrir la nota se transforma en la portada del artículo
function postCard(p, variant) {
  const row = variant === 'row';
  const vt = ` style="view-transition-name:post-${p.slug}"`;
  return `<a class="post-card${row ? ' post-card--row' : ''}" href="/blog/${p.slug}/">
  ${p.image && imgEntry(p.image) ? `<div class="post-media tone"${vt}>${picture(p.image, '', { sizes: row ? '160px' : '(max-width:640px) 100vw, (max-width:1080px) 50vw, 400px' })}</div>` : `<div class="post-media post-media--icon"${vt}>${icon(p.related || 'lavarropas')}</div>`}
  <div class="post-body"><div class="post-meta"><time datetime="${p.date}">${fmtDate(p.date)}</time><span>${p.readingMinutes} min de lectura</span></div><h3>${esc(p.title)}</h3>${row ? '' : `<p>${esc(p.excerpt)}</p>`}</div>
</a>`;
}

// ---------------------------------------------------------------- BENTO "por qué nos eligen"
function bento(title = 'Por qué nos eligen', sub = 'Lo que hace que un service sea confiable, en seis datos.') {
  return `<section class="section section--bento" aria-labelledby="bt-t"><div class="wrap">
  <div class="section-head rv"><h2 id="bt-t">${esc(title)}</h2><p>${esc(sub)}</p></div>
  <div class="bento">
    <div class="bento-cell b-years tone">${picture(gen('taller-capacitacion') || 'hero-nosotros', '', { sizes: '(max-width:960px) 100vw, 600px' })}
      <div class="b-years-txt"><p class="b-big"><span data-count="20">20</span><span class="b-unit">años</span></p><p>reparando electrodomésticos en CABA y Zona Norte, con técnicos que se capacitan todo el tiempo.</p></div></div>
    <div class="bento-cell b-visit">
      <svg class="b-route" viewBox="0 0 320 100" aria-hidden="true"><path class="b-route-line" d="M26 80 C 100 30, 200 26, 258 58"/><circle class="b-route-a" cx="26" cy="80" r="6"/><g class="b-route-b" transform="translate(291 66)"><g class="b-home"><circle r="15"/><path d="M-6.5 1.5 0-5 6.5 1.5M-4.5.5v6h9v-6" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g></g>
        <g class="b-van" transform="translate(26 80) rotate(-34) scale(.9)"><path class="bv-body" d="M-17-4.5V-17a3 3 0 0 1 3-3H6.2a3 3 0 0 1 2.4 1.2L14-12.2l3.3 1.3a2 2 0 0 1 1.3 1.9v4.5A1.5 1.5 0 0 1 17.1-3H-15.5A1.5 1.5 0 0 1-17-4.5z"/><path class="bv-glass" d="M8.2-17.6 12.6-12H7v-5.6z"/><rect class="bv-glass" x="-3" y="-17.6" width="7.6" height="5.6" rx="1.2"/><rect class="bv-stripe" x="-17" y="-9.4" width="31.5" height="2.4"/><circle class="bv-light" cx="17.4" cy="-7.4" r="1.1"/><g transform="translate(-9.5 -3)"><g class="bv-wh"><circle r="4.2"/><path d="M-2.4 0h4.8M0-2.4v4.8"/></g></g><g transform="translate(9.5 -3)"><g class="bv-wh"><circle r="4.2"/><path d="M-2.4 0h4.8M0-2.4v4.8"/></g></g></g></svg>
      <h3>Visita en el día o en 24 horas</h3><p>Coordinamos un rango horario por WhatsApp y el técnico va a tu casa.</p></div>
    <div class="bento-cell b-parts"><span class="b-ico"><svg class="ico nut" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6 20.1 7.3v9.4L12 21.4 3.9 16.7V7.3z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.7" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 8.3v-1.6M15.2 13.9l1.4.8M8.8 13.9l-1.4.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".55"/></svg></span><h3>Repuestos originales</h3><p>Llevamos lo necesario para resolver en la misma visita.</p></div>
    <div class="bento-cell b-warranty"><span class="b-ico">${icon('shield')}</span><h3>Con garantía</h3><p>Todos los trabajos tienen garantía.</p></div>
    <a class="bento-cell b-reviews" href="${SITE.maps}" target="_blank" rel="noopener"><span class="g-badge">${icon('google')}</span><p class="b-kick">Calificación en Google</p><p class="b-big b-big--sm">Excelente</p><span class="stars" role="img" aria-label="5 de 5 estrellas">${icon('star').repeat(5)}</span><p>Así nos califican los clientes en más de <span data-count="670">670</span> reseñas</p></a>
    <div class="bento-cell b-pay"><span class="b-ico">${icon('receipt')}</span><h3>Pagás como te quede cómodo</h3><p>Efectivo o transferencia, con factura A o B.</p>
      <div class="b-ticket" aria-hidden="true"><div class="tk-paper">
        <div class="tk-top"><span class="tk-co">MP GROUP S.R.L.</span><span class="tk-type"><i>A</i><i>B</i></span></div>
        <span class="tk-title">FACTURA</span>
        <span class="tk-line"></span><span class="tk-line tk-line--s"></span><span class="tk-line"></span>
        <div class="tk-pay"><span>Efectivo</span><span>Transferencia</span></div>
        <span class="tk-stamp">PAGADO</span>
      </div></div></div>
  </div>
</div></section>`;
}

// ---------------------------------------------------------------- HOME
const quote = ([n, dt, t]) => `<figure class="quote"><span class="stars" role="img" aria-label="5 estrellas">${icon('star').repeat(5)}</span><blockquote>${esc(t)}</blockquote><figcaption><span class="avatar" aria-hidden="true">${initials(n)}</span><span><b>${esc(n)}</b>Google, ${new Date(dt + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span></figcaption></figure>`;
const GR_COLORS = ['#1a73e8', '#e8710a', '#188038', '#d93025', '#9334e6', '#12b5cb', '#c5221f', '#f29900', '#1967d2', '#b06000'];
const gWord = () => '<span class="g-word" aria-label="Google"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></span>';
const gReview = ([n, dt, t], i) => `<li class="gr-card"><div class="gr-head"><span class="gr-av" style="--c:${GR_COLORS[i % GR_COLORS.length]}" aria-hidden="true">${initials(n).slice(0, 1)}</span><span class="gr-who"><b>${esc(n)}</b><span>${new Date(dt + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span></span><span class="gr-g" title="Reseña de Google">${icon('google')}</span></div><span class="stars gr-stars" role="img" aria-label="5 de 5 estrellas">${icon('star').repeat(5)}</span><p>${esc(t)}</p></li>`;

function home() {
  const builderData = Object.fromEntries(servicios.map(s => [s.slug, {
    noun: SINGULAR[s.slug] || s.noun,
    brands: s.brands || [],
    faults: s.faults.map(f => ({ t: f.t, wa: f.wa })),
  }]));
  // termotanques no trae marcas en el contenido: se ofrecen las que aparecen en el resto del sitio para ese equipo
  builderData.termotanques.brands = ['Longvie', 'Orbis', 'Domec', 'Ariston'];

  const homeFaqs = [
    { q: '¿Qué electrodomésticos reparan?', a: 'Reparamos línea blanca: lavarropas, secarropas, lavavajillas, heladeras, termotanques, calefones, hornos y cocinas, estufas y aire acondicionado, de las principales marcas.' },
    { q: '¿Cómo pido una visita técnica?', a: 'Escribinos por WhatsApp o llamanos. Un operador toma los datos del equipo y de la falla para cargar el servicio, así el técnico llega preparado para resolverlo. También podés escribirnos por mail.' },
    { q: '¿Cuánto tarda en llegar el técnico?', a: 'Una vez cargado el servicio, el técnico te visita en el día o dentro de las 24 horas y lleva los repuestos necesarios para hacer la reparación en el momento. Puede haber excepciones en épocas de mucha demanda.' },
    { q: '¿Cuánto cuesta la visita?', a: 'Depende del equipo, de la falla y de los repuestos. Escribinos por WhatsApp con la marca y qué le pasa, y te informamos el costo.' },
    { q: '¿Cómo se paga el servicio?', a: 'Podés pagar en efectivo o por transferencia bancaria. Emitimos factura A o B, según corresponda.' },
    { q: '¿Los trabajos tienen garantía?', a: 'Sí. Todos nuestros servicios cuentan con garantía y trabajamos con repuestos originales.' },
    { q: '¿En qué zonas trabajan?', a: 'Vamos a domicilio en toda la Ciudad de Buenos Aires y en Zona Norte: Vicente López, Olivos, La Lucila, San Isidro, Acassuso, Béccar y Tigre, entre otras localidades.' },
  ];

  const title = 'Servicio técnico y reparación de electrodomésticos | MP Group';
  const description = 'Service de electrodomésticos a domicilio en CABA y Zona Norte: lavarropas, heladeras, calefones, cocinas y más. Técnico en menos de 24 h por WhatsApp.';
  const html = head({ title, description, url: '/', ld: [{ '@type': 'WebSite', '@id': `${SITE.url}/#web`, url: SITE.url + '/', name: 'MP Group', inLanguage: 'es-AR', publisher: { '@id': ORG_ID } }, faqLd(homeFaqs)] })
  + header('inicio') + `
<section class="hero">
  ${arcsSvg('hero-arcs')}
  <div class="wrap">
    <div class="hero-copy">
      <p class="kicker">Service a domicilio en CABA y Zona Norte</p>
      <h1 class="h1-lines"><span class="ln"><span>Servicio técnico</span></span> <span class="ln"><span>y reparación de</span></span> <span class="ln"><span>electrodomésticos</span></span></h1>
      <p class="lead">Un técnico va a tu casa en el día o dentro de las 24 horas, con los repuestos para dejar tu equipo funcionando en la misma visita.</p>
      <div class="btn-row hero-cta">
        <a class="btn btn--wa" href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="hero-movil">${icon('wa')}Escribinos por WhatsApp</a>
        <a class="btn btn--line" href="#consulta">Armá tu consulta</a>
      </div>
      <ul class="facts">
        <li>${icon('van')}Visita en el día o en 24 h</li>
        <li>${icon('nut')}Repuestos originales</li>
        <li>${icon('shield')}Garantía en todos los trabajos</li>
        <li>${icon('receipt')}Factura A o B</li>
      </ul>
      <a class="rating" href="${SITE.maps}" target="_blank" rel="noopener">
        <span class="g-badge">${icon('google')}</span>
        <span class="stars" aria-hidden="true">${icon('star').repeat(5)}</span>
        <span><b style="color:var(--ink)">Excelente</b> en Google, con más de 670 reseñas</span>
      </a>
      <p class="hero-alt">¿Preferís hablar? Llamanos al <a href="tel:${SITE.tel}" data-cta="hero">${SITE.telShow}</a>.</p>
    </div>

    <form class="panel" id="consulta" aria-labelledby="consulta-t">
      <h2 class="panel-title" id="consulta-t">Armá tu consulta</h2>
      <p class="panel-sub">Elegí el equipo, la marca y la falla: te escribimos el mensaje para mandarlo por WhatsApp.</p>
      <div class="display" aria-hidden="true">
        <div class="display-top"><span class="led"></span>Tu mensaje<span class="display-status" data-status-mini></span></div>
        <div class="display-body"><div class="display-ico"></div><p class="display-msg"></p></div>
      </div>
      <p class="sr-only" aria-live="polite" id="c-live"></p>
      <fieldset class="step" data-step="1">
        <legend><span class="step-n">1</span>¿Qué electrodoméstico es?</legend>
        <div class="app-grid">${servicios.map(s => `<div class="opt"><input type="radio" name="app" id="a-${s.slug}" value="${s.slug}"><label class="app-tile" for="a-${s.slug}">${iconLive(s.slug)}${esc(s.slug === 'aire-acondicionado' ? 'Aire acond.' : s.name)}</label></div>`).join('')}</div>
      </fieldset>
      <div class="row2">
        <div class="field step" data-step="2"><label for="c-marca"><span class="step-n">2</span>Marca</label><select class="control" id="c-marca" disabled><option value="">Primero elegí el equipo</option></select></div>
        <div class="field"><label for="c-barrio">Barrio <span class="small">(opcional)</span></label><div class="combo" data-combo data-opts="${[...ZONES.CABA, ...ZONES['Zona Norte']].join('|')}"><input class="control" id="c-barrio" role="combobox" aria-expanded="false" aria-controls="c-barrios" aria-autocomplete="list" autocomplete="off" placeholder="Por ejemplo, Belgrano"><button class="combo-btn" type="button" tabindex="-1" aria-label="Mostrar u ocultar los barrios">${icon('chevron')}</button><ul class="combo-list" id="c-barrios" role="listbox" aria-label="Barrios" hidden></ul></div></div>
      </div>
      <fieldset class="step" data-step="3" style="margin-top:16px">
        <legend><span class="step-n">3</span>¿Qué le pasa?</legend>
        <div class="chips" id="c-fallas"><p class="chips-empty">Elegí el electrodoméstico para ver las fallas más comunes.</p></div>
      </fieldset>
      <a class="btn btn--wa btn--block" id="c-enviar" href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="armador-home">${icon('wa')}Enviar consulta por WhatsApp</a>
      <p class="panel-note" data-status-note>Te respondemos de lunes a viernes de 9 a 18 h y sábados de 9 a 15 h.</p>
    </form>
  </div>
</section>

<section class="section" aria-labelledby="ap-t"><div class="wrap">
  <div class="split-head"><div class="section-head rv"><h2 id="ap-t">¿Qué electrodoméstico hay que arreglar?</h2><p>Reparamos línea blanca de todas las marcas: equipos para lavar, cocinar, enfriar y calefaccionar.</p></div></div>
  <div class="appliances" data-peek-list>${servicios.map(s => `<a class="appliance" href="/${s.slug}/" data-peek="${imgSrc(heroForService(s)) || ''}"><span class="appliance-ico" style="view-transition-name:ico-${s.slug}">${iconLive(s.slug)}</span><h3>${esc(s.name)}</h3><p>${esc(s.faults.slice(0, 3).map((f, i) => i ? lc1(f.t) : f.t).join(', '))}.</p><span class="textlink">Ver service${icon('arrow')}</span></a>`).join('')}</div>
</div></section>

${bento()}

<section class="section section--ink section--process" aria-labelledby="pr-t"><div class="wrap process2">
  <div class="process2-side">
    <div class="section-head rv"><h2 id="pr-t">Cómo es el service</h2><p>Sin vueltas: nos escribís, coordinamos y el técnico va a tu casa preparado para resolverlo.</p></div>
    <div class="process-photo tone">${picture(gen('proceso-visita') || 'fondo-cta01', 'Técnico llegando a una casa para la visita', { sizes: '(max-width:960px) 100vw, 520px' })}</div>
  </div>
  <ol class="stack">
    ${[['chat', 'Nos escribís o nos llamás', 'Contanos qué equipo es, la marca y qué le pasa. Por WhatsApp es lo más rápido.'],
       ['clock', 'Agendamos la visita', 'Un operador toma tus datos y te da un rango horario para la visita.'],
       ['van', 'El técnico va a tu casa', 'En el día o dentro de las 24 horas, con los repuestos necesarios para reparar en el momento.'],
       ['shield', 'Listo y con garantía', 'Pagás en efectivo o por transferencia, con factura A o B. Todos los trabajos tienen garantía.']]
      .map(([ic, t, d], i) => `<li class="stack-card" style="--i:${i}"><span class="stack-n" aria-hidden="true">0${i + 1}</span><span class="stack-ico">${icon(ic)}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}
    <li class="stack-card stack-card--cta" style="--i:4"><h3>¿Empezamos?</h3><p>El primer paso lleva un minuto.</p><a class="btn btn--wa" href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="proceso">${icon('wa')}Escribinos por WhatsApp</a></li>
  </ol>
</div></section>

<section class="section section--reviews" aria-labelledby="rv-t"><div class="wrap">
  <div class="section-head rv"><h2 id="rv-t">Lo que dicen nuestros clientes</h2><p>Reseñas de Google de vecinos de CABA y Zona Norte.</p></div>
  <div class="greviews" data-greviews>
    <a class="gr-summary" href="${SITE.maps}" target="_blank" rel="noopener">
      ${gWord()}<span class="gr-sub">Reseñas</span>
      <b class="gr-rating">Excelente</b>
      <span class="stars gr-stars" role="img" aria-label="5 de 5 estrellas">${icon('star').repeat(5)}</span>
      <span class="gr-count">Basado en más de <span data-count="670">670</span> reseñas</span>
      <span class="gr-link">Ver todas en Google${icon('arrow')}</span>
    </a>
    <div class="gr-main">
      <div class="gr-viewport" tabindex="0" aria-label="Reseñas de clientes, se pueden deslizar"><ul class="gr-track">${REVIEWS.map(gReview).join('')}</ul></div>
      <div class="gr-nav"><button class="gr-btn" type="button" data-gr="-1" aria-label="Ver reseñas anteriores">${icon('arrow')}</button><span class="gr-dots" aria-hidden="true"></span><button class="gr-btn" type="button" data-gr="1" aria-label="Ver más reseñas">${icon('arrow')}</button></div>
    </div>
  </div>
</div></section>

<section class="section section--ink section--brands" aria-labelledby="mk-t">
  <div class="wrap"><div class="section-head rv"><h2 id="mk-t">Marcas que reparamos</h2><p>Conocemos en detalle cada marca con la que trabajamos y usamos repuestos originales. Elegí la tuya.</p></div></div>
  <div class="brand-run" data-marquee>
    ${[0, 1].map(k => `<div class="brand-run-track"${k ? ' aria-hidden="true"' : ''}>${Object.entries(BRAND_PAGE).map(([b, sl]) => `<a class="brand-word" href="/${sl}/"${k ? ' tabindex="-1"' : ''}>${esc(b)}</a><span class="brand-sep" aria-hidden="true"></span>`).join('')}</div>`).join('')}
  </div>
  <div class="wrap">
    <p class="small" style="margin-top:22px">También trabajamos con ${OTHER_BRANDS.slice(0, -1).join(', ')} y ${OTHER_BRANDS.slice(-1)}.</p>
    <p class="legal">Las marcas mencionadas pertenecen a sus respectivos dueños. MP Group es un servicio técnico independiente.</p>
  </div>
</section>

${(() => {
  const porSvc = servicios.map(sv => realFor(sv.slug).filter(r => r.vertical).slice(1, 3));
  const items = [];
  for (let k = 0; k < 2; k++) porSvc.forEach(l => { if (l[k]) items.push(l[k]); });
  return realGallery({ id: 'rgh-t', title: 'Fotos reales de nuestras visitas', sub: 'Equipos de vecinos de CABA y Zona Norte que pasaron por las manos de nuestros técnicos.', items: items.slice(0, 6), cls: ' section--real-home' });
})()}
${coverageBlock()}
${faqBlock(homeFaqs)}
${blog.length ? `<section class="section section--enamel" aria-labelledby="bl-t"><div class="wrap">
  <div class="split-head"><div class="section-head"><h2 id="bl-t">Consejos para cuidar tus equipos</h2><p>Lo que conviene saber antes de llamar al técnico.</p></div><a class="textlink" href="/blog/">Ver todas las notas${icon('arrow')}</a></div>
  <div class="posts">${blog.slice(0, 3).map(postCard).join('')}</div>
</div></section>` : ''}
${ctaBlock()}
` + footer({ builder: `<script type="application/json" id="consulta-data">${JSON.stringify(builderData)}</script>\n` });
  emit('/', html, 1.0);
}

// ---------------------------------------------------------------- SERVICIOS
function servicePage(s) {
  const url = `/${s.slug}/`;
  const noun = SINGULAR[s.slug] || s.noun;
  const waBase = `Hola MP Group, necesito service para mi ${noun}.`;
  const hero = heroForService(s);
  const brandLinks = (s.brands || []).map(b => {
    const slug = SPECIFIC_BRAND_PAGE[`${s.slug}|${b}`] || BRAND_PAGE[b];
    return slug ? `<a class="brand-chip" href="/${slug}/">${esc(b)}${icon('arrow')}</a>` : `<span class="brand-chip">${esc(b)}</span>`;
  }).join('');
  const related = blog.filter(p => p.related === s.slug);
  const gasRelated = ['termotanques', 'calefones', 'estufas', 'hornos-y-cocinas'].includes(s.slug);
  const ld = [
    crumbsLd([['Inicio', '/'], [s.name, url]]),
    { '@type': 'Service', name: s.h1, serviceType: `Reparación de ${s.noun || noun}`, provider: { '@id': ORG_ID }, areaServed: business.areaServed, url: SITE.url + url, description: s.description },
    faqLd(s.faqs),
  ];
  const html = head({ title: s.title, description: s.description, url, image: imgUrl(hero), ld }) + header(s.slug) + `
<section class="page-hero${hero && imgEntry(hero) ? '' : ' page-hero--noimg'}">${arcsSvg('page-arcs')}<div class="wrap">
  <div>
    ${crumbs([['Inicio', '/'], ['Servicios', '/#ap-t'], [s.name, url]])}
    <div class="page-hero-title" style="margin-top:22px"><span class="page-hero-ico" style="view-transition-name:ico-${s.slug}">${iconLive(s.slug, 'ico ico-live ico-draw')}</span></div>
    <h1>${esc(s.h1)}</h1>
    <p class="lead">${esc(s.lead)}</p>
    <div class="btn-row">
      <a class="btn btn--wa" href="${waUrl(waBase)}" target="_blank" rel="noopener" data-cta="hero-servicio">${icon('wa')}Pedir visita por WhatsApp</a>
      <a class="btn btn--line" href="tel:${SITE.tel}" data-cta="hero-servicio">${icon('phone')}${SITE.telShow}</a>
    </div>
  </div>
  ${hero && imgEntry(hero) ? `<div class="page-hero-media${hero.startsWith('real-') ? ' is-real' + (REALS.find(r => r.base === hero)?.vertical ? '' : ' is-wide') : ''}">${picture(hero, hero.startsWith('real-') ? realAlt(REALS.find(r => r.base === hero)) : `Service de ${s.noun || noun} a domicilio`, { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}${hero.startsWith('real-') ? realBadge() : ''}</div>` : ''}
</div></section>
${factsStrip()}

<section class="section" aria-labelledby="fa-t"><div class="wrap">
  <div class="section-head"><h2 id="fa-t">¿Qué le pasa a tu ${esc(noun)}?</h2><p>Tocá la falla y te abrimos WhatsApp con el mensaje listo para coordinar la visita.</p></div>
  <div class="faults">${s.faults.map(f => `<a class="fault" href="${waUrl(`Hola MP Group, ${f.wa}. ¿Me pueden dar un turno para la visita?`)}" target="_blank" rel="noopener" data-cta="falla-${s.slug}"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p><span class="fault-go">${icon('wa')}Consultar por esta falla</span></a>`).join('')}</div>
</div></section>

<section class="section section--enamel" aria-labelledby="re-t"><div class="wrap two-col">
  <div class="section-head"><h2 id="re-t">Qué reparamos</h2><p>El técnico diagnostica la falla en tu casa y, en la mayoría de los casos, la resuelve en la misma visita.</p>
    <a class="btn btn--wa" style="justify-self:start;margin-top:8px" href="${waUrl(waBase)}" target="_blank" rel="noopener" data-cta="reparaciones-${s.slug}">${icon('wa')}Consultar</a></div>
  <ul class="checks">${s.repairs.map(r => `<li>${icon('check')}<div><b>${esc(r.t)}</b><span>${esc(r.d)}</span></div></li>`).join('')}</ul>
</div></section>

${brandLinks ? `<section class="section" aria-labelledby="br-t" style="padding-bottom:0"><div class="wrap">
  <div class="section-head"><h2 id="br-t">Marcas de ${esc(s.noun || noun)} que reparamos</h2><p>Trabajamos con las marcas más usadas del mercado, con repuestos originales.</p></div>
  <div class="brand-chips">${brandLinks}</div>
</div></section>` : ''}

${s.tips?.items?.length ? `<section class="section" aria-labelledby="ti-t"><div class="wrap">
  <div class="section-head"><h2 id="ti-t">${esc(s.tips.title)}</h2>${s.tips.intro ? `<p>${esc(s.tips.intro)}</p>` : ''}</div>
  <div class="tips">${s.tips.items.map(t => `<div class="tip"><h3>${esc(t.t)}</h3><p>${esc(t.d)}</p></div>`).join('')}</div>
  ${gasRelated ? `<div class="notice">${icon('shield')}<span>Si sentís olor a gas, cerrá la llave de paso, ventilá el ambiente y no accionés interruptores. Cualquier trabajo sobre la instalación de gas lo tiene que hacer un técnico.</span></div>` : ''}
</div></section>` : ''}

${faqBlock(s.faqs, 'Preguntas frecuentes', true)}

<section class="section" aria-labelledby="ab-t"><div class="wrap about-svc${related.length ? '' : ' about-svc--solo'}">
  <div class="about-svc-text">
    <h2 id="ab-t">Sobre el service de ${esc(s.noun || noun)}</h2>
    <div class="prose">${(s.seoText || []).map(p => `<p>${esc(p)}</p>`).join('')}</div>
  </div>
  ${related.length ? `<div class="about-svc-blog"><div class="split-head" style="margin-bottom:16px"><h3>Del blog</h3><a class="textlink" href="/blog/">Ver todas${icon('arrow')}</a></div>
    <div class="post-list">${related.slice(0, 3).map(p => postCard(p, 'row')).join('')}</div></div>` : ''}
</div></section>

${realGallery({ id: 'rg-t', title: `${s.name} que reparamos`, sub: 'Algunos de los equipos que atendimos en casas de CABA y Zona Norte.', items: realFor(s.slug).filter(r => r.base !== hero).slice(0, 6) })}
${coverageBlock(`Service de ${s.noun || noun} a domicilio`)}
${ctaBlock({ title: `¿Tu ${noun} necesita un técnico?`, text: 'Escribinos con la marca y la falla. Te respondemos por WhatsApp y coordinamos la visita para el día o dentro de las 24 horas.', wa: waBase, cta: `cta-${s.slug}` })}
` + footer({ waText: waBase });
  emit(url, html, 0.9);
}

// ---------------------------------------------------------------- MARCAS
// resalta el nombre de la marca dentro de un texto (Maxi: "destacar la marca en los nombres")
const brandEm = (t, b) => { const i = t.toLowerCase().indexOf(b.toLowerCase()); return i < 0 ? esc(t) : `${esc(t.slice(0, i))}<span class="brand-em">${esc(t.slice(i, i + b.length))}</span>${esc(t.slice(i + b.length))}`; };
// orden de productos por rentabilidad y productos que no van (content/real-prefs.json → orden / quitar)
const brandApps = m => {
  const quitar = (PREFS.quitar || {})[m.slug] || [], orden = (PREFS.orden || {})[m.slug] || [];
  const pos = a => { const i = orden.indexOf(a.service); return i < 0 ? 99 : i; };
  return m.appliances.filter(a => !quitar.includes(a.service)).map((a, i) => [a, i]).sort((x, y) => pos(x[0]) - pos(y[0]) || x[1] - y[1]).map(x => x[0]);
};

function brandPage(m) {
  const url = `/${m.slug}/`;
  // fotos reales de esta marca (en las páginas de un solo equipo, solo de ese equipo)
  const bApps = brandApps(m);
  const bSlug = slugify(m.brand), bSvcs = m.appliances.map(a => a.service).filter(Boolean);
  const bReals = realFor(null, bSlug).filter(r => m.appliances.length > 1 || bSvcs.includes(r.servicio));
  const usedReal = new Set();
  const hero = prefHero('brand:' + m.slug, bReals) || (bReals[0] || {}).base || (BRAND_GEN[m.slug] && gen(BRAND_GEN[m.slug])) || m.heroImage || HERO_FALLBACK[m.slug];
  if (hero && hero.startsWith('real-')) usedReal.add(hero);
  const appNoun = a => {
    if (/^freezer/i.test(a.name)) return 'freezer';
    if (/^hornos y cocinas/i.test(a.name)) return 'horno o cocina';
    if (/^horno/i.test(a.name)) return 'horno';
    if (/^cocina/i.test(a.name)) return 'cocina';
    return SINGULAR[a.service] || lc1(a.name.replace(` ${m.brand}`, ''));
  };
  const waBase = m.appliances.length === 1
    ? `Hola MP Group, necesito service para mi ${appNoun(m.appliances[0])} ${m.brand}.`
    : `Hola MP Group, necesito service para un equipo ${m.brand}.`;
  const others = Object.entries(BRAND_PAGE).filter(([, s]) => s !== m.slug);
  const ld = [
    crumbsLd([['Inicio', '/'], [m.name, url]]),
    { '@type': 'Service', name: m.h1, serviceType: `Service ${m.brand}`, brand: { '@type': 'Brand', name: m.brand }, provider: { '@id': ORG_ID }, areaServed: business.areaServed, url: SITE.url + url, description: m.description },
    faqLd(m.faqs),
  ];
  const html = head({ title: m.title, description: m.description, url, image: imgUrl(hero), ld }) + header(m.slug) + `
<section class="page-hero${hero && imgEntry(hero) ? '' : ' page-hero--noimg'}">${arcsSvg('page-arcs')}<div class="wrap">
  <div>
    ${crumbs([['Inicio', '/'], ['Marcas', '/#mk-t'], [m.name, url]])}
    <h1 style="margin-top:22px">${brandEm(m.h1, m.brand)}</h1>
    <p class="indep">${icon('shield')}Servicio técnico independiente, no oficial de ${esc(m.brand)}. Trabajamos con repuestos originales.</p>
    <p class="lead">${esc(m.lead)}</p>
    <div class="btn-row">
      <a class="btn btn--wa" href="${waUrl(waBase)}" target="_blank" rel="noopener" data-cta="hero-marca">${icon('wa')}Pedir visita por WhatsApp</a>
      <a class="btn btn--line" href="tel:${SITE.tel}" data-cta="hero-marca">${icon('phone')}${SITE.telShow}</a>
    </div>
  </div>
  ${hero && imgEntry(hero) ? `<div class="page-hero-media${hero.startsWith('real-') ? ' is-real' + (REALS.find(r => r.base === hero)?.vertical ? '' : ' is-wide') : ''}">${picture(hero, hero.startsWith('real-') ? realAlt(REALS.find(r => r.base === hero)) : `Service ${m.brand} a domicilio`, { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}${hero.startsWith('real-') ? realBadge() : ''}</div>` : ''}
</div></section>
${factsStrip()}

<section class="section" aria-labelledby="eq-t"><div class="wrap">
  <div class="section-head"><h2 id="eq-t">${m.appliances.length > 1 ? `Equipos ${esc(m.brand)} que reparamos` : `Reparamos tu ${esc(appNoun(m.appliances[0]))} ${esc(m.brand)}`}</h2><p>Elegí el equipo y escribinos con la falla: te respondemos por WhatsApp.</p></div>
  <div class="products">${brandApps(m).map(a => {
    // primero una foto del mismo tipo de equipo ("Hornos" → horno, no anafe), si no, cualquiera de ese servicio
    const pool = a.service ? bReals.filter(r => r.servicio === a.service && !usedReal.has(r.base)) : [];
    const rp = pool.find(r => a.name.toLowerCase().startsWith(r.equipo.toLowerCase().slice(0, 4))) || pool[0];
    if (rp) usedReal.add(rp.base);
    const img = rp ? rp.base : (PRODUCT_FIX[`${m.slug}|${a.name}`] || a.image || (a.service && gen('prod-' + a.service)));
    const wa = `Hola MP Group, necesito service para mi ${appNoun(a)} ${m.brand}.`;
    return `<article class="product">
      <div class="product-media${rp ? ' product-media--real' : ''}">${img && imgEntry(img) ? picture(img, rp ? realAlt(rp) : a.name, { sizes: '(max-width:640px) 70vw, 300px' }) : icon(a.service || 'lavarropas')}</div>
      <div class="product-body"><h3>${brandEm(a.name, m.brand)}</h3><p>${esc(a.d)}</p>
        <div class="product-actions"><a class="btn btn--wa btn--sm" href="${waUrl(wa)}" target="_blank" rel="noopener" data-cta="producto-${m.slug}">${icon('wa')}Consultar</a>${a.service && svcBySlug[a.service] ? `<a class="textlink" href="/${a.service}/">Service de ${esc(svcBySlug[a.service].noun || svcBySlug[a.service].name)}${icon('arrow')}</a>` : ''}</div>
      </div></article>`;
  }).join('')}</div>
</div></section>

<section class="section section--enamel" aria-labelledby="sv-t"><div class="wrap two-col">
  <div class="section-head"><h2 id="sv-t">Servicio técnico ${esc(m.brand)}</h2>${m.intro.map(p => `<p>${esc(p)}</p>`).join('')}</div>
  <ul class="checks" style="grid-template-columns:1fr">${m.services.map(t => `<li>${icon('check')}<div><b>${esc(t)}</b></div></li>`).join('')}</ul>
</div></section>

${faqBlock(m.faqs)}

<section class="section${m.faqs?.length ? ' section--enamel' : ''}" aria-labelledby="om-t"><div class="wrap">
  <div class="section-head"><h2 id="om-t">Otras marcas que reparamos</h2></div>
  <div class="brands">${others.map(([b, s]) => `<a class="brand-tile" href="/${s}/">${esc(b)}${icon('arrow')}</a>`).join('')}</div>
  <p class="legal">${esc(m.brand)} y las demás marcas mencionadas pertenecen a sus respectivos dueños. MP Group es un servicio técnico independiente y no es el servicio oficial de ninguna marca.</p>
</div></section>

${realGallery({ id: 'rg-t', title: `Equipos ${m.brand} que atendimos`, sub: 'Fotos de visitas reales de nuestros técnicos.', items: bReals.filter(r => !usedReal.has(r.base)).slice(0, 6) })}
${coverageBlock(`Service ${m.brand} a domicilio`)}
${ctaBlock({ title: `¿Tu equipo ${m.brand} necesita un técnico?`, text: 'Escribinos con el modelo y la falla. Te respondemos por WhatsApp y coordinamos la visita para el día o dentro de las 24 horas.', wa: waBase, cta: `cta-${m.slug}` })}
` + footer({ waText: waBase });
  emit(url, html, 0.8);
}

// ---------------------------------------------------------------- NOSOTROS
function nosotros() {
  const url = '/nosotros/';
  const html = head({ title: 'Nosotros | MP Group, service de electrodomésticos', description: 'MP Group S.R.L. es un servicio técnico independiente con 20 años de experiencia reparando electrodomésticos a domicilio en CABA y Zona Norte.', url, image: imgUrl(gen('equipo-camioneta') || 'hero-nosotros'), ld: [crumbsLd([['Inicio', '/'], ['Nosotros', url]])] }) + header('nosotros') + `
<section class="page-hero">${arcsSvg('page-arcs')}<div class="wrap">
  <div>
    ${crumbs([['Inicio', '/'], ['Nosotros', url]])}
    <h1 style="margin-top:22px">20 años reparando electrodomésticos</h1>
    <p class="lead">Somos MP Group S.R.L., un servicio técnico independiente con base en Villa Devoto, en el centro de nuestra zona de cobertura.</p>
  </div>
  <div class="page-hero-media">${picture(gen('equipo-camioneta') || 'hero-nosotros', 'Técnicos de service de electrodomésticos', { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}</div>
</div></section>

<section class="section"><div class="wrap two-col">
  <div class="section-head"><h2>Tu problema, nuestra prioridad</h2></div>
  <div class="prose">
    <p>Sabemos lo que significa quedarse sin heladera, sin agua caliente o con el lavarropas parado. Por eso trabajamos para darte una respuesta rápida y eficiente: el técnico va a tu casa en el día o dentro de las 24 horas y lleva los repuestos para resolverlo en la misma visita.</p>
    <p>No competimos con las marcas con las que trabajamos: las complementamos. Nos ocupamos de lo que para ellas no es el foco, el servicio técnico de sus equipos, y para nosotros es todo.</p>
    <p>Contamos con técnicos calificados, que saben lo que hacen y se capacitan de forma constante, con el respaldo de una empresa seria, con valores firmes, que toma decisiones pensando en tus necesidades.</p>
  </div>
</div></section>

<section class="section section--ink manifesto-band" aria-label="Nuestra forma de trabajar"><div class="wrap">
  <p class="manifesto">${'Sabemos lo que es quedarse sin heladera o sin agua caliente. Por eso cada visita llega preparada para resolverlo en el momento. Vos tenés un problema; nosotros, la solución.'.split(' ').map((w, i) => `<span style="--i:${i}">${w}</span>`).join(' ')}</p>
</div></section>
${bento('Cómo trabajamos', 'Rápido, preparados y con garantía.')}
${coverageBlock()}
${ctaBlock()}
` + footer();
  emit(url, html, 0.5);
}

// ---------------------------------------------------------------- CONTACTO
function contacto() {
  const url = '/contacto/';
  const html = head({ title: 'Contacto | MP Group, service de electrodomésticos', description: 'Escribinos por WhatsApp al 11 5249-0898, llamanos al 011 4501-4998 o escribinos a info@mpgroup.com.ar. Atendemos de lunes a sábado. Villa Devoto, CABA.', url, ld: [crumbsLd([['Inicio', '/'], ['Contacto', url]])] }) + header('contacto') + `
<section class="page-hero${gen('contacto-operadora') ? '' : ' page-hero--noimg'}">${arcsSvg('page-arcs')}<div class="wrap">
  <div>
    ${crumbs([['Inicio', '/'], ['Contacto', url]])}
    <h1 style="margin-top:22px">Contacto</h1>
    <p class="lead">La forma más rápida de pedir una visita es por WhatsApp: contanos qué equipo es, la marca y qué le pasa.</p>
  </div>
  ${gen('contacto-operadora') ? `<div class="page-hero-media">${picture(gen('contacto-operadora'), 'Coordinadora respondiendo consultas por WhatsApp', { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}</div>` : ''}
</div></section>
<section class="section"><div class="wrap">
  <div class="contact-grid">
    <a class="contact-card contact-card--wa" href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="contacto"><span class="ci">${icon('wa')}</span><h2>WhatsApp</h2><strong>${SITE.waShow}</strong><p data-status-note>Respondemos de lunes a viernes de 9 a 18 h y sábados de 9 a 15 h.</p></a>
    <a class="contact-card" href="tel:${SITE.tel}" data-cta="contacto"><span class="ci">${icon('phone')}</span><h2>Teléfono</h2><strong>${SITE.telShow}</strong><p>También al ${SITE.tel2Show}.</p></a>
    <a class="contact-card" href="mailto:${SITE.email}" data-cta="contacto"><span class="ci">${icon('mail')}</span><h2>Mail</h2><strong>${SITE.email}</strong><p>Te respondemos lo antes posible.</p></a>
  </div>
</div></section>
<section class="section section--enamel"><div class="wrap two-col">
  <div class="section-head"><h2>Dónde estamos</h2><p>${SITE.street}, ${SITE.cp}, ${SITE.barrio}, Ciudad Autónoma de Buenos Aires.</p>
    <ul class="hours">${HOURS.map(([d, h]) => `<li><b>${d}</b><span>${h}</span></li>`).join('')}</ul>
    <a class="textlink" href="${SITE.maps}" target="_blank" rel="noopener">Abrir en Google Maps${icon('arrow')}</a></div>
  <div class="company-card">
    <h3>Datos de la empresa</h3>
    <dl>
      <div><dt>Razón social</dt><dd>${SITE.legal}</dd></div>
      <div><dt>Oficina</dt><dd>${SITE.street}, ${SITE.cp}, ${SITE.barrio}, CABA</dd></div>
      <div><dt>Teléfono fijo</dt><dd><a href="tel:${SITE.tel}" data-cta="contacto-datos">${SITE.telShow}</a></dd></div>
      <div><dt>WhatsApp</dt><dd><a href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="contacto-datos">${SITE.waShow}</a></dd></div>
      <div><dt>Mail</dt><dd><a href="mailto:${SITE.email}" data-cta="contacto-datos">${SITE.email}</a></dd></div>
    </dl>
    <a class="btn btn--line btn--block" href="${SITE.maps}" target="_blank" rel="noopener">${icon('pin')}Cómo llegar en Google Maps</a>
  </div>
</div></section>
${coverageBlock()}
` + footer();
  emit(url, html, 0.6);
}

// ---------------------------------------------------------------- TRABAJÁ CON NOSOTROS
function trabaja() {
  const url = '/trabaja-con-nosotros/';
  const subject = encodeURIComponent('Trabajar en MP Group');
  const body = encodeURIComponent('Hola, quiero sumarme al equipo de MP Group.\n\nNombre y apellido:\nTeléfono:\nEspecialidad (lavarropas, heladeras, gas, aire acondicionado, etc.):\nZona donde vivo:\n\nAdjunto mi CV.');
  const html = head({ title: 'Trabajá con nosotros | MP Group', description: 'Sumate al equipo de MP Group. Mandanos tu CV por mail con tu especialidad y tu zona, y nos contactamos cuando haya una búsqueda abierta.', url, image: imgUrl(gen('taller-capacitacion') || 'hero-trabaja'), ld: [crumbsLd([['Inicio', '/'], ['Trabajá con nosotros', url]])] }) + header('trabaja') + `
<section class="page-hero">${arcsSvg('page-arcs')}<div class="wrap">
  <div>
    ${crumbs([['Inicio', '/'], ['Trabajá con nosotros', url]])}
    <h1 style="margin-top:22px">Trabajá con nosotros</h1>
    <p class="lead">Si sos técnico y querés sumarte a un equipo serio, que se capacita de forma constante, mandanos tu CV.</p>
    <div class="btn-row"><a class="btn btn--light" style="box-shadow:inset 0 0 0 1.5px var(--line)" href="mailto:${SITE.email}?subject=${subject}&body=${body}" data-cta="trabaja">${icon('cv')}Enviar mi CV por mail</a></div>
    <p class="small" style="margin-top:14px">Escribinos a <a href="mailto:${SITE.email}?subject=${subject}">${SITE.email}</a> con el asunto “Trabajar en MP Group”, tu especialidad y la zona donde vivís.</p>
  </div>
  <div class="page-hero-media">${picture(gen('taller-capacitacion') || 'hero-trabaja', 'Técnicos en capacitación', { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}</div>
</div></section>
<section class="section"><div class="wrap two-col">
  <div class="section-head"><h2>Cómo postularte</h2><p>Recibimos CV todo el año y los tenemos en cuenta cada vez que se abre una búsqueda.</p></div>
  <ol class="steps">
    <li><h3>Armá el mail</h3><p>Escribí a ${SITE.email} con el asunto “Trabajar en MP Group”.</p></li>
    <li><h3>Contanos sobre vos</h3><p>Nombre, teléfono, en qué equipos te especializás (lavarropas, heladeras, gas, aire acondicionado) y en qué zona vivís.</p></li>
    <li><h3>Adjuntá tu CV</h3><p>Si hay una búsqueda que encaje con tu perfil, te contactamos.</p></li>
  </ol>
</div></section>
` + footer();
  emit(url, html, 0.3);
}

// ---------------------------------------------------------------- BLOG
const CATS = { blog: 'Blog', 'tips-y-consejos': 'Tips y consejos' };
function blogIndex(cat) {
  const url = cat ? `/blog/category/${cat}/` : '/blog/';
  const list = cat ? blog.filter(p => p.categories.includes(cat)) : blog;
  const name = cat ? CATS[cat] : 'Blog';
  const tabs = [['Todas', '/blog/', !cat], ...Object.entries(CATS).map(([k, v]) => [v, `/blog/category/${k}/`, cat === k])];
  const html = head({
    title: cat ? `${cat === 'blog' ? 'Notas generales' : name} | Blog de MP Group` : 'Blog: consejos para tus electrodomésticos | MP Group',
    description: cat ? `Notas de ${name.toLowerCase()} sobre el cuidado, el mantenimiento y las fallas más comunes de los electrodomésticos.` : 'Consejos de mantenimiento, fallas comunes y cuándo conviene reparar tus electrodomésticos, de la mano de los técnicos de MP Group.',
    url, ld: [crumbsLd(cat ? [['Inicio', '/'], ['Blog', '/blog/'], [name, url]] : [['Inicio', '/'], ['Blog', url]])],
  }) + header('blog') + `
<section class="page-hero${!cat && gen('blog-index') ? ' page-hero--blog' : ' page-hero--noimg'}">${arcsSvg('page-arcs')}<div class="wrap"><div>
  ${crumbs(cat ? [['Inicio', '/'], ['Blog', '/blog/'], [name, url]] : [['Inicio', '/'], ['Blog', url]])}
  <h1 style="margin-top:22px">${cat ? esc(name) : 'Consejos para cuidar tus electrodomésticos'}</h1>
  <p class="lead">Mantenimiento, fallas comunes y cuándo conviene llamar al técnico, explicado por nuestro equipo.</p>
  <nav class="cat-tabs" aria-label="Categorías">${tabs.map(([n, u, on]) => `<a class="cat-tab" href="${u}"${on ? ' aria-current="page"' : ''}>${n}</a>`).join('')}</nav>
</div>${!cat && gen('blog-index') ? `<div class="page-hero-media">${picture(gen('blog-index'), 'Herramientas de un técnico de electrodomésticos', { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}</div>` : ''}</div></section>
<section class="section"><div class="wrap"><div class="posts">${list.map(postCard).join('')}</div></div></section>
${ctaBlock()}
` + footer();
  emit(url, html, cat ? 0.3 : 0.6);
}

function blogPost(p) {
  const url = `/blog/${p.slug}/`;
  const svc = p.related && svcBySlug[p.related];
  const waText = svc ? `Hola MP Group, leí la nota "${p.title}" y necesito service para mi ${SINGULAR[svc.slug]}.` : 'Hola MP Group, quiero consultar por un service.';
  const ld = [
    crumbsLd([['Inicio', '/'], ['Blog', '/blog/'], [p.title, url]]),
    { '@type': 'BlogPosting', headline: p.title, description: p.description, datePublished: p.date, dateModified: p.modified || p.date, image: imgUrl(p.image) || undefined, mainEntityOfPage: SITE.url + url, author: { '@id': ORG_ID }, publisher: { '@id': ORG_ID }, inLanguage: 'es-AR' },
  ];
  const more = blog.filter(x => x.slug !== p.slug && (x.related === p.related || x.categories.some(c => p.categories.includes(c)))).slice(0, 3);
  // índice: cada h2 de la nota recibe un id para poder saltar a la sección
  const toc = [];
  const slugify = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const body = p.html.replace(/<h2>(.*?)<\/h2>/g, (m, inner) => { const txt = inner.replace(/<[^>]+>/g, ''); const id = slugify(txt) || `s${toc.length}`; toc.push([id, txt]); return `<h2 id="${id}">${inner}</h2>`; });
  const html = head({ title: p.seoTitle, description: p.description, url, image: imgUrl(p.image), type: 'article', ld }) + header('blog') + `
<article>
<header class="article-head"><div class="wrap wrap--narrow">
  ${crumbs([['Inicio', '/'], ['Blog', '/blog/'], [p.title, url]])}
  <h1>${esc(p.title)}</h1>
  <div class="post-meta"><time datetime="${p.date}">${fmtDate(p.date)}</time><span>${p.readingMinutes} min de lectura</span>${p.categories.map(c => `<a href="/blog/category/${c}/">${CATS[c] || c}</a>`).join('')}</div>
</div></header>
${p.image && imgEntry(p.image) ? `<div class="article-cover wrap wrap--narrow tone" style="view-transition-name:post-${p.slug}">${picture(p.image, p.title, { eager: true, sizes: '(max-width:1040px) 100vw, 1040px' })}</div>` : ''}
<div class="section" style="padding-top:clamp(32px,4vw,56px)"><div class="wrap wrap--narrow article">
  <div class="prose" data-article>${body}</div>
  <aside class="article-aside">
    ${toc.length > 2 ? `<nav class="toc" aria-label="En esta nota"><p class="toc-t">En esta nota</p><ol>${toc.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ol></nav>` : ''}
    <div class="aside-card" aria-label="Pedir un técnico">
      <h2>¿No se soluciona?</h2>
      <p>Un técnico va a tu casa en el día o dentro de las 24 horas, con los repuestos para resolverlo en la visita.</p>
      <a class="btn btn--wa" href="${waUrl(waText)}" target="_blank" rel="noopener" data-cta="blog-aside">${icon('wa')}Escribinos por WhatsApp</a>
      ${svc ? `<a class="textlink" href="/${svc.slug}/">Service de ${esc(svc.noun || svc.name)}${icon('arrow')}</a>` : ''}
    </div>
  </aside>
</div></div>
<div class="read-progress" aria-hidden="true"></div>
</article>
${more.length ? `<section class="section section--enamel" aria-labelledby="mm-t"><div class="wrap"><div class="split-head"><div class="section-head"><h2 id="mm-t">Seguí leyendo</h2></div><a class="textlink" href="/blog/">Ver todas las notas${icon('arrow')}</a></div><div class="posts">${more.map(postCard).join('')}</div></div></section>` : ''}
${ctaBlock({ wa: waText })}
` + footer({ waText });
  emit(url, html, 0.5);
}

// ---------------------------------------------------------------- 404
function notFound() {
  const html = head({ title: 'Página no encontrada | MP Group', description: 'La página que buscás no existe o cambió de dirección.', url: '/404/', noindex: true }) + header('') + `
<section class="section notfound"><div class="wrap">
  <p class="kicker">Error 404</p>
  <h1>Esta página no existe o cambió de dirección</h1>
  <p class="lead">Buscá el electrodoméstico que necesitás reparar o escribinos directamente.</p>
  <div class="btn-row" style="margin:24px 0 40px"><a class="btn btn--wa" href="${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="404">${icon('wa')}Escribinos por WhatsApp</a><a class="btn btn--line" href="/">Ir al inicio</a></div>
  <div class="brand-chips">${servicios.map(s => `<a class="brand-chip" href="/${s.slug}/">${esc(s.name)}${icon('arrow')}</a>`).join('')}</div>
</div></section>
` + footer();
  fs.writeFileSync(path.join(DIST, '404.html'), html);
}

// ---------------------------------------------------------------- archivos del servidor
function serverFiles() {
  const today = new Date().toISOString().slice(0, 10);
  const lastmod = Object.fromEntries(blog.map(p => [`/blog/${p.slug}/`, p.modified || p.date]));
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${SITE.url}${p.path}</loc><lastmod>${lastmod[p.path] || today}</lastmod><priority>${p.priority.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`);
  fs.writeFileSync(path.join(DIST, 'robots.txt'), PREVIEW ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
  // Netlify / Cloudflare Pages leen _headers (en Hostinger manda el .htaccess)
  if (PREVIEW) fs.writeFileSync(path.join(DIST, '_headers'), '/*\n  X-Robots-Tag: noindex, nofollow\n');
  fs.writeFileSync(path.join(DIST, '.htaccess'), `# MP Group: sitio estático (Hostinger / LiteSpeed / Apache)
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
RewriteEngine On

# HTTPS y sin www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\\. [NC]
RewriteRule ^ https://mpgroup.com.ar%{REQUEST_URI} [L,R=301]

# Direcciones del WordPress anterior que ya no existen
RewriteRule ^(sitemap_index|wp-sitemap|page-sitemap|post-sitemap|category-sitemap)\\.xml$ /sitemap.xml [L,R=301]
RewriteRule ^(.*/)?feed/?$ /blog/ [L,R=301]
RewriteRule ^blog/page/[0-9]+/?$ /blog/ [L,R=301]
RewriteRule ^blog/category/([^/]+)/page/[0-9]+/?$ /blog/category/$1/ [L,R=301]
RewriteRule ^(wp-admin|wp-login\\.php|xmlrpc\\.php|wp-json)(/.*)?$ / [L,R=301]
RewriteRule ^(comments|author|tag)(/.*)?$ /blog/ [L,R=301]
RewriteRule ^wp-content/uploads/ / [L,R=301]

# Barra final, como en el sitio anterior
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_URI} !/$
RewriteCond %{REQUEST_URI} !\\.[a-zA-Z0-9]{2,5}$
RewriteRule ^(.*)$ /$1/ [L,R=301]
</IfModule>

<IfModule mod_headers.c>
Header always set Strict-Transport-Security "max-age=86400"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
<FilesMatch "\\.(css|js|woff2|webp|png|jpg|svg|ico)$">
Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
<FilesMatch "\\.(html|xml|txt)$">
Header set Cache-Control "public, max-age=600"
</FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript text/xml application/xml image/svg+xml text/plain
</IfModule>

<IfModule mod_mime.c>
AddType image/webp .webp
AddType font/woff2 .woff2
AddType image/svg+xml .svg
</IfModule>
`);
}

// ---------------------------------------------------------------- mapa de cobertura (assets/mapa.svg)
// Barrios oficiales de CABA (BA Data) y partidos de Zona Norte (OpenStreetMap), proyectados con tools/map.mjs
function writeMap() {
  if (!exists('content/geo/map.json')) return;
  const m = read('content/geo/map.json');
  const maxD = Math.max(...m.barrios.map(b => b.dist));
  const zn = m.partidos.filter(p => p.covered);
  const avg = pts => pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
  const cabaC = avg(m.barrios.map(b => b.c));
  const znC = avg(zn.filter(p => p.name !== 'Tigre').map(p => p.c));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.w} ${m.h}" class="cov-svg" role="presentation">
<defs>
  <radialGradient id="mf" cx="0.62" cy="0.6" r="0.62"><stop offset="0.72" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
  <mask id="mm"><rect width="${m.w}" height="${m.h}" fill="url(#mf)"/></mask>
</defs>
<text class="lbl-water" x="0" y="0" transform="translate(800 420) rotate(-40)">Río de la Plata</text>
<g mask="url(#mm)">
  <g class="ctx">${m.partidos.filter(p => !p.covered).map(p => `<path d="${p.d}"/>`).join('')}</g>
  <g class="zn">${zn.map(p => `<path data-n="${esc(p.name)}" data-z="Zona Norte" d="${p.d}"/>`).join('')}</g>
  <g class="caba">${m.barrios.map(b => `<path data-n="${esc(b.name)}" data-z="CABA" style="--d:${(b.dist / maxD).toFixed(2)}" d="${b.d}"/>`).join('')}</g>
</g>
<text class="lbl-zone" x="${(cabaC[0] + 40).toFixed(0)}" y="${(cabaC[1] + 150).toFixed(0)}">CABA</text>
<text class="lbl-zone lbl-zn" x="${(znC[0] - 250).toFixed(0)}" y="${(znC[1] + 40).toFixed(0)}">Zona Norte</text>
<g class="pts">${m.points.map(p => `<g transform="translate(${p.p[0]} ${p.p[1]})"><circle r="5"/><text x="${p.a === 'end' ? -10 : 10}" y="7" text-anchor="${p.a}">${esc(p.name)}</text></g>`).join('')}</g>
<g class="office" transform="translate(${m.office[0]} ${m.office[1]})"><circle class="pulse" r="12"/><circle class="pulse pulse-2" r="12"/><circle class="dot" r="10"/><g class="office-tag"><rect x="18" y="-18" width="124" height="36" rx="18"/><text x="34" y="7">MP Group</text></g></g>
</svg>`;
  fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'assets', 'mapa.svg'), svg);
}

// ---------------------------------------------------------------- datos del asistente (assets/chat-data.json)
// Todo sale del contenido real del sitio: fallas y marcas por equipo, barrios y localidades donde trabajan.
function writeChatData() {
  const KEYS = {
    lavarropas: ['lavarropa', 'lavadora', 'lava ropa', 'lavasecarropa'], secarropas: ['secarropa', 'secadora', 'seca ropa'],
    lavavajillas: ['lavavajilla', 'lavaplato', 'lava vajilla'], heladeras: ['heladera', 'freezer', 'refrigerador', 'nevera', 'no frost', 'frigorifico'],
    termotanques: ['termotanque', 'termo tanque'], calefones: ['calefon', 'calentador'],
    'hornos-y-cocinas': ['horno', 'cocina', 'anafe', 'hornalla', 'quemador'], estufas: ['estufa', 'calefactor', 'tiro balanceado', 'caloventor'],
    'aire-acondicionado': ['aire', 'split', 'acondicionado'],
  };
  const apps = servicios.map(s => ({
    slug: s.slug, name: s.name, noun: SINGULAR[s.slug] || s.noun, keys: KEYS[s.slug] || [s.slug],
    brands: s.slug === 'termotanques' ? ['Longvie', 'Orbis', 'Domec', 'Ariston'] : (s.brands || []).slice(0, 8),
    faults: s.faults.map(f => ({ t: f.t, d: f.d, wa: f.wa })),
  }));
  const BARRIOS = ['Agronomía', 'Almagro', 'Balvanera', 'Barracas', 'Belgrano', 'Boedo', 'Caballito', 'Chacarita', 'Coghlan', 'Colegiales', 'Constitución', 'Flores', 'Floresta', 'La Boca', 'La Paternal', 'Paternal', 'Liniers', 'Mataderos', 'Monte Castro', 'Monserrat', 'Nueva Pompeya', 'Pompeya', 'Núñez', 'Palermo', 'Parque Avellaneda', 'Parque Chacabuco', 'Parque Chas', 'Parque Patricios', 'Puerto Madero', 'Recoleta', 'Retiro', 'Saavedra', 'San Cristóbal', 'San Nicolás', 'San Telmo', 'Vélez Sarsfield', 'Versalles', 'Villa Crespo', 'Villa del Parque', 'Villa Devoto', 'Devoto', 'Villa General Mitre', 'Villa Lugano', 'Lugano', 'Villa Luro', 'Villa Ortúzar', 'Villa Pueyrredón', 'Villa Real', 'Villa Riachuelo', 'Villa Santa Rita', 'Villa Soldati', 'Villa Urquiza', 'Urquiza', 'Barrio Norte', 'Microcentro', 'Centro', 'Capital Federal', 'Capital', 'CABA'];
  const NORTE = ['Vicente López', 'Olivos', 'La Lucila', 'Florida', 'Munro', 'Villa Martelli', 'Carapachay', 'San Isidro', 'Martínez', 'Acassuso', 'Béccar', 'Boulogne', 'Villa Adelina', 'Tigre', 'Zona Norte'];
  // los nombres más largos primero, para que "Villa Devoto" gane sobre "Devoto"
  const zones = [...BARRIOS, ...NORTE].sort((a, b) => b.length - a.length).map(name => ({ name }));
  const brands = [...Object.entries(BRAND_PAGE).map(([name, s]) => ({ name, url: `/${s}/` })), ...OTHER_BRANDS.map(name => ({ name }))];
  fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(DIST, 'assets', 'chat-data.json'), JSON.stringify({ apps, zones, brands }));
}

// ---------------------------------------------------------------- copiar estáticos
function copyDir(from, to, filter = () => true) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const a = path.join(from, f), b = path.join(to, f);
    if (fs.statSync(a).isDirectory()) copyDir(a, b, filter);
    else if (filter(f)) fs.copyFileSync(a, b);
  }
}

// ---------------------------------------------------------------- correr
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
home();
servicios.forEach(servicePage);
marcas.forEach(brandPage);
nosotros();
contacto();
trabaja();
if (blog.length) { blogIndex(); Object.keys(CATS).forEach(blogIndex); blog.forEach(blogPost); }
notFound();
serverFiles();
writeMap();
writeChatData();
copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'), f => !f.endsWith('.json') && !(/^.+-\d+\.webp$/.test(f) && false));
// una sola hoja de estilos: base + animación
const cssDir = path.join(DIST, 'assets/css');
const cssParts = ['site.css', 'motion.css', 'design.css', 'chat.css', 'fx.css'].filter(f => fs.existsSync(path.join(cssDir, f)));
fs.writeFileSync(path.join(cssDir, 'site.css'), cssParts.map(f => fs.readFileSync(path.join(cssDir, f), 'utf8')).join('\n'));
cssParts.slice(1).forEach(f => fs.rmSync(path.join(cssDir, f)));
// CSS y JS minificados: menos para bajar y para leer en equipos lentos
try {
  const { pathToFileURL } = await import('url');
  const ESB = process.env.ESBUILD || 'C:/Users/needf/AppData/Roaming/npm/node_modules/omniroute/node_modules/esbuild/lib/main.js';
  const esb = await import(pathToFileURL(ESB).href).then(m => m.default || m);
  const mini = (file, loader) => { const p = path.join(DIST, file); fs.writeFileSync(p, esb.transformSync(fs.readFileSync(p, 'utf8'), { loader, minify: true, legalComments: 'none' }).code); };
  mini('assets/css/site.css', 'css');
  for (const f of fs.readdirSync(path.join(DIST, 'assets/js'))) if (f.endsWith('.js')) mini('assets/js/' + f, 'js');
} catch (e) { console.log('sin minificar:', e.message); }
// solo las fotos que se usan
const mDir = path.join(DIST, 'assets/img/m');
for (const f of fs.readdirSync(mDir)) if (!usedImages.has(f)) fs.rmSync(path.join(mDir, f));
for (const f of ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png']) if (fs.existsSync(path.join(SRC, f))) fs.copyFileSync(path.join(SRC, f), path.join(DIST, f));
console.log(`${pages.length} páginas + 404, ${usedImages.size} imágenes`);
