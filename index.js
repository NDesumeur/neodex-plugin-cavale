// Cavale : Un jeu de rythme en course : ta coureuse file sur le chemin du soir, les chauves-souris arrivent en l'air et les gelées au sol, frappe la bonne voie au bon moment. Les 1200 morceaux de Rythme, ou ta propre musique.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Cavale</span><span class="hint">J ou K : en l'air · F ou D : au sol · espace : jouer · P : pause</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="gc" width="320" height="240"></canvas><button class="btn rhFs" id="rhFs">PLEIN ÉCRAN</button></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="gStats"></div></div>
      <div class="row"><button class="btn main" id="gNew">NOUVELLE PARTIE</button></div>
      <div class="row"><button class="btn" id="rhTabSongs">CHANSONS</button><button class="btn" id="rhTabMine">MES MUSIQUES</button></div>
      <div class="sysCard rhImport" id="rhImport" style="display:none"><div class="row"><button class="btn main" id="rhFileBtn">IMPORTER UN FICHIER AUDIO</button><input type="file" id="rhFile" accept="audio/*,.mp3,.m4a,.ogg,.opus,.wav,.flac,.webm" hidden></div><div class="row"><select class="f" id="rhMuList"></select><button class="btn" id="rhMuBtn">CRÉER LE NIVEAU</button></div><div class="row"><label>Difficulté <select class="f" id="rhStars"><option value="1">1 ★</option><option value="2">2 ★</option><option value="3" selected>3 ★</option><option value="4">4 ★</option><option value="5">5 ★</option><option value="6">6 ★</option><option value="7">7 ★</option><option value="8">8 ★</option><option value="9">9 ★</option><option value="10">10 ★</option></select></label></div><span class="hint" id="rhImpMsg">Un fichier ou une musique de NeoMusic : le jeu trouve son tempo et ses temps forts et en fait un niveau.</span></div>
      <div id="rhSongs"></div>
      <div class="sysCard rhOpts"><label>Volume <input type="range" id="rhVol" min="0" max="100" value="70"></label><label>Son des clics <select class="f gSel" id="rhClick"><option value="0" selected>Doux</option><option value="1">Clap</option><option value="2">Bois</option><option value="3">Grosse caisse</option><option value="4">Cristal</option><option value="5">Pop</option><option value="6">Charleston</option><option value="7">Caisse claire</option><option value="8">Pluck</option><option value="9">Tok</option><option value="-1">Aucun</option></select></label><label>Décalage <input type="number" class="f" id="rhOffset" min="-300" max="300" step="5" value="0" style="width:80px" title="Réglé tout seul après chaque partie"> ms</label></div>
      <div class="hint">Les chauves-souris arrivent en l'air (J, K ou ↑), les gelées au sol (F, D ou ↓) : frappe quand elles touchent le cercle de leur voie. Deux monstres ensemble : les deux touches à la fois.</div><div class="hint">Sur un ruban doré, garde la touche enfoncée jusqu'au bout : chaque dixième de seconde tenu rapporte. À la souris ou au doigt : moitié haute de l'écran pour l'air, moitié basse pour le sol.</div><div class="hint">La difficulté de chaque niveau est calculée sur ses notes (densité, passages chargés) : de 1★ à 10★.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:2;min-width:320px;position:relative}
