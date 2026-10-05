/* ═══════════════════════════════════════════════════════════════
   AXELAB · Audio engine
   - Drum kit rendered once into samples (OfflineAudioContext)
   - Guitar and bass from Karplus-Strong physical string models
   - Guitar amp + cabinet simulation, stereo double-tracking
   - Electric piano (FM), organ (drawbars + rotary), pad
   - Mixer channels with mute/solo, reverb send, glue + limiter
   ═══════════════════════════════════════════════════════════════ */
const Sound = (function () {
  'use strict';
  let ctx = null, readyP = null;
  let master, glue, limiter, analyser, reverb, reverbIn, reverbPre, delayIn;
  const ch = {};
  const kit = {};
  const pluckCache = new Map();
  const active = new Set();
  let reverbSize = 0.35;
  const listeners = [];

  const CHANNELS = [
    { id: 'drums', label: 'Drums', vol: 0.85, pan: 0, send: 0.12 },
    { id: 'bass', label: 'Bass', vol: 0.8, pan: 0, send: 0.02 },
    { id: 'gtr', label: 'Rhythm Gtr', vol: 0.55, pan: -0.55, send: 0.16, amp: true },
    { id: 'gtr2', label: 'Gtr Double', vol: 0.55, pan: 0.55, send: 0.16, amp: true, follow: 'gtr' },
    { id: 'keys', label: 'Keys', vol: 0.5, pan: 0.2, send: 0.22, mod: true },
    { id: 'lead', label: 'Lead / Preview', vol: 0.75, pan: 0, send: 0.2, amp: true, delay: true },
    { id: 'click', label: 'Click', vol: 0.6, pan: 0, send: 0 }
  ];

  function now() { return ctx ? ctx.currentTime : 0; }
  function sr() { return ctx.sampleRate; }

  /* ── Setup ─────────────────────────────────────────────── */
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC({ latencyHint: 'interactive' });
      buildGraph();
      readyP = renderKit().then(function () { listeners.forEach(function (f) { f('ready'); }); });
    }
    if (ctx.state === 'suspended') ctx.resume();
    return readyP;
  }
  function onEvent(f) { listeners.push(f); }

  function buildGraph() {
    master = ctx.createGain(); master.gain.value = 0.9;
    glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -16; glue.knee.value = 8; glue.ratio.value = 2.5; glue.attack.value = 0.012; glue.release.value = 0.22;
    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.002; limiter.release.value = 0.09;
    analyser = ctx.createAnalyser(); analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.6;
    master.connect(glue); glue.connect(limiter); limiter.connect(ctx.destination); limiter.connect(analyser);

    reverbIn = ctx.createGain();
    reverbPre = ctx.createDelay(0.1); reverbPre.delayTime.value = 0.018;
    reverb = ctx.createConvolver(); reverb.buffer = makeImpulse(reverbSize);
    const rvHP = ctx.createBiquadFilter(); rvHP.type = 'highpass'; rvHP.frequency.value = 180;
    const rvOut = ctx.createGain(); rvOut.gain.value = 0.8;
    reverbIn.connect(rvHP); rvHP.connect(reverbPre); reverbPre.connect(reverb); reverb.connect(rvOut); rvOut.connect(master);
    ch._reverbOut = rvOut;

    // Tempo-free slapback / echo used by the lead channel
    delayIn = ctx.createGain();
    const dl = ctx.createDelay(1.5); dl.delayTime.value = 0.36;
    const fb = ctx.createGain(); fb.gain.value = 0.28;
    const dlLP = ctx.createBiquadFilter(); dlLP.type = 'lowpass'; dlLP.frequency.value = 2600;
    const dlOut = ctx.createGain(); dlOut.gain.value = 0.22;
    delayIn.connect(dl); dl.connect(dlLP); dlLP.connect(fb); fb.connect(dl); dlLP.connect(dlOut); dlOut.connect(master);
    ch._delay = { node: dl, out: dlOut, fb: fb };

    CHANNELS.forEach(function (c) {
      const input = ctx.createGain();
      const fader = ctx.createGain(); fader.gain.value = c.vol;
      const mute = ctx.createGain(); mute.gain.value = 1;
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
      if (pan.pan) pan.pan.value = c.pan;
      const send = ctx.createGain(); send.gain.value = c.send;
      const meter = ctx.createAnalyser(); meter.fftSize = 256;
      let last = input;
      const strip = { id: c.id, def: c, input: input, fader: fader, mute: mute, pan: pan, send: send, meter: meter, vol: c.vol, muted: false, solo: false };
      if (c.amp) { strip.amp = buildAmp(); last.connect(strip.amp.input); last = strip.amp.output; }
      if (c.mod) { strip.mod = buildModFx(); last.connect(strip.mod.input); last = strip.mod.output; }
      if (c.id === 'bass') { strip.bassFx = buildBassFx(); last.connect(strip.bassFx.input); last = strip.bassFx.output; }
      if (c.id === 'drums') {
        const dc = ctx.createDynamicsCompressor();
        dc.threshold.value = -14; dc.ratio.value = 3; dc.attack.value = 0.006; dc.release.value = 0.12; dc.knee.value = 6;
        last.connect(dc); last = dc;
      }
      last.connect(fader); fader.connect(mute); mute.connect(pan); pan.connect(master); mute.connect(send); send.connect(reverbIn);
      mute.connect(meter);
      if (c.delay) { strip.delaySend = ctx.createGain(); strip.delaySend.gain.value = 0; mute.connect(strip.delaySend); strip.delaySend.connect(delayIn); }
      ch[c.id] = strip;
    });
    setGuitarTone('crunch');
    setLeadTone('clean');
  }

  /* ── Effects ───────────────────────────────────────────── */
  function shaperCurve(k, asym) {
    const n = 2048, curve = new Float32Array(n);
    const norm = Math.tanh(k);
    for (let i = 0; i < n; i++) {
      const x = i * 2 / n - 1;
      let y = Math.tanh(k * (x + (asym || 0) * x * x)) / norm;
      curve[i] = Math.max(-1, Math.min(1, y));
    }
    return curve;
  }
  function buildAmp() {
    const input = ctx.createGain();
    const preHP = ctx.createBiquadFilter(); preHP.type = 'highpass'; preHP.frequency.value = 90;
    const preMid = ctx.createBiquadFilter(); preMid.type = 'peaking'; preMid.frequency.value = 900; preMid.Q.value = 0.8;
    const drive = ctx.createGain();
    const shaper = ctx.createWaveShaper(); shaper.oversample = '4x';
    const lowShelf = ctx.createBiquadFilter(); lowShelf.type = 'lowshelf'; lowShelf.frequency.value = 180;
    const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 650; mid.Q.value = 0.9;
    const pres = ctx.createBiquadFilter(); pres.type = 'peaking'; pres.frequency.value = 2400; pres.Q.value = 1.1;
    const cab1 = ctx.createBiquadFilter(); cab1.type = 'lowpass'; cab1.Q.value = 0.7;
    const cab2 = ctx.createBiquadFilter(); cab2.type = 'lowpass'; cab2.Q.value = 0.5;
    const cabHP = ctx.createBiquadFilter(); cabHP.type = 'highpass'; cabHP.frequency.value = 75;
    const output = ctx.createGain();
    input.connect(preHP); preHP.connect(preMid); preMid.connect(drive); drive.connect(shaper); shaper.connect(lowShelf);
    lowShelf.connect(mid); mid.connect(pres); pres.connect(cab1); cab1.connect(cab2); cab2.connect(cabHP); cabHP.connect(output);
    return { input, output, preHP, preMid, drive, shaper, lowShelf, mid, pres, cab1, cab2 };
  }
  const AMP_TONES = {
    clean: { label: 'Clean', k: 1.2, pre: 1, preHP: 80, preMid: 0, low: 1, mid: 0, pres: 2, cab: 7500, cab2: 9000, out: 0.9 },
    jazz: { label: 'Jazz (neck pickup)', k: 1.1, pre: 1, preHP: 70, preMid: 0, low: 3, mid: 1, pres: -4, cab: 2400, cab2: 4000, out: 1.0 },
    funk: { label: 'Funk (bright, tight)', k: 1.6, pre: 1, preHP: 160, preMid: 2, low: -2, mid: 0, pres: 5, cab: 7000, cab2: 9000, out: 0.9 },
    acoustic: { label: 'Acoustic', k: 1.05, pre: 1, preHP: 90, preMid: -3, low: 2, mid: -2, pres: 3, cab: 11000, cab2: 14000, out: 0.95 },
    crunch: { label: 'Crunch (classic rock)', k: 5, pre: 1.5, preHP: 110, preMid: 3, low: 0, mid: 2, pres: 3, cab: 4800, cab2: 6500, out: 0.42 },
    blues: { label: 'Blues (edge of breakup)', k: 2.8, pre: 1.2, preHP: 90, preMid: 4, low: 1, mid: 3, pres: 1, cab: 4200, cab2: 6000, out: 0.55 },
    lead: { label: 'Lead (singing sustain)', k: 14, pre: 2, preHP: 130, preMid: 5, low: -1, mid: 3, pres: 2, cab: 4600, cab2: 6000, out: 0.3 },
    metal: { label: 'High gain (modern metal)', k: 32, pre: 2.5, preHP: 160, preMid: 2, low: 3, mid: -5, pres: 4, cab: 4300, cab2: 5600, out: 0.24 }
  };
  function applyAmp(amp, id) {
    const t = AMP_TONES[id] || AMP_TONES.clean;
    amp.shaper.curve = shaperCurve(t.k, 0.08);
    amp.drive.gain.value = t.pre;
    amp.preHP.frequency.value = t.preHP;
    amp.preMid.gain.value = t.preMid;
    amp.lowShelf.gain.value = t.low;
    amp.mid.gain.value = t.mid;
    amp.pres.gain.value = t.pres;
    amp.cab1.frequency.value = t.cab;
    amp.cab2.frequency.value = t.cab2;
    amp.output.gain.value = t.out;
    amp.tone = id;
  }
  function setGuitarTone(id) { if (!ctx) return; applyAmp(ch.gtr.amp, id); applyAmp(ch.gtr2.amp, id); }
  function setLeadTone(id) {
    if (!ctx) return;
    applyAmp(ch.lead.amp, id);
    ch.lead.delaySend.gain.value = (id === 'lead' || id === 'crunch' || id === 'blues') ? 0.5 : 0.12;
  }

  function buildModFx() {
    // Chorus / rotary speaker / tremolo for keys
    const input = ctx.createGain(), output = ctx.createGain();
    const dry = ctx.createGain(), wet = ctx.createGain();
    const dl = ctx.createDelay(0.05); dl.delayTime.value = 0.006;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.8;
    const depth = ctx.createGain(); depth.gain.value = 0.0018;
    const trem = ctx.createGain(); trem.gain.value = 1;
    const tremLfo = ctx.createOscillator(); tremLfo.frequency.value = 4.5;
    const tremDepth = ctx.createGain(); tremDepth.gain.value = 0;
    lfo.connect(depth); depth.connect(dl.delayTime); lfo.start();
    tremLfo.connect(tremDepth); tremDepth.connect(trem.gain); tremLfo.start();
    input.connect(dry); input.connect(dl); dl.connect(wet);
    dry.connect(trem); wet.connect(trem); trem.connect(output);
    dry.gain.value = 0.75; wet.gain.value = 0.45;
    return { input, output, lfo, depth, tremLfo, tremDepth, wet };
  }
  function setKeysFx(kind) {
    if (!ctx) return;
    const m = ch.keys.mod;
    const p = { ep: [0.9, 0.0015, 4.2, 0.18, 0.4], organ: [6.2, 0.0008, 6.2, 0.12, 0.55], pad: [0.4, 0.003, 0, 0, 0.5], piano: [0.3, 0.0004, 0, 0, 0.1] }[kind] || [0.8, 0.0018, 0, 0, 0.45];
    m.lfo.frequency.value = p[0]; m.depth.gain.value = p[1]; m.tremLfo.frequency.value = p[2] || 1; m.tremDepth.gain.value = p[3]; m.wet.gain.value = p[4];
  }
  function buildBassFx() {
    const input = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.Q.value = 0.6;
    const low = ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 90; low.gain.value = 3;
    const growl = ctx.createBiquadFilter(); growl.type = 'peaking'; growl.frequency.value = 800; growl.Q.value = 1; growl.gain.value = 2;
    const sh = ctx.createWaveShaper(); sh.curve = shaperCurve(1.6, 0.05);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.15;
    const output = ctx.createGain(); output.gain.value = 0.9;
    input.connect(sh); sh.connect(low); low.connect(growl); growl.connect(lp); lp.connect(comp); comp.connect(output);
    return { input, output, lp, growl, low };
  }

  function makeImpulse(size) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * (0.5 + size * 3.0));
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let lp = 0;
      const decay = 2.2 + (1 - size) * 3;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const a = 0.35 + 0.6 * t; // high frequencies die faster
        lp += (1 - a) * ((Math.random() * 2 - 1) - lp);
        d[i] = lp * Math.pow(1 - t, decay) * (i < rate * 0.004 ? i / (rate * 0.004) : 1);
      }
      // early reflections
      [0.011, 0.019, 0.027, 0.041, 0.053].forEach(function (tt, k) {
        const idx = Math.floor((tt + c * 0.003) * rate);
        if (idx < len) d[idx] += (0.5 - k * 0.07) * (k % 2 ? -1 : 1);
      });
    }
    return buf;
  }
  function setReverb(size, wet) {
    if (!ctx) return;
    if (size !== undefined && Math.abs(size - reverbSize) > 0.02) { reverbSize = size; reverb.buffer = makeImpulse(size); }
    if (wet !== undefined) ch._reverbOut.gain.linearRampToValueAtTime(wet * 2.2, now() + 0.05);
  }

  /* ── Mixer ─────────────────────────────────────────────── */
  function updateMutes() {
    const anySolo = CHANNELS.some(function (c) { return ch[c.id].solo && c.id !== 'click'; });
    CHANNELS.forEach(function (c) {
      const s = ch[c.id];
      const src = c.follow ? ch[c.follow] : s;
      let on = !src.muted && !(anySolo && !src.solo && c.id !== 'click' && c.id !== 'lead');
      if (c.follow && s.disabled) on = false;
      s.mute.gain.setTargetAtTime(on ? 1 : 0, now(), 0.015);
    });
  }
  function setVol(id, v) { if (!ctx) return; ch[id].vol = v; ch[id].fader.gain.setTargetAtTime(v, now(), 0.02); if (id === 'gtr') setVol('gtr2', v); }
  function setMute(id, m) { if (!ctx) return; ch[id].muted = m; updateMutes(); }
  function setSolo(id, s) { if (!ctx) return; ch[id].solo = s; updateMutes(); }
  function setDouble(on) { if (!ctx) return; ch.gtr2.disabled = !on; ch.gtr.pan.pan && (ch.gtr.pan.pan.value = on ? -0.55 : -0.12); updateMutes(); }
  function level(id) {
    if (!ctx || !ch[id]) return 0;
    const a = ch[id].meter, d = new Float32Array(a.fftSize);
    a.getFloatTimeDomainData(d);
    let p = 0; for (let i = 0; i < d.length; i++) { const v = Math.abs(d[i]); if (v > p) p = v; }
    return p;
  }

  /* ── Drum kit rendering ────────────────────────────────── */
  function noiseBuf(oc, dur) {
    const b = oc.createBuffer(1, Math.floor(oc.sampleRate * dur), oc.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function render(dur, build) {
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const oc = new OAC(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    build(oc, oc.destination);
    return oc.startRendering();
  }
  function env(oc, g, t0, peak, att, tau, end) {
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + att);
    g.gain.setTargetAtTime(0, t0 + att, tau);
    if (end) g.gain.setValueAtTime(0, end);
  }
  function metallic(oc, out, ratios, base) {
    ratios.forEach(function (r) {
      const o = oc.createOscillator(); o.type = 'square'; o.frequency.value = base * r;
      o.connect(out); o.start(0);
    });
  }
  const HAT_RATIOS = [1, 1.483, 1.801, 2.546, 2.630, 3.897];

  function renderKit() {
    const jobs = {
      kick: [0.7, function (oc, out) {
        const o = oc.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(150, 0); o.frequency.exponentialRampToValueAtTime(58, 0.045); o.frequency.exponentialRampToValueAtTime(44, 0.5);
        const g = oc.createGain(); env(oc, g, 0, 1, 0.002, 0.16);
        const sh = oc.createWaveShaper(); const c = new Float32Array(1024);
        for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(2.2 * x) / Math.tanh(2.2); }
        sh.curve = c;
        o.connect(g); g.connect(sh); sh.connect(out); o.start(0);
        const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 0.03);
        const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 0.9;
        const ng = oc.createGain(); env(oc, ng, 0, 0.45, 0.0005, 0.006);
        n.connect(bp); bp.connect(ng); ng.connect(out); n.start(0);
        const b = oc.createOscillator(); b.type = 'triangle'; b.frequency.setValueAtTime(900, 0); b.frequency.exponentialRampToValueAtTime(160, 0.02);
        const bg = oc.createGain(); env(oc, bg, 0, 0.35, 0.0005, 0.008); b.connect(bg); bg.connect(out); b.start(0);
      }],
      snare: [0.6, function (oc, out) {
        [[185, 0.55, 0.07], [330, 0.3, 0.05]].forEach(function (p) {
          const o = oc.createOscillator(); o.type = 'triangle';
          o.frequency.setValueAtTime(p[0] * 1.15, 0); o.frequency.exponentialRampToValueAtTime(p[0], 0.02);
          const g = oc.createGain(); env(oc, g, 0, p[1], 0.001, p[2]); o.connect(g); g.connect(out); o.start(0);
        });
        const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 0.6);
        const hp = oc.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1100;
        const pk = oc.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 5200; pk.gain.value = 5; pk.Q.value = 0.7;
        const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 11000;
        const g = oc.createGain(); env(oc, g, 0, 0.75, 0.001, 0.075);
        n.connect(hp); hp.connect(pk); pk.connect(lp); lp.connect(g); g.connect(out); n.start(0);
        const n2 = oc.createBufferSource(); n2.buffer = noiseBuf(oc, 0.6);
        const bp2 = oc.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 3800; bp2.Q.value = 0.6;
        const g2 = oc.createGain(); env(oc, g2, 0, 0.22, 0.004, 0.16);
        n2.connect(bp2); bp2.connect(g2); g2.connect(out); n2.start(0);
      }],
      rim: [0.25, function (oc, out) {
        const o = oc.createOscillator(); o.type = 'square'; o.frequency.value = 1750;
        const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1900; bp.Q.value = 3;
        const g = oc.createGain(); env(oc, g, 0, 0.6, 0.0005, 0.012);
        o.connect(bp); bp.connect(g); g.connect(out); o.start(0);
        const o2 = oc.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 520;
        const g2 = oc.createGain(); env(oc, g2, 0, 0.5, 0.0005, 0.02); o2.connect(g2); g2.connect(out); o2.start(0);
        const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 0.05);
        const hp = oc.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
        const g3 = oc.createGain(); env(oc, g3, 0, 0.35, 0.0005, 0.008); n.connect(hp); hp.connect(g3); g3.connect(out); n.start(0);
      }],
      hhc: [0.2, function (oc, out) { hat(oc, out, 0.022, 0.75); }],
      hho: [1.0, function (oc, out) { hat(oc, out, 0.24, 0.6); }],
      hhp: [0.15, function (oc, out) { hat(oc, out, 0.014, 0.45, 5200); }],
      ride: [2.6, function (oc, out) {
        const sum = oc.createGain(); sum.gain.value = 0.12;
        metallic(oc, sum, [1, 1.342, 1.6, 2.15, 2.71, 3.3], 315);
        const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 6200; bp.Q.value = 0.55;
        const hp = oc.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2800;
        const g = oc.createGain(); env(oc, g, 0, 0.9, 0.001, 0.55);
        sum.connect(bp); bp.connect(hp); hp.connect(g); g.connect(out);
        const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 0.08);
        const nh = oc.createBiquadFilter(); nh.type = 'highpass'; nh.frequency.value = 6000;
        const ng = oc.createGain(); env(oc, ng, 0, 0.35, 0.0005, 0.015); n.connect(nh); nh.connect(ng); ng.connect(out); n.start(0);
        [2240, 3360, 4610].forEach(function (f, i) {
          const o = oc.createOscillator(); o.frequency.value = f;
          const og = oc.createGain(); env(oc, og, 0, 0.05 / (i + 1), 0.001, 0.7); o.connect(og); og.connect(out); o.start(0);
        });
      }],
      bell: [2.0, function (oc, out) {
        [[740, 0.4], [1110, 0.3], [1620, 0.22], [2380, 0.15], [3200, 0.1]].forEach(function (p) {
          const o = oc.createOscillator(); o.frequency.value = p[0];
          const g = oc.createGain(); env(oc, g, 0, p[1], 0.001, 0.45); o.connect(g); g.connect(out); o.start(0);
        });
        const sum = oc.createGain(); sum.gain.value = 0.06; metallic(oc, sum, HAT_RATIOS, 400);
        const hp = oc.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000;
        const g = oc.createGain(); env(oc, g, 0, 1, 0.001, 0.3); sum.connect(hp); hp.connect(g); g.connect(out);
      }],
      crash: [3.2, function (oc, out) {
        const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 3.2);
        const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 5600; bp.Q.value = 0.35;
        const hp = oc.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2200;
        const g = oc.createGain(); env(oc, g, 0, 0.75, 0.003, 0.75);
        n.connect(bp); bp.connect(hp); hp.connect(g); g.connect(out); n.start(0);
        const sum = oc.createGain(); sum.gain.value = 0.1; metallic(oc, sum, [1, 1.27, 1.61, 2.03, 2.5, 3.17], 410);
        const hp2 = oc.createBiquadFilter(); hp2.type = 'highpass'; hp2.frequency.value = 3500;
        const g2 = oc.createGain(); env(oc, g2, 0, 0.8, 0.002, 0.5); sum.connect(hp2); hp2.connect(g2); g2.connect(out);
      }],
      tom1: [0.9, function (oc, out) { tom(oc, out, 210); }],
      tom2: [0.9, function (oc, out) { tom(oc, out, 155); }],
      tom3: [1.1, function (oc, out) { tom(oc, out, 108); }],
      clap: [0.5, function (oc, out) {
        const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 0.5);
        const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 1.1;
        const g = oc.createGain();
        g.gain.setValueAtTime(0, 0);
        [0, 0.011, 0.022].forEach(function (t) { g.gain.setValueAtTime(0.9, t); g.gain.setTargetAtTime(0.05, t + 0.001, 0.004); });
        g.gain.setValueAtTime(0.7, 0.032); g.gain.setTargetAtTime(0, 0.033, 0.07);
        n.connect(bp); bp.connect(g); g.connect(out); n.start(0);
      }],
      shaker: [0.2, function (oc, out) {
        const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 0.2);
        const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 6500; bp.Q.value = 1.4;
        const g = oc.createGain(); g.gain.setValueAtTime(0, 0); g.gain.linearRampToValueAtTime(0.5, 0.02); g.gain.setTargetAtTime(0, 0.025, 0.025);
        n.connect(bp); bp.connect(g); g.connect(out); n.start(0);
      }],
      stick: [0.15, function (oc, out) {
        const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(2100, 0); o.frequency.exponentialRampToValueAtTime(1700, 0.03);
        const g = oc.createGain(); env(oc, g, 0, 0.8, 0.0005, 0.018); o.connect(g); g.connect(out); o.start(0);
        const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 0.03);
        const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3500; bp.Q.value = 2;
        const g2 = oc.createGain(); env(oc, g2, 0, 0.5, 0.0005, 0.006); n.connect(bp); bp.connect(g2); g2.connect(out); n.start(0);
      }],
      woodHi: [0.12, function (oc, out) { block(oc, out, 1650); }],
      woodLo: [0.12, function (oc, out) { block(oc, out, 1150); }]
    };
    function hat(oc, out, tau, peak, hpf) {
      const sum = oc.createGain(); sum.gain.value = 0.18;
      metallic(oc, sum, HAT_RATIOS, 330);
      const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 10500; bp.Q.value = 0.8;
      const hp = oc.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = hpf || 7200;
      const g = oc.createGain(); env(oc, g, 0, peak, 0.0008, tau);
      sum.connect(bp); bp.connect(hp); hp.connect(g); g.connect(out);
      const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 1);
      const nh = oc.createBiquadFilter(); nh.type = 'highpass'; nh.frequency.value = 8500;
      const ng = oc.createGain(); env(oc, ng, 0, peak * 0.4, 0.0008, tau * 0.9);
      n.connect(nh); nh.connect(ng); ng.connect(out); n.start(0);
    }
    function tom(oc, out, f) {
      const o = oc.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(f * 1.5, 0); o.frequency.exponentialRampToValueAtTime(f, 0.06); o.frequency.exponentialRampToValueAtTime(f * 0.85, 0.6);
      const g = oc.createGain(); env(oc, g, 0, 0.9, 0.002, 0.2);
      o.connect(g); g.connect(out); o.start(0);
      const n = oc.createBufferSource(); n.buffer = noiseBuf(oc, 0.1);
      const bp = oc.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 6; bp.Q.value = 1;
      const ng = oc.createGain(); env(oc, ng, 0, 0.25, 0.001, 0.02); n.connect(bp); bp.connect(ng); ng.connect(out); n.start(0);
    }
    function block(oc, out, f) {
      const o = oc.createOscillator(); o.frequency.value = f;
      const o2 = oc.createOscillator(); o2.frequency.value = f * 2.76;
      const g = oc.createGain(); env(oc, g, 0, 0.8, 0.0005, 0.02);
      const g2 = oc.createGain(); env(oc, g2, 0, 0.25, 0.0005, 0.01);
      o.connect(g); o2.connect(g2); g.connect(out); g2.connect(out); o.start(0); o2.start(0);
    }
    const names = Object.keys(jobs);
    return Promise.all(names.map(function (n) { return render(jobs[n][0], jobs[n][1]).then(function (b) { kit[n] = b; }); }));
  }

  let openHat = null;
  /** Play a drum piece. vel 0..1. */
  function drum(name, time, vel) {
    if (!ctx || !kit[name]) return;
    vel = Math.max(0.02, Math.min(1.2, vel === undefined ? 0.8 : vel));
    const src = ctx.createBufferSource(); src.buffer = kit[name];
    src.playbackRate.value = 1 + (Math.random() - 0.5) * 0.02;
    const g = ctx.createGain(); g.gain.value = Math.pow(vel, 1.4) * 0.78;
    let node = src;
    if (name === 'hhc' || name === 'hho' || name === 'ride' || name === 'snare' || name === 'crash') {
      // softer hits are darker
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000 + 15000 * vel; lp.Q.value = 0.5;
      src.connect(lp); node = lp;
    }
    node.connect(g); g.connect(ch.drums.input);
    if (name === 'hhc' || name === 'hhp') {
      if (openHat && openHat.t < time) { openHat.g.gain.setTargetAtTime(0, time, 0.012); }
      openHat = null;
    }
    if (name === 'hho') openHat = { g: g, t: time };
    src.start(time);
    track(src, time + src.buffer.duration);
  }
  function track(src, end) {
    active.add(src);
    src.onended = function () { active.delete(src); };
    void end;
  }

  /* ── Karplus-Strong plucked strings ────────────────────── */
  function ksBuffer(freq, o) {
    const key = Math.round(freq * 100) + '|' + o.t60 + '|' + o.bright + '|' + o.pick + '|' + o.dur;
    const hit = pluckCache.get(key);
    if (hit) return hit;
    const rate = sr();
    const len = Math.floor(o.dur * rate);
    const buf = ctx.createBuffer(1, len, rate);
    const out = buf.getChannelData(0);
    const N = rate / freq;
    let L = Math.floor(N - 0.5);
    let frac = (N - 0.5) - L;
    if (frac < 0.15) { L -= 1; frac += 1; }
    const C = (1 - frac) / (1 + frac);
    const g = Math.pow(10, -3 / (o.t60 * freq));
    const rho = Math.min(0.99996, g / Math.cos(Math.PI * freq / rate));
    // Excitation: filtered noise with a pick-position comb
    const ex = new Float32Array(L);
    let lp = 0;
    const a = 0.05 + 0.95 * o.bright * o.bright;
    for (let i = 0; i < L; i++) { lp += a * ((Math.random() * 2 - 1) - lp); ex[i] = lp; }
    if (o.bright < 0.5) { let lp2 = 0; for (let i = 0; i < L; i++) { lp2 += (a + 0.1) * (ex[i] - lp2); ex[i] = lp2; } }
    const P = Math.max(1, Math.round(o.pick * L));
    const ring = new Float32Array(L);
    let mean = 0;
    for (let i = 0; i < L; i++) { ring[i] = ex[i] - (i >= P ? ex[i - P] : 0); mean += ring[i]; }
    mean /= L;
    let peak = 1e-6;
    for (let i = 0; i < L; i++) { ring[i] -= mean; peak = Math.max(peak, Math.abs(ring[i])); }
    for (let i = 0; i < L; i++) ring[i] /= peak;
    let idx = 0, prev = 0, apX = 0, apY = 0, dcX = 0, dcY = 0;
    for (let n = 0; n < len; n++) {
      const x = ring[idx];
      const avg = rho * 0.5 * (x + prev);
      prev = x;
      const y = C * avg + apX - C * apY;
      apX = avg; apY = y;
      ring[idx] = y;
      if (++idx >= L) idx = 0;
      const dc = x - dcX + 0.995 * dcY; dcX = x; dcY = dc;
      out[n] = dc;
    }
    // gentle fade at the end of the buffer
    const fade = Math.min(len, Math.floor(rate * 0.05));
    for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
    pluckCache.set(key, buf);
    if (pluckCache.size > 600) pluckCache.delete(pluckCache.keys().next().value);
    return buf;
  }

  const PLUCK = {
    clean: { t60: 3.2, bright: 0.62, pick: 0.13, dur: 3.2 },
    bright: { t60: 2.8, bright: 0.8, pick: 0.1, dur: 3.0 },
    nylon: { t60: 2.2, bright: 0.38, pick: 0.22, dur: 2.6 },
    muted: { t60: 0.16, bright: 0.38, pick: 0.15, dur: 0.4 },
    dead: { t60: 0.035, bright: 0.7, pick: 0.2, dur: 0.12 },
    bassFinger: { t60: 2.6, bright: 0.3, pick: 0.24, dur: 3.2 },
    bassPick: { t60: 2.2, bright: 0.62, pick: 0.09, dur: 3.0 },
    bassSlap: { t60: 1.3, bright: 0.95, pick: 0.05, dur: 2.0 },
    bassUpright: { t60: 0.9, bright: 0.16, pick: 0.3, dur: 1.6 },
    bassMuted: { t60: 0.45, bright: 0.2, pick: 0.2, dur: 0.9 }
  };

  /**
   * Plucked note. opts: ch, vel, dur (seconds held), type (PLUCK key), detune (cents),
   * bend {at, cents, time, release}, vibrato {at, depth, rate}, slideTo {at, semis, time}
   */
  function pluck(midi, time, opts) {
    if (!ctx) return null;
    opts = opts || {};
    const p = PLUCK[opts.type || 'clean'];
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const buf = ksBuffer(freq, p);
    const src = ctx.createBufferSource(); src.buffer = buf;
    if (opts.detune) src.detune.setValueAtTime(opts.detune, time);
    const g = ctx.createGain();
    const vel = opts.vel === undefined ? 0.8 : opts.vel;
    const lv = vel * vel * (opts.gain || 0.9);
    g.gain.setValueAtTime(lv, time);
    const dur = Math.min(opts.dur || p.dur, p.dur);
    const rel = opts.release || 0.06;
    if (opts.dur) { g.gain.setValueAtTime(lv, time + dur); g.gain.setTargetAtTime(0, time + dur, rel / 3); }
    if (opts.bend) {
      const b = opts.bend;
      const base = opts.detune || 0;
      src.detune.setValueAtTime(base + (b.pre || 0), time);
      src.detune.setValueAtTime(base + (b.pre || 0), time + b.at);
      src.detune.linearRampToValueAtTime(base + b.cents, time + b.at + (b.time || 0.12));
      if (b.release !== undefined) { src.detune.setValueAtTime(base + b.cents, time + b.release); src.detune.linearRampToValueAtTime(base, time + b.release + 0.12); }
    }
    if (opts.slideTo) {
      const s = opts.slideTo;
      src.detune.setValueAtTime(opts.detune || 0, time + s.at);
      src.detune.linearRampToValueAtTime((opts.detune || 0) + s.semis * 100, time + s.at + (s.time || 0.08));
    }
    if (opts.vibrato) {
      const v = opts.vibrato;
      const lfo = ctx.createOscillator(); lfo.frequency.value = v.rate || 5.5;
      const d = ctx.createGain(); d.gain.setValueAtTime(0, time); d.gain.setValueAtTime(0, time + (v.at || 0.1)); d.gain.linearRampToValueAtTime(v.depth || 30, time + (v.at || 0.1) + 0.15);
      lfo.connect(d); d.connect(src.detune); lfo.start(time); lfo.stop(time + dur + rel + 0.1);
    }
    let node = src;
    if (opts.filter) {
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opts.filter; f.Q.value = 0.7;
      src.connect(f); node = f;
    }
    if (opts.pan !== undefined && ctx.createStereoPanner) { const pn = ctx.createStereoPanner(); pn.pan.value = opts.pan; node.connect(pn); node = pn; }
    node.connect(g); g.connect(ch[opts.ch || 'lead'].input);
    src.start(time);
    src.stop(time + dur + rel + 0.15);
    track(src);
    return { src: src, gain: g };
  }

  /** Strum a voicing: notes [{midi}], low to high. dir 'D' or 'U'. */
  function strum(notes, time, opts) {
    opts = opts || {};
    const list = opts.dir === 'U' ? notes.slice().reverse().slice(0, Math.max(3, Math.ceil(notes.length * 0.7))) : notes;
    const spread = opts.spread === undefined ? 0.012 : opts.spread;
    list.forEach(function (n, i) {
      const v = (opts.vel || 0.75) * (1 - i * 0.04) * (0.94 + Math.random() * 0.12);
      pluck(n.midi, time + i * spread + Math.random() * 0.003, {
        ch: opts.ch || 'gtr', vel: v, dur: opts.dur, type: opts.type || 'clean', release: opts.release || 0.05,
        detune: opts.detune, gain: opts.gain
      });
    });
  }

  /* ── Bass ──────────────────────────────────────────────── */
  const BASS_STYLES = {
    finger: { label: 'Fingerstyle', type: 'bassFinger', sub: 0.55, lp: 1900, growl: 2 },
    pick: { label: 'Pick', type: 'bassPick', sub: 0.35, lp: 3800, growl: 4 },
    slap: { label: 'Slap', type: 'bassSlap', sub: 0.45, lp: 7000, growl: -3 },
    upright: { label: 'Upright', type: 'bassUpright', sub: 0.7, lp: 950, growl: 0 },
    muted: { label: 'Palm-muted', type: 'bassMuted', sub: 0.5, lp: 1200, growl: 1 },
    synth: { label: 'Synth', type: null, sub: 0, lp: 1400, growl: 0 }
  };
  let bassStyle = 'finger';
  function setBassStyle(id) {
    bassStyle = BASS_STYLES[id] ? id : 'finger';
    if (!ctx) return;
    const s = BASS_STYLES[bassStyle];
    ch.bass.bassFx.lp.frequency.setTargetAtTime(s.lp, now(), 0.02);
    ch.bass.bassFx.growl.gain.value = s.growl;
  }
  function bass(midi, time, dur, vel, opts) {
    if (!ctx) return;
    opts = opts || {};
    const s = BASS_STYLES[opts.style || bassStyle];
    vel = vel === undefined ? 0.85 : vel;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    if (s.type) {
      pluck(midi, time, { ch: 'bass', type: opts.ghost ? 'bassMuted' : s.type, vel: vel * (opts.ghost ? 0.5 : 1), dur: dur, release: 0.05, gain: 1.0, slideTo: opts.slideTo });
    } else {
      // Synth bass: saw + square through an enveloped lowpass
      const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = freq;
      const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = freq * 0.5; o2.detune.value = 4;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6;
      f.frequency.setValueAtTime(200, time); f.frequency.linearRampToValueAtTime(1600 * vel, time + 0.01); f.frequency.setTargetAtTime(260, time + 0.01, 0.12);
      const g = ctx.createGain(); g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(0.35 * vel, time + 0.006);
      g.gain.setValueAtTime(0.35 * vel, time + dur); g.gain.setTargetAtTime(0, time + dur, 0.02);
      const g2 = ctx.createGain(); g2.gain.value = 0.4;
      o1.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(ch.bass.input);
      o1.start(time); o2.start(time); o1.stop(time + dur + 0.2); o2.stop(time + dur + 0.2);
      track(o1); track(o2);
    }
    if (s.sub > 0 && !opts.ghost) {
      // Sine reinforcement of the fundamental for weight on small speakers
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
      if (opts.slideTo) { o.detune.setValueAtTime(0, time + opts.slideTo.at); o.detune.linearRampToValueAtTime(opts.slideTo.semis * 100, time + opts.slideTo.at + (opts.slideTo.time || 0.08)); }
      const g = ctx.createGain();
      const pk = s.sub * vel * 0.42;
      g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(pk, time + 0.008);
      g.gain.setTargetAtTime(pk * 0.55, time + 0.01, 0.15);
      g.gain.setValueAtTime(pk * 0.5, time + dur); g.gain.setTargetAtTime(0, time + dur, 0.025);
      o.connect(g); g.connect(ch.bass.input);
      o.start(time); o.stop(time + dur + 0.2);
      track(o);
    }
  }

  /* ── Keys ──────────────────────────────────────────────── */
  function keys(kind, midis, time, dur, vel) {
    if (!ctx) return;
    vel = vel === undefined ? 0.6 : vel;
    midis.forEach(function (m, i) {
      const t = time + i * 0.004;
      const f = 440 * Math.pow(2, (m - 69) / 12);
      if (kind === 'organ') organNote(f, t, dur, vel);
      else if (kind === 'pad') padNote(f, t, dur, vel);
      else epNote(f, t, dur, vel, kind === 'piano');
    });
  }
  function epNote(f, t, dur, vel, piano) {
    const car = ctx.createOscillator(); car.frequency.value = f;
    const car2 = ctx.createOscillator(); car2.frequency.value = f; car2.detune.value = 5;
    const mod = ctx.createOscillator(); mod.frequency.value = f * (piano ? 2 : 1);
    const mg = ctx.createGain();
    const idx = f * (piano ? 1.6 : 2.4) * vel;
    mg.gain.setValueAtTime(idx, t); mg.gain.setTargetAtTime(idx * 0.12, t, piano ? 0.25 : 0.5);
    mod.connect(mg); mg.connect(car.frequency); mg.connect(car2.frequency);
    const tine = ctx.createOscillator(); tine.frequency.value = f * (piano ? 3 : 7.1);
    const tg = ctx.createGain(); tg.gain.setValueAtTime(0.06 * vel, t); tg.gain.setTargetAtTime(0, t, 0.05);
    tine.connect(tg);
    const g = ctx.createGain();
    const pk = 0.16 * vel;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + 0.004);
    g.gain.setTargetAtTime(pk * 0.25, t + 0.005, piano ? 0.8 : 1.4);
    g.gain.setValueAtTime(pk * 0.25, t + dur); g.gain.setTargetAtTime(0, t + dur, 0.09);
    const c2g = ctx.createGain(); c2g.gain.value = 0.5;
    car.connect(g); car2.connect(c2g); c2g.connect(g); tg.connect(g); g.connect(ch.keys.input);
    const end = t + dur + 0.6;
    [car, car2, mod, tine].forEach(function (o) { o.start(t); o.stop(end); track(o); });
  }
  function organNote(f, t, dur, vel) {
    const g = ctx.createGain();
    const pk = 0.07 * (0.7 + vel * 0.3);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + 0.006);
    g.gain.setValueAtTime(pk, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + 0.04);
    const end = t + dur + 0.08;
    [[0.5, 0.7], [1, 1], [1.5, 0.55], [2, 0.7], [3, 0.3], [4, 0.35], [6, 0.12]].forEach(function (d) {
      const o = ctx.createOscillator(); o.frequency.value = f * d[0];
      const og = ctx.createGain(); og.gain.value = d[1];
      o.connect(og); og.connect(g); o.start(t); o.stop(end); track(o);
    });
    // percussion (3rd harmonic click)
    const p = ctx.createOscillator(); p.frequency.value = f * 3;
    const pg = ctx.createGain(); pg.gain.setValueAtTime(0.5 * vel, t); pg.gain.setTargetAtTime(0, t, 0.08);
    p.connect(pg); pg.connect(g); p.start(t); p.stop(end); track(p);
    g.connect(ch.keys.input);
  }
  function padNote(f, t, dur, vel) {
    const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = 0.8;
    fl.frequency.setValueAtTime(600, t); fl.frequency.linearRampToValueAtTime(1800, t + 0.6);
    const g = ctx.createGain();
    const pk = 0.05 * vel;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(pk, t + 0.35);
    g.gain.setValueAtTime(pk, t + dur); g.gain.setTargetAtTime(0, t + dur, 0.25);
    const end = t + dur + 1.5;
    [-7, 0, 7].forEach(function (dt) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt;
      o.connect(fl); o.start(t); o.stop(end); track(o);
    });
    fl.connect(g); g.connect(ch.keys.input);
  }

  /* ── Utility sounds ────────────────────────────────────── */
  function click(time, accent, sub) {
    if (!ctx) return;
    drum(sub ? 'stick' : (accent ? 'woodHi' : 'woodLo'), time, sub ? 0.35 : accent ? 1 : 0.75);
    void ch;
  }
  function clickTo(time, accent, sub) {
    if (!ctx) return;
    const name = sub ? 'stick' : (accent ? 'woodHi' : 'woodLo');
    if (!kit[name]) return;
    const src = ctx.createBufferSource(); src.buffer = kit[name];
    const g = ctx.createGain(); g.gain.value = sub ? 0.3 : accent ? 1 : 0.7;
    src.connect(g); g.connect(ch.click.input); src.start(time); track(src);
  }

  /** Stop everything scheduled (transport stop). */
  function stopAll() {
    if (!ctx) return;
    active.forEach(function (s) { try { s.stop(); } catch (e) { /* already stopped */ } });
    active.clear();
    openHat = null;
  }

  /** Waveform data for visualizers. */
  function wave(arr) { if (analyser) analyser.getByteTimeDomainData(arr); }

  return {
    ensure, onEvent, now, get ctx() { return ctx; }, get ready() { return !!kit.kick; },
    CHANNELS, AMP_TONES, BASS_STYLES, PLUCK,
    drum, pluck, strum, bass, keys, clickTo, click, stopAll, wave,
    setGuitarTone, setLeadTone, setKeysFx, setBassStyle, setReverb, setVol, setMute, setSolo, setDouble, level,
    get bassStyle() { return bassStyle; }, channel: function (id) { return ch[id]; }
  };
})();
