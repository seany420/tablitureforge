/* ═══════════════════════════════════════════════════════════════
   AXELAB · Tablature engine
   Parses ASCII tab, renders it as clean engraved SVG, and plays it
   back with bends, slides, legato and vibrato. Optional live neck.
   ═══════════════════════════════════════════════════════════════ */
const Tab = (function () {
  'use strict';
  const SVGNS = 'http://www.w3.org/2000/svg';
  const HARMONIC = { 12: 12, 7: 19, 5: 24, 4: 28, 9: 28, 3: 31, 2: 36 };

  /* ── Parsing ───────────────────────────────────────────── */
  function isTabLine(line) {
    const body = line.replace(/^\s*[A-Ga-g][#b]?\s*(?=[|:\-])/, '');
    if ((body.match(/-/g) || []).length < 3) return false;
    const ok = (body.match(/[-0-9|:hpbrxXt~\/\\()<>^v.=*sS\s]/g) || []).length;
    return ok / body.length > 0.9;
  }

  function parse(text) {
    const raw = String(text || '').replace(/\t/g, '    ').split('\n');
    const systems = [];
    let cur = null;
    raw.forEach(function (line) {
      if (isTabLine(line)) {
        if (!cur) { cur = { lines: [], annot: [] }; systems.push(cur); }
        cur.lines.push(line);
      } else {
        if (cur && cur.lines.length) cur = null;
      }
    });
    const notes = [];
    const bars = [];
    let offset = 0;
    let nStrings = 6;
    systems.forEach(function (sys) {
      const n = sys.lines.length;
      nStrings = Math.max(nStrings, n);
      let maxLen = 0;
      sys.lines.forEach(function (line, row) {
        const s = n - 1 - row; // top line = highest string
        const m = /^(\s*[A-Ga-g][#b]?\s*)?([|:])?/.exec(line);
        const start = m ? m[0].length : 0;
        const body = line.slice(start);
        maxLen = Math.max(maxLen, body.length);
        let prev = null, pending = null, i = 0;
        while (i < body.length) {
          const c = body.charAt(i);
          if (/[0-9]/.test(c) || c === '(' || c === '<') {
            let j = i, ghost = false, harm = false;
            if (c === '(') { ghost = true; j++; }
            if (c === '<') { harm = true; j++; }
            let num = '';
            while (j < body.length && /[0-9]/.test(body.charAt(j)) && num.length < 2) num += body.charAt(j++);
            if (!num) { i++; continue; }
            if (+num > 24 && num.length === 2) { num = num.charAt(0); j--; }
            if (ghost && body.charAt(j) === ')') j++;
            if (harm && body.charAt(j) === '>') j++;
            const nt = { s: s, f: +num, col: offset + i + (ghost || harm ? 1 : 0), w: num.length, ghost: ghost, harm: harm, end: offset + j };
            if (pending) { nt.from = pending; if (prev) prev.to = pending; pending = null; }
            notes.push(nt);
            prev = nt;
            i = j;
            continue;
          }
          if (c === 'h' || c === 'p' || c === 't' || c === 'T') { pending = c.toLowerCase(); i++; continue; }
          if (c === '/' || c === '\\') { pending = c === '/' ? 'su' : 'sd'; i++; continue; }
          if (c === 'b' && prev) {
            let j = i + 1, num = '';
            while (j < body.length && /[0-9]/.test(body.charAt(j)) && num.length < 2) num += body.charAt(j++);
            prev.bend = num ? Math.max(1, +num - prev.f) : 2;
            if (body.charAt(j) === 'r') {
              j++; let r = '';
              while (j < body.length && /[0-9]/.test(body.charAt(j)) && r.length < 2) r += body.charAt(j++);
              prev.release = true;
            }
            prev.end = offset + j;
            i = j; continue;
          }
          if (c === 'r' && prev) {
            let j = i + 1;
            while (j < body.length && /[0-9]/.test(body.charAt(j))) j++;
            prev.release = true; prev.end = offset + j; i = j; continue;
          }
          if (c === '~' && prev) { prev.vib = true; i++; if (prev.end === offset + i - 1) prev.end = offset + i; continue; }
          if (c === 'x' || c === 'X') {
            const nt = { s: s, f: 0, col: offset + i, w: 1, dead: true, end: offset + i + 1 };
            notes.push(nt); prev = nt; i++; continue;
          }
          if (c === '|') { bars.push({ col: offset + i, s: s }); }
          i++;
        }
      });
      offset += maxLen + 2;
    });
    // Snap columns: a note starting inside a 2-digit note on another string belongs to that column
    const wide = notes.filter(function (n) { return n.w === 2; });
    notes.forEach(function (n) {
      wide.forEach(function (w) { if (w !== n && w.s !== n.s && n.col === w.col + 1) n.col = w.col; });
    });
    // Bar lines: columns where most strings show a pipe
    const barCount = {};
    bars.forEach(function (b) { barCount[b.col] = (barCount[b.col] || 0) + 1; });
    const lineCount = Math.max(1, systems.reduce(function (a, s) { return Math.max(a, s.lines.length); }, 0));
    const lastCol = notes.length ? Math.max.apply(null, notes.map(function (n) { return n.end || n.col; })) : 0;
    const barCols = Object.keys(barCount).map(Number).filter(function (c) { return barCount[c] >= Math.ceil(lineCount / 2) && c < lastCol; });
    // Event columns
    const cols = Array.from(new Set(notes.map(function (n) { return n.col; }))).sort(function (a, b) { return a - b; });
    const events = cols.map(function (c) { return { col: c, notes: notes.filter(function (n) { return n.col === c; }).sort(function (a, b) { return a.s - b.s; }) }; });
    // Rhythm: free space after each event (ignoring note text and bar lines),
    // measured in units of the most common gap.
    const gaps = [];
    for (let i = 0; i < events.length - 1; i++) {
      const end = Math.max.apply(null, events[i].notes.map(function (n) { return n.end || (n.col + n.w); }));
      const nb = barCols.filter(function (b) { return b >= end && b < events[i + 1].col; }).length;
      gaps.push(Math.max(1, events[i + 1].col - end - nb * 2));
    }
    const count = {};
    gaps.forEach(function (g) { count[g] = (count[g] || 0) + 1; });
    let unit = 1, best = 0;
    Object.keys(count).forEach(function (g) { if (count[g] > best || (count[g] === best && +g < unit)) { best = count[g]; unit = +g; } });
    unit = Math.max(1, unit);
    let t = 0;
    events.forEach(function (e, i) {
      const g = i < gaps.length ? gaps[i] : unit;
      e.t = t;
      e.units = Math.max(1, Math.min(4, Math.round(g / unit)));
      t += e.units;
    });
    // Link legato/slide targets to the previous note on the same string
    const byString = {};
    events.forEach(function (e) {
      e.notes.forEach(function (n) {
        const p = byString[n.s];
        if (n.from && p) { n.prevNote = p; p.nextNote = n; }
        byString[n.s] = n;
      });
    });
    return { events: events, bars: barCols, strings: nStrings, totalUnits: t, unit: unit, empty: !events.length };
  }

  /* ── Compact notation → ASCII ──────────────────────────────
     Tokens separated by spaces. "|" = bar line, "-" = rest.
     Note: [h|p|t|/|\\]<string E A D G B e><fret|x>[b<fret>][r][~][*][:units]
     Chord: notes joined with "+", e.g. E3+A5+D5.  * = natural harmonic. */
  const SNAME = { E: 0, A: 1, D: 2, G: 3, B: 4, e: 5 };
  const NOTE_RE = /^([hpt\/\\])?([EADGBe])(x|\d{1,2})(b\d{0,2})?(r\d{0,2})?(~)?(\*)?$/;
  function parseCompact(src) {
    const out = [];
    String(src).trim().split(/\s+/).forEach(function (tok) {
      if (tok === '|') { out.push({ bar: true }); return; }
      let units = 1;
      const m = /:(\d+)$/.exec(tok);
      if (m) { units = +m[1]; tok = tok.slice(0, m.index); }
      if (tok === '-') { out.push({ rest: true, units: units }); return; }
      const parts = tok.split('+').map(function (p) {
        const r = NOTE_RE.exec(p);
        if (!r) throw new Error('Bad tab token "' + p + '" in ' + src);
        return { pre: r[1] || '', s: SNAME[r[2]], f: r[3] === 'x' ? 'x' : +r[3], bend: r[4] || '', rel: r[5] || '', vib: r[6] || '', harm: !!r[7] };
      });
      out.push({ notes: parts, units: units });
    });
    return out;
  }
  function fromCompact(src, tuning) {
    const ev = parseCompact(src);
    const names = Guitar.stringNames(tuning || Guitar.STD).map(function (n) { return n.replace('♭', 'b'); });
    const lines = [0, 1, 2, 3, 4, 5].map(function () { return '-'; });
    ev.forEach(function (e) {
      if (e.bar) { for (let s = 0; s < 6; s++) lines[s] += '|-'; return; }
      if (e.rest) { for (let s = 0; s < 6; s++) lines[s] += '-'.repeat(e.units * 2); return; }
      const core = {}, pre = {};
      e.notes.forEach(function (n) {
        pre[n.s] = n.pre;
        core[n.s] = (n.harm ? '<' + n.f + '>' : String(n.f)) + n.bend + n.rel + n.vib;
      });
      const w = Math.max.apply(null, Object.keys(core).map(function (k) { return core[k].length; }));
      for (let s = 0; s < 6; s++) {
        if (core[s] === undefined) { lines[s] += '-'.repeat(w + e.units); continue; }
        if (pre[s]) lines[s] = lines[s].slice(0, -1) + pre[s];
        lines[s] += (core[s] + '-'.repeat(w)).slice(0, w) + '-'.repeat(e.units);
      }
    });
    const L = Math.max.apply(null, lines.map(function (l) { return l.length; }));
    return names.map(function (n, i) { return (n + ' ').slice(0, 2) + '|' + (lines[i] + '-'.repeat(L)).slice(0, L) + '|'; }).reverse().join('\n');
  }
  /** Notes of a compact tab as MIDI/pitch classes, for verification and analysis. */
  function compactNotes(src, tuning) {
    tuning = tuning || Guitar.STD;
    const out = [];
    parseCompact(src).forEach(function (e) {
      (e.notes || []).forEach(function (n) {
        if (n.f === 'x') return;
        out.push({ s: n.s, f: n.f, midi: tuning[n.s] + (n.harm ? (HARMONIC[n.f] || n.f) : n.f) });
        if (n.bend) { const b = n.bend.slice(1); out.push({ s: n.s, f: b ? +b : n.f + 2, midi: tuning[n.s] + (b ? +b : n.f + 2), bent: true }); }
      });
    });
    return out;
  }

  /* ── Rendering ─────────────────────────────────────────── */
  function el(tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }

  function renderSVG(parsed, opts) {
    opts = opts || {};
    const nS = parsed.strings;
    const tuning = opts.tuning || (nS === 6 ? Guitar.STD : nS === 4 ? [28, 33, 38, 43] : Guitar.STD.slice(0, nS));
    const names = Guitar.stringNames(tuning);
    const rowH = opts.rowH || 15;
    const unitW = opts.unitW || 22;
    const padL = 30, padR = 16, top = 30;
    // x positions: compress long gaps, add room at bar lines
    const xs = [];
    let x = padL + 14;
    const barSet = parsed.bars.slice().sort(function (a, b) { return a - b; });
    const barXs = [];
    let bi = 0;
    parsed.events.forEach(function (e, i) {
      while (bi < barSet.length && barSet[bi] < e.col) {
        if (i > 0) { barXs.push(x - unitW * 0.45); x += 10; }
        bi++;
      }
      xs[i] = x;
      const wide = e.notes.some(function (n) { return n.w === 2 || n.bend; }) ? 6 : 0;
      x += Math.min(2.2, 0.7 + e.units * 0.55) * unitW + wide;
    });
    while (bi < barSet.length) { barXs.push(x - unitW * 0.4); bi++; }
    const W = Math.max(x + padR, 200);
    const H = top + (nS - 1) * rowH + 22;
    const svg = el('svg', { class: 'tabsvg', viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, role: 'img', 'aria-label': 'Guitar tablature' });
    const yOf = function (s) { return top + (nS - 1 - s) * rowH; };
    // staff
    el('text', { x: 6, y: top + (nS - 1) * rowH / 2 - 8, class: 'tab-clef' }, svg).textContent = 'T';
    el('text', { x: 6, y: top + (nS - 1) * rowH / 2 + 4, class: 'tab-clef' }, svg).textContent = 'A';
    el('text', { x: 6, y: top + (nS - 1) * rowH / 2 + 16, class: 'tab-clef' }, svg).textContent = 'B';
    for (let s = 0; s < nS; s++) {
      el('line', { x1: padL - 2, x2: W - padR + 6, y1: yOf(s), y2: yOf(s), class: 'tab-str' }, svg);
      el('text', { x: padL - 6, y: yOf(s) + 3.5, class: 'tab-sname', 'text-anchor': 'end' }, svg).textContent = names[s];
    }
    el('line', { x1: padL - 2, x2: padL - 2, y1: yOf(nS - 1), y2: yOf(0), class: 'tab-bar tab-bar-start' }, svg);
    el('line', { x1: W - padR + 6, x2: W - padR + 6, y1: yOf(nS - 1), y2: yOf(0), class: 'tab-bar tab-bar-end' }, svg);
    barXs.forEach(function (bx) { el('line', { x1: bx, x2: bx, y1: yOf(nS - 1), y2: yOf(0), class: 'tab-bar' }, svg); });
    // playhead
    const head = el('rect', { x: -40, y: top - 12, width: 22, height: (nS - 1) * rowH + 24, rx: 4, class: 'tab-head' }, svg);
    // techniques layer first so numbers sit on top
    const techG = el('g', { class: 'tab-tech' }, svg);
    const noteG = el('g', {}, svg);
    const noteEls = [];
    parsed.events.forEach(function (e, i) {
      const ex = xs[i];
      e.x = ex;
      noteEls[i] = [];
      e.notes.forEach(function (n) {
        const y = yOf(n.s);
        n.x = ex; n.y = y;
        const label = n.dead ? 'x' : n.harm ? '<' + n.f + '>' : n.ghost ? '(' + n.f + ')' : String(n.f);
        const w = label.length * 6.6 + 4;
        const g = el('g', { class: 'tab-note' + (n.ghost ? ' ghost' : '') + (n.dead ? ' dead' : '') }, noteG);
        el('rect', { x: ex - w / 2, y: y - 7, width: w, height: 14, rx: 3, class: 'tab-nbg' }, g);
        el('text', { x: ex, y: y + 4, 'text-anchor': 'middle', class: 'tab-num' }, g).textContent = label;
        noteEls[i].push(g);
        if (n.bend) {
          const amt = n.bend === 1 ? '½' : n.bend === 2 ? 'full' : n.bend === 3 ? '1½' : (n.bend / 2) + '';
          const bx = ex + w / 2 + 1;
          el('path', { d: 'M' + bx + ' ' + (y) + ' Q ' + (bx + 12) + ' ' + y + ' ' + (bx + 12) + ' ' + (top - 14), class: 'tab-bend' }, techG);
          el('path', { d: 'M' + (bx + 9) + ' ' + (top - 10) + ' L' + (bx + 12) + ' ' + (top - 16) + ' L' + (bx + 15) + ' ' + (top - 10) + 'Z', class: 'tab-arrow' }, techG);
          el('text', { x: bx + 12, y: top - 19, 'text-anchor': 'middle', class: 'tab-ann' }, techG).textContent = amt;
          if (n.release) el('text', { x: bx + 22, y: top - 8, class: 'tab-ann' }, techG).textContent = 'R';
        }
        if (n.vib) {
          let d = 'M' + (ex - 8) + ' ' + (top - 8);
          for (let k = 0; k < 4; k++) d += ' q 2 -3 4 0 t 4 0';
          el('path', { d: d, class: 'tab-vib' }, techG);
        }
      });
    });
    // legato arcs and slides need both notes positioned
    parsed.events.forEach(function (e) {
      e.notes.forEach(function (n) {
        if (!n.prevNote || !n.from) return;
        const p = n.prevNote;
        if (n.from === 'h' || n.from === 'p' || n.from === 't') {
          const mx = (p.x + n.x) / 2;
          el('path', { d: 'M' + (p.x + 2) + ' ' + (p.y - 8) + ' Q ' + mx + ' ' + (p.y - 17) + ' ' + (n.x - 2) + ' ' + (n.y - 8), class: 'tab-slur' }, techG);
          el('text', { x: mx, y: p.y - 15, 'text-anchor': 'middle', class: 'tab-ann small' }, techG).textContent = n.from === 't' ? 'T' : n.from.toUpperCase();
        } else if (n.from === 'su' || n.from === 'sd') {
          const up = n.f >= p.f;
          el('line', { x1: p.x + 7, y1: p.y + (up ? 4 : -4), x2: n.x - 7, y2: n.y + (up ? -4 : 4), class: 'tab-slide' }, techG);
        }
      });
      e.notes.forEach(function (n) {
        if (n.from && !n.prevNote && (n.from === 'su' || n.from === 'sd')) {
          el('line', { x1: n.x - 16, y1: n.y + (n.from === 'su' ? 4 : -4), x2: n.x - 8, y2: n.y + (n.from === 'su' ? -4 : 4), class: 'tab-slide' }, techG);
        }
      });
    });
    return { svg: svg, head: head, noteEls: noteEls, width: W };
  }

  /* ── Playback ──────────────────────────────────────────── */
  let current = null;
  function stopCurrent() { if (current) { current.stop(); current = null; } }

  function play(parsed, opts) {
    stopCurrent();
    opts = opts || {};
    const tuning = opts.tuning || Guitar.STD;
    const bpm = opts.bpm || 90;
    const unitDur = 60 / bpm / 2; // one most-common gap = an 8th note
    const timers = [];
    let stopped = false;
    const handle = {
      stop: function () {
        stopped = true; timers.forEach(clearTimeout);
        if (handle.srcs) handle.srcs.forEach(function (r) { try { r.src.stop(); } catch (e) { /* ignore */ } });
        if (opts.onEnd) opts.onEnd(true);
      }
    };
    current = handle;
    Sound.ensure().then(function () {
      if (stopped) return;
      Sound.setLeadTone(opts.tone || 'clean');
      const t0 = Sound.now() + 0.08;
      handle.srcs = [];
      const ringing = {};
      parsed.events.forEach(function (e, i) {
        const t = t0 + e.t * unitDur;
        const span = e.units * unitDur;
        e.notes.forEach(function (n) {
          if (n.from && n.prevNote && (n.from === 'su' || n.from === 'sd')) return; // handled by glide on previous note
          let midi = tuning[n.s] + n.f;
          if (n.harm) midi = tuning[n.s] + (HARMONIC[n.f] || n.f);
          // let ring until the next note on the same string, max 2.5s
          let nx = n.nextNote, dur = span * (e.notes.length > 1 ? 2.2 : 1.05);
          if (nx) {
            const ne = parsed.events.find(function (q) { return q.notes.indexOf(nx) >= 0; });
            if (ne) dur = Math.max(0.05, (ne.t - e.t) * unitDur + (nx.from === 'su' || nx.from === 'sd' ? (ne.units * unitDur) : 0));
          }
          dur = Math.min(dur, 2.5);
          const o = { ch: 'lead', vel: n.ghost ? 0.4 : n.dead ? 0.6 : (n.from === 'h' || n.from === 'p' || n.from === 't') ? 0.55 : 0.82, dur: dur, type: n.dead ? 'dead' : (opts.tone === 'clean' || opts.tone === 'jazz' ? 'clean' : 'bright'), release: 0.06 };
          if (n.bend) o.bend = { at: Math.min(0.08, span * 0.25), cents: n.bend * 100, time: Math.min(0.18, span * 0.5), release: n.release ? Math.max(0.2, span * 0.75) : undefined };
          if (n.vib) o.vibrato = { at: n.bend ? 0.25 : 0.12, depth: n.bend ? 18 : 32, rate: 5.6 };
          if (nx && (nx.from === 'su' || nx.from === 'sd')) {
            const ne = parsed.events.find(function (q) { return q.notes.indexOf(nx) >= 0; });
            o.slideTo = { at: Math.max(0.02, (ne.t - e.t) * unitDur - 0.06), semis: nx.f - n.f, time: 0.07 };
          }
          if (ringing[n.s]) { /* stopping previous handled by its own dur */ }
          const r = Sound.pluck(midi, t, o);
          if (r) handle.srcs.push(r);
          ringing[n.s] = true;
        });
        const delay = Math.max(0, (t - Sound.now()) * 1000);
        timers.push(setTimeout(function () { if (!stopped && opts.onEvent) opts.onEvent(i, e); }, delay));
      });
      const endT = (parsed.totalUnits * unitDur + 0.3) * 1000;
      timers.push(setTimeout(function () {
        if (stopped) return;
        if (opts.loop) { current = null; play(parsed, opts); return; }
        stopped = true; current = null;
        if (opts.onEnd) opts.onEnd(false);
      }, endT + 80));
    });
    return handle;
  }

  /* ── Widget ────────────────────────────────────────────── */
  /**
   * Mount a tab widget into `host`. text: ASCII tab. opts: {title, bpm, tone, neck, tuning, caption}
   */
  function mount(host, text, opts) {
    opts = opts || {};
    const parsed = parse(text);
    host.innerHTML = '';
    host.classList.add('tabw');
    if (parsed.empty) {
      const pre = document.createElement('pre'); pre.className = 'tab-raw'; pre.textContent = text; host.appendChild(pre); return null;
    }
    const bar = document.createElement('div'); bar.className = 'tab-toolbar';
    if (opts.title) { const h = document.createElement('div'); h.className = 'tab-title'; h.textContent = opts.title; bar.appendChild(h); }
    const playBtn = button('▶ Play', 'tab-btn primary');
    const speed = document.createElement('select'); speed.className = 'tab-sel'; speed.title = 'Speed';
    [40, 60, 80, 100, 120, 160].forEach(function (b) { const o = document.createElement('option'); o.value = b; o.textContent = b + ' bpm'; speed.appendChild(o); });
    speed.value = String(nearest([40, 60, 80, 100, 120, 160], opts.bpm || 80));
    const tone = document.createElement('select'); tone.className = 'tab-sel'; tone.title = 'Tone';
    [['clean', 'Clean'], ['blues', 'Blues'], ['crunch', 'Crunch'], ['lead', 'Lead'], ['metal', 'Metal'], ['jazz', 'Jazz']].forEach(function (p) { const o = document.createElement('option'); o.value = p[0]; o.textContent = p[1]; tone.appendChild(o); });
    tone.value = opts.tone || 'clean';
    const loopBtn = button('Loop', 'tab-btn toggle');
    const neckBtn = button('Neck', 'tab-btn toggle');
    const copyBtn = button('Copy', 'tab-btn');
    copyBtn.title = 'Copy as text';
    const ctl = document.createElement('div'); ctl.className = 'tab-ctl';
    [playBtn, speed, tone, loopBtn, neckBtn, copyBtn].forEach(function (b) { ctl.appendChild(b); });
    bar.appendChild(ctl);
    host.appendChild(bar);
    const scroller = document.createElement('div'); scroller.className = 'tab-scroll';
    const r = renderSVG(parsed, { tuning: opts.tuning });
    scroller.appendChild(r.svg);
    host.appendChild(scroller);
    if (opts.caption) { const c = document.createElement('div'); c.className = 'tab-cap'; c.textContent = opts.caption; host.appendChild(c); }
    let neckWrap = null, fb = null;
    function ensureNeck() {
      if (fb) return;
      neckWrap = document.createElement('div'); neckWrap.className = 'tab-neck';
      const cv = document.createElement('canvas'); neckWrap.appendChild(cv);
      host.appendChild(neckWrap);
      const maxF = Math.max(12, Math.min(22, Math.max.apply(null, parsed.events.map(function (e) { return Math.max.apply(null, e.notes.map(function (n) { return n.f + (n.bend || 0); })); })) + 1));
      fb = new Fretboard(cv, { frets: maxF, compact: true, tuning: opts.tuning || Guitar.STD, minFretW: 30 });
      fb.marks = [];
      fb.draw(true);
    }
    let looping = false, showNeck = !!opts.neck, playing = null;
    loopBtn.onclick = function () { looping = !looping; loopBtn.classList.toggle('on', looping); };
    neckBtn.onclick = function () {
      showNeck = !showNeck; neckBtn.classList.toggle('on', showNeck);
      if (showNeck) { ensureNeck(); neckWrap.style.display = ''; fb.draw(true); } else if (neckWrap) neckWrap.style.display = 'none';
    };
    if (showNeck) { neckBtn.classList.add('on'); setTimeout(function () { ensureNeck(); }, 0); }
    copyBtn.onclick = function () {
      try { navigator.clipboard.writeText(text); copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1200); } catch (e) { /* clipboard blocked */ }
    };
    function clearHi() {
      r.noteEls.forEach(function (arr) { arr.forEach(function (g) { g.classList.remove('on'); }); });
      r.head.setAttribute('x', -40);
      if (fb) { fb.marks = []; fb.draw(); }
    }
    playBtn.onclick = function () {
      if (playing) { playing.stop(); return; }
      playBtn.textContent = '■ Stop'; playBtn.classList.add('on');
      let lastI = -1;
      playing = play(parsed, {
        bpm: +speed.value, tone: tone.value, tuning: opts.tuning, loop: looping,
        onEvent: function (i, e) {
          if (lastI >= 0 && r.noteEls[lastI]) r.noteEls[lastI].forEach(function (g) { g.classList.remove('on'); });
          r.noteEls[i].forEach(function (g) { g.classList.add('on'); });
          lastI = i;
          r.head.setAttribute('x', e.x - 11);
          const sx = e.x - scroller.clientWidth / 2;
          if (Math.abs(scroller.scrollLeft - sx) > scroller.clientWidth * 0.3) scroller.scrollTo({ left: Math.max(0, sx), behavior: 'smooth' });
          if (fb && showNeck) {
            fb.marks = e.notes.filter(function (n) { return !n.dead; }).map(function (n) { return { s: n.s, f: n.f, color: '#c4563a', label: String(n.f) }; });
            fb.draw();
          }
        },
        onEnd: function () {
          playing = null; playBtn.textContent = '▶ Play'; playBtn.classList.remove('on'); clearHi();
        }
      });
    };
    return { parsed: parsed, stop: function () { if (playing) playing.stop(); } };
  }
  function button(label, cls) { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; return b; }
  function nearest(arr, v) { return arr.reduce(function (a, b) { return Math.abs(b - v) < Math.abs(a - v) ? b : a; }); }

  /** Upgrade every [data-tab] element inside root. The tab text is the element's text. */
  function upgradeAll(root) {
    (root || document).querySelectorAll('[data-tab]:not(.tabw), [data-tabc]:not(.tabw)').forEach(function (n) {
      let txt = n.getAttribute('data-tab') && n.getAttribute('data-tab') !== '' ? n.getAttribute('data-tab') : n.textContent;
      if (n.hasAttribute('data-tabc')) txt = fromCompact(n.getAttribute('data-tabc') || n.textContent);
      mount(n, txt.replace(/^\n+|\s+$/g, ''), {
        title: n.getAttribute('data-title') || '', bpm: +(n.getAttribute('data-bpm') || 80), tone: n.getAttribute('data-tone') || 'clean',
        neck: n.hasAttribute('data-neck'), caption: n.getAttribute('data-caption') || ''
      });
    });
  }

  return { parse, renderSVG, play, mount, upgradeAll, stop: stopCurrent, fromCompact, parseCompact, compactNotes };
})();
