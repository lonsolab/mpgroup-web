// Pasada 6: correcciones del 8/10 (Tuerca, camioneta del bento, "Excelente", teaser)
import fs from 'fs';
let s = fs.readFileSync('build.mjs', 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('No encontrado: ' + a.slice(0, 90)); s = s.split(a).join(b); };

// Tuerca: el robotito del asistente
rep(`function footer({`, `// Tuerca, el robotito del asistente (parpadea y mueve la antena por CSS)
const BOT = (cls = 'bot') => \`<svg class="\${cls}" viewBox="0 0 48 48" aria-hidden="true"><line x1="24" y1="5.5" x2="24" y2="11" stroke="#405965" stroke-width="2.4" stroke-linecap="round"/><circle class="bot-ant" cx="24" cy="5" r="3.3" fill="#289eba"/><rect x="5.5" y="19" width="4.5" height="11" rx="2.2" fill="#289eba"/><rect x="38" y="19" width="4.5" height="11" rx="2.2" fill="#289eba"/><rect x="8.5" y="10.5" width="31" height="28" rx="10.5" fill="#405965"/><rect x="12.5" y="15.5" width="23" height="14.5" rx="7.2" fill="#1c2b33"/><g class="bot-eyes"><ellipse cx="19.4" cy="22.8" rx="2.7" ry="3.3" fill="#8fe8f8"/><ellipse cx="28.6" cy="22.8" rx="2.7" ry="3.3" fill="#8fe8f8"/></g><path d="M19.6 33.6q4.4 2.8 8.8 0" stroke="#8fe8f8" stroke-width="2.1" fill="none" stroke-linecap="round"/></svg>\`;

function footer({`);

// el globo de WhatsApp se reemplaza por el saludo de Tuerca (no dos carteles a la vez)
const t0 = s.indexOf('<div class="wa-teaser" id="wa-teaser" hidden>');
const t1 = s.indexOf('</div>\n<button class="chat-launch"');
if (t0 < 0 || t1 < 0) throw new Error('teaser');
s = s.slice(0, t0) + s.slice(t1 + 7);

rep(`<button class="chat-launch" type="button" aria-controls="chat" aria-expanded="false" data-chat-open><span class="chat-launch-ico">\${icon('chat')}</span><span class="chat-launch-txt">¿Dudas? Preguntame</span></button>`,
  `<button class="chat-launch" type="button" aria-controls="chat" aria-expanded="false" data-chat-open><span class="cl-bubble" aria-hidden="true">¡Hola! Soy <b>Tuerca</b>, el asistente de MP Group.<br>¿Tenés alguna duda?</span><span class="chat-launch-ico">\${BOT()}</span><span class="chat-launch-txt">¿Tenés alguna duda?</span></button>`);
rep(`  <header class="chat-head">
    <svg class="mp-avatar" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#fff"/><path d="M29 8.5A15 15 0 1 0 31.5 30" fill="none" stroke="#289eba" stroke-width="3.2" stroke-linecap="round"/><text x="21" y="25.5" text-anchor="middle" font-family="Archivo,sans-serif" font-style="italic" font-weight="800" font-size="14" fill="#405965">MP</text></svg>
    <div class="chat-who"><p class="chat-t" id="chat-t">Asistente MP Group</p><p class="chat-s"><span class="status-dot" data-status-dot></span>Respuestas automáticas al instante</p></div>`,
  `  <header class="chat-head">
    <span class="chat-bot">\${BOT()}</span>
    <div class="chat-who"><p class="chat-t" id="chat-t">Tuerca <span>· asistente de MP Group</span></p><p class="chat-s"><span class="status-dot" data-status-dot></span>Respuestas automáticas al instante</p></div>`);
rep(`data-chat-open>\${icon('chat')}Dudas</button>`, `data-chat-open>\${BOT('bot bot--mini')}Dudas</button>`);

// bento: una camioneta de verdad, que arranca cuando pasás el mouse (fx.js la mueve por la ruta)
rep(`<svg class="b-route" viewBox="0 0 320 96" aria-hidden="true"><path class="b-route-line" d="M18 76 C 90 6, 214 6, 296 58"/><circle class="b-route-a" cx="18" cy="76" r="7"/><g class="b-route-b" transform="translate(296 58)"><circle r="13"/><path d="M-6 2 0-4 6 2M-4 1v5h8V1" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></g>
        <g class="b-van"><animateMotion dur="3.6s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1" keyTimes="0;.75;1" calcMode="linear" path="M18 76 C 90 6, 214 6, 296 58"/><rect x="-13" y="-16" width="26" height="15" rx="4"/><circle cx="-7" cy="0" r="3.2"/><circle cx="7" cy="0" r="3.2"/></g></svg>`,
  `<svg class="b-route" viewBox="0 0 320 100" aria-hidden="true"><path class="b-route-line" d="M26 80 C 100 30, 200 26, 258 58"/><circle class="b-route-a" cx="26" cy="80" r="6"/><g class="b-route-b" transform="translate(291 66)"><g class="b-home"><circle r="15"/><path d="M-6.5 1.5 0-5 6.5 1.5M-4.5.5v6h9v-6" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></g></g>
        <g class="b-van" transform="translate(26 80) rotate(-34) scale(.9)"><path class="bv-body" d="M-17-4.5V-17a3 3 0 0 1 3-3H6.2a3 3 0 0 1 2.4 1.2L14-12.2l3.3 1.3a2 2 0 0 1 1.3 1.9v4.5A1.5 1.5 0 0 1 17.1-3H-15.5A1.5 1.5 0 0 1-17-4.5z"/><path class="bv-glass" d="M8.2-17.6 12.6-12H7v-5.6z"/><rect class="bv-glass" x="-3" y="-17.6" width="7.6" height="5.6" rx="1.2"/><rect class="bv-stripe" x="-17" y="-9.4" width="31.5" height="2.4"/><circle class="bv-light" cx="17.4" cy="-7.4" r="1.1"/><g transform="translate(-9.5 -3)"><g class="bv-wh"><circle r="4.2"/><path d="M-2.4 0h4.8M0-2.4v4.8"/></g></g><g transform="translate(9.5 -3)"><g class="bv-wh"><circle r="4.2"/><path d="M-2.4 0h4.8M0-2.4v4.8"/></g></g></g></svg>`);

// "Excelente" solo no se entendía
rep(`<p class="b-big b-big--sm">Excelente</p><span class="stars" role="img" aria-label="5 de 5 estrellas">\${icon('star').repeat(5)}</span><p>Más de <span data-count="137">137</span> reseñas en Google</p>`,
  `<p class="b-kick">Calificación en Google</p><p class="b-big b-big--sm">Excelente</p><span class="stars" role="img" aria-label="5 de 5 estrellas">\${icon('star').repeat(5)}</span><p>Así nos califican los clientes en más de <span data-count="137">137</span> reseñas</p>`);
rep(`<span class="score-txt"><b>Excelente</b>`, `<span class="score-txt"><b>Excelente en Google</b>`);
fs.writeFileSync('build.mjs', s);

// el asistente se presenta con su nombre
const C = 'site/assets/js/chat.js';
let c = fs.readFileSync(C, 'utf8');
if (!c.includes(`'¡Hola! Soy el asistente de MP Group.'`)) throw new Error('greet');
c = c.replace(`'¡Hola! Soy el asistente de MP Group.'`, `'¡Hola! Soy <b>Tuerca</b>, el robot asistente de MP Group.'`);
fs.writeFileSync(C, c);
console.log('ok');
