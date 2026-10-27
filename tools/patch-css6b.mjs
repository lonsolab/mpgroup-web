import fs from 'fs';
const F = 'site/assets/css/fx.css';
let s = fs.readFileSync(F, 'utf8');
const i = s.indexOf('/* ---------- Vista técnica'), j = s.indexOf('/* ---------- Tarjetas que se inclinan');
if (i < 0 || j < 0) throw new Error('xray css');
s = s.slice(0, i) + s.slice(j);
s += `
/* ---------- Mouse: sin anillo sobre el fondo; círculo de luz tenue */
.fx-cursor:not([data-m]) .fx-cursor-ring,.fx-cursor[data-m=""] .fx-cursor-ring{width:0;height:0;border-color:transparent}
.fx-spot{position:fixed;left:0;top:0;z-index:1;width:380px;height:380px;margin:-190px 0 0 -190px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(40,158,186,.15) 0,rgba(40,158,186,.06) 38%,rgba(40,158,186,0) 68%);opacity:0;transition:opacity .45s}
.fx-spot.is-dark{background:radial-gradient(circle,rgba(255,255,255,.11) 0,rgba(255,255,255,.04) 38%,rgba(255,255,255,0) 68%)}
.fx-spot.on{opacity:1}
.fx-spot.on.is-dim{opacity:.4}
.chat-open .fx-spot{opacity:0}

/* ---------- Camioneta de la cabecera: de la empresa a la casa */
.fx-van{left:calc(28px + var(--sp) * (100% - 86px))}
.fx-hq,.fx-home{position:absolute;bottom:2px;width:18px;height:18px;display:block;background:none;border-radius:0;color:var(--slate);opacity:1;scale:1;transition:opacity .3s,color .3s,scale .45s cubic-bezier(.2,1.6,.4,1)}
.fx-hq{left:6px}
.fx-home{right:6px}
.fx-hq svg,.fx-home svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.fx-hq .w,.fx-home .w{stroke:var(--teal)}
.fx-road.is-start .fx-hq,.fx-road.is-start .fx-home{opacity:0}
.fx-road.is-end .fx-home{color:var(--wa);scale:1.25}
.fx-road.is-end .fx-home .w{stroke:var(--wa)}
.fx-road.is-end .fx-van{opacity:1;scale:1}

/* ---------- Estado de atención: la hora no queda sola en otro renglón */
.nw{white-space:nowrap}
[data-status],[data-status-note]{text-wrap:balance}

/* ---------- Reseñas con el formato de Google */
.section--reviews .section-head{margin-bottom:28px}
.greviews{display:grid;grid-template-columns:260px minmax(0,1fr);gap:20px;align-items:start}
.gr-summary{display:flex;flex-direction:column;gap:6px;padding:26px 22px;border-radius:20px;background:#fff;border:1px solid #dadce0;text-decoration:none;color:#202124;box-shadow:0 1px 2px rgba(60,64,67,.1),0 2px 6px rgba(60,64,67,.08)}
.g-word{font-family:Arial,Helvetica,sans-serif;font-size:1.9rem;font-weight:500;font-style:normal;letter-spacing:-.03em;line-height:1}
.gr-sub{font-size:1.02rem;color:#5f6368;margin-top:-2px}
.gr-rating{font-size:1.45rem;font-weight:800;font-style:normal;margin-top:12px}
.gr-stars{color:#fbbc04}
.gr-summary .gr-stars .ico{width:22px;height:22px}
.gr-count{font-size:.92rem;color:#5f6368}
.gr-link{display:inline-flex;align-items:center;gap:6px;margin-top:12px;color:#1a73e8;font-weight:600;font-size:.92rem}
.gr-link .ico{width:16px;height:16px;transition:transform .2s}
.gr-summary:hover .gr-link .ico{transform:translateX(3px)}
.gr-main{min-width:0;display:flex;flex-direction:column;gap:14px}
.gr-viewport{overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:2px;margin:-2px}
.gr-viewport::-webkit-scrollbar{display:none}
.gr-viewport:focus-visible{outline:2px solid var(--teal);outline-offset:4px;border-radius:16px}
.gr-track{list-style:none;margin:0;padding:0;display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - 32px) / 3);gap:16px}
.gr-card{scroll-snap-align:start;display:flex;flex-direction:column;gap:10px;padding:20px;border-radius:16px;background:#fff;border:1px solid #dadce0;box-shadow:0 1px 2px rgba(60,64,67,.08)}
.gr-head{display:flex;align-items:center;gap:12px}
.gr-av{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--c);color:#fff;font-family:Arial,Helvetica,sans-serif;font-weight:500;font-size:1.15rem}
.gr-who{display:grid;min-width:0;line-height:1.3}
.gr-who b{font-weight:600;color:#202124;font-size:.97rem}
.gr-who span{color:#70757a;font-size:.84rem}
.gr-g{margin-left:auto;flex:none;width:22px;height:22px}
.gr-g .ico{width:22px;height:22px}
.gr-card .gr-stars .ico{width:16px;height:16px}
.gr-card p{margin:0;color:#3c4043;font-size:.95rem;line-height:1.55}
.gr-nav{display:flex;align-items:center;gap:12px}
.gr-dots{flex:1;display:flex;justify-content:center;gap:6px}
.gr-dots i{width:8px;height:8px;border-radius:4px;background:#dadce0;transition:width .3s,background-color .3s}
.gr-dots i.on{width:22px;background:#1a73e8}
.gr-btn{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid #dadce0;background:#fff;display:grid;place-items:center;cursor:pointer;color:#3c4043;transition:background-color .2s,border-color .2s}
.gr-btn:hover{background:#f1f3f4;border-color:#c4c7c5}
.gr-btn .ico{width:18px;height:18px}
.gr-btn[data-gr="-1"] .ico{transform:rotate(180deg)}
@media (hover:hover){.gr-card:hover .stars .ico{animation-name:star-pop;animation-duration:.55s;animation-timing-function:cubic-bezier(.3,1.6,.5,1);animation-fill-mode:both}}
@media (max-width:960px){.greviews{grid-template-columns:1fr}.gr-track{grid-auto-columns:calc((100% - 16px) / 2)}}
@media (max-width:640px){.gr-track{grid-auto-columns:86%}.gr-summary{padding:20px}}
`;
fs.writeFileSync(F, s);
const B = 'site/assets/js/bg.js';
let b = fs.readFileSync(B, 'utf8');
const h0 = b.indexOf('      const g = ctx.createRadialGradient'), h1 = b.indexOf('      const buckets');
if (h0 < 0 || h1 < 0) throw new Error('halo');
b = b.slice(0, h0) + b.slice(h1);
b = b.replace('    // halo suave y malla de plano alrededor del cursor', '    // malla de plano alrededor del cursor (el círculo de luz lo pone fx.js)');
fs.writeFileSync(B, b);
console.log('ok');
