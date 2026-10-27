const path = (a, b, n = 8) => Array.from({ length: n }, (_, i) => [Math.round(a[0] + (b[0] - a[0]) * (i + 1) / n), Math.round(a[1] + (b[1] - a[1]) * (i + 1) / n)]);
export default [
  { init: `window.__err=[];addEventListener('error',e=>__err.push(e.message));try{sessionStorage.setItem('mp-bot','1')}catch(e){}` },
  { eval: `location.reload();return 1` },
  { wait: 900 },
  { mouse: path([300, 300], [1268, 784]), click: true },
  { wait: 500 },
  { shot: 'p8-01-combo.png', clip: { x: 760, y: 560, width: 680, height: 340 } },
  { eval: `return {abierta: !document.querySelector('.combo-list').hidden, items: document.querySelectorAll('.combo-list li').length}` },
  { mouse: [[1268, 784]], click: true },
  { wait: 300 },
  { eval: `const a=!document.querySelector('.combo-list').hidden; return {trasFlechita: a}` },
  { mouse: [[1268, 784]], click: true },
  { wait: 4600 },
  { eval: `return {trasEsperar: !document.querySelector('.combo-list').hidden, err: __err}` },
  { eval: `document.getElementById('ap-t').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,600));const q=s=>{const r=document.querySelector('a.appliance[href="/'+s+'/"]').getBoundingClientRect();return [Math.round(r.left+80),Math.round(r.top+70)]};return {izq:q('heladeras'),der:q('calefones'),med:q('termotanques')}` },
];
