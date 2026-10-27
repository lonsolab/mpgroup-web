"""Revisa las fotos limpiadas con ChatGPT contra las originales.

Por foto: parecido de la zona central (donde está el equipo) entre original y limpia, a escala de grises
(correlación de bordes en 160x213). Si el número es bajo, el equipo pudo haber cambiado: se revisa a ojo.
Arma hojas antes|después numeradas en <hojas_dir>.
Uso: python -I tools/fotos-limpias-revisar.py <hojas_dir>
"""
import os, sys
import numpy as np, cv2
from PIL import Image, ImageDraw

ORIG, CLEAN = r'C:\Users\needf\mpgroup\content\real', r'C:\Users\needf\mpgroup\content\real-clean'
HOJAS = sys.argv[1]; os.makedirs(HOJAS, exist_ok=True)
names = sorted(f[:-4] for f in os.listdir(CLEAN) if f.endswith('.png'))

def edges(im):
    g = cv2.cvtColor(np.asarray(im.convert('RGB').resize((160, 213))), cv2.COLOR_RGB2GRAY).astype(np.float32)
    g = g[40:173, 25:135]  # zona central
    e = cv2.Laplacian(cv2.GaussianBlur(g, (3, 3), 0), cv2.CV_32F)
    return (e - e.mean()) / (e.std() + 1e-6)

rows = []
for n in names:
    a, b = Image.open(os.path.join(ORIG, n + '.jpg')), Image.open(os.path.join(CLEAN, n + '.png'))
    if (a.width > a.height) != (b.width > b.height): sim = -1
    else: sim = float((edges(a) * edges(b)).mean())
    rows.append((sim, n, a, b))
rows.sort(key=lambda r: r[0])
for sim, n, *_ in rows: print(f'{sim:5.2f} {n}')

T, per = 200, 12
for k in range(0, len(rows), per):
    chunk = rows[k:k + per]; cols = 4
    sheet = Image.new('RGB', (cols * (2 * T + 14), ((len(chunk) + cols - 1) // cols) * (T * 4 // 3 + 26)), 'white'); d = ImageDraw.Draw(sheet)
    for i, (sim, n, a, b) in enumerate(chunk):
        x, y = (i % cols) * (2 * T + 14), (i // cols) * (T * 4 // 3 + 26)
        for j, im in enumerate((a, b)):
            t = im.convert('RGB'); t.thumbnail((T - 4, T * 4 // 3 - 4)); sheet.paste(t, (x + j * T + 2, y + 2))
        d.text((x + 4, y + T * 4 // 3 + 4), f'{k + i} {n[:26]} {sim:.2f}', fill='black')
    sheet.save(os.path.join(HOJAS, f'limpias{k // per:02d}.jpg'), quality=78)
