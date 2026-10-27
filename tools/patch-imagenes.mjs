// Parche de una vez: usa las imágenes generadas (content/gen → base "gen-*") donde faltaban o había stock.
import fs from 'fs';
const F = 'build.mjs';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b, all = false) => {
  if (!s.includes(a)) throw new Error('No encontrado: ' + a.slice(0, 90));
  s = all ? s.split(a).join(b) : s.replace(a, b);
};

// helpers y mapas
rep(`// Fotos de producto que faltaban o estaban cambiadas de marca (revisadas a ojo)`, `// Imágenes generadas para el sitio (content/gen): mismo técnico y misma estética en todas las páginas
const gen = base => (imgEntry('gen-' + base) ? 'gen-' + base : null);
const heroForService = s => gen('svc-' + s.slug) || s.heroImage || HERO_FALLBACK[s.slug];
const BRAND_GEN = {
  'service-samsung': 'svc-heladeras', 'service-de-heladeras-samsung': 'svc-heladeras', 'service-lg': 'svc-aire-acondicionado',
  'service-ariston': 'svc-hornos-y-cocinas', 'service-domec': 'svc-calefones', 'service-orbis': 'svc-estufas',
  'service-calefones-orbis': 'svc-calefones', 'service-electrolux': 'svc-lavarropas', 'service-de-hornos-y-cocinas-electrolux': 'svc-hornos-y-cocinas',
  'service-longvie': 'svc-termotanques', 'service-whirlpool': 'svc-secarropas', 'service-general-electric': 'svc-lavavajillas',
};
// Fotos de producto que faltaban o estaban cambiadas de marca (revisadas a ojo)`);

// la nota sin foto usa la generada
rep(`const blog = exists('content/blog.json') ? read('content/blog.json') : [];`, `const blog = exists('content/blog.json') ? read('content/blog.json') : [];
const POST_GEN = { 'errores-comunes-que-las-personas-cometen-con-sus-electrodomesticos-y-como-evitarlos': 'gen-blog-errores' };`);
rep(`const pages = []; // {path, html, priority}`, `blog.forEach(p => { if (!p.image && POST_GEN[p.slug] && imgEntry(POST_GEN[p.slug])) p.image = POST_GEN[p.slug]; });
const pages = []; // {path, html, priority}`);

// servicio y marca
rep(`  const hero = s.heroImage || HERO_FALLBACK[s.slug];`, `  const hero = heroForService(s);`);
rep(`  const hero = m.heroImage || HERO_FALLBACK[m.slug];`, `  const hero = (BRAND_GEN[m.slug] && gen(BRAND_GEN[m.slug])) || m.heroImage || HERO_FALLBACK[m.slug];`);
rep(`data-peek="\${imgSrc(s.heroImage || HERO_FALLBACK[s.slug]) || ''}"`, `data-peek="\${imgSrc(heroForService(s)) || ''}"`);
rep("    const img = PRODUCT_FIX[`${m.slug}|${a.name}`] || a.image;", "    const img = PRODUCT_FIX[`${m.slug}|${a.name}`] || a.image || (a.service && gen('prod-' + a.service));");

// home: proceso y bento
rep(`picture('fondo-cta01', 'Técnico de MP Group reparando un lavarropas en una casa'`, `picture(gen('proceso-visita') || 'fondo-cta01', 'Técnico de MP Group llegando a una casa para la visita'`);
rep(`<div class="bento-cell b-years tone">\${picture('hero-nosotros', ''`, `<div class="bento-cell b-years tone">\${picture(gen('taller-capacitacion') || 'hero-nosotros', ''`);

// nosotros y trabajá
rep(`image: imgUrl('hero-nosotros')`, `image: imgUrl(gen('equipo-camioneta') || 'hero-nosotros')`);
rep(`picture('hero-nosotros', 'Equipo de técnicos de MP Group'`, `picture(gen('equipo-camioneta') || 'hero-nosotros', 'Equipo de técnicos de MP Group'`);
rep(`image: imgUrl('hero-trabaja')`, `image: imgUrl(gen('taller-capacitacion') || 'hero-trabaja')`);
rep(`picture('hero-trabaja', 'Equipo de trabajo de MP Group'`, `picture(gen('taller-capacitacion') || 'hero-trabaja', 'Técnicos de MP Group en capacitación'`);

// contacto con foto
rep(`<section class="page-hero page-hero--noimg">\${arcsSvg('page-arcs')}<div class="wrap">
  <div>
    \${crumbs([['Inicio', '/'], ['Contacto', url]])}`, `<section class="page-hero\${gen('contacto-operadora') ? '' : ' page-hero--noimg'}">\${arcsSvg('page-arcs')}<div class="wrap">
  <div>
    \${crumbs([['Inicio', '/'], ['Contacto', url]])}`);
rep(`    <p class="lead">La forma más rápida de pedir una visita es por WhatsApp: contanos qué equipo es, la marca y qué le pasa.</p>
  </div>
</div></section>`, `    <p class="lead">La forma más rápida de pedir una visita es por WhatsApp: contanos qué equipo es, la marca y qué le pasa.</p>
  </div>
  \${gen('contacto-operadora') ? \`<div class="page-hero-media">\${picture(gen('contacto-operadora'), 'Coordinadora de MP Group respondiendo consultas', { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}</div>\` : ''}
</div></section>`);

// blog: hero con foto en el índice (no en las categorías)
rep(`<section class="page-hero page-hero--noimg">\${arcsSvg('page-arcs')}<div class="wrap"><div>`, `<section class="page-hero\${!cat && gen('blog-index') ? ' page-hero--blog' : ' page-hero--noimg'}">\${arcsSvg('page-arcs')}<div class="wrap"><div>`);
rep(`  <nav class="cat-tabs" aria-label="Categorías">\${tabs.map(([n, u, on]) => \`<a class="cat-tab" href="\${u}"\${on ? ' aria-current="page"' : ''}>\${n}</a>\`).join('')}</nav>
</div></div></section>`, `  <nav class="cat-tabs" aria-label="Categorías">\${tabs.map(([n, u, on]) => \`<a class="cat-tab" href="\${u}"\${on ? ' aria-current="page"' : ''}>\${n}</a>\`).join('')}</nav>
</div>\${!cat && gen('blog-index') ? \`<div class="page-hero-media">\${picture(gen('blog-index'), 'Herramientas de un técnico de electrodomésticos', { eager: true, sizes: '(max-width:960px) 100vw, 560px' })}</div>\` : ''}</div></section>`);

fs.writeFileSync(F, s);
console.log('parche aplicado');
