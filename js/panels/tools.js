/* AXELAB · Tools: metronome, tuner, riff lab, practice. */
const ToolsPanel = (function () {
  'use strict';
  const T = Theory, h = UI.h;
  let root, body, sub = 'practice';

  function subnav() {
    const nav = h('div.subnav');
    [['practice', 'Practice'], ['metronome', 'Metronome'], ['tuner', 'Tuner'], ['riff', 'Riff Lab']].forEach(function (s) {
      const b = h('button', { type: 'button', text: s[1] });
      b.classList.toggle('on', s[0] === sub);
      b.addEventListener('click', function () { go(s[0]); });
      nav.appendChild(b);
    });
    return nav;
  }
  function go(s) {
    if (sub === 'tuner' && s !== 'tuner') Tuner.stop();
    sub = s;
    root.innerHTML = ''; root.appendChild(subnav());
    body = h('div'); root.appendChild(body);
    ({ practice: practice, metronome: metronome, tuner: tuner, riff: riff })[s]();
    try { history.replaceState(null, '', '#tools/' + s); } catch (e) { /* ignore */ }
  }

  /* ═══ Metronome (lookahead scheduler on the audio clock) ═══ */
  const M = Object.assign({ bpm: 100, beats: 4, sub: 1, accent: true, trainStep: 0, trainBars: 4, trainMax: 200 }, UI.store.get('metro', {}));
  let mPlaying = false, mTimer = null, mNext = 0, mBeat = 0, mBar = 0, mEls = {};
  function mSave() { UI.store.set('metro', { bpm: M.bpm, beats: M.beats, sub: M.sub, accent: M.accent, trainStep: M.trainStep, trainBars: M.trainBars, trainMax: M.trainMax }); }
  function mTick() {
    const ac = Sound.ctx;
    while (mNext < ac.currentTime + 0.12) {
      const beatDur = 60 / M.bpm;
      const accent = M.accent && mBeat === 0;
      Sound.clickTo(mNext, accent, false);
      for (let s = 1; s < M.sub; s++) Sound.clickTo(mNext + s * beatDur / M.sub, false, true);
      const b = mBeat, t = mNext;
      setTimeout(function () { mFlash(b); }, Math.max(0, (t - ac.currentTime) * 1000));
      mNext += beatDur;
      mBeat = (mBeat + 1) % M.beats;
      if (mBeat === 0) {
        mBar++;
        if (M.trainStep && mBar % M.trainBars === 0 && M.bpm < M.trainMax) { M.bpm = Math.min(M.trainMax, M.bpm + M.trainStep); setTimeout(mShowBpm, 0); }
      }
    }
  }
  function mFlash(b) {
    if (!mEls.lights) return;
    UI.$$('.mlight', mEls.lights).forEach(function (l, i) { l.classList.toggle('on', i === b); l.classList.toggle('acc', i === b && b === 0 && M.accent); });
  }
  function mStart() {
    if (Band.state.playing) Band.stop();
    App.audio().then(function () {
      mPlaying = true; mBeat = 0; mBar = 0; mNext = Sound.now() + 0.06;
      mTimer = setInterval(mTick, 20); mTick();
      if (mEls.btn) { mEls.btn.textContent = 'Stop'; mEls.btn.classList.add('danger'); }
    });
  }
  function mStop() {
    mPlaying = false; clearInterval(mTimer);
    if (mEls.btn) { mEls.btn.textContent = 'Start'; mEls.btn.classList.remove('danger'); }
    if (mEls.lights) UI.$$('.mlight', mEls.lights).forEach(function (l) { l.classList.remove('on', 'acc'); });
  }
  function mShowBpm() { if (mEls.bpm) { mEls.bpm.textContent = M.bpm; mEls.slider.value = M.bpm; mEls.term.textContent = tempoTerm(M.bpm); } mSave(); }
  function tempoTerm(b) { return b < 60 ? 'Largo' : b < 72 ? 'Adagio' : b < 96 ? 'Andante' : b < 120 ? 'Moderato' : b < 156 ? 'Allegro' : b < 200 ? 'Vivace' : 'Presto'; }
  function metronome() {
    mEls.bpm = h('div.metro-bpm', String(M.bpm));
    mEls.term = h('div.muted', { style: { textAlign: 'center' } }, tempoTerm(M.bpm));
    mEls.slider = h('input', { type: 'range', min: 30, max: 300, value: M.bpm, 'aria-label': 'Tempo' });
    mEls.slider.addEventListener('input', function () { M.bpm = +mEls.slider.value; mShowBpm(); });
    mEls.lights = h('div.metro-lights');
    const drawLights = function () { mEls.lights.innerHTML = ''; for (let i = 0; i < M.beats; i++) mEls.lights.appendChild(h('span.mlight')); };
    drawLights();
    mEls.btn = h('button.btn.primary', { type: 'button', text: mPlaying ? 'Stop' : 'Start', style: { minWidth: '140px' }, onclick: function () { if (mPlaying) mStop(); else mStart(); } });
    const taps = [];
    const tap = h('button.btn', { type: 'button', text: 'Tap tempo', onclick: function () {
      const now = performance.now(); taps.push(now); while (taps.length > 6) taps.shift();
      if (taps.length > 1 && now - taps[taps.length - 2] < 2000) { M.bpm = Math.round(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1))); mShowBpm(); } else taps.splice(0, taps.length - 1);
    } });
    const step = function (d) { return h('button.btn.small', { type: 'button', text: (d > 0 ? '+' : '−') + Math.abs(d), onclick: function () { M.bpm = Math.max(30, Math.min(300, M.bpm + d)); mShowBpm(); } }); };
    const sig = UI.options(h('select'), [2, 3, 4, 5, 6, 7, 9, 12].map(function (n) { return { value: n, label: n + ' beats' }; }), M.beats);
    sig.addEventListener('change', function () { M.beats = +sig.value; mBeat = 0; drawLights(); mSave(); });
    const subd = UI.seg([[1, '♩'], [2, '♫ 8ths'], [3, 'Triplets'], [4, '16ths']], M.sub, function (v) { M.sub = v; mSave(); });
    const acc = UI.toggle('Accent beat 1', M.accent, function (v) { M.accent = v; mSave(); });
    const tStep = UI.options(h('select'), [0, 1, 2, 4, 5, 10].map(function (n) { return { value: n, label: n ? '+' + n + ' bpm' : 'Off' }; }), M.trainStep);
    tStep.addEventListener('change', function () { M.trainStep = +tStep.value; mSave(); });
    const tBars = UI.options(h('select'), [1, 2, 4, 8, 16].map(function (n) { return { value: n, label: 'every ' + n + ' bar' + (n > 1 ? 's' : '') }; }), M.trainBars);
    tBars.addEventListener('change', function () { M.trainBars = +tBars.value; mSave(); });
    const tMax = h('input', { type: 'number', min: 40, max: 300, value: M.trainMax, 'aria-label': 'Target tempo' });
    tMax.addEventListener('change', function () { M.trainMax = +tMax.value; mSave(); });
    body.appendChild(h('div.grid2',
      UI.card('Metronome', [mEls.bpm, mEls.term, h('div.row', { style: { justifyContent: 'center', margin: '10px 0' } }, step(-10), step(-5), step(-1), step(1), step(5), step(10)), mEls.slider, mEls.lights,
        h('div.row', { style: { justifyContent: 'center' } }, mEls.btn, tap)]),
      UI.card('Settings', [h('div.fields', UI.field('Meter', sig), UI.field('Speed trainer', tStep), UI.field('Interval', tBars), UI.field('Stop at (bpm)', tMax)),
        h('div.row', { style: { marginTop: '12px' } }, subd, acc),
        h('p.small.muted', { style: { marginTop: '12px' } }, 'For odd meters, set 5, 7 or 9 beats and count the groups (3+2, 2+2+3, 2+2+2+3). The speed trainer raises the tempo automatically until your target.')])));
  }

  /* ═══ Tuner ═══ */
  const Tuner = (function () {
    let stream = null, analyser = null, raf = null, active = false, buf = null, tEls = {}, tuningId = UI.store.get('tunerTuning', 'standard'), refMode = false, smooth = [];
    function detect(data, rate) {
      // Normalized autocorrelation over the guitar range (≈ 60–1100 Hz)
      const n = data.length;
      let rms = 0; for (let i = 0; i < n; i++) rms += data[i] * data[i];
      rms = Math.sqrt(rms / n);
      if (rms < 0.012) return -1;
      const minLag = Math.floor(rate / 1100), maxLag = Math.min(Math.floor(rate / 60), n >> 1);
      const W = n - maxLag;
      let best = -1, bestV = 0;
      const corr = new Float32Array(maxLag + 2);
      for (let lag = minLag; lag <= maxLag + 1; lag++) {
        let s = 0, e1 = 0, e2 = 0;
        for (let i = 0; i < W; i += 2) { s += data[i] * data[i + lag]; e1 += data[i] * data[i]; e2 += data[i + lag] * data[i + lag]; }
        corr[lag] = s / Math.sqrt(e1 * e2 + 1e-12);
      }
      // first strong peak avoids octave errors
      let thr = 0; for (let lag = minLag; lag <= maxLag; lag++) thr = Math.max(thr, corr[lag]);
      thr *= 0.88;
      for (let lag = minLag + 1; lag <= maxLag; lag++) {
        if (corr[lag] > thr && corr[lag] >= corr[lag - 1] && corr[lag] >= corr[lag + 1]) { best = lag; bestV = corr[lag]; break; }
      }
      if (best < 0 || bestV < 0.8) return -1;
      const a = corr[best - 1], b = corr[best], c = corr[best + 1];
      const shift = (a - c) / (2 * (a - 2 * b + c) || 1);
      return rate / (best + shift);
    }
    function loop() {
      if (!active) return;
      analyser.getFloatTimeDomainData(buf);
      const f = detect(buf, Sound.ctx.sampleRate);
      if (f > 0) {
        smooth.push(f); if (smooth.length > 5) smooth.shift();
        const sorted = smooth.slice().sort(function (a, b) { return a - b; });
        show(sorted[sorted.length >> 1]);
      }
      raf = requestAnimationFrame(loop);
    }
    function show(freq) {
      const midiF = 69 + 12 * Math.log2(freq / 440);
      const tun = Guitar.TUNINGS[tuningId].midi;
      // nearest string in the selected tuning (within a fourth), otherwise chromatic
      let target = Math.round(midiF), si = -1, bd = 1e9;
      tun.forEach(function (m, i) { const d = Math.abs(midiF - m); if (d < bd) { bd = d; si = i; } });
      if (bd < 2.5) target = tun[si]; else si = -1;
      const cents = (midiF - target) * 100;
      tEls.note.textContent = T.pretty(T.SHARPS[T.mod12(target)]) + (Math.floor(target / 12) - 1);
      tEls.cents.textContent = (cents >= 0 ? '+' : '') + cents.toFixed(0) + ' cents · ' + freq.toFixed(1) + ' Hz';
      const pos = 50 + Math.max(-50, Math.min(50, cents));
      tEls.needle.style.left = pos + '%';
      const ok = Math.abs(cents) < 4;
      tEls.needle.style.background = ok ? 'var(--green)' : Math.abs(cents) < 15 ? 'var(--accent)' : 'var(--red)';
      tEls.status.textContent = ok ? 'IN TUNE' : cents > 0 ? 'Tune down ↓' : 'Tune up ↑';
      tEls.status.style.color = ok ? 'var(--green)' : 'var(--muted)';
      UI.$$('button', tEls.strings).forEach(function (b, i) { b.classList.toggle('on', i === si && ok); });
    }
    function start() {
      App.audio().then(function () {
        return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      }).then(function (s) {
        stream = s;
        const src = Sound.ctx.createMediaStreamSource(s);
        analyser = Sound.ctx.createAnalyser(); analyser.fftSize = 4096;
        src.connect(analyser);
        buf = new Float32Array(analyser.fftSize);
        active = true; tEls.btn.textContent = 'Stop listening'; tEls.btn.classList.add('danger');
        tEls.cents.textContent = 'Play a string…';
        loop();
      }).catch(function () { tEls.cents.textContent = 'Microphone unavailable or permission denied.'; });
    }
    function stop() {
      active = false; cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
      if (tEls.btn) { tEls.btn.textContent = 'Enable microphone'; tEls.btn.classList.remove('danger'); }
    }
    function build() {
      tEls.note = h('div.tuner-note', '–');
      tEls.needle = h('div.tuner-needle');
      tEls.cents = h('div.tuner-cents', 'Enable the microphone to tune, or tap a string to hear a reference.');
      tEls.status = h('div.tuner-status');
      tEls.strings = h('div.tstrings');
      const tunSel = UI.options(h('select'), Object.keys(Guitar.TUNINGS).map(function (k) { return { value: k, label: Guitar.TUNINGS[k].name }; }), tuningId);
      const drawStrings = function () {
        tEls.strings.innerHTML = '';
        Guitar.TUNINGS[tuningId].midi.forEach(function (m, i) {
          tEls.strings.appendChild(h('button', { type: 'button', text: T.pretty(T.SHARPS[T.mod12(m)]) + (Math.floor(m / 12) - 1), title: 'Play reference for string ' + (6 - i),
            onclick: function () { App.audio().then(function () { Sound.pluck(m, Sound.now() + 0.02, { ch: 'lead', vel: 0.85, dur: 2.5, type: 'clean' }); }); } }));
        });
      };
      tunSel.addEventListener('change', function () { tuningId = tunSel.value; UI.store.set('tunerTuning', tuningId); drawStrings(); });
      drawStrings();
      tEls.btn = h('button.btn.primary', { type: 'button', text: active ? 'Stop listening' : 'Enable microphone', onclick: function () { if (active) stop(); else start(); } });
      body.appendChild(h('div.grid2',
        UI.card('Tuner', [tEls.note, h('div.tuner-scale', h('div.ticks'), h('div.center'), tEls.needle), tEls.cents, tEls.status, tEls.strings, h('div.row', { style: { justifyContent: 'center' } }, tEls.btn)]),
        UI.card('Tuning', [UI.field('Tuning', tunSel), h('p.small.muted', { style: { marginTop: '10px' } }, 'Tap a string button to hear its reference pitch. With the microphone on, the tuner snaps to the nearest string of the selected tuning and shows cents sharp or flat. Pluck firmly and let the note ring; the reading settles after the attack.'),
          h('p.small.muted', 'Tip: tune up to the note. If you are sharp, go below the pitch and come back up. The string holds its tuning better.')])));
      void refMode;
    }
    return { build: build, stop: stop };
  })();
  function tuner() { Tuner.build(); }

  /* ═══ Riff Lab ═══ */
  function riff() {
    const ta = h('textarea.riff-input', { placeholder: 'Paste tab (6 lines, high e on top) or type note names: E G A Bb B D', 'aria-label': 'Riff' });
    ta.value = UI.store.get('riffDraft', '');
    const out = h('div'), tabOut = h('div');
    const saved = h('div');
    const parseNotes = function (text) {
      const parsed = Tab.parse(text);
      const counts = {};
      let first = null, lowest = 1e9;
      if (!parsed.empty) {
        parsed.events.forEach(function (e) { e.notes.forEach(function (n) {
          if (n.dead) return;
          const m = Guitar.STD[n.s] + n.f; const pc = T.mod12(m);
          counts[pc] = (counts[pc] || 0) + 1; if (first === null) first = pc; if (m < lowest) lowest = m;
        }); });
        return { counts: counts, first: first, lowest: lowest < 1e9 ? T.mod12(lowest) : null, tab: true, parsed: parsed };
      }
      text.split(/[\s,]+/).forEach(function (tok) {
        const p = T.parseNote(tok.replace(/[0-9]/g, ''));
        if (!p) return;
        counts[p.pc] = (counts[p.pc] || 0) + 1; if (first === null) first = p.pc;
      });
      return { counts: counts, first: first, lowest: null, tab: false };
    };
    const analyze = function () {
      UI.store.set('riffDraft', ta.value);
      out.innerHTML = ''; tabOut.innerHTML = '';
      const r = parseNotes(ta.value);
      const pcs = Object.keys(r.counts).map(Number);
      if (!pcs.length) { out.appendChild(h('p', { style: { color: 'var(--red)' } }, 'No notes found. Paste tab lines or note names.')); return; }
      if (r.tab) { const host = h('div'); tabOut.appendChild(host); Tab.mount(host, ta.value, { title: 'Your riff', bpm: 100, tone: 'crunch', neck: true }); }
      let most = pcs[0]; pcs.forEach(function (p) { if (r.counts[p] > r.counts[most]) most = p; });
      out.appendChild(h('div.flabel', 'Notes found (★ = most played)'));
      out.appendChild(h('div', { style: { margin: '6px 0 12px' } }, pcs.sort(function (a, b) { return a - b; }).map(function (p) { return h('span.pill' + (p === most ? '.sc' : ''), T.pretty(T.FLATS[p]) + (p === most ? ' ★' : '') + ' ×' + r.counts[p]); })));
      const results = [];
      const ids = Object.keys(T.SCALES).filter(function (id) { return id !== 'chromatic'; });
      for (let k = 0; k < 12; k++) ids.forEach(function (id) {
        const sp = T.scalePcs(k, id);
        const miss = pcs.filter(function (p) { return sp.indexOf(p) < 0; });
        if (miss.length > 1) return;
        let score = (miss.length ? 50 : 100) - sp.length * 1.5;
        if (k === most) score += 8; if (k === r.lowest) score += 10; if (k === r.first) score += 5;
        if (['ionian', 'aeolian', 'pentatonic_minor', 'pentatonic_major', 'blues', 'dorian', 'mixolydian', 'phrygian', 'harmonic_minor'].indexOf(id) >= 0) score += 6;
        results.push({ k: k, id: id, miss: miss, score: score });
      });
      results.sort(function (a, b) { return b.score - a.score; });
      out.appendChild(h('div.flabel', 'Scales that fit'));
      if (!results.length) out.appendChild(h('p.muted', 'Very chromatic: no single scale holds every note. Try a shorter section.'));
      results.slice(0, 12).forEach(function (res) {
        const rn = T.rootName(res.k, res.id);
        out.appendChild(h('div.row', { style: { padding: '8px 0', borderBottom: '1px solid var(--border)' } },
          h('div', { style: { flex: 1, minWidth: '160px' } }, h('b', T.pretty(rn) + ' ' + T.SCALES[res.id].name), h('div.small.muted', T.scaleNotes(rn, res.id).map(T.pretty).join(' '))),
          res.miss.length ? h('span.badge.b-int', '1 outside: ' + T.pretty(T.FLATS[res.miss[0]])) : h('span.badge.b-beg', 'Perfect fit'),
          h('button.btn.small', { type: 'button', text: 'View on neck', onclick: function () { NeckPanel.open({ key: res.k, scale: res.id, riff: pcs }); } })));
      });
    };
    const ex = function () { ta.value = 'e|-----------------------------|\nB|-----------------------------|\nG|-----------------------------|\nD|-----------------2-----------|\nA|-----0--3--5--3------0-------|\nE|--0--------------------3--0--|'; analyze(); };
    const store = function () { try { return JSON.parse(localStorage.getItem('axelab_riffs') || '[]'); } catch (e) { return []; } };
    const putStore = function (a) { try { localStorage.setItem('axelab_riffs', JSON.stringify(a)); } catch (e) { /* ignore */ } };
    const drawSaved = function () {
      const list = store();
      saved.innerHTML = '';
      if (!list.length) { saved.appendChild(h('p.muted.small', 'None saved yet.')); return; }
      list.forEach(function (r, i) {
        saved.appendChild(h('div.row', { style: { padding: '6px 0', borderBottom: '1px solid var(--border)' } }, h('span', { style: { flex: 1, fontWeight: 600 } }, r.name),
          h('button.btn.small', { type: 'button', text: 'Load', onclick: function () { ta.value = r.text; analyze(); } }),
          h('button.btn.small.danger', { type: 'button', text: '×', 'aria-label': 'Delete', onclick: function () { const l = store(); l.splice(i, 1); putStore(l); drawSaved(); } })));
      });
    };
    body.appendChild(UI.card('Riff Lab · find every scale that fits your riff', [ta,
      h('div.row', { style: { marginTop: '8px' } },
        h('button.btn.primary', { type: 'button', text: 'Analyze', onclick: analyze }),
        h('button.btn', { type: 'button', text: 'Example', onclick: ex }),
        h('button.btn', { type: 'button', text: 'Save', onclick: function () {
          if (!ta.value.trim()) return;
          let name = null; try { name = prompt('Name this riff:', 'Riff ' + new Date().toLocaleDateString()); } catch (e) { /* ignore */ }
          const l = store(); l.unshift({ name: name || 'Riff ' + new Date().toLocaleTimeString(), text: ta.value }); putStore(l.slice(0, 40)); drawSaved();
        } }),
        h('button.btn', { type: 'button', text: 'Clear', onclick: function () { ta.value = ''; out.innerHTML = ''; tabOut.innerHTML = ''; UI.store.set('riffDraft', ''); } })),
      tabOut, out]));
    body.appendChild(UI.card('Saved riffs', saved));
    drawSaved();
    if (ta.value) analyze();
  }

  /* ═══ Practice ═══ */
  function practice() {
    const log = UI.store.get('log', []);
    const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const d = DAILY[dayIdx % DAILY.length];
    const dTab = h('div');
    const daily = UI.card('Today’s challenge', [
      h('div', { style: { fontFamily: 'Bebas Neue, sans-serif', fontSize: '30px', color: 'var(--accent)', lineHeight: 1.1 } }, d.t),
      h('p', { style: { margin: '6px 0 10px' } }, d.d),
      h('div.row', h('span.pill.sc', T.pretty(T.rootName(d.key, d.scaleId)) + ' ' + T.scale(d.scaleId).name), h('span.pill.tc', d.tech)),
      dTab,
      h('div.row', h('button.btn.jam', { type: 'button', text: '▶ Jam for this challenge', onclick: function () { App.loadJam(d.jam); } }),
        h('button.btn', { type: 'button', text: 'Open scale in Neck', onclick: function () { NeckPanel.open({ key: d.key, scale: d.scaleId }); } }))]);
    Tab.mount(dTab, Tab.fromCompact(d.tabc), { title: 'Warm-up figure', bpm: 90, tone: 'crunch', caption: d.cap });

    // Routine runner
    let routine = ROUTINES[0], idx = -1, left = 0, timer = null, startedAt = 0;
    const rSel = UI.options(h('select'), ROUTINES.map(function (r) { return { value: r.id, label: r.name }; }), UI.store.get('routine', 'starter'));
    routine = ROUTINES.find(function (r) { return r.id === rSel.value; }) || ROUTINES[0];
    const blocks = h('div'), clock = h('div.timer', '00:00'), curLbl = h('div.muted', { style: { textAlign: 'center', minHeight: '22px' } });
    const goBtn = h('button.btn.primary', { type: 'button', text: 'Start routine' });
    const skip = h('button.btn', { type: 'button', text: 'Next block' });
    function fmt(s) { return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
    function drawBlocks() {
      blocks.innerHTML = '';
      routine.blocks.forEach(function (b, i) {
        const link = h('button.btn.small', { type: 'button', text: 'Go', onclick: function () { goTo(b[2]); } });
        blocks.appendChild(h('div.rblock' + (i === idx ? '.cur' : '') + (i < idx ? '.done' : ''), h('span', b[0]), h('span.rm', b[1] + ' min'), link));
      });
    }
    function goTo(target) {
      const p = target.split(':');
      if (p[0] === 'technique' || p[0] === 'artists') { LearnPanel.openTab(p[0] === 'technique' ? 'techniques' : 'artists'); }
      else if (p[0] === 'lesson') LearnPanel.openLesson(p[1]);
      else if (p[0] === 'jam') { if (p[1]) { const pr = T.progression(p[1]); App.loadJam({ prog: p[1], key: pr.key, style: pr.style, scale: pr.over[0], bpm: pr.bpm }, false); } else App.show('jam'); }
      else if (p[0] === 'ear') App.show('ear', p[1]);
      else if (p[0] === 'theory') App.show('theory', p[1]);
      else if (p[0] === 'log') noteIn.focus();
    }
    function startBlock(i) {
      idx = i;
      if (idx >= routine.blocks.length) { finish(); return; }
      left = routine.blocks[idx][1] * 60;
      curLbl.textContent = routine.blocks[idx][0];
      clock.textContent = fmt(left);
      drawBlocks();
    }
    function finish() {
      clearInterval(timer); timer = null;
      const mins = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
      addLog(mins, routine.name + ' routine');
      goBtn.textContent = 'Start routine'; curLbl.textContent = 'Routine complete. Logged ' + mins + ' min.'; idx = -1; drawBlocks();
      App.audio().then(function () { Sound.clickTo(Sound.now() + 0.05, true); Sound.clickTo(Sound.now() + 0.3, true); });
    }
    goBtn.addEventListener('click', function () {
      if (timer) { finish(); return; }
      startedAt = Date.now(); startBlock(0); goBtn.textContent = 'Finish & log';
      timer = setInterval(function () {
        left--; clock.textContent = fmt(Math.max(0, left));
        if (left <= 0) { App.audio().then(function () { Sound.clickTo(Sound.now() + 0.05, true); }); startBlock(idx + 1); }
      }, 1000);
    });
    skip.addEventListener('click', function () { if (timer) startBlock(idx + 1); });
    rSel.addEventListener('change', function () { routine = ROUTINES.find(function (r) { return r.id === rSel.value; }); UI.store.set('routine', routine.id); idx = -1; drawBlocks(); });
    drawBlocks();
    const runner = UI.card('Practice routine', [UI.field('Routine', rSel), h('div', { style: { margin: '12px 0' } }, clock, curLbl), h('div.row', { style: { justifyContent: 'center', marginBottom: '12px' } }, goBtn, skip), blocks]);

    // Log & stats
    const statsEl = h('div.stats'), listEl = h('div.logl');
    const noteIn = h('input', { type: 'text', placeholder: 'What did you practice?', style: { flex: 1, minWidth: '160px' } });
    const minIn = h('input', { type: 'number', min: 1, max: 600, value: 20, style: { width: '80px' }, 'aria-label': 'Minutes' });
    function addLog(mins, note) {
      log.unshift({ t: Date.now(), min: mins, note: note });
      UI.store.set('log', log.slice(0, 500));
      drawLog();
    }
    function streak() {
      const days = new Set(log.map(function (e) { const d = new Date(e.t); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }));
      let n = 0; const d = new Date();
      if (!days.has(d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate())) d.setDate(d.getDate() - 1);
      while (days.has(d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate())) { n++; d.setDate(d.getDate() - 1); }
      return n;
    }
    function drawLog() {
      const week = Date.now() - 7 * 86400000;
      const total = log.reduce(function (a, e) { return a + (e.min || 0); }, 0);
      const wk = log.filter(function (e) { return e.t > week; }).reduce(function (a, e) { return a + (e.min || 0); }, 0);
      statsEl.innerHTML = '';
      [[streak(), 'day streak'], [wk, 'min this week'], [Math.round(total / 60 * 10) / 10, 'hours total']].forEach(function (s) { statsEl.appendChild(h('div', h('b', String(s[0])), h('span', s[1]))); });
      listEl.innerHTML = '';
      if (!log.length) listEl.appendChild(h('p.muted.small', 'No sessions yet. Log your first one.'));
      log.slice(0, 30).forEach(function (e, i) {
        listEl.appendChild(h('div', h('small', new Date(e.t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + e.min + 'm'), h('span', { style: { flex: 1 } }, e.note || ''),
          h('button.btn.small.ghost', { type: 'button', text: '×', 'aria-label': 'Delete entry', onclick: function () { log.splice(i, 1); UI.store.set('log', log); drawLog(); } })));
      });
    }
    const logCard = UI.card('Practice log', [statsEl, h('div.row', { style: { margin: '12px 0' } }, noteIn, minIn, h('button.btn.primary', { type: 'button', text: 'Log it', onclick: function () {
      const n = noteIn.value.trim(); if (!n) { noteIn.focus(); return; } addLog(Math.max(1, +minIn.value || 1), n); noteIn.value = '';
    } })), listEl]);
    drawLog();
    body.appendChild(daily);
    body.appendChild(h('div.grid2', runner, logCard));
  }

  const mod = { build: function (r) { root = r; }, shown: function (arg) { go(arg && ['practice', 'metronome', 'tuner', 'riff'].indexOf(arg) >= 0 ? arg : sub); } };
  App.register('tools', mod);
  return mod;
})();
