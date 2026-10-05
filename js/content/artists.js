/* AXELAB · Artist style guides.
   Licks are original phrases written "in the style of" each player, in compact tab
   notation (see Tab.fromCompact). Each lick declares its key and scale so the
   test suite can verify every note. */
const ARTISTS = [
  {
    n: 'Slash', ico: 'SL', b: "Guns N' Roses · Velvet Revolver", era: '1985–', st: 'Blues-based hard rock',
    tuning: 'E♭ standard (half step down)', gear: 'Les Paul with humbuckers into a cranked Marshall. Neck pickup for solos, a touch of wah.',
    sig: 'The pentatonic poet of hard rock. Slash lives in the minor pentatonic box and makes it sing, adding the major 3rd and the ♭7 for a bluesy major color over rock changes. His wide, slow vibrato and singing neck-pickup tone make three notes sound like a melody you have known for years.',
    scales: ['Minor Pentatonic', 'Blues', 'Aeolian', 'Mixolydian'], techs: ['Wide vibrato', 'Whole-step bends', 'Legato runs', 'Chromatic passing tones'],
    tips: [
      'Write the solo like a vocal melody: hum it first, then find it on the neck.',
      'Mix minor pentatonic with the major 3rd (a quarter-step curl from the ♭3) over major chords.',
      'Vibrato: push up, release fully, repeat evenly. Width before speed.',
      'Use the neck pickup with the tone knob rolled back slightly for that vocal top end.'
    ],
    listen: ['Sweet Child o’ Mine', 'November Rain', 'Paradise City', 'Slither (Velvet Revolver)'],
    licks: [
      { lbl: 'Singing bend into a pentatonic descent', tabc: 'B15b17~:3 e12 B15 B12 G14b16:2 G12 D14 D12~:4', key: 4, scale: 'pentatonic_minor', bpm: 80, tone: 'lead' },
      { lbl: 'The ♭3-to-3 curl', tabc: 'e12 B15 B12 G14 G12b13~:2 D14 D12 A14:2 E12~:4', key: 4, scale: 'blues', allow: [8], bpm: 84, tone: 'lead', cap: 'The quarter-tone bend from G to G♯ blurs minor and major. That ambiguity is the sound.' }
    ],
    jam: { prog: 'aeolian_rock', key: 4, style: 'hard_rock', scale: 'pentatonic_minor', bpm: 104 }
  },
  {
    n: 'John Frusciante', ico: 'JF', b: 'Red Hot Chili Peppers', era: '1988–', st: 'Funk rock, melodic minimalism',
    tuning: 'Standard', gear: 'Vintage Stratocaster into a Marshall Major, Big Muff and a touch of chorus.',
    sig: 'One of the most musical rock guitarists of his generation. Frusciante treats the guitar as a voice in a conversation: double-stops, small chord fragments and melodies woven into the rhythm part, all drawn from Hendrix and Curtis Mayfield. Over minor vamps he favors Dorian, where the natural 6th gives a bittersweet lift.',
    scales: ['Minor Pentatonic', 'Dorian', 'Major', 'Mixolydian'], techs: ['Double-stops', 'Thumb-over bass notes', 'Muted 16th rhythm', 'Rhythm-lead blending'],
    tips: [
      'Dorian’s secret is the major 6th (F♯ over Am). Land on it over the minor chord.',
      'Play fewer notes than you think you need. Each one should be a choice.',
      'Keep your strumming hand moving in 16ths even when you aren’t hitting the strings.',
      'Practice melodies in 3rds on the G and B strings. They sound like two singers.'
    ],
    listen: ['Under the Bridge', 'Scar Tissue', 'Can’t Stop', 'Dani California'],
    licks: [
      { lbl: 'Dorian double-stops (3rds on G and B)', tabc: 'G7+B7 G9+B8 G11+B10:2 G9+B8 G7+B7:2 G5+B5:4', key: 9, scale: 'dorian', bpm: 84, tone: 'clean' },
      { lbl: 'Melodic line leaning on the 6th', tabc: 'e5 e7 B7:2 e5 B8 B7 B5:2 G7 G5:4', key: 9, scale: 'dorian', bpm: 90, tone: 'clean', cap: 'F♯ is the 6th of A Dorian. Hear how it brightens the minor sound.' }
    ],
    jam: { prog: 'dorian_ii', key: 9, style: 'funk', scale: 'dorian', bpm: 96 }
  },
  {
    n: 'David Gilmour', ico: 'DG', b: 'Pink Floyd', era: '1968–', st: 'Melodic art rock',
    tuning: 'Standard', gear: 'Black Stratocaster, Hiwatt amps, Big Muff, long delay and a rotary speaker.',
    sig: 'The master of space. Gilmour’s genius is in what he leaves out: every note is earned, and solos build over 16-bar arcs to a climax. His bends are wide and perfectly in tune before any vibrato is added, and his tone is sustain, delay and air.',
    scales: ['Minor Pentatonic', 'Blues', 'Dorian', 'Aeolian'], techs: ['In-tune wide bends', 'Slow vibrato', 'Melodic phrasing', 'Delay as an instrument'],
    tips: [
      'Bend to pitch first, then add vibrato. Never both at once until the pitch is right.',
      'Plan the arc: start low and slow, save your highest note for the end.',
      'Try the S-bend: bend up, hold, release partway, bend up again.',
      'Dynamics: start a phrase softly, grow to the top note, decay as it releases.'
    ],
    listen: ['Comfortably Numb', 'Time', 'Shine On You Crazy Diamond', 'Money'],
    licks: [
      { lbl: 'Bend, hold, release, settle', tabc: 'G9b11~:4 G9b11r G7 D9:2 D7~:4', key: 11, scale: 'pentatonic_minor', bpm: 66, tone: 'lead' },
      { lbl: 'Climactic high bend', tabc: 'e10b12~:4 e10 e7 B10b12r B7:2 G9b11~:4', key: 11, scale: 'pentatonic_minor', bpm: 66, tone: 'lead', cap: 'Every bend lands on a pentatonic note: E to F♯, D to E, A to B.' }
    ],
    jam: { prog: 'aeolian_vamp', key: 11, style: 'ballad', scale: 'pentatonic_minor', bpm: 66 }
  },
  {
    n: 'Jimi Hendrix', ico: 'JH', b: 'The Jimi Hendrix Experience', era: '1966–1970', st: 'Psychedelic blues rock',
    tuning: 'E♭ standard', gear: 'Stratocaster (right-handed, flipped), Marshall stacks, Fuzz Face, Uni-Vibe, wah.',
    sig: 'The guitarist who redrew the map. Hendrix fused blues, R&B, jazz and psychedelia into one language, playing bass notes, rhythm and lead at the same time with his thumb over the neck. He mixed minor and major pentatonic freely and made the 7♯9 chord a rock staple.',
    scales: ['Minor Pentatonic', 'Blues', 'Mixolydian', 'Major Pentatonic'], techs: ['Thumb-over bass notes', 'Chord embellishments', 'Double-stops', 'Whammy and wah'],
    tips: [
      'Learn the 7♯9 chord (x7678x for E7♯9). It contains both the major and minor 3rd.',
      'Over a static chord, alternate chord stabs with short single-note fills.',
      'Descend in 6ths on the G and high e strings for that R&B ballad sound.',
      'Use the thumb to fret the bass note so your fingers are free for embellishments.'
    ],
    listen: ['Little Wing', 'Purple Haze', 'Voodoo Child (Slight Return)', 'The Wind Cries Mary'],
    licks: [
      { lbl: '7♯9 stabs with a pentatonic answer', tabc: 'A7+D6+G7+B8:2 A7+D6+G7+B8:2 B3 pB0 G2 pG0 D2:2 E0~:4', key: 4, scale: 'blues', allow: [8, 7, 11], bpm: 96, tone: 'crunch' },
      { lbl: 'Descending 6ths (E Mixolydian)', tabc: 'G9+e9:2 G7+e7 G6+e5:2 G4+e4 G2+e2:2 G1+e0:4', key: 4, scale: 'mixolydian', bpm: 72, tone: 'clean', cap: 'Skip the B string and play the G and high e together. This interval is a 6th.' }
    ],
    jam: { prog: 'blues12_quick', key: 4, style: 'blues_shuffle', scale: 'blues', bpm: 100 }
  },
  {
    n: 'Eddie Van Halen', ico: 'EV', b: 'Van Halen', era: '1978–2020', st: 'Virtuoso hard rock',
    tuning: 'E♭ standard (often)', gear: 'Self-built “Frankenstrat”, Marshall Plexi on a Variac, MXR Phase 90 and Flanger.',
    sig: 'After Hendrix, the most influential electric guitarist. Van Halen popularized two-hand tapping, rhythmic whammy work and the “brown sound”: hot, saturated but articulate. Underneath the fireworks was a groove-first rhythm player with a deep blues vocabulary.',
    scales: ['Minor Pentatonic', 'Blues', 'Dorian', 'Mixolydian'], techs: ['Two-hand tapping', 'Legato', 'Whammy dips', 'Rhythmic alternate picking'],
    tips: [
      'Tapping: tap with the picking hand, pull off toward the floor so the next note sounds.',
      'Every note in a tapping run should be equally loud. Record yourself and listen.',
      'Mute unused strings with the side of your picking hand while tapping.',
      'If it tenses up, slow down 30%. Speed comes from relaxation.'
    ],
    listen: ['Eruption', 'Ain’t Talkin’ ’bout Love', 'Panama', 'Hot for Teacher'],
    licks: [
      { lbl: 'Tapped triads: Em, C, D', tabc: 'tB12 pB5 hB8 tB12 pB5 hB8 tB13 pB5 hB8 tB13 pB5 hB8 tB15 pB7 hB10 tB15 pB7 hB10 tB12 pB5 hB8 tB12:4', key: 4, scale: 'aeolian', bpm: 70, tone: 'lead', cap: 'T = tap with the picking hand, then pull off to the fretted note and hammer the next.' },
      { lbl: 'Descending legato pentatonic', tabc: 'e15 pe12 B15 pB12 G14 pG12 D14 pD12 A14 pA12 E15 pE12:4', key: 4, scale: 'pentatonic_minor', bpm: 90, tone: 'lead' }
    ],
    jam: { prog: 'mixo_vamp', key: 4, style: 'hard_rock', scale: 'pentatonic_minor', bpm: 120 }
  },
  {
    n: 'Kirk Hammett', ico: 'KH', b: 'Metallica', era: '1983–', st: 'Thrash metal lead',
    tuning: 'Standard / E♭ standard', gear: 'ESP superstrats, Mesa/Boogie and Randall amps, always a wah.',
    sig: 'The defining thrash lead guitarist. Hammett brought blues-based pentatonic phrasing into metal, adding harmonic minor for exotic tension and using the wah as a rhythmic filter. Solos often move from a fast run to a melodic phrase to a climactic burst.',
    scales: ['Minor Pentatonic', 'Blues', 'Harmonic Minor', 'Phrygian Dominant'], techs: ['Fast alternate picking', 'Repeating pentatonic patterns', 'Wah', 'Legato'],
    tips: [
      'Repeating three-note groups across beats create speed that sounds bigger than it is.',
      'Rock the wah in time with the notes, not randomly.',
      'Practice crossing from pentatonic box 1 to box 2 smoothly.',
      'The raised 7th of harmonic minor (D♯ in E) is the sinister note.'
    ],
    listen: ['Master of Puppets', 'One', 'Enter Sandman', 'Fade to Black'],
    licks: [
      { lbl: 'Repeating pentatonic triplets', tabc: 'e15 e12 B15 e15 e12 B15 e15 e12 B15 e15 e12 B15 | B15 B12 G14 B15 B12 G14 B15 B12 G14 B15 B12 G14:2', key: 4, scale: 'pentatonic_minor', bpm: 110, tone: 'metal' },
      { lbl: 'Harmonic minor sting', tabc: 'e12 e11 e8 e7 B10 B8 B7 G8 G9~:4', key: 4, scale: 'harmonic_minor', bpm: 90, tone: 'metal', cap: 'D♯ is the raised 7th. Resolving it up to E is pure drama.' }
    ],
    jam: { prog: 'metal_minor', key: 4, style: 'metal', scale: 'pentatonic_minor', bpm: 140 }
  },
  {
    n: 'Dimebag Darrell', ico: 'DD', b: 'Pantera · Damageplan', era: '1983–2004', st: 'Groove metal',
    tuning: 'Drop D and lower', gear: 'Dean ML, Randall solid-state amps, DigiTech Whammy, MXR EQ.',
    sig: 'The groove behind 1990s metal. Dimebag combined thrash precision with blues swagger and a rhythm feel built on syncopation. His pinch-harmonic squeals, violent vibrato and dive-bomb whammy work are among the most imitated sounds in heavy music.',
    scales: ['Minor Pentatonic', 'Blues', 'Dorian', 'Chromatic'], techs: ['Pinch harmonics', 'Groove riffing', 'Whammy dives', 'Aggressive vibrato'],
    tips: [
      'Pinch harmonic: choke up on the pick so the thumb’s edge brushes the string right after the pick.',
      'Move your picking point toward the neck to find different harmonic pitches.',
      'Count the syncopations. The rhythm is the riff, so learn it at half speed.',
      'Vibrato should be wide and fast at the same time. Drive it from the wrist.'
    ],
    listen: ['Walk', 'Cowboys from Hell', 'Floods', 'Cemetery Gates'],
    licks: [
      { lbl: 'Drop D groove with the blue note', tabc: 'E0:2 E0 E3 E0 E5:2 E6 E5 E3 E0:3', key: 2, scale: 'blues', tuning: 'drop_d', bpm: 92, tone: 'metal' },
      { lbl: 'Pinch harmonic squeal', tabc: 'E0:2 G7b9~:6 E0 E0 E3:2', key: 2, scale: 'pentatonic_minor', tuning: 'drop_d', allow: [4], bpm: 80, tone: 'metal', cap: 'Pick the bent G-string note with a pinch harmonic for the squeal, then bend and shake it.' }
    ],
    jam: { prog: 'power_two', key: 2, style: 'hard_rock', scale: 'blues', bpm: 96 }
  },
  {
    n: 'Dave Mustaine', ico: 'DM', b: 'Megadeth · early Metallica', era: '1981–', st: 'Technical thrash',
    tuning: 'Standard / E♭', gear: 'Jackson and Dean V-shapes, Marshall JCM800, high gain with tight low end.',
    sig: 'The architect of technical thrash. Mustaine’s riffs are multi-part compositions full of rhythmic displacement, and his solos return to motifs like a composer’s themes. Phrygian menace and harmonic minor drama define his sound.',
    scales: ['Phrygian', 'Harmonic Minor', 'Phrygian Dominant', 'Minor Pentatonic'], techs: ['Precise alternate picking', 'Gallops', 'Rhythmic displacement', 'Harmonic minor arpeggios'],
    tips: [
      'Gallop rhythm = an 8th note and two 16ths. Keep it locked to the kick drum.',
      'The ♭2 over an open low string creates instant Phrygian menace.',
      'Shift a riff by one 16th note to create a mechanical, off-balance feel.',
      'Downstrokes and upstrokes must sound identical in volume and tone.'
    ],
    listen: ['Holy Wars… The Punishment Due', 'Peace Sells', 'Hangar 18', 'Symphony of Destruction'],
    licks: [
      { lbl: 'Phrygian gallop riff', tabc: 'E0:2 E0 E0 E1:2 E0 E0 | E0:2 E0 E0 E3 E1 E0:3', key: 4, scale: 'phrygian', bpm: 150, tone: 'metal' },
      { lbl: 'E major arpeggio into A minor (harmonic minor)', tabc: 'A7 D6 D9 G9 B9 e7 e8 e7 B9 B10:4', key: 9, scale: 'harmonic_minor', bpm: 90, tone: 'metal', cap: 'The E major arpeggio is the V chord of A harmonic minor. G♯ pulls straight to A.' }
    ],
    jam: { prog: 'phrygian_metal', key: 4, style: 'thrash', scale: 'phrygian', bpm: 170 }
  },
  {
    n: 'Jerry Cantrell', ico: 'JC', b: 'Alice in Chains', era: '1987–', st: 'Dark grunge and metal',
    tuning: 'E♭ standard and drop D♭', gear: 'G&L Rampage, Bogner and Marshall amps, wah, chorus.',
    sig: 'The dark harmonic heart of grunge. Cantrell writes heavy, down-picked riffs on detuned guitars, uses open-string pedal points and harmonizes his own leads in 3rds. Bends that hang between notes give his solos their uneasy, haunted feel.',
    scales: ['Minor Pentatonic', 'Aeolian', 'Blues', 'Lydian'], techs: ['Down-picked riffs', 'Harmonized lines', 'Drop D riffing', 'Open-string pedal points'],
    tips: [
      'Drop D: lower the 6th string a whole step. One finger now plays power chords.',
      'Down-pick rhythm parts. It is an endurance skill; build it slowly.',
      'Harmonize a melody in diatonic 3rds on adjacent strings.',
      'Let a bend hang a little flat for tension, then push it to pitch.'
    ],
    listen: ['Would?', 'Rooster', 'Man in the Box', 'Them Bones'],
    licks: [
      { lbl: 'Drop D riff with a half-step bend', tabc: 'E0 E0 E3 E0 E5 E0 E3 E1:2 | D2b3~:4', key: 2, scale: 'aeolian', tuning: 'drop_d', allow: [3], bpm: 100, tone: 'lead' },
      { lbl: 'Harmonized 3rds in D minor', tabc: 'G7+B6 G9+B8 G10+B10 G12+B11:2 G10+B10 G9+B8 G7+B6:4', key: 2, scale: 'aeolian', bpm: 84, tone: 'crunch' }
    ],
    jam: { prog: 'aeolian_rock', key: 2, style: 'hard_rock', scale: 'aeolian', bpm: 92 }
  },
  {
    n: 'Jack White', ico: 'JW', b: 'The White Stripes · The Raconteurs', era: '1997–', st: 'Garage blues rock',
    tuning: 'Standard, open A, open G', gear: 'Plastic department-store guitars, DigiTech Whammy for octave-down riffs, Big Muff, slide.',
    sig: 'The great blues-rock revivalist of the 2000s. White builds huge sounds from very little: a riff, a fuzz pedal and a pitch shifter an octave down. He plays slide in open tunings and keeps the raw edges on purpose.',
    scales: ['Blues', 'Minor Pentatonic', 'Mixolydian'], techs: ['Slide', 'Open tunings', 'Octave-down riffs', 'Extreme dynamics'],
    tips: [
      'Write riffs on one string. Simple shapes, strong rhythm.',
      'Slide: rest the slide over the fret wire, not behind it, and mute behind it with a free finger.',
      'Open A tuning (E A E A C♯ E) puts a major chord under one barre.',
      'Whisper-quiet verses make the loud choruses huge.'
    ],
    listen: ['Seven Nation Army', 'Ball and Biscuit', 'Icky Thump', 'Blue Orchid'],
    licks: [
      { lbl: 'One-string garage riff', tabc: 'A7:2 A7 A10 A12 A10 A7 A5:2 A3:4', key: 4, scale: 'aeolian', bpm: 110, tone: 'crunch' },
      { lbl: 'Slide-style double-stops', tabc: '/G9+/B9:2 G9+B9 e0:2 \\G7+\\B8 G9+B9~:4', key: 4, scale: 'mixolydian', allow: [7], bpm: 84, tone: 'blues', cap: 'Use a slide or your finger and glide between the double-stops.' }
    ],
    jam: { prog: 'rock_I_IV_V', key: 4, style: 'hard_rock', scale: 'blues', bpm: 110 }
  },
  {
    n: 'Jerry Garcia', ico: 'JG', b: 'Grateful Dead', era: '1965–1995', st: 'Exploratory rock improvisation',
    tuning: 'Standard', gear: 'Custom Doug Irwin guitars, Fender Twin, Mu-Tron envelope filter.',
    sig: 'The father of exploratory rock improvisation. Garcia played every show as real-time composition, building long, conversational solos from major pentatonic, Mixolydian and Dorian lines. Pedal-steel-style bends and patient question-and-answer phrasing define him.',
    scales: ['Mixolydian', 'Major Pentatonic', 'Major', 'Dorian'], techs: ['Pedal-steel bends', 'Question-answer phrasing', 'Triplet runs', 'Modal improvisation'],
    tips: [
      'Mixolydian is the major scale with a ♭7. Over G, that’s F natural.',
      'Ask a question with a rising phrase, then answer it with a falling one.',
      'Hold one note while bending another for a pedal-steel effect.',
      'Leave space between phrases. Silence frames the next idea.'
    ],
    listen: ['Sugaree', 'Scarlet Begonias', 'Eyes of the World', 'Fire on the Mountain'],
    licks: [
      { lbl: 'Pedal-steel bend (G major pentatonic)', tabc: 'B15 e12 B15 B12 G14b16+B15:3 G12 D14 D12:4', key: 7, scale: 'pentatonic_major', bpm: 90, tone: 'clean' },
      { lbl: 'Question and answer (G Mixolydian)', tabc: 'D12 D14 G12 G14 B12 B13 e13:3 - e12 e10 B13 B12 G14 G12:4', key: 7, scale: 'mixolydian', bpm: 100, tone: 'clean', cap: 'The rising question ends on F, the ♭7. The answer falls home to G.' }
    ],
    jam: { prog: 'mixo_vamp', key: 7, style: 'rock', scale: 'mixolydian', bpm: 110 }
  },
  {
    n: 'Adam Jones', ico: 'AJ', b: 'Tool', era: '1990–', st: 'Progressive metal',
    tuning: 'Drop D', gear: 'Silverburst Les Paul Custom, Diezel and Marshall amps, delay and modulation.',
    sig: 'A composer first. Jones writes riffs in odd meters that still feel like they breathe, built on open-string drones and dark modal colors. Precision, repetition and huge dynamic swings turn simple ideas into hypnotic music.',
    scales: ['Phrygian', 'Aeolian', 'Chromatic', 'Lydian'], techs: ['Odd-meter riffing', 'Open-string drones', 'Down-picking', 'Dynamic contrast'],
    tips: [
      'Count odd meters in groups: 7/8 = 4+3 or 3+4. Say the numbers out loud.',
      'Pedal point: alternate an open string with notes on another string.',
      'Repeat a riff until the listener stops counting, then change one note.',
      'Near-silence before a full-band hit makes the hit enormous.'
    ],
    listen: ['Schism', 'Lateralus', 'Forty Six & 2', 'Sober'],
    licks: [
      { lbl: '7/8 riff grouped 4+3', tabc: 'E0 E0 E0 E0 E1 E0 E3 | E0 E0 E0 E0 E1 E3 E5 |', key: 4, scale: 'phrygian', bpm: 120, tone: 'metal' },
      { lbl: 'Open-string pedal point', tabc: 'E0 A7 E0 A8 E0 A10 E0 A8 | E0 A7 E0 A8 E0 A12 E0 A10', key: 4, scale: 'phrygian', bpm: 110, tone: 'metal', cap: 'The open E rings like a drone under a Phrygian melody on the A string.' }
    ],
    jam: { prog: 'phrygian_metal', key: 4, style: 'hard_rock', scale: 'phrygian', bpm: 120 }
  },
  {
    n: 'B.B. King', ico: 'BB', b: 'Solo', era: '1949–2015', st: 'Electric blues',
    tuning: 'Standard', gear: 'Gibson ES-355 “Lucille”, Lab Series L5 amp, no pedals.',
    sig: 'The King of the Blues. B.B. rarely played chords and never needed to: he made a single note speak with a fast, sweet “butterfly” vibrato and phrased like a singer answering himself. His favorite spot, the “B.B. box”, mixes major and minor pentatonic around the root on the B string.',
    scales: ['Major Pentatonic', 'Minor Pentatonic', 'Mixolydian', 'Major Blues'], techs: ['Butterfly vibrato', 'Call and response', 'Bends to the major 3rd', 'Dynamics'],
    tips: [
      'Butterfly vibrato: pivot from the wrist with the thumb off the neck.',
      'Play a phrase, then leave room as if a singer were answering it.',
      'Bend the 2nd up to the major 3rd for sweetness.',
      'One perfect note beats ten good ones.'
    ],
    listen: ['The Thrill Is Gone', 'Every Day I Have the Blues', 'Sweet Little Angel', 'Live at the Regal (album)'],
    licks: [
      { lbl: 'B.B. box phrase in A', tabc: 'e10 B12 B10~:2 e12 e10 B12b14 B10:2 G11 B10~:4', key: 9, scale: 'mixolydian', bpm: 70, tone: 'blues', cap: 'The bend from B to C♯ lands on the major 3rd of A. Sweet, not sour.' },
      { lbl: 'Butterfly vibrato on the root', tabc: 'B10~:4 - e10b12~:4 e10 B10~:4', key: 9, scale: 'pentatonic_minor', allow: [11], bpm: 66, tone: 'blues' }
    ],
    jam: { prog: 'slow_blues', key: 9, style: 'slow_blues', scale: 'blues_major', bpm: 62 }
  },
  {
    n: 'Stevie Ray Vaughan', ico: 'SR', b: 'Double Trouble', era: '1983–1990', st: 'Texas blues',
    tuning: 'E♭ standard, heavy strings', gear: 'Stratocaster “Number One”, Fender Vibroverb and Dumble amps, Ibanez Tube Screamer.',
    sig: 'Texas blues at full force. SRV combined Albert King’s bends, Hendrix’s fire and a punishing attack on heavy strings. His shuffles drive like a train, and his open-position licks, rakes and string-ripping vibrato remain the benchmark for blues-rock intensity.',
    scales: ['Minor Pentatonic', 'Blues', 'Major Pentatonic', 'Mixolydian'], techs: ['Rakes', 'Albert King bends', 'Open-position licks', 'Shuffle rhythm'],
    tips: [
      'Rake: drag the pick across muted strings into the target note.',
      'Use open strings in E. They ring and give the licks their Texas twang.',
      'Your shuffle rhythm is half the gig. Keep the muted strums swinging.',
      'Dig in. The pick attack is part of the tone.'
    ],
    listen: ['Pride and Joy', 'Texas Flood', 'Lenny', 'Scuttle Buttin’'],
    licks: [
      { lbl: 'Open-position Texas lick', tabc: 'e0 B3 B0 G2b3~:2 G0 D2 E3 pE0 E0~:4', key: 4, scale: 'blues', bpm: 110, tone: 'blues' },
      { lbl: 'Rake into a 12th-fret bend', tabc: 'Gx Bx e15b17~:4 e12 B15 B12:2 G14 G12:3', key: 4, scale: 'pentatonic_minor', bpm: 100, tone: 'blues', cap: 'The x notes are muted strings raked on the way to the bend.' }
    ],
    jam: { prog: 'blues12_quick', key: 4, style: 'blues_shuffle', scale: 'pentatonic_minor', bpm: 120 }
  },
  {
    n: 'Eric Clapton', ico: 'EC', b: 'Cream · Derek and the Dominos · Solo', era: '1963–', st: 'British blues rock',
    tuning: 'Standard', gear: 'Les Paul or SG into a Marshall for the “woman tone”; later a Strat called Blackie.',
    sig: 'The player who brought Chicago blues to rock arenas. Clapton’s phrasing comes from Freddie, B.B. and Albert King: clear minor pentatonic lines, perfectly pitched bends and a vocal tone. In Cream he rolled the tone knob down to get the smooth, horn-like “woman tone”.',
    scales: ['Minor Pentatonic', 'Blues', 'Major Pentatonic', 'Dorian'], techs: ['Pitch-perfect bends', 'Box 1 and box 2', 'Melodic phrasing', 'Woman tone'],
    tips: [
      'Woman tone: neck pickup, tone knob near zero, amp cranked.',
      'The “Albert King box” around the 8th to 10th frets (in A) holds the best bends.',
      'Phrase in sentences of 2 bars. Breathe between them.',
      'Repeat a strong lick with one small change. Repetition builds tension.'
    ],
    listen: ['Crossroads (Cream, live)', 'Layla', 'Sunshine of Your Love', 'Badge'],
    licks: [
      { lbl: 'Box 1 classic', tabc: 'e8b10~:3 e5 B8 B5 G7b9 G5 D7:2 D5~:4', key: 9, scale: 'pentatonic_minor', bpm: 80, tone: 'blues' },
      { lbl: 'Box 2 bends', tabc: 'e8b10~:3 B10 e8 B10b12r B8:2 G9 G7~:4', key: 9, scale: 'pentatonic_minor', allow: [11], bpm: 76, tone: 'blues', cap: 'Bending A up to B on the B string is the sweet spot of this box.' }
    ],
    jam: { prog: 'minor_blues', key: 9, style: 'slow_blues', scale: 'pentatonic_minor', bpm: 62 }
  },
  {
    n: 'Jimmy Page', ico: 'JP', b: 'Led Zeppelin', era: '1963–', st: 'Hard rock architect',
    tuning: 'Standard, DADGAD, open G', gear: 'Les Paul, Telecaster, Danelectro; Marshall and Supro amps; echoplex.',
    sig: 'Producer, arranger and riff architect. Page layered guitars like an orchestra, borrowed from blues, folk and Indian music, and wrote riffs that are songs in themselves. As a soloist he is loose and fiery, built on fast repeating pentatonic figures.',
    scales: ['Minor Pentatonic', 'Blues', 'Aeolian', 'Dorian'], techs: ['Repeating triplet licks', 'Riff writing', 'Alternate tunings', 'Layered arrangements'],
    tips: [
      'Repeat a three-note pull-off lick in triplets. It sounds faster than it is.',
      'Write riffs that a singer could hum.',
      'Try DADGAD: D A D G A D. Open strings drone under every shape.',
      'Layer: record a riff, then a second guitar playing it an octave higher.'
    ],
    listen: ['Whole Lotta Love', 'Black Dog', 'Since I’ve Been Loving You', 'Kashmir'],
    licks: [
      { lbl: 'Repeating pull-off triplets (A minor)', tabc: 'e8 pe5 B8 e8 pe5 B8 e8 pe5 B8 e8 pe5 B8 | B8 pB5 G7 B8 pB5 G7 B8 pB5 G7:3', key: 9, scale: 'pentatonic_minor', bpm: 100, tone: 'crunch' },
      { lbl: 'Low-string riff', tabc: 'E5:2 E8 A5 A7 E8 E5:2 | A7 A5 E8 E5:4', key: 9, scale: 'pentatonic_minor', bpm: 96, tone: 'crunch' }
    ],
    jam: { prog: 'aeolian_rock', key: 9, style: 'hard_rock', scale: 'pentatonic_minor', bpm: 100 }
  },
  {
    n: 'Tony Iommi', ico: 'TI', b: 'Black Sabbath', era: '1968–', st: 'Heavy metal origins',
    tuning: 'Detuned (often C♯ standard)', gear: 'Gibson SG, Laney amps, treble booster.',
    sig: 'The inventor of the heavy metal riff. After losing two fingertips in an industrial accident, Iommi detuned and used light strings to make bending easier, and the darker pitch became part of metal’s DNA. His riffs lean on the tritone and slow, crushing power chords.',
    scales: ['Minor Pentatonic', 'Blues', 'Aeolian', 'Phrygian'], techs: ['Power-chord riffs', 'The tritone', 'Detuning', 'Blues-scale leads'],
    tips: [
      'The tritone (♭5) between two power chords is the classic doom move.',
      'Slow down. Let each chord ring and decay.',
      'Detuning adds weight. Try E♭ or D standard.',
      'Solos use the blues scale: the ♭5 passing tone keeps it dark.'
    ],
    listen: ['Black Sabbath', 'Iron Man', 'Paranoid', 'Into the Void'],
    licks: [
      { lbl: 'Tritone doom riff', tabc: 'E0+A2:4 A1+D3:4 A0+D2:6', key: 4, scale: 'blues', allow: [10, 5], bpm: 70, tone: 'metal', cap: 'E5 to B♭5 is a tritone apart. That interval was once called the devil in music.' },
      { lbl: 'Blues-scale lead (E)', tabc: 'e15 e12 B15 B12 G15 G14 G12 D14~:4', key: 4, scale: 'blues', bpm: 88, tone: 'lead' }
    ],
    jam: { prog: 'power_two', key: 4, style: 'hard_rock', scale: 'blues', bpm: 80 }
  },
  {
    n: 'Mark Knopfler', ico: 'MK', b: 'Dire Straits', era: '1977–', st: 'Fingerstyle rock',
    tuning: 'Standard', gear: 'Stratocaster in the in-between pickup positions, Music Man and Fender amps, no pick.',
    sig: 'Clean, articulate and immediately recognizable. Knopfler plays rock guitar with his fingers, snapping strings for attack and rolling through triad shapes for a cascading sound. His solos are melodic, crisp and full of country and folk inflections.',
    scales: ['Minor Pentatonic', 'Major Pentatonic', 'Aeolian', 'Mixolydian'], techs: ['Fingerstyle', 'Triad rolls', 'String snapping', 'Hybrid lines'],
    tips: [
      'Use thumb, index and middle. Assign each to a string group.',
      'Snap the string slightly off the fretboard for a percussive pop.',
      'Roll through small triad shapes on the top three strings.',
      'The Strat’s in-between positions give the hollow, quacky tone.'
    ],
    listen: ['Sultans of Swing', 'Money for Nothing', 'Brothers in Arms', 'Romeo and Juliet'],
    licks: [
      { lbl: 'Triad rolls: D, C, G', tabc: 'G7 B7 e5 B7 G7 B7 e5 B7 | G5 B5 e3 B5 G5 B5 e3 B5 | G4 B3 e3 B3 G4 B3 e3 B3', key: 7, scale: 'ionian', bpm: 100, tone: 'clean', cap: 'D, C and G triads: the V, IV and I chords of G major.' },
      { lbl: 'Snapped pentatonic fill (D minor)', tabc: 'e13 e10 B13 B10 G12b14 G10 D12~:4', key: 2, scale: 'pentatonic_minor', bpm: 96, tone: 'clean' }
    ],
    jam: { prog: 'sensitive', key: 2, style: 'pop', scale: 'pentatonic_minor', bpm: 118 }
  },
  {
    n: 'Wes Montgomery', ico: 'WM', b: 'Solo', era: '1948–1968', st: 'Jazz',
    tuning: 'Standard', gear: 'Gibson L-5 archtop, Fender amps, played with the thumb.',
    sig: 'The most influential jazz guitarist after Charlie Christian. Wes picked with the fleshy side of his thumb for a warm, round tone and built solos in three stages: single-note lines, then octaves, then block chords. His octave melodies are among the most beautiful sounds in jazz guitar.',
    scales: ['Major', 'Dorian', 'Mixolydian', 'Bebop Dominant'], techs: ['Thumb picking', 'Octaves', 'Chord soloing', 'ii–V–I lines'],
    tips: [
      'Octaves: fret with fingers 1 and 4 (or 1 and 3), mute the string between with finger 1.',
      'Build a solo in stages: lines, then octaves, then chords.',
      'Target the 3rd of each chord on the downbeat.',
      'Swing your 8th notes: long-short, with accents on the offbeats.'
    ],
    listen: ['Four on Six', 'West Coast Blues', 'Bumpin’ on Sunset', 'The Incredible Jazz Guitar of Wes Montgomery (album)'],
    licks: [
      { lbl: 'Octave melody in G', tabc: 'D5+B8 D7+B10 D9+B12:2 D7+B10 D5+B8 D2+B5:4', key: 7, scale: 'ionian', bpm: 100, tone: 'jazz', cap: 'Mute the G string with the underside of your first finger.' },
      { lbl: 'ii–V–I line (Am7, D7, Gmaj7)', tabc: 'D7 G5 B5 B8 | B7 B5 G7 G5 | G4:4', key: 7, scale: 'ionian', bpm: 110, tone: 'jazz', cap: 'Arpeggiate Am7, walk down D Mixolydian, resolve to B: the 3rd of Gmaj7.' }
    ],
    jam: { prog: 'ii_V_I', key: 7, style: 'jazz_swing', scale: 'ionian', bpm: 120 }
  },
  {
    n: 'John Petrucci', ico: 'JP', b: 'Dream Theater', era: '1985–', st: 'Progressive metal virtuoso',
    tuning: 'Standard, 7-string B', gear: 'Ernie Ball Music Man signature guitars, Mesa/Boogie Mark series.',
    sig: 'The model of disciplined technique. Petrucci’s alternate picking is precise at any tempo, his sweep arpeggios are clean, and his compositions move between odd meters, neoclassical runs and lyrical melodies. His practice routines shaped a generation of players.',
    scales: ['Aeolian', 'Harmonic Minor', 'Phrygian Dominant', 'Lydian'], techs: ['Strict alternate picking', 'Sweep picking', '3-notes-per-string runs', 'Odd meters'],
    tips: [
      'Alternate pick everything at first. Economy comes later.',
      'Practice in short bursts at a tempo just above comfort, then rest.',
      'Sweeps: let the pick fall through the strings like one motion.',
      'Accent the first note of every group of 3 or 6 to stay in time.'
    ],
    listen: ['Glasgow Kiss', 'The Glass Prison', 'Under a Glass Moon', 'Erotomania'],
    licks: [
      { lbl: '3-notes-per-string descent (E minor)', tabc: 'e15 e14 e12 B15 B13 B12 G14 G12 G11 D14 D12 D10:3', key: 4, scale: 'aeolian', bpm: 100, tone: 'metal' },
      { lbl: 'Three-string A minor sweep', tabc: 'G14 B13 e12 he17 pe12 B13 G14:3', key: 9, scale: 'aeolian', bpm: 80, tone: 'metal', cap: 'One down-sweep, hammer to the top, pull off, one up-sweep.' }
    ],
    jam: { prog: 'metal_minor', key: 4, style: 'metal', scale: 'aeolian', bpm: 132 }
  }
];
if (typeof module !== 'undefined') module.exports = ARTISTS;
