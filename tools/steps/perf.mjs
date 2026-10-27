const path = (a, b, n = 30) => Array.from({ length: n }, (_, i) => [Math.round(a[0] + (b[0] - a[0]) * (i + 1) / n), Math.round(a[1] + (b[1] - a[1]) * (i + 1) / n)]);
const rec = name => `window.__f=[];window.__go=true;let l=performance.now();const f=t=>{__f.push(t-l);l=t;if(__go)requestAnimationFrame(f)};requestAnimationFrame(f);return '${name}'`;
const stats = `__go=false;const a=__f.slice(2);a.sort((x,y)=>x-y);const avg=a.reduce((s,x)=>s+x,0)/a.length;return {cuadros:a.length, fps:Math.round(1000/avg), p95:Math.round(a[Math.floor(a.length*.95)]), lentos: a.filter(x=>x>34).length, lite: document.documentElement.classList.contains('lite')}`;
export default [
  { init: `try{sessionStorage.setItem('mp-bot','1')}catch(e){}` },
  { eval: `location.reload();return 1` },
  { wait: 1500 },
  { mouse: path([300, 300], [500, 420], 5) },
  { wait: 2500 },
  { eval: rec('mouse sobre el fondo') },
  { mouse: path([200, 250], [1200, 700]), step: 16 },
  { mouse: path([1200, 700], [300, 600]), step: 16 },
  { eval: stats },
  { eval: rec('scroll') },
  { eval: `for(let i=0;i<90;i++){scrollBy(0,40);await new Promise(r=>requestAnimationFrame(r));}return 1` },
  { eval: stats },
];
