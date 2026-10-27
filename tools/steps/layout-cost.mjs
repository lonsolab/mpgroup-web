const measure = `const m=()=>{const ts=[];for(let k=0;k<5;k++){document.body.style.width=(k%2?'99.9%':'');const t=performance.now();void document.body.offsetHeight;ts.push(performance.now()-t);}document.body.style.width='';ts.sort((a,b)=>a-b);return ts[2].toFixed(1)};`;
export default [
  { wait: 1500 },
  { eval: `${measure} return 'con fx.css: '+m()+' ms'` },
  { eval: `${measure} const sh=[...document.styleSheets].find(s=>s.href&&s.href.includes('site.css'));let i=[...sh.cssRules].findIndex(r=>r.cssText.startsWith('@property --xr'));const n=sh.cssRules.length;while(sh.cssRules.length>i)sh.deleteRule(i);return 'sin fx.css ('+(n-i)+' reglas): '+m()+' ms'` },
];
