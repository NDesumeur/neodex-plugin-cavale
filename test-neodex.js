// lancé par le test « local » de NeoDex : la vérification interne (chart, jugement, personnages, chemins, courbe), le choix du personnage au clavier,
// une partie (des notes frappées et jugées), la manette (en l'air, au sol, tenir puis lâcher), les trois chemins selon les étoiles, la pause,
// l'écran de fin et sa courbe de précision, le plein écran et la place prise (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const key = k => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: '${k}', bubbles: true})), document.dispatchEvent(new KeyboardEvent('keyup', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('gc').getAttribute('aria-label') || ''`);
  const C = code => pj(`(() => { const T = document.getElementById('gc').__cv, rh = T.st(); ${code} })()`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('gc').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'cavale-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  const chk = await C('return T.check();'); if (chk !== 'ok') throw new Error('vérification : ' + chk);
  await pj(`document.querySelector('#rhSongs .rhSong .btn')?.click(), 0`); await sleep(1000);  // l'étiquette « prêt » du morceau d'avant doit d'abord disparaître
  for (let i = 0; i < 40 && !/: prêt,/.test(await label()); i++) await sleep(500);
  if (!/: prêt,/.test(await label())) throw new Error('le morceau devait se préparer : « ' + await label() + ' »');
  // le personnage : la flèche droite fait le tour (coureuse, chat, robot), et le choix est gardé dans les réglages
  await pj(`(document.getElementById('cvChar').value = '0', 0)`);
  const names = []; for (let i = 0; i < 3; i++) { await key('ArrowRight'); names.push(await C('return T.chr();')); if (i === 0) { await sleep(200); await shot('0-pret-chat'); } }
  if (names.join('|') !== 'Chat|Robot|Coureuse') throw new Error('choix du personnage : ' + names.join('|'));
  await key('ArrowRight');  // le chat pour la partie
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); addEventListener('unhandledrejection', e => __e.push(String(e.reason?.message || e.reason))); 0`);
  await key(' '); await sleep(6500);
  const judged = l => { const m = /: en jeu, score (\d+), combo \d+, parfait (\d+), bien (\d+), ok (\d+), raté (\d+)/.exec(l); return m ? +m[2] + +m[3] + +m[4] + +m[5] : 0; };
  for (let i = 0; i < 80 && judged(await label()) < 3; i++) {  // le morceau lent commence par une intro sans notes
    if (/: pause,/.test(await label())) await key(' ');  // si la fenêtre de test perd son plein écran, la partie se met en pause (voulu) : on la reprend
    await key(i % 2 ? 'f' : 'j'); await sleep(300);
  }
  await shot('1-partie-chat');
  const l = await label(); if (judged(l) < 3) throw new Error('la partie devait avancer et des notes être jugées : « ' + l + ' »');
  // la manette : Y frappe en l'air, A au sol ; tenu puis lâché
  await pj(`(() => { const pad = {axes: [0, 0, 0, 0], buttons: Array.from({length: 17}, () => ({pressed: false}))}; window.__pad = pad; navigator.getGamepads = () => [pad]; return 0; })()`);
  await pj(`(__pad.buttons[3].pressed = true, 0)`); await sleep(120);
  const ya = await C('return rh.held.air === 1 && rh.swing.kind === "air";');
  await pj(`(__pad.buttons[3].pressed = false, __pad.buttons[0].pressed = true, 0)`); await sleep(120);
  const ab = await C('return rh.held.air === 0 && rh.held.sol === 1 && rh.swing.kind === "sol";');
  await pj(`(__pad.buttons[0].pressed = false, 0)`); await sleep(120);
  const rel = await C('return rh.held.sol === 0;');
  if (!ya || !ab || !rel) throw new Error('manette : Y ' + ya + ', A ' + ab + ', lâché ' + rel);
  // les chemins : neige (4 à 7★) avec le robot, ville (7★ et plus) avec la coureuse
  const st0 = await C('return rh.stars;');
  await pj(`(document.getElementById('cvChar').value = '2', 0)`); await C('rh.stars = 5; return 0;'); await sleep(400);
  if (await C('return T.theme() % 3;') !== 1) throw new Error('5★ devait donner la neige'); await shot('2-neige-robot');
  await pj(`(document.getElementById('cvChar').value = '0', 0)`); await C('rh.stars = 8.5; return 0;'); await sleep(400);
  if (await C('return T.theme() % 3;') !== 2) throw new Error('8,5★ devait donner la ville'); await shot('3-ville-coureuse');
  // les nouveaux chemins, choisis dans l'option « Chemin »
  for (const [v, nm] of [[3, 'desert'], [4, 'chateau'], [5, 'bateau']]) { await pj(`(document.getElementById('cvPath').value = '${v}', 0)`); await sleep(400); if (await C('return T.theme();') !== v) throw new Error('chemin ' + nm); await shot('4-' + nm); }
  await pj(`(document.getElementById('cvPath').value = '', 0)`);
  await C(`rh.stars = ${st0}; return 0;`);
  await pj(`(__pad.buttons[9].pressed = true, 0)`); await sleep(120); await pj(`(__pad.buttons[9].pressed = false, 0)`); await sleep(100);
  if (!/: pause,/.test(await label()) && await C('return rh.mode;') !== 'pause') throw new Error('Start devait mettre en pause');
  await pj(`navigator.getGamepads = () => [], 0`);
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  // l'écran de fin : la courbe de précision (bonne au début, ratée au milieu, parfaite à la fin)
  await C(`rh.notes.forEach((n, i) => { const p = i / rh.notes.length; n.q = p < .35 ? .67 : p < .55 ? 0 : 1; }); Object.assign(rh, {mode: 'over', overAt: rh.tick - 30, grade: 'B', acc: .82, record: false, adj: 0}); return 0;`);
  await sleep(300); await shot('4-fin-courbe');
  const cu = await C('return T.curve(rh.notes).filter(v => v != null);');
  if (!(cu.length > 20 && cu[0] > .6 && cu.some(v => v === 0) && cu.at(-1) === 1)) throw new Error('courbe de précision : ' + JSON.stringify(cu));
  // 1.3.0 : le boss du morceau, vaincu à coups réussis ; la musique de victoire se joue sans erreur
  const bo = await C('const b = rh.bosses?.at(-1); if (!b) return "aucun boss"; b.done = ""; for (let i = 0; i < 80 && !b.done; i++) T.boss(b.t0 + .01); T.jingle(1); return b.done + "," + (rh.bossWins > 0);');
  if (bo !== 'win,true') throw new Error('boss : ' + bo);
  // plein écran, et la zone de jeu qui tient dans la fenêtre
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(400);  // la partie s'était mise en plein écran
  await pj(`document.getElementById('rhFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('gc'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l\'écran');
  const L = await pj(`(() => { const r = document.getElementById('gc').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('gc').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 240) throw new Error('la zone de jeu dépasse la fenêtre ou reste petite : ' + JSON.stringify(L));
  return 'boss vaincu · vérification ok · personnages ' + names.join(', ') + ' · ' + judged(l) + ' notes jugées · manette · neige et ville · désert, château, bateau · pause · courbe de fin · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
