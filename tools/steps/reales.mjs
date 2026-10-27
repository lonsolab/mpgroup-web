export default [
  { init: `try{sessionStorage.setItem('mp-bot','1')}catch(e){}` },
  { eval: `location.reload();return 1` },
  { wait: 1500 },
  { mouse: [[300, 300], [320, 330]] },
  { wait: 900 },
  { shot: (process.env.TAG||'')+'r-01-hero.png' },
  { eval: `const g=document.querySelector('.section--real');g.scrollIntoView({block:'start'});await new Promise(r=>setTimeout(r,1500));return 1` },
  { shot: (process.env.TAG||'')+'r-02-galeria.png' },
  { eval: `const p=document.querySelector('.products, .faults');if(p){p.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,1200));}return !!p` },
  { shot: (process.env.TAG||'')+'r-03-productos.png' },
];
