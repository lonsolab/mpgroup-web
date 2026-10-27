// Modo vista previa: PREVIEW=1 node build.mjs → dist-preview/ (sin GTM, sin indexar, para subir a un hosting de prueba)
import fs from 'fs';
let s = fs.readFileSync('build.mjs', 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('No encontrado: ' + a.slice(0, 80)); s = s.split(a).join(b); };
rep("const DIST = path.join(ROOT, 'dist');", `// PREVIEW=1: copia para mostrar online antes de publicar. No carga el GTM (no ensucia Analytics ni las conversiones de Ads)
// y le pide a Google que no la indexe (meta robots, robots.txt y cabecera X-Robots-Tag)
const PREVIEW = !!process.env.PREVIEW;
const DIST = path.join(ROOT, PREVIEW ? 'dist-preview' : 'dist');`);
rep("${noindex ? '<meta name=\"robots\" content=\"noindex\">' : '<meta name=\"robots\" content=\"index, follow, max-image-preview:large\">'}",
  "${noindex || PREVIEW ? '<meta name=\"robots\" content=\"noindex, nofollow\">' : '<meta name=\"robots\" content=\"index, follow, max-image-preview:large\">'}");
// el GTM y su noscript solo en el sitio real
rep("window.dataLayer=window.dataLayer||[];dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});addEventListener('load',function(){var go=function(){var j=document.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=${SITE.gtm}';document.head.appendChild(j)};'requestIdleCallback' in window?requestIdleCallback(go,{timeout:2000}):setTimeout(go,1000)});",
  "window.dataLayer=window.dataLayer||[];${PREVIEW ? '' : `dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});addEventListener('load',function(){var go=function(){var j=document.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id=${SITE.gtm}';document.head.appendChild(j)};'requestIdleCallback' in window?requestIdleCallback(go,{timeout:2000}):setTimeout(go,1000)});`}");
rep('<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${SITE.gtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>',
  '${PREVIEW ? \'\' : `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${SITE.gtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`}');
rep("  fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\\nAllow: /\\n\\nSitemap: ${SITE.url}/sitemap.xml\\n`);",
  `  fs.writeFileSync(path.join(DIST, 'robots.txt'), PREVIEW ? 'User-agent: *\\nDisallow: /\\n' : \`User-agent: *\\nAllow: /\\n\\nSitemap: \${SITE.url}/sitemap.xml\\n\`);
  // Netlify / Cloudflare Pages leen _headers (en Hostinger manda el .htaccess)
  if (PREVIEW) fs.writeFileSync(path.join(DIST, '_headers'), '/*\\n  X-Robots-Tag: noindex, nofollow\\n');`);
fs.writeFileSync('build.mjs', s);
console.log('ok');
