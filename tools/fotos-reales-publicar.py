"""Pasa las fotos reales aprobadas a content/real/ con nombre servicio-marca-n.jpg y escribe content/real-seleccion.json.

Las candidatas salen de tools/fotos-reales-elegir.py. EXCLUIR son las que se descartaron a ojo (16/10):
personas o reflejos de personas, heladeras con fotos familiares / dibujos de chicos / imanes personales,
encuadres malos o equipos quemados.
Al optimizar (tools/img.py) se guardan en webp SIN metadatos: se pierde el GPS de las casas de los clientes.
"""
import json, os, re, shutil
from PIL import Image, ImageOps

ROOT = r'C:\Users\needf\mpgroup\content'
EXCLUIR = {29, 40, 62, 64, 68, 69, 70, 73, 74, 75, 76, 78, 81, 86, 88, 90, 102, 126, 127, 136, 156, 163}
EQUIPO = {  # carpeta → (servicio del sitio, nombre para el texto)
    'Lavarropas': ('lavarropas', 'Lavarropas'), 'Lavasecarropas': ('lavarropas', 'Lavasecarropas'),
    'Secarropas': ('secarropas', 'Secarropas'), 'Lavavajillas': ('lavavajillas', 'Lavavajillas'),
    'Heladeras': ('heladeras', 'Heladera'), 'Freezers': ('heladeras', 'Freezer'),
    'Termotanques': ('termotanques', 'Termotanque'), 'Calefones': ('calefones', 'Calefón'),
    'Hornos': ('hornos-y-cocinas', 'Horno'), 'Cocinas': ('hornos-y-cocinas', 'Cocina'), 'Anafes': ('hornos-y-cocinas', 'Anafe'),
    'Estufas': ('estufas', 'Estufa'), 'Aires Acondicionados': ('aire-acondicionado', 'Aire acondicionado'),
}
SIN_MARCA = {'Sin marca identificada', 'Otras Marcas', '-'}
slug = lambda t: re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')

cand = json.load(open(os.path.join(ROOT, 'real-candidatas.json'), encoding='utf8'))['candidatas']
dest = os.path.join(ROOT, 'real'); os.makedirs(dest, exist_ok=True)
for f in os.listdir(dest): os.remove(os.path.join(dest, f))
sel, n = [], {}
MDIR = os.path.join(os.path.dirname(ROOT), 'site', 'assets', 'img', 'm')
MAXI = [
    ('WhatsApp Image 2026-10-21 at 10.39.02 AM.jpeg', 'hornos-y-cocinas', 'Horno', 'Ariston', 'hornos-y-cocinas-ariston-13'),
    ('WhatsApp Image 2026-10-21 at 10.42.46 AM.jpeg', 'hornos-y-cocinas', 'Horno', None, 'hornos-y-cocinas-equipo-4'),
    ('WhatsApp Image 2026-10-21 at 10.45.57 AM.jpeg', 'heladeras', 'Heladera', 'Samsung', 'heladeras-samsung-2'),
    ('WhatsApp Image 2026-10-21 at 11.05.18 AM.jpeg', 'heladeras', 'Heladera', 'General Electric', 'heladeras-general-electric-4'),
    ('WhatsApp Image 2026-10-21 at 11.05.40 AM.jpeg', 'heladeras', 'Heladera', 'General Electric', 'heladeras-general-electric-5'),
    ('WhatsApp Image 2026-10-21 at 10.54.58 AM.jpeg', 'estufas', 'Estufa', 'Longvie', 'estufas-longvie-5'),
    ('WhatsApp Image 2026-10-21 at 11.23.53 AM.jpeg', 'estufas', 'Estufa', None, 'estufas-equipo-1'),
]

def publicar(base, raw, svc, nombre, marca, score):
    # fuente: la mejorada con IA (content/real-pro) > la limpiada (content/real-clean) > la original.
    # Se guarda derecha (EXIF) y sin metadatos.
    src = next((p for p in (os.path.join(ROOT, 'real-pro', base + '.png'), os.path.join(ROOT, 'real-clean', base + '.png')) if os.path.exists(p)), None)
    im = (Image.open(src) if src else ImageOps.exif_transpose(Image.open(raw))).convert('RGB')
    if src:
        # tools/img.py no recomprime si el webp ya existe: se borran los que sean más viejos que la fuente
        for w in os.listdir(MDIR):
            p = os.path.join(MDIR, w)
            if re.fullmatch(rf'real-{re.escape(base)}-\d+\.webp', w) and os.path.getmtime(p) < os.path.getmtime(src): os.remove(p)
    im.save(os.path.join(dest, base + '.jpg'), quality=92)
    sel.append({'base': 'real-' + base, 'servicio': svc, 'equipo': nombre, 'marca': marca, 'marcaSlug': slug(marca) if marca else None,
                'score': score, 'vertical': im.height > im.width})

for i, f in enumerate(cand):
    if i in EXCLUIR or f['equipo'] not in EQUIPO: continue
    svc, nombre = EQUIPO[f['equipo']]
    marca = None if f['marca'] in SIN_MARCA else f['marca']
    key = f"{svc}-{slug(marca) if marca else 'equipo'}"
    n[key] = n.get(key, 0) + 1
    base = f"{key}-{n[key]}"
    publicar(base, os.path.join(ROOT, 'real-raw', f['path']), svc, nombre, marca, f['score'])

# fotos que mandó Maxi por WhatsApp (21/10): las más representativas por marca; puntaje alto para que vayan primero
for archivo, svc, nombre, marca, base in MAXI:
    publicar(base, os.path.join(ROOT, 'real-raw', 'Maxi', archivo), svc, nombre, marca, 99)
json.dump(sel, open(os.path.join(ROOT, 'real-seleccion.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
from collections import Counter
print(len(sel), 'fotos aprobadas'); print(dict(Counter(s['servicio'] for s in sel)))
