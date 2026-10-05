/* AXELAB · Theory: scales, chords, harmony, circle of fifths, intervals, modes. */
const TheoryPanel = (function () {
  'use strict';
  const T = Theory, h = UI.h;
  let root, body, sub = 'scales';
  const TS = Object.assign({ key: 0, scale: 'ionian', fam: 'Major modes', chordRoot: 0, chordQ: 'maj7', hKey: 0, hMode: 'ionian', hSev: true, modeRoot: 0, modeView: 'parallel', cof: 0 }, UI.store.get('theory', {}));
  function save() { UI.store.set('theory', TS); }

  function subnav() {
    const nav = h('div.subnav', { role: 'tablist' });
    [['scales', 'Scales'], ['chords', 'Chords'], ['harmony', 'Harmony'], ['circle', 'Keys & Circle'], ['intervals', 'Intervals'], ['modes', 'Modes']].forEach(function (s) {
      const b = h('button', { type: 'button', role: 'tab', text: s[1] });
      b.classList.toggle('on', s[0] === sub);
      b.addEventListener('click', function () { go(s[0]); });
      nav.appendChild(b);
    });
    return nav;
  }
  function go(s) {
    sub = s; Tab.stop();
    root.innerHTML = ''; root.appendChild(subnav());
    body = h('div'); root.appendChild(body);
    ({ scales: scales, chords: chords, harmony: harmony, circle: circle, intervals: intervals, modes: modes })[s]();
    try { history.replaceState(null, '', '#theory/' + s); } catch (e) { /* ignore */ }
  }
  function strumChord(rootPc, q) { Band.previewChord({ rootPc: rootPc, q: q }); }
  function arpeggio(rootPc, q) {
    App.audio().then(function () {
      const ivs = (T.CHORDS[q] || T.CHORDS['']).ivs;
      const base = 48 + rootPc;
      const notes = ivs.map(function (v) { return base + v; }).concat([base + 12]);
      const t0 = Sound.now() + 0.05;
      notes.forEach(function (m, i) { Sound.pluck(m, t0 + i * 0.22, { ch: 'lead', vel: 0.75, dur: 1.2, type: 'clean' }); });
    });
  }

  /* ── Scales ───────────────────────────────────────── */
  function scales() {
    const famSeg = h('div.row.tight', ['All'].concat(T.SCALE_FAMILIES).map(function (f) {
      const b = h('button.tog' + ((TS.fam === f) ? '.on' : ''), { type: 'button', text: f });
      b.addEventListener('click', function () { TS.fam = f; save(); go('scales'); });
      return b;
    }));
    const list = h('div.slist');
    Object.keys(T.SCALES).filter(function (id) { return TS.fam === 'All' || T.SCALES[id].fam === TS.fam; }).forEach(function (id) {
      const s = T.SCALES[id];
      const b = h('button' + (TS.scale === id ? '.on' : ''), { type: 'button' }, h('b', s.name), h('small', T.pretty(s.formula)));
      b.addEventListener('click', function () { TS.scale = id; save(); detail(); UI.$$('button', list).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); });
      list.appendChild(b);
    });
    const det = h('div');
    const keySel = UI.rootSelect(TS.key, function (v) { TS.key = v; save(); detail(); });
    body.appendChild(UI.card('Scale library · ' + Object.keys(T.SCALES).length + ' scales', [famSeg, h('div', { style: { height: '10px' } }), list]));
    body.appendChild(UI.card('Details', [h('div.row', { style: { marginBottom: '10px' } }, UI.field('Root', keySel)), det]));
    function detail() {
      const s = T.scale(TS.scale);
      const rn = T.rootName(TS.key, TS.scale);
      const notes = T.scaleNotes(rn, TS.scale);
      det.innerHTML = '';
      det.appendChild(h('h3', { style: { fontFamily: 'Bebas Neue, sans-serif', fontWeight: 400, fontSize: '28px', color: 'var(--accent)' } }, T.pretty(rn) + ' ' + s.name));
      det.appendChild(h('div.notes-row', notes.map(function (n, i) { return h('div.note-chip' + (s.char.indexOf(s.degs[i]) >= 0 && s.degs[i] !== '1' ? '.chr' : ''), h('b', T.pretty(n)), h('small', T.pretty(s.degs[i]))); })));
      // comparison with major / minor
      const ref = s.minorish ? T.SCALES.aeolian : T.SCALES.ionian;
      const diff = s.degs.filter(function (d) { return ref.degs.indexOf(d) < 0; });
      det.appendChild(h('div.scaleinfo', { style: { marginTop: '12px' } }, h('dl',
        h('dt', 'Formula'), h('dd', T.pretty(s.formula)), h('dt', 'Steps'), h('dd', s.steps),
        h('dt', 'Compared to'), h('dd', (s.minorish ? 'Natural minor' : 'Major') + ': ' + (diff.length ? diff.map(T.pretty).join(', ') : 'identical') + (s.ivs.length !== 7 ? ' (' + s.ivs.length + ' notes)' : '')),
        h('dt', 'Sound'), h('dd', s.mood), h('dt', 'Used in'), h('dd', s.use), h('dt', 'Fits'), h('dd', T.pretty(s.fits || '')), h('dt', 'Family'), h('dd', s.parent || s.fam))));
      det.appendChild(h('div.row', { style: { marginTop: '12px' } },
        h('button.btn.primary', { type: 'button', text: '▶ Hear', onclick: function () { App.playScale(TS.key, TS.scale); } }),
        h('button.btn', { type: 'button', text: 'Open in Neck', onclick: function () { NeckPanel.open({ key: TS.key, scale: TS.scale }); } })));
      const n = h('div.neckw', { 'data-neck': JSON.stringify({ key: TS.key, scale: TS.scale, labels: 'degrees', frets: 15 }) });
      det.appendChild(n); App.upgrade(det);
    }
    detail();
  }

  /* ── Chords ───────────────────────────────────────── */
  function chords() {
    const rootSel = UI.rootSelect(TS.chordRoot, function (v) { TS.chordRoot = v; save(); draw(); });
    const fams = ['Triads', 'Sixths & sevenths', 'Extended', 'Altered'];
    const qSel = UI.options(h('select', { 'aria-label': 'Chord quality' }), fams.map(function (f) {
      return { group: f, items: Object.keys(T.CHORDS).filter(function (q) { return T.CHORDS[q].fam === f; }).map(function (q) { return { value: q, label: (q || 'maj') + ' · ' + T.CHORDS[q].name }; }) };
    }), TS.chordQ);
    qSel.addEventListener('change', function () { TS.chordQ = qSel.value; save(); draw(); });
    const out = h('div');
    body.appendChild(UI.card('Chord builder', [h('div.fields', UI.field('Root', rootSel), UI.field('Quality', qSel)), out]));
    function draw() {
      const q = TS.chordQ, ch = T.CHORDS[q];
      const rn = T.rootName(TS.chordRoot, ch.degs.indexOf('b3') >= 0 ? 'aeolian' : 'ionian');
      const notes = T.chordNotes(rn, q);
      out.innerHTML = '';
      out.appendChild(h('h3', { style: { fontFamily: 'Bebas Neue, sans-serif', fontWeight: 400, fontSize: '34px', color: 'var(--accent)', marginTop: '12px' } }, T.chordLabel(rn, q)));
      out.appendChild(h('div.notes-row', notes.map(function (n, i) { return h('div.note-chip', h('b', T.pretty(n)), h('small', T.pretty(ch.degs[i]))); })));
      out.appendChild(h('p.small.muted', { style: { marginTop: '8px' } }, ch.name + ' · formula ' + T.pretty(ch.degs.join(' ')) + ' · semitones ' + ch.ivs.join('-')));
      out.appendChild(h('div.row', { style: { marginTop: '8px' } },
        h('button.btn.primary', { type: 'button', text: '▶ Strum', onclick: function () { strumChord(TS.chordRoot, q); } }),
        h('button.btn', { type: 'button', text: '▶ Arpeggio', onclick: function () { arpeggio(TS.chordRoot, q); } })));
      out.appendChild(h('h5.flabel', { style: { margin: '14px 0 4px' } }, 'Voicings (tap to hear)'));
      const row = h('div.chordrow');
      const vs = Guitar.voicings(TS.chordRoot, q);
      vs.forEach(function (v) { row.appendChild(Diagram.tile(v.shape + (v.shape.length === 1 ? ' shape' : '') + ' · fret ' + (v.lo || 0), v)); });
      if (!vs.length) row.appendChild(h('p.muted', 'No standard voicing.'));
      out.appendChild(row);
      // Scales that contain this chord (same root)
      const pcs = T.chordPcs(TS.chordRoot, q);
      const fits = Object.keys(T.SCALES).filter(function (id) {
        const sp = T.scalePcs(TS.chordRoot, id);
        return id !== 'chromatic' && pcs.every(function (p) { return sp.indexOf(p) >= 0; });
      });
      out.appendChild(h('h5.flabel', { style: { margin: '14px 0 6px' } }, 'Scales from the same root that contain every chord tone'));
      out.appendChild(h('div.row.tight', fits.slice(0, 16).map(function (id) {
        return h('button.tog', { type: 'button', text: T.pretty(T.rootName(TS.chordRoot, id)) + ' ' + T.SCALES[id].name, onclick: function () { NeckPanel.open({ key: TS.chordRoot, scale: id }); } });
      })));
    }
    draw();
  }

  /* ── Harmony ──────────────────────────────────────── */
  function harmony() {
    const keySel = UI.rootSelect(TS.hKey, function (v) { TS.hKey = v; save(); draw(); });
    const modeSel = UI.options(h('select'), ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian', 'harmonic_minor', 'melodic_minor'].map(function (id) { return { value: id, label: T.SCALES[id].name }; }), TS.hMode);
    modeSel.addEventListener('change', function () { TS.hMode = modeSel.value; save(); draw(); });
    const sev = UI.seg([[false, 'Triads'], [true, '7th chords']], TS.hSev, function (v) { TS.hSev = v; save(); draw(); });
    const out = h('div');
    body.appendChild(UI.card('Diatonic harmony', [h('div.fields', UI.field('Key', keySel), UI.field('Scale / mode', modeSel)), h('div.row', { style: { margin: '10px 0' } }, sev), out]));
    const progOut = h('div');
    body.appendChild(UI.card('Progressions to try in this key', progOut));
    function draw() {
      const rn = T.rootName(TS.hKey, TS.hMode);
      const harm = T.harmonize(rn, TS.hMode, TS.hSev);
      out.innerHTML = '';
      const tbl = h('table.harm-tbl', h('tr', h('th', 'Degree'), h('th', 'Chord'), h('th', 'Notes'), h('th', 'Function'), h('th', 'Chord scale'), h('th', '')));
      harm.forEach(function (c) {
        tbl.appendChild(h('tr',
          h('td.rn', T.pretty(c.roman)), h('td.sym', T.chordLabel(c.root, c.q)),
          h('td.small', T.chordNotes(c.root, c.q).map(T.pretty).join(' ')), h('td.small', c.func),
          h('td.small', T.pretty(c.root) + ' ' + (c.mode ? T.SCALES[c.mode].name : '')),
          h('td', h('button.btn.small', { type: 'button', text: '▶', 'aria-label': 'Play', onclick: function () { strumChord(c.rootPc, c.q); } }))));
      });
      out.appendChild(h('div', { style: { overflowX: 'auto' } }, tbl));
      out.appendChild(h('p.cap', { style: { marginTop: '8px' } }, 'Each chord’s scale has the same notes as ' + T.pretty(rn) + ' ' + T.SCALES[TS.hMode].name + ', centered on that chord’s root.'));
      progOut.innerHTML = '';
      const fit = T.PROGRESSIONS.filter(function (p) { return p.mode === TS.hMode || (TS.hMode === 'aeolian' && p.mode === 'harmonic_minor'); });
      if (!fit.length) progOut.appendChild(h('p.muted.small', 'No built-in progressions use this mode as home. Build one in Jam → Build your own progression.'));
      progOut.appendChild(h('div.row.tight', fit.map(function (p) {
        const r = T.resolveProgression(p.steps, TS.hKey, p.mode);
        const names = r.chords.map(function (c) { return T.chordLabel(c.root, c.q); }).filter(function (v, i, a) { return i === 0 || v !== a[i - 1]; }).slice(0, 8).join(' – ');
        return h('button.btn.jam', { type: 'button', title: p.desc, onclick: function () { App.loadJam({ prog: p.id, key: TS.hKey, style: p.style, scale: p.over[0], bpm: p.bpm }); } }, '▶ ' + p.name + ': ' + names);
      })));
    }
    draw();
  }

  /* ── Circle of fifths ─────────────────────────────── */
  function circle() {
    const wrap = h('div.circle-wrap');
    const info = h('div');
    body.appendChild(h('div.grid2', UI.card('Circle of fifths', [wrap, h('p.cap', { style: { textAlign: 'center' } }, 'Outer ring: major keys. Inner ring: relative minors. Tap a key.')]), UI.card('Key details', info)));
    const NS = 'http://www.w3.org/2000/svg';
    function el(t, a, p) { const e = document.createElementNS(NS, t); Object.keys(a).forEach(function (k) { e.setAttribute(k, a[k]); }); if (p) p.appendChild(e); return e; }
    function arc(cx, cy, r1, r2, a0, a1) {
      const p = function (r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
      const A = p(r2, a0), B = p(r2, a1), C = p(r1, a1), D = p(r1, a0);
      return 'M' + A + ' A' + r2 + ' ' + r2 + ' 0 0 1 ' + B + ' L' + C + ' A' + r1 + ' ' + r1 + ' 0 0 0 ' + D + 'Z';
    }
    function draw() {
      wrap.innerHTML = '';
      const svg = el('svg', { viewBox: '0 0 400 400', role: 'img', 'aria-label': 'Circle of fifths' });
      const sel = TS.cof;
      const css = getComputedStyle(document.documentElement);
      const acc = css.getPropertyValue('--accent').trim(), bg3 = css.getPropertyValue('--bg3').trim(), bg4 = css.getPropertyValue('--bg4').trim(), txt = css.getPropertyValue('--text').trim(), blue = css.getPropertyValue('--accent3').trim();
      for (let i = 0; i < 12; i++) {
        const a0 = (i - 0.5) / 12 * Math.PI * 2 - Math.PI / 2, a1 = (i + 0.5) / 12 * Math.PI * 2 - Math.PI / 2;
        const rel = ((i - sel) % 12 + 12) % 12;
        const near = rel === 0 ? 'self' : (rel === 1 || rel === 11) ? 'near' : null;
        [[110, 190, 'maj'], [62, 108, 'min']].forEach(function (ring) {
          const g = el('g', { class: 'cof-seg', tabindex: 0, role: 'button', 'aria-label': ring[2] === 'maj' ? T.CIRCLE_MAJOR[i] + ' major' : T.CIRCLE_MINOR[i] + ' minor' }, svg);
          const fill = near === 'self' ? (ring[2] === 'maj' ? acc : blue) : near ? bg4 : bg3;
          el('path', { d: arc(200, 200, ring[0], ring[1], a0, a1), fill: fill }, g);
          const am = (a0 + a1) / 2, rr = (ring[0] + ring[1]) / 2;
          const t = el('text', { x: 200 + rr * Math.cos(am), y: 200 + rr * Math.sin(am) + (ring[2] === 'maj' ? 7 : 5), 'text-anchor': 'middle',
            style: 'font: ' + (ring[2] === 'maj' ? '400 22px Bebas Neue' : '600 13px Barlow') + ', sans-serif; fill:' + (near === 'self' ? '#fff' : txt) }, g);
          t.textContent = T.pretty(ring[2] === 'maj' ? T.CIRCLE_MAJOR[i] : T.CIRCLE_MINOR[i] + 'm');
          const pick = function () { TS.cof = i; save(); draw(); };
          g.addEventListener('click', pick);
          g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
        });
        const am = i / 12 * Math.PI * 2 - Math.PI / 2;
        const s = el('text', { x: 200 + 197 * Math.cos(am) * 0.985, y: 200 + 197 * Math.sin(am) * 0.985 + 4, 'text-anchor': 'middle', style: 'font: 600 9px Barlow, sans-serif; fill:' + css.getPropertyValue('--muted').trim() }, svg);
        s.textContent = T.CIRCLE_SIG[i].replace(' / 6♭', '');
      }
      wrap.appendChild(svg);
      const pc = T.CIRCLE[sel];
      const maj = T.CIRCLE_MAJOR[sel], min = T.CIRCLE_MINOR[sel];
      const harm = T.harmonize(maj, 'ionian', false);
      info.innerHTML = '';
      info.appendChild(h('h3', { style: { fontFamily: 'Bebas Neue, sans-serif', fontWeight: 400, fontSize: '32px', color: 'var(--accent)' } }, T.pretty(maj) + ' major / ' + T.pretty(min) + ' minor'));
      info.appendChild(h('p.small.muted', 'Key signature: ' + T.CIRCLE_SIG[sel] + (T.CIRCLE_SIG[sel] === '0' ? ' (no sharps or flats)' : '')));
      info.appendChild(h('div.notes-row', { style: { margin: '10px 0' } }, T.scaleNotes(maj, 'ionian').map(function (n, i) { return h('div.note-chip', h('b', T.pretty(n)), h('small', String(i + 1))); })));
      info.appendChild(h('h5.flabel', { style: { margin: '10px 0 6px' } }, 'Chords (tap to hear)'));
      info.appendChild(h('div.dia-row', harm.map(function (c) {
        return h('button.dia-btn', { type: 'button', onclick: function () { strumChord(c.rootPc, c.q); } }, h('div.r', T.pretty(c.roman)), h('div.s', T.chordLabel(c.root, c.q)));
      })));
      info.appendChild(h('div.scaleinfo', { style: { marginTop: '12px' } }, h('dl',
        h('dt', 'IV (left)'), h('dd', T.pretty(T.CIRCLE_MAJOR[(sel + 11) % 12]) + ' major: one fewer sharp / one more flat'),
        h('dt', 'V (right)'), h('dd', T.pretty(T.CIRCLE_MAJOR[(sel + 1) % 12]) + ' major: one more sharp / one fewer flat'),
        h('dt', 'Relative minor'), h('dd', T.pretty(min) + ' minor: same notes, starts on the 6th'))));
      info.appendChild(h('div.row', { style: { marginTop: '12px' } },
        h('button.btn.primary', { type: 'button', text: 'Jam in ' + T.pretty(maj), onclick: function () { App.loadJam({ prog: 'pop_axis', key: pc, style: 'pop', scale: 'ionian', bpm: 100 }); } }),
        h('button.btn', { type: 'button', text: 'Jam in ' + T.pretty(min) + 'm', onclick: function () { App.loadJam({ prog: 'aeolian_rock', key: T.mod12(pc + 9), style: 'rock', scale: 'pentatonic_minor', bpm: 110 }); } })));
    }
    draw();
    App.on('theme', function () { if (sub === 'circle') draw(); });
  }

  /* ── Intervals ────────────────────────────────────── */
  function intervals() {
    const grid = h('div.ivgrid');
    T.INTERVALS.forEach(function (iv) {
      const b = h('button.ivc', { type: 'button', title: 'Play' },
        h('div.iv-d', T.pretty(iv.deg)), h('div.iv-n', iv.name + ' · ' + iv.semis + (iv.semis === 1 ? ' fret' : ' frets')),
        h('div.iv-s', iv.sound), h('div.iv-s', '↑ ' + iv.up), h('div.iv-s', '↓ ' + iv.down), h('div.iv-s', { style: { marginTop: '4px', fontStyle: 'italic' } }, iv.shape));
      b.addEventListener('click', function () {
        App.audio().then(function () {
          const t = Sound.now() + 0.05, base = 57;
          Sound.pluck(base, t, { ch: 'lead', vel: 0.8, dur: 0.6, type: 'clean' });
          Sound.pluck(base + iv.semis, t + 0.6, { ch: 'lead', vel: 0.8, dur: 0.6, type: 'clean' });
          Sound.pluck(base, t + 1.3, { ch: 'lead', vel: 0.7, dur: 1.2, type: 'clean' });
          Sound.pluck(base + iv.semis, t + 1.3, { ch: 'lead', vel: 0.7, dur: 1.2, type: 'clean' });
        });
      });
      grid.appendChild(b);
    });
    body.appendChild(UI.card('Intervals · tap to hear (melodic, then together)', [grid, h('p.cap', { style: { marginTop: '10px' } }, 'Song references are memory hooks for the first two notes. Train recognition in the Ear tab.')]));
  }

  /* ── Modes ────────────────────────────────────────── */
  function modes() {
    const rootSel = UI.rootSelect(TS.modeRoot, function (v) { TS.modeRoot = v; save(); draw(); });
    const view = UI.seg([['parallel', 'Parallel (same root)'], ['parent', 'Parent (same notes)']], TS.modeView, function (v) { TS.modeView = v; save(); draw(); });
    const out = h('div');
    body.appendChild(UI.card('The seven modes, brightest to darkest', [h('div.row', UI.field('Root', rootSel), view), h('div', { style: { height: '10px' } }), out]));
    const ORDER = ['lydian', 'ionian', 'mixolydian', 'dorian', 'aeolian', 'phrygian', 'locrian'];
    const PARENT_DEG = { ionian: 0, dorian: 2, phrygian: 4, lydian: 5, mixolydian: 7, aeolian: 9, locrian: 11 };
    const VAMP = { lydian: 'lydian_vamp', ionian: 'pop_axis', mixolydian: 'mixo_vamp', dorian: 'dorian_vamp', aeolian: 'aeolian_vamp', phrygian: 'phrygian_vamp', locrian: 'phrygian_metal' };
    function draw() {
      out.innerHTML = '';
      const parentRoot = T.rootName(TS.modeRoot, 'ionian');
      const lad = h('div.ladder');
      ORDER.forEach(function (id) {
        const s = T.SCALES[id];
        const rootPc = TS.modeView === 'parallel' ? TS.modeRoot : T.mod12(TS.modeRoot + PARENT_DEG[id]);
        const rn = TS.modeView === 'parallel' ? T.rootName(rootPc, id) : T.spell(parentRoot, ['1', '2', '3', '4', '5', '6', '7'][T.SCALES.ionian.ivs.indexOf(PARENT_DEG[id])]);
        const notes = T.scaleNotes(rn, id);
        const line = h('div.lnotes');
        notes.forEach(function (n, i) {
          const isChr = s.char.indexOf(s.degs[i]) >= 0 && s.degs[i] !== '1' && id !== 'ionian';
          line.appendChild(isChr ? h('em', T.pretty(n) + ' ') : document.createTextNode(T.pretty(n) + ' '));
        });
        line.appendChild(h('div.small', T.pretty(s.formula) + ' · ' + s.mood));
        lad.appendChild(h('div.lrow', h('b', T.pretty(rn) + ' ' + s.name.replace(' (Major)', '').replace(' (Natural Minor)', '')), line,
          h('div.row.tight',
            h('button.btn.small', { type: 'button', text: '▶', 'aria-label': 'Hear', onclick: function () { App.playScale(rootPc, id); } }),
            h('button.btn.small', { type: 'button', text: 'Jam', onclick: function () { const p = T.progression(VAMP[id]); App.loadJam({ prog: VAMP[id], key: rootPc, style: p.style, scale: id, bpm: p.bpm }); } }))));
      });
      out.appendChild(lad);
      out.appendChild(h('p.cap', { style: { marginTop: '10px' } }, TS.modeView === 'parallel'
        ? 'Same root, one note changes per step. Red notes are each mode’s character notes.'
        : 'Every mode uses the notes of ' + T.pretty(parentRoot) + ' major. Only the home note changes.'));
    }
    draw();
  }

  const mod = { build: function (r) { root = r; }, shown: function (arg) { go(arg && ['scales', 'chords', 'harmony', 'circle', 'intervals', 'modes'].indexOf(arg) >= 0 ? arg : sub); } };
  App.register('theory', mod);
  return mod;
})();
