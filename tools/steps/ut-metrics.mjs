// Métricas de usabilidad en celular: objetivos táctiles chicos, letra chica, desbordes y toques hasta WhatsApp
export default [
  { eval: `
    const vis = el => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden],.drawer,.chat,[aria-hidden="true"]'); };
    const small = [...document.querySelectorAll('a[href],button,input,select,label.chip,label.app-tile,summary')].filter(vis).map(el => { const r = el.getBoundingClientRect(); return { t: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().replace(/\\s+/g,' ').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), cls: el.className.toString().slice(0, 30) }; }).filter(x => x.h < 40 || x.w < 40);
    const groups = {}; small.forEach(x => { const k = x.cls || x.t; groups[k] = groups[k] || { n: 0, ej: x }; groups[k].n++; });
    const texts = [...document.querySelectorAll('p,li,span,a,small,figcaption,label,time')].filter(el => vis(el) && el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2));
    const tiny = {}; texts.forEach(el => { const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 14) { const k = fs.toFixed(1) + 'px ' + (el.className.toString().slice(0, 24) || el.tagName); tiny[k] = (tiny[k] || 0) + 1; } });
    return { pagina: location.pathname, anchoPagina: document.documentElement.scrollWidth, viewport: innerWidth, objetivosChicos: Object.entries(groups).sort((a, b) => b[1].n - a[1].n).slice(0, 14).map(([k, v]) => v.n + 'x ' + k + ' -> ' + v.ej.w + 'x' + v.ej.h + ' "' + v.ej.t + '"'), letraChica: Object.entries(tiny).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => v + 'x ' + k), botonWhatsAppVisibleAlCargar: [...document.querySelectorAll('a[href*="api.whatsapp.com"]')].some(a => { const r = a.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && vis(a); }) };
  ` },
];