.gameBox canvas{width:100%;image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}
.gameBox canvas{max-width:720px;aspect-ratio:320/240}
.rhFs{position:absolute;top:14px;right:14px;opacity:.85}
.gameBox:fullscreen{padding:0;background:#05010b}
.gameBox:fullscreen .rhFs{display:none}
.gameBox:fullscreen canvas{width:auto;height:100vh;max-width:none}
#rhSongs{display:flex;flex-direction:column;gap:10px;max-height:520px;overflow-y:auto;padding:2px 6px 2px 2px}
.rhPager{grid-column:1/-1;display:flex;flex-wrap:nowrap;align-items:center;gap:8px}.rhPager .hint{flex:1;min-width:0;width:auto;margin:0;text-align:center}.rhPager .btn{flex:none;width:auto;margin:0}
.rhSong{position:relative;gap:6px}
.rhSong.on{outline:3px solid var(--acc,#ff4fa8)}
.rhSong .btn{height:30px;font-size:13px;padding:0 8px}
.rhSong .row{flex-wrap:wrap;gap:6px}
.rhDel{all:unset;position:absolute;top:8px;right:10px;cursor:var(--cp,pointer);opacity:.7;font-size:16px}
.rhImport #rhMuList{flex:1;min-width:0}
.rhOpts{flex-direction:row!important;flex-wrap:wrap;gap:16px;align-items:center}
.rhOpts label{display:flex;align-items:center;gap:8px}
.gSide{max-width:460px}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}

export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  // « neo.musicXxx » va au côté système de NeoMusic (son main.js), comme dans Rythme
  const MU_ID = 'neodex.music', MU_EV = { onMusicHotkey: 'music:hotkey', onMusicProgress: 'music:progress' };
  const neo = new Proxy({}, { get: (_, k) => { const n = ctx.neo;
    if (typeof k !== 'string') return n[k];
    if (MU_EV[k]) return cb => n.onPluginMain(e => { if (e.id === MU_ID && e.name === MU_EV[k]) cb(e.data); });
    const m = /^music([A-Z]\w*)$/.exec(k);
    return m ? (...a) => n.pluginMain(MU_ID, 'music:' + m[1][0].toLowerCase() + m[1].slice(1), ...a) : n[k];
  } });
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "CAVALE", T: {"k": "#0a0814", "k2": "#141024", "fill": "#1e1834", "fillOn": "#2a2246", "hl": "#362c58", "line": "#544680", "acc": "#ffa030", "accL": "#ffe0a0", "accS": "#c86a10", "accD": "#4a2406", "rivet": "#ffe0a0", "btn": "#362c58", "btnHi": "#6a5aa0", "btnLo": "#141024", "btnHov": "#463a70", "btnHovHi": "#8a7ac0", "text": "#f4f0ff", "muted": "#b8b0d8", "acc2": "#7ee07a", "gold": "#ffd84a", "orange": "#ffa030", "red": "#ff4a5a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#0c0a18", "bgDot": "#1e1834", "bgDot2": "#141024", "spark": "#544680", "spark2": "#7ee07a", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["............", ".kk...kk....", ".kak..kak...", "..kak..kak..", "...kak..kak.", "....kak..kak", "....kak..kak", "...kak..kak.", "..kak..kak..", ".kak..kak...", ".kk...kk....", "............"],
  icons: [[/^PLEIN/, "full"], [/^IMPORTER/, "folder"], [/^CRÉER/, "plus"], [/^CHANSONS/, "note"], [/^MES MUSIQUES/, "folder"], [/^NOUVELLE/, "play"], [/^RECORDS/, "crown"]] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (b == null || v > b) { games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };

const clock = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
// petits outils communs aux jeux : une toile pré-dessinée, la position du pointeur dans le canevas, un bip
const cnv = (w, h, fn) => { const c = el('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g); return c; };
const spr = (rows, pal) => cnv(Math.max(...rows.map(r => r.length)), rows.length, g => sprite(g, rows, 0, 0, pal));
const W = 320, H = 240, cv = $('gc'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
const cpos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
let actx = null;
const beep = (f, d = .1, type = 'square', slide = 0, vol = .08) => { try { actx ??= new AudioContext(); const o = actx.createOscillator(), gn = actx.createGain(), t = actx.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(gn).connect(actx.destination); o.start(t); o.stop(t + d + .02); } catch {} };
const keyOk = e => view.classList.contains('on') && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName);
const showStats = rows => $('gStats').replaceChildren(...rows.flatMap(([a, b]) => [el('span', '', a), el('b', '', String(b))]));
const muId = t => t ? (t.url ? 'url:' + t.url : 'file:' + (t.file || '')) : '';  // la bibliothèque de NeoMusic, lue telle quelle
let mu = null;
const muLoad = () => neo.musicLoad().then(d => { mu = d; });

/* ---------- Rythme: chiptune songs composed by the game (same notes every time), notes to hit on 4 lanes at the beat ---------- */
const RH = {W: 240, H: 320, HIT: 284, LANES: 4, LW: 40, X0: 40, KEYS: [['d', 'ArrowLeft'], ['f', 'ArrowDown'], ['j', 'ArrowUp'], ['k', 'ArrowRight']], COLORS: ['#ff5ad9', '#7fe0ee', '#ffd07a', '#8ee8a0'],
  WIN: [[.045, 'PARFAIT', 300, '#ffd07a'], [.09, 'BIEN', 200, '#8ee8a0'], [.14, 'OK', 100, '#7fe0ee']]};
const RH_SCALES = {major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], harmonic: [0, 2, 3, 5, 7, 8, 11]};
// the 6 first songs, then 34 more, then 60 more made from seeded choices (100 in all, none alike): names, tempo going up, scale, chords, groove (drums) and lead sound
const RH_SONGS = [
  {name: 'Lever de néon', bpm: 96, seed: 11, mode: 'major', prog: [0, 5, 3, 4], root: 48},
  {name: 'Course de pixels', bpm: 124, seed: 23, mode: 'minor', prog: [0, 5, 2, 6], root: 45},
  {name: 'Orbite basse', bpm: 110, seed: 37, mode: 'dorian', prog: [0, 3, 0, 4], root: 50},
  {name: 'Cœur 8 bits', bpm: 118, seed: 41, mode: 'major', prog: [0, 4, 5, 3], root: 47},
  {name: 'Tempête cosmique', bpm: 148, seed: 53, mode: 'minor', prog: [0, 6, 5, 4], root: 44},
  {name: 'Hyperpropulsion', bpm: 168, seed: 67, mode: 'minor', prog: [0, 2, 3, 4], root: 46},
  ...(() => {
    const A = ['Comète', 'Nébuleuse', 'Quasar', 'Aurore', 'Prisme', 'Satellite', 'Météore', 'Zénith', 'Galaxie', 'Cristal', 'Écho', 'Pulsar', 'Éclipse', 'Horizon', 'Supernova', 'Astéroïde', 'Lune', 'Signal'];
    const B = ['sauvage', 'nocturne', 'électrique', 'infinie', 'glacée', 'brûlante', 'secrète', 'rebelle', 'magnétique', 'sonique', 'céleste', 'perdue', 'dorée', 'fantôme', 'turbo', 'binaire', 'lointaine', 'chromée'];
    const progs = [[0, 5, 3, 4], [0, 3, 4, 4], [5, 3, 0, 4], [0, 4, 5, 3], [0, 6, 5, 6], [0, 2, 5, 4], [3, 4, 0, 0], [0, 5, 1, 4], [0, 1, 0, 6]];
    const modes = Object.keys(RH_SCALES), grooves = ['classic', 'four', 'break', 'half'], waves = ['square', 'sawtooth', 'triangle', 'square'];
    const r = seeded(2026), used = new Set(['Lever de néon']), out = [];
    for (let i = 0; i < 34; i++) {
      let name; do name = A[Math.floor(r() * A.length)] + ' ' + B[Math.floor(r() * B.length)]; while (used.has(name)); used.add(name);
      out.push({name, bpm: Math.round(90 + i * 3.1 + r() * 10), seed: 100 + i * 13, mode: modes[Math.floor(r() * modes.length)], prog: progs[Math.floor(r() * progs.length)],
        root: 43 + Math.floor(r() * 9), groove: grooves[Math.floor(r() * grooves.length)], wave: waves[Math.floor(r() * waves.length)]});
    }
    // 60 de plus : d'autres mots, des structures, des arpèges et des densités de mélodie différents (les 40 premières restent telles quelles)
    const A2 = ['Mirage', 'Vortex', 'Cyclone', 'Lagune', 'Volcan', 'Tonnerre', 'Mercure', 'Orion', 'Saturne', 'Titan', 'Andromède', 'Lyre', 'Phénix', 'Dragon', 'Corail', 'Cobalt', 'Ambre', 'Jade', 'Opale', 'Rubis', 'Zéphyr', 'Néon', 'Radar', 'Turbine', 'Laser'];
    const B2 = ['arctique', 'solaire', 'vertigineuse', 'cosmique', 'aveugle', 'sauvage', 'brisée', 'liquide', 'cybernétique', 'sacrée', 'éclatante', 'muette', 'enchantée', 'orbitale', 'abyssale', 'radieuse', 'furtive', 'cristalline', 'astrale', 'volante', 'pixelisée', 'ardente', 'polaire', 'stellaire', 'mécanique'];
    const arps = [[0, 2, 4, 7], [0, 4, 7, 4], [0, 7, 4, 2], [0, 2, 7, 4], [4, 2, 0, 2], [0, 4, 2, 7]], r2 = seeded(7331);
    for (let i = 0; i < 60; i++) {
      let name; do name = A2[Math.floor(r2() * A2.length)] + ' ' + B2[Math.floor(r2() * B2.length)]; while (used.has(name)); used.add(name);
      out.push({name, bpm: Math.round(86 + i * 1.65 + r2() * 6), seed: 1000 + i * 29, mode: modes[Math.floor(r2() * modes.length)], prog: progs[Math.floor(r2() * progs.length)],
        root: 41 + Math.floor(r2() * 12), groove: grooves[Math.floor(r2() * grooves.length)], wave: waves[Math.floor(r2() * waves.length)],
        form: i % 4, arp: arps[Math.floor(r2() * arps.length)], dens: Math.round((.8 + r2() * .45) * 100) / 100});
    }
    return out;
  })(),
  // 100 de plus, par styles : plus longs (2 min 30 à 5 min), avec un 2e motif, des reprises et un changement de ton vers la fin
  ...(() => {
    const RH_STYLES = [
      {n: 'Ballade', bpm: [64, 84], groove: 'ballad', wave: ['triangle', 'sine'], modes: ['minor', 'major', 'dorian'], dens: [.6, .8], sec: [240, 300]},
      {n: 'Marche', bpm: [100, 114], groove: 'march', wave: ['square'], modes: ['major', 'mixolydian', 'minor'], dens: [.9, 1.1], sec: [170, 220]},
      {n: 'Funk', bpm: [98, 116], groove: 'funk', wave: ['square', 'sawtooth'], modes: ['mixolydian', 'dorian'], dens: [1.1, 1.35], sec: [180, 230]},
      {n: 'Techno', bpm: [124, 136], groove: 'four', wave: ['sawtooth'], modes: ['minor', 'phrygian', 'harmonic'], dens: [.9, 1.2], sec: [200, 260]},
      {n: 'Jungle', bpm: [162, 176], groove: 'dnb', wave: ['sawtooth', 'square'], modes: ['minor', 'harmonic', 'phrygian'], dens: [1, 1.2], sec: [170, 210]},
      {n: 'Épopée', bpm: [112, 138], groove: 'half', wave: ['sawtooth', 'square'], modes: ['major', 'lydian', 'minor'], dens: [.85, 1.1], sec: [240, 320]},
      {n: 'Chill', bpm: [76, 92], groove: 'half', wave: ['triangle', 'sine'], modes: ['dorian', 'major', 'lydian'], dens: [.65, .85], sec: [210, 270]},
      {n: 'Arcade', bpm: [140, 158], groove: 'classic', wave: ['square'], modes: ['major', 'mixolydian'], dens: [1.15, 1.4], sec: [150, 200]},
      {n: 'Boss', bpm: [148, 168], groove: 'break', wave: ['sawtooth'], modes: ['phrygian', 'harmonic', 'minor'], dens: [1, 1.3], sec: [180, 240]},
      {n: 'Rêverie', bpm: [68, 88], groove: 'ballad', wave: ['sine', 'triangle'], modes: ['lydian', 'major', 'dorian'], dens: [.6, .8], sec: [240, 320]},
    ];
    const SUB = ['Chant', 'Danse', 'Souvenir', 'Voyage', 'Message', 'Secret', 'Voile', 'Sentier', 'Rivage', 'Palais', 'Jardin', 'Phare', 'Pont', 'Récit', 'Reflet', 'Serment', 'Sommet', 'Horizon', 'Refuge', 'Passage', 'Éveil', 'Souffle', 'Cortège', 'Veillée', 'Légende'];
    const SUF = ['de minuit', 'des cendres', 'du cristal', 'des étoiles', 'de la brume', 'du dernier soir', 'des vents', 'de l\'aube', 'du verre', 'des marées', 'de l\'orage', 'du désert', 'des lanternes', 'du grand nord', 'des ruines', 'de la forêt', 'des comètes', 'du silence', 'de l\'hiver', 'du volcan', 'des sables', 'de la lune', 'des géants', 'de l\'exil', 'du matin'];
    const progs = [[0, 5, 3, 4, 0, 5, 1, 4], [0, 3, 4, 0, 5, 3, 1, 4], [5, 3, 0, 4, 5, 3, 1, 4], [0, 6, 5, 4, 0, 6, 3, 4], [0, 2, 5, 3, 0, 2, 6, 4], [0, 5, 3, 4], [0, 4, 5, 3], [5, 3, 0, 4]];
    const arps = [[0, 2, 4, 7], [0, 4, 7, 4], [0, 7, 4, 2], [0, 2, 7, 4], [4, 2, 0, 2], [0, 4, 2, 7]], r3 = seeded(90210), used = new Set(), out = [];
    const pick = a => a[Math.floor(r3() * a.length)], between = ([a, b]) => a + r3() * (b - a);
    const longForm = bars => { const f = [['intro', 4]], cyc = [['A', 8], ['B', 8], ['A', 8], ['B', 8], ['pont', 8], ['A', 8], ['B', 8], ['B', 8]]; let n = 8, i = 0; while (n + cyc[i % 8][1] <= bars) { f.push(cyc[i % 8]); n += cyc[i % 8][1]; i++; } f.push(['outro', 4]); return {form: f, bars: n}; };
    for (let i = 0; i < 100; i++) {
      const S = RH_STYLES[i % 10], bpm = Math.round(between(S.bpm)), barSec = 240 / bpm, want = Math.round(between(S.sec) / barSec / 4) * 4, {form, bars} = longForm(want);
      let name; do name = pick(SUB) + ' ' + pick(SUF); while (used.has(name)); used.add(name);
      out.push({name, style: S.n, bpm, seed: 5000 + i * 31, mode: pick(S.modes), prog: pick(progs), root: 41 + Math.floor(r3() * 12), groove: S.groove, wave: pick(S.wave),
        form, long: true, arp: pick(arps), dens: Math.round(between(S.dens) * 100) / 100, mod: i % 3 === 1 ? Math.round(bars * .66 / 4) * 4 : 0, len: bars * 16 * 60 / bpm / 4});
    }
    return out;
  })(),
  // 1000 de plus (n° 201 à 1200) : 20 nouveaux styles, d'autres structures et d'autres arpèges ; ajoutées à la fin pour garder les scores déjà faits
  ...(() => {
    const ST = [
      {n: 'Synthwave', bpm: [100, 118], groove: 'four', wave: ['sawtooth'], modes: ['minor', 'dorian'], dens: [.8, 1], sec: [190, 260]},
      {n: 'Lo-fi', bpm: [70, 88], groove: 'half', wave: ['triangle', 'sine'], modes: ['dorian', 'minor', 'major'], dens: [.6, .8], sec: [160, 240]},
      {n: 'Disco', bpm: [112, 124], groove: 'four', wave: ['square', 'sawtooth'], modes: ['major', 'mixolydian'], dens: [1, 1.25], sec: [180, 240]},
      {n: 'Speedrun', bpm: [160, 180], groove: 'classic', wave: ['square'], modes: ['major', 'lydian', 'minor'], dens: [1.1, 1.35], sec: [150, 190]},
      {n: 'Mystère', bpm: [60, 78], groove: 'ballad', wave: ['sine', 'triangle'], modes: ['phrygian', 'harmonic'], dens: [.7, .85], sec: [200, 300]},
      {n: 'Galop', bpm: [124, 142], groove: 'march', wave: ['square'], modes: ['major', 'mixolydian'], dens: [1, 1.2], sec: [150, 200]},
      {n: 'Électro', bpm: [126, 140], groove: 'break', wave: ['sawtooth'], modes: ['minor', 'phrygian'], dens: [.95, 1.2], sec: [190, 250]},
      {n: 'Berceuse', bpm: [62, 76], groove: 'ballad', wave: ['sine'], modes: ['major', 'lydian'], dens: [.72, .88], sec: [180, 260]},
      {n: 'Hardcore', bpm: [174, 184], groove: 'dnb', wave: ['sawtooth', 'square'], modes: ['harmonic', 'minor'], dens: [1.05, 1.3], sec: [150, 200]},
      {n: 'Fanfare', bpm: [104, 122], groove: 'march', wave: ['square', 'sawtooth'], modes: ['major', 'lydian'], dens: [.9, 1.15], sec: [160, 220]},
      {n: 'Donjon', bpm: [88, 108], groove: 'half', wave: ['square'], modes: ['harmonic', 'phrygian', 'minor'], dens: [.8, 1], sec: [200, 280]},
      {n: 'Plage', bpm: [92, 108], groove: 'funk', wave: ['triangle', 'square'], modes: ['major', 'mixolydian'], dens: [.9, 1.15], sec: [170, 230]},
      {n: 'Poursuite', bpm: [150, 170], groove: 'break', wave: ['square', 'sawtooth'], modes: ['minor', 'harmonic', 'major'], dens: [1.05, 1.3], sec: [160, 210]},
      {n: 'Flocons', bpm: [72, 92], groove: 'ballad', wave: ['triangle', 'sine'], modes: ['lydian', 'dorian'], dens: [.65, .85], sec: [200, 280]},
      {n: 'Rétro', bpm: [120, 140], groove: 'classic', wave: ['square', 'triangle'], modes: ['major', 'dorian', 'mixolydian'], dens: [1, 1.25], sec: [150, 210]},
      {n: 'Nuit blanche', bpm: [118, 128], groove: 'four', wave: ['sawtooth', 'square'], modes: ['minor', 'dorian', 'phrygian'], dens: [.9, 1.15], sec: [210, 300]},
      {n: 'Héroïque', bpm: [128, 150], groove: 'half', wave: ['sawtooth', 'square'], modes: ['major', 'mixolydian', 'lydian'], dens: [.9, 1.15], sec: [220, 320]},
      {n: 'Ouragan', bpm: [164, 178], groove: 'dnb', wave: ['sawtooth'], modes: ['harmonic', 'phrygian'], dens: [1, 1.25], sec: [170, 220]},
      {n: 'Foire', bpm: [108, 122], groove: 'funk', wave: ['square'], modes: ['mixolydian', 'major', 'dorian'], dens: [1.05, 1.3], sec: [160, 220]},
      {n: 'Odyssée', bpm: [96, 120], groove: 'classic', wave: ['triangle', 'sawtooth'], modes: ['lydian', 'major', 'minor'], dens: [.8, 1.05], sec: [240, 320]},
    ];
    const N = ['Ballet', 'Carnaval', 'Ronde', 'Fête', 'Marché', 'Train', 'Bal', 'Prière', 'Galopade', 'Envol', 'Retour', 'Départ', 'Festin', 'Duel', 'Complainte', 'Ode', 'Hymne',
      'Lettre', 'Carte', 'Clé', 'Porte', 'Cloche', 'Boussole', 'Carrousel', 'Fontaine', 'Labyrinthe', 'Bastion', 'Citadelle', 'Grenier', 'Verger', 'Moulin', 'Quai', 'Gare',
      'Navire', 'Caravane', 'Flûte', 'Harpe', 'Mosaïque', 'Parade', 'Tournoi', 'Rodéo', 'Sortilège', 'Grimoire', 'Talisman', 'Vigie', 'Halte', 'Escale', 'Royaume'];
    const C = ['des lucioles', 'du port', 'des pirates', 'du château', 'des robots', 'des neiges', 'du soleil', 'des abysses', 'de la jungle', 'des nuages', 'du métro',
      'des automates', 'de l\'arène', 'du marais', 'des sorciers', 'des forges', 'de la cité', 'des tempêtes', 'du printemps', 'de l\'automne', 'de l\'été', 'des moissons',
      'du bazar', 'des sirènes', 'de la grotte', 'des coquillages', 'du glacier', 'des mines', 'des dunes', 'des chevaliers', 'des fantômes', 'des engrenages',
      'des cerfs-volants', 'de la rivière', 'des pixels', 'du néant', 'des miroirs', 'du cirque', 'des bulles', 'du dragon', 'des planètes', 'des chats', 'du vieux phare'];
    const progs = [[0, 5, 3, 4, 0, 5, 1, 4], [0, 3, 4, 0, 5, 3, 1, 4], [5, 3, 0, 4, 5, 3, 1, 4], [0, 6, 5, 4, 0, 6, 3, 4], [0, 2, 5, 3, 0, 2, 6, 4], [0, 5, 3, 4], [0, 4, 5, 3],
      [5, 3, 0, 4], [0, 3, 0, 4], [0, 5, 2, 6], [0, 4, 1, 5, 2, 6, 3, 4], [0, 0, 3, 4], [5, 4, 3, 4], [0, 6, 3, 5, 0, 6, 4, 4], [3, 4, 5, 5], [0, 1, 3, 4]];
    const arps = [[0, 2, 4, 7], [0, 4, 7, 4], [0, 7, 4, 2], [0, 2, 7, 4], [4, 2, 0, 2], [0, 4, 2, 7], [0, 3, 5, 7], [7, 4, 2, 0], [0, 5, 4, 2], [2, 4, 7, 4]];
    const cycles = [  // plusieurs façons d'enchaîner les parties
      [['A', 8], ['B', 8], ['A', 8], ['B', 8], ['pont', 8], ['A', 8], ['B', 8], ['B', 8]],
      [['A', 8], ['A', 8], ['B', 8], ['pont', 4], ['B', 8], ['A', 8], ['B', 8], ['pont', 4]],
      [['A', 4], ['B', 8], ['A', 4], ['B', 8], ['pont', 8], ['B', 8]],
      [['B', 8], ['A', 8], ['pont', 4], ['A', 8], ['B', 8], ['B', 8]],
    ];
    const r4 = seeded(31415), used = new Set(), out = [], pick = a => a[Math.floor(r4() * a.length)], between = ([a, b]) => a + r4() * (b - a);
    const form = (bars, cyc) => { const f = [['intro', pick([2, 4])]]; let n = f[0][1] + 4, i = 0; while (n + cyc[i % cyc.length][1] <= bars) { f.push(cyc[i % cyc.length]); n += cyc[i % cyc.length][1]; i++; } f.push(['outro', 4]); return {form: f, bars: n}; };
    for (let i = 0; i < 999; i++) {
      const S = ST[i % 20], bpm = Math.round(between(S.bpm)), want = Math.round(between(S.sec) * bpm / 240 / 4) * 4, {form: f, bars} = form(want, pick(cycles));
      let name; do name = pick(N) + ' ' + pick(C); while (used.has(name)); used.add(name);
      out.push({name, style: S.n, bpm, seed: 20000 + i * 37, mode: pick(S.modes), prog: pick(progs), root: 40 + Math.floor(r4() * 14), groove: S.groove, wave: pick(S.wave),
        form: f, long: true, arp: pick(arps), dens: Math.round(between(S.dens) * 100) / 100, mod: i % 4 === 2 ? Math.round(bars * .6 / 4) * 4 : 0, len: bars * 16 * 60 / bpm / 4});
    }
    // la n° 1200, « Lilas » : lente, en mineur, des accords qui descendent, toujours en dernier dans la liste
    out.push({name: 'Lilas', style: 'Mélancolie', bpm: 66, seed: 99991, mode: 'minor', prog: [0, 5, 2, 6, 0, 5, 3, 4], root: 45, groove: 'ballad', wave: 'triangle',
      form: [['intro', 4], ['A', 8], ['B', 8], ['A', 8], ['pont', 8], ['B', 8], ['A', 8], ['outro', 4]], long: true, arp: [4, 2, 0, 2], dens: .64, mod: 0, len: 56 * 16 * 60 / 66 / 4, last: true});
    return out;
  })(),
];
console.assert(RH_SONGS.length === 1200 && new Set(RH_SONGS.map(s => s.name)).size === 1200 && new Set(RH_SONGS.map(s => s.seed)).size === 1200 && RH_SONGS.slice(100, 200).every(s => s.len > 140 && s.len < 340), 'rythme : 1200 chansons différentes, les 100 dernières de 2 min 30 à 5 min');
console.assert(RH_SONGS.slice(200).every(s => s.len > 115 && s.len < 340), 'rythme : les 1000 dernières de 2 à 5 min 30');
// la structure d'une chanson : [partie, nombre de mesures] (0 = celle des 40 premières)
const RH_FORMS = [
  [['intro', 4], ['A', 8], ['B', 8], ['A', 8], ['pont', 4], ['B', 8], ['A', 8], ['outro', 4]],
  [['intro', 4], ['A', 8], ['A', 8], ['B', 8], ['pont', 4], ['B', 8], ['B', 8], ['outro', 4]],
  [['intro', 2], ['A', 8], ['B', 8], ['pont', 4], ['A', 8], ['B', 8], ['outro', 2]],
  [['intro', 4], ['A', 8], ['B', 8], ['A', 8], ['pont', 8], ['B', 8], ['A', 8], ['B', 8], ['outro', 4]],
];
const RH_DIFFS = {facile: 'Facile', normal: 'Normal', difficile: 'Difficile', expert: 'Expert'};
const midiHz = m => 440 * 2 ** ((m - 69) / 12);
function rhCompose(song) {  // -> {events: sounds to play, lead: melody notes, len: seconds}
  const r = seeded(song.seed), sc = RH_SCALES[song.mode], step = 60 / song.bpm / 4, events = [], lead = [], groove = song.groove || 'classic';
  const deg = d => song.root + (song.mod && bar >= song.mod ? 2 : 0) + 12 * Math.floor(d / 7) + sc[((d % 7) + 7) % 7];  // song.mod : la mesure où le morceau monte d'un ton
  const SECTIONS = Array.isArray(song.form) ? song.form : RH_FORMS[song.form || 0];
  const motif = kind => {  // a 2-bar melody: onsets on the 16th grid, scale degrees
    const out = []; let d = 9 + Math.floor(r() * 3);
    for (let s = 0; s < 32; s++) {
      const strong = (s % 8 === 0 ? .95 : s % 4 === 0 ? .7 : s % 2 === 0 ? (kind === 'B' ? .55 : .4) : (kind === 'B' ? .22 : .1)) * (song.dens || 1);
      if (r() < strong) { d += [-2, -1, -1, 0, 1, 1, 2, 3, -3][Math.floor(r() * 9)]; d = Math.max(5, Math.min(16, d)); out.push({s, d}); }
    }
    out.forEach((n, i) => n.len = Math.min(8, (out[i + 1]?.s ?? 32) - n.s));
    return out;
  };
  const kickAt = (kind, s) => kind === 'pont' ? s === 0 : groove === 'ballad' ? s === 0 || (kind === 'B' && s === 10) : groove === 'march' ? s === 0 || s === 8 : groove === 'funk' ? [0, 3, 10].includes(s) || (kind === 'B' && [6, 13].includes(s)) : groove === 'dnb' ? s === 0 || s === 10 || (kind === 'B' && s === 7) : groove === 'four' ? s % 4 === 0 : groove === 'break' ? [0, 6, 10].includes(s) || (kind === 'B' && s === 14) : groove === 'half' ? s === 0 || (kind === 'B' && s === 11) : s % 8 === 0 || (kind === 'B' && s === 10);
  const snareAt = s => groove === 'half' || groove === 'ballad' ? s === 8 : groove === 'march' ? s === 4 || s === 12 || s === 14 : groove === 'funk' ? s === 4 || s === 12 || s === 15 : s === 4 || s === 12;
  const motifs = {A: motif('A'), B: motif('B')}; if (song.long) { motifs.A2 = motif('A'); motifs.B2 = motif('B'); }  // les morceaux longs alternent deux motifs
  const hatStep = groove === 'ballad' ? 4 : groove === 'dnb' ? 1 : 0, bassStep = groove === 'ballad' ? 4 : 2, seen = {};
  let bar = 0;
  for (const [kind, bars] of SECTIONS) {
    const si = seen[kind] = (seen[kind] ?? -1) + 1;
    for (let b = 0; b < bars; b++, bar++) {
      const t0 = bar * 16 * step, chord = song.prog[bar % song.prog.length], energy = kind === 'B' ? 1 : kind === 'A' ? .8 : .5;
      for (let s = 0; s < 16; s++) {
        const t = t0 + s * step;
        if (kickAt(kind, s)) events.push({t, k: 'kick', v: 1});
        if (kind !== 'intro' && kind !== 'outro' && kind !== 'pont' && snareAt(s)) events.push({t, k: 'snare', v: .8});
        if (s % (hatStep || (kind === 'B' ? 1 : 2)) === 0 && kind !== 'pont') events.push({t, k: 'hat', v: s % 4 === 2 ? .6 : .35});
        if (s % bassStep === 0 && kind !== 'intro') events.push({t, k: 'bass', f: midiHz(deg(chord) - 12 + (s % 4 === 2 ? 12 : 0)), d: step * 1.8, v: .55 * energy});
        if (kind === 'B' || kind === 'pont') events.push({t, k: 'arp', f: midiHz(deg(chord + (song.arp || [0, 2, 4, 7])[s % 4]) + 12), d: step * .9, v: .16});
      }
      if (kind === 'A' || kind === 'B') {
        const m = motifs[kind + (song.long && si % 2 ? '2' : '')], half = b % 2, varied = b >= 6;
        for (const n of m) if ((n.s >= 16) === !!half) {
          let d = n.d + (varied && half ? 1 : 0); if (b === bars - 1 && n === m.at(-1)) d = 7;  // phrases end on the tonic
          const t = t0 + (n.s - half * 16) * step, f = midiHz(deg(d));
          events.push({t, k: 'lead', f, d: n.len * step * .92, v: song.wave === 'sawtooth' ? .22 : .3, w: song.wave || 'square'});
          lead.push({t, step: bar * 16 + n.s - half * 16, len: n.len, d, kind, downbeat: n.s % 16 === 0});
        }
      }
    }
  }
  return {events: events.sort((a, b) => a.t - b.t), lead, len: bar * 16 * step, step};
}
function rhChart(c, diff) {  // the notes to hit, from the melody (plus the snare in hard, the kick too in expert)
  const grid = {facile: 4, normal: 2, difficile: 1, expert: 1}[diff], hold = {facile: 8, normal: 6, difficile: 4, expert: 4}[diff], notes = [];
  let last = -1, lastT = -9;
  for (const n of c.lead) {
    if (n.step % grid) continue;
    if (diff === 'facile' && n.t - lastT < c.step * 3.5) continue;
    let lane = ((n.d % 4) + 4) % 4;
    if (lane === last && n.t - lastT < c.step * 2.5) lane = (lane + 1) % 4;
    const len = n.len >= hold ? n.len * c.step * .85 : 0;
    notes.push({t: n.t, lane, len});
    if (diff !== 'facile' && n.downbeat && (diff === 'expert' ? n.kind !== 'pont' : n.kind === 'B' && (diff === 'difficile' || n.step % 32 === 0))) notes.push({t: n.t, lane: (lane + 2) % 4, len: 0});
    last = lane; lastT = n.t;
  }
  const extra = diff === 'expert' ? ['snare', 'kick'] : diff === 'difficile' ? ['snare'] : [];
  for (const e of c.events) if (extra.includes(e.k) && !notes.some(n => Math.abs(n.t - e.t) < c.step * (e.k === 'kick' ? 1.1 : 1.5))) notes.push({t: e.t, lane: last = (last + 1) % 4, len: 0});
  return notes.sort((a, b) => a.t - b.t).map(n => ({...n, judged: false, held: false}));
}

/* ---------- levels made from your own music: tempo, beat and onsets found in the sound, notes placed on the beat grid ---------- */
function rhFFT(re, im) {  // in place, length a power of 2
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a), h = len >> 1;
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < h; k++) {
        const p = i + k, q = p + h, xr = re[q] * cr - im[q] * ci, xi = re[q] * ci + im[q] * cr;
        re[q] = re[p] - xr; im[q] = im[p] - xi; re[p] += xr; im[p] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}
// -> {bpm, beat0 (s), beat (s), peaks: [{t, s, band}], rms, fps, len}. Spectral flux on ~11 kHz mono, 512-point frames every 11.6 ms
async function rhAnalyse(buf) {
  const Y = () => new Promise(r => setTimeout(r, 0));  // on rend la main à l'écran pendant l'analyse
  const k = Math.max(1, Math.round(buf.sampleRate / 11025)), sr = buf.sampleRate / k, chs = Array.from({length: buf.numberOfChannels}, (_, c) => buf.getChannelData(c));
  const n = Math.floor(buf.length / k), x = new Float32Array(n);
  for (let i = 0; i < n; i++) { if (i % 400000 === 399999) { rhBar(.6 + .3 * i / n); await Y(); } let s = 0; for (const ch of chs) for (let j = 0; j < k; j++) s += ch[i * k + j]; x[i] = s / (k * chs.length); }
  const N = 512, H = 128, fps = sr / H, F = Math.max(0, Math.floor((n - N) / H)), hz = sr / N;
  const edges = [30, 150, 500, 2000, 5000].map(f => Math.max(1, Math.min(N / 2, Math.round(f / hz))));
  const win = Float32Array.from({length: N}, (_, i) => .5 - .5 * Math.cos(2 * Math.PI * i / (N - 1)));
  const flux = new Float32Array(F), band = [0, 1, 2, 3].map(() => new Float32Array(F)), rms = new Float32Array(F), re = new Float32Array(N), im = new Float32Array(N);
  let prev = new Float32Array(N / 2), cur = new Float32Array(N / 2);
  for (let f = 0; f < F; f++) {
    if (f % 250 === 249) await Y();
    let e = 0;
    for (let i = 0; i < N; i++) { const v = x[f * H + i]; re[i] = v * win[i]; im[i] = 0; e += v * v; }
    rms[f] = Math.sqrt(e / N);
    rhFFT(re, im);
    for (let b = 0; b < N / 2; b++) cur[b] = Math.log1p(100 * Math.hypot(re[b], im[b]));
    for (let q = 0; q < 4; q++) { let s = 0; for (let b = edges[q]; b < edges[q + 1]; b++) { const d = cur[b] - prev[b]; if (d > 0) s += d; } band[q][f] = s / (edges[q + 1] - edges[q]); flux[f] += band[q][f]; }
    [prev, cur] = [cur, prev];
  }
  // onset envelope: flux above its local average (0.5 s), never negative
  const env = new Float32Array(F), half = Math.round(fps * .25);
  let acc = 0; for (let f = 0; f < Math.min(F, half); f++) acc += flux[f];
  for (let f = 0; f < F; f++) {
    if (f + half < F) acc += flux[f + half]; if (f - half - 1 >= 0) acc -= flux[f - half - 1];
    const cnt = Math.min(F, f + half + 1) - Math.max(0, f - half); env[f] = Math.max(0, flux[f] - acc / cnt);
  }
  // tempo: autocorrelation of the envelope over 70-180 BPM, nudged towards 120 (where most songs are counted)
  let bestL = 0, bestS = -1;
  const lmin = Math.floor(fps * 60 / 180), lmax = Math.ceil(fps * 60 / 70), ac = new Float32Array(lmax + 2);
  for (let L = lmin; L <= lmax + 1; L++) { let s = 0; for (let f = 0; f + L < F; f += 2) s += env[f] * env[f + L]; ac[L] = s; }
  for (let L = lmin + 1; L <= lmax; L++) { const w = Math.exp(-.5 * (Math.log2(fps * 60 / L / 120) / .8) ** 2), s = ac[L] * w; if (s > bestS) { bestS = s; bestL = L; } }
  const a0 = ac[bestL - 1], a1 = ac[bestL], a2 = ac[bestL + 1], shift = a0 - 2 * a1 + a2 ? .5 * (a0 - a2) / (a0 - 2 * a1 + a2) : 0;
  const P = bestL + Math.max(-.5, Math.min(.5, shift)), bpm = Math.round(fps * 60 / P * 10) / 10;
  // where the beats fall: the phase whose comb of beats collects the most onsets
  let ph = 0, phS = -1;
  for (let p = 0; p < P; p++) { let s = 0; for (let t = p; t < F; t += P) s += env[Math.round(t)] + .5 * (env[Math.round(t) + 1] || 0); if (s > phS) { phS = s; ph = p; } }
  // onsets: local maxima clearly above the surroundings (1 s window)
  const peaks = [], W1 = Math.round(fps * .5);
  for (let f = 3; f < F - 3; f++) {
    const v = env[f]; if (v <= 0 || v < env[f - 1] || v < env[f + 1] || v < env[f - 2] || v < env[f + 2] || v < env[f - 3] || v < env[f + 3]) continue;
    let m = 0, m2 = 0, c = 0; for (let j = Math.max(0, f - W1); j < Math.min(F, f + W1); j += 2) { m += env[j]; m2 += env[j] * env[j]; c++; }
    m /= c; const sd = Math.sqrt(Math.max(0, m2 / c - m * m));
    if (v > m + .6 * sd) { let bb = 0; for (let q = 1; q < 4; q++) if (band[q][f] * (1 + q * .15) > band[bb][f] * (1 + bb * .15)) bb = q; peaks.push({t: f / fps + N / 2 / sr, s: v, band: bb, f}); }
  }
  return {bpm, beat: 60 / bpm, beat0: ph / fps + N / 2 / sr, peaks, rms, fps, len: buf.duration};
}
const rhTier = d => { const n = /^S\d+$/.test(d) ? +d.slice(1) : 0; return n ? (n <= 2 ? 'facile' : n <= 4 ? 'normal' : n <= 7 ? 'difficile' : 'expert') : d; };
function rhChartImport(a, diff) {  // diff : facile…expert, ou « S5 » = niveau à 5 étoiles
  const S = /^S\d+$/.test(diff) ? +diff.slice(1) : 0, D = rhTier(diff);
  const sub = S ? (S <= 2 ? 1 : S <= 5 ? 2 : 4) : {facile: 1, normal: 2, difficile: 4, expert: 4}[diff], nps = S ? [1, 1.5, 2.1, 2.8, 3.5, 4.3, 5.1, 6, 7, 8][S - 1] : {facile: 1.1, normal: 2, difficile: 3.1, expert: 4.4}[diff], gap = S ? Math.max(.09, Math.min(.42, .5 - S * .04)) : {facile: .42, normal: .24, difficile: .14, expert: .1}[diff];
  const slot = a.beat / sub, cands = new Map();
  for (const p of a.peaks) {  // each onset snaps to the nearest slot of the grid, if it is close enough
    const j = Math.round((p.t - a.beat0) / slot), t = a.beat0 + j * slot;
    if (Math.abs(p.t - t) > slot * .4 || t < 1 || t > a.len - .6) continue;
    const s = p.s * (j % sub === 0 ? 1.3 : 1), o = cands.get(j);
    if (!o || s > o.s) cands.set(j, {j, t, s, band: p.band, f: p.f});
  }
  const sorted = [...cands.values()].sort((x, y) => y.s - x.s), want = Math.min(sorted.length, Math.round(nps * a.len)), picked = [];
  const taken = new Set(), cell = t => Math.floor(t / gap);
  for (const c of sorted) {
    if (picked.length >= want) break;
    const z = cell(c.t); let ok = true;
    for (const q of [z - 1, z, z + 1]) for (const o of taken.has(q) ? picked.filter(p => cell(p.t) === q) : []) if (Math.abs(o.t - c.t) < gap) ok = false;
    if (ok) { picked.push(c); taken.add(z); }
  }
  picked.sort((x, y) => x.t - y.t);
  const strong = [...picked].sort((x, y) => y.s - x.s)[Math.floor(picked.length * .12)]?.s ?? Infinity, notes = [];
  let last = -1, lastT = -9;
  picked.forEach((c, i) => {
    let lane = c.band;  // low sounds on the left, high ones on the right
    if (lane === last && c.t - lastT < .3) lane = (lane + (i % 2 ? 1 : 3)) % 4;
    const next = picked[i + 1]?.t ?? a.len, room = next - c.t, f2 = Math.round(c.f + a.fps * a.beat), held = a.rms[f2] >= a.rms[c.f] * .4;
    const need = D === 'facile' ? 1.4 : 1.1, len = (D !== 'expert' || room >= a.beat * 2) && room >= a.beat * need && (held || room >= a.beat * 1.8) ? Math.min(room - a.beat * .3, a.beat * 3) * .9 : 0;
    notes.push({t: c.t, lane, len});
    if (D === 'expert' && c.s >= strong) notes.push({t: c.t, lane: (lane + 2) % 4, len: 0});
    last = lane; lastT = c.t;
  });
  return notes.map(n => ({...n, judged: false, held: false}));
}
const rhImports = () => gstore('rhythmImports', []);
const rhAnalysed = new Map();  // id -> {a, buffer}, for this session (recomputed from the sound: same notes on every PC)
async function rhLoadImport(imp) {
  if (rhAnalysed.has(imp.id)) return rhAnalysed.get(imp.id);
  const has = imp.file && (await neo.musicExists([imp.file]))[imp.file];
  const src = has ? 'neoplugin://neodex.music/file/' + encodeURIComponent(imp.file) : imp.url ? 'neoplugin://neodex.music/stream/?u=' + encodeURIComponent(imp.url) : '';
  if (!src) throw new Error('le fichier de cette musique n\'est pas sur ce PC');
  rhAudio(); toast('Analyse de la musique…'); rhBar(.08);
  const raw = await neo.musicBuffer(src); rhBar(.35);
  const buffer = await rhCtx.decodeAudioData(raw); rhBar(.6);
  const a = await rhAnalyse(buffer), r = {a, buffer}; rhBar(.95);
  rhAnalysed.set(imp.id, r);
  if (imp.bpm !== a.bpm || !imp.len) { imp.bpm = a.bpm; imp.len = Math.round(a.len); saveGames(); }
  return r;
}
async function rhAddImport(imp) {
  const list = rhImports();
  const old = list.find(x => x.id === imp.id); if (old) old.stars = imp.stars; else list.push(imp);
  saveGames(); rhTab = 'mine'; rhList();
  $('rhImpMsg').textContent = 'Analyse de « ' + imp.name + ' »…';
  try { const {a} = await rhLoadImport(imp); $('rhImpMsg').textContent = '« ' + imp.name + ' » : ' + a.bpm + ' BPM, niveaux prêts.'; await rhSelect(imp.id, imp.stars ? 'S' + imp.stars : 'normal'); }
  catch (e) { $('rhImpMsg').textContent = 'Impossible de lire « ' + imp.name + ' » : ' + e.message; }
  rhList();
}

const RH_LEN = [];
let rh = null, rhCtx = null, rhNoise = null, rhOut = null, rhTab = 'songs';
// les sons de frappe : un clic à chaque note touchée (le son choisi dans les réglages) et un son « combo cassé » quand on perd un combo de 10 ou plus.
// Calculés une fois à l'ouverture du son (rien à préparer au moment de frapper) : une attaque, un corps, une petite réverbération en stéréo, tous à la même force entendue
let rhKit = null;
function rhKitMake() {
  const sr = rhCtx.sampleRate, P = 2 * Math.PI, E = Math.exp, S = Math.sin, rn = seeded(7), nz = () => rn() * 2 - 1;
  const bq = (type, f, q = .707) => {  // un filtre (passe-bas, passe-haut ou passe-bande), formules classiques des égaliseurs
    const w = P * Math.min(f, sr * .45) / sr, cw = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
    const [b0, b1, b2] = type === 'lp' ? [(1 - cw) / 2, 1 - cw, (1 - cw) / 2] : type === 'hp' ? [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2] : [al, 0, -al];
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    return x => { const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
  };
  const env = (t, a, d) => t < a ? t / a : E(-(t - a) / d);  // monte en a secondes, retombe en d
  const glide = (t, f0, f1, k) => P * (f1 * t + (f0 - f1) * (1 - E(-k * t)) / k);  // la phase d'une note qui glisse de f0 vers f1
  const tick = (f, q, d) => { const b = bq('bp', f, q); return t => b(nz()) * E(-t / d); };  // l'attaque : un souffle très court
  // une petite pièce (réverbération courte, un peu différente à gauche et à droite) : le son respire au lieu de claquer à sec
  const room = (x, wet) => {
    const out = [0, 1].map(ch => {
      const y = new Float32Array(x.length), combs = [29.7, 37.1, 41.1, 43.7].map(ms => ({b: new Float32Array(Math.round((ms + ch * 1.7) * sr / 1000)), i: 0, lp: 0}));
      const aps = [5.1, 1.7].map(ms => ({b: new Float32Array(Math.round((ms + ch * .4) * sr / 1000)), i: 0}));
      for (let n = 0; n < x.length; n++) {
        let s = 0; for (const c of combs) { const o = c.b[c.i]; c.lp += (o - c.lp) * .55; c.b[c.i] = x[n] + c.lp * .74; c.i = (c.i + 1) % c.b.length; s += o; }
        s /= 4; for (const a of aps) { const o = a.b[a.i], v = s + o * .6; a.b[a.i] = v; a.i = (a.i + 1) % a.b.length; s = o - v * .6; }
        y[n] = x[n] + s * wet;
      }
      return y;
    });
    return out;
  };
  const mk = (dur, wet, drive, f) => {
    const n = Math.ceil((dur + .3) * sr), x = new Float32Array(n), m = Math.ceil(dur * sr);
    for (let i = 0; i < m; i++) { const t = i / sr; x[i] = Math.tanh(f(t) * drive) / Math.tanh(drive) * Math.min(1, (m - i) / (sr * .004)); }  // un peu de saturation : plus chaud et plus rond
    const [L, R] = room(x, wet), b = rhCtx.createBuffer(2, n, sr);
    let pk = 0, e = 0; const body = Math.min(n, Math.round(sr * .03)); for (let i = 0; i < n; i++) { pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); if (i < body) e += L[i] * L[i]; }
    const k = Math.min(.95 / (pk || 1), .24 / (Math.sqrt(e / body) || 1)), fade = Math.round(sr * .05);  // même force entendue pour tous
    for (let i = 0; i < n; i++) { const g = k * Math.min(1, (n - i) / fade); L[i] *= g; R[i] *= g; }
    b.getChannelData(0).set(L); b.getChannelData(1).set(R); return b;
  };
  const doux = tick(5200, .8, .0015), clap = bq('bp', 1250, 1.3), clapS = bq('hp', 6000), bois = tick(3200, 1, .0012), kick = tick(2600, .7, .0025);
  const hat = [bq('hp', 7200), bq('hp', 7200), bq('bp', 10000, .9)], sn = bq('bp', 3300, .8), sn2 = bq('hp', 7000), tok = tick(4200, 1.4, .0016);
  const pluck = [523.25, 783.99].map(f => { const b = new Float32Array(Math.round(sr / f)), lp = bq('lp', 3500); for (let i = 0; i < b.length; i++) b[i] = lp(nz()); return {b, i: 0}; });
  const brk = bq('lp', 1800), brkN = bq('bp', 1500, .9);
  return [
    mk(.09, .14, 1.4, t => S(glide(t, 1150, 640, 70)) * env(t, .0008, .045) + .22 * S(2 * glide(t, 1150, 640, 70)) * env(t, .0005, .018) + .5 * doux(t)),  // doux
    mk(.16, .24, 1.2, t => { const s = nz(), b = clap(s); return b * ([0, .009, .018].reduce((v, a) => v + (t >= a && t < a + .02 ? E(-(t - a) / .0035) : 0), 0) + (t > .022 ? .9 * E(-(t - .022) / .065) : 0)) + .15 * clapS(s) * E(-t / .03); }),  // clap
    mk(.12, .16, 1.3, t => S(P * 1150 * t) * E(-t / .035) + .55 * S(P * 2630 * t) * E(-t / .017) + .25 * S(P * 4180 * t) * E(-t / .008) + .5 * bois(t)),  // bois
    mk(.22, .07, 2.2, t => S(glide(t, 190, 52, 32)) * env(t, .001, .12) + .45 * kick(t)),  // grosse caisse
    mk(.45, .32, 1.1, t => S(P * 1760 * t + 3.2 * E(-t / .05) * S(P * 1760 * 3.01 * t)) * env(t, .001, .28) + .35 * S(P * 2637 * t) * E(-t / .18) + .2 * S(P * 3520 * t) * E(-t / .08)),  // cristal
    mk(.08, .12, 1.3, t => S(P * (950 * t - 690 * (1 - E(-90 * t)) / 90)) * env(t, .0012, .028)),  // pop
    mk(.09, .14, 1.5, t => { let v = 0; for (const f of [205.3, 304.4, 369.6, 522.7, 540, 800]) v += Math.sign(S(P * f * 1.7 * t)); return hat[2](hat[1](hat[0](v / 6))) * env(t, .0005, .038); }),  // charleston
    mk(.2, .22, 1.6, t => .8 * S(glide(t, 270, 185, 30)) * env(t, .001, .055) + sn(nz()) * env(t, .001, .1) + .4 * sn2(nz()) * E(-t / .05)),  // caisse claire
    mk(.5, .26, 1.2, t => { let v = 0; for (const [j, p] of pluck.entries()) { const o = p.b[p.i], nx = p.b[(p.i + 1) % p.b.length]; p.b[p.i] = (o + nx) * .5 * .997; p.i = (p.i + 1) % p.b.length; v += o * (j ? .45 : 1); } return v * env(t, .001, .22); }),  // pluck
    mk(.1, .15, 2, t => S(P * 1720 * t) * E(-t / .011) + .7 * S(P * 510 * t) * E(-t / .028) + .6 * tok(t)),  // tok
    mk(.7, .35, 1.3, t => (brk(.5 * S(glide(t, 520, 120, 4)) + .35 * S(glide(t, 523, 121, 4) * 1.5)) * 1.4 + .5 * brkN(nz()) * E(-t / .12)) * env(t, .006, .24)),  // combo cassé : un « whoomp » grave qui descend
  ];
}
function rhPlayKit(i, v) { if (!rhCtx || !rhOut) return; rhKit ??= rhKitMake(); const s = rhCtx.createBufferSource(), g = rhCtx.createGain(); s.buffer = rhKit[i]; g.gain.value = v; s.connect(g).connect(rhOut); s.start(); }
const rhClick = () => { const i = +$('rhClick').value; if (i >= 0) rhPlayKit(i, .45); };
function rhHook(o) {  // à chaque changement du combo (en partie) : un clic s'il monte, « combo cassé » s'il retombe à 0 depuis 10 ou plus
  if (Object.getOwnPropertyDescriptor(o, 'combo')?.set) return o;
  let c = o.combo || 0;
  Object.defineProperty(o, 'combo', {get: () => c, set: v => { if (o.mode === 'play') { if (v > c) rhClick(); else if (!v && c >= 10) rhPlayKit(10, .5); } c = v; }, enumerable: true, configurable: true});
  return o;
}
function rhAudio() {
  rhCtx ??= new AudioContext();
  if (!rhNoise) { rhNoise = rhCtx.createBuffer(1, rhCtx.sampleRate, rhCtx.sampleRate); const d = rhNoise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  if (!rhOut) { rhOut = rhCtx.createGain(); rhOut.connect(rhCtx.destination); }
  rhOut.gain.value = +$('rhVol').value / 100 * .6;
  rhKit ??= rhKitMake();
}
function rhSound(e, when, c = rhCtx, out = rhOut) {
  const g = c.createGain(); g.connect(out);
  const env = (a, d, v) => { g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(v, when + a); g.gain.exponentialRampToValueAtTime(.0001, when + d); };
  if (e.k === 'kick') { const o = c.createOscillator(); o.frequency.setValueAtTime(150, when); o.frequency.exponentialRampToValueAtTime(40, when + .12); env(.002, .22, .9 * e.v); o.connect(g); o.start(when); o.stop(when + .25); }
  else if (e.k === 'snare' || e.k === 'hat') {
    const n = c.createBufferSource(), f = c.createBiquadFilter(); n.buffer = rhNoise;
    f.type = e.k === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = e.k === 'hat' ? 7000 : 1800;
    env(.001, e.k === 'hat' ? .045 : .17, (e.k === 'hat' ? .25 : .55) * e.v); n.connect(f).connect(g); n.start(when, Math.random() * .5); n.stop(when + .2);
  } else {
    const o = c.createOscillator(); o.type = e.k === 'lead' ? e.w || 'square' : 'triangle'; o.frequency.value = e.f;
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(e.v * (e.k === 'lead' ? .55 : 1), when + .006); g.gain.setValueAtTime(e.v * (e.k === 'lead' ? .4 : .7), when + Math.min(e.d, .08)); g.gain.exponentialRampToValueAtTime(.0001, when + e.d + .04);
    o.connect(g); o.start(when); o.stop(when + e.d + .06);
  }
}
// le morceau est « cuit » d'avance en un seul son (hors temps réel) : plus aucun instrument à créer pendant la partie, donc plus de saccades
const rhRendered = new Map();
async function rhRenderSong(i, c) {  // synthèse faite à la main dans un tableau (le moteur audio hors temps réel mettait plus de 20 s)
  if (rhRendered.has(i)) return rhRendered.get(i);
  toast('Préparation du niveau…'); rhBar(.3); await new Promise(r => setTimeout(r, 40));
  rhAudio();
  const R = 44100, N = Math.ceil((c.len + 1.5) * R), out = new Float32Array(N), nz = rhNoise.getChannelData(0), TAU = 2 * Math.PI;
  const biquad = (type, f) => { const w = TAU * f / R, al = Math.sin(w) / 2, cw = Math.cos(w), a0 = 1 + al, b = type === 'hp' ? [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2] : [al, 0, -al]; return {b0: b[0] / a0, b1: b[1] / a0, b2: b[2] / a0, a1: -2 * cw / a0, a2: (1 - al) / a0}; };
  const HP = biquad('hp', 7000), BP = biquad('bp', 1800), expo = (a, t, T) => a * Math.pow(.0001 / a, t / T);
  for (const e of c.events) {
    const s0 = Math.floor(e.t * R); if (s0 >= N) continue;
    if (e.k === 'kick') {
      let ph = 0; const L = Math.min(N - s0, Math.floor(.25 * R)), v = .9 * e.v;
      for (let n = 0; n < L; n++) { const t = n / R, f = 150 * Math.pow(40 / 150, Math.min(t, .12) / .12); ph += TAU * f / R; out[s0 + n] += Math.sin(ph) * (t < .002 ? v * t / .002 : expo(v, t - .002, .218)); }
    } else if (e.k === 'snare' || e.k === 'hat') {
      const hat = e.k === 'hat', q = hat ? HP : BP, d = hat ? .045 : .17, v = (hat ? .25 : .55) * e.v, L = Math.min(N - s0, Math.floor((d + .02) * R));
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0, o = Math.floor(Math.random() * nz.length * .5);
      for (let n = 0; n < L; n++) { const t = n / R, x = nz[(o + n) % nz.length], y = q.b0 * x + q.b1 * x1 + q.b2 * x2 - q.a1 * y1 - q.a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; out[s0 + n] += y * (t < .001 ? v * t / .001 : t < d ? expo(v, t - .001, d - .001) : 0); }
    } else {
      const lead = e.k === 'lead', w = lead ? e.w || 'square' : 'triangle', v1 = e.v * (lead ? .55 : 1), v2 = e.v * (lead ? .4 : .7), tm = Math.min(e.d, .08), T = e.d + .04, L = Math.min(N - s0, Math.floor((e.d + .06) * R)), inc = e.f / R;
      let ph = 0;
      for (let n = 0; n < L; n++) {
        const t = n / R; ph += inc; if (ph >= 1) ph -= 1;
        const s = w === 'square' ? (ph < .5 ? 1 : -1) : w === 'sawtooth' ? 2 * ph - 1 : w === 'sine' ? Math.sin(TAU * ph) : 1 - 4 * Math.abs(ph - .5);
        out[s0 + n] += s * (t < .006 ? v1 * t / .006 : t < tm ? v1 : t < T ? expo(v2, t - tm, T - tm) : 0);
      }
    }
  }
  for (let n = 0; n < N; n++) out[n] = Math.max(-1, Math.min(1, out[n] * .6));
  const buf = rhCtx.createBuffer(1, N, R); buf.copyToChannel(out, 0); rhRendered.set(i, buf); return buf;
}
let rhOffMs = 0;
const rhLatency = () => (rhCtx?.outputLatency || 0) + (rhCtx?.baseLatency || 0) + rhOffMs / 1000;
// l'horloge audio n'avance que par paquets (~10 ms sous Windows) : sur un écran à 144 ou 165 Hz, elle reste figée une image sur trois
// et les notes avancent par à-coups. On la prolonge avec l'horloge de l'écran entre deux paquets (jamais de plus de 50 ms, jamais en arrière).
const rhCk = {ct: -1, pt: 0, out: 0};
function rhTime() {
  const t = rhCtx.currentTime, p = performance.now();
  if (t !== rhCk.ct) { rhCk.ct = t; rhCk.pt = p; }
  const v = rhCtx.state === 'running' ? t + Math.min(.05, (p - rhCk.pt) / 1000) : t;
  rhCk.out = v < rhCk.out && rhCk.out - v < .06 ? rhCk.out : v;  // un paquet arrivé un peu tôt ne fait pas reculer les notes
  return rhCk.out;
}
const rhNow = () => rhTime() - rh.t0 - rhLatency();
const rhDrawAll = () => { cv.style.cursor = rh.mode === 'play' ? 'none' : ''; RHG.draw(); };  // le gros curseur gêne la lecture des notes pendant la partie
/* ---------- commun aux jeux de rythme : choix du morceau, calcul de difficulté, plein écran, départ, jugement, fin de partie ----------
   Le jeu fournit RHG = {key, factor, chart(base, c, diff), reset(), update(), draw()} avant d'appeler rhOpen(). */
// la difficulté en étoiles, calculée sur les notes elles-mêmes : densité moyenne, passages les plus chargés (fenêtres de 3 s) et déplacements entre voies
function rhStars(notes, len, factor = 1) {
  if (!notes.length) return 1;
  const ts = notes.map(n => n.t), first = ts[0], last = ts.at(-1), act = Math.max(20, Math.min(len, last - first + 2)), dens = notes.length / act;
  const wins = []; for (let i = 0, j = 0; i < ts.length; i++) { while (ts[i] - ts[j] > 3) j++; wins.push((i - j + 1) / 3); }
  wins.sort((a, b) => a - b); const peak = wins[Math.floor(wins.length * .9)] || dens;
  let moves = 0; for (let i = 1; i < notes.length; i++) if (Math.abs((notes[i].lane ?? 0) - (notes[i - 1].lane ?? 0)) >= 2) moves++;
  const jumps = notes.length > 1 ? moves / (notes.length - 1) : 0;
  return Math.max(1, Math.min(10, Math.round((.55 * dens + .45 * peak) * (1 + .35 * jumps) * 1.15 * factor * 10) / 10));
}
console.assert(rhStars([], 60) === 1 && rhStars(Array.from({length: 600}, (_, i) => ({t: i * .2, lane: i % 4})), 120) > rhStars(Array.from({length: 120}, (_, i) => ({t: i, lane: 0})), 120), 'rhStars');
const rhStarCache = new Map();  // 'i:diff' -> étoiles (les morceaux du jeu donnent toujours les mêmes notes)
function rhSongStars(i, diff) {
  const k = i + ':' + diff; if (!rhStarCache.has(k)) { const c = rhCompose(RH_SONGS[i]); rhStarCache.set(k, rhStars(RHG.chart(rhChart(c, diff), c, diff), c.len, RHG.factor)); }
  return rhStarCache.get(k);
}
const rhStarTxt = s => s.toFixed(1) + '★';
// avant la partie : une barre de chargement (la musique est lue, décodée et analysée en entier d'avance, rien ne se charge pendant
// la partie), puis, une fois en plein écran, un compte à rebours : le passage en plein écran (qui fige l'écran un instant) ne tombe jamais sur des notes
const rhOver = () => {
  const box = cv.parentElement; let o = box.querySelector(':scope > .rhOver'); if (o) return o;
  o = document.createElement('div'); o.className = 'rhOver';
  o.innerHTML = '<div class="rhBar" hidden><span>Chargement du niveau…</span><i><b></b></i></div><div class="rhCount" aria-live="assertive"></div>';
  const st = document.createElement('style'); st.textContent = '.rhOver{position:absolute;inset:0;pointer-events:none;z-index:5}'
    + '.rhBar{position:absolute;left:50%;bottom:12%;transform:translateX(-50%);width:min(60%,420px);text-align:center;font-family:inherit;font-size:13px;line-height:1.6;color:#fff;text-shadow:0 1px 3px #000}'
    + '.rhBar i{display:block;height:8px;margin-top:6px;border-radius:4px;background:rgba(0,0,0,.55);box-shadow:0 0 0 1px rgba(255,255,255,.35);overflow:hidden}'
    + '.rhBar b{display:block;height:100%;width:0;background:var(--accent,#3fe0ff);transition:width .25s}'
    + '.rhCount{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:inherit;font-weight:800;font-size:min(22vw,22vh);line-height:1;color:#fff;text-shadow:0 0 24px var(--accent,#3fe0ff),0 4px 0 rgba(0,0,0,.6)}';
  o.append(st); if (getComputedStyle(box).position === 'static') box.style.position = 'relative'; box.append(o); return o;
};
const rhBar = p => { const b = rhOver().querySelector('.rhBar'); b.hidden = p == null; if (p != null) b.querySelector('b').style.width = Math.round(p * 100) + '%'; };
function rhCount() {  // 3, 2, 1 jusqu'au départ de la musique (l'horloge audio : une pause arrête le compte)
  const c = rhOver().querySelector('.rhCount'), tick = () => {
    const left = rh && rhCtx && (rh.mode === 'play' || rh.mode === 'pause') ? rh.t0 - rhCtx.currentTime : 0, n = left > 0 && left <= 3 ? String(Math.ceil(left)) : '';
    if (c.textContent !== n) c.textContent = n;
    if (left > 0) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);  // après le passage en mode « play »
}
let rhTok = 0;
async function rhSelect(i, diff) { const me = rhTok + 1; rhBar(.03); try { return await rhPrepare(i, diff); } finally { if (me === rhTok) rhBar(null); } }
async function rhPrepare(i, diff) {  // i : numéro d'un morceau du jeu, ou identifiant d'une musique importée
  let info, c, base; const tok = ++rhTok;
  if (rh) { try { rh.src?.stop(); } catch {} rh.mode = 'load'; }
  if (typeof i === 'number') {
    const song = RH_SONGS[i] || RH_SONGS[0]; i = RH_SONGS.indexOf(song); c = rhCompose(song); base = rhChart(c, diff); info = {name: song.name, bpm: song.bpm, key: 'rh' + i + diff};
    const buffer = await rhRenderSong(i, c); c = {events: [], lead: c.lead, len: c.len, step: c.step, buffer, beat0: 0};
  } else {
    const imp = rhImports().find(x => x.id === i); if (!imp) return rhSelect(0, diff);
    const {a, buffer} = await rhLoadImport(imp);
    c = {events: [], lead: [], len: a.len, step: a.beat / 4, buffer, beat0: a.beat0}; base = rhChartImport(a, diff); info = {name: imp.name, bpm: a.bpm, key: 'rhx' + imp.id + diff};
  }
  if (tok !== rhTok) return;  // un autre niveau a été choisi entre-temps
  const notes = RHG.chart(base, c, diff).map(n => ({...n, judged: false}));
  rh = rhHook(rh || {raf: 0, tick: 0});
  Object.assign(rh, {mode: 'ready', song: i, diff, c, info, notes, stars: rhStars(notes, c.len, RHG.factor), src: null, t0: 0, score: 0, combo: 0, maxCombo: 0,
    counts: {PARFAIT: 0, BIEN: 0, OK: 0, RATÉ: 0}, dts: [], fx: [], sparks: [], record: false, grade: '', acc: 0, adj: 0, overAt: 0});
  RHG.reset(); games.rhythmLast = {song: i, diff}; saveGames(); rhList();
  gameLoop(rh, RHG.key, RHG.update, rhDrawAll);
}
const rhFull = on => { try { if (on && !document.fullscreenElement) cv.parentElement.requestFullscreen?.().catch(() => {}); if (!on && document.fullscreenElement) document.exitFullscreen(); } catch {} };
function rhBegin() {  // plein écran (par-dessus la barre de NeoDex), puis le morceau part dans 2 secondes
  rhFull(true); rhAudio(); rhCtx.resume(); rh.t0 = rhCtx.currentTime + 4; rhCount(); rh.mode = 'play';
  try { rh.src?.stop(); } catch {} rh.src = rhCtx.createBufferSource(); rh.src.buffer = rh.c.buffer; rh.src.connect(rhOut); rh.src.start(rh.t0);
}
function rhPress() {  // espace ou clic hors partie : jouer, reprendre, rejouer
  if (!rh) return false;
  if (rh.mode === 'ready') { rhBegin(); return true; }
  if (rh.mode === 'pause') { rh.mode = 'play'; rhCtx.resume(); return true; }
  if (rh.mode === 'over') { if (rh.tick - rh.overAt > 40) rhSelect(rh.song, rh.diff); return true; }
  return false;
}
function rhPause() { if (rh?.mode === 'play') { rh.mode = 'pause'; rhCtx?.suspend(); } }
const rhWin = dt => RH.WIN.find(w => Math.abs(dt) <= w[0]);
function rhHit(n, dt) {  // -> la fenêtre atteinte (PARFAIT, BIEN, OK), ou rien si la note est ratée
  const w = rhWin(dt); n.judged = true; if (!w) { rhMissed(n); return null; }
  rh.dts.push(dt); rh.combo++; rh.maxCombo = Math.max(rh.maxCombo, rh.combo); rh.counts[w[1]]++; rh.score += Math.round(w[2] * (1 + Math.min(rh.combo, 100) / 100));
  return w;
}
function rhMissed(n) { n.judged = true; n.missed = true; rh.combo = 0; rh.counts['RATÉ']++; }
function rhCheckEnd(now) {
  if (now <= rh.c.len + 1.5) return false;
  rh.mode = 'over'; rh.overAt = rh.tick; try { rh.src?.stop(); } catch {} rhFull(false);
  const n = rh.notes.length, acc = n ? (rh.counts.PARFAIT * 300 + rh.counts.BIEN * 200 + rh.counts.OK * 100) / (n * 300) : 0;
  rh.acc = acc; rh.grade = acc >= .95 ? 'S' : acc >= .9 ? 'A' : acc >= .8 ? 'B' : acc >= .7 ? 'C' : 'D';
  const k = rh.info.key, res = gstore('rhythm', {}); rh.record = best(k, rh.score);
  if (rh.record || !res[k]) res[k] = {score: rh.score, acc: Math.round(acc * 1000) / 10, grade: rh.grade, combo: rh.maxCombo};
  rh.adj = rhAutoOffset(rh.dts); saveGames(); sfx('SAB'.includes(rh.grade) ? 'launch' : 'notify'); rhList(); rhInfo();
  return true;
}
function rhOffsetStep(dts) {  // décalage automatique : si tu tapes en moyenne en retard (ou en avance), on corrige de 70 % de l'écart
  if (dts.length < 20) return 0;
  const s = [...dts].sort((a, b) => a - b), med = s[s.length >> 1] * 1000;
  return Math.abs(med) < 8 ? 0 : Math.round(med * .7);
}
console.assert(rhOffsetStep(Array(30).fill(.05)) === 35 && rhOffsetStep(Array(30).fill(.004)) === 0, 'rhOffsetStep');
function rhAutoOffset(dts) { const d = rhOffsetStep(dts); if (!d) return 0; rhOffMs = Math.max(-300, Math.min(300, rhOffMs + d)); $('rhOffset').value = rhOffMs; gstore('rhythmPrefs', {}).rhOffset = String(rhOffMs); return d; }
// les textes communs dessinés dans le canevas : départ, chargement, pause, résultats
function rhScreens(y0 = 90) {
  const title = rh.info.name.length > 26 ? rh.info.name.slice(0, 25) + '…' : rh.info.name, diff = RH_DIFFS[rh.diff] || (String(rh.diff).startsWith('S') ? 'Perso' : rh.diff);
  if (rh.mode === 'ready') gameText(g, W, [[title.toUpperCase(), RHG.color, 10], [diff + ' · ' + rhStarTxt(rh.stars) + ' · ' + rh.notes.length + ' notes · ' + Math.round(rh.info.bpm) + ' BPM', '#e8e0ff'], ...RHG.help, ['Espace ou clic : jouer (plein écran)', '#ffd84a']], y0);
  if (rh.mode === 'load') gameText(g, W, [['CHARGEMENT…', '#ffd84a', 10], ['La musique se prépare', '#e8e0ff']], y0 + 20);
  if (rh.mode === 'pause') gameText(g, W, [['PAUSE', '#ffffff', 12], ['Espace : reprendre', '#e8e0ff']], y0 + 20);
  if (rh.mode === 'over' && rh.tick - rh.overAt > 20) gameText(g, W, [['NOTE ' + rh.grade, rh.grade === 'S' ? '#ffd84a' : RHG.color, 14], [rh.score + ' points · ' + (rh.acc * 100).toFixed(1) + ' %', '#ffffff'], ['Combo max ' + rh.maxCombo + ' · ' + rhStarTxt(rh.stars), '#e8e0ff'],
    ['Parfait ' + rh.counts.PARFAIT + ' · Bien ' + rh.counts.BIEN + ' · OK ' + rh.counts.OK + ' · Raté ' + rh.counts['RATÉ'], '#a8a0c8'], [rh.record ? 'NOUVEAU RECORD !' : 'Espace : rejouer', '#ffd84a'], ...(rh.adj ? [['Décalage ajusté : ' + (rh.adj > 0 ? '+' : '') + rh.adj + ' ms', '#7ee07a']] : [])], y0 - 10);
}
const rhProgress = (now, col) => { px(g, '#1a1430', 0, 0, W, 2); px(g, col, 0, 0, Math.max(0, Math.min(1, now / rh.c.len)) * W, 2); };
// la liste des morceaux, les imports, les réglages (le panneau de droite)
function rhDiffRow(key, sel, play, imp, songI) {
  const res = games?.rhythm || {}, row = el('div', 'row');
  if (imp?.stars) { const d = 'S' + imp.stars, r = res[key + d], b = el('button', 'btn' + (sel && rh?.diff === d ? ' main' : ''), 'JOUER · ' + imp.stars + '★' + (r ? ' · ' + r.grade : '')); if (r) b.title = r.score + ' points · ' + r.acc + ' %'; b.onclick = () => { b.blur(); play(d); }; row.append(b); return row; }
  for (const [d, label] of Object.entries(RH_DIFFS)) {
    const r = res[key + d], st = songI != null ? rhStarCache.get(songI + ':' + d) : null, b = el('button', 'btn' + (sel && rh?.diff === d ? ' main' : ''), label + (st ? ' ' + rhStarTxt(st) : '') + (r ? ' · ' + r.grade : ''));
    b.dataset.star = songI != null ? songI + ':' + d : ''; b.dataset.label = label + '|' + (r ? ' · ' + r.grade : '');
    b.title = (r ? r.score + ' points · ' + r.acc + ' % · ' : '') + 'difficulté calculée sur les notes'; b.onclick = () => { b.blur(); play(d); }; row.append(b);
  }
  return row;
}
let rhStarJob = 0;
function rhFillStars() {  // les étoiles se calculent petit à petit, sans figer l'écran
  const job = ++rhStarJob, btns = [...$('rhSongs').querySelectorAll('button[data-star]')].filter(b => b.dataset.star && !rhStarCache.has(b.dataset.star));
  const step = () => { if (job !== rhStarJob) return; const t = performance.now(); while (btns.length && performance.now() - t < 12) { const b = btns.shift(), [i, d] = b.dataset.star.split(':'), [lab, rest] = b.dataset.label.split('|'); b.textContent = lab + ' ' + rhStarTxt(rhSongStars(+i, d)) + rest; } if (btns.length) setTimeout(step, 30); };
  setTimeout(step, 60);
}
let rhPage = null;
function rhPager(order) {  // 1200 chansons : 50 par page (sinon la liste est trop lourde), on ouvre sur la page de la chanson choisie
  const n = Math.ceil(order.length / 50);
  rhPage = Math.min(n - 1, Math.max(0, rhPage ?? Math.floor(Math.max(0, order.indexOf(rh?.song)) / 50)));
  return () => {
    const r = el('div', 'rhPager'), a = el('button', 'btn', '◀'), b = el('button', 'btn', '▶');
    a.disabled = rhPage === 0; b.disabled = rhPage === n - 1;
    a.onclick = () => { rhPage--; rhList(); $('rhSongs').scrollTop = 0; }; b.onclick = () => { rhPage++; rhList(); $('rhSongs').scrollTop = 0; };
    r.append(a, el('span', 'hint', (rhPage * 50 + 1) + '–' + Math.min(order.length, rhPage * 50 + 50) + ' / ' + order.length), b); return r;
  };
}
function rhList() {
  $('rhTabSongs').classList.toggle('main', rhTab === 'songs'); $('rhTabMine').classList.toggle('main', rhTab === 'mine');
  $('rhTabMine').textContent = 'MES MUSIQUES · ' + rhImports().length; $('rhImport').style.display = rhTab === 'mine' ? '' : 'none';
  if (rhTab === 'mine' && !$('rhMuList').options.length) rhFillNeoMusic();
  if (rhTab === 'songs') {
    const res = games?.rhythm || {}, done = RH_SONGS.filter((_, i) => Object.keys(RH_DIFFS).some(d => res['rh' + i + d])).length;
    $('rhTabSongs').textContent = 'CHANSONS · ' + done + ' / ' + RH_SONGS.length;
    const order = RH_SONGS.map((s, i) => i).sort((a, b) => !!RH_SONGS[a].last - !!RH_SONGS[b].last || RH_SONGS[a].bpm - RH_SONGS[b].bpm);
    const bar = rhPager(order), p0 = rhPage * 50;
    $('rhSongs').replaceChildren(bar(), ...order.slice(p0, p0 + 50).map((i, k) => { const rank = p0 + k;
      const s = RH_SONGS[i], c = el('div', 'sysCard rhSong' + (rh?.song === i ? ' on' : '')), mins = (RH_LEN[i] ??= s.len ?? rhCompose(s).len);
      c.append(el('b', '', (rank + 1) + '. ' + s.name), el('span', 'hint', (s.style ? s.style + ' · ' : '') + s.bpm + ' BPM · ' + clock(mins)), rhDiffRow('rh' + i, rh?.song === i, d => rhSelect(i, d), null, i));
      return c;
    }), bar());
    return rhFillStars();
  }
  const list = rhImports();
  $('rhSongs').replaceChildren(...(list.length ? list.map(imp => {
    const c = el('div', 'sysCard rhSong' + (rh?.song === imp.id ? ' on' : '')), x = el('button', 'rhDel', '×');
    x.title = 'Retirer ce niveau (la musique reste dans NeoMusic)';
    x.onclick = () => { games.rhythmImports = list.filter(o => o !== imp); rhAnalysed.delete(imp.id); saveGames(); rhList(); };
    c.append(x, el('b', '', imp.name), el('span', 'hint', (imp.bpm ? imp.bpm + ' BPM · ' + clock(imp.len || 0) : 'pas encore analysée') + (imp.url ? ' · YouTube' : ' · fichier')),
      rhDiffRow('rhx' + imp.id, rh?.song === imp.id, d => { $('rhImpMsg').textContent = 'Préparation du niveau…'; rhSelect(imp.id, d).then(() => $('rhImpMsg').textContent = '', e => $('rhImpMsg').textContent = 'Impossible : ' + e.message); }, imp));
    return c;
  }) : [el('span', 'hint', 'Importe un fichier audio, ou choisis une musique de NeoMusic : le jeu trouve son tempo et ses temps forts et en fait un niveau.')]));
}
async function rhFillNeoMusic() {
  try { await muLoad(); } catch {}
  const seen = new Set(), songs = (typeof mu === 'object' && mu ? mu.playlists.flatMap(p => p.tracks) : []).filter(t => (t.file || t.url) && !seen.has(muId(t)) && seen.add(muId(t)));
  $('rhMuList').replaceChildren(...(songs.length ? songs.map(t => { const o = el('option', '', (t.display_title || t.file).slice(0, 70)); o.value = muId(t); return o; }) : [el('option', '', 'Aucune musique dans NeoMusic')]));
  $('rhMuList')._songs = songs; $('rhMuBtn').disabled = !songs.length;
}
$('rhTabSongs').onclick = () => { rhTab = 'songs'; rhList(); };
$('rhTabMine').onclick = () => { rhTab = 'mine'; rhList(); rhFillNeoMusic(); };
$('rhFileBtn').onclick = () => $('rhFile').click();
$('rhFile').onchange = async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try { const file = await neo.musicAddFile(await neo.pathOf(f)); rhAddImport({id: 'f:' + file, name: f.name.replace(/\.[^.]+$/, ''), file, stars: +$('rhStars').value}); }
  catch (err) { $('rhImpMsg').textContent = 'Import impossible : ' + err.message; }
};
$('rhMuBtn').onclick = () => { const t = $('rhMuList')._songs?.find(x => muId(x) === $('rhMuList').value); if (t) rhAddImport({id: muId(t), name: t.display_title || t.file, file: t.file || '', url: t.url || '', stars: +$('rhStars').value}); };
$('rhFs').onclick = () => { rhFull(!document.fullscreenElement); $('rhFs').blur(); };
$('rhOffset').addEventListener('change', () => { rhOffMs = +$('rhOffset').value; });
$('rhClick').onchange = () => { rhAudio(); rhCtx.resume(); rhClick(); };  // le son choisi, pour l'entendre
$('rhVol').oninput = () => { if (rhOut) rhOut.gain.value = +$('rhVol').value / 100 * .6; };
for (const id of ['rhVol', 'rhClick', 'rhOffset']) $(id).addEventListener('change', () => { gstore('rhythmPrefs', {})[id] = $(id).value; saveGames(); });
setInterval(() => { if (rhCtx?.state === 'running' && (!view.classList.contains('on') || rh?.mode !== 'play')) rhCtx.suspend(); }, 200);  // la musique s'arrête avec la partie
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) rhPause(); });  // Échap sort du plein écran : on met en pause
$('gNew').onclick = () => { if (rh) rhSelect(rh.song, rh.diff); $('gNew').blur(); };
function rhInfo() { const res = games.rhythm || {}, all = Object.values(res); showStats([['Morceaux joués', all.length], ['Notes S', all.filter(r => r.grade === 'S').length], ['Meilleur combo', all.reduce((m, r) => Math.max(m, r.combo || 0), 0)]]); }
function rhOpen() {
  const p = games.rhythmPrefs || {}; for (const id of ['rhVol', 'rhClick', 'rhOffset']) if (p[id] != null) $(id).value = p[id];
  rhOffMs = +$('rhOffset').value; rhInfo();
  if (rh) { rhList(); return gameLoop(rh, RHG.key, RHG.update, rhDrawAll); }
  const last = games.rhythmLast || {song: 0, diff: 'normal'}; rhSelect(last.song, last.diff).catch(() => rhSelect(0, 'normal'));
}

