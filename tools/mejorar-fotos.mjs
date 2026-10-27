// Mejora con ChatGPT (Codex) las fotos reales que usa el sitio: que se vean perfectas pero reales (reunión con Maxi 21/10).
// Uso: node tools/mejorar-fotos.mjs nombre1 nombre2 ...  (env: EXTRA_<nombre con _> agrega una instrucción a esa foto)
// Entrada: content/real/<nombre>.jpg (ya limpia) → salida: content/real-pro/<nombre>.png (fotos-reales-publicar.py la prefiere)
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SRC = 'content/real', OUT = 'content/real-pro';
fs.mkdirSync(OUT, { recursive: true });
const CONC = +(process.env.CONC || 4);

const PROMPT = `Edit the attached photo with your built-in image editing (do not write code, do not use Python or any library). Then reply with the absolute path of the generated file.

This is a real photo of an appliance in a customer's home, for the website of a premium appliance repair company whose clients own high-end appliances. Retouch it like a professional real-estate / interior photographer would, so it looks perfect but still 100% real:
- The appliance must stay the SAME real product: same model, design, proportions, color and finish, control panel, display, knobs, handles, and the brand logo in the same place (do not invent, change or add any logo or text).
- Make it look premium: clean, polished surfaces; stainless steel and metallic finishes crisp and bright with natural reflections; remove smudges, fingerprints, dust, stains, stickers, magnets and anything stuck on it.
- Fix the photo: straighten converging verticals and level the horizon, frame the appliance centered with a little breathing room (it may be cropped slightly tighter than the original), even soft natural daylight, correct white balance, good exposure, sharp detail.
- Surroundings: clean, tidy and minimal, consistent with the same kind of room (modern kitchen, laundry or living room) and similar materials; no clutter, no bags, boxes, clothes, cables lying around, food or products on the counters.
- No people, no hands, no reflections of people or of the photographer in glass or steel, no pets.
- It must read as a real photograph, not CGI or a 3D render: realistic textures, natural shadows, no exaggerated HDR, no glow, no fake luxury props, no text, no watermark.
- Portrait 3:4 if the appliance is tall, otherwise keep the original orientation.` + (process.env.EXTRA ? `
- ${process.env.EXTRA}` : '') + '%EXTRA%';

// instrucciones particulares por foto
const EXTRAS = {
  'estufas-longvie-5': 'This one is a catalog product photo on a white background: place this exact gas room heater, unchanged, installed against the wall of a real, tidy, warm Buenos Aires living room (wooden floor, a sofa edge softly out of focus), photographed at eye level in natural daylight, flame window lit.',
  'estufas-equipo-1': 'Keep the living room setting; make it look like a real photo, not a render.',
  'heladeras-general-electric-4': 'The source is low resolution: rebuild fine detail faithfully (upscale) without changing the design.',
  'heladeras-general-electric-5': 'The source is low resolution: rebuild fine detail faithfully (upscale) without changing the design.',
};
const all = fs.readdirSync(SRC).filter(f => f.endsWith('.jpg')).map(f => f.replace(/\.jpg$/, ''));
let wanted = process.argv.slice(2);
if (!wanted.length) {
  const usadas = fs.existsSync(process.env.USADAS || '') ? fs.readFileSync(process.env.USADAS, 'utf8').split(/\s+/).filter(Boolean).map(s => s.replace(/^real-/, '')) : all;
  wanted = usadas.filter(n => all.includes(n));
}
wanted = wanted.filter(n => !fs.existsSync(path.join(OUT, n + '.png')) || process.env.FORCE);
console.log('a mejorar:', wanted.length);

let i = 0, ok = 0, bad = 0;
const runOne = name => new Promise(resolve => {
  const args = ['exec', '--skip-git-repo-check', '-C', path.resolve(OUT), '-i', path.resolve(SRC, name + '.jpg'), '-'];
  // el pedido va por stdin: con shell:true en Windows los argumentos con espacios se parten en palabras
  const p = spawn('codex', args, { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
  const extra = EXTRAS[name] ? `\n- ${EXTRAS[name]}` : '';
  p.stdin.end(PROMPT.replace('%EXTRA%', extra));
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
