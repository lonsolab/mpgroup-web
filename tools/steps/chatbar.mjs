export default [
  { eval: `document.querySelector('.mobile-chat').click(); await new Promise(r=>setTimeout(r,1500)); const c=document.getElementById('chat').getBoundingClientRect(); const bar=document.querySelector('.mobile-bar'); return {htmlClass:document.documentElement.className, barDisplay:getComputedStyle(bar).display, chatTop:Math.round(c.top), chatBottom:Math.round(c.bottom), vh:innerHeight}` },
];
