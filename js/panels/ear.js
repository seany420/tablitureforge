/* AXELAB · Ear trainer. */
const EarPanel = (function () {
  'use strict';
  const T = Theory, h = UI.h;
  let root, mode = 'intervals', q = null, els = {}, fb = null, nextT = null;
  const stats = UI.store.get('ear', {});
  const opt = Object.assign({ dir: 'up', level: 1, strings: 'all' }, UI.store.get('earOpt', {}));
  function saveOpt() { UI.store.set('earOpt', opt); }

  const MODES = [['intervals', 'Intervals'], ['chords', 'Chord quality'], ['scales', 'Scales & modes'], ['degrees', 'Scale degrees'], ['fretboard', 'Fretboard notes']];
  const IV_SETS = { 1: [3, 4, 5, 7, 12], 2: [2, 3, 4, 5, 7, 9, 10, 12], 3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
  const CH_SETS = { 1: ['', 'm'], 2: ['', 'm', 'dim', 'aug', 'sus4'], 3: ['', 'm', '7', 'maj7', 'm7', 'm7b5', 'dim7', 'sus4', 'aug'] };
  const SC_SETS = { 1: ['ionian', 'aeolian', 'pentatonic_minor', 'blues'], 2: ['ionian', 'aeolian', 'dorian', 'mixolydian', 'harmonic_minor', 'pentatonic_major'], 3: ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian', 'harmonic_minor', 'melodic_minor', 'whole_tone'] };
  const DEG_SETS = { 1: ['1', '3', '5'], 2: ['1', '2', '3', '4', '5', '6', '7'], 3: ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'] };

  function stat() { return (stats[mode] = stats[mode] || { right: 0, total: 0, streak: 0, best: 0 }); }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function note(m, t, dur, vel) { Sound.pluck(m, t, { ch: 'lead', vel: vel || 0.8, dur: dur || 0.9, type: 'clean' }); }
  function chordAt(rootMidi, q, t, dur) {
    const ivs = T.CHORDS[q].ivs;
    Sound.strum(ivs.map(function (v) { return { midi: rootMidi + v }; }), t, { ch: 'lead', vel: 0.7, dur: dur || 1.6, type: 'clean', spread: 0.025 });
  }

  function newQuestion() {
    clearTimeout(nextT);
    Sound.setLeadTone && Sound.setLeadTone('clean');
    const lv = opt.level;
    if (mode === 'intervals') {
      const semis = rnd(IV_SETS[lv]);
      const base = 48 + Math.floor(Math.random() * 12);
      q = { answer: semis, choices: IV_SETS[lv].map(function (s) { return [s, T.INTERVALS[s].name]; }), play: function () {
        const t = Sound.now() + 0.05;
        const lo = opt.dir === 'down' ? base + semis : base, hi = opt.dir === 'down' ? base : base + semis;
        if (opt.dir === 'harm') { note(base, t, 1.6); note(base + semis, t, 1.6); }
        else { note(lo, t, 0.8); note(hi, t + 0.7, 1.1); }
      }, reveal: T.INTERVALS[semis].name + ' (' + semis + ' frets) · ' + T.INTERVALS[semis].up };
    } else if (mode === 'chords') {
      const qq = rnd(CH_SETS[lv]);
      const base = 48 + Math.floor(Math.random() * 10);
      q = { answer: qq, choices: CH_SETS[lv].map(function (c) { return [c, T.CHORDS[c].name]; }), play: function () {
        const t = Sound.now() + 0.05;
        chordAt(base, qq, t, 1.5);
        T.CHORDS[qq].ivs.forEach(function (v, i) { note(base + v, t + 1.6 + i * 0.28, 0.6, 0.7); });
      }, reveal: T.CHORDS[qq].name + ': ' + T.pretty(T.CHORDS[qq].degs.join(' ')) };
    } else if (mode === 'scales') {
      const id = rnd(SC_SETS[lv]);
      const base = 52 + Math.floor(Math.random() * 7);
      q = { answer: id, choices: SC_SETS[lv].map(function (s) { return [s, T.SCALES[s].name]; }), play: function () {
        const t = Sound.now() + 0.05;
        const ivs = T.SCALES[id].ivs.concat([12]);
        ivs.forEach(function (v, i) { note(base + v, t + i * 0.26, 0.35, 0.75); });
        note(base, t + ivs.length * 0.26 + 0.1, 1.0, 0.6);
      }, reveal: T.SCALES[id].name + ': ' + T.pretty(T.SCALES[id].formula) };
    } else if (mode === 'degrees') {
      const key = Math.floor(Math.random() * 12);
      const deg = rnd(DEG_SETS[lv]);
      const base = 48 + key;
      const semis = T.degSemis(deg);
      q = { answer: deg, choices: DEG_SETS[lv].map(function (d) { return [d, T.pretty(d)]; }), play: function () {
        const t = Sound.now() + 0.05;
        // I – IV – V – I cadence establishes the key
        [[0, ''], [5, ''], [7, '7'], [0, '']].forEach(function (c, i) { chordAt(base + c[0] - (c[0] > 4 ? 12 : 0), c[1], t + i * 0.55, 0.5); });
        note(base + semis + (semis < 5 ? 12 : 0), t + 2.6, 1.4, 0.9);
      }, reveal: 'Degree ' + T.pretty(deg) + ' of ' + T.pretty(T.rootName(key, 'ionian')) + ' major (' + T.pretty(T.spell(T.rootName(key, 'ionian'), deg)) + ')' };
    } else {
      const strs = opt.strings === 'low' ? [0, 1] : opt.strings === 'mid' ? [2, 3] : opt.strings === 'high' ? [4, 5] : [0, 1, 2, 3, 4, 5];
      const s = rnd(strs), f = Math.floor(Math.random() * 13);
      const pc = T.mod12(Guitar.STD[s] + f);
      q = { answer: pc, choices: T.FLATS.map(function (n, i) { return [i, T.pretty(T.SHARPS[i] === n ? n : T.SHARPS[i] + '/' + n)]; }), s: s, f: f, play: function () { note(Guitar.STD[s] + f, Sound.now() + 0.05, 1.2); },
        reveal: 'String ' + (6 - s) + ', fret ' + f + ' = ' + T.pretty(T.SHARPS[pc] === T.FLATS[pc] ? T.SHARPS[pc] : T.SHARPS[pc] + ' / ' + T.FLATS[pc]) };
    }
    render();
    if (mode !== 'fretboard') App.audio().then(function () { q.play(); });
  }

  function render() {
    els.ans.innerHTML = '';
    els.fb.textContent = ''; els.fb.className = 'ear-fb';
    els.next.style.display = 'none';
    els.prompt.textContent = { intervals: 'Name the interval.', chords: 'What kind of chord is this?', scales: 'Which scale is this?', degrees: 'After the cadence, which scale degree is the last note?', fretboard: 'Name the highlighted note.' }[mode];
    els.neck.style.display = mode === 'fretboard' ? '' : 'none';
    els.replay.style.display = mode === 'fretboard' ? 'none' : '';
    if (mode === 'fretboard') {
      if (!fb) { fb = new Fretboard(els.cv, { frets: 12, compact: true, minFretW: 34 }); fb.onTap = null; }
      fb.marks = [{ s: q.s, f: q.f, color: '#c4563a', label: '?' }];
      fb.draw(true);
    }
    let tried = false;
    q.choices.forEach(function (c) {
      const b = h('button', { type: 'button', text: c[1] });
      b.addEventListener('click', function () {
        const st = stat();
        if (c[0] === q.answer) {
          b.classList.add('right');
          UI.$$('button', els.ans).forEach(function (x) { x.disabled = true; });
          if (!tried) { st.right++; st.streak++; st.best = Math.max(st.best, st.streak); }
          st.total += tried ? 0 : 1;
          els.fb.textContent = '✓ ' + q.reveal; els.fb.className = 'ear-fb ok';
          if (mode === 'fretboard') { fb.marks[0].label = T.pretty(T.FLATS[q.answer]); fb.marks[0].color = '#2d7a4a'; fb.draw(); App.previewNote(Guitar.STD[q.s] + q.f); }
          UI.store.set('ear', stats); score();
          els.next.style.display = '';
          nextT = setTimeout(newQuestion, mode === 'fretboard' ? 1100 : 2200);
        } else {
          b.classList.add('wrong'); b.disabled = true;
          if (!tried) { st.total++; st.streak = 0; tried = true; UI.store.set('ear', stats); score(); }
          els.fb.textContent = 'Not quite. Listen again.'; els.fb.className = 'ear-fb no';
          if (mode !== 'fretboard') q.play();
        }
      });
      els.ans.appendChild(b);
    });
  }
  function score() {
    const st = stat();
    els.score.innerHTML = '';
    els.score.appendChild(h('div', h('div.big', st.total ? Math.round(st.right / st.total * 100) + '%' : '–'), h('div.small.muted', st.right + ' / ' + st.total + ' first try')));
    els.score.appendChild(h('div', h('div.big', String(st.streak)), h('div.small.muted', 'streak')));
    els.score.appendChild(h('div', h('div.big', String(st.best)), h('div.small.muted', 'best streak')));
  }

  function build(r) {
    root = r;
    const nav = h('div.subnav');
    MODES.forEach(function (m) {
      const b = h('button', { type: 'button', text: m[1] });
      b.classList.toggle('on', m[0] === mode);
      b.addEventListener('click', function () { mode = m[0]; UI.$$('button', nav).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); settings(); score(); newQuestion(); });
      nav.appendChild(b);
    });
    els.settings = h('div.row');
    els.score = h('div.ear-score');
    els.prompt = h('div.prompt');
    els.replay = h('button.btn.primary', { type: 'button', text: '▶ Play again', onclick: function () { if (q) App.audio().then(q.play); } });
    els.ans = h('div.ear-ans');
    els.fb = h('div.ear-fb');
    els.next = h('button.btn', { type: 'button', text: 'Next →', onclick: newQuestion });
    els.cv = h('canvas');
    els.neck = h('div.fbwrap', els.cv);
    root.appendChild(nav);
    root.appendChild(UI.card(null, [els.settings, h('div.hr'), els.score]));
    root.appendChild(UI.card(null, h('div.ear-q', els.prompt, els.replay, els.neck, els.ans, els.fb, els.next)));
    root.appendChild(UI.card('How to practice', h('ul.small', { style: { paddingLeft: '20px', lineHeight: 1.8 } },
      h('li', 'Five minutes a day beats an hour once a week.'),
      h('li', 'Sing the answer before you choose it. Your voice trains your ear.'),
      h('li', 'Link each interval to a song you know (see Theory → Intervals).'),
      h('li', 'Move up a level when you score above 90% over 20 questions.'))));
    settings(); score();
  }
  function settings() {
    els.settings.innerHTML = '';
    els.settings.appendChild(UI.seg([[1, 'Level 1'], [2, 'Level 2'], [3, 'Level 3']], opt.level, function (v) { opt.level = v; saveOpt(); newQuestion(); }));
    if (mode === 'intervals') els.settings.appendChild(UI.seg([['up', 'Ascending'], ['down', 'Descending'], ['harm', 'Together']], opt.dir, function (v) { opt.dir = v; saveOpt(); newQuestion(); }));
    if (mode === 'fretboard') els.settings.appendChild(UI.seg([['all', 'All strings'], ['low', 'E & A'], ['mid', 'D & G'], ['high', 'B & e']], opt.strings, function (v) { opt.strings = v; saveOpt(); newQuestion(); }));
    els.settings.appendChild(h('button.btn.small', { type: 'button', text: 'Reset stats', onclick: function () { stats[mode] = { right: 0, total: 0, streak: 0, best: 0 }; UI.store.set('ear', stats); score(); } }));
  }

  const mod = { build: build, shown: function (arg) {
    if (arg && MODES.some(function (m) { return m[0] === arg; })) { mode = arg; UI.$$('.subnav button', root).forEach(function (b, i) { b.classList.toggle('on', MODES[i][0] === mode); }); settings(); score(); }
    if (!q || arg) newQuestion();
  } };
  App.register('ear', mod);
  return mod;
})();
