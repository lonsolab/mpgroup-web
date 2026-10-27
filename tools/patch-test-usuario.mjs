// Cambios surgidos del test de usuario (Marta, Diego, Lucía) — ver notas/test-usuario/
import fs from 'fs';
const F = 'build.mjs';
let s = fs.readFileSync(F, 'utf8');
const rep = (a, b, all = false) => {
  if (!s.includes(a)) throw new Error('No encontrado: ' + a.slice(0, 100));
  s = all ? s.split(a).join(b) : s.replace(a, b);
};

// 1. "¿Vienen hoy?": el sitio anterior prometía "en el día" y "en menos de 24 hs"; se dicen las dos cosas juntas
rep(`Un técnico va a tu casa en menos de 24 horas, con los repuestos para dejar tu equipo funcionando en la misma visita.`, `Un técnico va a tu casa en el día o dentro de las 24 horas, con los repuestos para dejar tu equipo funcionando en la misma visita.`);
rep(`<li>\${icon('van')}Visita en menos de 24 h</li>`, `<li>\${icon('van')}Visita en el día o en 24 h</li>`);
rep(`<h3>Visita en menos de 24 horas</h3>`, `<h3>Visita en el día o en 24 horas</h3>`);
rep(`'En menos de 24 horas, con los repuestos necesarios para reparar en el momento.'`, `'En el día o dentro de las 24 horas, con los repuestos necesarios para reparar en el momento.'`);
rep(`a: 'Una vez cargado el servicio, el técnico te visita en menos de 24 horas`, `a: 'Una vez cargado el servicio, el técnico te visita en el día o dentro de las 24 horas`);
rep(`<p>Un técnico va a tu casa en menos de 24 horas, con los repuestos para resolverlo en la visita.</p>`, `<p>Un técnico va a tu casa en el día o dentro de las 24 horas, con los repuestos para resolverlo en la visita.</p>`);

// 2. Precio de la visita: pregunta frecuente honesta (el monto lo tiene que confirmar MP Group)
rep(`    { q: '¿Cómo se paga el servicio?',`, `    { q: '¿Cuánto cuesta la visita?', a: 'Depende del equipo, de la falla y de los repuestos. Escribinos por WhatsApp con la marca y qué le pasa, y te informamos el costo.' },
    { q: '¿Cómo se paga el servicio?',`);

// 3. Teléfonos: que quede claro cuál es cuál
rep(`\${icon('phone')}<a href="tel:\${SITE.tel}" data-cta="topbar">\${SITE.telShow}</a>`, `\${icon('phone')}<a href="tel:\${SITE.tel}" data-cta="topbar">Tel. \${SITE.telShow}</a>`);
rep(`data-cta="topbar" target="_blank" rel="noopener">\${SITE.waShow}</a>`, `data-cta="topbar" target="_blank" rel="noopener">WhatsApp \${SITE.waShow}</a>`);

// 4. Avatar del asistente: el ícono de arcos se leía como una "C"; ahora dice MP
const AV = `<svg class="mp-avatar" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="#fff"/><path d="M29 8.5A15 15 0 1 0 31.5 30" fill="none" stroke="#289eba" stroke-width="3.2" stroke-linecap="round"/><text x="21" y="25.5" text-anchor="middle" font-family="Archivo,sans-serif" font-style="italic" font-weight="800" font-size="14" fill="#405965">MP</text></svg>`;
rep(`<img src="/favicon.svg" width="34" height="34" alt="">`, AV);
rep(`<img src="/favicon.svg" width="38" height="38" alt="">`, AV);

// 5. Barra del celular: el globito sin texto no se entendía
rep(`<button class="btn btn--line mobile-chat" type="button" aria-controls="chat" aria-expanded="false" aria-label="Abrir el asistente" data-chat-open>\${icon('chat')}</button>`, `<button class="btn btn--line mobile-chat" type="button" aria-controls="chat" aria-expanded="false" data-chat-open>\${icon('chat')}Dudas</button>`);

// 6. Armador: no prometer "tres toques" (son más) y explicar qué hace
rep(`<p class="panel-sub">En tres toques armás el mensaje y lo mandás por WhatsApp.</p>`, `<p class="panel-sub">Elegí el equipo, la marca y la falla: te escribimos el mensaje para mandarlo por WhatsApp.</p>`);

// 7. Reseñas con su fecha (son reales y la fecha ayuda a creerles)
rep(`<span><b>\${esc(n)}</b>Reseña de Google</span>`, `<span><b>\${esc(n)}</b>Google, \${new Date(dt + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>`);

// 8. Marcas: aclarar arriba, no solo en letra chica, que es un service independiente
rep(`    <h1 style="margin-top:22px">\${esc(m.h1)}</h1>`, `    <h1 style="margin-top:22px">\${esc(m.h1)}</h1>
    <p class="indep">\${icon('shield')}Servicio técnico independiente, no oficial de \${esc(m.brand)}. Trabajamos con repuestos originales.</p>`);

// 9. Contacto: el mapa de Google embebido quedaba vacío en el celular; ahora hay datos verificables de la empresa
rep(`  <div class="map"><iframe title="Mapa de la oficina de MP Group en Villa Devoto" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=\${SITE.geo[0]},\${SITE.geo[1]}&z=15&output=embed"></iframe></div>`, `  <div class="company-card">
    <h3>Datos de la empresa</h3>
    <dl>
      <div><dt>Razón social</dt><dd>\${SITE.legal}</dd></div>
      <div><dt>Oficina</dt><dd>\${SITE.street}, \${SITE.cp}, \${SITE.barrio}, CABA</dd></div>
      <div><dt>Teléfono fijo</dt><dd><a href="tel:\${SITE.tel}" data-cta="contacto-datos">\${SITE.telShow}</a></dd></div>
      <div><dt>WhatsApp</dt><dd><a href="\${waUrl('Hola MP Group, quiero consultar por un service.')}" target="_blank" rel="noopener" data-cta="contacto-datos">\${SITE.waShow}</a></dd></div>
      <div><dt>Mail</dt><dd><a href="mailto:\${SITE.email}" data-cta="contacto-datos">\${SITE.email}</a></dd></div>
    </dl>
    <a class="btn btn--line btn--block" href="\${SITE.maps}" target="_blank" rel="noopener">\${icon('pin')}Cómo llegar en Google Maps</a>
  </div>`);

// 10. Fotos generadas: el texto alternativo no afirma que sean personas reales de la empresa
rep(`'Técnico de MP Group llegando a una casa para la visita'`, `'Técnico llegando a una casa para la visita'`);
rep(`'Equipo de técnicos de MP Group'`, `'Técnicos de service de electrodomésticos'`);
rep(`'Técnicos de MP Group en capacitación'`, `'Técnicos en capacitación'`);
rep(`'Coordinadora de MP Group respondiendo consultas'`, `'Coordinadora respondiendo consultas por WhatsApp'`);

// 11. Mapa: la etiqueta "Zona Norte" pisaba "Olivos" en el celular
rep(`<text class="lbl-zone" x="\${(znC[0] - 250).toFixed(0)}"`, `<text class="lbl-zone lbl-zn" x="\${(znC[0] - 250).toFixed(0)}"`);

fs.writeFileSync(F, s);
console.log('ok');