/* ---------- Cavale : la coureuse file vers la droite, les monstres arrivent sur deux voies. En l'air (J ou K) : chauves-souris ; au sol (F ou D) : gelées.
   Deux monstres ensemble : les deux mains. Rubans dorés (les notes longues) : on garde la touche enfoncée jusqu'au bout. ---------- */
const CV = {HX: 64, AY: 106, GY: 190, FLOOR: 196, PPB: 60};  // AY, GY : le centre des cibles en l'air et au sol
const RHG = {key: 'cavale', factor: 1, color: '#ffb84a',
  help: [['J ou K : monstre en l\'air · F ou D : monstre au sol', '#ffe0b0'], ['Deux monstres ensemble : les deux touches', '#ffe0a0'], ['Ruban doré : garde la touche enfoncée', '#ffe0a0']],
  // les notes de base (4 voies) : voies 0-1 = sol, 2-3 = air ; deux notes ensemble sur des voies différentes = un monstre en haut et un en bas ; notes longues = rubans
  chart(base) {
    const out = []; const busy = {air: -9, sol: -9};
    for (const n of base) {
      const kind = n.lane >= 2 ? 'air' : 'sol';
      if (n.t < busy[kind] + .1) continue;
      const twin = out.findLast(o => Math.abs(o.t - n.t) < .01);
      if (twin) { if (twin.kind === kind || twin.end || n.len > .35) continue; }
      if (n.len > .35) { out.push({t: n.t, kind, lane: kind === 'air' ? 1 : 0, end: n.t + n.len, ticks: 0}); busy[kind] = n.t + n.len; continue; }
      out.push({t: n.t, kind, lane: kind === 'air' ? 1 : 0}); busy[kind] = n.t;
    }
    return out;
  },
  reset() { Object.assign(rh, {judge: null, held: {air: 0, sol: 0}, jumpAt: -9, swing: null, hurt: -99, holds: 0}); },
  update() { const now = rhNow(); cvStep(now); rhCheckEnd(now); },
  draw() { cvDraw(); },
};
function cvStep(now) {
  for (const n of rh.notes) {
    if (n.t - now > .2) break;
    if (n.holding) { cvSettle(n, now); if (now >= n.end) { n.holding = false; n.done = true; cvFx(n, [0, 'FINI', 0, '#ffd84a'], true); } continue; }
    if (n.judged) continue;
    if (now - n.t > RH.WIN.at(-1)[0]) { rhMissed(n); cvFx(n, null); }
  }
  for (const s of rh.sparks) { s.x += s.vx; s.y += s.vy; s.vy += .1; s.life--; } rh.sparks = rh.sparks.filter(s => s.life > 0);
  for (const f of rh.fx) f.t++; rh.fx = rh.fx.filter(f => f.t < 30);
  if (rh.judge && --rh.judge.t <= 0) rh.judge = null;
}
// un ruban tenu : des points tous les dixièmes de seconde jusqu'à maintenant (ou jusqu'au bout)
function cvSettle(n, now) { while (n.last + .1 <= Math.min(now, n.end) + 1e-6) { n.last += .1; n.ticks++; rh.holds++; rh.score += 30; } }
const cvY = kind => kind === 'air' ? CV.AY : CV.GY;
function cvFx(n, w, quiet) {
  rh.judge = {text: w ? w[1] : 'RATÉ', col: w ? w[3] : '#8a9ac8', t: 24, y: cvY(n.kind)};
  if (!w) { rh.hurt = rh.tick; return; }
  if (quiet) return;
  rh.fx.push({k: 'fly', kind: n.kind, t: 0, y: cvY(n.kind)});
  const col = n.kind === 'air' ? '#c88aff' : '#7ee07a';
  for (let i = 0; i < 8; i++) { const a = Math.random() * Math.PI * 2, v = .8 + Math.random() * 1.8; rh.sparks.push({x: CV.HX + 14, y: cvY(n.kind), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 18, col}); }
}
// un coup sur une voie : la note la plus proche de cette voie (un ruban touché à temps se tient ensuite)
function cvHit(kind, now = rhNow()) {
  rh.held[kind]++; rh.swing = {kind, at: rh.tick}; if (kind === 'air') rh.jumpAt = rh.tick;
  rhPlayKit(kind === 'air' ? 9 : 3, .45);
  let near = null;
  for (const n of rh.notes) {
    if (n.t - now > .2) break;
    if (n.judged || n.kind !== kind) continue;
    if (Math.abs(n.t - now) <= RH.WIN.at(-1)[0] && (!near || Math.abs(n.t - now) < Math.abs(near.t - now))) near = n;
  }
  if (!near) return;
  const w = rhHit(near, now - near.t); cvFx(near, w, !!near.end);
  if (w && near.end) { near.holding = true; near.last = near.t; }
}
function cvUp(kind, now) {  // lâcher : un ruban en cours s'arrête là (sauf dans le dernier dixième de seconde, compté comme fini)
  if (!rh?.held) return; rh.held[kind] = Math.max(0, rh.held[kind] - 1); if (rh.held[kind] || rh.mode !== 'play') return;
  now ??= rhNow();
  for (const n of rh.notes) if (n.holding && n.kind === kind) { cvSettle(n, now); n.holding = false; n.done = true; if (now < n.end - .1) n.broke = true; else cvFx(n, [0, 'FINI', 0, '#ffd84a'], true); }
}
/* le dessin : ciel du soir, nuages, montagnes, collines qui défilent, chemin ; la coureuse à gauche, les cibles sur les deux voies */
const CV_PAL = {k: '#1a0e0a', h: '#c8502a', H: '#f08a4a', s: '#f0c8a0', S: '#c8906a', w: '#ffffff', e: '#1a0e0a', r: '#e83a4a', R: '#a82a3a', b: '#3a6ac8', B: '#2a4a98', y: '#e8b84a', p: '#5a3a28'};
const CV_TOP = ['.......kkkkk........', '.....kkhhhhhkk......', '....khhHHHhhhhk.....', '...khhHHhhhhhhhk....', '...khhhhhhhhhsssk...', '..khhhhhhhhsssssk...', '..khhhhhhhsssswesk..', '..khhhkhhhsssswesk..', '...khhhhhsssssSSk...', '....khhhkkksssk.....',
  '...krrrrrrrrrrrk....', '...kRRrrrrrrrrRk....', '....kbbbbbbbbbkss...', '...kbbbbbbbbbbbkss..', '...kBbbbbbbbbbbkk...', '...kyyyyyyyyyyyk....', '...kBbbbbbbbbbBk....', '....kBBbbbbbBBk.....'];
