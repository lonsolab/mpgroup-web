export default [
  { wait: 900 },
  { eval: `dispatchEvent(new Event('touchstart'));document.querySelector('.b-pay').scrollIntoView({block:'center'});return 1` },
  { wait: 2600 },
  { shot: 'p7-m-ticket.png' },
];
