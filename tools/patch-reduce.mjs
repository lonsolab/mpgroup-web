// Reducir movimiento: no apagar todo, solo lo atado al scroll
import fs from 'fs';
const NL = String.fromCharCode(10), CRLF = String.fromCharCode(13, 10);
const cut = (F, startMark, label) => {
  let s = fs.readFileSync(F, 'utf8');
  let a = s.indexOf(startMark);
  if (a < 0) a = s.indexOf(startMark.split(NL).join(CRLF));
  if (a < 0) throw new Error(label);
  let depth = 0, i = s.indexOf('{', a);
  for (; i < s.length; i++) { if (s[i] === '{') depth++; else if (s[i] === '}' && --depth === 0) break; }
  let rest = s.slice(i + 1);
  if (rest.startsWith(CRLF)) rest = rest.slice(2); else if (rest.startsWith(NL)) rest = rest.slice(1);
  fs.writeFileSync(F, s.slice(0, a) + rest);
  return a;
};
cut('site/assets/css/site.css', '@media (prefers-reduced-motion:reduce){' + NL + '  *,*::before', 'site');
const pos = cut('site/assets/css/motion.css', '@media (prefers-reduced-motion:reduce){' + NL + '  .js .h1-lines', 'motion');
let m = fs.readFileSync('site/assets/css/motion.css', 'utf8');
m = m.slice(0, pos) + [
  '/* Con las animaciones del sistema apagadas no se corta todo: lo atado al scroll se frena (en JS) y las cintas van más lento */',
  '@media (prefers-reduced-motion:reduce){',
  '  .marquee-track{animation-duration:150s}',
  '  .marquee-row--rev .marquee-track{animation-duration:170s}',
  '  .brand-run-track{animation-duration:70s}',
  '}', ''].join(NL) + m.slice(pos);
fs.writeFileSync('site/assets/css/motion.css', m);
cut('site/assets/css/fx.css', '@media (prefers-reduced-motion:reduce){' + NL + '  .odo-s', 'fx');
let f = fs.readFileSync('site/assets/css/fx.css', 'utf8');
const open = '@media (prefers-reduced-motion:no-preference){' + NL + '  :root.vt-circle';
const at = f.indexOf(open);
if (at < 0) throw new Error('vt');
const end = f.indexOf(NL + '}', at);
const inner = f.slice(at + open.length - '  :root.vt-circle'.length, end).split(NL).map(l => l.trim()).join(NL);
f = f.slice(0, at) + inner + f.slice(end + 2);
fs.writeFileSync('site/assets/css/fx.css', f);
console.log('ok');
