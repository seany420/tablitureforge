/* ═══════════════════════════════════════════════════════════════
   AXELAB · Music theory core
   Notes, spelling, scales, chords, roman-numeral progressions and
   chord-scale analysis. Pure functions, no DOM.
   ═══════════════════════════════════════════════════════════════ */
const Theory = (function () {
  'use strict';

  const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
  const MAJOR_SEMIS = [0, 2, 4, 5, 7, 9, 11];
  // The 12 roots offered in key pickers. Enharmonic names are chosen per scale.
  const ROOT_CHOICES = [
    { pc: 0, label: 'C' }, { pc: 1, label: 'C♯ / D♭' }, { pc: 2, label: 'D' }, { pc: 3, label: 'E♭ / D♯' },
    { pc: 4, label: 'E' }, { pc: 5, label: 'F' }, { pc: 6, label: 'F♯ / G♭' }, { pc: 7, label: 'G' },
    { pc: 8, label: 'A♭ / G♯' }, { pc: 9, label: 'A' }, { pc: 10, label: 'B♭ / A♯' }, { pc: 11, label: 'B' }
  ];

  const mod12 = (n) => ((n % 12) + 12) % 12;

  /* ── Notes ─────────────────────────────────────────────── */
  function parseNote(name) {
    const m = /^([A-Ga-g])([#b♯♭x]*)$/.exec(String(name).trim());
    if (!m) return null;
    const letterIdx = LETTERS.indexOf(m[1].toUpperCase());
    let acc = 0;
    for (const ch of m[2]) acc += (ch === '#' || ch === '♯') ? 1 : (ch === 'x') ? 2 : -1;
    return { letterIdx, acc, pc: mod12(LETTER_PC[letterIdx] + acc) };
  }
  function pcOf(name) { const n = parseNote(name); return n ? n.pc : null; }

  /** Typographic accidentals for display: "Bb" -> "B♭", "b3" -> "♭3", "F#" -> "F♯". */
  function pretty(s) {
    return String(s)
      .replace(/#/g, '♯')
      .replace(/([A-G])b/g, '$1♭')
      .replace(/(^|[^A-Za-z])bb(?=\d)/g, '$1♭♭')
      .replace(/(^|[^A-Za-z♭])b(?=\d|[IV])/g, '$1♭');
  }

  function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function midiName(m, flats) { return (flats ? FLATS : SHARPS)[mod12(m)] + (Math.floor(m / 12) - 1); }

  /* ── Degrees ───────────────────────────────────────────── */
  function parseDeg(label) {
    const m = /^(bb|b|##|#)?(\d+)$/.exec(label);
    if (!m) throw new Error('Bad degree ' + label);
    const acc = { bb: -2, b: -1, '#': 1, '##': 2 }[m[1]] || 0;
    return { n: +m[2], acc };
  }
  function degSemis(label) {
    const d = parseDeg(label);
    return MAJOR_SEMIS[(d.n - 1) % 7] + 12 * Math.floor((d.n - 1) / 7) + d.acc;
  }

  /** Spell scale/chord degree `label` above `rootName` with correct letter names. */
  function spell(rootName, label) {
    const r = parseNote(rootName);
    const d = parseDeg(label);
    const li = (r.letterIdx + d.n - 1) % 7;
    const pc = mod12(r.pc + degSemis(label));
    let diff = mod12(pc - LETTER_PC[li]);
    if (diff > 6) diff -= 12;
    if (Math.abs(diff) > 2) return FLATS[pc];
    return LETTERS[li] + (diff > 0 ? '#'.repeat(diff) : 'b'.repeat(-diff));
  }

  /* ── Scale library ─────────────────────────────────────── */
  // degs fully define each scale; ivs are derived. char = the notes that give it its flavor.
  const SCALES = {
    // Major-scale modes, brightest to darkest is Lydian → Locrian
    ionian: { name: 'Ionian (Major)', short: 'Major', fam: 'Major modes', degs: ['1', '2', '3', '4', '5', '6', '7'], char: ['3', '7'],
      mood: 'Bright, settled, home', use: 'Pop, rock, country, folk. The reference every other scale is compared to.',
      fits: 'I, Imaj7, I6, Iadd9', parent: 'Major scale, mode 1' },
    dorian: { name: 'Dorian', fam: 'Major modes', degs: ['1', '2', 'b3', '4', '5', '6', 'b7'], char: ['6'],
      mood: 'Minor with a lift. Soulful, cool, funky', use: 'Funk, fusion, jazz, Santana, Pink Floyd, Daft Punk',
      fits: 'm7, m6, m9, m13 (the ii chord)', parent: 'Major scale, mode 2' },
    phrygian: { name: 'Phrygian', fam: 'Major modes', degs: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'], char: ['b2'],
      mood: 'Dark, tense, Spanish, menacing', use: 'Metal riffs, flamenco, film tension',
      fits: 'm, m7, 5 (power chords), sus♭9', parent: 'Major scale, mode 3' },
    lydian: { name: 'Lydian', fam: 'Major modes', degs: ['1', '2', '3', '#4', '5', '6', '7'], char: ['#4'],
      mood: 'Floating, dreamy, wide open', use: 'Film scores, Satriani, Vai, prog, the IV chord',
      fits: 'maj7, maj7♯11, IV chords', parent: 'Major scale, mode 4' },
    mixolydian: { name: 'Mixolydian', fam: 'Major modes', degs: ['1', '2', '3', '4', '5', '6', 'b7'], char: ['b7'],
      mood: 'Major but loose and bluesy', use: 'Classic rock, blues, jam bands, country, Grateful Dead',
      fits: '7, 9, 13, sus4 (the V chord)', parent: 'Major scale, mode 5' },
    aeolian: { name: 'Aeolian (Natural Minor)', short: 'Natural Minor', fam: 'Major modes', degs: ['1', '2', 'b3', '4', '5', 'b6', 'b7'], char: ['b6'],
      mood: 'Sad, serious, epic', use: 'Rock, metal, pop ballads, classical',
      fits: 'm, m7, m9 (the vi chord)', parent: 'Major scale, mode 6' },
    locrian: { name: 'Locrian', fam: 'Major modes', degs: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'], char: ['b5', 'b2'],
      mood: 'Unstable, hollow, unresolved', use: 'Extreme metal riffs, jazz over half-diminished chords',
      fits: 'm7♭5 (half-diminished), dim', parent: 'Major scale, mode 7' },

    // Harmonic minor and its modes
    harmonic_minor: { name: 'Harmonic Minor', fam: 'Harmonic minor modes', degs: ['1', '2', 'b3', '4', '5', 'b6', '7'], char: ['7', 'b6'],
      mood: 'Dramatic, classical, exotic', use: 'Neoclassical metal (Malmsteen), classical, the V7 chord in minor keys',
      fits: 'm(maj7), and the V7 of a minor key', parent: 'Harmonic minor, mode 1' },
    locrian_n6: { name: 'Locrian ♮6', fam: 'Harmonic minor modes', degs: ['1', 'b2', 'b3', '4', 'b5', '6', 'b7'], char: ['6'],
      mood: 'Dark and strange', use: 'm7♭5 chords in minor keys', fits: 'm7♭5', parent: 'Harmonic minor, mode 2' },
    ionian_s5: { name: 'Ionian ♯5', fam: 'Harmonic minor modes', degs: ['1', '2', '3', '4', '#5', '6', '7'], char: ['#5'],
      mood: 'Bright but unsettled', use: 'maj7♯5 chords, color in prog', fits: 'maj7♯5', parent: 'Harmonic minor, mode 3' },
    dorian_s4: { name: 'Dorian ♯4 (Ukrainian Dorian)', fam: 'Harmonic minor modes', degs: ['1', '2', 'b3', '#4', '5', '6', 'b7'], char: ['#4'],
      mood: 'Folk, Eastern European, klezmer', use: 'Klezmer, folk metal', fits: 'm7, m6♯11', parent: 'Harmonic minor, mode 4' },
    phrygian_dominant: { name: 'Phrygian Dominant', fam: 'Harmonic minor modes', degs: ['1', 'b2', '3', '4', '5', 'b6', 'b7'], char: ['b2', '3'],
      mood: 'Middle Eastern, flamenco, aggressive', use: 'Metal (Slayer, Megadeth), flamenco, the V7 in minor keys',
      fits: '7♭9, 7, the V7 resolving to a minor chord', parent: 'Harmonic minor, mode 5' },
    lydian_s2: { name: 'Lydian ♯2', fam: 'Harmonic minor modes', degs: ['1', '#2', '3', '#4', '5', '6', '7'], char: ['#2'],
      mood: 'Exotic, shimmering', use: 'Color over maj7 chords', fits: 'maj7♯11', parent: 'Harmonic minor, mode 6' },
    altered_bb7: { name: 'Super Locrian ♭♭7', fam: 'Harmonic minor modes', degs: ['1', 'b2', 'b3', 'b4', 'b5', 'b6', 'bb7'], char: ['bb7'],
      mood: 'Diminished and dense', use: 'dim7 chords, the vii°7 of minor keys', fits: 'dim7', parent: 'Harmonic minor, mode 7' },

    // Melodic minor and its modes
    melodic_minor: { name: 'Melodic Minor', fam: 'Melodic minor modes', degs: ['1', '2', 'b3', '4', '5', '6', '7'], char: ['6', '7'],
      mood: 'Sophisticated, bittersweet', use: 'Jazz, fusion, film', fits: 'm6, m(maj7)', parent: 'Melodic minor, mode 1' },
    dorian_b2: { name: 'Dorian ♭2', fam: 'Melodic minor modes', degs: ['1', 'b2', 'b3', '4', '5', '6', 'b7'], char: ['b2', '6'],
      mood: 'Dark but open', use: 'sus♭9 chords, modal jazz', fits: '7sus4♭9', parent: 'Melodic minor, mode 2' },
    lydian_augmented: { name: 'Lydian Augmented', fam: 'Melodic minor modes', degs: ['1', '2', '3', '#4', '#5', '6', '7'], char: ['#5'],
      mood: 'Weightless', use: 'maj7♯5 chords', fits: 'maj7♯5', parent: 'Melodic minor, mode 3' },
    lydian_dominant: { name: 'Lydian Dominant', fam: 'Melodic minor modes', degs: ['1', '2', '3', '#4', '5', '6', 'b7'], char: ['#4', 'b7'],
      mood: 'Bright, quirky, The Simpsons', use: 'Non-resolving 7th chords (♭VII7, ♭VI7, II7), tritone subs, fusion',
      fits: '7♯11, 9♯11', parent: 'Melodic minor, mode 4' },
    mixolydian_b6: { name: 'Mixolydian ♭6', fam: 'Melodic minor modes', degs: ['1', '2', '3', '4', '5', 'b6', 'b7'], char: ['b6'],
      mood: 'Major turning melancholy', use: 'V7 chords in minor, film', fits: '7♭13', parent: 'Melodic minor, mode 5' },
    locrian_n2: { name: 'Locrian ♮2', fam: 'Melodic minor modes', degs: ['1', '2', 'b3', '4', 'b5', 'b6', 'b7'], char: ['2'],
      mood: 'Half-diminished, smoother than Locrian', use: 'Jazz m7♭5 chords', fits: 'm7♭5, m9♭5', parent: 'Melodic minor, mode 6' },
    altered: { name: 'Altered (Super Locrian)', fam: 'Melodic minor modes', degs: ['1', 'b2', '#2', '3', 'b5', '#5', 'b7'], char: ['b2', '#2', 'b5', '#5'],
      mood: 'Maximum tension wanting to resolve', use: 'Jazz V7 chords right before resolution',
      fits: '7alt, 7♯9, 7♭9♯5', parent: 'Melodic minor, mode 7' },

    // Pentatonic and blues
    pentatonic_minor: { name: 'Minor Pentatonic', fam: 'Pentatonic & blues', degs: ['1', 'b3', '4', '5', 'b7'], char: ['b3', 'b7'],
      mood: 'Raw, vocal, bluesy', use: 'Rock, blues and metal solos. The first scale most guitarists learn.',
      fits: 'm, m7, 5, and 7 chords in blues', parent: 'Relative major pentatonic, rotated' },
    pentatonic_major: { name: 'Major Pentatonic', fam: 'Pentatonic & blues', degs: ['1', '2', '3', '5', '6'], char: ['3', '6'],
      mood: 'Sweet, open, country', use: 'Country, southern rock, Allman Brothers, major blues',
      fits: 'Major, 6, add9, 7 (in blues)', parent: 'Relative minor pentatonic, rotated' },
    blues: { name: 'Blues Scale', fam: 'Pentatonic & blues', degs: ['1', 'b3', '4', 'b5', '5', 'b7'], char: ['b5'],
      mood: 'Gritty, the sound of the blues', use: 'Blues, rock, jazz. Minor pentatonic plus the ♭5 blue note.',
      fits: 'Every chord in a blues, m7, 7', parent: 'Minor pentatonic + ♭5' },
    blues_major: { name: 'Major Blues', fam: 'Pentatonic & blues', degs: ['1', '2', 'b3', '3', '5', '6'], char: ['b3'],
      mood: 'Happy blues, country swing', use: 'Major blues, country, B.B. King sweetness',
      fits: 'Major, 6, 7 in blues', parent: 'Major pentatonic + ♭3' },
    pentatonic_dominant: { name: 'Dominant Pentatonic', fam: 'Pentatonic & blues', degs: ['1', '2', '3', '5', 'b7'], char: ['3', 'b7'],
      mood: 'Bluesy major', use: 'Dominant 7 chords, funk', fits: '7, 9', parent: 'Mixolydian, five-note subset' },
    egyptian: { name: 'Suspended Pentatonic', fam: 'Pentatonic & blues', degs: ['1', '2', '4', '5', 'b7'], char: ['2', '4'],
      mood: 'Ambiguous, neither major nor minor', use: 'Sus chords, Celtic, modal rock', fits: 'sus2, sus4, 7sus4', parent: 'Major pentatonic, mode 2' },

    // Bebop
    bebop_dominant: { name: 'Bebop Dominant', fam: 'Bebop', degs: ['1', '2', '3', '4', '5', '6', 'b7', '7'], char: ['7'],
      mood: 'Swinging, flowing 8th-note lines', use: 'Jazz lines over 7 chords. The passing 7 keeps chord tones on the beat.',
      fits: '7, 9, 13', parent: 'Mixolydian + major 7 passing tone' },
    bebop_major: { name: 'Bebop Major', fam: 'Bebop', degs: ['1', '2', '3', '4', '5', '#5', '6', '7'], char: ['#5'],
      mood: 'Polished jazz major', use: 'Jazz lines over maj7 and 6 chords', fits: 'maj7, 6', parent: 'Major + ♯5 passing tone' },
    bebop_dorian: { name: 'Bebop Dorian', fam: 'Bebop', degs: ['1', '2', 'b3', '3', '4', '5', '6', 'b7'], char: ['3'],
      mood: 'Swinging minor', use: 'Jazz lines over m7 chords', fits: 'm7, m6', parent: 'Dorian + major 3 passing tone' },

    // Symmetric
    diminished_hw: { name: 'Half-Whole Diminished', fam: 'Symmetric', degs: ['1', 'b2', 'b3', '3', '#4', '5', '6', 'b7'], char: ['b2', 'b3', '#4'],
      mood: 'Tense, jazzy, angular', use: '7♭9 chords, jazz, metal shred', fits: '7♭9, 13♭9, 7♯9', parent: 'Repeats every minor 3rd' },
    diminished_wh: { name: 'Whole-Half Diminished', fam: 'Symmetric', degs: ['1', '2', 'b3', '4', 'b5', 'b6', '6', '7'], char: ['b5', '7'],
      mood: 'Suspenseful, horror-film', use: 'dim7 chords, neoclassical runs', fits: 'dim7, dim', parent: 'Repeats every minor 3rd' },
    whole_tone: { name: 'Whole Tone', fam: 'Symmetric', degs: ['1', '2', '3', '#4', '#5', 'b7'], char: ['#4', '#5'],
      mood: 'Dreamlike, unresolved, floating', use: 'Augmented and 7♯5 chords, dream sequences, Debussy', fits: 'aug, 7♯5, 9♯5', parent: 'Repeats every whole step' },
    augmented: { name: 'Augmented', fam: 'Symmetric', degs: ['1', '#2', '3', '5', '#5', '7'], char: ['#2', '#5'],
      mood: 'Spiky, modern', use: 'Modern jazz, Coltrane-style lines', fits: 'maj7♯5, aug', parent: 'Two augmented triads' },
    chromatic: { name: 'Chromatic', fam: 'Symmetric', degs: ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7'], char: [],
      mood: 'Every note', use: 'Finger exercises, passing tones, outside playing', fits: 'Anything, briefly', parent: 'All 12 notes' },

    // World and exotic
    hungarian_minor: { name: 'Hungarian Minor', fam: 'Exotic', degs: ['1', '2', 'b3', '#4', '5', 'b6', '7'], char: ['#4', '7'],
      mood: 'Gypsy, gothic, dramatic', use: 'Neoclassical metal, gypsy jazz, horror', fits: 'm(maj7)', parent: 'Harmonic minor with ♯4' },
    hungarian_major: { name: 'Hungarian Major', fam: 'Exotic', degs: ['1', '#2', '3', '#4', '5', '6', 'b7'], char: ['#2', '#4'],
      mood: 'Bright and exotic', use: 'Dominant color, prog', fits: '7♯9♯11', parent: 'Mode of harmonic major family' },
    double_harmonic: { name: 'Double Harmonic (Byzantine)', fam: 'Exotic', degs: ['1', 'b2', '3', '4', '5', 'b6', '7'], char: ['b2', '7'],
      mood: 'Arabic, Byzantine, cinematic', use: 'Middle Eastern melodies, Dick Dale surf, metal', fits: 'maj7, major', parent: 'Two augmented 2nds' },
    neapolitan_minor: { name: 'Neapolitan Minor', fam: 'Exotic', degs: ['1', 'b2', 'b3', '4', '5', 'b6', '7'], char: ['b2', '7'],
      mood: 'Operatic, dark', use: 'Neoclassical metal, classical', fits: 'm(maj7)', parent: 'Harmonic minor with ♭2' },
    neapolitan_major: { name: 'Neapolitan Major', fam: 'Exotic', degs: ['1', 'b2', 'b3', '4', '5', '6', '7'], char: ['b2', '6'],
      mood: 'Ornate, theatrical', use: 'Classical, prog', fits: 'm(maj7)', parent: 'Melodic minor with ♭2' },
    persian: { name: 'Persian', fam: 'Exotic', degs: ['1', 'b2', '3', '4', 'b5', 'b6', '7'], char: ['b2', 'b5'],
      mood: 'Mystic, exotic', use: 'Middle Eastern color, prog metal', fits: '7♭5♭9 colors', parent: 'Double harmonic with ♭5' },
    spanish_8: { name: 'Spanish 8-Tone', fam: 'Exotic', degs: ['1', 'b2', 'b3', '3', '4', '5', 'b6', 'b7'], char: ['b2', '3'],
      mood: 'Flamenco fire', use: 'Flamenco, Phrygian metal', fits: 'Phrygian vamps, 7♭9', parent: 'Phrygian + major 3rd' },
    enigmatic: { name: 'Enigmatic', fam: 'Exotic', degs: ['1', 'b2', '3', '#4', '#5', '#6', '7'], char: ['#5', '#6'],
      mood: 'Strange, Verdi', use: 'Experimental lines', fits: 'maj7♯5', parent: 'Verdi, 1888' },
    prometheus: { name: 'Prometheus', fam: 'Exotic', degs: ['1', '2', '3', '#4', '6', 'b7'], char: ['#4'],
      mood: 'Mystic, Scriabin', use: 'Experimental, ambient', fits: '9♯11', parent: 'Scriabin mystic chord' },
    hirajoshi: { name: 'Hirajoshi', fam: 'Exotic', degs: ['1', '2', 'b3', '5', 'b6'], char: ['b6'],
      mood: 'Japanese koto, haunting', use: 'Japanese-flavored melodies, metal intros', fits: 'm, m(add9)', parent: 'Japanese pentatonic' },
    in_sen: { name: 'In Sen', fam: 'Exotic', degs: ['1', 'b2', '4', '5', 'b7'], char: ['b2'],
      mood: 'Japanese, sparse, dark', use: 'Ambient, metal intros', fits: '7sus4♭9', parent: 'Japanese pentatonic' },
    iwato: { name: 'Iwato', fam: 'Exotic', degs: ['1', 'b2', '4', 'b5', 'b7'], char: ['b2', 'b5'],
      mood: 'Bleak, eerie', use: 'Doom, horror ambience', fits: 'm7♭5 colors', parent: 'Japanese pentatonic' },
    kumoi: { name: 'Kumoi', fam: 'Exotic', degs: ['1', '2', 'b3', '5', '6'], char: ['6'],
      mood: 'Gentle minor', use: 'Dorian-flavored melodies', fits: 'm6, m7', parent: 'Japanese pentatonic' }
  };
  const SCALE_ALIASES = { minor: 'aeolian', major: 'ionian', natural_minor: 'aeolian' };
  const SCALE_FAMILIES = ['Major modes', 'Pentatonic & blues', 'Harmonic minor modes', 'Melodic minor modes', 'Bebop', 'Symmetric', 'Exotic'];

  Object.keys(SCALES).forEach(function (id) {
    const s = SCALES[id];
    s.id = id;
    s.ivs = s.degs.map(function (d) { return mod12(degSemis(d)); });
    s.formula = s.degs.join(' ');
    s.steps = s.ivs.map(function (v, i) { return mod12((s.ivs[(i + 1) % s.ivs.length]) - v) || 12; })
      .map(function (n) { return { 1: 'H', 2: 'W', 3: 'W+H', 4: '2W' }[n] || n; }).join('-');
    s.minorish = s.ivs.indexOf(3) >= 0 && s.ivs.indexOf(4) < 0;
  });
  function scale(id) { return SCALES[SCALE_ALIASES[id] || id] || null; }

  // Index scales by their interval set so rotations can be named.
  const SCALE_BY_SET = {};
  const ROTATION_PRIORITY = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian',
    'harmonic_minor', 'locrian_n6', 'ionian_s5', 'dorian_s4', 'phrygian_dominant', 'lydian_s2', 'altered_bb7',
    'melodic_minor', 'dorian_b2', 'lydian_augmented', 'lydian_dominant', 'mixolydian_b6', 'locrian_n2', 'altered'];
  Object.keys(SCALES).forEach(function (id) {
    const key = SCALES[id].ivs.slice().sort(function (a, b) { return a - b; }).join(',');
    if (!SCALE_BY_SET[key] || ROTATION_PRIORITY.indexOf(id) >= 0 && ROTATION_PRIORITY.indexOf(SCALE_BY_SET[key]) < 0) SCALE_BY_SET[key] = id;
  });
  function scaleFromPcs(rootPc, pcs) {
    const key = pcs.map(function (p) { return mod12(p - rootPc); }).sort(function (a, b) { return a - b; }).join(',');
    return SCALE_BY_SET[key] || null;
  }
  function scalePcs(rootPc, id) { const s = scale(id); return s ? s.ivs.map(function (v) { return mod12(rootPc + v); }) : []; }

  /** Pick the enharmonic root name that spells `scaleId` with the fewest accidentals. */
  function rootName(pc, scaleId) {
    const cands = [SHARPS[pc], FLATS[pc]].filter(function (v, i, a) { return a.indexOf(v) === i; });
    if (cands.length === 1) return cands[0];
    const s = scale(scaleId) || SCALES.ionian;
    let best = cands[1], bestScore = 1e9;
    cands.forEach(function (c) {
      let score = 0;
      s.degs.forEach(function (d) { const n = spell(c, d); score += (n.length - 1) * (n.length > 2 ? 3 : 1); });
      if (score < bestScore) { bestScore = score; best = c; }
    });
    return best;
  }
  function scaleNotes(root, id) {
    const s = scale(id); if (!s) return [];
    return s.degs.map(function (d) { return spell(root, d); });
  }

  /**
   * Visual role of a degree for the fretboard: R root, n stable, t tension, d dark, b bright.
   * Kept compatible with the original AXELAB color legend.
   */
  function toneRole(label, sc) {
    if (label === '1') return 'R';
    const minorCtx = sc ? sc.minorish : false;
    switch (label) {
      case 'b2': case '#4': case 'b5': case '#2': case 'b4': case '#6': return 't';
      case '#5': return (sc && sc.ivs.indexOf(7) < 0) ? 't' : 'd';
      case 'b6': case 'bb7': return 'd';
      case '6': case '7': return minorCtx ? 'b' : 'n';
      default: return 'n';
    }
  }

  /* ── Intervals ─────────────────────────────────────────── */
  const INTERVALS = [
    { semis: 0, short: 'P1', deg: '1', name: 'Unison', sound: 'Same note', up: 'Same pitch', down: 'Same pitch', shape: 'Same fret or the same note on another string' },
    { semis: 1, short: 'm2', deg: 'b2', name: 'Minor 2nd', sound: 'Tense, crunchy', up: 'Jaws theme', down: 'Für Elise (first two notes)', shape: '1 fret up' },
    { semis: 2, short: 'M2', deg: '2', name: 'Major 2nd', sound: 'Stepping, open', up: 'Happy Birthday (“Hap-py”)', down: 'Mary Had a Little Lamb', shape: '2 frets up' },
    { semis: 3, short: 'm3', deg: 'b3', name: 'Minor 3rd', sound: 'Sad, dark', up: 'Smoke on the Water (first two notes)', down: 'Hey Jude (“Hey Jude”)', shape: '3 frets up, or next string 2 frets back' },
    { semis: 4, short: 'M3', deg: '3', name: 'Major 3rd', sound: 'Bright, happy', up: 'When the Saints Go Marching In', down: 'Swing Low, Sweet Chariot', shape: '4 frets up, or next string 1 fret back' },
    { semis: 5, short: 'P4', deg: '4', name: 'Perfect 4th', sound: 'Open, hymn-like', up: 'Here Comes the Bride', down: 'Eine Kleine Nachtmusik', shape: 'Next string, same fret' },
    { semis: 6, short: 'TT', deg: 'b5', name: 'Tritone', sound: 'Unstable, devilish', up: 'The Simpsons theme, Maria (West Side Story)', down: 'YYZ (Rush) intro', shape: 'Next string, 1 fret up' },
    { semis: 7, short: 'P5', deg: '5', name: 'Perfect 5th', sound: 'Strong, powerful', up: 'Star Wars main theme', down: 'Flintstones theme', shape: 'Next string, 2 frets up (the power chord)' },
    { semis: 8, short: 'm6', deg: 'b6', name: 'Minor 6th', sound: 'Bittersweet', up: 'The Entertainer (3rd to 4th notes)', down: 'Love Story theme', shape: 'Two strings up, 1 fret back' },
    { semis: 9, short: 'M6', deg: '6', name: 'Major 6th', sound: 'Warm, sweet', up: 'My Bonnie Lies Over the Ocean', down: 'Nobody Knows the Trouble I’ve Seen', shape: 'Two strings up, 2 frets back' },
    { semis: 10, short: 'm7', deg: 'b7', name: 'Minor 7th', sound: 'Bluesy, unresolved', up: 'Star Trek original theme', down: 'An American in Paris', shape: 'Two strings up, same fret' },
    { semis: 11, short: 'M7', deg: '7', name: 'Major 7th', sound: 'Dreamy, yearning', up: 'Take On Me (chorus leap)', down: 'I Love You (Cole Porter)', shape: 'Two strings up, 1 fret up' },
    { semis: 12, short: 'P8', deg: '8', name: 'Octave', sound: 'Same note, higher', up: 'Somewhere Over the Rainbow', down: 'Willow Weep for Me', shape: 'Two strings up, 2 frets up' }
  ];

  /* ── Chords ────────────────────────────────────────────── */
  const CHORDS = {
    '': { name: 'Major', degs: ['1', '3', '5'], fam: 'Triads' },
    'm': { name: 'Minor', degs: ['1', 'b3', '5'], fam: 'Triads' },
    'dim': { name: 'Diminished', degs: ['1', 'b3', 'b5'], fam: 'Triads' },
    'aug': { name: 'Augmented', degs: ['1', '3', '#5'], fam: 'Triads' },
    'sus2': { name: 'Suspended 2nd', degs: ['1', '2', '5'], fam: 'Triads' },
    'sus4': { name: 'Suspended 4th', degs: ['1', '4', '5'], fam: 'Triads' },
    '5': { name: 'Power chord', degs: ['1', '5'], fam: 'Triads' },
    '6': { name: 'Major 6th', degs: ['1', '3', '5', '6'], fam: 'Sixths & sevenths' },
    'm6': { name: 'Minor 6th', degs: ['1', 'b3', '5', '6'], fam: 'Sixths & sevenths' },
    '7': { name: 'Dominant 7th', degs: ['1', '3', '5', 'b7'], fam: 'Sixths & sevenths' },
    'maj7': { name: 'Major 7th', degs: ['1', '3', '5', '7'], fam: 'Sixths & sevenths' },
    'm7': { name: 'Minor 7th', degs: ['1', 'b3', '5', 'b7'], fam: 'Sixths & sevenths' },
    'm7b5': { name: 'Half-diminished (m7♭5)', degs: ['1', 'b3', 'b5', 'b7'], fam: 'Sixths & sevenths' },
    'dim7': { name: 'Diminished 7th', degs: ['1', 'b3', 'b5', 'bb7'], fam: 'Sixths & sevenths' },
    'mMaj7': { name: 'Minor-major 7th', degs: ['1', 'b3', '5', '7'], fam: 'Sixths & sevenths' },
    '7sus4': { name: 'Dominant 7 sus4', degs: ['1', '4', '5', 'b7'], fam: 'Sixths & sevenths' },
    'add9': { name: 'Add 9', degs: ['1', '3', '5', '9'], fam: 'Extended' },
    'madd9': { name: 'Minor add 9', degs: ['1', 'b3', '5', '9'], fam: 'Extended' },
    '6/9': { name: 'Six-nine', degs: ['1', '3', '5', '6', '9'], fam: 'Extended' },
    '9': { name: 'Dominant 9th', degs: ['1', '3', '5', 'b7', '9'], fam: 'Extended' },
    'maj9': { name: 'Major 9th', degs: ['1', '3', '5', '7', '9'], fam: 'Extended' },
    'm9': { name: 'Minor 9th', degs: ['1', 'b3', '5', 'b7', '9'], fam: 'Extended' },
    'm11': { name: 'Minor 11th', degs: ['1', 'b3', '5', 'b7', '9', '11'], fam: 'Extended' },
    '13': { name: 'Dominant 13th', degs: ['1', '3', '5', 'b7', '9', '13'], fam: 'Extended' },
    'maj7#11': { name: 'Major 7 ♯11 (Lydian chord)', degs: ['1', '3', '5', '7', '#11'], fam: 'Extended' },
    '7b9': { name: 'Dominant 7 ♭9', degs: ['1', '3', '5', 'b7', 'b9'], fam: 'Altered' },
    '7#9': { name: 'Dominant 7 ♯9 (Hendrix chord)', degs: ['1', '3', '5', 'b7', '#9'], fam: 'Altered' },
    '7#5': { name: 'Dominant 7 ♯5', degs: ['1', '3', '#5', 'b7'], fam: 'Altered' },
    'maj7#5': { name: 'Major 7 ♯5', degs: ['1', '3', '#5', '7'], fam: 'Altered' }
  };
  Object.keys(CHORDS).forEach(function (q) {
    CHORDS[q].ivs = CHORDS[q].degs.map(function (d) { return mod12(degSemis(d)); });
    CHORDS[q].q = q;
  });
  function chordSymbol(root, q) { return root + q; }
  /** Display label: typographic accidentals and ° for diminished. */
  function chordLabel(root, q) {
    const suf = q === 'dim' ? '°' : q === 'dim7' ? '°7' : q === 'mMaj7' ? 'm(maj7)' : q;
    return pretty(root) + pretty(suf);
  }
  function chordPcs(rootPc, q) { return (CHORDS[q] || CHORDS['']).ivs.map(function (v) { return mod12(rootPc + v); }); }
  function chordNotes(root, q) { return (CHORDS[q] || CHORDS['']).degs.map(function (d) { return spell(root, d); }); }
  function chordKind(q) {
    if (q === '7' || q === '9' || q === '13' || q === '7b9' || q === '7#9' || q === '7#5' || q === '7sus4') return 'dom';
    if (q === 'm7b5') return 'hdim';
    if (q === 'dim' || q === 'dim7') return 'dim';
    if (q === 'aug' || q === 'maj7#5') return 'aug';
    if (q === '5' || q === 'sus2' || q === 'sus4') return 'neutral';
    if (q.charAt(0) === 'm' && q.indexOf('maj') !== 0) return 'min';
    return 'maj';
  }

  /* ── Roman numerals ────────────────────────────────────── */
  const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  function parseRoman(token) {
    const m = /^(b|#)?(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)(.*)$/.exec(token);
    if (!m) throw new Error('Bad roman ' + token);
    const acc = m[1] || '';
    const num = NUMERALS.indexOf(m[2].toUpperCase()) + 1;
    const lower = m[2] === m[2].toLowerCase();
    let suf = m[3];
    let q;
    if (suf === '°' || suf === 'o') q = 'dim';
    else if (suf === '°7' || suf === 'o7') q = 'dim7';
    else if (suf === 'ø7' || suf === 'ø') q = 'm7b5';
    else if (suf === '+') q = 'aug';
    else if (lower) {
      const map = { '': 'm', '7': 'm7', 'maj7': 'mMaj7', '6': 'm6', '9': 'm9', '11': 'm11', 'add9': 'madd9', '5': '5' };
      q = map[suf] !== undefined ? map[suf] : 'm' + suf;
    } else q = suf;
    if (!CHORDS[q]) throw new Error('Unknown chord quality "' + q + '" in ' + token);
    return { deg: acc + num, q: q, token: token };
  }
  function romanPretty(token) { return pretty(token); }

  /* ── Progressions ──────────────────────────────────────── */
  // chords: "roman:beats" tokens (beats default 4). mode = tonal center scale used for analysis.
  const PROGRESSIONS = [
    // Blues
    { id: 'blues12', cat: 'Blues', name: '12-Bar Blues', mode: 'mixolydian', chords: 'I7 I7 I7 I7 IV7 IV7 I7 I7 V7 IV7 I7 V7', style: 'blues_shuffle', key: 9, bpm: 92,
      over: ['blues', 'pentatonic_minor', 'pentatonic_major', 'blues_major'],
      desc: 'The foundation of rock and blues. Three dominant 7th chords over 12 bars.',
      tip: 'Minor pentatonic or blues scale works over the whole form. For a sweeter sound, switch to major pentatonic over the I chord and target each chord’s 3rd as it arrives.' },
    { id: 'blues12_quick', cat: 'Blues', name: '12-Bar Blues (Quick Change)', mode: 'mixolydian', chords: 'I7 IV7 I7 I7 IV7 IV7 I7 I7 V7 IV7 I7 V7', style: 'blues_shuffle', key: 4, bpm: 100,
      over: ['blues', 'pentatonic_minor', 'blues_major'],
      desc: 'Same as the 12-bar, but jumps to the IV in bar 2. Used by Freddie King, SRV and countless Chicago players.',
      tip: 'Bar 2 is a great place to land on the IV chord’s 3rd, one fret below the key’s minor 3rd.' },
    { id: 'minor_blues', cat: 'Blues', name: 'Minor Blues', mode: 'aeolian', chords: 'i7 i7 i7 i7 iv7 iv7 i7 i7 bVI7 V7 i7 V7', style: 'slow_blues', key: 9, bpm: 62,
      over: ['pentatonic_minor', 'blues', 'aeolian', 'dorian'],
      desc: 'The Thrill Is Gone territory. Minor i and iv chords with a dramatic ♭VI7 to V7 turnaround.',
      tip: 'Minor pentatonic covers it all. Over the V7, hit the major 3rd of the V (the key’s leading tone) for a harmonic-minor sting.' },
    { id: 'slow_blues', cat: 'Blues', name: 'Slow Blues 12/8', mode: 'mixolydian', chords: 'I7 IV7 I7 I7 IV7 IV7 I7 I7 V7 IV7 I7 V7', style: 'slow_blues', key: 7, bpm: 58,
      over: ['blues', 'pentatonic_minor', 'blues_major'],
      desc: 'Quick-change blues at a crawl, in 12/8. Room for long bends and vibrato.',
      tip: 'Leave space. Play a phrase, then let the band answer it for a full bar.' },
    { id: 'eight_bar', cat: 'Blues', name: '8-Bar Blues', mode: 'mixolydian', chords: 'I7 V7 IV7 IV7 I7 V7 I7 V7', style: 'blues_shuffle', key: 2, bpm: 96,
      over: ['blues', 'pentatonic_minor', 'pentatonic_major'],
      desc: 'Key to the Highway form: 8 bars, faster turnover than the 12-bar.',
      tip: 'Phrases are 2 bars long here. Think in short call-and-response pairs.' },
    { id: 'jazz_blues', cat: 'Blues', name: 'Jazz Blues', mode: 'ionian', chords: 'I7 IV7 I7 v7:2 I7:2 IV7 #iv°7 I7 VI7 ii7 V7 I7:2 VI7:2 ii7:2 V7:2', style: 'jazz_swing', key: 5, bpm: 130,
      over: ['blues', 'bebop_dominant', 'pentatonic_minor'],
      desc: 'The blues with jazz substitutions: a ii-V into the IV, a passing diminished chord and a I-VI-ii-V turnaround.',
      tip: 'Blues scale gets you through, but the changes reward arpeggios. Outline each chord’s 3rd and 7th.' },

    // Rock & Pop
    { id: 'pop_axis', cat: 'Rock & Pop', name: 'I–V–vi–IV (Axis)', mode: 'ionian', chords: 'I V vi IV', style: 'pop', key: 7, bpm: 104,
      over: ['pentatonic_major', 'ionian'],
      desc: 'The most used progression in modern pop. Let It Be, With or Without You, Don’t Stop Believin’.',
      tip: 'Major pentatonic is foolproof. The major scale adds the 4th and 7th for more melodic options.' },
    { id: 'sensitive', cat: 'Rock & Pop', name: 'vi–IV–I–V (Sensitive)', mode: 'aeolian', chords: 'i bVI bIII bVII', style: 'pop', key: 9, bpm: 96,
      over: ['pentatonic_minor', 'aeolian'],
      desc: 'The Axis rotated to start on the minor chord. Sounds instantly emotional.',
      tip: 'Same notes as the relative major. Center your phrases on the minor root to make it sound sad.' },
    { id: 'rock_I_IV_V', cat: 'Rock & Pop', name: 'I–IV–V Rock', mode: 'ionian', chords: 'I IV V IV', style: 'rock', key: 4, bpm: 120,
      over: ['pentatonic_major', 'pentatonic_minor', 'mixolydian'],
      desc: 'Three chords and the truth. Louie Louie, Wild Thing, La Bamba.',
      tip: 'Mixing major and minor pentatonic over this is the classic rock move.' },
    { id: 'mixo_rock', cat: 'Rock & Pop', name: 'I–♭VII–IV (Mixolydian Rock)', mode: 'mixolydian', chords: 'I bVII IV I', style: 'rock', key: 2, bpm: 118,
      over: ['mixolydian', 'pentatonic_major', 'pentatonic_minor'],
      desc: 'The ♭VII chord gives classic rock its swagger. Sweet Home Alabama, Sympathy for the Devil, Hey Jude outro.',
      tip: 'The ♭7 is the character note. Land on it over the ♭VII chord, where it’s that chord’s root.' },
    { id: 'aeolian_rock', cat: 'Rock & Pop', name: 'i–♭VII–♭VI–♭VII', mode: 'aeolian', chords: 'i bVII bVI bVII', style: 'hard_rock', key: 4, bpm: 112,
      over: ['pentatonic_minor', 'aeolian', 'blues'],
      desc: 'Minor rock anthem loop. All Along the Watchtower’s cousin.',
      tip: 'The ♭6 of the scale is the root of the ♭VI chord. Aim for it as that chord hits.' },
    { id: 'doo_wop', cat: 'Rock & Pop', name: 'I–vi–IV–V (Doo-Wop)', mode: 'ionian', chords: 'I vi IV V', style: 'ballad68', key: 0, bpm: 66,
      over: ['pentatonic_major', 'ionian'],
      desc: '1950s progression. Stand By Me, Earth Angel, Every Breath You Take.',
      tip: 'Arpeggiate each chord. This one is all about chord tones.' },
    { id: 'pachelbel', cat: 'Rock & Pop', name: 'Pachelbel / Canon', mode: 'ionian', chords: 'I V vi iii IV I IV V', style: 'ballad', key: 2, bpm: 72,
      over: ['ionian', 'pentatonic_major'],
      desc: 'Pachelbel’s Canon, Basket Case, Graduation. Descending bass, endlessly reused.',
      tip: 'Play a descending melody that steps down by scale degree with each chord.' },
    { id: 'royal_road', cat: 'Rock & Pop', name: 'Royal Road (IV–V–iii–vi)', mode: 'ionian', chords: 'IVmaj7 V7 iii7 vi7', style: 'lofi', key: 0, bpm: 84,
      over: ['ionian', 'pentatonic_major'],
      desc: 'The emotional engine of J-pop and anime themes.',
      tip: 'The maj7 on the IV is the major scale’s 3rd. Bend into it for a bittersweet lift.' },
    { id: 'modal_mix', cat: 'Rock & Pop', name: 'I–III–IV–iv (Creep)', mode: 'ionian', chords: 'I III IV iv', style: 'ballad', key: 7, bpm: 92,
      over: ['ionian', 'pentatonic_major'],
      desc: 'Two borrowed sounds: a major III (secondary dominant) and a minor iv from the parallel minor.',
      tip: 'Over the III chord the scale shifts. Over the iv, the key’s 6th drops a half step. Follow the chord scales to hear it.' },
    { id: 'mario', cat: 'Rock & Pop', name: 'I–♭VI–♭VII–I', mode: 'ionian', chords: 'I bVI bVII I', style: 'rock', key: 0, bpm: 126,
      over: ['ionian', 'mixolydian'],
      desc: 'Borrowed ♭VI and ♭VII from the parallel minor. The heroic video-game cadence.',
      tip: 'Over ♭VI and ♭VII use the parallel minor (Aeolian), then snap back to major on the I.' },

    // Metal
    { id: 'metal_minor', cat: 'Metal', name: 'Heavy Minor', mode: 'aeolian', chords: 'i5:2 bVII5:2 bVI5:2 bVII5:2 i5:2 bVI5:2 bVII5:2 i5:2', style: 'metal', key: 4, bpm: 140,
      over: ['pentatonic_minor', 'aeolian', 'harmonic_minor'],
      desc: 'Fast-moving power chords in natural minor.',
      tip: 'Try harmonic minor for a neoclassical sound, or stay in minor pentatonic for classic heavy rock.' },
    { id: 'phrygian_metal', cat: 'Metal', name: 'Phrygian Chug (i–♭II)', mode: 'phrygian', chords: 'i5:8 bII5:4 i5:4', style: 'thrash', key: 4, bpm: 170,
      over: ['phrygian', 'phrygian_dominant', 'pentatonic_minor'],
      desc: 'The half-step ♭II is the darkest move in metal. Metallica, Slayer, Megadeth.',
      tip: 'Hammer the ♭2 against the open low string. Phrygian dominant adds a major 3rd for a Middle Eastern edge.' },
    { id: 'neoclassical', cat: 'Metal', name: 'Neoclassical (i–iv–V7)', mode: 'harmonic_minor', chords: 'i iv V7 i bVI iv V7 V7', style: 'metal', key: 9, bpm: 132,
      over: ['harmonic_minor', 'aeolian'],
      desc: 'Classical harmony at metal volume. The V7 needs the raised 7th from harmonic minor.',
      tip: 'Over the V7, play phrygian dominant from the V. It contains the same notes as the key’s harmonic minor.' },
    { id: 'power_two', cat: 'Metal', name: 'Power Vamp (i5–♭VII5)', mode: 'aeolian', chords: 'i5 bVII5', style: 'hard_rock', key: 2, bpm: 110,
      over: ['pentatonic_minor', 'aeolian', 'dorian'],
      desc: 'Two power chords. No thirds, so major and minor colors both work.',
      tip: 'Because power chords have no 3rd, try Dorian and Aeolian back to back and hear the 6th change color.' },
    { id: 'epic_minor', cat: 'Metal', name: 'Epic Minor (i–♭VI–♭III–♭VII)', mode: 'aeolian', chords: 'i bVI bIII bVII', style: 'hard_rock', key: 2, bpm: 100,
      over: ['aeolian', 'pentatonic_minor'],
      desc: 'Soaring anthem progression. Power metal, film trailers, arena rock.',
      tip: 'Long, singing notes. Target the 3rd of each chord as it lands.' },

    // Jazz
    { id: 'ii_V_I', cat: 'Jazz', name: 'ii–V–I Major', mode: 'ionian', chords: 'ii7 V7 Imaj7:8', style: 'jazz_swing', key: 0, bpm: 120,
      over: ['ionian', 'bebop_dominant'],
      desc: 'The core cadence of jazz. Learn it in every key.',
      tip: 'The 7th of each chord falls a half step to become the 3rd of the next. Find that guide-tone line.' },
    { id: 'ii_V_i', cat: 'Jazz', name: 'ii–V–i Minor', mode: 'aeolian', chords: 'iiø7 V7 i7:8', style: 'jazz_swing', key: 2, bpm: 120,
      over: ['harmonic_minor', 'aeolian'],
      desc: 'Minor-key cadence: half-diminished ii, dominant V, minor i.',
      tip: 'Locrian over the iiø7, phrygian dominant or altered over the V7, Dorian or Aeolian on the i.' },
    { id: 'turnaround', cat: 'Jazz', name: 'I–vi–ii–V Turnaround', mode: 'ionian', chords: 'Imaj7 vi7 ii7 V7', style: 'jazz_swing', key: 5, bpm: 140,
      over: ['ionian', 'pentatonic_major'],
      desc: 'Circles back to the top of the tune. Countless standards end their sections with it.',
      tip: 'Every chord is diatonic, so one major scale works. Arpeggios make it sound like jazz.' },
    { id: 'autumn', cat: 'Jazz', name: 'Autumn Cycle', mode: 'aeolian', chords: 'iv7 bVII7 bIIImaj7 bVImaj7 iiø7 V7 i7:8', style: 'jazz_swing', key: 4, bpm: 116,
      over: ['aeolian', 'harmonic_minor'],
      desc: 'A full cycle of fourths through the relative major, then a minor ii-V-i. The heart of Autumn Leaves.',
      tip: 'Natural minor covers the first six chords. Switch to harmonic minor on the V7.' },
    { id: 'rhythm', cat: 'Jazz', name: 'Rhythm Changes A', mode: 'ionian', chords: 'Imaj7:2 vi7:2 ii7:2 V7:2 iii7:2 VI7:2 ii7:2 V7:2', style: 'jazz_swing', key: 10, bpm: 170,
      over: ['ionian', 'pentatonic_major', 'blues'],
      desc: 'Gershwin’s I Got Rhythm. Two chords per bar, the bebop proving ground.',
      tip: 'Fast changes. Major pentatonic of the key survives it; arpeggios win it.' },
    { id: 'bossa', cat: 'Latin & World', name: 'Bossa Nova', mode: 'ionian', chords: 'Imaj7:8 II7:8 ii7:4 bII7:4 Imaj7:8', style: 'bossa', key: 5, bpm: 132,
      over: ['ionian', 'lydian_dominant'],
      desc: 'Girl from Ipanema-style motion: a non-resolving II7 and a tritone substitution.',
      tip: 'The II7 wants Lydian Dominant. Hear how the raised 4th differs from the key.' },

    // Modal
    { id: 'dorian_vamp', cat: 'Modal', name: 'Dorian Vamp (i7–IV7)', mode: 'dorian', chords: 'i7:8 IV7:8', style: 'funk', key: 9, bpm: 100,
      over: ['dorian', 'pentatonic_minor'],
      desc: 'Oye Como Va, Evil Ways, Moondance. The IV7 chord is Dorian’s fingerprint.',
      tip: 'The natural 6th of Dorian is the 3rd of the IV7 chord. Lean on it.' },
    { id: 'dorian_ii', cat: 'Modal', name: 'Dorian Vamp (i7–ii7)', mode: 'dorian', chords: 'i7:8 ii7:8', style: 'funk', key: 9, bpm: 104,
      over: ['dorian', 'pentatonic_minor'],
      desc: 'Smooth minor vamp. RHCP, Santana, So What-style modal grooves.',
      tip: 'Minor pentatonic first, then add Dorian’s 2nd and 6th.' },
    { id: 'mixo_vamp', cat: 'Modal', name: 'Mixolydian Vamp (I–♭VII)', mode: 'mixolydian', chords: 'I:8 bVII:8', style: 'rock', key: 4, bpm: 116,
      over: ['mixolydian', 'pentatonic_major'],
      desc: 'Norwegian Wood, jam-band staple. Major with a flat 7.',
      tip: 'Major pentatonic plus the ♭7. Slide into the ♭7 over the ♭VII chord.' },
    { id: 'lydian_vamp', cat: 'Modal', name: 'Lydian Vamp (I–II)', mode: 'lydian', chords: 'Imaj7:8 II:8', style: 'ballad', key: 5, bpm: 80,
      over: ['lydian', 'pentatonic_major'],
      desc: 'The dreamy major II chord is Lydian’s signature. Satriani’s Flying in a Blue Dream, film scores.',
      tip: 'The ♯4 is the 3rd of the II chord. Hold it over the I for that floating feeling.' },
    { id: 'phrygian_vamp', cat: 'Modal', name: 'Phrygian Vamp (i–♭II)', mode: 'phrygian', chords: 'i:8 bII:8', style: 'ballad68', key: 4, bpm: 64,
      over: ['phrygian', 'phrygian_dominant'],
      desc: 'Spanish and cinematic. The ♭II major chord sits a half step above home.',
      tip: 'Try phrygian dominant to turn the i chord major. Instant flamenco.' },
    { id: 'aeolian_vamp', cat: 'Modal', name: 'Aeolian Vamp (i–♭VI)', mode: 'aeolian', chords: 'i:8 bVI:8', style: 'ballad', key: 4, bpm: 74,
      over: ['aeolian', 'pentatonic_minor'],
      desc: 'Brooding minor vamp built around the natural minor ♭6.',
      tip: 'The ♭6 is the root of the ♭VI chord. It’s the note that makes this sound sad instead of Dorian-cool.' },
    { id: 'andalusian', cat: 'Latin & World', name: 'Andalusian Cadence', mode: 'aeolian', chords: 'i bVII bVI V', style: 'reggae', key: 4, bpm: 84,
      over: ['aeolian', 'phrygian_dominant', 'harmonic_minor'],
      desc: 'i-♭VII-♭VI-V descending to a major V. Hit the Road Jack, Walk Don’t Run, flamenco.',
      tip: 'Natural minor for the first three chords, then raise the 7th (harmonic minor) for the major V.' },
    { id: 'reggae_one', cat: 'Latin & World', name: 'Reggae I–IV', mode: 'ionian', chords: 'I:8 IV:8 I:8 V:8', style: 'reggae', key: 7, bpm: 76,
      over: ['pentatonic_major', 'ionian'],
      desc: 'Classic roots reggae: skank on the offbeats, bass carries the melody.',
      tip: 'Short, rhythmic phrases. Leave holes for the bass.' },

    // Funk & Soul
    { id: 'funk_vamp', cat: 'Funk & Soul', name: 'One-Chord Funk (I9)', mode: 'mixolydian', chords: 'I9:16', style: 'funk', key: 4, bpm: 104,
      over: ['pentatonic_minor', 'mixolydian', 'dorian'],
      desc: 'James Brown funk. One chord, all groove.',
      tip: 'The groove is the point. Short, percussive phrases, ghost notes and 16th-note rhythm.' },
    { id: 'neo_soul', cat: 'Funk & Soul', name: 'Neo-Soul Cycle', mode: 'ionian', chords: 'IVmaj7 iii7 ii9 Imaj7', style: 'lofi', key: 3, bpm: 78,
      over: ['ionian', 'pentatonic_major', 'dorian'],
      desc: 'Lush 7th and 9th chords stepping down the scale. D’Angelo, Erykah Badu, lo-fi beats.',
      tip: 'Play double-stops and small chord fragments, not just single notes.' },
    { id: 'country_train', cat: 'Funk & Soul', name: 'Country I–IV–V', mode: 'ionian', chords: 'I:8 IV:8 V:8 I:8', style: 'country', key: 7, bpm: 150,
      over: ['pentatonic_major', 'blues_major', 'mixolydian'],
      desc: 'Train-beat country. Brad Paisley, Johnny Cash, chicken pickin’.',
      tip: 'Major pentatonic plus the ♭3 as a passing note. Hybrid pick double-stops.' }
  ];
  const PROG_CATEGORIES = ['Blues', 'Rock & Pop', 'Metal', 'Jazz', 'Modal', 'Funk & Soul', 'Latin & World'];
  PROGRESSIONS.forEach(function (p) {
    p.steps = p.chords.split(/\s+/).map(function (tok) {
      const parts = tok.split(':');
      return { roman: parts[0], beats: parts[1] ? +parts[1] : 4 };
    });
  });
  function progression(id) { return PROGRESSIONS.find(function (p) { return p.id === id; }) || null; }

  /** Resolve a progression (or custom step list) in a key to concrete chords. */
  function resolveProgression(steps, keyPc, mode) {
    const keyName = rootName(keyPc, mode);
    let beat = 0;
    const chords = steps.map(function (st) {
      const r = parseRoman(st.roman);
      const root = spell(keyName, r.deg);
      const rootPc = mod12(keyPc + degSemis(r.deg));
      const c = {
        roman: st.roman, beats: st.beats, start: beat, deg: r.deg, q: r.q,
        root: root, rootPc: rootPc, symbol: root + r.q, pcs: chordPcs(rootPc, r.q),
        notes: chordNotes(root, r.q), kind: chordKind(r.q)
      };
      beat += st.beats;
      return c;
    });
    chords.forEach(function (c, i) { c.next = chords[(i + 1) % chords.length]; });
    const total = beat;
    chords.forEach(function (c, i) { c.scales = chordScales(c, keyPc, mode, chords, i); });
    return { key: keyName, keyPc: keyPc, mode: mode, chords: chords, totalBeats: total };
  }

  /**
   * Chord-scale analysis. Returns ranked scale options for one chord in context.
   * 1. Chord fits the key's parent scale → the matching mode of that parent.
   * 2. Secondary dominants → mixolydian (to major) or phrygian dominant (to minor).
   * 3. Borrowed chords → modes of the parallel minor/major/harmonic minor.
   * 4. Fallback by chord quality.
   */
  function chordScales(c, keyPc, mode, all, idx) {
    const out = [];
    function add(scId, why, rootPc) {
      const rp = rootPc === undefined ? c.rootPc : rootPc;
      if (!scale(scId)) return;
      if (out.some(function (o) { return o.id === scId && o.rootPc === rp; })) return;
      out.push({ id: scId, rootPc: rp, root: rp === c.rootPc ? c.root : rootName(rp, scId), why: why });
    }
    function modeOf(parentId, parentRoot) {
      const pcs = scalePcs(parentRoot, parentId);
      const has = c.pcs.every(function (p) { return pcs.indexOf(p) >= 0; });
      if (!has || pcs.indexOf(c.rootPc) < 0) return null;
      return scaleFromPcs(c.rootPc, pcs);
    }
    const kindRel = mod12(c.rootPc - keyPc);
    const parentMode = (mode === 'blues' || mode === 'pentatonic_minor') ? 'aeolian' : mode;
    // 1. Key parent
    const m1 = modeOf(parentMode, keyPc);
    if (m1) add(m1, 'Diatonic: same notes as the key, centered on this chord');
    // ii–V pairs outside the key: the minor chord is a ii, so Dorian (or Locrian for m7♭5)
    if (!m1 && c.next && c.next.kind === 'dom' && mod12(c.next.rootPc - c.rootPc) === 5) {
      if (c.kind === 'min') add('dorian', 'The ii of a ii–V into ' + c.next.root + '7');
      if (c.kind === 'hdim') add('locrian', 'The iiø of a minor ii–V');
    }
    // 2. Secondary / primary dominant resolving down a 5th
    if (c.kind === 'dom' || (c.q === '' && !m1)) {
      const nx = c.next;
      if (nx && mod12(nx.rootPc - c.rootPc) === 5) {
        if (nx.kind === 'min' || nx.kind === 'hdim') add('phrygian_dominant', 'Dominant resolving to a minor chord (harmonic minor of the target)');
        else add('mixolydian', 'Dominant resolving to a major chord');
        if (c.kind === 'dom') add('altered', 'Jazz option: maximum tension before resolving');
      }
      // Secondary dominant of a diatonic minor chord even when it does not resolve directly
      const tgt = mod12(c.rootPc + 5);
      if (!m1 && c.q === '' && scalePcs(keyPc, parentMode).indexOf(tgt) >= 0) {
        const tm = scaleFromPcs(tgt, scalePcs(keyPc, parentMode));
        if (tm && scale(tm).minorish) add('phrygian_dominant', 'Secondary dominant: acts as the V of ' + rootName(tgt, 'aeolian') + 'm');
      }
    }
    // 3. Borrowed from parallel scales
    if (!m1) {
      ['aeolian', 'ionian', 'dorian', 'mixolydian', 'harmonic_minor', 'melodic_minor', 'phrygian', 'lydian'].forEach(function (pm) {
        if (pm === parentMode) return;
        const mm = modeOf(pm, keyPc);
        if (mm) add(mm, 'Borrowed from ' + rootName(keyPc, pm) + ' ' + scale(pm).name);
      });
    }
    // Non-resolving dominants on ♭VI, ♭VII, ♭II, II, IV in jazz/blues contexts
    if (c.kind === 'dom' && [1, 2, 8, 10].indexOf(kindRel) >= 0) add('lydian_dominant', 'Non-resolving dominant: the ♯11 is the sweet spot');
    // 4. Quality fallback
    const fb = { maj: ['ionian', 'lydian'], min: ['dorian', 'aeolian'], dom: ['mixolydian', 'lydian_dominant'], hdim: ['locrian', 'locrian_n2'], dim: ['diminished_wh'], aug: ['whole_tone'], neutral: ['aeolian', 'mixolydian'] }[c.kind] || ['ionian'];
    fb.forEach(function (s) { add(s, 'Standard choice for a ' + CHORDS[c.q].name.toLowerCase() + ' chord'); });
    if (c.q === 'dim7') add('diminished_wh', 'Symmetric scale built on the dim7 chord');
    // Pentatonic shortcuts
    if (c.kind === 'min' || c.kind === 'neutral') add('pentatonic_minor', 'Safe and vocal: no avoid notes');
    if (c.kind === 'maj') add('pentatonic_major', 'Safe and sweet: no avoid notes');
    if (c.kind === 'dom') { add('pentatonic_major', 'Sweet side of a dominant chord'); add('blues', 'Blues sound over a dominant chord'); }
    // Blues dominants: classic mixolydian first
    if (mode === 'mixolydian' && c.kind === 'dom' && !m1 && [0, 5, 7].indexOf(kindRel) >= 0) {
      const i = out.findIndex(function (o) { return o.id === 'mixolydian'; });
      if (i > 0) out.unshift(out.splice(i, 1)[0]);
    }
    return out;
  }

  /* ── Diatonic harmony ──────────────────────────────────── */
  const ROMAN_BY_DEG = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  /** Stack thirds on each degree of a 7-note scale. */
  function harmonize(rootNameStr, scaleId, sevenths) {
    const s = scale(scaleId);
    if (!s || s.ivs.length !== 7) return [];
    const rootPc = pcOf(rootNameStr);
    return s.ivs.map(function (iv, i) {
      const tri = [0, 2, 4, 6].slice(0, sevenths ? 4 : 3).map(function (k) { return s.ivs[(i + k) % 7]; });
      const rel = tri.map(function (v) { return mod12(v - iv); });
      const key = rel.join(',');
      const q = ({ '0,4,7': '', '0,3,7': 'm', '0,3,6': 'dim', '0,4,8': 'aug',
        '0,4,7,10': '7', '0,4,7,11': 'maj7', '0,3,7,10': 'm7', '0,3,6,10': 'm7b5', '0,3,6,9': 'dim7', '0,3,7,11': 'mMaj7', '0,4,8,11': 'maj7#5' })[key];
      const quality = q === undefined ? '?' : q;
      const deg = s.degs[i];
      const acc = deg.replace(/\d+/, '');
      let numeral = ROMAN_BY_DEG[i];
      const kind = chordKind(quality);
      if (kind === 'min' || kind === 'hdim' || kind === 'dim') numeral = numeral.toLowerCase();
      const suffix = quality === 'mMaj7' ? 'maj7' : quality === 'dim' ? '°' : quality === 'dim7' ? '°7' : quality === 'm7b5' ? 'ø7' : quality === 'aug' ? '+' :
        (kind === 'min' ? quality.replace(/^m/, '') : quality);
      const root = spell(rootNameStr, deg);
      return { deg: deg, roman: acc + numeral + suffix, root: root, q: quality, symbol: root + quality,
        rootPc: mod12(rootPc + iv), func: chordFunction(i, s), mode: scaleFromPcs(mod12(rootPc + iv), scalePcs(rootPc, scaleId)) };
    });
  }
  function chordFunction(i, s) {
    if (i === 0) return 'Tonic';
    if (i === 4) return 'Dominant';
    if (i === 3 || i === 1) return 'Predominant';
    if (i === 6) return s.ivs[6] === 11 ? 'Dominant' : 'Subtonic';
    return 'Tonic substitute';
  }

  /* ── Key signature helpers ─────────────────────────────── */
  const CIRCLE = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // C G D A E B F#/Gb Db Ab Eb Bb F
  const CIRCLE_MAJOR = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  const CIRCLE_MINOR = ['A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'Bb', 'F', 'C', 'G', 'D'];
  const CIRCLE_SIG = ['0', '1♯', '2♯', '3♯', '4♯', '5♯', '6♯ / 6♭', '5♭', '4♭', '3♭', '2♭', '1♭'];

  return {
    SHARPS, FLATS, LETTERS, ROOT_CHOICES, SCALES, SCALE_FAMILIES, CHORDS, INTERVALS, PROGRESSIONS, PROG_CATEGORIES,
    CIRCLE, CIRCLE_MAJOR, CIRCLE_MINOR, CIRCLE_SIG,
    mod12, parseNote, pcOf, pretty, midiToFreq, midiName, degSemis, spell, scale, scalePcs, scaleFromPcs, rootName, scaleNotes,
    toneRole, chordPcs, chordNotes, chordSymbol, chordLabel, chordKind, parseRoman, romanPretty, progression, resolveProgression, chordScales, harmonize
  };
})();
if (typeof module !== 'undefined') module.exports = Theory;
