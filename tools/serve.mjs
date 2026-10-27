// Servidor local que imita lo que hace el .htaccess en Hostinger (gzip + caché), para medir con Lighthouse
import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
const ROOT = path.resolve('dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(ROOT, p);
  if (p.endsWith('/')) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404, { 'content-type': TYPES['.html'] }); return res.end(fs.readFileSync(path.join(ROOT, '404.html'))); }
  const ext = path.extname(f);
  const headers = { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': /\.(css|js|woff2|webp|png|jpg|svg|ico)$/.test(ext) ? 'public, max-age=31536000, immutable' : 'public, max-age=600' };
  let body = fs.readFileSync(f);
  if (/html|css|javascript|svg|xml|plain/.test(headers['content-type']) && /gzip/.test(req.headers['accept-encoding'] || '')) { body = zlib.gzipSync(body); headers['content-encoding'] = 'gzip'; }
  res.writeHead(200, headers); res.end(body);
}).listen(8091, () => console.log('http://localhost:8091'));
