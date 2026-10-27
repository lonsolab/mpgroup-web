export default [
  { eval: `document.querySelector('.header .menu-btn').click(); await new Promise(r=>setTimeout(r,300)); return [document.activeElement.className]` },
];
