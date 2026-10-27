export default [
  { init: `addEventListener('pagereveal', e => { window.__vt = !!e.viewTransition; if (e.viewTransition) e.viewTransition.ready.then(() => { window.__groups = [...document.getAnimations()].map(a => a.effect && a.effect.pseudoElement).filter(Boolean).slice(0, 12); }); });` },
  { eval: `document.querySelector('a.appliance[href="/lavarropas/"]').click(); return 'click';` },
  { wait: 1800 },
  { eval: `return {url: location.pathname, vt: window.__vt, groups: window.__groups};` },
];
