// Fotos de stock o de catálogo (las mandó Maxi): ChatGPT genera una foto NUEVA del mismo modelo instalado en un hogar real
// (otra escena y otro ángulo, no la misma foto retocada). Salida: content/real-pro/<nombre>.png
// Uso: node tools/situar-fotos.mjs [nombre ...]
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const RAW = 'content/real-raw/Maxi', OUT = 'content/real-pro';
const BASE = 'Tomá este equipo como referencia del modelo exacto (mismo diseño, color, terminación, manijas, panel y logo en el mismo lugar) y generá una foto NUEVA, distinta a esta, con el equipo instalado y en uso en una casa real de Buenos Aires. Que se vea como una foto real sacada con una buena cámara, con luz natural, ambiente ordenado y moderno de buen nivel, sin personas, sin textos agregados y sin que parezca hecha con IA.';
const JOBS = {
  'heladeras-general-electric-4': ['WhatsApp Image 2026-10-21 at 11.05.18 AM.jpeg', 'La heladera side by side de acero empotrada en una cocina moderna con alacenas blancas y mesada de granito oscuro, vista de frente un poco en diagonal. Foto vertical.'],
  'heladeras-general-electric-5': ['WhatsApp Image 2026-10-21 at 11.05.40 AM.jpeg', 'La heladera side by side de acero en una cocina integrada al living, con piso de madera y una isla con banquetas de fondo, vista de tres cuartos. Foto vertical.'],
  'estufas-equipo-1': ['WhatsApp Image 2026-10-21 at 11.23.53 AM.jpeg', 'La estufa a gas en un living cálido y luminoso de un departamento porteño, contra una pared clara, con un sillón y una alfombra cerca, de tarde. Foto horizontal.'],
  'estufas-longvie-5': ['WhatsApp Image 2026-10-21 at 10.54.58 AM.jpeg', 'La estufa a gas tiro balanceado instalada en la pared de un dormitorio o living moderno con piso de madera, con la llama azul encendida. Foto horizontal.'],
  'heladeras-samsung-2': ['WhatsApp Image 2026-10-21 at 10.45.57 AM.jpeg', 'La heladera de dos puertas con freezer abajo en una cocina luminosa con alacenas blancas de estilo clásico, vista de frente un poco en diagonal. Foto vertical.'],
};
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(JOBS);
let ok = 0, bad = 0;
const runOne = name => new Promise(resolve => {
  const [file, escena] = JOBS[name];
  const p = spawn('codex', ['exec', '--skip-git-repo-check', '-C', path.resolve(OUT), '-i', `"${path.resolve(RAW, file)}"`, '-'], { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
  p.stdin.end(`Generá UNA imagen con tu herramienta de generación de imágenes (no escribas código ni uses Python). Después respondé con la ruta absoluta del archivo generado.\n\n${BASE}\n${escena}`);
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
await Promise.all(wanted.map(runOne));
console.log('listo', { ok, bad });
