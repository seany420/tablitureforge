/* AXELAB · Jam panel: backing tracks with a live, scale-following fretboard. */
const JamPanel = (function () {
  'use strict';
  const T = Theory, h = UI.h, S = App.state;
  let fb = null, cur = 0, overrides = {}, els = {}, cells = [], drumCells = [], meterRaf = null, lastAnchor = null;
  let showShapes = false;

  const QUICK = [
    ['Blues shuffle · A', { prog: 'blues12', key: 9, style: 'blues_shuffle', scale: 'blues', bpm: 92 }],
    ['Minor rock · E', { prog: 'aeolian_rock', key: 4, style: 'hard_rock', scale: 'pentatonic_minor', bpm: 108 }],
    ['Metal · E', { prog: 'metal_minor', key: 4, style: 'metal', scale: 'pentatonic_minor', bpm: 140 }],
    ['Funk · A Dorian', { prog: 'dorian_vamp', key: 9, style: 'funk', scale: 'dorian', bpm: 100 }],
    ['Pop · G', { prog: 'pop_axis', key: 7, style: 'pop', scale: 'pentatonic_major', bpm: 100 }],
    ['Slow blues · A minor', { prog: 'minor_blues', key: 9, style: 'slow_blues', scale: 'pentatonic_minor', bpm: 62 }],
    ['Jazz ii–V–I · C', { prog: 'ii_V_I', key: 0, style: 'jazz_swing', scale: 'ionian', bpm: 120, follow: 'chord' }],
    ['Country · G', { prog: 'country_train', key: 7, style: 'country', scale: 'pentatonic_major', bpm: 150 }]
  ];
  const STYLE_GROUPS = [['Rock & Metal', ['rock', 'hard_rock', 'metal', 'thrash']], ['Blues', ['blues_shuffle', 'slow_blues']],
    ['Groove', ['funk', 'reggae', 'lofi']], ['Pop & Ballad', ['pop', 'ballad', 'ballad68']], ['Jazz & Latin', ['jazz_swing', 'bossa']], ['Country', ['country']]];

  /* ── Scale shown on the neck ──────────────────────── */
  function displayScale(idx) {
    const r = App.resolved, c = r.chords[idx];
    if (S.follow === 'chord') {
      const o = c.scales[overrides[idx] || 0] || c.scales[0];
      return { rootPc: o.rootPc, id: o.id, root: o.root, why: o.why, alts: c.scales };
    }
    return { rootPc: S.key, id: S.scale, root: T.rootName(S.key, S.scale), why: 'One scale over the whole progression. Chord tones are ringed as each chord plays.', alts: null };
  }
  function positionFor(sc) {
    if (S.pos === undefined || S.pos < 0) return null;
    const keyPos = Guitar.positions(S.key, S.scale);
    const anchorPos = keyPos[Math.min(S.pos, keyPos.length - 1)];
    if (!anchorPos) return null;
    if (S.follow !== 'chord') return Guitar.positions(sc.rootPc, sc.id)[Math.min(S.pos, keyPos.length - 1)] || null;
    // Chord-scale mode: pick the position of the new scale nearest the chosen hand position
    const anchor = (anchorPos.lo + anchorPos.hi) / 2;
    const list = Guitar.positions(sc.rootPc, sc.id);
    let best = null, bd = 1e9;
    list.forEach(function (p) {
      [0, 12, -12].forEach(function (sh) {
        const c = (p.lo + p.hi) / 2 + sh;
        if (p.lo + sh < 0) return;
        if (Math.abs(c - anchor) < bd) {
          bd = Math.abs(c - anchor);
          best = sh === 0 ? p : { notes: p.notes.map(function (n) { return { s: n.s, f: n.f + sh, midi: n.midi + sh, deg: n.deg }; }), lo: p.lo + sh, hi: p.hi + sh };
        }
      });
    });
    return best;
  }

  /* ── Stage ────────────────────────────────────────── */
  function renderStage(idx) {
    const r = App.resolved;
    if (!r) return;
    idx = Math.min(idx, r.chords.length - 1);
    cur = idx;
    const c = r.chords[idx], nx = c.next;
    const sc = displayScale(idx);
    const s = T.scale(sc.id);
    els.nowChord.textContent = T.chordLabel(c.root, c.q);
    els.nowRoman.textContent = T.pretty(c.roman);
    els.nowScale.innerHTML = '';
    els.nowScale.appendChild(document.createTextNode('Play: ' + T.pretty(sc.root) + ' ' + s.name));
    els.nowNotes.textContent = T.scaleNotes(sc.root, sc.id).map(T.pretty).join('  ');
    els.nowWhy.textContent = sc.why;
    els.alts.innerHTML = '';
    if (sc.alts && sc.alts.length > 1) {
      els.alts.appendChild(h('span.muted.small', 'Also fits: '));
      sc.alts.slice(0, 5).forEach(function (o, i) {
        if (i === (overrides[idx] || 0)) return;
        els.alts.appendChild(h('button.tog', { type: 'button', text: T.pretty(o.root) + ' ' + (T.scale(o.id).short || T.scale(o.id).name), title: o.why,
          onclick: function () { overrides[idx] = i; renderStage(idx); renderTimeline(); } }));
      });
    }
    els.nextChord.textContent = T.chordLabel(nx.root, nx.q);
    if (!Band.state.playing) els.nextIn.textContent = r.chords.length > 1 ? 'after ' + c.beats + ' beats' : 'repeats';
    // neck
    fb.o.mode = S.show === 'chordtones' ? 'chord' : S.show === 'all' ? 'all' : 'scale';
    fb.o.labels = S.labels === 'chord' && fb.o.mode !== 'chord' ? 'chord' : S.labels;
    fb.scale = { rootPc: sc.rootPc, id: sc.id, root: sc.root };
    fb.chord = { rootPc: c.rootPc, q: c.q, pcs: c.pcs };
    fb.nextChord = null;
    fb.showNext = S.preview;
    fb.position = positionFor(sc);
    fb.draw();
    cells.forEach(function (el, i) { el.classList.toggle('cur', i === idx); el.classList.remove('nextc'); });
    updatePosSelect();
  }

  function legend() {
    const L = Fretboard.ROLE_COLOR;
    if (S.show === 'chordtones') {
      return [h('span', h('i', { style: { background: Fretboard.CHORD_DEG_COLOR['1'] } }), 'Root'), h('span', h('i', { style: { background: Fretboard.CHORD_DEG_COLOR['3'] } }), '3rd'),
        h('span', h('i', { style: { background: Fretboard.CHORD_DEG_COLOR['5'] } }), '5th'), h('span', h('i', { style: { background: Fretboard.CHORD_DEG_COLOR['7'] } }), '7th / 6th'),
        h('span', h('i', { style: { background: Fretboard.CHORD_DEG_COLOR.x } }), 'Extension')];
    }
    return [['R', 'Root'], ['n', 'Stable'], ['t', 'Tension'], ['d', 'Dark'], ['b', 'Bright']].map(function (p) { return h('span', h('i', { style: { background: L[p[0]] } }), p[1]); })
      .concat([h('span', h('i', { style: { background: '#8a7a60' } }), 'Chord tone outside scale'), h('span', h('i.ring'), 'Chord tone'), h('span', h('i.dash'), 'Next chord'), h('span', h('i.dia'), 'Character note')]);
  }
  function renderLegend() { els.legend.innerHTML = ''; legend().forEach(function (n) { els.legend.appendChild(n); }); }

  function updatePosSelect() {
    const n = Guitar.positions(S.key, S.scale).length;
    const sel = els.posSel;
    const want = String(S.pos === undefined ? -1 : S.pos);
    if (sel._n !== n) {
      UI.options(sel, [{ value: -1, label: 'Whole neck' }].concat(Array.from({ length: n }, function (_, i) { return { value: i, label: 'Position ' + (i + 1) }; })));
      sel._n = n;
    }
    sel.value = want;
  }

  /* ── Timeline ─────────────────────────────────────── */
  function renderTimeline() {
    const r = App.resolved;
    els.timeline.innerHTML = '';
    cells = r.chords.map(function (c, i) {
      const sc = S.follow === 'chord' ? (c.scales[overrides[i] || 0] || c.scales[0]) : null;
      const cell = h('button.tcell', { type: 'button', title: 'Hear ' + c.symbol },
        h('div.tc-sym', T.chordLabel(c.root, c.q)),
        h('div.tc-rom', T.pretty(c.roman) + ' · ' + c.beats + (c.beats === 1 ? ' beat' : ' beats')),
        h('div.tc-sc', sc ? T.pretty(sc.root) + ' ' + (T.scale(sc.id).short || T.scale(sc.id).name) : T.pretty(c.notes.join(' '))),
        showShapes ? h('div.tc-diag', Diagram.svg(Object.assign({}, Band.voicingFor(i) || {}, { q: (Band.voicingFor(i) || {}).q || c.q, rootPc: c.rootPc }))) : null,
        h('div.tc-bar'));
      cell.addEventListener('click', function () {
        Band.setStartChord(i);
        if (!Band.state.playing) { renderStage(i); Band.previewChord(c); }
      });
      els.timeline.appendChild(cell);
      return cell;
    });
    const p = App.progDef();
    els.progDesc.textContent = p.desc || '';
    els.progTip.innerHTML = '<b>Soloing tip:</b> ' + UI.esc(p.tip || '');
    els.loopInfo.textContent = r.totalBeats / 4 + ' bars · ' + r.chords.length + ' chords · key of ' + T.pretty(r.key) + ' ' + (T.scale(p.mode) ? T.scale(p.mode).short || T.scale(p.mode).name : '');
  }

  /* ── Band events ──────────────────────────────────── */
  function wireBand() {
    Band.on('start', function () { els.nowLbl.textContent = 'Now playing'; startMeters(); });
    Band.on('stop', function () {
      els.nowLbl.textContent = 'Ready';
      els.beats.innerHTML = '';
      cells.forEach(function (c) { c.classList.remove('nextc'); const b = c.querySelector('.tc-bar'); if (b) b.style.width = '0'; });
      drumCells.forEach(function (col) { col.forEach(function (d) { d.classList.remove('cur'); }); });
      if (fb) { fb.nextChord = null; fb.draw(); }
      els.loopCount.textContent = '';
    });
    Band.on('count', function (e) {
      els.nowLbl.textContent = 'Count-in';
      drawBeats(Band.style().bpb, e.beat, true);
      els.nextIn.textContent = e.n + '…';
    });
    Band.on('chord', function (e) { els.nowLbl.textContent = 'Now playing'; renderStage(e.chord); });
    Band.on('beat', function (e) {
      const r = App.resolved; if (!r) return;
      const c = r.chords[e.chord];
      drawBeats(Band.style().bpb, e.beat, false);
      els.nextIn.textContent = r.chords.length > 1 ? 'in ' + e.beatsLeft + (e.beatsLeft === 1 ? ' beat' : ' beats') : 'repeats';
      const cell = cells[e.chord];
      if (cell) { const b = cell.querySelector('.tc-bar'); b.style.width = ((c.beats - e.beatsLeft + 1) / c.beats * 100) + '%'; }
      const nIdx = (e.chord + 1) % r.chords.length;
      cells.forEach(function (el, i) { el.classList.toggle('nextc', i === nIdx && e.beatsLeft <= 2 && r.chords.length > 1); });
      if (S.preview && e.beatsLeft === 1 && r.chords.length > 1 && r.chords[nIdx] !== c) {
        fb.nextChord = { rootPc: c.next.rootPc, q: c.next.q, pcs: c.next.pcs };
        fb.draw();
      }
      els.loopCount.textContent = 'Loop ' + (e.loop + 1) + (S.cycle !== 'off' ? ' · key ' + T.pretty(r.key) : '') + (S.trainer ? ' · ' + Band.state.bpm + ' bpm' : '');
    });
    Band.on('step', function (e) {
      if (!drumCells.length) return;
      drumCells.forEach(function (col, i) { col.forEach(function (d) { d.classList.toggle('cur', i === e.step); }); });
    });
    Band.state.beforeLoop = function (n) {
      let changed = false;
      if (S.cycle && S.cycle !== 'off') {
        const step = { fourths: 5, fifths: 7, half: 1, whole: 2 }[S.cycle];
        const k = S.cycle === 'random' ? Math.floor(Math.random() * 12) : T.mod12(S.key + step);
        App.set({ key: k }, true);
        App.resolve();
        changed = true;
      }
      if (S.trainer) {
        const bpm = Math.min(260, Band.state.bpm + S.trainer);
        Band.state.bpm = bpm; App.set({ bpm: bpm }, true);
        changed = true;
      }
      if (changed) setTimeout(function () { syncControls(); renderTimeline(); App.updateTransport(); }, 0);
      void n;
    };
  }
  function drawBeats(n, on, count) {
    if (els.beats.childElementCount !== n) { els.beats.innerHTML = ''; for (let i = 0; i < n; i++) els.beats.appendChild(h('span.beat' + (i === 0 ? '.one' : ''))); }
    UI.$$('.beat', els.beats).forEach(function (b, i) { b.classList.toggle('on', i === on); b.classList.toggle('count', !!count && i <= on); });
  }

  /* ── Meters ───────────────────────────────────────── */
  function startMeters() {
    cancelAnimationFrame(meterRaf);
    const wave = new Uint8Array(1024);
    const loop = function () {
      if (!Band.state.playing) { UI.$$('.meter > div', els.mixer).forEach(function (m) { m.style.width = '0'; }); return; }
      if (App.current === 'jam') {
        UI.$$('[data-meter]', els.mixer).forEach(function (m) { m.style.width = Math.min(100, Sound.level(m.getAttribute('data-meter')) * 130) + '%'; });
        const cv = els.wave, ctx = cv.getContext('2d');
        const W = cv.clientWidth, H = 40, dpr = window.devicePixelRatio || 1;
        if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        Sound.wave(wave);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#b8860b';
        ctx.lineWidth = 1.5; ctx.beginPath();
        for (let i = 0; i < W; i++) { const v = wave[Math.floor(i / W * wave.length)] / 128 - 1; const y = H / 2 + v * H * 0.9; if (i) ctx.lineTo(i, y); else ctx.moveTo(i, y); }
        ctx.stroke();
      }
      meterRaf = requestAnimationFrame(loop);
    };
    meterRaf = requestAnimationFrame(loop);
  }

  /* ── Controls ─────────────────────────────────────── */
  function progOptions() {
    const groups = T.PROG_CATEGORIES.map(function (cat) {
      return { group: cat, items: T.PROGRESSIONS.filter(function (p) { return p.cat === cat; }).map(function (p) { return { value: p.id, label: p.name }; }) };
    });
    if (S.custom && S.custom.steps && S.custom.steps.length) groups.unshift({ group: 'Yours', items: [{ value: 'custom', label: 'Custom progression' }] });
    return groups;
  }
  function styleOptions() {
    return STYLE_GROUPS.map(function (g) { return { group: g[0], items: g[1].map(function (id) { return { value: id, label: Band.STYLES[id].name }; }) }; });
  }
  function setBpm(v) {
    v = Math.max(40, Math.min(260, Math.round(v)));
    App.set({ bpm: v }); Band.state.bpm = v;
    els.bpmNum.textContent = v; els.bpmSlider.value = v;
  }
  function applyStyle(id, keepTones) {
    App.set({ style: id });
    if (!keepTones) App.set({ gtrTone: null, bassStyle: null, keysKind: null, double: undefined });
    if (Sound.ctx) Band.setStyle(id); else Band.state.style = id;
    const st = Band.STYLES[id];
    els.styleFeel.textContent = st.feel;
    els.gtrTone.value = S.gtrTone || st.tone;
    els.bassSel.value = S.bassStyle || st.bassStyle;
    els.keysSel.value = S.keysOn === false || !st.keys ? (st.keys ? 'off' : 'none') : (S.keysKind || st.keysKind || 'ep');
    els.dblTog.set(S.double !== undefined ? S.double : !!st.double);
    buildDrumGrid();
    if (showShapes) renderTimeline();
  }
  function onProgChange(id) {
    const p = id === 'custom' ? null : T.progression(id);
    overrides = {};
    const patch = { prog: id };
    if (p) { patch.scale = p.over[0]; patch.bpm = p.bpm; }
    if (S.pos >= 0) patch.pos = -1;
    App.set(patch);
    if (p) { applyStyle(p.style); setBpm(p.bpm); }
    App.resolve(); syncControls(); renderTimeline(); renderStage(0);
  }
  function syncControls() {
    els.keySel.value = String(S.key);
    UI.options(els.progSel, progOptions(), S.prog);
    const p = App.progDef();
    const sel = UI.scaleSelect(S.scale, function (v) { App.set({ scale: v, pos: -1 }); renderStage(cur); }, p.over);
    els.scaleWrap.replaceChild(sel, els.scaleSel); els.scaleSel = sel;
    els.styleSel.value = S.style;
    els.bpmNum.textContent = S.bpm; els.bpmSlider.value = S.bpm;
    els.followSeg.set(S.follow); els.showSeg.set(S.show); els.labelSeg.set(S.labels);
    els.cycleSel.value = S.cycle; els.trainerSel.value = String(S.trainer || 0);
  }

  function build(root) {
    /* Stage */
    els.nowLbl = h('div.now-lbl', 'Ready');
    els.nowChord = h('span.now-chord');
    els.nowRoman = h('span.now-roman');
    els.nowScale = h('div.now-scale');
    els.nowNotes = h('div.small.muted');
    els.nowWhy = h('div.now-why');
    els.alts = h('div.row.tight', { style: { marginTop: '6px' } });
    els.nextChord = h('div.next-chord');
    els.nextIn = h('div.next-in');
    els.beats = h('div.beats');
    els.followSeg = UI.seg([['key', 'Key', 'One scale for the whole progression'], ['chord', 'Each chord', 'Switch to each chord’s own scale']], S.follow, function (v) { App.set({ follow: v }); renderStage(cur); renderTimeline(); });
    els.showSeg = UI.seg([['scale', 'Scale'], ['chordtones', 'Chord tones'], ['all', 'All notes']], S.show, function (v) { App.set({ show: v }); renderLegend(); renderStage(cur); });
    els.labelSeg = UI.seg([['names', 'Names'], ['degrees', 'Degrees'], ['chord', 'vs chord', 'Degrees relative to the current chord']], S.labels, function (v) { App.set({ labels: v }); renderStage(cur); });
    els.posSel = h('select', { 'aria-label': 'Position' });
    els.posSel.addEventListener('change', function () { App.set({ pos: +els.posSel.value }); renderStage(cur); });
    const prevTog = UI.toggle('Next-chord preview', S.preview, function (v) { App.set({ preview: v }); fb.showNext = v; fb.draw(); }, 'Outline the next chord’s notes just before it arrives');
    const cv = h('canvas');
    els.legend = h('div.legend');
    els.nib = h('div.nib', 'Tap a note on the neck to hear it and see its role over the current chord.');
    const stage = h('section.card.stage',
      h('div.stage-top',
        h('div', els.nowLbl, h('div', els.nowChord, els.nowRoman), els.nowScale, els.nowNotes, els.nowWhy, els.alts),
        h('div.next-box', h('div.next-lbl', 'Next'), els.nextChord, els.nextIn, els.beats)),
      h('div.stage-ctl',
        h('div.grp', h('span.glabel', 'Scale follows'), els.followSeg),
        h('div.grp', h('span.glabel', 'Show'), els.showSeg),
        h('div.grp', h('span.glabel', 'Labels'), els.labelSeg),
        h('div.grp', els.posSel, prevTog)),
      h('div.fbwrap', cv), els.legend, els.nib);
    fb = new Fretboard(cv, { frets: S.frets || 15, tuning: Guitar.STD });
    fb.onTap = function (s, f, midi) {
      App.previewNote(midi);
      const d = fb.describe(s, f);
      const parts = ['<b>' + T.pretty(d.name) + '</b> · string ' + (6 - s) + ', fret ' + f];
      if (d.inScale) parts.push('degree <b>' + T.pretty(d.deg) + '</b> of the scale' + (d.character ? ' (character note)' : ''));
      else parts.push('outside the scale (' + d.interval + ' above the root)');
      if (d.chordDeg) parts.push('<b>' + T.pretty(d.chordDeg === '1' ? 'root' : d.chordDeg) + '</b> of ' + T.pretty(App.resolved.chords[cur].symbol));
      else parts.push('not in ' + T.pretty(App.resolved.chords[cur].symbol) + (d.inScale ? ': a passing or color note' : ''));
      els.nib.innerHTML = parts.join(' · ');
    };

    /* Timeline */
    els.timeline = h('div.timeline');
    els.progDesc = h('p.progdesc');
    els.progTip = h('div.tipbox');
    els.loopInfo = h('span.muted.small');
    els.loopCount = h('span.small', { style: { color: 'var(--accent-ink)', fontWeight: 700 } });
    const shapesTog = UI.toggle('Chord shapes', false, function (v) { showShapes = v; renderTimeline(); renderStage(cur); }, 'Show the shape the backing guitar plays');
    const timeline = UI.card('Progression', [h('div.row', els.loopInfo, h('span.spacer'), els.loopCount, shapesTog), h('div', { style: { height: '10px' } }), els.timeline, els.progDesc, els.progTip]);

    /* Setup */
    els.keySel = UI.rootSelect(S.key, function (v) { App.set({ key: v, pos: -1 }); overrides = {}; App.resolve(); renderTimeline(); renderStage(Math.min(cur, App.resolved.chords.length - 1)); });
    els.progSel = h('select', { 'aria-label': 'Progression' });
    els.progSel.addEventListener('change', function () { onProgChange(els.progSel.value); });
    els.styleSel = UI.options(h('select', { 'aria-label': 'Style' }), styleOptions(), S.style);
    els.styleSel.addEventListener('change', function () { applyStyle(els.styleSel.value); setBpm(Band.STYLES[els.styleSel.value].bpm); });
    els.styleFeel = h('span.fhint');
    els.scaleSel = h('select');
    els.scaleWrap = h('label.field', h('span.flabel', 'Scale (Key mode)'), els.scaleSel);
    els.bpmNum = h('b', { style: { fontFamily: 'Bebas Neue, sans-serif', fontSize: '34px', fontWeight: 400, color: 'var(--accent)', minWidth: '62px', textAlign: 'center' } }, String(S.bpm));
    els.bpmSlider = h('input', { type: 'range', min: 40, max: 260, value: S.bpm, 'aria-label': 'Tempo' });
    els.bpmSlider.addEventListener('input', function () { setBpm(+els.bpmSlider.value); });
    const taps = [];
    const tapBtn = h('button.btn.small', { type: 'button', text: 'Tap', onclick: function () {
      const now = performance.now(); taps.push(now); while (taps.length > 6) taps.shift();
      if (taps.length > 1 && now - taps[taps.length - 2] < 2000) { const d = (taps[taps.length - 1] - taps[0]) / (taps.length - 1); setBpm(60000 / d); }
      else taps.splice(0, taps.length - 1);
    } });
    const quick = h('div.row.tight', QUICK.map(function (q) { return h('button.tog', { type: 'button', text: q[0], onclick: function () { App.loadJam(q[1], false); } }); }));
    const setup = UI.card('Setup', [
      h('div.small.muted', { style: { marginBottom: '6px' } }, 'Quick start'), quick, h('div.hr'),
      h('div.fields',
        UI.field('Key', els.keySel),
        h('label.field', { style: { gridColumn: 'span 2' } }, h('span.flabel', 'Progression'), els.progSel),
        h('label.field', h('span.flabel', 'Style'), els.styleSel, els.styleFeel),
        els.scaleWrap),
      h('div.row', { style: { marginTop: '12px' } },
        h('span.flabel', 'Tempo'), h('button.btn.small', { type: 'button', text: '−5', onclick: function () { setBpm(S.bpm - 5); } }), els.bpmNum,
        h('button.btn.small', { type: 'button', text: '+5', onclick: function () { setBpm(S.bpm + 5); } }), tapBtn),
      els.bpmSlider
    ]);

    /* Song settings */
    els.cycleSel = UI.options(h('select'), [{ value: 'off', label: 'Off' }, { value: 'fourths', label: 'Up a 4th (circle)' }, { value: 'fifths', label: 'Up a 5th' }, { value: 'half', label: 'Up a half step' }, { value: 'whole', label: 'Up a whole step' }, { value: 'random', label: 'Random key' }], S.cycle);
    els.cycleSel.addEventListener('change', function () { App.set({ cycle: els.cycleSel.value }); });
    els.trainerSel = UI.options(h('select'), [{ value: 0, label: 'Off' }, { value: 2, label: '+2 bpm per loop' }, { value: 5, label: '+5 bpm per loop' }, { value: 10, label: '+10 bpm per loop' }], S.trainer || 0);
    els.trainerSel.addEventListener('change', function () { App.set({ trainer: +els.trainerSel.value }); });
    const hum = h('input', { type: 'range', min: 0, max: 2, step: 0.1, value: S.humanize });
    hum.addEventListener('input', function () { App.set({ humanize: +hum.value }); Band.state.humanize = +hum.value; });
    const song = UI.card('Song settings', [
      h('div.row',
        UI.toggle('Count-in', S.countIn, function (v) { App.set({ countIn: v }); Band.state.countIn = v; }),
        UI.toggle('Drum fills', S.fills, function (v) { App.set({ fills: v }); Band.state.fills = v; }),
        UI.toggle('Click', S.click, function (v) { App.set({ click: v }); Band.state.click = v; }, 'Metronome click over the band'),
        UI.toggle('Guitar', S.gtrOn, function (v) { App.set({ gtrOn: v }); Band.state.gtrOn = v; }),
        UI.toggle('Keys', S.keysOn, function (v) { App.set({ keysOn: v }); Band.state.keysOn = v; })),
      h('div.fields', { style: { marginTop: '12px' } },
        UI.field('Key cycling', els.cycleSel, 'Change key every loop'),
        UI.field('Tempo trainer', els.trainerSel, 'Speed up every loop'),
        UI.field('Humanize', hum, 'Timing and velocity feel'))
    ], { collapsible: true });

    /* Mixer */
    els.mixer = h('div');
    [['drums', 'Drums'], ['bass', 'Bass'], ['gtr', 'Rhythm Gtr'], ['keys', 'Keys'], ['lead', 'Lead / Preview'], ['click', 'Click']].forEach(function (c) {
      const m = S.mixer[c[0]] || {};
      const def = Sound.CHANNELS.find(function (x) { return x.id === c[0]; });
      const vol = h('input', { type: 'range', min: 0, max: 1.2, step: 0.01, value: m.vol !== undefined ? m.vol : def.vol, 'aria-label': c[1] + ' volume' });
      const mute = h('button.mbtn.m' + (m.muted ? '.on' : ''), { type: 'button', text: 'M', title: 'Mute' });
      const solo = h('button.mbtn.s' + (m.solo ? '.on' : ''), { type: 'button', text: 'S', title: 'Solo' });
      const save = function (patch) { const mx = Object.assign({}, S.mixer); mx[c[0]] = Object.assign({}, mx[c[0]] || {}, patch); App.set({ mixer: mx }, true); };
      vol.addEventListener('input', function () { Sound.setVol(c[0], +vol.value); save({ vol: +vol.value }); });
      mute.addEventListener('click', function () { const v = !mute.classList.contains('on'); mute.classList.toggle('on', v); Sound.setMute(c[0], v); save({ muted: v }); });
      solo.addEventListener('click', function () { const v = !solo.classList.contains('on'); solo.classList.toggle('on', v); Sound.setSolo(c[0], v); save({ solo: v }); });
      els.mixer.appendChild(h('div.mx', h('span.mname', c[1]), vol, mute, solo, h('div.meter', h('div', { 'data-meter': c[0] }))));
    });
    els.gtrTone = UI.options(h('select'), Object.keys(Sound.AMP_TONES).map(function (k) { return { value: k, label: Sound.AMP_TONES[k].label }; }));
    els.gtrTone.addEventListener('change', function () { App.set({ gtrTone: els.gtrTone.value }); Sound.setGuitarTone(els.gtrTone.value); });
    els.bassSel = UI.options(h('select'), Object.keys(Sound.BASS_STYLES).map(function (k) { return { value: k, label: Sound.BASS_STYLES[k].label }; }));
    els.bassSel.addEventListener('change', function () { App.set({ bassStyle: els.bassSel.value }); Sound.setBassStyle(els.bassSel.value); });
    els.keysSel = UI.options(h('select'), [{ value: 'ep', label: 'Electric piano' }, { value: 'organ', label: 'Organ' }, { value: 'pad', label: 'Pad' }, { value: 'piano', label: 'Piano' }, { value: 'off', label: 'Off' }, { value: 'none', label: 'Not used by this style' }]);
    els.keysSel.addEventListener('change', function () {
      const v = els.keysSel.value;
      if (v === 'off' || v === 'none') { App.set({ keysOn: false }); Band.state.keysOn = false; return; }
      App.set({ keysKind: v, keysOn: true }); Band.state.keysOn = true;
      Band.STYLES[S.style].keysKind = v; Sound.setKeysFx(v);
      if (!Band.STYLES[S.style].keys) { Band.STYLES[S.style].keys = Band.STYLES[S.style].spb === 3 ? 'H'.padEnd(Band.STYLES[S.style].bpb * 3, '_') : 'H'.padEnd(Band.STYLES[S.style].bpb * 4, '_'); }
    });
    els.dblTog = UI.toggle('Double-track', true, function (v) { App.set({ double: v }); Sound.setDouble(v); }, 'Two guitars panned left and right');
    const rvSize = h('input', { type: 'range', min: 0, max: 1, step: 0.01, value: S.reverb[0] });
    const rvMix = h('input', { type: 'range', min: 0, max: 0.8, step: 0.01, value: S.reverb[1] });
    const rv = function () { App.set({ reverb: [+rvSize.value, +rvMix.value] }, true); Sound.setReverb(+rvSize.value, +rvMix.value); };
    rvSize.addEventListener('change', rv); rvMix.addEventListener('input', rv);
    els.wave = h('canvas.wave');
    const mixer = UI.card('Mixer & tone', [
      els.mixer,
      h('div.fields', { style: { marginTop: '12px' } }, UI.field('Guitar amp', els.gtrTone), UI.field('Bass', els.bassSel), UI.field('Keys', els.keysSel),
        UI.field('Room size', rvSize), UI.field('Reverb mix', rvMix)),
      h('div.row', { style: { marginTop: '10px' } }, els.dblTog),
      h('div', { style: { marginTop: '10px' } }, els.wave)
    ], { collapsible: true });

    /* Builder & drums */
    const builder = UI.card('Build your own progression', buildBuilder(), { collapsible: true, closed: true });
    els.dgrid = h('div.dgrid');
    els.drumCustom = UI.toggle('Use my beat', !!Band.state.drumOverride, function (v) {
      Band.state.drumOverride = v ? editLanes() : null;
    });
    const drums = UI.card('Drum programmer', [h('p.small.muted', 'Edit the current style’s main beat. Tap cells to cycle off → soft → accent. Turn on “Use my beat” to play it.'),
      h('div.row', { style: { marginBottom: '8px' } }, els.drumCustom, h('button.btn.small', { type: 'button', text: 'Reset to style', onclick: function () { drumEdit = null; buildDrumGrid(); if (Band.state.drumOverride) Band.state.drumOverride = editLanes(); } })),
      els.dgrid], { collapsible: true, closed: true });

    root.appendChild(stage);
    root.appendChild(h('div.grid2', h('div', timeline, setup), h('div', song, mixer, builder, drums)));

    wireBand();
    renderLegend();
    syncControls();
    applyStyle(S.style, true);
    els.styleFeel.textContent = Band.STYLES[S.style].feel;
    App.resolve();
    renderTimeline();
    renderStage(0);
  }

  /* ── Custom progression builder ───────────────────── */
  let bld = null;
  function buildBuilder() {
    bld = { mode: (S.custom && S.custom.mode) || 'ionian', sev: false, steps: (S.custom && S.custom.steps ? S.custom.steps.slice() : []) };
    const pal = h('div.bld-pal'), seq = h('div.bld-seq');
    const modeSel = UI.options(h('select'), [['ionian', 'Major'], ['aeolian', 'Natural minor'], ['harmonic_minor', 'Harmonic minor'], ['dorian', 'Dorian'], ['mixolydian', 'Mixolydian'], ['lydian', 'Lydian'], ['phrygian', 'Phrygian']].map(function (m) { return { value: m[0], label: m[1] }; }), bld.mode);
    modeSel.addEventListener('change', function () { bld.mode = modeSel.value; drawPal(); });
    const sevTog = UI.toggle('7th chords', false, function (v) { bld.sev = v; drawPal(); });
    const BORROWED = {
      ionian: ['iv', 'bVI', 'bVII', 'bIII', 'II7', 'III7', 'VI7', 'I7', 'iiø7', 'bII7'],
      aeolian: ['V7', 'IV', 'bII', 'I', 'V'], harmonic_minor: ['bVII', 'IV7', 'bII'], dorian: ['bVI', 'V7'], mixolydian: ['iv', 'v', 'V7'], lydian: ['vii', 'V'], phrygian: ['V7', 'bvii']
    };
    function drawPal() {
      pal.innerHTML = '';
      const rn = T.rootName(S.key, bld.mode);
      T.harmonize(rn, bld.mode, bld.sev).forEach(function (c) {
        pal.appendChild(h('button', { type: 'button', onclick: function () { bld.steps.push({ roman: c.roman, beats: 4 }); drawSeq(); } }, h('b', T.chordLabel(c.root, c.q)), h('small', T.pretty(c.roman))));
      });
      (BORROWED[bld.mode] || []).forEach(function (r) {
        let rr;
        try { rr = T.parseRoman(r); } catch (e) { return; }
        const root = T.spell(rn, rr.deg);
        pal.appendChild(h('button.borrowed', { type: 'button', title: 'Borrowed / chromatic chord', onclick: function () { bld.steps.push({ roman: r, beats: 4 }); drawSeq(); } }, h('b', T.chordLabel(root, rr.q)), h('small', T.pretty(r))));
      });
    }
    function drawSeq() {
      seq.innerHTML = '';
      if (!bld.steps.length) seq.appendChild(h('span.muted.small', 'Tap chords above to add them. Set beats for each.'));
      const rn = T.rootName(S.key, bld.mode);
      bld.steps.forEach(function (st, i) {
        const rr = T.parseRoman(st.roman);
        const beats = UI.options(h('select', { 'aria-label': 'Beats' }), [1, 2, 3, 4, 6, 8, 12, 16].map(function (b) { return { value: b, label: b + 'b' }; }), st.beats);
        beats.addEventListener('change', function () { st.beats = +beats.value; });
        seq.appendChild(h('div.bs', h('b', T.chordLabel(T.spell(rn, rr.deg), rr.q)), beats, h('button', { type: 'button', text: '×', 'aria-label': 'Remove', onclick: function () { bld.steps.splice(i, 1); drawSeq(); } })));
      });
    }
    drawPal(); drawSeq();
    App.on('change', function (p) { if (p.key !== undefined) { drawPal(); drawSeq(); } });
    return [h('div.row', { style: { marginBottom: '10px' } }, UI.field('Mode', modeSel), sevTog), pal, seq,
      h('div.row', h('button.btn.primary', { type: 'button', text: 'Use this progression', onclick: function () {
        if (!bld.steps.length) { UI.toast('Add some chords first'); return; }
        App.set({ custom: { mode: bld.mode, steps: bld.steps.map(function (s) { return { roman: s.roman, beats: s.beats }; }) }, prog: 'custom', scale: App.suggestFor(bld.mode)[0], pos: -1 });
        overrides = {}; App.resolve(); syncControls(); renderTimeline(); renderStage(0); UI.toast('Custom progression loaded');
      } }), h('button.btn', { type: 'button', text: 'Clear', onclick: function () { bld.steps = []; drawSeq(); } }))];
  }

  /* ── Drum programmer ──────────────────────────────── */
  let drumEdit = null;
  function editLanes() {
    const st = Band.style();
    const steps = st.bpb * st.spb;
    const out = {};
    Object.keys(drumEdit).forEach(function (k) { out[k] = drumEdit[k].map(function (v) { return v === 2 ? 'X' : v === 1 ? 'o' : '.'; }).join('').slice(0, steps); });
    return out;
  }
  function buildDrumGrid() {
    if (!els.dgrid) return;
    const st = Band.style();
    const steps = st.bpb * st.spb;
    if (!drumEdit || drumEdit._style !== S.style) {
      drumEdit = {};
      const lanes = Object.assign({ kick: '', snare: '', hhc: '' }, st.drums);
      Object.keys(lanes).forEach(function (k) {
        const s = lanes[k] || '';
        drumEdit[k] = Array.from({ length: steps }, function (_, i) { const c = s.charAt(i); return c === 'X' ? 2 : (c === 'x' || c === 'o' || c === 'g') ? 1 : 0; });
      });
      Object.defineProperty(drumEdit, '_style', { value: S.style, enumerable: false });
    }
    els.dgrid.innerHTML = '';
    drumCells = Array.from({ length: steps }, function () { return []; });
    Band.DRUM_LANES.filter(function (k) { return drumEdit[k]; }).forEach(function (k) {
      const row = h('div.drow', h('span.dlbl', Band.LANE_LABEL[k]));
      for (let i = 0; i < steps; i++) {
        const v = drumEdit[k][i];
        const c = h('button.dc' + (v === 2 ? '.v2' : v === 1 ? '.v1' : '') + (i % st.spb === 0 && i ? '.beatstart' : ''), { type: 'button', 'aria-label': Band.LANE_LABEL[k] + ' step ' + (i + 1) });
        c.addEventListener('click', function () {
          drumEdit[k][i] = (drumEdit[k][i] + 1) % 3;
          c.classList.toggle('v1', drumEdit[k][i] === 1); c.classList.toggle('v2', drumEdit[k][i] === 2);
          if (Band.state.drumOverride) Band.state.drumOverride = editLanes();
        });
        drumCells[i].push(c);
        row.appendChild(c);
      }
      els.dgrid.appendChild(row);
    });
  }

  function refresh() {
    if (!els.keySel) return;
    overrides = {};
    App.resolve();
    syncControls();
    applyStyle(S.style);
    renderLegend();
    renderTimeline();
    renderStage(0);
  }

  const mod = { build: build, refresh: refresh, shown: function () { if (fb) fb.draw(true); } };
  App.register('jam', mod);
  return mod;
})();
