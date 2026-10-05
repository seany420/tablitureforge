/* ═══════════════════════════════════════════════════════════════
   AXELAB · Virtual band
   Groove styles (drums, bass, guitar, keys) and a sample-accurate
   bar-by-bar scheduler that follows a resolved chord progression.

   Pattern language (one character per grid step):
     Drums  X accent · x normal · o soft · g ghost · . rest
     Bass   R root · 8 octave · 5 fifth · v fifth below · 3 third · 7 seventh · 6 sixth
            b approach from below · a approach from above · g ghost note · W walking
     Guitar D/d down strum · U/u up strum · P/p palm-muted chug · x dead scratch
            1-6 single string from the voicing (low→high) · 5/6/7 in boogie mode = dyad
     Keys   H hold · S stab · s soft stab
     Shared _ tie (extends previous) · . rest (cuts previous)
   ═══════════════════════════════════════════════════════════════ */
const Band = (function () {
  'use strict';
  const T = Theory, G = Guitar;

  const FILLS16 = [
    { from: 8, lanes: { snare: '........X.x.x.xX', kick: '........X.......', tom1: '................', tom2: '................' } },
    { from: 8, lanes: { snare: '........x.x.....', tom1: '............X.x.', tom2: '..............X.', tom3: '...............x', kick: '........X...X...' } },
    { from: 12, lanes: { snare: '............xXxX', kick: '............X...' } },
    { from: 8, lanes: { tom1: '........XxX.....', tom2: '...........xXx..', tom3: '..............XX', kick: '........X...X...', snare: '................' } }
  ];
  const FILLS12 = [
    { from: 6, lanes: { snare: '......X.xX.x', tom1: '.........x..', tom3: '...........X', kick: '......X.....' } },
    { from: 9, lanes: { snare: '.........XxX', kick: '.........X..' } },
    { from: 6, lanes: { tom1: '......Xxx...', tom2: '.........Xx.', tom3: '...........X', kick: '......X..X..' } }
  ];
  const FILLS6 = [{ from: 3, lanes: { snare: '...xxX', tom3: '......' } }, { from: 3, lanes: { tom1: '...X..', tom2: '....X.', tom3: '.....X' } }];

  const STYLES = {
    rock: {
      name: 'Classic Rock', feel: 'Straight 8ths', bpb: 4, spb: 4, phrase: 4, bpm: 118,
      drums: { kick: 'X.....x.X.x.....', snare: '....X.......X...', hhc: 'X.x.X.x.X.x.X.x.' },
      drumsB: { kick: 'X.....x.X.x...x.', snare: '....X.......X...', hhc: 'X.x.X.x.X.x.X.o.', hho: '..............x.' },
      bass: 'R.R.R.R.R.R.R.b.', bassStyle: 'pick', bassGate: 0.85,
      gtr: 'P.p.P.p.D.d.U.u.', voicing: 'power', zone: 3, tone: 'crunch', double: true, gtrGate: 0.9,
      keys: null, humanize: 0.5
    },
    hard_rock: {
      name: 'Hard Rock / Grunge', feel: 'Heavy straight 8ths', bpb: 4, spb: 4, phrase: 4, bpm: 104,
      drums: { kick: 'X.x...x.X.x...x.', snare: '....X.......X...', hhc: 'X.x.X.x.X.x.X...', hho: '............x...' },
      drumsB: { kick: 'X.x...x.X.xx..x.', snare: '....X.......X..x', ride: 'X.x.X.x.X.x.X.x.' },
      bass: 'R.R.R.R.R.R.R.b.', bassStyle: 'pick', bassGate: 0.9,
      gtr: 'D_____P.pD____p.', voicing: 'power', zone: 3, tone: 'lead', double: true, gtrGate: 0.95,
      keys: null, humanize: 0.45
    },
    metal: {
      name: 'Metal Gallop', feel: 'Driving 16th gallop', bpb: 4, spb: 4, phrase: 4, bpm: 150,
      drums: { kick: 'XxxxXxxxXxxxXxxx', snare: '....X.......X...', hhc: 'X.x.X.x.X.x.X.x.', bell: '................' },
      drumsB: { kick: 'XxxxXxxxXxxxXxxx', snare: '....X.......X...', ride: 'X.x.X.x.X.x.X.x.', bell: 'x...x...x...x...' },
      bass: 'R.RRR.RRR.RRR.RR', bassStyle: 'pick', bassGate: 0.7,
      gtr: 'P.ppP.ppP.ppD___', voicing: 'power', zone: 2, tone: 'metal', double: true, gtrGate: 0.9,
      keys: null, humanize: 0.25
    },
    thrash: {
      name: 'Thrash Skank Beat', feel: 'Fast, alternating kick/snare', bpb: 4, spb: 4, phrase: 4, bpm: 180,
      drums: { kick: 'X...x...x...x...', snare: '..X...X...X...X.', hhc: 'x.x.x.x.x.x.x.x.', crash: '................' },
      drumsB: { kick: 'X.x.x.x.x.x.x.x.', snare: '....X.......X...', crash: 'x...x...x...x...' },
      bass: 'R.R.R.R.R.R.R.R.', bassStyle: 'pick', bassGate: 0.8,
      gtr: 'PpppPpppPpppPppp', voicing: 'power', zone: 2, tone: 'metal', double: true, gtrGate: 0.95,
      keys: null, humanize: 0.2
    },
    blues_shuffle: {
      name: 'Blues Shuffle', feel: 'Swung triplet shuffle', bpb: 4, spb: 3, phrase: 4, bpm: 92,
      drums: { kick: 'X.....x.....', snare: '...X.....X..', hhc: 'X.xX.xX.xX.x' },
      drumsB: { kick: 'X.....x....x', snare: '...X....gX..', ride: 'X.xX.xX.xX.x' },
      bass: 'R.35.67.65.3', bassStyle: 'finger', bassGate: 0.9,
      gtr: '5.56.65.56.6', voicing: 'boogie', zone: 3, tone: 'blues', double: false, gtrGate: 0.85,
      keys: 'H___________', keysKind: 'organ', keysVol: 0.4, humanize: 0.5
    },
    slow_blues: {
      name: 'Slow Blues 12/8', feel: 'Slow triplet feel', bpb: 4, spb: 3, phrase: 4, bpm: 60,
      drums: { kick: 'X.....X..x..', snare: '...X.....X..', ride: 'Xxx' + 'xxx' + 'Xxx' + 'xxx' },
      drumsB: { kick: 'X.....X.....', snare: '...X.....X.g', hhc: 'XooxooXooxoo' },
      bass: 'R..5..8..5.b', bassStyle: 'finger', bassGate: 0.95,
      gtr: 'D_____d__u__', voicing: 'full', zone: 6, tone: 'blues', double: false, gtrGate: 0.95, gtrType: 'clean',
      keys: 'H___________', keysKind: 'organ', keysVol: 0.55, humanize: 0.55
    },
    funk: {
      name: 'Funk', feel: 'Syncopated 16ths, ghost notes', bpb: 4, spb: 4, phrase: 4, bpm: 100, swing: { type: 16, amount: 0.55 },
      drums: { kick: 'X..x...x..X.....', snare: '....X..g.g..X..g', hhc: 'XxXxXxXxXxXxXx.x', hho: '..............x.' },
      drumsB: { kick: 'X..x..x...X..x..', snare: '....X..g.g..X.gX', hhc: 'XxXxXxXxXxXxXxXx' },
      bass: 'R..8..R.g.R..8b.', bassStyle: 'slap', bassGate: 0.55,
      gtr: 'Dxx.xxUxDxxUxxUx', voicing: 'triad', zone: 8, tone: 'funk', double: false, gtrGate: 0.4, gtrType: 'bright',
      keys: null, keysKind: 'ep', humanize: 0.35
    },
    pop: {
      name: 'Pop Rock', feel: 'Straight 8ths, open chords', bpb: 4, spb: 4, phrase: 4, bpm: 104,
      drums: { kick: 'X.....x.X.......', snare: '....X.......X...', hhc: 'x.x.x.x.x.x.x.x.' },
      drumsB: { kick: 'X.....x.X.x.....', snare: '....X.......X...', hhc: 'x.x.x.x.x.x.x.o.', hho: '..............x.' },
      bass: 'R...R.R.R...R.b.', bassStyle: 'finger', bassGate: 0.9,
      gtr: 'D...D.U..UD.U.U.', voicing: 'full', zone: 3, tone: 'acoustic', double: true, gtrGate: 1, gtrType: 'clean',
      keys: 'H_______________', keysKind: 'pad', keysVol: 0.45, humanize: 0.45
    },
    ballad: {
      name: 'Ballad (half-time)', feel: 'Spacious, arpeggiated', bpb: 4, spb: 4, phrase: 4, bpm: 72,
      drums: { kick: 'X.........x.....', snare: '........X.......', hhc: 'o.o.o.o.o.o.o.o.' },
      drumsB: { kick: 'X.........x...x.', snare: '........X.......', ride: 'o.o.o.o.o.o.o.o.' },
      bass: 'R.......5.....b.', bassStyle: 'finger', bassGate: 1,
      gtr: '1.3.2.4.5.4.3.2.', voicing: 'full', zone: 3, tone: 'clean', double: false, gtrGate: 1, gtrType: 'clean',
      keys: 'H_______________', keysKind: 'ep', keysVol: 0.5, humanize: 0.5
    },
    ballad68: {
      name: 'Ballad 6/8', feel: 'Rolling triplets, doo-wop', bpb: 2, spb: 3, phrase: 4, bpm: 66,
      drums: { kick: 'X.....', snare: '...X..', hhc: 'XxxXxx' },
      drumsB: { kick: 'X....x', snare: '...X..', hhc: 'XxxXxx' },
      bass: 'R..5..', bassStyle: 'finger', bassGate: 1,
      gtr: '132432', voicing: 'full', zone: 3, tone: 'clean', double: false, gtrGate: 1, gtrType: 'clean',
      keys: 'H_____', keysKind: 'pad', keysVol: 0.4, humanize: 0.5
    },
    jazz_swing: {
      name: 'Jazz Swing', feel: 'Ride swing, walking bass', bpb: 4, spb: 3, phrase: 8, bpm: 130, jazz: true,
      drums: { ride: 'X..x.xX..x.x', hhp: '...X.....X..', kick: 'g..g..g..g..' },
      drumsB: { ride: 'X..x.xX..x.x', hhp: '...X.....X..', kick: 'g..g..g..g..' },
      bass: 'W..W..W..W..', bassStyle: 'upright', bassGate: 0.92,
      gtr: 'D..d..D..d..', voicing: 'shell', zone: 5, tone: 'jazz', double: false, gtrGate: 0.45, gtrType: 'clean',
      keys: null, keysKind: 'piano', humanize: 0.6
    },
    bossa: {
      name: 'Bossa Nova', feel: 'Latin straight 8ths', bpb: 4, spb: 4, phrase: 4, bpm: 132,
      drums: { kick: 'X..xX..xX..xX..x', rim: 'x..x..x...x..x..', shaker: 'xoxoxoxoxoxoxoxo' },
      drumsB: { kick: 'X..xX..xX..xX..x', rim: '..x..x...x..x...', shaker: 'xoxoxoxoxoxoxoxo' },
      bass: 'R.....5.5.....b.', bassStyle: 'upright', bassGate: 0.95,
      gtr: 'D..d..d...d..d..', voicing: 'full', zone: 5, tone: 'acoustic', double: false, gtrGate: 0.6, gtrType: 'nylon',
      keys: null, keysKind: 'ep', humanize: 0.4
    },
    reggae: {
      name: 'Reggae One Drop', feel: 'Offbeat skank, drop on 3', bpb: 4, spb: 3, phrase: 4, bpm: 76,
      drums: { kick: '......X.....', rim: '......X.....', hhc: 'x.xx.xx.xx.x' },
      drumsB: { kick: '......X.....', rim: '......X...g.', hhc: 'x.xx.xx.xx.x', hho: '...........x' },
      bass: '..R..R5..3.R', bassStyle: 'muted', bassGate: 0.8,
      gtr: '..U..U..U..U', voicing: 'triad', zone: 8, tone: 'funk', double: false, gtrGate: 0.25, gtrType: 'bright',
      keys: '..S..S..S..S', keysKind: 'organ', keysVol: 0.35, humanize: 0.35
    },
    country: {
      name: 'Country Train Beat', feel: 'Boom-chicka, brushes', bpb: 4, spb: 4, phrase: 4, bpm: 150,
      drums: { kick: 'X.......X.......', snare: 'ggggXgggggggXggg' },
      drumsB: { kick: 'X.......X.......', snare: 'ggxgXgxgggxgXgxg' },
      bass: 'R...5...R...v.b.', bassStyle: 'pick', bassGate: 0.8,
      gtr: '1...D.u.2...D.u.', voicing: 'full', zone: 2, tone: 'clean', double: false, gtrGate: 0.5, gtrType: 'bright',
      keys: null, keysKind: 'piano', humanize: 0.35
    },
    lofi: {
      name: 'Lo-Fi / Neo-Soul', feel: 'Lazy swung 16ths', bpb: 4, spb: 4, phrase: 4, bpm: 80, swing: { type: 16, amount: 0.62 },
      drums: { kick: 'X......x..X.....', rim: '....X.......X...', hhc: 'o.o.o.o.o.o.o.o.', shaker: '' },
      drumsB: { kick: 'X......x..X...x.', snare: '....X.......X...', hhc: 'o.o.o.o.o.o.o.oo' },
      bass: 'R.......R..5..b.', bassStyle: 'finger', bassGate: 0.85,
      gtr: '1..3..2...4.3...', voicing: 'full', zone: 6, tone: 'jazz', double: false, gtrGate: 1, gtrType: 'clean',
      keys: 'H______.S_....s.', keysKind: 'ep', keysVol: 0.6, humanize: 0.6
    }
  };

  const DRUM_VEL = { X: 1, x: 0.78, o: 0.5, g: 0.26 };
  const DRUM_LANES = ['kick', 'snare', 'rim', 'hhc', 'hho', 'hhp', 'ride', 'bell', 'crash', 'tom1', 'tom2', 'tom3', 'clap', 'shaker'];
  const LANE_LABEL = { kick: 'Kick', snare: 'Snare', rim: 'Rim', hhc: 'Hat', hho: 'Open Hat', hhp: 'Pedal Hat', ride: 'Ride', bell: 'Bell', crash: 'Crash', tom1: 'Tom 1', tom2: 'Tom 2', tom3: 'Floor Tom', clap: 'Clap', shaker: 'Shaker' };

  /* ── State ─────────────────────────────────────────────── */
  const S = {
    playing: false, bpm: 100, style: 'rock', prog: null, fills: true, countIn: true, click: false,
    humanize: 1, gtrOn: true, keysOn: true, drumOverride: null, loopCount: 0,
    beforeLoop: null
  };
  let barIdx = 0, nextBarTime = 0, timer = null, songBeat = 0, startBeatOffset = 0, counting = 0;
  let prevV = null, prevVc = -1, prevKeys = null, prevBassMidi = 36, curVoicing = null;
  const uiQ = [];
  const listeners = {};
  function on(evt, f) { (listeners[evt] = listeners[evt] || []).push(f); }
  function emit(evt, d) { (listeners[evt] || []).forEach(function (f) { f(d); }); }

  function style() { return STYLES[S.style] || STYLES.rock; }
  function lane(str, i) { return str && i < str.length ? str.charAt(i) : '.'; }

  /* ── Timing ────────────────────────────────────────────── */
  function beatDur() { return 60 / S.bpm; }
  function stepOffset(st, i) {
    const spb = st.spb;
    const beat = Math.floor(i / spb), j = i % spb;
    let frac = j / spb;
    if (st.swing && spb === 4) {
      const r = st.swing.amount;
      if (st.swing.type === 8) frac = [0, r * 0.5, r, r + (1 - r) * 0.5][j];
      else frac = [0, r * 0.5, 0.5, 0.5 + r * 0.5][j];
    }
    return (beat + frac) * beatDur();
  }

  /* ── Chord lookup ──────────────────────────────────────── */
  function chordIndexAtBeat(b) {
    const p = S.prog; if (!p) return 0;
    const t = ((b % p.totalBeats) + p.totalBeats) % p.totalBeats;
    for (let i = p.chords.length - 1; i >= 0; i--) if (p.chords[i].start <= t + 1e-6) return i;
    return 0;
  }
  function chordAtStep(barStartBeat, st, i) {
    return chordIndexAtBeat(barStartBeat + Math.floor(i / st.spb));
  }

  /* ── Voicings ──────────────────────────────────────────── */
  function voicingFor(ci, st) {
    if (ci === prevVc && curVoicing) return curVoicing;
    const c = S.prog.chords[ci];
    let v;
    const q = c.q;
    if (st.voicing === 'power' || st.voicing === 'boogie') v = G.powerChord(c.rootPc, { prev: prevV, zone: st.zone, octave: st.voicing !== 'boogie' });
    else if (st.voicing === 'triad') v = G.upperTriad(c.rootPc, q, { prev: prevV && prevV.kind === 'triad' ? prevV : null, zone: st.zone });
    else if (st.voicing === 'shell') v = G.shellVoicing(c.rootPc, q, { prev: prevV, zone: st.zone });
    else v = G.chooseVoicing(c.rootPc, q, { prev: prevV, zone: st.zone, minStrings: 4 });
    if (!v) v = G.chooseVoicing(c.rootPc, q, { zone: st.zone });
    v = Object.assign({}, v, { kind: st.voicing, sorted: v.notes.slice().sort(function (a, b) { return a.midi - b.midi; }) });
    prevV = v; prevVc = ci; curVoicing = v;
    return v;
  }
  function keysVoicing(c, st) {
    const ch = T.CHORDS[c.q] || T.CHORDS[''];
    let ivs = ch.ivs.slice();
    if (ivs.length === 2) ivs = [0, 7, 12];
    if ((st.jazz || st === STYLES.lofi) && ivs.length >= 4) { ivs = ivs.slice(1, 4).concat([14]); } // rootless with 9th
    const pcs = ivs.map(function (v) { return T.mod12(c.rootPc + v); });
    let best = null, bestCost = 1e9;
    for (let low = 50; low <= 62; low++) {
      if (pcs.indexOf(T.mod12(low)) < 0) continue;
      const notes = [low];
      let cur = low;
      const rest = pcs.slice();
      rest.splice(rest.indexOf(T.mod12(low)), 1);
      while (rest.length) {
        let k = 1; while (rest.indexOf(T.mod12(cur + k)) < 0) k++;
        cur += k; notes.push(cur); rest.splice(rest.indexOf(T.mod12(cur)), 1);
      }
      if (notes[notes.length - 1] > 76) continue;
      let cost = prevKeys ? notes.reduce(function (a, n, i) { return a + Math.abs(n - (prevKeys[i] || prevKeys[prevKeys.length - 1])); }, 0) : Math.abs(low - 55);
      if (cost < bestCost) { bestCost = cost; best = notes; }
    }
    prevKeys = best;
    return best || [60, 64, 67];
  }

  /* ── Bass notes ────────────────────────────────────────── */
  function bassBase(pc) { return 28 + T.mod12(pc - 4); }
  function nearestOct(target, prev, lo, hi) {
    let best = target, d = 1e9;
    for (let m = target - 24; m <= target + 24; m += 12) if (m >= lo && m <= hi && Math.abs(m - prev) < d) { d = Math.abs(m - prev); best = m; }
    return best;
  }
  function bassNote(tok, c, nx, changing) {
    const ivs = (T.CHORDS[c.q] || T.CHORDS['']).ivs;
    const base = bassBase(c.rootPc);
    const third = ivs.length > 2 ? ivs[1] : 4;
    const fifth = ivs.indexOf(7) >= 0 ? 7 : (ivs.indexOf(6) >= 0 ? 6 : ivs.indexOf(8) >= 0 ? 8 : 7);
    const sev = ivs.indexOf(10) >= 0 ? 10 : ivs.indexOf(11) >= 0 ? 11 : ivs.indexOf(9) >= 0 && c.q === 'dim7' ? 9 : 10;
    switch (tok) {
      case 'R': return base;
      case '8': return base + 12;
      case '5': return base + fifth;
      case 'v': return base + fifth - 12 >= 26 ? base + fifth - 12 : base + fifth;
      case '3': return base + third;
      case '7': return base + sev;
      case '6': return base + 9;
      case 'b': case 'a':
        if (changing && nx) { const tg = bassBase(nx.rootPc); return tok === 'b' ? tg - 1 : tg + 1; }
        return base + (tok === 'b' ? fifth : 12);
      case 'g': return base;
      default: return null;
    }
  }
  function walkNote(c, nx, beatInChord, beatsInChord, prev) {
    const lo = 28, hi = 50;
    if (beatInChord === 0) return nearestOct(bassBase(c.rootPc), prev, lo, hi);
    if (beatInChord === beatsInChord - 1 && nx) {
      const tgt = nearestOct(bassBase(nx.rootPc), prev, lo + 1, hi - 1);
      const r = Math.random();
      if (r < 0.45) return tgt - 1; if (r < 0.75) return tgt + 1;
      return nearestOct(bassBase(nx.rootPc) + 7, prev, lo, hi);
    }
    const pcs = c.pcs.concat(T.scalePcs(c.rootPc, (c.scales && c.scales[0]) ? c.scales[0].id : 'mixolydian').slice(0, 0));
    const cands = [];
    for (let m = lo; m <= hi; m++) if (pcs.indexOf(T.mod12(m)) >= 0 && m !== prev && Math.abs(m - prev) <= 7) cands.push(m);
    if (!cands.length) return prev + 2;
    cands.sort(function (a, b) { return Math.abs(a - prev) - Math.abs(b - prev) + (Math.random() - 0.5) * 3; });
    return cands[0];
  }

  /* ── Pattern reading ───────────────────────────────────── */
  function events(str, steps) {
    const ev = [];
    if (!str) return ev;
    for (let i = 0; i < steps; i++) {
      const ch = str.charAt(i % str.length);
      if (ch === '_' || ch === '') continue;
      if (ch === '.') { if (ev.length && ev[ev.length - 1].end === undefined) ev[ev.length - 1].end = i; continue; }
      if (ev.length && ev[ev.length - 1].end === undefined) ev[ev.length - 1].end = i;
      ev.push({ i: i, ch: ch });
    }
    if (ev.length && ev[ev.length - 1].end === undefined) ev[ev.length - 1].end = steps;
    return ev;
  }

  /* ── Bar generation ────────────────────────────────────── */
  function genBar(t0) {
    const st = style();
    const steps = st.bpb * st.spb;
    const barStart = songBeat;
    const hz = (st.humanize || 0.4) * S.humanize;
    const jitter = function () { return (Math.random() - 0.5) * 0.012 * hz; };
    const vj = function () { return 1 + (Math.random() - 0.5) * 0.18 * hz; };
    const tAt = function (i) { return t0 + stepOffset(st, i); };
    const stepLen = beatDur() / st.spb;
    const p = S.prog;

    // Count-in bar: sticks only
    if (counting > 0) {
      for (let b = 0; b < st.bpb; b++) Sound.drum('stick', t0 + b * beatDur(), b === 0 ? 1 : 0.8);
      for (let b = 0; b < st.bpb; b++) uiQ.push({ t: t0 + b * beatDur(), type: 'count', n: st.bpb - b, beat: b });
      counting--;
      return;
    }

    // Loop boundary hook (key cycling, tempo trainer) before anything is scheduled
    if (p && T.mod12 && barStart > 0 && barStart % p.totalBeats < st.bpb && Math.floor(barStart / p.totalBeats) > S.loopCount) {
      S.loopCount = Math.floor(barStart / p.totalBeats);
      if (S.beforeLoop) S.beforeLoop(S.loopCount);
    }
    const prog = S.prog;
    const phraseBar = barIdx % st.phrase;
    const isFill = S.fills && phraseBar === st.phrase - 1;
    const useB = st.drumsB && (barIdx % 2 === 1);
    const base = S.drumOverride || (useB ? st.drumsB : st.drums);

    // ── Drums
    let lanes = Object.assign({}, base);
    if (isFill && !S.drumOverride) {
      const pool = steps === 16 ? FILLS16 : steps === 12 ? FILLS12 : FILLS6;
      const fill = pool[Math.floor(Math.random() * pool.length)];
      lanes = {};
      Object.keys(base).forEach(function (k) { lanes[k] = base[k]; });
      Object.keys(fill.lanes).forEach(function (k) {
        const orig = lanes[k] || '.'.repeat(steps);
        let s = '';
        for (let i = 0; i < steps; i++) s += i < fill.from ? lane(orig, i) : lane(fill.lanes[k], i);
        lanes[k] = s;
      });
      ['hhc', 'hho', 'ride', 'bell', 'shaker'].forEach(function (k) {
        if (!lanes[k]) return;
        let s = '';
        for (let i = 0; i < steps; i++) s += i < fill.from ? lane(lanes[k], i) : '.';
        lanes[k] = s;
      });
    }
    const crashNow = phraseBar === 0 && (barIdx > 0 || !S.countIn) && !S.drumOverride;
    Object.keys(lanes).forEach(function (ln) {
      const str = lanes[ln];
      for (let i = 0; i < steps; i++) {
        const c = lane(str, i);
        const v = DRUM_VEL[c];
        if (!v) continue;
        if (crashNow && i === 0 && (ln === 'hhc' || ln === 'ride')) continue;
        Sound.drum(ln, tAt(i) + jitter(), v * vj());
      }
    });
    if (crashNow) { Sound.drum('crash', t0, 0.85); }
    if (st.jazz && !S.drumOverride) {
      // Jazz snare comping: sparse ghosted "chatter" on swung upbeats
      for (let i = 2; i < steps; i += 3) if (Math.random() < 0.18) Sound.drum('snare', tAt(i) + jitter(), 0.2 + Math.random() * 0.15);
      if (Math.random() < 0.15) Sound.drum('kick', tAt(steps - 1), 0.5);
    }
    if (S.click) for (let b = 0; b < st.bpb; b++) Sound.clickTo(t0 + b * beatDur(), b === 0);

    if (!prog) return;

    // ── Bass
    const bev = events(st.bass, steps);
    bev.forEach(function (e, k) {
      const ci = chordAtStep(barStart, st, e.i);
      const c = prog.chords[ci];
      const nextI = (k + 1 < bev.length) ? bev[k + 1].i : steps;
      const nci = chordAtStep(barStart, st, nextI >= steps ? steps : nextI);
      const nci2 = nextI >= steps ? chordIndexAtBeat(barStart + st.bpb) : nci;
      const changing = nci2 !== ci;
      let midi;
      if (e.ch === 'W') {
        const beatAbs = barStart + Math.floor(e.i / st.spb);
        const inC = ((beatAbs % prog.totalBeats) + prog.totalBeats) % prog.totalBeats - c.start;
        midi = walkNote(c, c.next, Math.round(inC), c.beats, prevBassMidi);
      } else midi = bassNote(e.ch, c, prog.chords[nci2], changing);
      if (midi === null) return;
      prevBassMidi = midi;
      const dur = Math.max(0.05, (stepOffset(st, e.end) - stepOffset(st, e.i)) * (st.bassGate || 0.9));
      const acc = (e.i % st.spb === 0) ? 1 : 0.82;
      Sound.bass(midi, tAt(e.i) + jitter() * 0.5, dur, 0.85 * acc * vj(), { ghost: e.ch === 'g' });
    });

    // ── Guitar
    if (S.gtrOn && st.gtr) {
      const gev = events(st.gtr, steps);
      const dbl = st.double;
      gev.forEach(function (e) {
        const ci = chordAtStep(barStart, st, e.i);
        const v = voicingFor(ci, st);
        if (!v) return;
        const t = tAt(e.i) + jitter();
        let dur = Math.max(0.04, (stepOffset(st, e.end) - stepOffset(st, e.i)) * (st.gtrGate || 0.9));
        const ch = e.ch;
        const upper = ch === ch.toUpperCase() && ch !== ch.toLowerCase();
        const vel = (upper ? 0.85 : 0.62) * vj();
        const gtype = st.gtrType || 'clean';
        const play = function (chan, offs, det) {
          if (/[1-6]/.test(ch) && st.voicing !== 'boogie') {
            const n = v.sorted[Math.min(v.sorted.length - 1, +ch - 1)];
            // Arpeggio notes ring until the chord changes
            let ringSteps = 0;
            for (let j = e.i; j < steps && chordAtStep(barStart, st, j) === ci; j++) ringSteps++;
            const ring = Math.max(dur, ringSteps * stepLen * 1.05);
            Sound.pluck(n.midi, t + offs, { ch: chan, vel: 0.72 * vj(), dur: ring, type: gtype, release: 0.12, detune: det });
          } else if (st.voicing === 'boogie' && /[5-7]/.test(ch)) {
            const root = v.sorted[0];
            const up = { '5': 7, '6': 9, '7': 10 }[ch];
            const c = prog.chords[ci];
            const upAdj = (up === 9 && c.kind === 'min') ? 9 : up;
            Sound.strum([{ midi: root.midi }, { midi: root.midi + upAdj }], t + offs, { ch: chan, vel: vel * (e.i % st.spb === 0 ? 1 : 0.8), dur: dur, type: 'clean', spread: 0.006, detune: det });
          } else if (ch === 'P' || ch === 'p') {
            const notes = v.sorted.slice(0, 2);
            Sound.strum(notes, t + offs, { ch: chan, vel: upper ? 0.95 : 0.75, dur: Math.min(dur, stepLen * 1.6), type: 'muted', spread: 0.004, detune: det });
          } else if (ch === 'x') {
            Sound.strum(v.sorted, t + offs, { ch: chan, vel: 0.5, dur: 0.06, type: 'dead', spread: 0.004, detune: det });
          } else if (/[DdUu]/.test(ch)) {
            Sound.strum(v.sorted, t + offs, { ch: chan, vel: vel, dir: ch.toUpperCase(), dur: dur, type: gtype, spread: (st.voicing === 'power' ? 0.006 : 0.011) * (ch === 'D' ? 1 : 0.8), detune: det });
          }
        };
        play('gtr', 0, 0);
        if (dbl) play('gtr2', 0.011 + Math.random() * 0.006, 6);
      });
    }

    // ── Keys
    if (S.keysOn && st.keys) {
      const kev = events(st.keys, steps);
      kev.forEach(function (e) {
        const ci = chordAtStep(barStart, st, e.i);
        // A held chord stops when the harmony changes
        let endStep = e.end;
        for (let j = e.i + 1; j < e.end; j++) if (chordAtStep(barStart, st, j) !== ci) { endStep = j; break; }
        const notes = keysVoicing(prog.chords[ci], st);
        const isStab = e.ch === 'S' || e.ch === 's';
        const dur = isStab ? Math.min(0.18, stepLen * 1.5) : Math.max(0.1, stepOffset(st, endStep) - stepOffset(st, e.i) - 0.02);
        Sound.keys(st.keysKind || 'ep', notes, tAt(e.i) + jitter(), dur, (e.ch === 's' ? 0.45 : 0.7) * (st.keysVol || 0.6) / 0.6 * vj());
        // Re-strike a held chord at chord changes inside the hold
        if (!isStab && endStep < e.end) {
          for (let j = endStep; j < e.end; j++) {
            const cj = chordAtStep(barStart, st, j);
            if (j === endStep || cj !== chordAtStep(barStart, st, j - 1)) {
              let k2 = j + 1; while (k2 < e.end && chordAtStep(barStart, st, k2) === cj) k2++;
              Sound.keys(st.keysKind || 'ep', keysVoicing(prog.chords[cj], st), tAt(j), stepOffset(st, k2) - stepOffset(st, j) - 0.02, 0.7 * (st.keysVol || 0.6) / 0.6);
            }
          }
        }
      });
    }

    // ── UI events: beats and chord changes
    for (let b = 0; b < st.bpb; b++) {
      const gb = barStart + b;
      const ci = chordIndexAtBeat(gb);
      const c = prog.chords[ci];
      const inC = ((gb % prog.totalBeats) + prog.totalBeats) % prog.totalBeats - c.start;
      uiQ.push({ t: t0 + b * beatDur(), type: 'beat', bar: barIdx, beat: b, chord: ci, beatsLeft: c.beats - inC, loop: Math.floor(gb / prog.totalBeats) });
      if (inC === 0 || (b === 0 && barIdx === 0)) uiQ.push({ t: t0 + b * beatDur(), type: 'chord', chord: ci });
    }
    for (let i = 0; i < steps; i++) uiQ.push({ t: tAt(i), type: 'step', step: i });
  }

  /* ── Transport ─────────────────────────────────────────── */
  function tick() {
    if (!S.playing) return;
    const ac = Sound.ctx;
    while (nextBarTime < ac.currentTime + 0.25) {
      const st = style();
      const wasCounting = counting > 0;
      genBar(nextBarTime);
      nextBarTime += st.bpb * beatDur();
      if (!wasCounting) { barIdx++; songBeat += st.bpb; }
    }
  }
  function uiLoop() {
    if (!S.playing && !uiQ.length) return;
    const ac = Sound.ctx;
    const lat = (ac.outputLatency || ac.baseLatency || 0);
    const nowT = ac.currentTime - lat;
    uiQ.sort(function (a, b) { return a.t - b.t; });
    while (uiQ.length && uiQ[0].t <= nowT) { const e = uiQ.shift(); emit(e.type, e); }
    requestAnimationFrame(uiLoop);
  }
  function start() {
    return Sound.ensure().then(function () {
      if (S.playing) return;
      S.playing = true;
      barIdx = 0; songBeat = startBeatOffset; S.loopCount = 0;
      prevV = null; prevVc = -1; curVoicing = null; prevKeys = null;
      counting = S.countIn ? 1 : 0;
      nextBarTime = Sound.ctx.currentTime + 0.08;
      uiQ.length = 0;
      tick();
      timer = setInterval(tick, 25);
      requestAnimationFrame(uiLoop);
      emit('start', {});
    });
  }
  function stop() {
    S.playing = false;
    clearInterval(timer); timer = null;
    uiQ.length = 0;
    Sound.stopAll();
    emit('stop', {});
  }
  function setProgression(p) {
    S.prog = p;
    prevVc = -1; curVoicing = null;
  }
  function setStyle(id) {
    if (!STYLES[id]) return;
    S.style = id;
    const st = STYLES[id];
    Sound.setGuitarTone(st.tone);
    Sound.setBassStyle(st.bassStyle);
    Sound.setKeysFx(st.keysKind || 'ep');
    Sound.setDouble(!!st.double);
    prevVc = -1; curVoicing = null; prevV = null;
    emit('style', { id: id });
  }
  /** Start playback from a given chord (used when tapping a chord in the timeline). */
  function setStartChord(ci) { startBeatOffset = S.prog ? S.prog.chords[ci].start - (S.prog.chords[ci].start % style().bpb) : 0; }

  /** Audition one chord with the current guitar sound. */
  function previewChord(chord) {
    Sound.ensure().then(function () {
      const v = G.chooseVoicing(chord.rootPc, chord.q, { zone: 3, minStrings: 4 });
      if (!v) return;
      Sound.strum(v.notes.slice().sort(function (a, b) { return a.midi - b.midi; }), Sound.now() + 0.03, { ch: 'lead', vel: 0.7, dur: 1.8, type: 'clean', spread: 0.02 });
    });
  }

  return {
    STYLES, DRUM_LANES, LANE_LABEL, state: S, on, start, stop, setProgression, setStyle, setStartChord, previewChord,
    style: style, voicingFor: function (ci) { return voicingFor(ci, style()); }, chordIndexAtBeat
  };
})();
