"""Corta una captura de página completa en trozos legibles: split.py nombre [alto_trozo] [escala]"""
import sys
import numpy as np
from PIL import Image

name = sys.argv[1]
step = int(sys.argv[2]) if len(sys.argv) > 2 else 2000
scale = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
im = Image.open(f'shots/{name}.png').convert('RGB')
a = np.asarray(im)
# alto real: última fila que no sea blanca pura
nonwhite = np.where(a.reshape(a.shape[0], -1).min(1) < 254)[0]
h = int(nonwhite.max()) + 1 if len(nonwhite) else im.height
w = im.width
n = 0
for i in range(0, h, step):
    c = im.crop((0, i, w, min(h, i + step)))
    c.resize((int(w * scale), int(c.height * scale))).save(f'shots/{name}-{n}.png')
    n += 1
print(name, im.size, 'alto útil', h, 'trozos', n)
