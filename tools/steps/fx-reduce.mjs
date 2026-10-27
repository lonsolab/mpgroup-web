export default [
  { init: `window.__err=[];addEventListener('error',e=>__err.push(e.message));addEventListener('click',e=>{if(e.target.closest('a[href*="whatsapp"]'))e.preventDefault()},true);` },
  { eval: `location.reload();return 1` },
  { wait: 1500 },
  { mouse: [[300, 300], [400, 420]] },
  { wait: 1500 },
  { eval: `document.querySelector('.header-cta .btn--wa').click(); document.getElementById('bt-t').scrollIntoView(); await new Promise(r=>setTimeout(r,800)); return {err: __err, fx: !!document.querySelector('.fx-layer'), cursor: !!document.querySelector('.fx-cursor'), toast: document.querySelector('.fx-toast').textContent, odo: document.querySelectorAll('.odo').length, n20: document.querySelector('[data-count]').textContent}` },
];