const CV_HERO = legs => spr([...CV_TOP, ...legs], CV_PAL);
const CV_RUN = [  // quatre images de course : grande foulée, passage, l'autre foulée, genou levé
  CV_HERO(['...kssk....kssk.....', '..kssk......kssk....', '.kppk........kppk...', '.kppk.........kppk..', '.kkkk..........kkkk.']),
  CV_HERO(['......ksssk.........', '......kssssk........', '.......kppk.........', '......kpppk.........', '......kkkkkk........']),
  CV_HERO(['....kssk..kssk......', '...kssk....kssk.....', '..kppk......kppk....', '..kppk.......kppk...', '.kkkk.........kkkk..']),
  CV_HERO(['......kssskssk......', '......kssk.ksk......', '......kppk.kppk.....', '.....kppk..kkkk.....', '.....kkkk...........'])];
const CV_JUMP = CV_HERO(['.....kssk.kssk......', '....kppk...kppk.....', '....kkkk....kppk....', '.............kkk....', '....................']);
const cvVar = (rows, pals) => pals.map(p => spr(rows, p));
const CV_SLIME_ROWS = ['......kkkk......', '....kkGGggkk....', '...kGGggggggk...', '..kGggggggggdk..', '.kgwwkgggggggdk.', '.kgwkkgggggggdk.', 'kgggggggggggggdk', 'kgkmmmkgggggggdk', 'kggkkkggggggggdk', 'kgggggggggggdddk', '.kddddddddddddk.', '..kkkkkkkkkkkk..'];
const CV_SLIME = cvVar(CV_SLIME_ROWS, [  // trois couleurs de gelée : verte, bleue, rose
  {k: '#0e1a0a', g: '#5ac84a', G: '#b8f0a0', d: '#2a8a2a', w: '#ffffff', m: '#c83a3a'},
  {k: '#0a101a', g: '#4a9ae8', G: '#b0d8ff', d: '#2a5aa8', w: '#ffffff', m: '#1a2a5a'},
  {k: '#1a0a12', g: '#e86aa8', G: '#ffc0dc', d: '#a83a6a', w: '#ffffff', m: '#5a1a2a'}]);
