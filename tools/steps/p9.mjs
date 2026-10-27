const path = (a, b, n = 8) => Array.from({ length: n }, (_, i) => [Math.round(a[0] + (b[0] - a[0]) * (i + 1) / n), Math.round(a[1] + (b[1] - a[1]) * (i + 1) / n)]);
export default [
  { init: `window.__err=[];addEventListener('error',e=>__err.push(e.message));try{sessionStorage.setItem('mp-bot','1')}catch(e){}` },
  { eval: `location.reload();return 1` },
  { wait: 1200 },
  { eval: `document.querySelector('label[for=a-calefones]').click();await new Promise(r=>setTimeout(r,400));const r=document.getElementById('c-marca-btn').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2].map(Math.round)` },
  { mouse: path([500, 500], [925, 785]), click: true },
  { wait: 500 },
  { shot: 'p9-01-marca.png', clip: { x: 760, y: 560, width: 680, height: 340 } },
  { eval: 'const li=[...document.querySelectorAll("#c-marca-list li")];return {abierta:!document.getElementById("c-marca-list").hidden, opciones: li.map(x=>x.textContent)}' },
  { eval: 'document.querySelector("#c-marca-list li").dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}));await new Promise(r=>setTimeout(r,500));return {marca:document.getElementById("c-marca").value, boton:document.getElementById("c-marca-btn").textContent, mensaje:document.querySelector(".display-msg").textContent, err:__err}' },
  { shot: 'p9-02-elegida.png', clip: { x: 760, y: 560, width: 680, height: 340 } },
];
