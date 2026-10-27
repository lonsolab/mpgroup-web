export default [
  { eval: `document.querySelector('.mobile-chat').click(); await new Promise(r=>setTimeout(r,3500)); return 'chat'` },
  { chunks: 'rt-chat', max: 1 },
];