const CV_BAT_ROWS = [['k................k', 'kk..............kk', 'kpk.....kk.....kpk', 'kppk..kkppkk..kppk', 'kpppkkppppppkkpppk', '.kpppkwekpppkpppk.', '..kppkppppppkppk..', '...kkkppppppkkk...', '......kppppk......', '.......kkkk.......'],
  ['..................', '........kk........', '......kkppkk......', '.....kppppppk.....', '...kkkwekpppkkk...', '.kkppkppppppkppkk.', 'kpppkkppppppkkpppk', 'kppk..kppppk..kppk', 'kpk....kppk....kpk', 'kk......kk......kk']];
const CV_BAT_PALS = [{k: '#140a1a', p: '#8a4ac8', w: '#ffe84a', e: '#140a1a'}, {k: '#1a0a0a', p: '#c84a3a', w: '#ffe84a', e: '#1a0a0a'}];
const CV_BAT = CV_BAT_PALS.map(p => CV_BAT_ROWS.map(r => spr(r, p)));  // [couleur][battement]
const CV_GHOST = spr(['.....kkkkkk.....', '...kkwwwwwwkk...', '..kwwwwwwwwwwk..', '.kwwwwwwwwwwwwk.', '.kwwkkwwwkkwwwk.', '.kwwkkwwwkkwwwk.', '.kwwwwwwwwwwwwk.', '.kwwwwwkkwwwwwk.', '.kwwwwwwwwwwwwk.', '.kwwwwwwwwwwwwk.', '.kwkwwkwwkwwkwk.', '.kk.kk.kk.kk.kk.'], {k: '#1a2038', w: '#d8e8ff'});
const cvMob = (kind, i) => kind === 'air' ? (i % 5 === 4 ? CV_GHOST : CV_BAT[i % 2][Math.floor(rh.tick / 8 + i) % 2]) : CV_SLIME[i % 3];
const CV_BG = cnv(W, H, b => {  // le ciel du soir tramé, la lune et son halo, les montagnes au loin avec leurs crêtes (dessinés une fois)
  const sky = ['#1a1238', '#2a1a48', '#46225a', '#6a2a5a', '#9a3a58', '#c85a4a', '#e8884a'];
  for (let y = 0; y < CV.FLOOR; y++) { const f = y / (CV.FLOOR - 40) * (sky.length - 1), i = Math.min(sky.length - 1, Math.floor(f)); px(b, (f - i > .5 && y % 2) ? sky[Math.min(sky.length - 1, i + 1)] : sky[i], 0, y, W, 1); }
  for (let y = -16; y <= 16; y++) for (let x = -16; x <= 16; x++) { const d = Math.hypot(x, y); if (d >= 9 && d < 16 && (x + y) % 2 === 0) px(b, d < 12 ? '#4a3a6a' : '#3a2a5a', 250 + x, 40 + y); }
  for (let y = -9; y <= 9; y++) for (let x = -9; x <= 9; x++) { const d = Math.hypot(x, y); if (d < 9) px(b, Math.hypot(x - 3, y + 2) < 2.2 || Math.hypot(x + 3, y - 3) < 1.6 ? '#e0cc90' : Math.hypot(x + 3, y + 3) < 6 ? '#fff8d8' : '#f0e0a0', 250 + x, 40 + y); }
  for (let x = 0; x < W; x++) { const h = 40 + Math.round(Math.abs(Math.sin(x / 37)) * 22 + Math.sin(x / 13) * 4); px(b, '#3a1a3a', x, CV.FLOOR - h, 1, h); px(b, '#5a2a4a', x, CV.FLOOR - h, 1, 1); if (Math.cos(x / 37) * Math.sin(x / 37) > .2) px(b, '#4a2240', x, CV.FLOOR - h + 1, 1, 3); }
});
const CV_STARS = (() => { const r = seeded(4); return Array.from({length: 46}, () => [Math.floor(r() * W), Math.floor(r() * 80), Math.floor(r() * 60)]); })();
const CV_CLOUD = cnv(40, 12, b => {  // un nuage du soir, éclairé par-dessous
  for (const [cx, cy, rr] of [[10, 7, 5], [19, 5, 6], [29, 7, 5], [16, 8, 4], [24, 8, 4]]) for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) if (Math.hypot(x, y) <= rr) px(b, y > rr * .4 ? '#c86a6a' : y < -rr * .5 ? '#8a5a8a' : '#a85a78', cx + x, cy + y);
});
const CV_TREE = cnv(28, 44, b => {  // un arbre rond : tronc, feuillage en trois boules, lumière du couchant à droite
  px(b, '#140a10', 12, 22, 5, 22); px(b, '#3a1e1e', 13, 22, 3, 22); px(b, '#5a2e24', 15, 26, 1, 16);
  for (const [cx, cy, r] of [[14, 12, 11], [8, 19, 7], [20, 19, 7]]) for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const d = Math.hypot(x, y); if (d > r + .3) continue;
    px(b, d > r - 1 ? '#0e1a14' : (x - y > r * .8 && d > r * .5) ? '#4a6a3a' : (x + y + 64) % 4 === 0 && x > 0 ? '#2e4a30' : '#1e3a28', cx + x, cy + y);
  }
});
const CV_TUFT = [spr(['..k.....', '.kgk..k.', '.kgk.kgk', 'kgGgkgGk', 'kgggggGk'], {k: '#0e2a0e', g: '#3a8a2a', G: '#7ad85a'}),
  spr(['..rr....', '.rwwr...', '..rr..k.', '...k.kgk', '..kgkgGk'], {k: '#0e2a0e', g: '#3a8a2a', G: '#7ad85a', r: '#e8506a', w: '#ffe8a0'}),
  spr(['.yy.....', 'yooy....', '.yy..k..', '..k.kgk.', '.kgkgGgk'], {k: '#0e2a0e', g: '#3a8a2a', G: '#7ad85a', y: '#f8d84a', o: '#c8702a'})];
