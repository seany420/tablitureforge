/* ═══════════════════════════════════════════════════════════════
   AXELAB · Fretboard view (canvas)
   Reusable: the Jam stage, the Neck explorer, lessons and quizzes
   each create their own instance.
   ═══════════════════════════════════════════════════════════════ */
const Fretboard = (function () {
  'use strict';
  const T = Theory;
  const ROLE_COLOR = { R: '#b8860b', n: '#1a6faa', t: '#b83232', d: '#6040a0', b: '#2d7a4a' };
  const ROLE_COLOR_DARK = { R: '#d9a520', n: '#3d8fd1', t: '#e05555', d: '#8a6ad0', b: '#3fa266' };
  const ROLE_LABEL = { R: 'Root', n: 'Stable', t: 'Tension', d: 'Dark', b: 'Bright' };
  const CHORD_DEG_COLOR = { '1': '#b8860b', '3': '#1a6faa', '5': '#2d7a4a', '7': '#6040a0', 'x': '#b83232' };

  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark' || (document.documentElement.getAttribute('data-theme') !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); }

  function FB(canvas, opts) {
    this.cv = canvas;
    this.o = Object.assign({
      frets: 15, startFret: 0, tuning: Guitar.STD, lefty: false, labels: 'names', mode: 'scale', // scale | chord | all | none
      compact: false, minFretW: 38, interactive: true
    }, opts || {});
    this.scale = null;       // {rootPc, id}
    this.chord = null;       // {rootPc, q, pcs}
    this.nextChord = null;
    this.riff = null;        // Set of pcs
    this.position = null;    // {notes:[{s,f}]} or null
    this.hideOutside = false;
    this.marks = [];         // [{s,f,color,label}] transient highlights (tab playback, quiz)
    this.alpha = {};
    this.raf = null;
    this.onTap = null;
    const self = this;
    if (this.o.interactive) {
      canvas.addEventListener('click', function (e) { self._click(e); });
    }
    this._ro = window.ResizeObserver ? new ResizeObserver(function () { self.draw(true); }) : null;
    if (this._ro) this._ro.observe(canvas.parentElement || canvas);
  }

  FB.prototype.set = function (patch) { Object.assign(this, patch); this.draw(); return this; };
  FB.prototype.setOpt = function (patch) { Object.assign(this.o, patch); this.draw(true); return this; };

  FB.prototype._geom = function () {
    const o = this.o;
    const wrap = this.cv.parentElement;
    const avail = Math.max(280, (wrap ? wrap.clientWidth : 600));
    const nF = o.frets - o.startFret;
    const want = Math.max(avail, 62 + nF * o.minFretW + 16);
    const W = Math.round(want);
    const H = o.compact ? 150 : 200;
    const lp = o.startFret === 0 ? 56 : 30, rp = 14, tp = 18, bp = 28;
    const fw = W - lp - rp, fh = H - tp - bp;
    // Fret positions: blend of real guitar scale length and equal spacing for readability
    const real = function (f) { return 1 - Math.pow(2, -f / 12); };
    const r0 = real(o.startFret), r1 = real(o.frets);
    const fx = [];
    for (let f = o.startFret; f <= o.frets; f++) {
      const rr = (real(f) - r0) / (r1 - r0);
      const lin = (f - o.startFret) / nF;
      let x = lp + (0.55 * rr + 0.45 * lin) * fw;
      if (o.lefty) x = W - x;
      fx[f] = x;
    }
    const nS = o.tuning.length;
    const sy = [];
    for (let s = 0; s < nS; s++) sy[s] = tp + ((nS - 1 - s) / (nS - 1)) * fh; // high string on top
    return { W: W, H: H, lp: lp, rp: rp, tp: tp, bp: bp, fw: fw, fh: fh, fx: fx, sy: sy };
  };

  FB.prototype._noteX = function (g, f) {
    const o = this.o;
    if (f === o.startFret && o.startFret === 0) return g.fx[0] + (o.lefty ? 20 : -20);
    if (f === o.startFret) return g.fx[f] + (o.lefty ? -8 : 8);
    return (g.fx[f - 1] + g.fx[f]) / 2;
  };

  /** Compute what each fret cell should show. */
  FB.prototype._cells = function () {
    const o = this.o, out = [];
    const sc = this.scale ? T.scale(this.scale.id) : null;
    const rootPc = this.scale ? this.scale.rootPc : null;
    const rootN = this.scale ? (this.scale.root || T.rootName(rootPc, this.scale.id)) : null;
    const names = {};
    if (sc) sc.degs.forEach(function (d, i) { names[T.mod12(rootPc + sc.ivs[i])] = { name: T.spell(rootN, d), deg: d }; });
    const chordPcs = this.chord ? this.chord.pcs : null;
    const chordDegs = {};
    if (this.chord) {
      const cq = T.CHORDS[this.chord.q] || T.CHORDS[''];
      cq.ivs.forEach(function (v, i) { chordDegs[T.mod12(this.chord.rootPc + v)] = cq.degs[i]; }, this);
    }
    const nextPcs = this.nextChord ? this.nextChord.pcs : null;
    const posSet = this.position ? new Set(this.position.notes.map(function (n) { return n.s + ':' + n.f; })) : null;
    const dark = isDark();
    const RC = dark ? ROLE_COLOR_DARK : ROLE_COLOR;
    const flats = rootN ? /b/.test(rootN) || ['F'].indexOf(rootN) >= 0 : false;
    for (let s = 0; s < o.tuning.length; s++) {
      for (let f = o.startFret; f <= o.frets; f++) {
        const pc = T.mod12(o.tuning[s] + f);
        const inScale = !!names[pc];
        const isChord = chordPcs && chordPcs.indexOf(pc) >= 0;
        const isNext = nextPcs && nextPcs.indexOf(pc) >= 0 && !isChord;
        const isRiff = this.riff && this.riff.has(pc);
        let show = false, color = '#8a7a60', label = '', role = null, chr = false, small = false;
        if (o.mode === 'chord') {
          if (isChord) {
            show = true;
            const cd = chordDegs[pc];
            const k = chordDegKey(cd);
            color = CHORD_DEG_COLOR[k];
            label = o.labels === 'none' ? '' : o.labels === 'names' ? (names[pc] ? names[pc].name : T.FLATS[pc]) : T.pretty(cd).replace('♭♭7', '°7');
          }
        } else if (o.mode === 'all') {
          show = true;
          small = !inScale;
          if (inScale) { role = T.toneRole(names[pc].deg, sc); color = RC[role]; }
          label = names[pc] ? (o.labels === 'degrees' ? names[pc].deg : names[pc].name) : (flats ? T.FLATS[pc] : T.SHARPS[pc]);
          if (o.labels === 'none') label = '';
        } else if (o.mode === 'scale') {
          if (inScale || isChord || isRiff) {
            show = true;
            if (inScale) {
              role = T.toneRole(names[pc].deg, sc); color = RC[role];
              chr = sc.char.indexOf(names[pc].deg) >= 0 && names[pc].deg !== '1';
            }
            const nm = inScale ? names[pc].name : (flats ? T.FLATS[pc] : T.SHARPS[pc]);
            if (o.labels === 'degrees') label = inScale ? names[pc].deg : '·';
            else if (o.labels === 'chord') label = chordDegs[pc] ? chordDegs[pc] : (inScale ? names[pc].deg : '');
            else if (o.labels === 'none') label = '';
            else label = nm;
          }
        }
        let inPos = true;
        if (posSet && show) inPos = posSet.has(s + ':' + f);
        let a = show ? 1 : 0;
        if (show && !inPos) a = this.hideOutside ? 0 : 0.22;
        if (show && o.mode === 'scale' && chordPcs && !isChord && this.dimNonChord) a *= 0.45;
        out.push({ s: s, f: f, pc: pc, show: show, alpha: a, color: color, label: T.pretty(String(label)), ring: show && isChord && o.mode !== 'chord' && inPos,
          next: isNext && inScale !== undefined && (show ? inPos : false), nextOnly: isNext && !show, riff: isRiff && show, root: pc === rootPc && o.mode !== 'chord', chr: chr, small: small });
      }
    }
    return out;
  };

  FB.prototype.draw = function (resize) {
    const cv = this.cv;
    if (!cv.isConnected || (cv.offsetParent === null && !this.o.offscreen)) return;
    const g = this._geom();
    const dpr = window.devicePixelRatio || 1;
    if (resize || cv.width !== Math.round(g.W * dpr) || cv.height !== Math.round(g.H * dpr)) {
      cv.width = Math.round(g.W * dpr); cv.height = Math.round(g.H * dpr);
      cv.style.width = g.W + 'px'; cv.style.height = g.H + 'px';
    }
    this.g = g;
    this.cells = this._cells();
    // animate alpha toward targets
    let moving = false;
    const self = this;
    this.cells.forEach(function (c) {
      const k = c.s * 100 + c.f;
      const cur = self.alpha[k] === undefined ? c.alpha : self.alpha[k];
      const next = cur + (c.alpha - cur) * 0.35;
      self.alpha[k] = Math.abs(next - c.alpha) < 0.02 ? c.alpha : next;
      if (self.alpha[k] !== c.alpha) moving = true;
    });
    this._paint(dpr);
    if (moving && !this.raf) {
      this.raf = requestAnimationFrame(function () { self.raf = null; self.draw(); });
    }
  };

  FB.prototype._paint = function (dpr) {
    const g = this.g, o = this.o, ctx = this.cv.getContext('2d');
    const dark = isDark();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, g.W, g.H);
    const x0 = Math.min(g.fx[o.startFret], g.fx[o.frets]), x1 = Math.max(g.fx[o.startFret], g.fx[o.frets]);
    // wood
    const grd = ctx.createLinearGradient(0, g.tp, 0, g.tp + g.fh);
    grd.addColorStop(0, '#5a3818'); grd.addColorStop(0.5, '#4a2e10'); grd.addColorStop(1, '#3e260d');
    ctx.fillStyle = grd;
    rr(ctx, x0 - 2, g.tp - 8, x1 - x0 + 4, g.fh + 16, 5); ctx.fill();
    // inlays
    [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].forEach(function (f) {
      if (f <= o.startFret || f > o.frets) return;
      const x = (g.fx[f - 1] + g.fx[f]) / 2;
      ctx.fillStyle = 'rgba(255,240,200,0.20)';
      if (f % 12 === 0) {
        circle(ctx, x, g.tp + g.fh * 0.25, 4.5); ctx.fill(); circle(ctx, x, g.tp + g.fh * 0.75, 4.5); ctx.fill();
      } else { circle(ctx, x, g.tp + g.fh / 2, 4.5); ctx.fill(); }
    });
    // frets
    for (let f = o.startFret; f <= o.frets; f++) {
      const nut = f === 0;
      ctx.strokeStyle = nut ? '#e8d9b0' : '#a89070';
      ctx.lineWidth = nut ? 5 : 1.6;
      ctx.beginPath(); ctx.moveTo(g.fx[f], g.tp - 7); ctx.lineTo(g.fx[f], g.tp + g.fh + 7); ctx.stroke();
      if (!nut) { ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(g.fx[f] + 1.4, g.tp - 7); ctx.lineTo(g.fx[f] + 1.4, g.tp + g.fh + 7); ctx.stroke(); }
    }
    // strings
    const n = o.tuning.length;
    for (let s = 0; s < n; s++) {
      const w = 0.7 + (n - 1 - s) * 0.42;
      ctx.strokeStyle = s < 3 ? '#c9a868' : '#d8d2c4';
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(x0, g.sy[s]); ctx.lineTo(x1, g.sy[s]); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = Math.max(0.4, w * 0.3);
      ctx.beginPath(); ctx.moveTo(x0, g.sy[s] - w * 0.25); ctx.lineTo(x1, g.sy[s] - w * 0.25); ctx.stroke();
    }
    // string names & fret numbers
    const names = Guitar.stringNames(o.tuning);
    ctx.font = '600 11px Barlow, system-ui, sans-serif';
    ctx.fillStyle = dark ? '#b8a888' : '#7a6040';
    ctx.textAlign = o.lefty ? 'left' : 'right';
    for (let s = 0; s < n; s++) {
      const xx = o.lefty ? g.W - 6 : (o.startFret === 0 ? 14 : 20);
      ctx.fillText(names[s], xx, g.sy[s] + 4);
    }
    ctx.textAlign = 'center';
    ctx.font = '600 10px Barlow, system-ui, sans-serif';
    for (let f = Math.max(1, o.startFret); f <= o.frets; f++) {
      const x = (g.fx[f - 1] !== undefined ? (g.fx[f - 1] + g.fx[f]) / 2 : g.fx[f]);
      const mark = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].indexOf(f) >= 0;
      ctx.fillStyle = mark ? (dark ? '#d9b860' : '#8a6420') : (dark ? '#7a7060' : '#a89880');
      ctx.fillText(String(f), x, g.H - 5);
    }
    // notes
    const self = this;
    const R = o.compact ? 10 : 11.5;
    const ringC = dark ? '#f2ead8' : '#1a1814';
    this.cells.forEach(function (c) {
      const a = self.alpha[c.s * 100 + c.f];
      const x = self._noteX(g, c.f), y = g.sy[c.s];
      if (c.nextOnly && self.showNext) {
        ctx.save(); ctx.globalAlpha = 0.8; ctx.setLineDash([2.5, 2.5]); ctx.strokeStyle = dark ? '#e8a060' : '#c4563a'; ctx.lineWidth = 1.6;
        circle(ctx, x, y, R - 3); ctx.stroke(); ctx.restore();
      }
      if (!a) return;
      ctx.save();
      ctx.globalAlpha = a;
      const r = c.small ? R - 4 : R;
      ctx.fillStyle = c.color;
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1;
      circle(ctx, x, y, r); ctx.fill();
      ctx.shadowColor = 'transparent';
      if (c.root) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; circle(ctx, x, y, r + 2); ctx.stroke(); }
      if (c.ring) { ctx.strokeStyle = ringC; ctx.lineWidth = 2.4; circle(ctx, x, y, r + (c.root ? 4.5 : 3)); ctx.stroke(); }
      if (c.next && self.showNext) { ctx.setLineDash([3, 2.5]); ctx.strokeStyle = dark ? '#e8a060' : '#c4563a'; ctx.lineWidth = 2; circle(ctx, x, y, r + (c.ring ? 7 : 3.5)); ctx.stroke(); ctx.setLineDash([]); }
      if (c.riff) { ctx.setLineDash([3, 2.5]); ctx.strokeStyle = ringC; ctx.lineWidth = 1.8; circle(ctx, x, y, r + (c.ring ? 7 : 3.5)); ctx.stroke(); ctx.setLineDash([]); }
      if (c.chr) { // character note: small diamond
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x + r - 1, y - r + 1); ctx.lineTo(x + r + 3, y - r + 5); ctx.lineTo(x + r - 1, y - r + 9); ctx.lineTo(x + r - 5, y - r + 5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = c.color; ctx.beginPath(); ctx.moveTo(x + r - 1, y - r + 2.5); ctx.lineTo(x + r + 1.6, y - r + 5); ctx.lineTo(x + r - 1, y - r + 7.5); ctx.lineTo(x + r - 3.6, y - r + 5); ctx.closePath(); ctx.fill();
      }
      if (c.label) {
        ctx.fillStyle = '#fff';
        const len = c.label.length;
        ctx.font = '700 ' + (c.small ? 8 : len > 2 ? 8.5 : len > 1 ? 10 : 11) + 'px Barlow, system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(c.label, x, y + 0.5);
        ctx.textBaseline = 'alphabetic';
      }
      ctx.restore();
    });
    // transient marks (tab playback, quiz)
    this.marks.forEach(function (m) {
      if (m.f < o.startFret || m.f > o.frets) return;
      const x = self._noteX(g, m.f), y = g.sy[m.s];
      ctx.save();
      ctx.fillStyle = m.color || '#c4563a';
      ctx.shadowColor = m.color || '#c4563a'; ctx.shadowBlur = 10;
      circle(ctx, x, y, R + 1); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff'; ctx.font = '700 11px Barlow, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(m.label !== undefined ? m.label : String(m.f), x, y + 0.5);
      ctx.restore();
    });
  };

  FB.prototype.hit = function (clientX, clientY) {
    const rect = this.cv.getBoundingClientRect();
    const mx = clientX - rect.left, my = clientY - rect.top;
    const g = this.g; if (!g) return null;
    let best = null, bd = 1e9;
    for (let s = 0; s < this.o.tuning.length; s++) {
      for (let f = this.o.startFret; f <= this.o.frets; f++) {
        const x = this._noteX(g, f), y = g.sy[s];
        const d = Math.hypot(mx - x, (my - y) * 1.3);
        if (d < bd) { bd = d; best = { s: s, f: f }; }
      }
    }
    return bd < 26 ? best : null;
  };
  FB.prototype._click = function (e) {
    const h = this.hit(e.clientX, e.clientY);
    if (!h) return;
    const midi = this.o.tuning[h.s] + h.f;
    const cell = (this.cells || []).find(function (c) { return c.s === h.s && c.f === h.f; });
    if (this.onTap) this.onTap(h.s, h.f, midi, cell);
  };

  /** Describe a tapped note relative to the current scale and chord. */
  FB.prototype.describe = function (s, f) {
    const pc = T.mod12(this.o.tuning[s] + f);
    const sc = this.scale ? T.scale(this.scale.id) : null;
    const out = { pc: pc, s: s, f: f, midi: this.o.tuning[s] + f };
    if (sc) {
      const rel = T.mod12(pc - this.scale.rootPc);
      const i = sc.ivs.indexOf(rel);
      const rootN = this.scale.root || T.rootName(this.scale.rootPc, this.scale.id);
      out.inScale = i >= 0;
      out.deg = i >= 0 ? sc.degs[i] : T.INTERVALS[rel].deg;
      out.name = i >= 0 ? T.spell(rootN, sc.degs[i]) : (/b/.test(rootN) ? T.FLATS[pc] : T.SHARPS[pc]);
      out.role = i >= 0 ? T.toneRole(sc.degs[i], sc) : null;
      out.interval = T.INTERVALS[rel].name;
      out.character = i >= 0 && sc.char.indexOf(sc.degs[i]) >= 0;
    } else out.name = T.SHARPS[pc];
    if (this.chord) {
      const cq = T.CHORDS[this.chord.q] || T.CHORDS[''];
      const ri = cq.ivs.indexOf(T.mod12(pc - this.chord.rootPc));
      out.chordDeg = ri >= 0 ? cq.degs[ri] : null;
    }
    return out;
  };

  function chordDegKey(cd) {
    const n = +cd.replace(/[b#]/g, '');
    if (n === 1) return '1';
    if (n === 3 || n === 2 || n === 4) return '3';
    if (n === 5) return '5';
    if (n === 7 || n === 6) return '7';
    return 'x';
  }
  function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }

  FB.ROLE_COLOR = ROLE_COLOR; FB.ROLE_LABEL = ROLE_LABEL; FB.CHORD_DEG_COLOR = CHORD_DEG_COLOR;
  return FB;
})();
