/* AXELAB · Neck explorer: any scale, any position, any tuning. */
const NeckPanel = (function () {
  'use strict';
  const T = Theory, h = UI.h, S = App.state;
  let fb, els = {}, riffSet = null;
  const N = Object.assign({ key: S.key, scale: S.scale, pos: -1, view: 'scale', labels: 'names', hide: false, chord: -1, sev: false },
    UI.store.get('neck', {}));
  function save() { UI.store.set('neck', N); }
  function tuning() { return (Guitar.TUNINGS[S.tuning] || Guitar.TUNINGS.standard).midi; }
  function rootN() { return T.rootName(N.key, N.scale); }

  function draw() {
    const sc = T.scale(N.scale);
    const positions = Guitar.positions(N.key, N.scale, tuning());
    if (N.pos >= positions.length) N.pos = -1;
    fb.o.tuning = tuning();
    fb.o.frets = S.frets || 15;
    fb.o.lefty = !!S.lefty;
    fb.o.mode = N.view;
    fb.o.labels = N.labels;
    fb.scale = { rootPc: N.key, id: N.scale, root: rootN() };
    fb.position = N.pos >= 0 ? positions[N.pos] : null;
    fb.hideOutside = N.hide;
    fb.riff = riffSet;
    const harm = T.harmonize(rootN(), N.scale, N.sev);
    const ch = N.chord >= 0 && harm[N.chord] ? harm[N.chord] : null;
    fb.chord = ch ? { rootPc: ch.rootPc, q: ch.q, pcs: T.chordPcs(ch.rootPc, ch.q) } : null;
    fb.draw(true);
    UI.options(els.posSel, [{ value: -1, label: 'Whole neck' }].concat(positions.map(function (p, i) { return { value: i, label: p.label }; })), N.pos);
    renderInfo(sc);
    renderPosTab(positions);
    renderHarmony(harm);
    renderRelated(sc);
    els.title.textContent = T.pretty(rootN()) + ' ' + sc.name;
    save();
  }

  function renderInfo(sc) {
    const names = T.scaleNotes(rootN(), N.scale);
    const chips = h('div.notes-row', names.map(function (n, i) {
      const d = sc.degs[i];
      return h('button.note-chip' + (sc.char.indexOf(d) >= 0 && d !== '1' ? '.chr' : ''), { type: 'button', title: 'Hear ' + n, onclick: function () { App.previewNote(48 + N.key + sc.ivs[i]); } },
        h('b', T.pretty(n)), h('small', T.pretty(d)));
    }));
    els.info.innerHTML = '';
    els.info.appendChild(chips);
    els.info.appendChild(h('dl', { style: { marginTop: '12px' } },
      h('dt', 'Formula'), h('dd', T.pretty(sc.formula)),
      h('dt', 'Steps'), h('dd', sc.steps),
      h('dt', 'Sound'), h('dd', sc.mood),
      h('dt', 'Used in'), h('dd', sc.use),
      h('dt', 'Fits chords'), h('dd', T.pretty(sc.fits || '')),
      h('dt', 'Character'), h('dd', sc.char.length ? sc.char.map(function (d) { return T.pretty(d) + ' (' + T.pretty(T.spell(rootN(), d)) + ')'; }).join(', ') : 'Even, symmetrical'),
      h('dt', 'Family'), h('dd', sc.parent || sc.fam)));
  }

  function renderPosTab(positions) {
    els.tab.innerHTML = '';
    const p = N.pos >= 0 ? positions[N.pos] : positions[0];
    if (!p) { els.tab.appendChild(h('p.muted', 'This scale is shown across the whole neck (no box positions).')); return; }
    const host = h('div');
    els.tab.appendChild(host);
    Tab.mount(host, Guitar.positionTab(p, tuning()), { title: (N.pos >= 0 ? p.label : 'Position 1 (pick a position above to change)') + ' · up and down', bpm: 120, tone: 'clean', tuning: tuning() });
  }

  function renderHarmony(harm) {
    els.harm.innerHTML = '';
    if (!harm.length) { els.harm.appendChild(h('p.muted.small', 'Diatonic chords are built from 7-note scales. Pick a mode or a harmonic/melodic minor scale to see them.')); return; }
    const row = h('div.dia-row');
    harm.forEach(function (c, i) {
      const b = h('button.dia-btn' + (N.chord === i ? '.on' : ''), { type: 'button' },
        h('div.r', T.pretty(c.roman)), h('div.s', T.chordLabel(c.root, c.q)), h('div.f', c.func));
      b.addEventListener('click', function () {
        N.chord = N.chord === i ? -1 : i;
        Band.previewChord({ rootPc: c.rootPc, q: c.q });
        draw();
      });
      row.appendChild(b);
    });
    els.harm.appendChild(row);
    els.harm.appendChild(h('p.cap', { style: { marginTop: '8px' } }, 'Tap a chord to hear it and ring its notes on the neck.'));
  }

  function renderRelated(sc) {
    els.rel.innerHTML = '';
    const pcs = T.scalePcs(N.key, N.scale);
    // Same notes, different root
    const same = [];
    if (sc.ivs.length >= 5) {
      pcs.forEach(function (pc) {
        if (pc === N.key) return;
        const id = T.scaleFromPcs(pc, pcs);
        if (id) same.push({ pc: pc, id: id });
      });
    }
    // One note different, same root
    const near = Object.keys(T.SCALES).filter(function (id) {
      const s = T.SCALES[id];
      if (id === N.scale || s.ivs.length !== sc.ivs.length) return false;
      const a = new Set(s.ivs), b = new Set(sc.ivs);
      let diff = 0; a.forEach(function (v) { if (!b.has(v)) diff++; });
      return diff === 1;
    });
    function chip(pc, id, why) {
      return h('button.tog', { type: 'button', title: why || '', text: T.pretty(T.rootName(pc, id)) + ' ' + T.scale(id).name, onclick: function () { N.key = pc; N.scale = id; N.pos = -1; N.chord = -1; syncSelects(); draw(); } });
    }
    if (same.length) {
      els.rel.appendChild(h('h5.flabel', { style: { margin: '0 0 6px' } }, 'Same notes, different home'));
      els.rel.appendChild(h('div.row.tight', same.map(function (s) { return chip(s.pc, s.id); })));
    }
    if (near.length) {
      els.rel.appendChild(h('h5.flabel', { style: { margin: '12px 0 6px' } }, 'One note away (same root)'));
      els.rel.appendChild(h('div.row.tight', near.map(function (id) {
        const a = T.SCALES[id];
        const changed = a.degs.filter(function (d, i) { return sc.ivs.indexOf(a.ivs[i]) < 0; })[0];
        return chip(N.key, id, changed ? 'Changes to ' + T.pretty(changed) : '');
      })));
    }
    if (!same.length && !near.length) els.rel.appendChild(h('p.muted.small', 'No close relatives in the library.'));
  }

  function jamForScale() {
    const map = { dorian: 'dorian_vamp', mixolydian: 'mixo_vamp', lydian: 'lydian_vamp', phrygian: 'phrygian_vamp', aeolian: 'aeolian_vamp',
      pentatonic_minor: 'minor_blues', blues: 'blues12', pentatonic_major: 'pop_axis', ionian: 'pop_axis', blues_major: 'blues12',
      harmonic_minor: 'neoclassical', phrygian_dominant: 'phrygian_metal', lydian_dominant: 'bossa', melodic_minor: 'ii_V_i', bebop_dominant: 'jazz_blues',
      pentatonic_dominant: 'funk_vamp', locrian: 'phrygian_metal', altered: 'ii_V_I', diminished_hw: 'jazz_blues' };
    const sc = T.scale(N.scale);
    const prog = map[N.scale] || (sc.minorish ? 'aeolian_vamp' : 'mixo_vamp');
    const p = T.progression(prog);
    App.loadJam({ prog: prog, key: N.key, style: p.style, scale: N.scale, bpm: p.bpm });
  }

  function syncSelects() {
    els.keySel.value = String(N.key);
    const sel = UI.scaleSelect(N.scale, function (v) { N.scale = v; N.pos = -1; N.chord = -1; draw(); });
    els.scaleWrap.replaceChild(sel, els.scaleSel); els.scaleSel = sel;
  }

  function build(root) {
    els.title = h('span');
    els.keySel = UI.rootSelect(N.key, function (v) { N.key = v; N.chord = -1; draw(); });
    els.scaleSel = UI.scaleSelect(N.scale, function (v) { N.scale = v; N.pos = -1; N.chord = -1; draw(); });
    els.scaleWrap = h('label.field', { style: { gridColumn: 'span 2' } }, h('span.flabel', 'Scale'), els.scaleSel);
    const tunSel = UI.options(h('select'), Object.keys(Guitar.TUNINGS).map(function (k) { return { value: k, label: Guitar.TUNINGS[k].name }; }), S.tuning);
    tunSel.addEventListener('change', function () { App.set({ tuning: tunSel.value }); N.pos = -1; draw(); });
    const fretSel = UI.options(h('select'), [12, 15, 17, 19, 22, 24].map(function (f) { return { value: f, label: f + ' frets' }; }), S.frets || 15);
    fretSel.addEventListener('change', function () { App.set({ frets: +fretSel.value }); draw(); });
    els.posSel = h('select');
    els.posSel.addEventListener('change', function () { N.pos = +els.posSel.value; draw(); });
    const view = UI.seg([['scale', 'Scale'], ['all', 'All notes']], N.view, function (v) { N.view = v; draw(); });
    const labels = UI.seg([['names', 'Names'], ['degrees', 'Degrees'], ['none', 'Blank']], N.labels, function (v) { N.labels = v; draw(); }, null);
    const hide = UI.toggle('Hide outside position', N.hide, function (v) { N.hide = v; draw(); });
    const lefty = UI.toggle('Left-handed', !!S.lefty, function (v) { App.set({ lefty: v }); draw(); });
    const sev = UI.toggle('7th chords', N.sev, function (v) { N.sev = v; N.chord = -1; draw(); });
    const cv = h('canvas');
    els.nib = h('div.nib', 'Tap any note to hear it and see its degree.');
    fb = new Fretboard(cv, { frets: S.frets || 15, tuning: tuning() });
    fb.onTap = function (s, f, midi) {
      App.previewNote(midi);
      const d = fb.describe(s, f);
      els.nib.innerHTML = '<b>' + T.pretty(d.name) + '</b> · string ' + (6 - s) + ', fret ' + f + ' · ' +
        (d.inScale ? 'degree <b>' + T.pretty(d.deg) + '</b> (' + d.interval + ')' + (d.character ? ' · <b>character note</b>' : '') : 'outside the scale (' + d.interval + ')') +
        (d.chordDeg ? ' · <b>' + T.pretty(d.chordDeg === '1' ? 'root' : d.chordDeg) + '</b> of the chord' : '');
    };
    const L = Fretboard.ROLE_COLOR;
    const legend = h('div.legend', [['R', 'Root'], ['n', 'Stable'], ['t', 'Tension'], ['d', 'Dark'], ['b', 'Bright']].map(function (p) { return h('span', h('i', { style: { background: L[p[0]] } }), p[1]); }),
      h('span', h('i.dia'), 'Character note'), h('span', h('i.ring'), 'Chord tone'));

    const controls = UI.card(null, [
      h('div.fields',
        UI.field('Key', els.keySel), els.scaleWrap, UI.field('Position', els.posSel), UI.field('Tuning', tunSel), UI.field('Frets', fretSel)),
      h('div.row', { style: { marginTop: '10px' } }, view, labels, hide, lefty),
      h('div.row', { style: { marginTop: '10px' } },
        h('button.btn.primary', { type: 'button', text: '▶ Hear it', onclick: function () {
          const p = N.pos >= 0 ? Guitar.positions(N.key, N.scale, tuning())[N.pos] : null; App.playScale(N.key, N.scale, p);
        } }),
        h('button.btn', { type: 'button', text: 'Jam over this scale', onclick: jamForScale }))
    ]);
    const neck = h('section.card.stage', h('div.stage-top', h('div', h('div.now-lbl', 'Scale explorer'), h('div.now-scale', { style: { fontSize: '20px', marginTop: '2px' } }, els.title))),
      h('div.fbwrap', cv), legend, els.nib);
    els.info = h('div.scaleinfo');
    els.tab = h('div');
    els.harm = h('div');
    els.rel = h('div');
    root.appendChild(neck);
    root.appendChild(controls);
    root.appendChild(h('div.grid2',
      UI.card('About this scale', els.info),
      UI.card('Position tab', els.tab),
      UI.card('Chords in this scale', [h('div.row', { style: { marginBottom: '8px' } }, sev), els.harm]),
      UI.card('Related scales', els.rel)));
    draw();
  }

  function open(cfg) {
    if (cfg.key !== undefined) N.key = cfg.key;
    if (cfg.scale) N.scale = cfg.scale;
    N.pos = cfg.pos !== undefined ? cfg.pos : -1;
    N.chord = -1;
    riffSet = cfg.riff ? new Set(cfg.riff) : null;
    App.show('neck');
    syncSelects();
    draw();
  }

  const mod = { build: build, open: open, shown: function () { if (fb) fb.draw(true); } };
  App.register('neck', mod);
  return mod;
})();
