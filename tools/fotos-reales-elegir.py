"""Puntúa las fotos reales de MP Group (content/real-raw) y arma candidatas por equipo y marca.

Por foto: nitidez (varianza del Laplaciano), exposición, caras detectadas (para descartar personas),
y huella perceptual para sacar duplicados de la misma visita. Escribe content/real-candidatas.json
y hojas de contacto numeradas para revisar a ojo.
Uso: python -I tools/fotos-reales-elegir.py [hojas_dir]
"""
import json, os, sys
import cv2, numpy as np
from PIL import Image, ImageOps, ImageDraw

ROOT = r'C:\Users\needf\mpgroup\content\real-raw'
OUT = r'C:\Users\needf\mpgroup\content\real-candidatas.json'
HOJAS = sys.argv[1] if len(sys.argv) > 1 else None
face = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
prof = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

def dhash(g, n=12):
    s = cv2.resize(g, (n + 1, n))
    return (s[:, 1:] > s[:, :-1]).flatten()

fotos = []
for d, _, fs in os.walk(ROOT):
    for f in sorted(fs):
        p = os.path.join(d, f)
        rel = os.path.relpath(p, ROOT).split(os.sep)
        if len(rel) < 3: continue
        im = ImageOps.exif_transpose(Image.open(p)).convert('RGB')
        a = np.asarray(im.resize((im.width // 2, im.height // 2)))
        g = cv2.cvtColor(a, cv2.COLOR_RGB2GRAY)
        sharp = float(cv2.Laplacian(g, cv2.CV_64F).var())
        mean = float(g.mean())
        caras = len(face.detectMultiScale(g, 1.1, 6, minSize=(40, 40))) + len(prof.detectMultiScale(g, 1.1, 7, minSize=(50, 50)))
        expo = 1 - min(1, abs(mean - 125) / 90)
        score = np.log1p(sharp) * (0.6 + 0.4 * expo) - 3 * caras
        fotos.append({'path': os.path.relpath(p, ROOT).replace(os.sep, '/'), 'tecnico': rel[0], 'equipo': rel[1],
                      'marca': rel[2] if len(rel) > 3 else '-', 'w': im.width, 'h': im.height,
                      'nitidez': round(sharp), 'brillo': round(mean), 'caras': caras, 'score': round(float(score), 2),
                      'hash': dhash(g).tolist()})

# duplicados: misma visita (huella casi igual) → queda la mejor
fotos.sort(key=lambda x: -x['score'])
elegidas = []
for f in fotos:
    h = np.array(f['hash'])
    if any(np.count_nonzero(h != np.array(e['hash'])) < 22 for e in elegidas if e['equipo'] == f['equipo']):
        f['dup'] = True
        continue
    elegidas.append(f)
for f in fotos: f.pop('hash', None)

grupos = {}
for f in elegidas:
    grupos.setdefault((f['equipo'], f['marca']), []).append(f)
cand = []
for (eq, ma), lst in sorted(grupos.items()):
    for f in lst[:4]:
        if f['caras'] == 0: cand.append(f)
json.dump({'todas': fotos, 'candidatas': cand}, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('fotos', len(fotos), 'sin duplicar', len(elegidas), 'candidatas', len(cand), 'con caras', sum(1 for f in fotos if f['caras']))

if HOJAS:
    os.makedirs(HOJAS, exist_ok=True)
    T, cols, per = 220, 7, 35
    for k in range(0, len(cand), per):
        chunk = cand[k:k + per]
        rows = (len(chunk) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * T, rows * (T + 26)), 'white'); dr = ImageDraw.Draw(sheet)
        for i, f in enumerate(chunk):
            im = ImageOps.exif_transpose(Image.open(os.path.join(ROOT, f['path']))); im.thumbnail((T - 6, T - 6))
            x, y = (i % cols) * T, (i // cols) * (T + 26)
            sheet.paste(im, (x + 3 + (T - 6 - im.width) // 2, y + 3 + (T - 6 - im.height) // 2))
            dr.text((x + 4, y + T), f"{k + i} {f['equipo'][:11]}/{f['marca'][:9]}", fill='black')
        sheet.save(os.path.join(HOJAS, f'cand{k // per:02d}.jpg'), quality=78)