function cvScene(now, beat) {
  const bpm = rh.info?.bpm || 120, pxs = CV.PPB * bpm / 60, run = rh.mode === 'play' ? Math.max(0, now) * pxs : rh.tick;
  g.drawImage(CV_BG, 0, 0);
  for (const [x, y, ph] of CV_STARS) { const tw = (rh.tick + ph * 7) % 90; px(g, tw < 6 ? '#ffffff' : tw < 40 ? '#d8d0f8' : '#6a5a98', x, y); if (tw < 3) { px(g, '#ffffff', x - 1, y); px(g, '#ffffff', x + 1, y); px(g, '#ffffff', x, y - 1); px(g, '#ffffff', x, y + 1); } }
  for (let k = Math.floor(run * .08 / 110) - 1; ; k++) { const x = Math.round(k * 110 - run * .08); if (x > W) break; g.drawImage(CV_CLOUD, x, 22 + ((k * 37) % 3 + 3) % 3 * 14); }  // les nuages, très lents
  for (let x = -40; x < W + 40; x++) { const wx = x + run * .3, h = 18 + Math.round(Math.sin(wx / 29) * 7 + Math.sin(wx / 11) * 2); px(g, '#5a2a3a', x, CV.FLOOR - h, 1, h); px(g, '#7a3a48', x, CV.FLOOR - h, 1, 1); }  // les collines, plus lentes
  for (let k = Math.floor(run * .5 / 90) - 1; ; k++) { const x = Math.round(k * 90 - run * .5); if (x > W) break; g.drawImage(CV_TREE, x + 8, CV.FLOOR - 44); }  // les arbres
  px(g, '#1a0e0a', 0, CV.FLOOR - 1, W, 1); px(g, '#4aa83a', 0, CV.FLOOR, W, 3); px(g, '#7ad85a', 0, CV.FLOOR, W, 1); px(g, '#2a7a2a', 0, CV.FLOOR + 3, W, 1); px(g, '#6a4228', 0, CV.FLOOR + 4, W, H - CV.FLOOR - 4);  // le chemin, à la vitesse des monstres
  for (let k = Math.floor(run / 24) - 1; ; k++) { const x = Math.round(k * 24 - run); if (x > W) break; px(g, '#4a2c1a', x, CV.FLOOR + 8 + (k % 3) * 9, 6, 2); px(g, '#8a5a38', x, CV.FLOOR + 7 + (k % 3) * 9, 6, 1); px(g, '#8a5a38', x + 12, CV.FLOOR + 12 + (k % 2) * 11, 3, 1); }
  for (let k = Math.floor(run / 37) - 1; ; k++) { const x = Math.round(k * 37 - run); if (x > W) break; g.drawImage(CV_TUFT[((k % 3) + 3) % 3], x, CV.FLOOR - 4); }  // herbes et fleurs au bord du chemin
  for (let i = 0; i < 7; i++) {  // les lucioles, qui clignotent au rythme
    const fx = ((i * 53 - run * .4) % (W + 20) + W + 20) % (W + 20) - 10, fy = 120 + Math.sin(rh.tick / 30 + i * 2) * 18 + i * 6;
    if ((beat + i * .37) % 1 < .6) { px(g, '#fff8a0', fx, fy, 1, 1); g.globalAlpha = .35; px(g, '#f8e84a', fx - 1, fy - 1, 3, 3); g.globalAlpha = 1; }
  }
}
function cvHero(beat) {
  const air = rh.tick - rh.jumpAt < 14 || rh.held.air > 0, ground = CV.FLOOR - 23;
  const y = air ? CV.AY - 12 : ground - (rh.mode === 'play' && beat % 1 < .2 ? 1 : 0), x = CV.HX - 18;
  const hurt = rh.tick - rh.hurt < 16;
  if (hurt && rh.tick % 4 < 2) g.globalAlpha = .4;
  for (let i = 0; i < 9; i++) px(g, i % 3 === 2 ? '#a82a3a' : '#e83a4a', x + 3 - i, y + 10 + Math.round(Math.sin(rh.tick / 4 - i * .7) * (1 + i / 4)), 1, 2);  // l'écharpe qui flotte derrière
  g.drawImage(air ? CV_JUMP : CV_RUN[Math.floor(rh.tick / 5) % 4], x, y); g.globalAlpha = 1;
  if (air) for (let k = 0; k < 3; k++) px(g, 'rgba(255,240,200,.35)', x - 4 - k * 5, y + 8 + k * 3, 4, 1);  // le saut, en l'air
  else if (rh.mode === 'play' && rh.tick % 10 < 4) px(g, '#8a5a38', x + 2 - (rh.tick % 10), CV.FLOOR - 2, 2, 1);  // la poussière des pas
  const sw = rh.swing; if (sw && rh.tick - sw.at < 9) {  // le coup d'épée : la lame tendue et un croissant de lumière sur la voie frappée
    const sy = cvY(sw.kind), p = (rh.tick - sw.at) / 9, cx = CV.HX + 6;
    if (p < .5) { px(g, '#1a0e0a', x + 16, y + 12, 11, 3); px(g, '#e8f0ff', x + 17, y + 13, 9, 1); px(g, '#e8b84a', x + 15, y + 12, 2, 3); }
    g.globalAlpha = 1 - p;
    for (let a = -1.3; a <= 1.3; a += .06) { const r1 = 12 + p * 6, th = Math.round((1.4 - Math.abs(a)) * 3); for (let t = 0; t < th; t++) px(g, t === 0 ? '#ffffff' : '#ffd88a', cx + Math.cos(a) * (r1 - t), sy + Math.sin(a) * (r1 - t), 1, 1); }
    g.globalAlpha = 1;
  }
}
function cvTarget(kind, beat) {  // la cible d'une voie : quatre coins qui battent la mesure, un losange au centre, dorée quand on tient la touche
  const y = cvY(kind), cx = CV.HX + 14, on = rh.held?.[kind], pulse = rh.mode === 'play' ? Math.max(0, 1 - (beat % 1) * 4) : 0, r = 10 + Math.round(pulse * 2);
  const col = on ? '#ffd84a' : '#f8e8d0', dark = '#1a0e0a';
  if (on) { g.globalAlpha = .25; for (let d = -9; d <= 9; d++) px(g, '#ffd84a', cx - (9 - Math.abs(d)), y + d, (9 - Math.abs(d)) * 2 + 1, 1); g.globalAlpha = 1; }
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    px(g, dark, cx + sx * r - (sx > 0 ? 4 : 0), cy0(y, sy, r) - 1, 5, 3); px(g, dark, cx + sx * r - 1, cy0(y, sy, r) - (sy > 0 ? 4 : 0), 3, 5);
    px(g, col, cx + sx * r - (sx > 0 ? 3 : 0), cy0(y, sy, r), 4, 1); px(g, col, cx + sx * r, cy0(y, sy, r) - (sy > 0 ? 3 : 0), 1, 4);
  }
  for (let d = -3; d <= 3; d++) { const w = 3 - Math.abs(d); px(g, col, cx - w, y + d, 1, 1); px(g, col, cx + w, y + d, 1, 1); }
  pxFont(g, kind === 'air' ? 'J K' : 'F D', cx, kind === 'air' ? y + 24 : y - 16, 'rgba(255,240,220,.5)', 6, 'center');
}
const cy0 = (y, sy, r) => y + sy * r;
function cvLanes(now, beat) {
  const bpm = rh.info?.bpm || 120, pxs = CV.PPB * bpm / 60;
  for (const kind of ['air', 'sol']) cvTarget(kind, beat);
  for (const n of rh.notes) if (n.end && !(n.done && n.end < now - 1)) {  // les rubans dorés, avec des notes de musique
    const y = cvY(n.kind), x1 = Math.max(CV.HX + 14, CV.HX + 14 + (n.t - now) * pxs), x2 = CV.HX + 14 + (n.end - now) * pxs; if (x2 <= x1 || x1 > W + 10) continue;
    if (n.missed || n.broke) g.globalAlpha = .35;
    px(g, '#1a0e0a', x1, y - 4, x2 - x1, 9); px(g, '#ffd84a', x1, y - 3, x2 - x1, 7); px(g, '#fff0a0', x1, y - 3, x2 - x1, 2); px(g, '#c8902a', x1, y + 2, x2 - x1, 2);
    if (n.holding) for (let x = x1; x < Math.min(x2, x1 + 40); x += 4) if ((x + rh.tick) % 8 < 4) px(g, '#ffffff', x, y - 3, 2, 1);
    for (let t = Math.ceil(n.t * 4) / 4; t < n.end; t += .25) { const x = CV.HX + 14 + (t - now) * pxs; if (x > x1 + 4 && x < x2 - 2) { px(g, '#8a5a18', x, y - 3, 1, 5); px(g, '#8a5a18', x - 2, y + 1, 3, 2); } }
    g.globalAlpha = 1;
  }
  for (let i = rh.notes.length - 1; i >= 0; i--) {  // les monstres, les plus lointains d'abord, avec leur ombre
    const n = rh.notes[i]; if (n.judged && !n.missed) continue; if (n.end && n.missed) continue;
    const x = Math.round(CV.HX + 14 + (n.t - now) * pxs); if (x > W + 16 || x < -20) continue;
    const ago = now - n.t; if (n.missed && ago > .6) continue;
    if (n.missed) g.globalAlpha = Math.max(0, 1 - ago / .6);
    px(g, 'rgba(26,14,10,.35)', x - 6, CV.FLOOR - 1, 12, 2);
    const s = cvMob(n.kind, i);
    if (n.kind === 'air') g.drawImage(s, x - Math.floor(s.width / 2), CV.AY - 5 + Math.round(Math.sin(rh.tick / 6 + i) * 2));
    else { const sq = Math.floor(rh.tick / 10 + i) % 2; g.drawImage(s, 0, 0, 16, 12, x - 8 - sq, CV.FLOOR - 12 + sq, 16 + sq * 2, 12 - sq); }  // la gelée s'écrase et rebondit
    g.globalAlpha = 1;
  }
  for (const f of rh.fx) if (f.k === 'fly') {  // un monstre frappé s'envole en tournant, après un éclat en étoile
    const p = f.t / 30, x = CV.HX + 18 + p * 160, y = f.y - Math.sin(p * Math.PI) * 50 - p * 40;
    if (f.t < 6) { const r = 4 + f.t * 3, c = f.t < 3 ? '#ffffff' : '#ffd84a'; px(g, c, CV.HX + 14 - r, f.y, r * 2, 1); px(g, c, CV.HX + 14, f.y - r, 1, r * 2); for (let d = 0; d < r * .7; d++) { px(g, c, CV.HX + 14 + d, f.y + d); px(g, c, CV.HX + 14 - d, f.y + d); px(g, c, CV.HX + 14 + d, f.y - d); px(g, c, CV.HX + 14 - d, f.y - d); } }
    g.save(); g.globalAlpha = 1 - p; g.translate(Math.round(x), Math.round(y)); g.rotate(p * 8); g.drawImage(f.kind === 'air' ? CV_BAT[0][0] : CV_SLIME[0], -8, -6); g.restore();
  }
  for (const s of rh.sparks) { g.globalAlpha = s.life / 18; px(g, s.col, s.x, s.y, 2, 2); if (s.life > 12) px(g, '#ffffff', s.x, s.y, 1, 1); g.globalAlpha = 1; }
  if (rh.judge && rh.mode === 'play') { const j = rh.judge, up = Math.max(0, j.t - 18); pxFont(g, j.text, CV.HX + 15, j.y - 15 - up, '#1a0e0a', 6, 'center'); pxFont(g, j.text, CV.HX + 14, j.y - 16 - up, j.col, 6, 'center'); }
}
function cvDraw() {
  const now = rhNow(), bpm = rh.info?.bpm || 120, beat = rh.mode === 'play' ? Math.max(0, now) * bpm / 60 : rh.tick / 40;
  cvScene(now, beat); cvLanes(now, beat); cvHero(beat);
  if (rh.mode !== 'ready' && rh.mode !== 'load') {
    rhProgress(now, '#ffb84a'); pxFont(g, String(rh.score).padStart(7, '0'), 4, 14, '#ffffff', 7);
    if (rh.combo > 4) pxFont(g, rh.combo + ' combo', W - 4, 14, '#ffd84a', 7, 'right');
    pxFont(g, rhStarTxt(rh.stars), W / 2, H - 6, '#c8a088', 6, 'center');
  }
  if (rh.mode === 'play' && now < 0) pxFont(g, String(Math.ceil(-now)), W / 2, 70, '#ffd84a', 16, 'center');
  rhScreens(60);
  if (rh.tick % 15 === 0) cv.setAttribute('aria-label', 'Cavale, ' + (rh.info?.name || '') + ' : ' + ({ready: 'prêt', load: 'chargement', play: 'en jeu', pause: 'pause', over: 'fini'}[rh.mode] || rh.mode) + ', score ' + rh.score + ', combo ' + rh.combo + ', ' +
    Object.entries(rh.counts).map(([k, v]) => k.toLowerCase() + ' ' + v).join(', ') + ', ruban ' + (rh.holds || 0) + '.');
}
// la souris ou le doigt : moitié haute = air, moitié basse = sol (relâcher compte pour les rubans)
const cvPtr = new Map();
cv.onpointerdown = e => { e.preventDefault(); if (!rh) return; const [, y] = cpos(e); if (rh.mode === 'play') { const k = y < (CV.AY + CV.GY) / 2 ? 'air' : 'sol'; cvPtr.set(e.pointerId, k); cvHit(k); } else rhPress(); };
cv.onpointerup = cv.onpointercancel = e => { const k = cvPtr.get(e.pointerId); if (k) { cvPtr.delete(e.pointerId); cvUp(k); } };
const CV_KEYS = {j: 'air', k: 'air', ArrowUp: 'air', f: 'sol', d: 'sol', ArrowDown: 'sol'};
document.addEventListener('keydown', e => {
  if (!keyOk(e) || !rh) return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (rh.mode === 'play' && CV_KEYS[k]) { e.preventDefault(); if (!e.repeat) cvHit(CV_KEYS[k]); return; }
  if (k === ' ' || k === 'Enter') { e.preventDefault(); if (!e.repeat) rhPress(); }
  if (k === 'p' || k === 'Escape') rhPause();
});
document.addEventListener('keyup', e => {
  if (e.key === ' ' && keyOk(e)) e.preventDefault();  // un bouton qui garderait le focus ne se déclenche pas à l'espace
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (CV_KEYS[k]) cvUp(CV_KEYS[k]);
});
addEventListener('blur', () => { if (rh?.held) rh.held = {air: 0, sol: 0}; });  // une touche lâchée hors de la fenêtre ne reste pas « tenue »
{  // vérification : chaque difficulté donne des monstres en l'air et au sol, des doublés et des rubans ; le jugement (bonne voie, mauvaise voie, ruban tenu puis lâché)
  const c = rhCompose(RH_SONGS[3]), ch = Object.keys(RH_DIFFS).map(d => RHG.chart(rhChart(c, d), c, d)), bad = [];
  if (!ch.every(x => x.some(n => n.kind === 'air') && x.some(n => n.kind === 'sol'))) bad.push('voies');
  if (!ch.some(x => x.some((n, i) => i && Math.abs(n.t - x[i - 1].t) < .01)) || !ch.some(x => x.some(n => n.end))) bad.push('doublés ou rubans');
  if (!(rhStars(ch[0], c.len, 1) < rhStars(ch[3], c.len, 1))) bad.push('étoiles');
  if (ch.some(x => x.some((n, i) => i && n.t < x[i - 1].t - .001))) bad.push('ordre');
  const keep = rh;
  rh = {tick: 0, mode: 'play', score: 0, combo: 0, maxCombo: 0, counts: {PARFAIT: 0, BIEN: 0, OK: 0, 'RATÉ': 0}, dts: [], fx: [], sparks: [], held: {air: 0, sol: 0}, holds: 0,
    notes: [{t: 1, kind: 'air'}, {t: 1, kind: 'sol'}, {t: 2, kind: 'air'}, {t: 3, kind: 'sol', end: 4, ticks: 0}].map(n => ({...n, judged: false}))};
  cvHit('air', 1.01); cvHit('sol', 1.02); cvHit('sol', 2); cvHit('sol', 3.02);
  const n3 = rh.notes[3]; cvStep(3.25); cvStep(3.5); cvUp('sol', 3.55); cvUp('sol', 3.55); cvUp('sol', 3.55); cvStep(3.7);
  if (rh.counts.PARFAIT !== 3 || !rh.notes[2].missed || !n3.broke || n3.ticks !== 5) bad.push('jugement ' + JSON.stringify(rh.counts) + ' ' + n3.ticks);
  rh = keep;
  console.assert(!bad.length, 'cavale', bad);
}
ctx.onOpen(() => rhOpen());
}
