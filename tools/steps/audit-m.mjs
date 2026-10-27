// Auditoría en celular: recorre la página (para que carguen mapas, carruseles, etc.) y busca
// desbordes horizontales, texto cortado, objetivos táctiles chicos y letra muy chica.
const PAGES = (process.env.PAGES || '/').split(',');
const audit = `
  const W = innerWidth;
  const skip = el => el.closest('.m-rail, .brand-run, .gr-viewport, .marquee, .bg-dots, .bg-grid, .fx-layer, .fx-toast, .chat, .drawer, [hidden], [aria-hidden="true"], .peek, .footer-mark, .fx-road, .b-ticket');
  const vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0; };
  const out = [], cut = [], small = [], tiny = new Set();
  for (const el of document.querySelectorAll('main *, header *, footer *, .mobile-bar *')) {
    if (skip(el) || !vis(el)) continue;
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if ((r.right > W + 1 || r.left < -1) && cs.position !== 'fixed') out.push((el.className.toString() || el.tagName).slice(0, 40) + ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ']');
    if (el.children.length === 0 && el.textContent.trim().length > 2 && el.scrollWidth > el.clientWidth + 2 && /hidden|clip/.test(cs.overflowX + cs.overflow) && cs.textOverflow !== 'ellipsis') cut.push((el.className.toString() || el.tagName).slice(0, 30) + ': ' + el.textContent.trim().slice(0, 30));
    if (el.matches('a[href],button,input,select,summary,label.chip,label.app-tile') && (r.height < 40 || r.width < 40) && !el.closest('p, li > p, .crumbs, .footer-bottom, .legal')) small.push((el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 26) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2) && parseFloat(cs.fontSize) < 12.5) tiny.add((el.className.toString() || el.tagName).slice(0, 24) + ' ' + cs.fontSize);
  }
  const uniq = a => [...new Set(a)].slice(0, 10);
  return { pagina: location.pathname, ancho: W, scrollWidth: document.documentElement.scrollWidth, fueraDePantalla: uniq(out), textoCortado: uniq(cut), tactilesChicos: uniq(small), letraChica: [...tiny].slice(0, 8) };
`;
const steps = [];
for (const p of PAGES) {
  steps.push({ eval: `location.href = '${p}'; return 1` }, { wait: 1800 },
    { eval: `dispatchEvent(new Event('touchstart')); const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 500)); ${audit}` });
}
export default steps;
