export default [
  { eval: `document.querySelector('.mobile-chat').click(); await new Promise(r=>setTimeout(r,3800)); return 'chat'` },
  { chunks: 'ut-chat-a', max: 1 },
  { eval: `[...document.querySelectorAll('.qr')].find(q=>q.textContent.startsWith('Se me rompi')).click(); await new Promise(r=>setTimeout(r,1800)); [...document.querySelectorAll('.qr')].find(q=>q.textContent==='Calefones').click(); await new Promise(r=>setTimeout(r,2200)); return 'calefones'` },
  { chunks: 'ut-chat-b', max: 1 },
];
