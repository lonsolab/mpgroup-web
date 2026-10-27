export default [
  { eval: `for (let y=0; y<document.body.scrollHeight; y+=600){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,120)); } window.scrollTo(0,0); await new Promise(r=>setTimeout(r,1500)); return document.body.scrollHeight` },
  { shot: process.env.SHOT, full: true },
];
