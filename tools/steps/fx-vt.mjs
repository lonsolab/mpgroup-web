export default [
  { init: `addEventListener('pagereveal', e => { window.__vt = !!e.viewTransition; setTimeout(() => { window.__circle = document.documentElement.classList.contains('vt-circle'); window.__vx = document.documentElement.style.getPropertyValue('--vx'); window.__anim = document.getAnimations().map(a => a.animationName + ':' + (a.effect && a.effect.pseudoElement)).filter(x => x.includes('root')); }, 30); });` },
  { wait: 1500 },
  { mouse: [[400, 400], [500, 450]] },
  { eval: `const a=document.querySelector('a.appliance[href="/heladeras/"]');a.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,400));return 1` },
  { mouse: [[160, 407]], click: true },
  { wait: 260 },
  { shot: 'fx-11-vt-mid.png' },
  { wait: 1400 },
  { eval: `return {url: location.pathname, vt: window.__vt, circle: window.__circle, vx: window.__vx, anim: window.__anim}` },
];
