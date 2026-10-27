// Limpia el entorno de las fotos reales con ChatGPT (Codex): el equipo queda igual, se ordena lo de alrededor.
// Uso: node tools/limpiar-fotos.mjs heladeras-samsung-1 lavarropas-lg-2 ...   (sin nombres: las que usa el sitio y falten)
// Entrada: content/real/<nombre>.jpg → salida: content/real-clean/<nombre>.png (fotos-reales-publicar.py las prefiere)
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SRC = 'content/real', OUT = 'content/real-clean';
fs.mkdirSync(OUT, { recursive: true });
const CONC = +(process.env.CONC || 4);

const PROMPT = `Edit the attached photo with your built-in image editing (do not write code, do not use Python or any library). Then reply with the absolute path of the generated file.

This is a real smartphone photo taken by an appliance repair technician during a home visit. Make it presentable for the company website while keeping it a believable, honest real photo:
- Keep the appliance EXACTLY as it is: same model, shape, size, color, finish, scratches, control panel, display, knobs, handles, brand logo and position, same camera angle, perspective and framing. Do not redesign, straighten, upgrade or beautify the appliance itself.
- Remove the personal items and stickers, magnets, photos, papers and notes stuck on the appliance (the surface underneath must look like the same original finish).
- Clean up the surroundings: remove clutter such as bags, boxes, buckets, clothes, cables lying around, food, bottles, cleaning products, tools and random objects; tidy the counter tops and floor; keep the same type of room (kitchen, laundry, utility room), the same walls, tiles and floor materials, just clean and uncluttered.
- No people, no hands, no reflections of people, no pets.
- Keep natural indoor lighting and the look of a phone camera photo (slight noise, natural white balance). Not a studio shot, no bokeh, no HDR glow, no added decoration, no text, no watermark.
- Same aspect ratio and orientation as the original.` + (process.env.EXTRA ? `
- ${process.env.EXTRA}` : '');

const all = fs.readdirSync(SRC).filter(f => f.endsWith('.jpg')).map(f => f.replace(/\.jpg$/, ''));
let wanted = process.argv.slice(2);
if (!wanted.length) {
  const usadas = fs.existsSync(process.env.USADAS || '') ? fs.readFileSync(process.env.USADAS, 'utf8').split(/\s+/).filter(Boolean).map(s => s.replace(/^real-/, '')) : all;
  wanted = usadas.filter(n => all.includes(n));
}
wanted = wanted.filter(n => !fs.existsSync(path.join(OUT, n + '.png')) || process.env.FORCE);
console.log('a limpiar:', wanted.length);

let i = 0, ok = 0, bad = 0;
const runOne = name => new Promise(resolve => {
  const args = ['exec', '--skip-git-repo-check', '-C', path.resolve(OUT), '-i', path.resolve(SRC, name + '.jpg'), '-'];
  // el pedido va por stdin: con shell:true en Windows los argumentos con espacios se parten en palabras
  const p = spawn('codex', args, { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
  p.stdin.end(PROMPT);
  let out = '';
  p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
  const t = setTimeout(() => p.kill(), 9 * 60 * 1000);
  p.on('close', () => {
    clearTimeout(t);
    const m = [...out.matchAll(/([A-Za-z]:\\[^\s`'"]*generated_images\\[^\s`'"]+\.png)/g)].map(x => x[1]);
    if (m.length && fs.existsSync(m[m.length - 1])) { fs.copyFileSync(m[m.length - 1], path.join(OUT, name + '.png')); ok++; console.log('OK', name); }
    else { fs.writeFileSync(path.join(OUT, name + '.log'), out); bad++; console.log('FALLÓ', name); }
    resolve();
  });
});
const worker = async () => { while (i < wanted.length) await runOne(wanted[i++]); };
await Promise.all(Array.from({ length: CONC }, worker));
console.log('listo', { ok, bad });
