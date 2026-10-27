const rect = sel => `const r=document.querySelector('${sel}').getBoundingClientRect();return [Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)];`;
export default [
  { init: `window.__err=[];addEventListener('error',e=>__err.push(e.message));` },
  { wait: 300 },
  { eval: `location.reload(); return 'r'` },
  { wait: 2500 },
  { eval: `return {err:__err, cursor:!!document.querySelector('.fx-cursor'), rail:document.querySelectorAll('.fx-rail-i').length, odo:document.querySelectorAll('.odo').length, gauge:!!document.querySelector('.fx-gauge'), xray:document.querySelectorAll('[data-xray]').length, pill:!!document.querySelector('.fx-nav-pill')}` },
  // menú: píldora
  { mouse: [[700, 70], [760, 72], [800, 72]] , step: 60},
  { wait: 500 },
  { shot: 'fx-01-nav.png', clip: { x: 300, y: 0, width: 1140, height: 130 } },
  // cursor sobre WhatsApp del hero
  { eval: `const a=document.querySelector('.header-cta .btn--wa');const r=a.getBoundingClientRect();window.__wa=[Math.round(r.left+r.width/2),Math.round(r.top+r.height/2)];return window.__wa` },
  { eval: 'return 0' },
  { wait: 400 },
  { shot: 'fx-02-cursor-wa.png', clip: { x: 0, y: 380, width: 720, height: 300 } },
  // clic en el fondo: onda
  { mouse: [[640, 860]], click: true },
  { wait: 260 },
  { shot: 'fx-03-shock.png', clip: { x: 340, y: 600, width: 600, height: 300 } },
  // armador: equipo + marca + falla → manómetro
  { eval: `document.querySelector('label[for=a-heladeras]').click(); await new Promise(r=>setTimeout(r,300)); const s=document.getElementById('c-marca'); s.value=s.options[1].value; s.dispatchEvent(new Event('change')); await new Promise(r=>setTimeout(r,300)); document.querySelector('#c-fallas label').click(); await new Promise(r=>setTimeout(r,1300)); window.scrollTo(0,0); return document.querySelector('.fx-gauge').textContent` },
  { wait: 500 },
  { eval: `const r=document.querySelector('#consulta .display').getBoundingClientRect();return [r.left,r.top,r.width,r.height].map(Math.round)` },
  { shot: 'fx-04-gauge.png', clip: { x: 760, y: 150, width: 640, height: 300 } },
  // camioneta + índice lateral + odómetro
  { eval: `document.getElementById('bt-t').scrollIntoView({block:'start'}); return scrollY` },
  { wait: 2600 },
  { shot: 'fx-05-bento.png' },
  // vista técnica (escáner y lente)
  { eval: `document.querySelector('.process-photo').scrollIntoView({block:'center'}); return 1` },
  { wait: 1600 },
  { shot: 'fx-06-scan.png' },
  { wait: 2600 },
  { eval: `const r=document.querySelector('.process-photo').getBoundingClientRect();window.__pp=r;return [r.left,r.top,r.width,r.height].map(Math.round)` },
];
