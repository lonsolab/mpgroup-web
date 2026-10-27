export default [
  { wait: 900 },
  { eval: `dispatchEvent(new Event('touchstart'));document.getElementById('rv-t').scrollIntoView({block:'start'});return 1` },
  { wait: 1500 },
  { shot: 'p6d-resenas-m.png' },
  { eval: `return {overflowX: document.documentElement.scrollWidth > innerWidth, cards: document.querySelectorAll('.gr-card').length}` },
];
