// lancé par le test « local » de NeoDex : choisit un morceau intégré, lance la partie, frappe quelques coups en l'air et au sol,
// vérifie que la chanson avance et que les notes sont jugées, puis pause (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const key = k => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: '${k}', bubbles: true})), document.dispatchEvent(new KeyboardEvent('keyup', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('gc').getAttribute('aria-label') || ''`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('gc').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'cavale-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await pj(`document.querySelector('#rhSongs .rhSong .btn')?.click(), 0`); await sleep(1000);  // l'étiquette « prêt » du morceau d'avant doit d'abord disparaître
  for (let i = 0; i < 40 && !/: prêt,/.test(await label()); i++) await sleep(500);
  if (!/: prêt,/.test(await label())) throw new Error('le morceau devait se préparer : « ' + await label() + ' »');
  await shot('0-pret');
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); addEventListener('unhandledrejection', e => __e.push(String(e.reason?.message || e.reason))); 0`);
  await key(' '); await sleep(6500);
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  const judged = l => { const m = /: en jeu, score (\d+), combo \d+, parfait (\d+), bien (\d+), ok (\d+), raté (\d+)/.exec(l); return m ? +m[2] + +m[3] + +m[4] + +m[5] : 0; };
  for (let i = 0; i < 80 && judged(await label()) < 3; i++) { await key(i % 2 ? 'f' : 'j'); await sleep(300); }  // le morceau lent commence par une intro sans notes
  await shot('1-partie');
  const l = await label(), m = /: en jeu, score (\d+), combo \d+, parfait (\d+), bien (\d+), ok (\d+), raté (\d+)/.exec(l);
  if (!m || +m[2] + +m[3] + +m[4] + +m[5] < 3) throw new Error('la partie devait avancer et des notes être jugées : « ' + l + ' »');
  await key('p'); await sleep(400);
  if (!/: pause,/.test(await label())) throw new Error('P devait mettre en pause : « ' + await label() + ' »');
  return l;
};
