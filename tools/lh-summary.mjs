// Resume un JSON de Lighthouse: puntajes, métricas y auditorías que fallan
import fs from 'fs';
for (const f of process.argv.slice(2)) {
  const r = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log('\n==', f, r.configSettings.formFactor);
  console.log('Puntajes:', Object.values(r.categories).map(c => `${c.title} ${Math.round(c.score * 100)}`).join(' | '));
  const a = r.audits;
  console.log('Métricas:', ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map(k => `${k.replace(/-/g, ' ')} ${a[k].displayValue}`).join(' | '));
  const lcpEl = a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet;
  if (lcpEl) console.log('Elemento LCP:', lcpEl.slice(0, 160));
  for (const [cat, c] of Object.entries(r.categories)) {
    const fails = c.auditRefs.map(x => a[x.id]).filter(x => x && x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'informative' && x.scoreDisplayMode !== 'notApplicable');
    if (!fails.length) continue;
    console.log(`-- ${c.title}:`);
    for (const x of fails) {
      const items = (Array.isArray(x.details?.items) ? x.details.items : []).slice(0, 4).map(i => (i.node?.snippet || i.url || i.source?.url || i.label || '').toString().slice(0, 110)).filter(Boolean);
      console.log(`   [${x.score}] ${x.id}: ${x.displayValue || ''} ${items.length ? '\n      ' + items.join('\n      ') : ''}`);
    }
  }
}
