export default [
  { wait: 1500 },
  { shot: 'm-hero.png' },
  { eval: `window.scrollTo(0, document.querySelector('#consulta').getBoundingClientRect().top + scrollY - 70); document.querySelector('label[for=a-lavarropas]').click(); await new Promise(r=>setTimeout(r,300)); const s=document.querySelector('#c-marca'); s.value='LG'; s.dispatchEvent(new Event('change')); document.querySelector('label[for=f0]').click(); await new Promise(r=>setTimeout(r,1400)); return document.documentElement.scrollWidth + ' x ' + innerWidth;` },
  { shot: 'm-panel.png' },
  { eval: `document.querySelector('.section--reviews').scrollIntoView(); await new Promise(r=>setTimeout(r,900)); return 'ok'` },
  { shot: 'm-reviews.png' },
  { eval: `document.querySelector('[data-map]').scrollIntoView({block:'center'}); await new Promise(r=>setTimeout(r,2800)); const p=[...document.querySelectorAll('.cov-svg [data-n]')].find(x=>x.dataset.n==='Belgrano'); p&&p.dispatchEvent(new MouseEvent('click',{bubbles:true})); await new Promise(r=>setTimeout(r,500)); return 'map '+!!p` },
  { shot: 'm-map.png' },
  { eval: `document.querySelector('.header .menu-btn').click(); await new Promise(r=>setTimeout(r,600)); return [document.querySelector('main').inert, document.activeElement.className]` },
  { shot: 'm-drawer.png' },
  { eval: `document.querySelector('.drawer-close').click(); await new Promise(r=>setTimeout(r,13000)); return 'teaser hidden='+document.getElementById('wa-teaser').hidden` },
  { shot: 'm-teaser.png' },
];
