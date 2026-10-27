export default [
  { eval: `document.querySelector('[data-map]').scrollIntoView({block:'center'}); return 'scroll';` },
  { wait: 2600 },
  { eval: `const p=[...document.querySelectorAll('.cov-svg [data-n]')].find(x=>x.dataset.n==='Palermo'); p.dispatchEvent(new MouseEvent('click',{bubbles:true})); await new Promise(r=>setTimeout(r,400));
    return {paths:document.querySelectorAll('.cov-svg [data-n]').length, in:document.querySelector('.cov-svg').classList.contains('in'), name:document.querySelector('.cov-card-name').textContent, href:decodeURIComponent(document.querySelector('.cov-card-hit a').href).slice(40)};` },
  { eval: `const r=document.querySelector('[data-map]').getBoundingClientRect(); window.__r={x:r.left,y:r.top+scrollY,w:r.width,h:r.height}; return window.__r;` },
  { shot: 'map-live.png', full: true },
];
