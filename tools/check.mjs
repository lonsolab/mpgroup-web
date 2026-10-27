// Revisa enlaces internos, imágenes y metadatos de todas las páginas generadas
import fs from 'fs'; import path from 'path';
const D = 'dist'; const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : f.endsWith('.html') && files.push(p); } })(D);
const titles = new Map(), descs = new Map(); let bad = 0;
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    let u = m[1]; let t = path.join(D, u);
    if (u.endsWith('/')) t = path.join(t, 'index.html');
    if (!fs.existsSync(t)) { console.log('ROTO', f, u); bad++; }
  }
  for (const m of h.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) { const u = part.trim().split(' ')[0].split('?')[0]; if (!fs.existsSync(path.join(D, u))) { console.log('SRCSET ROTO', f, u); bad++; } }
  const t = (h.match(/<title>(.*?)<\/title>/) || [])[1]; const d = (h.match(/name="description" content="([^"]*)"/) || [])[1];
  if (!t || !d) console.log('SIN META', f);
  if (t.length > 65) console.log('TITLE LARGO', t.length, t);
  if (titles.has(t)) console.log('TITLE DUPLICADO', f, titles.get(t)); titles.set(t, f);
  if (descs.has(d)) console.log('DESC DUPLICADA', f); descs.set(d, f);
  if ((h.match(/<h1[\s>]/g) || []).length !== 1) console.log('H1 != 1', f);
  try { JSON.parse(h.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]); } catch (e) { console.log('LD-JSON MAL', f); bad++; }
}
console.log(files.length, 'páginas revisadas,', bad, 'problemas');
