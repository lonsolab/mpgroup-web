// Edge sin interfaz controlado por CDP: corre pasos en una página, emula celular y saca capturas.
// Uso: node tools/cdp.mjs <ruta> <ancho> <alto> <mobile:0|1> <script.js con pasos> [salida.png] [fullpage:0|1]
// El script exporta un array de pasos: { eval: 'código' } | { wait: ms } | { shot: 'nombre.png', full?: bool, clip?: {x,y,width,height} }
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const [, , route = '/', W = '1366', H = '900', mobile = '0', stepsFile] = process.argv;
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9300 + Math.floor(Math.random() * 500);
const prof = path.join(process.env.TEMP || '.', 'cdp-prof-' + port);
const proc = spawn(EDGE, ['--headless=new', ...(process.env.GPU ? [] : ['--disable-gpu']), `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-sync', '--disable-extensions', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
try {
  let target;
  for (let k = 0; k < 40 && !target; k++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch { } }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });
  await send('Page.enable'); await send('Runtime.enable');
  const isMobile = mobile === '1';
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: +(process.env.DPR || (isMobile ? 2 : 1)), mobile: isMobile });
  if (process.env.BLOCK) { await send('Network.enable'); await send('Network.setBlockedURLs', { urls: process.env.BLOCK.split(',') }); }
  if (process.env.CPU) await send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPU });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: process.env.RM || 'no-preference' }] });
  if (isMobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Page.navigate', { url: 'http://localhost:8090' + route });
  await sleep(2200);
  const steps = stepsFile ? (await import('file:///' + path.resolve(stepsFile).replace(/\\/g, '/'))).default : [];
  for (const st of steps) {
    if (st.init) await send('Page.addScriptToEvaluateOnNewDocument', { source: st.init });
    if (st.wait) await sleep(st.wait);
    // mouse real (dispara :hover y pointer events): { mouse: [[x,y], [x,y], ...], click?: true }
    if (st.mouse) {
      for (const [x, y] of st.mouse) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y }); await sleep(st.step || 40); }
      if (st.click) { const [x, y] = st.mouse[st.mouse.length - 1]; await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }); }
    }
    if (st.eval) {
      const r = await send('Runtime.evaluate', { expression: `(async()=>{${st.eval}})()`, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) console.log('ERROR', r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      else if (r.result.value !== undefined) console.log(typeof r.result.value === 'string' ? r.result.value : JSON.stringify(r.result.value, null, 1));
    }
    if (st.chunks) {
      // baja de a una pantalla y captura cada una (refleja el estado real de las animaciones ligadas al scroll)
      const total = (await send('Runtime.evaluate', { expression: 'document.documentElement.scrollHeight', returnByValue: true })).result.value;
      let k = 0;
      for (let y = 0; y < total && k < (st.max || 30); y += +H, k++) {
        await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` });
        await sleep(st.delay || 900);
        const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
        fs.writeFileSync(path.join('tools/shots', `${st.chunks}-${String(k).padStart(2, '0')}.jpg`), Buffer.from(r.data, 'base64'));
      }
      console.log('capturas', st.chunks, k);
    }
    if (st.shot) {
      let params = { format: 'png' };
      if (st.full) {
        const m = await send('Page.getLayoutMetrics');
        const h = Math.ceil(m.cssContentSize.height);
        params = { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: +W, height: h, scale: 1 } };
      }
      if (st.clip) params = { format: 'png', captureBeyondViewport: true, clip: { ...st.clip, scale: 1 } };
      const r = await send('Page.captureScreenshot', params);
      fs.writeFileSync(path.join('tools/shots', st.shot), Buffer.from(r.data, 'base64'));
      console.log('captura', st.shot);
    }
  }
} catch (e) { console.log('FALLO', e.message); }
finally { try { ws?.close(); } catch { } proc.kill(); }
