// Pasada 6b: reseñas estilo Google, nombre accesible de Tuerca
import fs from 'fs';
let s = fs.readFileSync('build.mjs', 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('No encontrado: ' + a.slice(0, 90)); s = s.split(a).join(b); };

rep(`<button class="chat-launch" type="button" aria-controls="chat" aria-expanded="false" data-chat-open>`,
  `<button class="chat-launch" type="button" aria-controls="chat" aria-expanded="false" aria-label="Abrir el asistente Tuerca: ¿tenés alguna duda?" data-chat-open>`);

// tarjeta de reseña con el formato de Google (avatar de color, nombre, fecha, logo G, estrellas)
rep(`function home() {`, `const GR_COLORS = ['#1a73e8', '#e8710a', '#188038', '#d93025', '#9334e6', '#12b5cb', '#c5221f', '#f29900', '#1967d2', '#b06000'];
const gWord = () => '<span class="g-word" aria-label="Google"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></span>';
const gReview = ([n, dt, t], i) => \`<li class="gr-card"><div class="gr-head"><span class="gr-av" style="--c:\${GR_COLORS[i % GR_COLORS.length]}" aria-hidden="true">\${initials(n).slice(0, 1)}</span><span class="gr-who"><b>\${esc(n)}</b><span>\${new Date(dt + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span></span><span class="gr-g" title="Reseña de Google">\${icon('google')}</span></div><span class="stars gr-stars" role="img" aria-label="5 de 5 estrellas">\${icon('star').repeat(5)}</span><p>\${esc(t)}</p></li>\`;

function home() {`);

const a = s.indexOf('<section class="section section--reviews" aria-labelledby="rv-t">');
const b = s.indexOf('</section>', a) + '</section>'.length;
if (a < 0) throw new Error('reviews');
s = s.slice(0, a) + `<section class="section section--reviews" aria-labelledby="rv-t"><div class="wrap">
  <div class="section-head rv"><h2 id="rv-t">Lo que dicen nuestros clientes</h2><p>Reseñas de Google de vecinos de CABA y Zona Norte.</p></div>
  <div class="greviews" data-greviews>
    <a class="gr-summary" href="\${SITE.maps}" target="_blank" rel="noopener">
      \${gWord()}<span class="gr-sub">Reseñas</span>
      <b class="gr-rating">Excelente</b>
      <span class="stars gr-stars" role="img" aria-label="5 de 5 estrellas">\${icon('star').repeat(5)}</span>
      <span class="gr-count">Basado en más de <span data-count="137">137</span> reseñas</span>
      <span class="gr-link">Ver todas en Google\${icon('arrow')}</span>
    </a>
    <div class="gr-main">
      <div class="gr-viewport" tabindex="0" aria-label="Reseñas de clientes, se pueden deslizar"><ul class="gr-track">\${REVIEWS.map(gReview).join('')}</ul></div>
      <div class="gr-nav"><button class="gr-btn" type="button" data-gr="-1" aria-label="Ver reseñas anteriores">\${icon('arrow')}</button><span class="gr-dots" aria-hidden="true"></span><button class="gr-btn" type="button" data-gr="1" aria-label="Ver más reseñas">\${icon('arrow')}</button></div>
    </div>
  </div>
</div></section>` + s.slice(b);
fs.writeFileSync('build.mjs', s);
console.log('ok');
