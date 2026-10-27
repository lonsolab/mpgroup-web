# mpgroup.com.ar

Sitio estático de MP Group (service de electrodomésticos, CABA y Zona Norte).

- **Generar el sitio:** `node build.mjs` → carpeta `dist/` (eso es lo que va a `public_html` en Hostinger, incluido el `.htaccess`).
- **Vista previa sin Tag Manager y sin indexar:** `PREVIEW=1 node build.mjs` → `dist-preview/`.
- **Textos:** `content/servicios.json`, `content/marcas.json`, `content/blog.json`. Las constantes del negocio (teléfonos, WhatsApp, GTM, horarios, reseñas) están al principio de `build.mjs`.
- **Fotos:** las optimizadas están en `site/assets/img/m` (las usa el build). Qué foto va en cada página y el orden de los productos por marca: `content/real-prefs.json`.
- **Estilos y scripts:** `site/assets/css` y `site/assets/js` (sin frameworks).
- **WhatsApp:** los botones usan `api.whatsapp.com/send` (el GTM mide la conversión con esa URL). Si la visita llega con UTM, el mensaje termina con "(Ref: fuente/campaña)".

> `content/real-candidatas.json` (lista de fotos del Drive con nombres de técnicos) y `notas/` son internos y no están en el repo; `tools/fotos-reales-elegir.py` regenera la lista desde el Drive.
