export default [
  { wait: 1000 },
  { eval: `const s=[...document.querySelectorAll('svg.ico')].filter(x=>x.querySelector('use[href="#i-nut"]'));return s.map(x=>getComputedStyle(x).animationName+' '+x.closest('li,div').className)` },
];
