const path = (a, b, n = 8) => Array.from({ length: n }, (_, i) => [Math.round(a[0] + (b[0] - a[0]) * (i + 1) / n), Math.round(a[1] + (b[1] - a[1]) * (i + 1) / n)]);
export default [
  { init: `try{sessionStorage.setItem('mp-bot','1')}catch(e){}` },
  { eval: `location.reload();return 1` },
  { wait: 900 },
  { mouse: path([300, 300], [500, 420]) },
  { eval: `document.getElementById('ap-t').scrollIntoView({block:'start'});return 1` },
  { wait: 900 },
  { mouse: path([700, 100], [1000, 521]) },
  { wait: 700 },
  { shot: 'p8-02-peek-der.png' },
  { mouse: path([1000, 521], [200, 521]) },
  { wait: 700 },
  { shot: 'p8-03-peek-izq.png' },
];
