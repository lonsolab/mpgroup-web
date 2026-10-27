const CSS = { base: '', anim: '*,*::before,*::after{animation:none!important;transition:none!important}', dots: '.bg-dots,.bg-grid{display:none!important}', marq: '.section--reviews,.section--brands{display:none!important}', blur: '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}', grain: '*{background-image:none!important}', shadow: '*{box-shadow:none!important;filter:none!important}', blend: '*,*::before,*::after{mix-blend-mode:normal!important}', mask: '*{-webkit-mask-image:none!important;mask-image:none!important}', nodots: '.bg-dots{display:none!important}', nocanvas: '.bg-grid{display:none!important}', static: '.bg-dots{transform:none!important;will-change:auto!important}' }[process.env.V || 'base'];
const stats = `__go=false;const a=__f.slice(2);a.sort((x,y)=>x-y);const avg=a.reduce((s,x)=>s+x,0)/a.length;return '${process.env.V || 'base'} fps '+Math.round(1000/avg)+' p95 '+Math.round(a[Math.floor(a.length*.95)])`;
export default [
  { init: `try{sessionStorage.setItem('mp-bot','1')}catch(e){};addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(CSS)};document.head.append(s)})` },
  { eval: `location.reload();return 1` },
  { wait: 1500 },
  { mouse: [[300, 300], [320, 320]] },
  { wait: 2500 },
  { eval: `window.__f=[];window.__go=true;let l=performance.now();const f=t=>{__f.push(t-l);l=t;if(__go)requestAnimationFrame(f)};requestAnimationFrame(f);for(let i=0;i<70;i++){scrollBy(0,40);await new Promise(r=>requestAnimationFrame(r));}return 1` },
  { eval: stats },
];
