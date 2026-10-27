export default [
  { init: `window.__err=[];addEventListener('error',e=>__err.push(e.message));addEventListener('click',e=>{if(e.target.closest('a[href*="whatsapp"],a[href^="tel:"]'))e.preventDefault()},true);` },
  { eval: `location.reload();return 1` },
  { wait: 2900 },
  { shot: 'fx-m1-scan.png' },
  { wait: 2500 },
  { eval: `dispatchEvent(new Event('touchstart'));await new Promise(r=>setTimeout(r,900));const a=document.querySelector('.page-hero .btn--wa');a.click();return [__err, document.querySelector('.fx-toast').textContent]` },
  { wait: 280 },
  { shot: 'fx-m2-wa.png' },
  { wait: 1500 },
  { eval: `const im=document.querySelector('.page-hero-media');const r=im.getBoundingClientRect();im.dispatchEvent(new PointerEvent('pointerdown',{pointerType:'touch',clientX:r.left+r.width*.45,clientY:r.top+r.height*.4,bubbles:true}));return [r.top,r.height].map(Math.round)` },
  { wait: 600 },
  { shot: 'fx-m3-lens.png' },
];
