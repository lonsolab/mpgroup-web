// Pasada 5: microinteracciones (fx.js + fx.css)
import fs from 'fs';
let s = fs.readFileSync('build.mjs', 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('No encontrado: ' + a.slice(0, 90)); s = s.replace(a, b); };
rep(`const cssParts = ['site.css', 'motion.css', 'design.css', 'chat.css']`, `const cssParts = ['site.css', 'motion.css', 'design.css', 'chat.css', 'fx.css']`);
rep(`<script src="/assets/js/bg.js?v=\${ASSET_V}" defer></script>`, `<script src="/assets/js/bg.js?v=\${ASSET_V}" defer></script>
<script src="/assets/js/fx.js?v=\${ASSET_V}" defer></script>`);
// la página nueva se abre en círculo desde el punto del clic (lo guarda fx.js); tiene que escucharse antes del primer cuadro
rep(`requestIdleCallback(go,{timeout:2000}):setTimeout(go,1000)});</script>`, `requestIdleCallback(go,{timeout:2000}):setTimeout(go,1000)});addEventListener('pagereveal',function(e){if(!e.viewTransition)return;try{var c=JSON.parse(sessionStorage.getItem('mp-vt')||'null');sessionStorage.removeItem('mp-vt');if(c&&Date.now()-c.t<5000){var r=document.documentElement;r.style.setProperty('--vx',c.x+'px');r.style.setProperty('--vy',c.y+'px');r.classList.add('vt-circle');e.viewTransition.finished.finally(function(){r.classList.remove('vt-circle')})}}catch(_){}});</script>`);
fs.writeFileSync('build.mjs', s);

// los contadores ahora son cuentakilómetros (fx.js)
const J = 'site/assets/js/site.js';
let j = fs.readFileSync(J, 'utf8');
const a = j.indexOf('  // ---------- Contadores'), b = j.indexOf('  // ---------- Pasos: la línea');
if (a < 0 || b < 0) throw new Error('contadores');
j = j.slice(0, a) + '  // ---------- Contadores: los anima fx.js (cuentakilómetros)\n\n' + j.slice(b);
fs.writeFileSync(J, j);
console.log('ok');
