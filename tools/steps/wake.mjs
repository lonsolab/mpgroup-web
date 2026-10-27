export default [
  { init: `window.__ev=[];['pointermove','pointerdown','wheel','keydown','touchstart','scroll'].forEach(t=>addEventListener(t,e=>__ev.push(t+'@'+Math.round(performance.now())),true));` },
  { eval: `location.reload();return 1` },
  { wait: 4000 },
  { eval: `return {layer: !!document.querySelector('.fx-layer'), grid: !!document.querySelector('.bg-grid'), ev: __ev}` },
];
