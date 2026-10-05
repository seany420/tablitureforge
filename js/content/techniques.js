/* AXELAB · Technique library. Tabs use compact notation (Tab.fromCompact). */
const TECHNIQUES = [
  // ── Picking hand ───────────────────────────────────────────
  {
    n: 'Alternate Picking', d: 'int', cat: 'Picking hand',
    desc: 'A strict down-up-down-up motion, regardless of string changes. Every stroke should match the others in volume and timing.',
    why: 'It is the foundation of speed and precision. With a steady pendulum motion your timing locks in, because downstrokes fall on the beat and upstrokes fall between.',
    how: ['Hold the pick between the thumb and the side of the index finger, with a few millimeters showing.', 'Move from the wrist, not the elbow. The motion is small, like shaking water off your hand.', 'Rest the side of your palm lightly near the bridge for an anchor and to mute lower strings.', 'Start on a downstroke on every beat and keep the hand moving even through rests.'],
    mistakes: ['Big picking motions that waste time between strings.', 'Tension in the forearm and shoulder.', 'Upstrokes quieter than downstrokes.'],
    drills: ['Chromatic 1-2-3-4 on one string, 60 bpm, 16th notes, two minutes.', 'Same exercise across all six strings, then descending.', 'Minor pentatonic box 1 in groups of three, strict alternate picking.', 'Record yourself and listen for uneven notes. Fix the slowest one first.'],
    tabs: [
      { lbl: 'Chromatic 1-2-3-4 across the strings', tabc: 'E1 E2 E3 E4 A1 A2 A3 A4 D1 D2 D3 D4 G1 G2 G3 G4 B1 B2 B3 B4 e1 e2 e3 e4:3', key: 0, scale: 'chromatic', bpm: 80, tone: 'crunch' },
      { lbl: 'Pentatonic in groups of 3 (A minor, box 1)', tabc: 'E5 E8 A5 E8 A5 A7 A5 A7 D5 A7 D5 D7 D5 D7 G5 D7 G5 G7 G5 G7 B5 G7 B5 B8 B5 B8 e5 B8 e5 e8:3', key: 9, scale: 'pentatonic_minor', bpm: 80, tone: 'crunch' }
    ]
  },
  {
    n: 'Down Picking', d: 'int', cat: 'Picking hand',
    desc: 'Every note played with a downstroke. The hand resets in the air between notes.',
    why: 'Downstrokes are heavier and more uniform. Fast down-picked 8th notes give thrash and punk their relentless churn.',
    how: ['Use a small wrist rotation, as if turning a doorknob.', 'Lift the pick just over the string on the return so it does not catch.', 'Keep the palm muting consistent so every chug has the same tone.', 'Build endurance in short sets. Stop the moment your forearm burns.'],
    mistakes: ['Tensing the whole arm to go faster.', 'Hitting more strings than intended.', 'Letting the palm mute drift away from the bridge.'],
    drills: ['Open low E, palm-muted 8ths at 100 bpm for one minute.', 'Raise 5 bpm per week, not per day.', 'Alternate 4 bars of muted chugs with 4 bars of open power chords.'],
    tabs: [
      { lbl: 'Muted 8ths with power-chord accents (E minor)', tabc: 'E0 E0 E0 E0 E3+A5:2 E0 E0 E5+A7:2 E0 E0 E0 E0 E7+A9:2 E5+A7:2', key: 4, scale: 'aeolian', bpm: 140, tone: 'metal', cap: 'Palm-mute the single notes. Let the power chords ring.' }
    ]
  },
  {
    n: 'Economy Picking', d: 'adv', cat: 'Picking hand',
    desc: 'Alternate picking on one string, but when you cross to the next string in the same direction, the pick continues through in one motion.',
    why: 'Fewer motions at string changes means smoother, faster 3-notes-per-string runs. Frank Gambale and Yngwie Malmsteen use variants of it.',
    how: ['Play three notes per string: down-up-down.', 'Crossing to a higher string, the next note is also a down: let the pick fall through.', 'Descending, reverse it: up-down-up, then another upstroke to the next lower string.', 'Keep the rhythm even. The sweep must not rush.'],
    mistakes: ['Rushing the swept notes.', 'Notes bleeding together because the fretting hand does not lift.'],
    drills: ['3nps A minor ascending, economy picked, 60 bpm triplets.', 'Compare it with alternate picking. Both should sound identical.'],
    tabs: [
      { lbl: 'A Aeolian 3-notes-per-string ascent', tabc: 'E5 E7 E8 A5 A7 A8 D5 D7 D9 G5 G7 G9 B6 B8 B10 e7 e8 e10:3', key: 9, scale: 'aeolian', bpm: 90, tone: 'lead', cap: 'Picking: D U D · D U D … on every string going up.' }
    ]
  },
  {
    n: 'Sweep Picking', d: 'adv', cat: 'Picking hand',
    desc: 'One continuous pick stroke across several strings, playing one note per string, usually through an arpeggio shape.',
    why: 'It makes fast arpeggios possible. Each finger frets a note only for the instant its string is struck, then lifts to mute.',
    how: ['Let the pick fall from string to string in a single motion.', 'Fret one note at a time. Roll your finger when two notes share a fret on adjacent strings.', 'Mute with the picking palm and by lifting each fretting finger after its note.', 'Practice painfully slow. Clean beats fast.'],
    mistakes: ['Notes ringing together like a strummed chord.', 'Picking each string separately instead of one stroke.', 'Uneven rhythm: the sweep must still be in time.'],
    drills: ['Three-string minor shape at 50 bpm triplets.', 'Add the fifth string, then the root on the A string.', 'Practice major, minor and diminished shapes back to back.'],
    tabs: [
      { lbl: 'Three-string A minor shape', tabc: 'G14 B13 e12 B13 G14 B13 e12 B13 G14:3', key: 9, scale: 'aeolian', bpm: 70, tone: 'lead' },
      { lbl: 'Five-string A minor arpeggio', tabc: 'A12 D14 G14 B13 e12 he17 pe12 B13 G14 D14 A12:3', key: 9, scale: 'aeolian', bpm: 66, tone: 'lead' }
    ]
  },
  {
    n: 'Hybrid Picking', d: 'adv', cat: 'Picking hand',
    desc: 'Using the pick and the free fingers (middle and ring) together, so you can pluck several strings at once or skip strings instantly.',
    why: 'It unlocks country “chicken pickin’”, wide intervals and piano-like chord plucks without dropping the pick.',
    how: ['Pick the lower note with the pick and pluck higher strings with the middle and ring fingers.', 'Snap the fingers slightly away from the fretboard for a percussive pop.', 'Keep the pick hand relaxed; the fingers move from the knuckle.'],
    mistakes: ['Fingers too weak compared to the pick.', 'Anchoring the pinky so hard that the fingers lock.'],
    drills: ['Pick the D string, pluck G and B together. Repeat on every chord shape.', 'Bass note with pick, pinch two upper strings on the offbeat.'],
    tabs: [
      { lbl: 'Chicken pickin’ double-stops (A)', tabc: 'D7 G6+B5:2 D7 G6+B5:2 D5 G4+B5:2 D7 G6+B5:4', key: 9, scale: 'mixolydian', bpm: 110, tone: 'clean', cap: 'Pick the D string, pluck G and B with the middle and ring fingers.' }
    ]
  },
  {
    n: 'String Skipping', d: 'int', cat: 'Picking hand',
    desc: 'Jumping over one or more strings between notes. It creates wide intervals, like octaves and arpeggios, that sound less scale-like.',
    why: 'Wide intervals sound modern and vocal. Paul Gilbert and Eric Johnson use them to break out of box patterns.',
    how: ['Move the pick in a small arc over the skipped string.', 'Mute the skipped string with the fretting hand’s underside.', 'Practice the jump slowly and look at the target string the first few times.'],
    mistakes: ['Hitting the skipped string.', 'Losing time during the jump.'],
    drills: ['Octaves: low E and D strings, ascend through A minor.', 'Pentatonic box 1 played on strings 6, 4, 5, 3, 4, 2, 3, 1.'],
    tabs: [
      { lbl: 'Octaves through A minor', tabc: 'E5 D7 E7 D9 E8 D10 A5 G7 A7 G9 A8 G10:3', key: 9, scale: 'aeolian', bpm: 80, tone: 'crunch' },
      { lbl: 'Skipping pentatonic', tabc: 'E5 D5 A5 G5 D5 B5 G5 e5 G7 e8 B8:3', key: 9, scale: 'pentatonic_minor', bpm: 80, tone: 'crunch' }
    ]
  },
  {
    n: 'Tremolo Picking', d: 'int', cat: 'Picking hand',
    desc: 'Very fast, continuous alternate picking on a single note, so a melody sounds sustained like a mandolin or a surf lead.',
    why: 'It turns melodies into walls of sound. Surf rock, black metal and film scores all use it.',
    how: ['Hold the pick a little tighter and use a tiny wrist motion.', 'Keep the motion constant while the fretting hand changes notes.', 'Lock the picking speed to 16ths or 32nds of the tempo for a tight sound.'],
    mistakes: ['Speed bursts that are not tied to the beat.', 'Tension creeping up the arm.'],
    drills: ['Four 16ths per note, then eight 32nds per note, at 80 bpm.', 'Tremolo-pick a melody you already know.'],
    tabs: [
      { lbl: 'Tremolo melody on one string', tabc: 'e12 e12 e12 e12 e10 e10 e10 e10 e8 e8 e8 e8 e7 e7 e7 e7 e8 e8 e8 e8 e5:4', key: 9, scale: 'aeolian', bpm: 90, tone: 'lead' }
    ]
  },
  {
    n: 'Fingerstyle & Travis Picking', d: 'int', cat: 'Picking hand',
    desc: 'Playing with the thumb and fingers. In Travis picking, the thumb alternates bass notes on the beat while the fingers play melody on top.',
    why: 'One guitar becomes a full band: bass, rhythm and melody. Chet Atkins, Merle Travis, Mark Knopfler and countless folk players rely on it.',
    how: ['Assign the thumb to the 3 lowest strings and the index, middle and ring to G, B and e.', 'Make the thumb automatic first: alternate between two bass strings for minutes at a time.', 'Add a single finger note on the offbeat, then on the beat (a “pinch”).', 'Palm-mute the bass lightly for the classic thump.'],
    mistakes: ['The thumb stops when the fingers play.', 'Fingers pulling the string up instead of across.'],
    drills: ['Thumb only on C: A string 3rd fret, then D string 2nd fret, repeat.', 'Add the B string on every offbeat.', 'Move the pattern through C, Am, F and G.'],
    tabs: [
      { lbl: 'Travis pattern on C', tabc: 'A3 G0 D2 B1 A3 G0 D2 B1 | E3 G0 D2 B1 E3 G0 D2 B1:2', key: 0, scale: 'ionian', bpm: 90, tone: 'acoustic', cap: 'Thumb on the A, D and low E strings, fingers on G and B.' }
    ]
  },

  // ── Fretting hand ──────────────────────────────────────────
  {
    n: 'Hammer-ons & Pull-offs', d: 'beg', cat: 'Fretting hand',
    desc: 'A hammer-on sounds a higher note by driving a finger onto the fret without picking. A pull-off sounds a lower note by flicking the finger off the string.',
    why: 'They are the building blocks of legato. Smooth phrasing, trills and fast licks all depend on them.',
    how: ['Hammer with the fingertip, close to the fret wire, with a quick, firm motion.', 'For a pull-off, have the lower note already fretted, then pull the upper finger slightly down (toward the floor) as it leaves.', 'Match the volume of the picked note.'],
    mistakes: ['Lifting straight off, which makes the pull-off silent.', 'Hammering too slowly, so the note fades in.'],
    drills: ['Trill between two frets for 30 seconds on each string.', 'Fingers 1-2, 1-3, 1-4 on every string.', 'Descending pentatonic with only pull-offs.'],
    tabs: [
      { lbl: 'Trill', tabc: 'G5 hG7 pG5 hG7 pG5 hG7 pG5 hG7 pG5:3', key: 9, scale: 'aeolian', bpm: 90, tone: 'crunch' },
      { lbl: 'Pull-off pentatonic descent', tabc: 'e8 pe5 B8 pB5 G7 pG5 D7 pD5 A7 pA5 E8 pE5:3', key: 9, scale: 'pentatonic_minor', bpm: 90, tone: 'crunch' }
    ]
  },
  {
    n: 'Legato', d: 'int', cat: 'Fretting hand',
    desc: 'Smooth, connected playing where most notes come from the fretting hand. You pick only the first note on each string, or none at all.',
    why: 'Legato frees the picking hand and produces a singing, horn-like tone. Joe Satriani and Allan Holdsworth built styles around it.',
    how: ['Pick the first note of each string; hammer the rest.', 'Use a compressor or a bit of gain to even out volume at first.', 'Mute strings you are not playing with both hands.', 'Keep fingers hovering close to the frets.'],
    mistakes: ['Volume drops on the hammered notes.', 'Open strings ringing when you pull off.'],
    drills: ['3nps A Aeolian, picking only the first note per string.', 'Hammer-on from nowhere: start each string with a hammer, no pick.'],
    tabs: [
      { lbl: '3nps legato (A Aeolian)', tabc: 'E5 hE7 hE8 A5 hA7 hA8 D5 hD7 hD9 G5 hG7 hG9 B6 hB8 hB10 e7 he8 he10:3', key: 9, scale: 'aeolian', bpm: 90, tone: 'lead' },
      { lbl: 'Legato pentatonic rolls', tabc: 'G7 hG9 B8 hB10 e8 he10 B10 pB8 G9 pG7 D7:3', key: 9, scale: 'pentatonic_minor', bpm: 90, tone: 'lead' }
    ]
  },
  {
    n: 'Slides', d: 'beg', cat: 'Fretting hand',
    desc: 'Moving a fretted note along the string to another fret while keeping pressure, so the pitch glides.',
    why: 'Slides change position smoothly and add a vocal, connected quality. They are also how you move between pentatonic boxes.',
    how: ['Keep enough pressure to sustain the note but not so much that you stop moving.', 'Pick the first note only; the target note sounds from the slide.', 'Land exactly on the target fret: aim with your eyes at first.'],
    mistakes: ['Releasing pressure mid-slide so the note dies.', 'Overshooting the target fret.'],
    drills: ['Slide between box 1 and box 2 of minor pentatonic on each string.', 'Slide into notes from two frets below.'],
    tabs: [
      { lbl: 'Position-shifting slides', tabc: 'G7 /G9 B8 /B10 e8 /e10 e12~:4', key: 9, scale: 'pentatonic_minor', bpm: 80, tone: 'blues' },
      { lbl: 'Slide in from below', tabc: '/G9:2 B8 B10:2 /e10 e8 B10~:4', key: 9, scale: 'pentatonic_minor', bpm: 80, tone: 'blues' }
    ]
  },
  {
    n: 'Two-Hand Tapping', d: 'adv', cat: 'Fretting hand',
    desc: 'The picking hand frets a note by tapping it, then pulls off to notes held by the fretting hand.',
    why: 'Tapping covers huge intervals at high speed with legato smoothness. Eddie Van Halen made it famous.',
    how: ['Tap with the middle finger so you can keep holding the pick.', 'Pull off from the tap toward the floor so the next note rings.', 'Mute unused strings with the picking hand’s palm and the fretting hand’s first finger.', 'Practice to a metronome in triplets or sextuplets.'],
    mistakes: ['Weak pull-off from the tapped note.', 'Open strings ringing loudly.'],
    drills: ['Tap 12, pull to 5, hammer 8 on the B string in triplets.', 'Move the tap note to outline different chords.'],
    tabs: [
      { lbl: 'Tap, pull, hammer (E minor)', tabc: 'tB12 pB5 hB8 tB12 pB5 hB8 tB12 pB5 hB8 tB12 pB5 hB8:3', key: 4, scale: 'aeolian', bpm: 70, tone: 'lead' },
      { lbl: 'Moving tap: Am to C', tabc: 'te12 pe5 he8 te12 pe5 he8 tB13 pB5 hB8 tB13 pB5 hB8:3', key: 9, scale: 'aeolian', bpm: 70, tone: 'lead' }
    ]
  },
  {
    n: 'Fret-Hand Muting', d: 'int', cat: 'Fretting hand',
    desc: 'Lightly touching strings with the fretting hand so they make a percussive “chk” instead of a pitch, and keeping unused strings silent.',
    why: 'Clean playing is mostly about the notes you do not hear. Muting also creates the percussive scratches of funk and rhythm guitar.',
    how: ['Relax the fretting fingers until the strings touch the frets but do not press down.', 'Use the underside of the first finger to mute strings below the one you play.', 'Use fingertips leaning over to mute strings above.'],
    mistakes: ['Pressing so lightly that harmonics ring.', 'Forgetting to mute the open low strings when playing high leads.'],
    drills: ['Power chord, then release pressure for two muted strums, repeat.', 'Play a solo with heavy gain; every unwanted string noise is a muting problem to solve.'],
    tabs: [
      { lbl: 'Chord, mute, mute', tabc: 'A5+D7+G7:2 Ax+Dx+Gx Ax+Dx+Gx A5+D7+G7:2 Ax+Dx+Gx Ax+Dx+Gx A5+D7+G7:4', key: 2, scale: 'pentatonic_minor', bpm: 100, tone: 'crunch' }
    ]
  },

  // ── Expression ─────────────────────────────────────────────
  {
    n: 'String Bends', d: 'beg', cat: 'Expression',
    desc: 'Pushing or pulling the string across the fret to raise its pitch. A half step equals one fret higher; a whole step equals two.',
    why: 'Bends are the main expressive tool of blues and rock. In tune, they cry and sing. Out of tune, nothing else in the solo matters.',
    how: ['Support the bending finger with the fingers behind it on the same string.', 'Turn the wrist like a key in a lock; do not just push with the finger.', 'Hook the thumb over the neck for leverage.', 'Play the target note first so your ear knows where to go.'],
    mistakes: ['Under-bending (sounds flat).', 'Bending with one finger alone.', 'Letting other strings ring as you push them.'],
    drills: ['Play fret 9 on the G string, then bend fret 7 until it matches.', 'Pre-bend: bend silently, pick, then release slowly.', 'Unison bend: fret 5 on B, bend fret 7 on G up to match it.'],
    tabs: [
      { lbl: 'Check the target first', tabc: 'G9:2 G7b9~:3 G7b9r G5:4', key: 9, scale: 'pentatonic_minor', bpm: 70, tone: 'blues' },
      { lbl: 'Unison bend', tabc: 'G7b9+B5:4 G7b9+B5:4', key: 9, scale: 'pentatonic_minor', bpm: 70, tone: 'lead' }
    ]
  },
  {
    n: 'Vibrato', d: 'beg', cat: 'Expression',
    desc: 'A rhythmic wobble in pitch made by repeatedly bending and releasing a note. Width (how far) and speed (how fast) are your style.',
    why: 'Vibrato is your voice. Two players can play the same note and only vibrato tells them apart. B.B. King is fast and sweet; David Gilmour is wide and slow.',
    how: ['Rotate the wrist from a pivot point where the base of the index finger touches the neck.', 'Bend up and come back to the original pitch; don’t go below it.', 'Practice in time: two pulses per beat, then three, then four.'],
    mistakes: ['Random, uneven speed.', 'Vibrato that drifts flat.', 'Only moving the fingertip.'],
    drills: ['Vibrato with each finger on the B string, 60 bpm, two pulses per beat.', 'Control width: narrow for 4 beats, wide for 4.', 'Bend a whole step, hold, then add vibrato from the top.'],
    tabs: [
      { lbl: 'Vibrato with each finger', tabc: 'B5~:4 B8~:4 G7~:4 G5~:4', key: 9, scale: 'pentatonic_minor', bpm: 70, tone: 'blues' },
      { lbl: 'Bend, then vibrato', tabc: 'G7b9~:6 B8b10~:6', key: 9, scale: 'pentatonic_minor', bpm: 70, tone: 'lead' }
    ]
  },
  {
    n: 'Double-Stops', d: 'int', cat: 'Expression',
    desc: 'Two notes played at the same time, usually on adjacent strings or with one skipped string.',
    why: 'They thicken a solo and blur the line between rhythm and lead. Chuck Berry, Hendrix and Frusciante live here.',
    how: ['Barre two strings with one finger or use two fingers.', 'Pick both notes together, or roll through them quickly.', 'Mute the strings around them.'],
    mistakes: ['One note louder than the other.', 'Extra strings ringing.'],
    drills: ['Diatonic 3rds on G and B strings up the major scale.', '6ths on G and high e strings, skipping the B string.'],
    tabs: [
      { lbl: 'Rock ’n’ roll double-stops (A)', tabc: 'B8+e8 B8+e8 B8+e8 B8+e8 G7b9+B8:3 B5+e5:4', key: 9, scale: 'pentatonic_minor', bpm: 110, tone: 'crunch' },
      { lbl: '6ths in A Mixolydian', tabc: 'G9+e9:2 G7+e7 G6+e5:4', key: 9, scale: 'mixolydian', bpm: 80, tone: 'clean' }
    ]
  },
  {
    n: 'Natural & Artificial Harmonics', d: 'int', cat: 'Expression',
    desc: 'Bell-like tones made by touching the string lightly at a node, without pressing it down. The 12th, 7th and 5th frets give the strongest harmonics.',
    why: 'Harmonics add sparkle to clean parts and are a precise way to tune.',
    how: ['Touch the string directly over the fret wire, not between frets.', 'Pick firmly, then lift the touching finger right away.', 'Artificial harmonics: fret a note, then touch the string 12 frets higher with the picking hand’s index finger while plucking with the thumb or ring finger.'],
    mistakes: ['Touching between frets.', 'Pressing too hard.'],
    drills: ['Harmonics across all strings at frets 12, 7 and 5.', 'Tune: the 5th-fret harmonic on one string should match the 7th-fret harmonic on the next (except G to B).'],
    tabs: [
      { lbl: 'Natural harmonic chords', tabc: 'G12*+B12*+e12*:3 G7*+B7*+e7*:3 G5*+B5*+e5*:4', key: 7, scale: 'ionian', bpm: 70, tone: 'clean' }
    ]
  },
  {
    n: 'Pinch Harmonics', d: 'adv', cat: 'Expression',
    desc: 'The squeal of metal guitar: the edge of the picking thumb touches the string an instant after the pick, leaving only a high harmonic.',
    why: 'Over high gain, a pinch harmonic screams. Zakk Wylde, Dimebag Darrell and Billy Gibbons made it a signature.',
    how: ['Choke up so very little pick shows past the thumb.', 'Pick downward and let the thumb’s edge graze the string immediately.', 'Move the picking point toward the neck pickup to find different harmonics.', 'Add vibrato right away so the squeal sings.'],
    mistakes: ['Too much pick showing.', 'Too little gain at first; use plenty while learning.'],
    drills: ['G string, 9th fret, search for harmonic sweet spots over the pickups.', 'Pinch on the first note of every bar of a riff.'],
    tabs: [
      { lbl: 'Pinch harmonics in a riff', tabc: 'E0+A2:2 G9~:6 E3+A5:2 G7~:6', key: 4, scale: 'pentatonic_minor', bpm: 90, tone: 'metal', cap: 'Pinch the G-string notes, then shake them with wide vibrato.' }
    ]
  },
  {
    n: 'Rakes', d: 'int', cat: 'Expression',
    desc: 'Dragging the pick across muted strings on the way to a target note, creating a percussive “chk-chk” lead-in.',
    why: 'Rakes add attack and urgency. Stevie Ray Vaughan and Albert King use them on almost every big note.',
    how: ['Mute the strings below the target with the fretting hand.', 'Drag one downstroke across them into the target note.', 'Keep the rake fast so it sounds like a grace note.'],
    mistakes: ['The muted strings ring with pitch.', 'The rake takes too long and drags the timing.'],
    drills: ['Rake into each note of a descending pentatonic.', 'Rake into a bend and hold.'],
    tabs: [
      { lbl: 'Rake into a bend', tabc: 'Dx Gx Bx e8b10~:4 e5 B8:4', key: 9, scale: 'pentatonic_minor', bpm: 80, tone: 'blues' }
    ]
  },

  // ── Rhythm ─────────────────────────────────────────────────
  {
    n: 'Strumming & the 16th-Note Engine', d: 'beg', cat: 'Rhythm',
    desc: 'Keeping the strumming hand moving down and up in constant 16ths (or 8ths), and choosing when to hit the strings.',
    why: 'If the hand never stops, your rhythm cannot drift. Every strumming pattern is just “hit” or “miss” on a steady motion.',
    how: ['Down on the beat, up between beats, always.', 'For patterns, miss the strings on purpose instead of stopping.', 'Accent beats 2 and 4 slightly in rock and pop.', 'Strum from the wrist with a loose grip.'],
    mistakes: ['Stopping the hand on rests, which pushes the next strum early.', 'Strumming all six strings every time; vary low and high.'],
    drills: ['D D-U U-D-U pattern on G, C and D at 80 bpm.', 'Count out loud: 1 & 2 & 3 & 4 &.'],
    tabs: [
      { lbl: 'D, D-U, U-D-U on G major', tabc: 'E3+A2+D0+G0+B0+e3:2 E3+A2+D0+G0+B0+e3 E3+A2+D0+G0+B0+e3:2 E3+A2+D0+G0+B0+e3 E3+A2+D0+G0+B0+e3 E3+A2+D0+G0+B0+e3', key: 7, scale: 'ionian', bpm: 80, tone: 'acoustic', cap: 'Down, down-up, (miss) up-down-up.' }
    ]
  },
  {
    n: 'Palm Muting', d: 'beg', cat: 'Rhythm',
    desc: 'Resting the edge of the picking palm on the strings right at the bridge saddles to shorten the sustain into a tight “chug”.',
    why: 'It is the percussive heart of rock and metal rhythm guitar, and it creates contrast with open, ringing chords.',
    how: ['Place the fleshy edge of the palm on the strings where they meet the saddles.', 'Move toward the neck for a heavier mute, toward the bridge for a lighter one.', 'Keep the pressure constant while picking.'],
    mistakes: ['Too far forward, which kills pitch.', 'Palm drifting off the bass strings during fast parts.'],
    drills: ['Alternate 4 muted notes and 4 open notes on the low E.', 'Gallop rhythm: 8th and two 16ths, palm-muted.'],
    tabs: [
      { lbl: 'Muted vs open', tabc: 'E0 E0 E0 E0 E0 E0 E0 E0 E0+A2:4 E0 E0 E0 E0 E3+A5:2 E5+A7:2', key: 4, scale: 'aeolian', bpm: 120, tone: 'metal', cap: 'Palm-mute the single notes; release for the power chords.' },
      { lbl: 'Gallop', tabc: 'E0:2 E0 E0 E0:2 E0 E0 E3+A5:2 E3+A5 E3+A5 E5+A7:4', key: 4, scale: 'aeolian', bpm: 140, tone: 'metal' }
    ]
  },
  {
    n: 'Funk Scratch (Chicken Scratch)', d: 'int', cat: 'Rhythm',
    desc: 'Fast 16th-note strumming where most strokes are fully muted scratches and only a few let a small chord ring.',
    why: 'This is the sound of Nile Rodgers, Jimmy Nolen and Prince. The guitar becomes a percussion instrument.',
    how: ['Use small 3-note voicings on the D, G and B strings.', 'Keep the 16th-note engine running.', 'Squeeze the chord for the accents, relax for the scratches.', 'Use the neck or middle pickup and a bright, clean amp.'],
    mistakes: ['Big strums hitting all six strings.', 'Chord accents not tied to the groove.'],
    drills: ['E9 voicing: all scratches, then add accents on the “a” of beat 1 and on beat 2.', 'Play along with the Funk style in the Jam tab.'],
    tabs: [
      { lbl: 'E9 scratch groove', tabc: 'D6+G7+B7 Dx+Gx+Bx Dx+Gx+Bx D6+G7+B7 Dx+Gx+Bx D6+G7+B7 Dx+Gx+Bx Dx+Gx+Bx | D6+G7+B7 Dx+Gx+Bx D6+G7+B7 Dx+Gx+Bx Dx+Gx+Bx Dx+Gx+Bx D6+G7+B7:2', key: 4, scale: 'mixolydian', bpm: 100, tone: 'funk' }
    ]
  },
  {
    n: 'Speed Building', d: 'adv', cat: 'Practice method',
    desc: 'A systematic method for raising your top tempo without building tension or mistakes into your playing.',
    why: 'Most players plateau because they practice too fast and too tense. Speed comes from accuracy, relaxation and efficient motion.',
    how: ['Find your clean tempo: three perfect repetitions in a row.', 'Practice there for a few minutes, then raise 4 to 8 bpm.', 'Use bursts: play a short pattern above your top speed, then stop and relax.', 'Check for tension every few minutes: shoulders, forearm, thumb.', 'Stop when quality drops. Sleep is where motor learning settles.'],
    mistakes: ['Practicing mistakes at speed.', 'Ignoring tension.', 'Always playing whole passages instead of fixing the hard spot.'],
    drills: ['Burst drill: 6 notes as fast as possible, land on beat 1, rest one beat.', 'Ladder: 10 bpm above, 5 below, 10 above, 5 below.', 'Practice the hardest two notes of a lick slowly and in isolation.'],
    tabs: [
      { lbl: 'Six-note burst (A minor)', tabc: 'e8 e7 e5 B8 B6 B5 e8 e7 e5 B8 B6 B5:4', key: 9, scale: 'aeolian', bpm: 90, tone: 'lead' },
      { lbl: 'Chromatic spider', tabc: 'E5 E6 E7 E8 A5 A6 A7 A8 D5 D6 D7 D8 G5 G6 G7 G8 B5 B6 B7 B8 e5 e6 e7 e8:3', key: 0, scale: 'chromatic', bpm: 80, tone: 'crunch' }
    ]
  }
];
if (typeof module !== 'undefined') module.exports = TECHNIQUES;
