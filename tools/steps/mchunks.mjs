export default [
  { init: `try{sessionStorage.setItem('mp-bot','1')}catch(e){}` },
  { eval: `location.reload();return 1` },
  { wait: 1500 },
  { eval: `dispatchEvent(new Event('touchstart'));return 1` },
  { wait: 800 },
  { chunks: process.env.NAME || 'm', delay: 1100, max: 24 },
];
