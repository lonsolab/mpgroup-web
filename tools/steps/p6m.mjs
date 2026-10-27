export default [
  { init: `window.__err=[];addEventListener('error',e=>__err.push(e.message));try{sessionStorage.clear()}catch(e){}` },
  { eval: `location.reload();return 1` },
  { wait: 1000 },
  { eval: `dispatchEvent(new Event('touchstart'));return 1` },
  { wait: 6400 },
  { shot: 'p6-m1-tuerca.png' },
  { eval: `document.querySelector('.b-visit').scrollIntoView({block:'center'});return 1` },
  { wait: 2600 },
  { shot: 'p6-m2-bento.png' },
  { eval: `return {err:__err, arrived: document.querySelector('.b-visit').classList.contains('is-arrived'), launchIn: document.querySelector('.chat-launch').className}` },
];
