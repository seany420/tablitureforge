/* AXELAB · App shell: shared state, navigation, transport and widgets. */
const App = (function () {
  'use strict';
  const T = Theory, h = UI.h;

  const DEFAULTS = {
    key: 9, prog: 'blues12', style: 'blues_shuffle', bpm: 92, scale: 'blues',
    follow: 'key', show: 'scale', labels: 'names', preview: true,
    fills: true, countIn: true, click: false, humanize: 1, cycle: 'off', trainer: 0,
    gtrOn: true, keysOn: true, custom: null, mixer: {}, reverb: [0.35, 0.3],
    tuning: 'standard', lefty: false, frets: 15
  };
  const state = Object.assign({}, DEFAULTS, UI.store.get('state', {}));
  const listeners = {};
  const panels = {};
  let current = 'jam';

  function on(evt, f) { (listeners[evt] = listeners[evt] || []).push(f); }
  function emit(evt, d) { (listeners[evt] || []).forEach(function (f) { f(d); }); }
  let saveT = null;
  function set(patch, silent) {
    Object.assign(state, patch);
    clearTimeout(saveT);
    saveT = setTimeout(function () { UI.store.set('state', state); }, 250);
    if (!silent) emit('change', patch);
  }

  /** Progression definition: built-in or custom. */
  function progDef() {
    if (state.prog === 'custom' && state.custom && state.custom.steps && state.custom.steps.length) {
      return { id: 'custom', cat: 'Custom', name: 'Custom progression', mode: state.custom.mode || 'ionian', steps: state.custom.steps,
        over: suggestFor(state.custom.mode || 'ionian'), desc: 'Your own progression.', tip: 'Turn on chord-scale view to see what changes chord by chord.', style: state.style };
    }
    return T.progression(state.prog) || T.progression('blues12');
  }
  function suggestFor(mode) {
    const m = { ionian: ['ionian', 'pentatonic_major'], aeolian: ['aeolian', 'pentatonic_minor'], dorian: ['dorian', 'pentatonic_minor'],
      mixolydian: ['mixolydian', 'pentatonic_major', 'blues'], lydian: ['lydian', 'pentatonic_major'], phrygian: ['phrygian', 'pentatonic_minor'],
      harmonic_minor: ['harmonic_minor', 'aeolian'], locrian: ['locrian'] };
    return m[mode] || ['ionian'];
  }
  let resolved = null;
  function resolve() {
    const p = progDef();
    resolved = T.resolveProgression(p.steps, state.key, p.mode);
    Band.setProgression(resolved);
    return resolved;
  }

  /* ── Navigation ───────────────────────────────────── */
  function register(name, mod) { panels[name] = mod; }
  function show(name, sub) {
    if (!panels[name]) return;
    current = name;
    UI.$$('.panel').forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + name); });
    UI.$$('.ni').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-panel') === name); });
    const mod = panels[name];
    if (!mod.built) { mod.build(UI.$('#panel-' + name)); mod.built = true; }
    if (mod.shown) mod.shown(sub);
    window.scrollTo({ top: 0 });
    try { history.replaceState(null, '', '#' + name + (sub ? '/' + sub : '')); } catch (e) { /* file:// */ }
  }

  /* ── Transport ────────────────────────────────────── */
  function togglePlay() {
    if (Band.state.playing) { Band.stop(); return; }
    if (!panels.jam.built) { panels.jam.build(UI.$('#panel-jam')); panels.jam.built = true; }
    Tab.stop();
    resolve();
    Band.state.bpm = state.bpm;
    audio().then(function () { Band.start(); });
  }
  let audioApplied = false;
  function audio() {
    const p = Sound.ensure();
    return p.then(function () {
      if (!audioApplied) { audioApplied = true; applyAudio(); }
    });
  }
  function applyAudio() {
    const st = Band.STYLES[state.style];
    Band.setStyle(state.style);
    Object.keys(state.mixer).forEach(function (id) {
      const m = state.mixer[id];
      if (m.vol !== undefined) Sound.setVol(id, m.vol);
      if (m.muted) Sound.setMute(id, true);
      if (m.solo) Sound.setSolo(id, true);
    });
    if (state.gtrTone) Sound.setGuitarTone(state.gtrTone);
    if (state.bassStyle) Sound.setBassStyle(state.bassStyle);
    if (state.keysKind) Sound.setKeysFx(state.keysKind);
    if (state.double !== undefined) Sound.setDouble(state.double);
    Sound.setReverb(state.reverb[0], state.reverb[1]);
    void st;
  }
  function updateTransport(chord) {
    const p = progDef();
    const sc = T.scale(state.scale);
    const btn = UI.$('#tpPlay');
    const playing = Band.state.playing;
    btn.classList.toggle('playing', playing);
    btn.setAttribute('aria-label', playing ? 'Stop' : 'Play backing track');
    UI.$('#tpIcon').innerHTML = playing ? '<rect x="6" y="6" width="12" height="12" rx="1.5"/>' : '<path d="M7 4.5v15l13-7.5z"/>';
    const r = resolved || resolve();
    const c = chord || r.chords[0];
    UI.$('#tpChord').textContent = playing ? T.chordLabel(c.root, c.q) : T.pretty(r.key) + ' ' + (sc ? (sc.short || sc.name) : '');
    UI.$('#tpSub').textContent = p.name + ' · ' + (Band.STYLES[state.style] ? Band.STYLES[state.style].name : '') + ' · ' + state.bpm + ' bpm';
  }

  /** Load a backing-track configuration from lessons, artists and daily challenges. */
  function loadJam(cfg, autoplay) {
    const p = T.progression(cfg.prog);
    const patch = { prog: cfg.prog, key: cfg.key !== undefined ? cfg.key : (p ? p.key : state.key) };
    if (cfg.style) patch.style = cfg.style;
    if (cfg.scale) patch.scale = cfg.scale; else if (p) patch.scale = p.over[0];
    patch.bpm = cfg.bpm || (p ? p.bpm : state.bpm);
    if (cfg.follow) {
      if (cfg.follow === 'chordtones') { patch.follow = 'chord'; patch.show = 'chordtones'; }
      else { patch.follow = cfg.follow; patch.show = 'scale'; }
    }
    patch.cycle = cfg.cycle || 'off';
    if (Band.state.playing) Band.stop();
    patch.gtrTone = null; patch.bassStyle = null; patch.keysKind = null; patch.double = undefined;
    set(patch);
    show('jam');
    if (panels.jam.refresh) panels.jam.refresh();
    if (autoplay !== false) { setTimeout(togglePlay, 60); }
    UI.toast('Loaded: ' + (p ? p.name : 'progression') + ' in ' + T.pretty(T.rootName(patch.key, p ? p.mode : 'ionian')));
  }

  /* ── Widgets inside content ───────────────────────── */
  const necks = [];
  function upgrade(root) {
    Tab.upgradeAll(root);
    Diagram.upgradeAll(root);
    UI.$$('[data-neck]:not(.neckw)', root).forEach(function (n) {
      let cfg = {};
      try { cfg = JSON.parse(n.getAttribute('data-neck')); } catch (e) { return; }
      n.classList.add('neckw');
      const sc = T.scale(cfg.scale);
      const rootN = T.rootName(cfg.key, cfg.scale);
      const positions = cfg.pos !== undefined ? Guitar.positions(cfg.key, cfg.scale) : null;
      const pos = positions ? positions[cfg.pos] : null;
      const head = h('div.nw-head', h('b', T.pretty(rootN) + ' ' + sc.name), pos ? h('span', pos.label) : null,
        h('span.spacer'),
        h('button.btn.small', { type: 'button', text: '▶ Hear', onclick: function () { playScale(cfg.key, cfg.scale, pos); } }),
        h('button.btn.small', { type: 'button', text: 'Open in Neck', onclick: function () { panels.neck.open({ key: cfg.key, scale: cfg.scale, pos: cfg.pos }); } }));
      const cv = h('canvas');
      n.appendChild(head); n.appendChild(cv);
      let lo = 0, hi = 15;
      if (pos) { lo = Math.max(0, pos.lo - 1); hi = Math.min(22, Math.max(lo + 7, pos.hi + 1)); if (lo <= 1) lo = 0; }
      const fb = new Fretboard(cv, { frets: cfg.frets || hi, startFret: cfg.frets ? 0 : lo, labels: cfg.labels || 'names', mode: cfg.mode || 'scale', compact: true, minFretW: 36 });
      fb.scale = { rootPc: cfg.key, id: cfg.scale, root: rootN };
      if (cfg.chord) fb.chord = { rootPc: cfg.chord[0], q: cfg.chord[1], pcs: T.chordPcs(cfg.chord[0], cfg.chord[1]) };
      if (pos) fb.position = pos;
      fb.onTap = function (s, f, midi) { previewNote(midi); };
      necks.push(fb);
      requestAnimationFrame(function () { fb.draw(true); });
    });
    UI.$$('[data-jam]', root).forEach(function (b) {
      if (b._jam) return; b._jam = true;
      b.addEventListener('click', function () { try { loadJam(JSON.parse(b.getAttribute('data-jam'))); } catch (e) { /* bad config */ } });
    });
    UI.$$('[data-quiz]:not(.quiz)', root).forEach(function (n) {
      let qs = [];
      try { qs = JSON.parse(n.getAttribute('data-quiz')); } catch (e) { return; }
      n.classList.add('quiz');
      n.appendChild(h('h4', 'Check yourself'));
      qs.forEach(function (q) {
        // shuffle answers but remember the correct one
        const order = q.a.map(function (a, i) { return i; }).sort(function () { return Math.random() - 0.5; });
        const opts = h('div.opts');
        order.forEach(function (i) {
          const b = h('button', { type: 'button', text: q.a[i] });
          b.addEventListener('click', function () {
            if (i === q.c) { b.classList.add('right'); UI.$$('button', opts).forEach(function (x) { x.disabled = true; }); }
            else { b.classList.add('wrong'); b.disabled = true; }
          });
          opts.appendChild(b);
        });
        n.appendChild(h('div.qitem', h('div.q', q.q), opts));
      });
    });
  }
  function redrawNecks() { necks.forEach(function (f) { f.draw(true); }); }

  function previewNote(midi, tone) {
    audio().then(function () {
      Sound.setLeadTone(tone || 'clean');
      Sound.pluck(midi, Sound.now() + 0.02, { ch: 'lead', vel: 0.8, dur: 1.4, type: 'clean' });
    });
  }
  /** Play a scale: a position (up and down) or two octaves from the root. */
  function playScale(rootPc, scaleId, pos, bpm) {
    audio().then(function () {
      Sound.setLeadTone('clean');
      let notes;
      if (pos) {
        const up = pos.notes.map(function (n) { return n.midi; });
        notes = up.concat(up.slice(0, -1).reverse());
      } else {
        const sc = T.scale(scaleId);
        let base = 40 + T.mod12(rootPc - 4);
        if (base < 45) base += 12;
        const up = [];
        for (let o = 0; o < 2; o++) sc.ivs.forEach(function (v) { up.push(base + 12 * o + v); });
        up.push(base + 24);
        notes = up.concat(up.slice(0, -1).reverse());
      }
      const step = 60 / (bpm || 150);
      const t0 = Sound.now() + 0.05;
      notes.forEach(function (m, i) { Sound.pluck(m, t0 + i * step, { ch: 'lead', vel: 0.75, dur: step * 1.2, type: 'clean' }); });
    });
  }

  /* ── Theme ────────────────────────────────────────── */
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = cur ? cur === 'dark' : sysDark;
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    UI.store.set('theme', next);
    UI.$('meta[name="theme-color"]').setAttribute('content', next === 'dark' ? '#1d1a16' : '#b8860b');
    emit('theme', next);
    redrawNecks();
  }

  function init() {
    UI.$$('.ni').forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-panel')); }); });
    UI.$('#tpPlay').addEventListener('click', togglePlay);
    UI.$('#themeBtn').addEventListener('click', toggleTheme);
    document.addEventListener('keydown', function (e) {
      if (e.code === 'Space' && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); togglePlay(); }
    });
    Band.on('start', function () { updateTransport(); });
    Band.on('stop', function () { updateTransport(); });
    Band.on('chord', function (e) { if (resolved) updateTransport(resolved.chords[e.chord]); });
    on('change', function () { updateTransport(); });
    if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redrawNecks);
    resolve();
    Band.state.bpm = state.bpm;
    Band.state.fills = state.fills; Band.state.countIn = state.countIn; Band.state.click = state.click;
    Band.state.humanize = state.humanize; Band.state.gtrOn = state.gtrOn; Band.state.keysOn = state.keysOn;
    Band.state.style = state.style;
    const hash = (location.hash || '').replace('#', '').split('/');
    show(panels[hash[0]] ? hash[0] : 'jam', hash[1]);
    updateTransport();
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline support is optional */ });
    }
  }

  return {
    state, set, on, emit, init, register, show, progDef, resolve, get resolved() { return resolved; }, loadJam, upgrade,
    previewNote, playScale, audio, togglePlay, updateTransport, redrawNecks, suggestFor, get current() { return current; }
  };
})();
