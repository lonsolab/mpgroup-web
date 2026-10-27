// Fotos reales de MP Group (16/10): heros de servicio y marca, productos de cada marca y galerías "fotos reales"
import fs from 'fs';
let s = fs.readFileSync('build.mjs', 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('No encontrado: ' + a.slice(0, 90)); s = s.split(a).join(b); };

// ---------- datos y ayudas
rep(`const real = base => (imgEntry('real-' + base) ? 'real-' + base : null);`, `const real = base => (imgEntry('real-' + base) ? 'real-' + base : null);
// selección aprobada (tools/fotos-reales-publicar.py): servicio, equipo, marca y puntaje de cada foto
const REALS = (fs.existsSync('content/real-seleccion.json') ? JSON.parse(fs.readFileSync('content/real-seleccion.json', 'utf8')) : [])
  .filter(r => imgEntry(r.base)).sort((a, b) => b.score - a.score);
const slugify = t => t.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const realFor = (svc, marcaSlug) => REALS.filter(r => (!svc || r.servicio === svc) && (!marcaSlug || r.marcaSlug === marcaSlug));
const realCap = r => (r.marca ? \`\${r.equipo} \${r.marca}\` : r.equipo);
const realAlt = r => \`\${realCap(r)} en una visita de MP Group\`;
// galería de fotos reales; "skip" evita repetir las que ya se usaron en la página
function realGallery({ id, title, sub, items, cls = '' }) {
  if (items.length < 3) return '';
  return \`<section class="section section--real\${cls}" aria-labelledby="\${id}"><div class="wrap">
  <div class="section-head rv"><h2 id="\${id}">\${esc(title)}</h2><p>\${esc(sub)}</p></div>
  <ul class="rgal">\${items.map(r => \`<li class="rgal-i"><figure>\${picture(r.base, realAlt(r), { sizes: '(max-width:640px) 60vw, (max-width:1080px) 25vw, 230px' })}<figcaption>\${icon('check')}\${esc(realCap(r))}</figcaption></figure></li>\`).join('')}</ul>
  <p class="rgal-note">\${icon('shield')}Fotos tomadas por nuestros técnicos en visitas a domicilio.</p>
</div></section>\`;
}
const realBadge = () => \`<span class="real-badge">\${icon('check')}Foto real de una visita</span>\`;`);

// los heros de servicio usan la mejor foto real de ese equipo (también la vista previa de la lista de la home)
rep(`const heroForService = s => gen('svc-' + s.slug) || s.heroImage || HERO_FALLBACK[s.slug];`,
  `const heroForService = s => (realFor(s.slug)[0] || {}).base || gen('svc-' + s.slug) || s.heroImage || HERO_FALLBACK[s.slug];`);

// ---------- página de servicio
rep("  ${hero && imgEntry(hero) ? `<div class=\"page-hero-media\">${picture(hero, `Service de ${s.noun || noun} a domicilio`, { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}</div>` : ''}",
  "  ${hero && imgEntry(hero) ? `<div class=\"page-hero-media${hero.startsWith('real-') ? ' is-real' : ''}\">${picture(hero, hero.startsWith('real-') ? realAlt(REALS.find(r => r.base === hero)) : `Service de ${s.noun || noun} a domicilio`, { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}${hero.startsWith('real-') ? realBadge() : ''}</div>` : ''}");
rep("${coverageBlock(`Service de ${s.noun || noun} a domicilio`)}",
  "${realGallery({ id: 'rg-t', title: `${s.name} que reparamos`, sub: 'Algunos de los equipos que atendimos en casas de CABA y Zona Norte.', items: realFor(s.slug).filter(r => r.base !== hero).slice(0, 8) })}\n${coverageBlock(`Service de ${s.noun || noun} a domicilio`)}");

// ---------- página de marca
rep("  const hero = (BRAND_GEN[m.slug] && gen(BRAND_GEN[m.slug])) || m.heroImage || HERO_FALLBACK[m.slug];",
  `  // fotos reales de esta marca (en las páginas de un solo equipo, solo de ese equipo)
  const bSlug = slugify(m.brand), bSvcs = m.appliances.map(a => a.service).filter(Boolean);
  const bReals = realFor(null, bSlug).filter(r => m.appliances.length > 1 || bSvcs.includes(r.servicio));
  const usedReal = new Set();
  const hero = (bReals[0] || {}).base || (BRAND_GEN[m.slug] && gen(BRAND_GEN[m.slug])) || m.heroImage || HERO_FALLBACK[m.slug];
  if (bReals[0]) usedReal.add(hero);`);
rep("  ${hero && imgEntry(hero) ? `<div class=\"page-hero-media\">${picture(hero, `Service ${m.brand} a domicilio`, { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}</div>` : ''}",
  "  ${hero && imgEntry(hero) ? `<div class=\"page-hero-media${hero.startsWith('real-') ? ' is-real' : ''}\">${picture(hero, hero.startsWith('real-') ? realAlt(REALS.find(r => r.base === hero)) : `Service ${m.brand} a domicilio`, { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}${hero.startsWith('real-') ? realBadge() : ''}</div>` : ''}");
