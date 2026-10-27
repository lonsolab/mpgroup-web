export default [
  { wait: 1200 },
  { eval: `const a=document.getElementById('c-marca-btn').querySelector('.combo-chev').getBoundingClientRect(), b=document.querySelector('[data-combo] .combo-btn .ico').getBoundingClientRect(), fa=document.getElementById('c-marca-btn').getBoundingClientRect(), fb=document.getElementById('c-barrio').getBoundingClientRect();return {marca: Math.round(fa.right-a.right), barrio: Math.round(fb.right-b.right), nutGira: getComputedStyle(document.querySelector('.hero .facts svg')).animationName}` },
  { eval: `document.querySelector('.hero .facts').scrollIntoView({block:'center'});return 1` },
  { shot: 'p9-03-facts.png' },
];
