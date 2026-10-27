// Arma los trazos del mapa de cobertura (CABA por barrio + partidos de Zona Norte) en content/geo/map.json
// Fuentes: barrios oficiales de BA Data (data.buenosaires.gob.ar) y límites de partidos de OpenStreetMap (Nominatim).
import fs from 'fs';
const G = 'content/geo/';
const BOX = { w: -58.645, e: -58.33, n: -34.412, s: -34.742 };
const LAT0 = (BOX.n + BOX.s) / 2;
const K = 1000 / ((BOX.e - BOX.w) * Math.cos(LAT0 * Math.PI / 180));
const P = ([lon, lat]) => [(lon - BOX.w) * Math.cos(LAT0 * Math.PI / 180) * K, (BOX.n - lat) * K];
const W = 1000, H = Math.round((BOX.n - BOX.s) * K);

// Ramer-Douglas-Peucker sobre coordenadas ya proyectadas
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let idx = 0, max = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const num = Math.abs((b[1] - a[1]) * p[0] - (b[0] - a[0]) * p[1] + b[0] * a[1] - b[1] * a[0]);
    const den = Math.hypot(b[1] - a[1], b[0] - a[0]) || 1;
    const d = num / den;
    if (d > max) { max = d; idx = i; }
  }
  if (max > eps) return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
  return [a, b];
}
const ringPath = (ring, eps) => {
  // anillo cerrado: se parte en el punto más lejano al primero para que RDP no lo colapse
  const all = ring.map(P);
  let k = 1, far = 0;
  all.forEach((q, i) => { const d = Math.hypot(q[0] - all[0][0], q[1] - all[0][1]); if (d > far) { far = d; k = i; } });
  const pts = [...rdp(all.slice(0, k + 1), eps).slice(0, -1), ...rdp(all.slice(k), eps)];
  if (pts.length < 3) return '';
  return 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
};
const geomPath = (g, eps = 0.6) => {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  return polys.map(poly => poly.map(r => ringPath(r, eps)).join('')).join('');
};
const centroid = g => {
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  // centroide del anillo exterior más grande, por área
  let best = null, bestA = 0;
  for (const poly of polys) {
    const r = poly[0].map(P); let A = 0, cx = 0, cy = 0;
    for (let i = 0; i < r.length - 1; i++) { const f = r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; A += f; cx += (r[i][0] + r[i + 1][0]) * f; cy += (r[i][1] + r[i + 1][1]) * f; }
    A /= 2; if (Math.abs(A) > bestA) { bestA = Math.abs(A); best = [cx / (6 * A), cy / (6 * A)]; }
  }
  return best;
};

const NAMES = ['Agronomía', 'Almagro', 'Balvanera', 'Barracas', 'Belgrano', 'Boedo', 'Caballito', 'Chacarita', 'Coghlan', 'Colegiales', 'Constitución', 'Flores', 'Floresta', 'La Boca', 'La Paternal', 'Liniers', 'Mataderos', 'Monte Castro', 'Monserrat', 'Nueva Pompeya', 'Núñez', 'Palermo', 'Parque Avellaneda', 'Parque Chacabuco', 'Parque Chas', 'Parque Patricios', 'Puerto Madero', 'Recoleta', 'Retiro', 'Saavedra', 'San Cristóbal', 'San Nicolás', 'San Telmo', 'Vélez Sarsfield', 'Versalles', 'Villa Crespo', 'Villa del Parque', 'Villa Devoto', 'Villa General Mitre', 'Villa Lugano', 'Villa Luro', 'Villa Ortúzar', 'Villa Pueyrredón', 'Villa Real', 'Villa Riachuelo', 'Villa Santa Rita', 'Villa Soldati', 'Villa Urquiza'];
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
const byNorm = Object.fromEntries(NAMES.map(n => [norm(n), n]));
byNorm[norm('Villa Gral. Mitre')] = 'Villa General Mitre';

const OFFICE = P([-58.5031333, -34.5949664]);
const barrios = JSON.parse(fs.readFileSync(G + 'barrios.geojson', 'utf8')).features.map(f => {
  const raw = f.properties.nombre || f.properties.BARRIO || '';
  const name = byNorm[norm(raw)] || byNorm[norm(raw.replace(/^paternal$/i, 'la paternal'))] || raw;
  const c = centroid(f.geometry);
  return { name, d: geomPath(f.geometry, 0.55), c: c.map(v => +v.toFixed(1)), dist: +Math.hypot(c[0] - OFFICE[0], c[1] - OFFICE[1]).toFixed(1) };
});
const PARTIDOS = [['vicente-lopez', 'Vicente López', true], ['san-isidro', 'San Isidro', true], ['tigre', 'Tigre', true], ['san-fernando', 'San Fernando', false], ['san-martin', 'San Martín', false], ['tres-de-febrero', 'Tres de Febrero', false]];
const partidos = PARTIDOS.map(([f, name, covered]) => {
  const g = JSON.parse(fs.readFileSync(G + f + '.json', 'utf8')).features[0].geometry;
  const c = centroid(g);
  return { name, covered, d: geomPath(g, 0.8), c: c.map(v => +v.toFixed(1)), dist: +Math.hypot(c[0] - OFFICE[0], c[1] - OFFICE[1]).toFixed(1) };
});
const loc = JSON.parse(fs.readFileSync(G + 'localidades.json', 'utf8'));
// a = hacia dónde va la etiqueta, para que no se pisen
const ANCHOR = { 'Vicente López': 'start', 'Olivos': 'end', 'La Lucila': 'start', 'San Isidro': 'end', 'Acassuso': 'start', 'Béccar': 'end', 'Tigre': 'start' };
const points = Object.keys(ANCHOR).map(n => ({ name: n, a: ANCHOR[n], p: P([loc[n][1], loc[n][0]]).map(v => +v.toFixed(1)) }));
const out = { w: W, h: H, office: OFFICE.map(v => +v.toFixed(1)), barrios, partidos, points };
fs.writeFileSync(G + 'map.json', JSON.stringify(out));
const unmatched = barrios.filter(b => !NAMES.includes(b.name)).map(b => b.name);
console.log('viewBox', W, H, 'barrios', barrios.length, 'sin nombre lindo:', unmatched, 'tamaño', JSON.stringify(out).length);
