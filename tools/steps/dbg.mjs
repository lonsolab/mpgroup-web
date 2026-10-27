export default [
  { init: `window.__err=[];addEventListener('error',e=>__err.push(e.message+' '+e.filename+':'+e.lineno));` },
  { eval: `location.reload();return 1` },
  { wait: 1800 },
  { eval: `return {sh: document.documentElement.scrollHeight, bodyH: document.body.scrollHeight, err: __err, rails: document.querySelectorAll('.m-rail').length, ov: getComputedStyle(document.body).overflow}` },
];
