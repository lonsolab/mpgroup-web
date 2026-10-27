const path = (a, b, n = 8) => Array.from({ length: n }, (_, i) => [Math.round(a[0] + (b[0] - a[0]) * (i + 1) / n), Math.round(a[1] + (b[1] - a[1]) * (i + 1) / n)]);
export default [
  { init: `window.__err=[];addEventListener('error',e=>__err.push(e.message));` },
  { eval: `location.reload();return 1` },
  { wait: 900 },
  { mouse: path([300, 300], [500, 420]) },
  { wait: 1200 },
  { eval: `const r=document.querySelector('.combo-btn').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2].map(Math.round)` },
];
