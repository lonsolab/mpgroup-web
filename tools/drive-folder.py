"""Baja una carpeta pública de Google Drive (con subcarpetas) sin cuenta ni API.

Uso: python -I tools/drive-folder.py <id_carpeta> <destino>
Lista con embeddedfolderview y baja cada archivo con drive.usercontent; saltea los que ya existen.
"""
import html, os, re, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36'}

def get(url, tries=4):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception as e:
            if k == tries - 1: raise
            time.sleep(2 + k * 3)

def listar(fid):
    page = get(f'https://drive.google.com/embeddedfolderview?id={fid}#list').decode('utf8', 'replace')
    out = []
    for m in re.finditer(r'<a href="([^"]+)"[^>]*>.*?<div class="flip-entry-title">([^<]+)</div>', page, re.S):
        href, title = html.unescape(m.group(1)), html.unescape(m.group(2)).strip()
        if '/folders/' in href:
            out.append(('dir', re.search(r'/folders/([\w-]+)', href).group(1), title))
        else:
            mm = re.search(r'/file/d/([\w-]+)', href) or re.search(r'[?&]id=([\w-]+)', href)
            if mm: out.append(('file', mm.group(1), title))
    return out

def recorrer(fid, dest, tareas):
    os.makedirs(dest, exist_ok=True)
    for kind, id_, title in listar(fid):
        safe = re.sub(r'[<>:"/\\|?*]', '_', title)
        if kind == 'dir': recorrer(id_, os.path.join(dest, safe), tareas)
        else: tareas.append((id_, os.path.join(dest, safe)))

def bajar(t):
    id_, path = t
    if os.path.exists(path) and os.path.getsize(path) > 1000: return 'ya'
    data = get(f'https://drive.usercontent.google.com/download?id={id_}&export=download&confirm=t')
    if data[:15].lower().startswith(b'<!doctype html') or data[:5].lower() == b'<html':
        return 'html (sin permiso?) ' + os.path.basename(path)
    with open(path, 'wb') as f: f.write(data)
    return 'ok'

if __name__ == '__main__':
    fid, dest = sys.argv[1], sys.argv[2]
    tareas = []
    recorrer(fid, dest, tareas)
    print('archivos en la carpeta:', len(tareas), flush=True)
    res = {}
    with ThreadPoolExecutor(6) as ex:
        for r in ex.map(bajar, tareas):
            k = r.split(' ')[0]; res[k] = res.get(k, 0) + 1
            if k not in ('ok', 'ya'): print(r, flush=True)
    print(res, flush=True)
