"""Optimiza las imágenes del sitio a webp en site/assets/img/m/ y escribe map.json.

Fuentes: las fotos bajadas del sitio viejo (scrape/img/all) y las generadas para el sitio nuevo
(content/gen, base con prefijo "gen-"). Fotos anchas (>= 1200 px): 1600 y 900 de ancho.
El resto (recortes con transparencia): un solo webp de hasta 720 px.
Si los webp ya existen, no se vuelven a comprimir (method=6 es lento).
"""
import json, os, re
from PIL import Image, ImageOps
try:
    import pillow_heif; pillow_heif.register_heif_opener()  # fotos de iPhone (.heic)
except ImportError:
    pass

# content/real: fotos reales que manda MP Group (prefijo "real-"); en el sitio van antes que las generadas
SOURCES = [(r'C:\Users\needf\mpgroup\scrape\img\all', ''), (r'C:\Users\needf\mpgroup\content\gen', 'gen-'), (r'C:\Users\needf\mpgroup\content\real', 'real-')]
OUT = r'C:\Users\needf\mpgroup\site\assets\img\m'
os.makedirs(OUT, exist_ok=True)
SKIP = re.compile(r'(SAMSUNG-1|WHIRPOOL|logo\.webp|lg-2|LANDING-ARISTON|generalelectric|electrolux-1|domec-1|ariston-1|surrey|carrier|bgh|philco|zenith|electra|volcan|cropped-Logo|experiencia|washing-machine|map\.jpg|^test-)', re.I)

def clean(name):
    base = re.sub(r'^\d{4}_\d{2}_', '', name)
    base = re.sub(r'\.(webp|png|jpe?g|heic)$', '', base, flags=re.I)
    base = re.sub(r'-scaled$', '', base)
    return re.sub(r'[^a-z0-9]+', '-', base.lower()).strip('-')

out = {}
for src, prefix in SOURCES:
    for f in sorted(os.listdir(src)):
        # SKIP es para las fotos del sitio viejo; no aplica a las generadas ni a las reales (tienen nombres de marca)
        if not re.search(r'\.(webp|png|jpe?g|heic)$', f, re.I) or (not prefix and SKIP.search(f)):
            continue
        try:
            im = Image.open(os.path.join(src, f)); im.load()
            im = ImageOps.exif_transpose(im)  # las fotos de celular vienen giradas por EXIF
        except Exception as e:
            print('ERR', f, e); continue
        alpha = (not prefix) and im.mode in ('RGBA', 'LA', 'P') and ('transparency' in im.info or im.mode != 'P')
        im = im.convert('RGBA' if alpha else 'RGB')
        if alpha:
            bbox = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
            if bbox: im = im.crop(bbox)
        base = prefix + clean(f)
        w, h = im.size
        entry = {'base': base, 'w': w, 'h': h, 'alpha': alpha, 'sizes': []}
        # 480 px para tarjetas y galerías: en el celular y en las grillas no hace falta bajar la grande
        widths = [1600, 900, 480] if (w >= 1200 and not alpha) else ([min(w, 720)] if alpha else [min(w, 960), 480])
        for tw in sorted({min(t, w) for t in widths}, reverse=True):
            tw = min(tw, w)
            th = round(h * tw / w)
            name = f'{base}-{tw}.webp'
            dest = os.path.join(OUT, name)
            if not os.path.exists(dest):
                im.resize((tw, th), Image.LANCZOS).save(dest, quality=74 if not alpha else 82, method=6)
                print('nuevo', name)
            entry['sizes'].append({'w': tw, 'h': th, 'file': name})
        out[(prefix + f) if prefix else f] = entry

json.dump(out, open(os.path.join(OUT, '..', 'map.json'), 'w'), indent=1)
print(len(out), 'imágenes')
