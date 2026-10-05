/* AXELAB · Chord diagrams (SVG). Click a diagram to hear it. */
const Diagram = (function () {
  'use strict';
  const T = Theory, NS = 'http://www.w3.org/2000/svg';
  const DEG_COLOR = { '1': '#b8860b', '3': '#1a6faa', '5': '#2d7a4a', '7': '#6040a0', x: '#b83232' };
  function el(t, a, p) { const e = document.createElementNS(NS, t); Object.keys(a || {}).forEach(function (k) { e.setAttribute(k, a[k]); }); if (p) p.appendChild(e); return e; }
  function degKey(d) { const n = +d.replace(/[b#]/g, ''); return n === 1 ? '1' : (n === 3 || n === 2 || n === 4) ? '3' : n === 5 ? '5' : (n === 7 || n === 6) ? '7' : 'x'; }

  function svg(v, opts) {
    opts = opts || {};
    const tuning = opts.tuning || Guitar.STD;
    const fr = v.notes.map(function (n) { return n.f; });
    const fretted = fr.filter(function (f) { return f > 0; });
    const lo = fretted.length ? Math.min.apply(null, fretted) : 1;
    const hi = fretted.length ? Math.max.apply(null, fretted) : 1;
    const base = hi <= 4 ? 1 : lo;
    const nF = Math.max(4, hi - base + 1);
    const W = 104, sx = 18, sp = 14, top = 30, fh = 18;
    const H = top + nF * fh + 22;
    const s = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, class: 'chordsvg', role: 'img' });
    const cq = T.CHORDS[v.q] || T.CHORDS[''];
    // grid
    for (let i = 0; i <= nF; i++) el('line', { x1: sx, x2: sx + 5 * sp, y1: top + i * fh, y2: top + i * fh, class: i === 0 && base === 1 ? 'cd-nut' : 'cd-fret' }, s);
    for (let i = 0; i < 6; i++) el('line', { x1: sx + i * sp, x2: sx + i * sp, y1: top, y2: top + nF * fh, class: 'cd-str' }, s);
    if (base > 1) el('text', { x: sx - 5, y: top + fh * 0.7, 'text-anchor': 'end', class: 'cd-pos' }, s).textContent = base + 'fr';
    // muted / open markers
    for (let i = 0; i < 6; i++) {
      const n = v.notes.find(function (x) { return x.s === i; });
      const x = sx + i * sp;
      if (!n) el('text', { x: x, y: top - 8, 'text-anchor': 'middle', class: 'cd-mark' }, s).textContent = '×';
      else if (n.f === 0) el('circle', { cx: x, cy: top - 12, r: 4, class: 'cd-open' }, s);
    }
    // barre
    const atLo = v.notes.filter(function (n) { return n.f === lo && n.f > 0; });
    if (atLo.length >= 3) {
      const ss = atLo.map(function (n) { return n.s; });
      const a = Math.min.apply(null, ss), b = Math.max.apply(null, ss);
      const between = v.notes.filter(function (n) { return n.s > a && n.s < b; }).every(function (n) { return n.f >= lo; });
      if (between && b - a >= 2) el('rect', { x: sx + a * sp - 6, y: top + (lo - base) * fh + fh / 2 - 6, width: (b - a) * sp + 12, height: 12, rx: 6, class: 'cd-barre' }, s);
    }
    v.notes.forEach(function (n) {
      if (n.f === 0) return;
      const x = sx + n.s * sp, y = top + (n.f - base) * fh + fh / 2;
      const pc = T.mod12(tuning[n.s] + n.f);
      const di = cq.ivs.indexOf(T.mod12(pc - v.rootPc));
      const deg = di >= 0 ? cq.degs[di] : '?';
      el('circle', { cx: x, cy: y, r: 6.3, fill: DEG_COLOR[degKey(deg)], class: 'cd-dot' }, s);
      const t = el('text', { x: x, y: y + 3, 'text-anchor': 'middle', class: 'cd-lbl' }, s);
      t.textContent = opts.names ? T.pretty(T.FLATS[pc]).replace('♭', '♭') : (deg === '1' ? 'R' : T.pretty(deg));
    });
    // open-string degree labels under the grid
    v.notes.forEach(function (n) {
      if (n.f !== 0) return;
      const pc = T.mod12(tuning[n.s]);
      const di = cq.ivs.indexOf(T.mod12(pc - v.rootPc));
      const deg = di >= 0 ? cq.degs[di] : '';
      el('text', { x: sx + n.s * sp, y: H - 6, 'text-anchor': 'middle', class: 'cd-under' }, s).textContent = deg === '1' ? 'R' : T.pretty(deg);
    });
    return s;
  }

  function play(v, tuning) {
    Sound.ensure().then(function () {
      const notes = v.notes.map(function (n) { return { midi: (tuning || Guitar.STD)[n.s] + n.f }; }).sort(function (a, b) { return a.midi - b.midi; });
      Sound.setLeadTone('clean');
      Sound.strum(notes, Sound.now() + 0.03, { ch: 'lead', vel: 0.75, dur: 2.2, type: 'clean', spread: 0.022 });
    });
  }

  /** A labelled, clickable diagram tile. */
  function tile(sym, v, opts) {
    opts = opts || {};
    const wrap = document.createElement('button');
    wrap.type = 'button';
    wrap.className = 'chordtile';
    wrap.title = 'Play ' + sym;
    const name = document.createElement('div'); name.className = 'ctname'; name.textContent = sym;
    wrap.appendChild(name);
    if (v) wrap.appendChild(svg(v, opts)); else { const n = document.createElement('div'); n.className = 'ctnone'; n.textContent = 'no shape'; wrap.appendChild(n); }
    if (opts.sub) { const sb = document.createElement('div'); sb.className = 'ctsub'; sb.textContent = opts.sub; wrap.appendChild(sb); }
    wrap.addEventListener('click', function () { if (v) play(v, opts.tuning); if (opts.onClick) opts.onClick(v); });
    return wrap;
  }

  /** Render diagrams for "C Am F G7" (supports @E/@A/@C/@G/@D shape suffixes). */
  function mountList(host, list, opts) {
    opts = opts || {};
    host.innerHTML = '';
    host.classList.add('chordrow');
    list.trim().split(/\s+/).forEach(function (sym) {
      const p = UI.parseChord(sym);
      if (!p) return;
      let v = null;
      if (p.shape) v = Guitar.shapeVoicing(p.rootPc, p.q, p.shape);
      else if (opts.open) v = Guitar.voicings(p.rootPc, p.q)[0];
      else v = Guitar.chooseVoicing(p.rootPc, p.q, { zone: 3, minStrings: 4 });
      const label = T.chordLabel(p.root, p.q) + (p.shape ? ' (' + p.shape + ' shape)' : '');
      host.appendChild(tile(label, v, opts));
    });
  }
  function upgradeAll(root) {
    (root || document).querySelectorAll('[data-chords]:not(.chordrow)').forEach(function (n) { mountList(n, n.getAttribute('data-chords'), { open: n.hasAttribute('data-open') }); });
  }
  return { svg, tile, play, mountList, upgradeAll, DEG_COLOR };
})();
