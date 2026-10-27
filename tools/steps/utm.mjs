export default [
  { init: `addEventListener('click',e=>{const a=e.target.closest('a[href*="whatsapp"]');if(a){window.__href=a.href;e.preventDefault();}},false);` },
  { eval: `location.href='/service-ariston/?utm_source=google&utm_campaign=ariston-hornos';return 1` },
  { wait: 2500 },
  { eval: `location.href='/heladeras/';return 1` },
  { wait: 2500 },
  { eval: `document.querySelector('.page-hero .btn--wa').click();await new Promise(r=>setTimeout(r,200));return {href: window.__href, dl: dataLayer.filter(x=>x.event==='whatsapp_click').pop()}` },
];
