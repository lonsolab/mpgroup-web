export default [
  { init: `try{sessionStorage.setItem('mp-bot','1')}catch(e){};window.__loaf=[];new PerformanceObserver(l=>{for(const e of l.getEntries())__loaf.push(e)}).observe({type:'long-animation-frame',buffered:true});` },
  { eval: `location.reload();return 1` },
  { wait: 1500 },
  { mouse: [[300, 300], [320, 320]] },
  { wait: 2500 },
  { eval: `__loaf.length=0;for(let i=0;i<70;i++){scrollBy(0,40);await new Promise(r=>requestAnimationFrame(r));}await new Promise(r=>setTimeout(r,300));
const tot={frames:__loaf.length,dur:0,render:0,style:0,scripts:{}};
for(const e of __loaf){tot.dur+=e.duration;const rs=e.renderStart||e.startTime+e.duration;tot.render+=e.startTime+e.duration-rs;if(e.styleAndLayoutStart)tot.style+=e.startTime+e.duration-e.styleAndLayoutStart;for(const s of e.scripts){const k=(s.sourceURL||'').split('/').pop().split('?')[0]+' '+s.invoker;tot.scripts[k]=(tot.scripts[k]||0)+s.duration;}}
tot.dur=Math.round(tot.dur);tot.render=Math.round(tot.render);tot.style=Math.round(tot.style);for(const k in tot.scripts)tot.scripts[k]=Math.round(tot.scripts[k]);return tot` },
];
