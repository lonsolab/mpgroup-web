"""Hojas antes|después de las fotos mejoradas con IA (content/real → content/real-pro). Uso: python -I tools/fotos-pro-revisar.py <dir> [desde]"""
import os, sys
from PIL import Image, ImageDraw
O, P = r'C:\Users\needf\mpgroup\content\real', r'C:\Users\needf\mpgroup\content\real-pro'
H = sys.argv[1]; os.makedirs(H, exist_ok=True); desde = int(sys.argv[2]) if len(sys.argv) > 2 else 0
ns = sorted((f[:-4] for f in os.listdir(P) if f.endswith('.png')), key=lambda n: os.path.getmtime(os.path.join(P, n + '.png')))[desde:]
T, cols, per = 200, 4, 12
for k in range(0, len(ns), per):
    ch = ns[k:k + per]; rows = (len(ch) + cols - 1) // cols
    s = Image.new('RGB', (cols * (2 * T + 12), rows * (T * 4 // 3 + 20)), 'white'); d = ImageDraw.Draw(s)
    for i, n in enumerate(ch):
        x, y = (i % cols) * (2 * T + 12), (i // cols) * (T * 4 // 3 + 20)
        for j, p in enumerate((os.path.join(O, n + '.jpg'), os.path.join(P, n + '.png'))):
            t = Image.open(p).convert('RGB'); t.thumbnail((T - 4, T * 4 // 3 - 4)); s.paste(t, (x + j * T + 2, y + 2))
        d.text((x + 4, y + T * 4 // 3 + 3), f'{desde + k + i} {n}', fill='black')
    s.save(os.path.join(H, f'pro{(desde + k) // per:02d}.jpg'), quality=80)
print(len(ns))
