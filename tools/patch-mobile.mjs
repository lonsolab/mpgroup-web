// Pasada 10: versión celular (pie plegable, bento compacto, reseñas compactas, toques más grandes)
import fs from 'fs';
const ed = (F, a, b) => { let s = fs.readFileSync(F, 'utf8'); if (!s.includes(a)) throw new Error(F + ': ' + a.slice(0, 80)); s = s.split(a).join(b); fs.writeFileSync(F, s); };

// Pie: en el celular, Servicios / Marcas / Empresa se pliegan (antes eran ~25 links seguidos)
ed('site/assets/js/site.js', '  // ---------- Tuerca (el robot', `  // ---------- Pie en el celular: los grupos de links se pliegan y se abren tocando el título
  if (window.matchMedia('(max-width: 640px)').matches) {
    d.querySelectorAll('.footer nav h2').forEach((h, k) => {
      const ul = h.nextElementSibling;
      if (!ul || ul.tagName !== 'UL') return;
      ul.id = ul.id || 'f-grp-' + k;
      h.classList.add('f-acc');
      h.innerHTML = \`<button type="button" aria-expanded="false" aria-controls="\${ul.id}">\${h.textContent}<svg class="ico" aria-hidden="true"><use href="#i-chevron"/></svg></button>\`;
      ul.classList.add('f-acc-list');
      const b = h.firstChild;
      b.addEventListener('click', () => { const v = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', v); ul.classList.toggle('open', v); });
    });
  }

  // ---------- Tuerca (el robot`);

fs.appendFileSync('site/assets/css/fx.css', `
/* =====================================================================
   Pasada 10: versión celular
   ===================================================================== */
@media (max-width:640px){
  /* pie con grupos plegables */
  .footer .f-acc{margin:0!important;border-top:1px solid rgba(255,255,255,.1)}
  .footer .f-acc button{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:52px;padding:0;border:0;background:none;color:inherit;font:inherit;cursor:pointer}
  .footer .f-acc .ico{width:18px;height:18px;transition:transform .25s}
  .footer .f-acc button[aria-expanded=true] .ico{transform:rotate(180deg)}
  .footer .f-acc-list{display:none}
  .footer .f-acc-list.open{display:block;padding-bottom:12px}
  .footer-grid{gap:0}
  .footer-grid>div:last-child{margin-top:22px}
  .footer-brand{margin-bottom:18px}

  /* bento: Repuestos y Garantía a lo ancho, ícono al costado (antes dos columnas muy angostas) */
  .bento{grid-template-columns:1fr;grid-template-areas:"y" "v" "p" "w" "r" "m";grid-auto-rows:auto}
  .b-parts,.b-warranty{display:grid;grid-template-columns:54px 1fr;column-gap:14px;align-items:center;min-height:0}
  .b-parts .b-ico,.b-warranty .b-ico{grid-row:1/3;margin:0}
  .b-parts h3,.b-warranty h3{margin:0;align-self:end}
  .b-parts p,.b-warranty p{margin:0;align-self:start}
  .b-pay{min-height:200px}
  .b-visit{min-height:210px}
  .b-years{min-height:320px}

  /* reseñas: la tarjeta de Google en una sola franja */
  .gr-summary{display:grid;grid-template-columns:auto 1fr;grid-template-areas:"g r" "s st" "c c" "l l";column-gap:14px;row-gap:2px;align-items:center;padding:16px 18px}
  .gr-summary .g-word{grid-area:g;font-size:1.5rem}
  .gr-summary .gr-sub{grid-area:s;margin:0;font-size:.9rem}
  .gr-summary .gr-rating{grid-area:r;margin:0;font-size:1.2rem}
  .gr-summary .gr-stars{grid-area:st}
  .gr-summary .gr-stars .ico{width:18px;height:18px}
  .gr-summary .gr-count{grid-area:c;margin-top:8px}
  .gr-summary .gr-link{grid-area:l;margin-top:6px;min-height:40px}
  .greviews{gap:14px}

  /* contacto: los datos de la empresa se tocan fácil */
  .company-card dd a{display:inline-flex;align-items:center;min-height:44px}
  .company-card dl div{padding:6px 0}

  /* cabecera: el edificio no se pisa con el logo */
  .fx-hq{opacity:.55}
}
`);
console.log('ok');