rep("    const img = PRODUCT_FIX[`${m.slug}|${a.name}`] || a.image || (a.service && gen('prod-' + a.service));",
  "    const rp = a.service && bReals.find(r => r.servicio === a.service && !usedReal.has(r.base));\n    if (rp) usedReal.add(rp.base);\n    const img = rp ? rp.base : (PRODUCT_FIX[`${m.slug}|${a.name}`] || a.image || (a.service && gen('prod-' + a.service)));");
rep("      <div class=\"product-media\">${img && imgEntry(img) ? picture(img, a.name, { sizes: '260px' }) : icon(a.service || 'lavarropas')}</div>",
  "      <div class=\"product-media${rp ? ' product-media--real' : ''}\">${img && imgEntry(img) ? picture(img, rp ? realAlt(rp) : a.name, { sizes: '(max-width:640px) 70vw, 300px' }) : icon(a.service || 'lavarropas')}</div>");
rep("${coverageBlock(`Service ${m.brand} a domicilio`)}",
  "${realGallery({ id: 'rg-t', title: `Equipos ${m.brand} que atendimos`, sub: 'Fotos de visitas reales de nuestros técnicos.', items: bReals.filter(r => !usedReal.has(r.base)).slice(0, 8) })}\n${coverageBlock(`Service ${m.brand} a domicilio`)}");

// ---------- home: una galería con lo mejor de cada equipo (de a uno por servicio, en ronda)
{ const m0 = s.match(/\$\{coverageBlock\(\)\}\r?\n\$\{faqBlock\(homeFaqs\)\}/); if (!m0) throw new Error('home coverage'); s = s.replace(m0[0], "${(() => {\n  const porSvc = servicios.map(sv => realFor(sv.slug).slice(1, 3));\n  const items = [];\n  for (let k = 0; k < 2; k++) porSvc.forEach(l => { if (l[k]) items.push(l[k]); });\n  return realGallery({ id: 'rgh-t', title: 'Fotos reales de nuestras visitas', sub: 'Equipos de vecinos de CABA y Zona Norte que pasaron por las manos de nuestros técnicos.', items: items.slice(0, 12), cls: ' section--real-home' });\n})()}\n${coverageBlock()}\n${faqBlock(homeFaqs)}"); }
fs.writeFileSync('build.mjs', s);

// ---------- celular: la galería también va deslizable
const J = 'site/assets/js/site.js';
let j = fs.readFileSync(J, 'utf8');
const a1 = "d.querySelectorAll('.bento, .stack, .posts, .products, .tips, .faults').forEach(rail => {";
if (!j.includes(a1)) throw new Error('rails');
j = j.replace(a1, "d.querySelectorAll('.bento, .stack, .posts, .products, .tips, .faults, .rgal').forEach(rail => {");
fs.writeFileSync(J, j);

// ---------- CSS
fs.appendFileSync('site/assets/css/fx.css', `
/* =====================================================================
   Fotos reales (16/10)
   ===================================================================== */
.real-badge{position:absolute;left:14px;bottom:14px;z-index:3;display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.94);color:var(--ink);font-size:.8rem;font-weight:700;box-shadow:0 8px 20px -10px rgba(28,43,51,.5)}
.real-badge .ico{width:15px;height:15px;color:var(--wa)}
.page-hero-media.is-real{aspect-ratio:4/5;max-height:620px}
.page-hero-media.is-real img{object-position:50% 45%}
.rgal{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;list-style:none;margin:0;padding:0}
.section--real-home .rgal{grid-template-columns:repeat(6,minmax(0,1fr))}
.rgal-i figure{position:relative;margin:0;aspect-ratio:3/4;border-radius:18px;overflow:hidden;background:var(--line)}
.rgal-i img{width:100%;height:100%;object-fit:cover;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.rgal-i figcaption{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:6px;padding:28px 12px 11px;background:linear-gradient(180deg,rgba(28,43,51,0),rgba(28,43,51,.82));color:#fff;font-size:.84rem;font-weight:650;line-height:1.2}
.rgal-i figcaption .ico{width:14px;height:14px;flex:none;color:#7fe3a5}
@media (hover:hover){.rgal-i:hover img{transform:scale(1.05)}}
.rgal-note{display:flex;align-items:center;gap:8px;margin:14px 0 0;color:var(--muted);font-size:.88rem}
.rgal-note .ico{width:16px;height:16px;color:var(--teal-deep)}
.product-media--real{padding:0;height:240px}
.product-media--real img{width:100%;height:100%;max-height:none;object-fit:cover}
@media (max-width:1080px){.section--real-home .rgal{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (max-width:960px){.page-hero-media.is-real{aspect-ratio:4/3;max-height:none}}
@media (max-width:640px){
  .rgal.m-rail>*{flex-basis:58%}
  .page-hero-media.is-real{aspect-ratio:1/1}
  .product-media--real{height:190px}
  .real-badge{left:10px;bottom:10px;font-size:.74rem;padding:6px 10px}
}
`);
console.log('ok');
