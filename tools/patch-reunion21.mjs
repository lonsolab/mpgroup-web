// Reunión con Maxi (21/10): asistente "Soledad", marca destacada, 6 fotos por galería,
// orden de productos por rentabilidad y sin la estufa Orbis discontinuada
import fs from 'fs';
let s = fs.readFileSync('build.mjs', 'utf8');
const rep = (a, b, all = true) => { if (!s.includes(a)) throw new Error('No encontrado: ' + a.slice(0, 80)); s = all ? s.split(a).join(b) : s.replace(a, b); };

// 1. El asistente se llama Soledad (los nombres femeninos generan más confianza, según Maxi)
rep('// Tuerca, el robotito del asistente', '// Soledad, la asistente virtual (robot; el nombre lo eligió MP Group)');
rep('aria-label="¿Tenés alguna duda? Abrí el asistente Tuerca"', 'aria-label="¿Tenés alguna duda? Abrí a Soledad, la asistente virtual"');
rep('¡Hola! Soy <b>Tuerca</b>, el asistente de MP Group.', '¡Hola! Soy <b>Soledad</b>, la asistente virtual de MP Group.');
rep('<p class="chat-t" id="chat-t">Tuerca <span>· asistente de MP Group</span></p>', '<p class="chat-t" id="chat-t">Soledad <span>· asistente virtual de MP Group</span></p>');

// 2. Galerías: 6 fotos como máximo (simplicidad)
s = s.replace(/(realGallery\(\{ id: 'rg-t'[^\n]*?)\.slice\(0, 8\)/g, '$1.slice(0, 6)');
rep('items: items.slice(0, 12)', 'items: items.slice(0, 6)');
if ((s.match(/\.slice\(0, 6\) \}\)\}/g) || []).length < 2) throw new Error('galerías');

// 3. Marca destacada en el título y en los productos de cada página de marca
rep('    <h1 style="margin-top:22px">${esc(m.h1)}</h1>', '    <h1 style="margin-top:22px">${brandEm(m.h1, m.brand)}</h1>');
rep('<div class="product-body"><h3>${esc(a.name)}</h3>', '<div class="product-body"><h3>${brandEm(a.name, m.brand)}</h3>');
rep('function brandPage(m) {', `// resalta el nombre de la marca dentro de un texto (Maxi: "destacar la marca en los nombres")
const brandEm = (t, b) => esc(t).replace(new RegExp(\`(\${b.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')})\`, 'i'), '<span class="brand-em">$1</span>');

function brandPage(m) {`, false);

// 4. Orden de productos por rentabilidad y productos que no van (content/real-prefs.json → orden / quitar)
rep('  <div class="products">${m.appliances.map(a => {', '  <div class="products">${brandApps(m).map(a => {');
rep('  const bSlug = slugify(m.brand)', `  const bApps = brandApps(m);
  const bSlug = slugify(m.brand)`);
rep('function brandPage(m) {', `const brandApps = m => {
  const quitar = (PREFS.quitar || {})[m.slug] || [], orden = (PREFS.orden || {})[m.slug] || [];
  const pos = a => { const i = orden.indexOf(a.service); return i < 0 ? 99 : i; };
  return m.appliances.filter(a => !quitar.includes(a.service)).map((a, i) => [a, i]).sort((x, y) => pos(x[0]) - pos(y[0]) || x[1] - y[1]).map(x => x[0]);
};

function brandPage(m) {`, false);
// fotos que no se muestran (p. ej. estufas Orbis discontinuadas)
rep("REALS.sort((a, b) => (INOX.has(b.base) - INOX.has(a.base)) || b.score - a.score);", `for (let i = REALS.length - 1; i >= 0; i--) if ((PREFS.sinFotos || []).some(([sv, mk]) => REALS[i].servicio === sv && REALS[i].marcaSlug === mk)) REALS.splice(i, 1);
REALS.sort((a, b) => (INOX.has(b.base) - INOX.has(a.base)) || b.score - a.score);`);
fs.writeFileSync('build.mjs', s);

for (const [F, a, b] of [
  ['site/assets/js/chat.js', "'¡Hola! Soy <b>Tuerca</b>, el robot asistente de MP Group.'", "'¡Hola! Soy <b>Soledad</b>, la asistente virtual de MP Group.'"],
  ['site/assets/js/site.js', '// ---------- Tuerca (el robot del asistente)', '// ---------- Soledad (la asistente virtual)'],
]) { let t = fs.readFileSync(F, 'utf8'); if (!t.includes(a)) throw new Error(F); fs.writeFileSync(F, t.split(a).join(b)); }

// preferencias nuevas
const P = 'content/real-prefs.json';
const p = JSON.parse(fs.readFileSync(P, 'utf8'));
p.orden = {
  'service-samsung': ['heladeras', 'lavarropas', 'secarropas'], 'service-lg': ['heladeras', 'lavarropas', 'secarropas'],
  'service-whirlpool': ['heladeras', 'lavarropas', 'secarropas'], 'service-general-electric': ['heladeras'],
  'service-orbis': ['calefones', 'termotanques'], 'service-longvie': ['hornos-y-cocinas', 'estufas'],
};
p.quitar = { 'service-orbis': ['estufas'] };
p.sinFotos = [['estufas', 'orbis']];
fs.writeFileSync(P, JSON.stringify(p, null, 1));
fs.appendFileSync('site/assets/css/fx.css', `
/* ---------- Marca destacada (reunión 21/10) */
.brand-em{color:var(--teal-deep);background:linear-gradient(transparent 68%,rgba(40,158,186,.22) 0);padding:0 .06em}
.product h3 .brand-em{background:none;padding:0;font-weight:900}
`);
console.log('ok');
