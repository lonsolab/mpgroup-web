export default [
  { wait: 1200 },
  { eval: "dispatchEvent(new Event('touchstart'));return 1" },
  { wait: 1200 },
  { shot: 'fx-404a.png' },
  { eval: `for (const s of document.querySelectorAll('.nf-screw')) { s.click(); await new Promise(r=>setTimeout(r,250)); } return document.querySelector('.nf-hint').textContent` },
  { wait: 350 },
  { shot: 'fx-404b.png' },
];
