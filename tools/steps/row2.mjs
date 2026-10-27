export default [
  { wait: 1200 },
  { eval: `const r=document.querySelector('.row2').getBoundingClientRect();return [r.left,r.top+scrollY,r.width,r.height].map(Math.round)` },
  { eval: `const s=document.getElementById('c-marca').getBoundingClientRect(), i=document.getElementById('c-barrio').getBoundingClientRect();return {selTop:s.top,inTop:i.top,selH:s.height,inH:i.height}` },
];
