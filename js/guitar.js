/* ═══════════════════════════════════════════════════════════════
   AXELAB · Guitar geometry
   Tunings, fret math, playable scale positions and chord voicings.
   Strings are indexed 0 = lowest (low E) … 5 = highest (high e).
   ═══════════════════════════════════════════════════════════════ */
const Guitar = (function () {
  'use strict';
  const T = (typeof Theory !== 'undefined') ? Theory : require('./theory.js');

  const TUNINGS = {
    standard: { name: 'Standard (E A D G B E)', midi: [40, 45, 50, 55, 59, 64] },
    eb: { name: 'E♭ Standard (half step down)', midi: [39, 44, 49, 54, 58, 63] },
    d_std: { name: 'D Standard (whole step down)', midi: [38, 43, 48, 53, 57, 62] },
    drop_d: { name: 'Drop D (D A D G B E)', midi: [38, 45, 50, 55, 59, 64] },
    drop_c: { name: 'Drop C (C G C F A D)', midi: [36, 43, 48, 53, 57, 62] },
    dadgad: { name: 'DADGAD', midi: [38, 45, 50, 55, 57, 62] },
    open_g: { name: 'Open G (D G D G B D)', midi: [38, 43, 50, 55, 59, 62] },
    open_d: { name: 'Open D (D A D F♯ A D)', midi: [38, 45, 50, 54, 57, 62] },
    open_e: { name: 'Open E (E B E G♯ B E)', midi: [40, 47, 52, 56, 59, 64] }
  };
  const STD = TUNINGS.standard.midi;

  function stringNames(tuning) {
    return tuning.map(function (m, i) {
      const n = T.FLATS[T.mod12(m)].replace('Db', 'D♭').replace('Eb', 'E♭').replace('Gb', 'G♭').replace('Ab', 'A♭').replace('Bb', 'B♭');
      return i === tuning.length - 1 && T.mod12(m) === T.mod12(tuning[0]) ? n.toLowerCase() : n;
    });
  }

  /* ── Scale positions ───────────────────────────────────────
     5-note scales: 2 notes per string (the classic 5 boxes).
     6-note scales containing a pentatonic: pentatonic box + extra notes in reach.
     7+ note scales: 3 notes per string. */
  function seqNps(rootPc, sc, startDeg, nps, tuning) {
    const ivs = sc.ivs;
    const n = ivs.length;
    const fret0 = T.mod12(rootPc + ivs[startDeg] - tuning[0]);
    return seqFrom(fret0, sc, startDeg, nps, tuning) || seqFrom(fret0 + 12, sc, startDeg, nps, tuning);
  }
  function seqFrom(fret0, sc, startDeg, nps, tuning) {
    const ivs = sc.ivs;
    const n = ivs.length;
    let pitch = tuning[0] + fret0;
    let deg = startDeg;
    const notes = [];
    for (let s = 0; s < tuning.length; s++) {
      for (let k = 0; k < nps; k++) {
        let f = pitch - tuning[s];
        if (f < 0) return null;
        notes.push({ s: s, f: f, midi: pitch, deg: sc.degs[deg] });
        const next = (deg + 1) % n;
        let step = T.mod12(ivs[next] - ivs[deg]); if (step === 0) step = 12;
        pitch += step; deg = next;
      }
    }
    return notes;
  }
  function positions(rootPc, scaleId, tuning) {
    tuning = tuning || STD;
    const sc = T.scale(scaleId);
    if (!sc) return [];
    const n = sc.ivs.length;
    const out = [];
    if (n === 12) return [];
    if (n <= 5 || n === 6) {
      // For hexatonic scales, build from a pentatonic subset when one exists.
      let base = sc, extras = [];
      if (n === 6) {
        const pm = T.SCALES.pentatonic_minor, pM = T.SCALES.pentatonic_major;
        const has = function (sub) { return sub.ivs.every(function (v) { return sc.ivs.indexOf(v) >= 0; }); };
        if (has(pm)) base = pm; else if (has(pM)) base = pM; else base = null;
        if (base) extras = sc.ivs.map(function (v, i) { return { v: v, deg: sc.degs[i] }; }).filter(function (e) { return base.ivs.indexOf(e.v) < 0; });
      }
      if (base) {
        for (let d = 0; d < base.ivs.length; d++) {
          let notes = seqNps(rootPc, base, d, 2, tuning);
          if (!notes) continue;
          if (base !== sc) {
            // relabel degrees in the scale's own spelling and add extra tones inside the box
            notes.forEach(function (nn) { const i = sc.ivs.indexOf(T.mod12(nn.midi - rootPc)); nn.deg = sc.degs[i]; });
            const lo = Math.min.apply(null, notes.map(function (x) { return x.f; }));
            const hi = Math.max.apply(null, notes.map(function (x) { return x.f; }));
            extras.forEach(function (e) {
              for (let s = 0; s < tuning.length; s++) {
                for (let f = Math.max(0, lo - 1); f <= hi + 1; f++) {
                  if (T.mod12(tuning[s] + f - rootPc) === e.v && f >= lo - (f === lo - 1 ? 1 : 0)) {
                    const sNotes = notes.filter(function (x) { return x.s === s; });
                    const sLo = Math.min.apply(null, sNotes.map(function (x) { return x.f; }));
                    const sHi = Math.max.apply(null, sNotes.map(function (x) { return x.f; }));
                    if (f > sLo && f < sHi || f >= lo && f <= hi) notes.push({ s: s, f: f, midi: tuning[s] + f, deg: e.deg });
                  }
                }
              }
            });
            notes.sort(function (a, b) { return a.midi - b.midi; });
            notes = notes.filter(function (x, i, a) { return i === 0 || !(a[i - 1].s === x.s && a[i - 1].f === x.f); });
          }
          out.push(finishPos(notes, base === sc ? 'Box' : 'Box'));
        }
      } else {
        for (let d = 0; d < n; d++) { const notes = seqNps(rootPc, sc, d, 3, tuning); if (notes) out.push(finishPos(notes, '3NPS')); }
      }
    } else {
      for (let d = 0; d < n; d++) {
        const notes = seqNps(rootPc, sc, d, 3, tuning);
        if (notes) out.push(finishPos(notes, '3NPS'));
      }
    }
    // Keep musical order: position 1 starts on the root, then each following scale degree.
    out.forEach(function (p, i) { p.index = i; p.label = 'Position ' + (i + 1) + ' · frets ' + p.lo + '–' + p.hi; });
    return out;
  }
  function finishPos(notes, system) {
    const frets = notes.map(function (x) { return x.f; });
    const lo = Math.min.apply(null, frets), hi = Math.max.apply(null, frets);
    return { notes: notes, lo: lo, hi: hi, system: system, startDeg: notes[0].deg };
  }

  /** ASCII tab for one position: ascending then descending. */
  function positionTab(pos, tuning) {
    tuning = tuning || STD;
    const names = stringNames(tuning).map(function (n) { return n.replace('♭', 'b'); });
    const asc = pos.notes.slice();
    const seq = asc.concat(asc.slice(0, -1).reverse());
    const lines = names.map(function () { return ''; });
    seq.forEach(function (nt, i) {
      const w = String(nt.f).length;
      for (let s = 0; s < 6; s++) lines[s] += (s === nt.s ? String(nt.f) : '-'.repeat(w)) + '-';
      if (i === asc.length - 1) for (let s = 0; s < 6; s++) lines[s] += '|-';
    });
    return names.map(function (n, i) { return (n + ' ').slice(0, 2) + '|-' + lines[i] + '|'; }).reverse().join('\n');
  }

  /* ── Chord voicings ────────────────────────────────────────
     Templates are fret offsets from the root fret, one per string starting
     at the root string (null = muted). Root string 0 = low E, 1 = A, 2 = D. */
  const SHAPES = {
    0: { // E-shape family, root on low E
      '': [[0, 2, 2, 1, 0, 0], [0, -1, -3, -3, -3, 0, 'G']], 'm': [[0, 2, 2, 0, 0, 0]], '7': [[0, 2, 0, 1, 0, 0], [0, -1, -3, -3, -3, -2, 'G']], 'm7': [[0, 2, 0, 0, 0, 0]],
      'maj7': [[0, null, 1, 1, 0, null]], 'm7b5': [[0, null, 0, 0, -1, null]], 'dim7': [[0, null, -1, 0, -1, null]], 'dim': [[0, 1, 2, 0, null, null]],
      '5': [[0, 2, 2, null, null, null]], 'sus4': [[0, 2, 2, 2, 0, 0]], 'sus2': [[0, 2, 4, 4, null, null]], '7sus4': [[0, 2, 0, 2, 0, 0]],
      '6': [[0, 2, 2, 1, 2, 0]], 'm6': [[0, 2, 2, 0, 2, 0]], '9': [[0, null, 0, 1, 0, 2]], 'm9': [[0, null, 0, 0, 0, 2]],
      'maj9': [[0, null, 1, 1, 0, 2]], 'add9': [[0, 2, 2, 1, 0, 2]], 'aug': [[0, null, 2, 1, 1, null]], '13': [[0, null, 0, 1, 2, null]],
      'mMaj7': [[0, 2, 1, 0, 0, 0]], '7#5': [[0, null, 0, 1, 1, null]], 'madd9': [[0, 2, 4, 0, null, null]], '6/9': [[0, -1, -1, -1, 0, 0]],
      'm11': [[0, 0, 0, 0, null, null]], '7b9': [[0, null, 0, 1, 0, 1]], 'maj7#11': [[0, null, 1, 1, -1, null]]
    },
    1: { // A-shape family, root on A string
      '': [[0, 2, 2, 2, 0], [0, -1, -3, -2, -3, 'C']], 'm': [[0, 2, 2, 1, 0]], '7': [[0, 2, 0, 2, 0], [0, -1, 0, -2, 0, 'B7'], [0, -1, 0, -2, -3, 'C']], 'm7': [[0, 2, 0, 1, 0]],
      'maj7': [[0, 2, 1, 2, 0], [0, -1, -3, -3, -3, 'C']], 'm7b5': [[0, 1, 0, 1, null]], 'dim7': [[0, 1, -1, 1, null]], 'dim': [[0, 1, 2, 1, null]],
      '5': [[0, 2, 2, null, null]], 'sus4': [[0, 2, 2, 3, 0]], 'sus2': [[0, 2, 2, 0, 0]], '7sus4': [[0, 2, 0, 3, 0]],
      '6': [[0, 2, 2, 2, 2]], 'm6': [[0, null, -1, 1, 0]], '9': [[0, -1, 0, 0, 0]], 'm9': [[0, -2, 0, 0, 0]],
      'maj9': [[0, -1, 1, 0, null]], 'add9': [[0, 2, 4, 2, 0]], '7#9': [[0, -1, 0, 1, null]], '7b9': [[0, -1, 0, -1, null]],
      'aug': [[0, 3, 2, 2, null]], '13': [[0, -1, 0, 0, 2]], 'mMaj7': [[0, 2, 1, 1, 0]], 'madd9': [[0, -2, -3, 0, 0]],
      '6/9': [[0, -1, -1, 0, 0]], 'm11': [[0, 0, 0, 1, null]], '7#5': [[0, -1, 0, 1, 1]], 'maj7#11': [[0, 2, 1, 2, -1]]
    },
    2: { // D-shape family, root on D string
      '': [[0, 2, 3, 2]], 'm': [[0, 2, 3, 1]], '7': [[0, 2, 1, 2]], 'm7': [[0, 2, 1, 1]], 'maj7': [[0, 2, 2, 2], [0, -1, -2, -3, 'F']],
      'm7b5': [[0, 1, 1, 1]], 'dim7': [[0, 1, 0, 1]], 'dim': [[0, 1, 3, 1]], '5': [[0, 2, 3, null]], 'sus4': [[0, 2, 3, 3]],
      'sus2': [[0, 2, 3, 0]], '7sus4': [[0, 2, 1, 3]], '6': [[0, 2, 0, 2]], 'm6': [[0, 2, 0, 1]], 'aug': [[0, 3, 3, 2]], 'mMaj7': [[0, 2, 2, 1]]
    }
  };

  function voicingFromShape(rootPc, q, rs, shape, rootFret, tuning) {
    const frets = [null, null, null, null, null, null];
    for (let i = 0; i < 6 - rs; i++) {
      const off = shape[i];
      if (off === null || off === undefined || typeof off === 'string') continue;
      const f = rootFret + off;
      if (f < 0 || f > 20) return null;
      frets[rs + i] = f;
    }
    const pcs = T.chordPcs(rootPc, q);
    const v = { frets: frets, q: q, rootPc: rootPc, rootString: rs, notes: [] };
    for (let s = 0; s < 6; s++) {
      if (frets[s] === null) continue;
      const midi = tuning[s] + frets[s];
      if (pcs.indexOf(T.mod12(midi)) < 0) return null; // only valid in tunings where the template holds
      v.notes.push({ s: s, f: frets[s], midi: midi });
    }
    const fr = frets.filter(function (f) { return f !== null && f > 0; });
    v.lo = fr.length ? Math.min.apply(null, fr) : 0;
    v.hi = fr.length ? Math.max.apply(null, fr) : 0;
    v.center = fr.length ? fr.reduce(function (a, b) { return a + b; }, 0) / fr.length : 0;
    v.open = frets.some(function (f) { return f === 0; });
    return v;
  }

  const _vcache = {};
  /** All template voicings of a chord in standard-family tunings, low to high. */
  function voicings(rootPc, q, tuning) {
    tuning = tuning || STD;
    const key = rootPc + '|' + q + '|' + tuning.join(',');
    if (_vcache[key]) return _vcache[key];
    const out = [];
    [0, 1, 2].forEach(function (rs) {
      const shapes = (SHAPES[rs][q] || []);
      shapes.forEach(function (shape) {
        const tag = typeof shape[shape.length - 1] === 'string' ? shape[shape.length - 1] : null;
        const base = T.mod12(rootPc - tuning[rs]);
        [base, base + 12].forEach(function (rf) {
          if (tag && rf > 5) return; // open-only shapes (C, G)
          const v = voicingFromShape(rootPc, q, rs, shape, rf, tuning);
          if (v && v.hi - v.lo <= 4 && v.hi <= 17) { v.shape = tag || ['E', 'A', 'D'][rs]; out.push(v); }
        });
      });
    });
    if (!out.length) out.push.apply(out, searchVoicings(rootPc, q, tuning, 0, 12, 4));
    out.sort(function (a, b) { return a.center - b.center; });
    _vcache[key] = out;
    return out;
  }

  /** A chord in one named CAGED shape (C, A, G, E or D), anywhere on the neck. */
  function shapeVoicing(rootPc, q, shape, tuning) {
    tuning = tuning || STD;
    const fam = { E: [0, null], A: [1, null], D: [2, null], C: [1, 'C'], G: [0, 'G'] }[shape];
    if (!fam) return null;
    const list = (SHAPES[fam[0]][q] || []).filter(function (sh) {
      const tag = typeof sh[sh.length - 1] === 'string' ? sh[sh.length - 1] : null;
      return fam[1] ? tag === fam[1] : !tag;
    });
    for (let k = 0; k < list.length; k++) {
      const base = T.mod12(rootPc - tuning[fam[0]]);
      for (let rf = base; rf <= base + 12; rf += 12) {
        const v = voicingFromShape(rootPc, q, fam[0], list[k], rf, tuning);
        if (v && v.hi <= 20) { v.shape = shape; return v; }
      }
    }
    return null;
  }

  /** Brute-force voicing search for unusual chords or tunings. */
  function searchVoicings(rootPc, q, tuning, loFret, hiFret, maxStrings) {
    const pcs = T.chordPcs(rootPc, q);
    const res = [];
    for (let start = loFret; start <= hiFret; start++) {
      for (let rs = 0; rs <= 2; rs++) {
        const rf = (function () { for (let f = start; f < start + 4; f++) if (T.mod12(tuning[rs] + f) === rootPc) return f; return -1; })();
        if (rf < 0) continue;
        const frets = [null, null, null, null, null, null];
        frets[rs] = rf;
        const used = new Set([rootPc]);
        for (let s = rs + 1; s < 6 && s < rs + maxStrings; s++) {
          let best = null;
          for (let f = start; f < start + 4; f++) {
            const pc = T.mod12(tuning[s] + f);
            if (pcs.indexOf(pc) < 0) continue;
            if (best === null || (!used.has(pc) && used.has(T.mod12(tuning[s] + best)))) best = f;
          }
          if (best !== null) { frets[s] = best; used.add(T.mod12(tuning[s] + best)); }
        }
        if (used.size >= Math.min(pcs.length, 3)) {
          const notes = [];
          frets.forEach(function (f, s) { if (f !== null) notes.push({ s: s, f: f, midi: tuning[s] + f }); });
          const fr = notes.map(function (n) { return n.f; });
          res.push({ frets: frets, q: q, rootPc: rootPc, rootString: rs, notes: notes, lo: Math.min.apply(null, fr), hi: Math.max.apply(null, fr),
            center: fr.reduce(function (a, b) { return a + b; }, 0) / fr.length, shape: 'Custom' });
          break;
        }
      }
      if (res.length >= 3) break;
    }
    return res;
  }

  /** Choose the voicing closest to `prev`, inside a preferred fret zone. */
  function chooseVoicing(rootPc, q, opts) {
    opts = opts || {};
    const list = voicings(rootPc, q, opts.tuning);
    const target = opts.prev ? opts.prev.center : (opts.zone || 4);
    let best = null, bestScore = 1e9;
    list.forEach(function (v) {
      let sc = Math.abs(v.center - target);
      if (opts.zone !== undefined) sc += Math.abs(v.center - opts.zone) * 0.5;
      if (opts.minStrings && v.notes.length < opts.minStrings) sc += 6;
      if (opts.preferRoot !== undefined && v.rootString !== opts.preferRoot) sc += 1.5;
      if (sc < bestScore) { bestScore = sc; best = v; }
    });
    return best;
  }

  /** Power chord on the low strings (root, 5th, octave). */
  function powerChord(rootPc, opts) {
    opts = opts || {};
    const tuning = opts.tuning || STD;
    const cands = [];
    [0, 1].forEach(function (rs) {
      let rf = T.mod12(rootPc - tuning[rs]);
      [rf, rf + 12].forEach(function (f) {
        if (f > 14) return;
        const notes = [{ s: rs, f: f, midi: tuning[rs] + f }];
        // Find the 5th on the next string (works for standard and drop tunings)
        const f5 = tuning[rs] + f + 7 - tuning[rs + 1];
        if (f5 >= 0) notes.push({ s: rs + 1, f: f5, midi: tuning[rs] + f + 7 });
        const f8 = tuning[rs] + f + 12 - tuning[rs + 2];
        if (f8 >= 0 && opts.octave !== false) notes.push({ s: rs + 2, f: f8, midi: tuning[rs] + f + 12 });
        cands.push({ notes: notes, center: f, rootString: rs, q: '5', rootPc: rootPc });
      });
    });
    const target = opts.prev ? opts.prev.center : (opts.zone || 3);
    cands.sort(function (a, b) { return Math.abs(a.center - target) + (a.rootString ? 0.6 : 0) - Math.abs(b.center - target) - (b.rootString ? 0.6 : 0); });
    return cands[0];
  }

  /** Small upper-structure voicing on strings G-B-e (or D-G-B) for funk, reggae and pop stabs. */
  function upperTriad(rootPc, q, opts) {
    opts = opts || {};
    const tuning = opts.tuning || STD;
    const pcs = T.chordPcs(rootPc, q);
    const want = pcs.length > 3 ? [pcs[1], pcs[pcs.length - 1 > 3 ? 3 : 2], pcs[0]] : pcs; // 3rd, 7th, root for 7th chords
    const strings = opts.strings || [3, 4, 5];
    let best = null, bestScore = 1e9;
    const target = opts.prev ? opts.prev.center : (opts.zone || 8);
    for (let start = 0; start <= 14; start++) {
      const fr = [];
      let ok = true;
      const used = new Set();
      strings.forEach(function (s) {
        let pick = null;
        for (let f = start; f < start + 4; f++) {
          const pc = T.mod12(tuning[s] + f);
          if (want.indexOf(pc) >= 0 && !used.has(pc)) { pick = f; break; }
        }
        if (pick === null) ok = false; else { fr.push(pick); used.add(T.mod12(tuning[s] + pick)); }
      });
      if (!ok) continue;
      const center = fr.reduce(function (a, b) { return a + b; }, 0) / fr.length;
      const sc = Math.abs(center - target) + (used.has(pcs[1]) ? 0 : 3);
      if (sc < bestScore) {
        bestScore = sc;
        best = { notes: strings.map(function (s, i) { return { s: s, f: fr[i], midi: tuning[s] + fr[i] }; }), center: center, q: q, rootPc: rootPc };
      }
    }
    return best;
  }

  /** Shell voicing (root, 3rd, 7th) on the low/middle strings for jazz comping. */
  function shellVoicing(rootPc, q, opts) {
    opts = opts || {};
    const tuning = opts.tuning || STD;
    const ch = T.CHORDS[q] || T.CHORDS[''];
    const third = T.mod12(rootPc + ch.ivs[1]);
    const seventh = ch.ivs.length > 3 ? T.mod12(rootPc + ch.ivs[3]) : T.mod12(rootPc + ch.ivs[2]);
    const target = opts.prev ? opts.prev.center : (opts.zone || 5);
    const cands = [];
    // [root string, string for 2nd tone, string for 3rd tone, order]
    const layouts = [[0, 1, 2, [third, seventh]], [0, 2, 3, [seventh, third]], [1, 2, 3, [third, seventh]], [1, 3, 4, [seventh, third]]];
    layouts.forEach(function (L) {
      const rs = L[0];
      const rf0 = T.mod12(rootPc - tuning[rs]);
      [rf0, rf0 + 12].forEach(function (rf) {
        if (rf > 13) return;
        const notes = [{ s: rs, f: rf, midi: tuning[rs] + rf }];
        let ok = true;
        [L[1], L[2]].forEach(function (sIdx, k) {
          let f = T.mod12(L[3][k] - tuning[sIdx]);
          while (f < rf - 3) f += 12;
          if (f > rf + 4) f -= 12;
          if (f < 0 || Math.abs(f - rf) > 3) ok = false;
          notes.push({ s: sIdx, f: f, midi: tuning[sIdx] + f });
        });
        if (!ok) return;
        const fr = notes.map(function (n) { return n.f; });
        cands.push({ notes: notes, center: fr.reduce(function (a, b) { return a + b; }, 0) / 3, q: q, rootPc: rootPc });
      });
    });
    cands.sort(function (a, b) { return Math.abs(a.center - target) - Math.abs(b.center - target); });
    return cands[0] || chooseVoicing(rootPc, q, opts);
  }

  /** Fret positions of a pitch class across the neck. */
  function findPc(pc, tuning, maxFret) {
    tuning = tuning || STD; maxFret = maxFret || 22;
    const out = [];
    for (let s = 0; s < tuning.length; s++) for (let f = 0; f <= maxFret; f++) if (T.mod12(tuning[s] + f) === pc) out.push({ s: s, f: f });
    return out;
  }

  return { TUNINGS, STD, stringNames, positions, positionTab, voicings, chooseVoicing, shapeVoicing, powerChord, upperTriad, shellVoicing, findPc };
})();
if (typeof module !== 'undefined') module.exports = Guitar;
