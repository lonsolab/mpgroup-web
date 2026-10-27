export default [
  { init: `try{sessionStorage.setItem('mp-bot','1')}catch(e){}` },
  { eval: `location.reload();return 1` },
  { wait: 1800 },
  { shot: (process.env.TAG||'h') + '.png', clip: { x: 0, y: 100, width: 1440, height: 760 } },
];
