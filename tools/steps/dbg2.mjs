export default [
  { wait: 1800 },
  { eval: `return [...document.body.children].map(e=>e.tagName+'.'+e.className.toString().slice(0,20)+' h'+Math.round(e.getBoundingClientRect().height)+' d:'+getComputedStyle(e).display).join(' | ')` },
  { eval: `const m=document.querySelector('main');return m?[...m.children].slice(0,5).map(e=>e.className+' '+Math.round(e.getBoundingClientRect().height)).join(' | '):'sin main'` },
];
