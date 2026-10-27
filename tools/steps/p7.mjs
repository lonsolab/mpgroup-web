const path = (a, b, n = 8) => Array.from({ length: n }, (_, i) => [Math.round(a[0] + (b[0] - a[0]) * (i + 1) / n), Math.round(a[1] + (b[1] - a[1]) * (i + 1) / n)]);
export default [
  { init: `window.__err=[];addEventListener('error',e=>__err.push(e.message));` },
  { eval: `location.reload();return 1` },
  { wait: 900 },
  { mouse: path([300, 300], [500, 420]) },
  { wait: 900 },
  { eval: `document.getElementById('ap-t').scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,700));const a=document.querySelector('a.appliance[href="/calefones/"]').getBoundingClientRect(), b=document.querySelector('a.appliance[href="/secarropas/"]').getBoundingClientRect();window.__a=[a.left+60,a.top+60];window.__b=[b.left+60,b.top+60];return [window.__a.map(Math.round), window.__b.map(Math.round)]` },
];
