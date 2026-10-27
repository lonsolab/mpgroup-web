const path = (a, b, n = 8) => Array.from({ length: n }, (_, i) => [Math.round(a[0] + (b[0] - a[0]) * (i + 1) / n), Math.round(a[1] + (b[1] - a[1]) * (i + 1) / n)]);
export default [
  { wait: 900 },
  { mouse: path([300, 300], [500, 420]) },
  { wait: 900 },
  { eval: `document.querySelector('.cta').scrollIntoView({block:'center'});return 1` },
  { wait: 1800 },
  { mouse: path([300, 300], [560, 620], 6) },
  { wait: 900 },
  { shot: 'p6c-cta.png' },
];
