export default [
  { chunks: 'rt-top', max: 1 },
  { eval: `window.scrollTo(0, document.querySelector('#consulta').getBoundingClientRect().top + scrollY - 70); document.querySelector('label[for=a-calefones]').click(); await new Promise(r=>setTimeout(r,400)); const s=document.querySelector('#c-marca'); s.value='Orbis'; s.dispatchEvent(new Event('change')); document.querySelector('label[for=f0]').click(); await new Promise(r=>setTimeout(r,1600)); const b=document.querySelector('#c-enviar').getBoundingClientRect(); return 'enviar visible: '+(b.top>0&&b.bottom<innerHeight)` },
  { eval: `return 1` },
  { eval: `document.querySelector('.mobile-chat').click(); await new Promise(r=>setTimeout(r,3500)); return 'chat'` },
];
