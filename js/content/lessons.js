/* AXELAB · Lesson curriculum.
   Widgets inside lesson HTML:
     <div data-tabc="…" data-key="9" data-scale="…" data-title="…" data-bpm="80" data-tone="clean"></div>  playable tab
     <div data-neck='{"key":9,"scale":"pentatonic_minor","pos":0}'></div>                                  fretboard
     <div data-chords="C Am F G7"></div>   chord diagrams (append @E/@A/@C/@G/@D to force a CAGED shape)
     <button data-jam='{"prog":"blues12","key":9,"style":"blues_shuffle","scale":"blues"}'>…</button>   load a backing track
     <div data-quiz='[{"q":"…","a":["right","wrong"],"c":0}]'></div>                                       knowledge check */
const LESSONS = [];
function L(level, id, title, mins, summary, html) { LESSONS.push({ level: level, id: id, title: title, mins: mins, summary: summary, html: html }); }

/* ═══════════════════════ FOUNDATIONS ═══════════════════════ */

L('Foundations', 'neck', 'The Neck: Strings, Frets & Notes', 12,
  'Name every string, understand frets as half steps, and find any note.',
`<h2>The Neck: Strings, Frets & Notes</h2>
<p>Everything on the guitar comes back to one map: six strings, each divided into frets. Learn the map and theory stops being abstract.</p>
<h3>The six strings</h3>
<p>From the thickest (lowest) to the thinnest (highest): <b>E A D G B E</b>. A classic way to remember it: <i>Eddie Ate Dynamite, Good Bye Eddie</i>. The thickest is “low E” or the 6th string; the thinnest is “high e” or the 1st string.</p>
<h3>Frets are half steps</h3>
<p>Each fret raises the pitch by one <b>half step</b> (a semitone), the smallest distance in Western music. Two frets make a <b>whole step</b>. There are 12 different notes before the pattern repeats:</p>
<pre>A  A♯/B♭  B  C  C♯/D♭  D  D♯/E♭  E  F  F♯/G♭  G  G♯/A♭  (A)</pre>
<div class="ptip"><b>Rule to memorize:</b> there is no sharp or flat between <b>B and C</b>, or between <b>E and F</b>. Every other pair of letters has one note between them.</div>
<p>A sharp (♯) raises a note by a half step; a flat (♭) lowers it. C♯ and D♭ are the same pitch with two names; the name depends on the key.</p>
<h3>The 12th fret is the octave</h3>
<p>At fret 12 each string plays the same note as the open string, one octave higher. Everything from fret 12 up repeats frets 0 to 11. That is why most fretboards mark the 12th fret with a double dot.</p>
<div data-neck='{"key":0,"scale":"ionian","mode":"all","frets":12}'></div>
<p class="cap">The natural notes (no sharps or flats) are the large dots. The small dots are sharps and flats.</p>
<h3>Learn the low E and A strings first</h3>
<p>Barre chords and scale patterns take their root from these two strings, so they pay off immediately.</p>
<table class="ltable"><tr><th>Fret</th><th>0</th><th>1</th><th>3</th><th>5</th><th>7</th><th>8</th><th>10</th><th>12</th></tr>
<tr><td>Low E</td><td>E</td><td>F</td><td>G</td><td>A</td><td>B</td><td>C</td><td>D</td><td>E</td></tr>
<tr><td>A</td><td>A</td><td>B♭</td><td>C</td><td>D</td><td>E</td><td>F</td><td>G</td><td>A</td></tr></table>
<h3>Octave shapes</h3>
<p>To find the same note higher up: from the E or A string, go <b>two strings up and two frets up</b>. From the D or G string, go <b>two strings up and three frets up</b> (the B string is tuned one fret lower than the pattern, so shapes that cross it shift by one fret).</p>
<div data-tabc="E5:2 D7:2 G2:2 B10:2 e17:4" data-key="9" data-scale="pentatonic_minor" data-title="Every A from low to high" data-bpm="70"></div>
<div class="ptip"><b>Daily drill:</b> pick a note, then find it on every string while saying its name out loud. One note per day for 12 days covers the whole neck. The Ear tab has a fretboard note trainer for this.</div>
<div data-quiz='[{"q":"Which pairs of notes have no sharp or flat between them?","a":["B–C and E–F","A–B and D–E","C–D and F–G"],"c":0},{"q":"What note is at the 5th fret of the low E string?","a":["A","G","B"],"c":0},{"q":"What happens at the 12th fret?","a":["The open-string note repeats an octave higher","The tuning changes","Notes become sharps"],"c":0}]'></div>`);

L('Foundations', 'tab', 'Reading Tab & Rhythm', 12,
  'Read tablature, every technique symbol, and the rhythm values tab leaves out.',
`<h2>Reading Tab & Rhythm</h2>
<p>Tablature is a picture of the fretboard. It tells you <i>where</i> to put your fingers; rhythm tells you <i>when</i>.</p>
<h3>The six lines</h3>
<p>Each line is a string. The <b>top line is the high e string</b> (thinnest), the bottom line is the low E. Numbers are frets; 0 means open. Numbers stacked vertically are played together.</p>
<div data-tabc="E3+A2+D0+G0+B0+e3:4 - A3+D2+G0+B1+e0:4" data-key="7" data-scale="ionian" data-title="A G chord, then a C chord" data-bpm="60" data-tone="acoustic"></div>
<h3>Technique symbols</h3>
<table class="ltable">
<tr><th>Symbol</th><th>Meaning</th><th>Example</th></tr>
<tr><td>h</td><td>Hammer-on: sound the higher note without picking</td><td>5h7</td></tr>
<tr><td>p</td><td>Pull-off: sound the lower note without picking</td><td>7p5</td></tr>
<tr><td>b</td><td>Bend up to the pitch of the second fret number</td><td>7b9</td></tr>
<tr><td>r</td><td>Release the bend back down</td><td>7b9r7</td></tr>
<tr><td>/ \\</td><td>Slide up / slide down</td><td>7/9</td></tr>
<tr><td>~</td><td>Vibrato</td><td>12~</td></tr>
<tr><td>x</td><td>Muted (dead) note, percussive</td><td>x</td></tr>
<tr><td>PM</td><td>Palm mute the notes underneath</td><td>PM----</td></tr>
<tr><td>&lt;12&gt;</td><td>Natural harmonic</td><td>&lt;12&gt;</td></tr>
<tr><td>t or T</td><td>Tap with the picking hand</td><td>t12</td></tr>
</table>
<p>In AXELAB, every tab is playable. Hit <b>Play</b> to hear it, change the speed, and turn on <b>Neck</b> to watch the notes light up on the fretboard.</p>
<div data-tabc="G5 hG7 pG5:2 G7b9:2 G7b9r G5:2 /G9 G7~:4 Gx Gx" data-key="9" data-scale="pentatonic_minor" data-allow="11" data-title="Every technique in one line" data-bpm="70" data-tone="blues" data-caption="Hammer-on, pull-off, bend, release, slide, vibrato, then two muted strums."></div>
<h3>Rhythm: what tab leaves out</h3>
<p>Plain tab rarely shows rhythm. You get it from listening, from standard notation, or from the spacing in a well-written tab. These are the note values:</p>
<table class="ltable">
<tr><th>Note</th><th>Beats in 4/4</th><th>Count</th></tr>
<tr><td>Whole</td><td>4</td><td>1 - 2 - 3 - 4</td></tr>
<tr><td>Half</td><td>2</td><td>1 - 2 / 3 - 4</td></tr>
<tr><td>Quarter</td><td>1</td><td>1 / 2 / 3 / 4</td></tr>
<tr><td>8th</td><td>½</td><td>1 & 2 & 3 & 4 &</td></tr>
<tr><td>16th</td><td>¼</td><td>1 e & a 2 e & a</td></tr>
<tr><td>8th-note triplet</td><td>⅓</td><td>1 trip-let 2 trip-let</td></tr>
</table>
<div class="ptip">Clap each row against a metronome at 60 bpm. If you can clap it and count it, you can play it.</div>
<div data-quiz='[{"q":"Which string is the top line of a tab?","a":["High e (thinnest)","Low E (thickest)","The D string"],"c":0},{"q":"What does 7b9 mean?","a":["Fret 7, bend up to the pitch of fret 9","Play fret 7 then fret 9","Slide from 7 to 9"],"c":0},{"q":"How many 16th notes fit in one beat?","a":["4","2","3"],"c":0}]'></div>`);

L('Foundations', 'rhythm', 'Rhythm, Timing & the Metronome', 10,
  'Beats, bars, time signatures, swing, and how to practice with a click.',
`<h2>Rhythm, Timing & the Metronome</h2>
<p>A wrong note played in time sounds like a choice. A right note played out of time sounds like a mistake. Rhythm is the first thing a listener feels.</p>
<h3>Beats, tempo and bars</h3>
<p>The <b>beat</b> is the pulse you tap your foot to. <b>Tempo</b> is how fast it goes, in beats per minute (bpm). Beats are grouped into <b>bars</b> (measures).</p>
<h3>Time signatures</h3>
<p>The top number is beats per bar; the bottom number is which note gets the beat.</p>
<ul>
<li><b>4/4</b>: four quarter-note beats per bar. Most rock, pop, blues and funk.</li>
<li><b>3/4</b>: three beats. Waltzes and some ballads.</li>
<li><b>6/8</b>: six 8th notes felt as two big beats (1-2-3 4-5-6). Doo-wop, slow rock ballads.</li>
<li><b>12/8</b>: four big beats, each split in three. The slow blues feel.</li>
</ul>
<h3>Straight vs swing</h3>
<p>Straight 8ths split the beat evenly. <b>Swing</b> (or shuffle) 8ths are long-short, based on triplets: the first note takes two-thirds of the beat. Blues shuffles, jazz and a lot of early rock ’n’ roll swing.</p>
<button class="btn jam" data-jam='{"prog":"pop_axis","key":7,"style":"pop","scale":"pentatonic_major","bpm":90}'>▶ Jam: straight 8ths (pop)</button>
<button class="btn jam" data-jam='{"prog":"blues12","key":9,"style":"blues_shuffle","scale":"blues","bpm":88}'>▶ Jam: swung shuffle</button>
<h3>Syncopation</h3>
<p>Syncopation means accenting off the beat, on the “&” or the “e” and “a”. Funk, reggae and most riffs live here. Keep counting the beat underneath so you know where you are.</p>
<h3>Practicing with a metronome</h3>
<ol>
<li>Start slow enough to play perfectly. Speed is not the goal yet.</li>
<li>Count out loud while you play. It forces your brain to track the beat.</li>
<li>Put the click on beats 2 and 4 only (set the metronome to half your tempo and treat each click as 2 and 4). This builds an internal pulse.</li>
<li>Record yourself. You will hear rushing and dragging you cannot feel while playing.</li>
</ol>
<div class="ptip">Use the <b>Tools → Metronome</b> with subdivisions and the speed trainer, or turn on the click in the Jam tab’s song settings.</div>
<div data-quiz='[{"q":"In 6/8, how is the bar usually felt?","a":["Two big beats of three","Six equal strong beats","Three beats of two"],"c":0},{"q":"What makes swing 8ths different?","a":["Long-short, based on triplets","They are faster","They skip beat 1"],"c":0}]'></div>`);

L('Foundations', 'open-chords', 'Open Chords', 15,
  'The essential open chords, how to change between them, and songs-in-a-box progressions.',
`<h2>Open Chords</h2>
<p>Open chords use open strings and sit in the first three frets. A handful of them will let you play thousands of songs.</p>
<h3>The major and minor shapes</h3>
<div data-chords="C A G E D Am Em Dm" data-open="1"></div>
<p>An <b>x</b> above a string means don’t play it; an <b>o</b> means play it open. Numbers inside dots are suggested fingers or chord degrees (toggle in the diagram).</p>
<h3>Dominant 7th chords</h3>
<p>Adding the ♭7 gives a bluesy, unresolved sound. These are the chords of the 12-bar blues.</p>
<div data-chords="E7 A7 D7 G7 B7 C7" data-open="1"></div>
<h3>Changing chords cleanly</h3>
<ul>
<li><b>Anchor fingers:</b> from C to Am, fingers 1 and 2 stay put. Only finger 3 moves.</li>
<li><b>Move all fingers at once</b> as a shape, not one by one.</li>
<li><b>Look ahead:</b> start moving on the last beat of the old chord.</li>
<li><b>One-minute changes:</b> switch between two chords for one minute and count the changes. Write the number down and beat it tomorrow.</li>
</ul>
<h3>Progressions to practice</h3>
<p><b>G – C – D</b> · <b>C – G – Am – F</b> · <b>Am – F – C – G</b> · <b>E – A – B7</b></p>
<button class="btn jam" data-jam='{"prog":"pop_axis","key":7,"style":"pop","scale":"pentatonic_major","bpm":80}'>▶ Jam: G – D – Em – C</button>
<button class="btn jam" data-jam='{"prog":"doo_wop","key":0,"style":"ballad68","scale":"pentatonic_major","bpm":66}'>▶ Jam: C – Am – F – G</button>
<div class="ptip">In the Jam tab, turn on <b>Chord shapes</b> to see the shape the backing guitarist is playing for each chord.</div>
<div data-quiz='[{"q":"What does an x above a string mean in a chord diagram?","a":["Don’t play that string","Play it open","Play it with the thumb"],"c":0},{"q":"Which two fingers stay in place from C to Am?","a":["1 and 2","3 and 4","None"],"c":0}]'></div>`);

L('Foundations', 'power-chords', 'Power Chords', 10,
  'Two shapes that power rock and metal, plus Drop D and palm-muted riffing.',
`<h2>Power Chords</h2>
<p>A power chord has only two different notes: the <b>root (1)</b> and the <b>perfect 5th (5)</b>, often with the root doubled an octave up. With no 3rd, it is neither major nor minor, so it fits over almost anything, and it stays clear under heavy distortion.</p>
<h3>Root on the 6th string</h3>
<pre>e|-----|
B|-----|
G|-----|
D|--7--|  octave (A)
A|--7--|  5th    (E)
E|--5--|  root   (A)     = A5</pre>
<h3>Root on the 5th string</h3>
<pre>e|-----|
B|-----|
G|--7--|  octave (D)
D|--7--|  5th    (A)
A|--5--|  root   (D)     = D5</pre>
<p>Name the chord by the root: find the note on the low E or A string and put the shape there.</p>
<div data-tabc="E3+A5+D5:2 E5+A7+D7:2 A3+D5+G5:2 A5+D7+G7:2" data-key="4" data-scale="aeolian" data-title="G5, A5, C5, D5" data-bpm="80" data-tone="crunch"></div>
<h3>Palm-muted riffing</h3>
<p>Rest the edge of your picking hand on the strings at the bridge for a tight “chug”, then lift it to let chords ring.</p>
<div data-tabc="E0 E0 E3+A5:2 E0 E0 E5+A7:2 E0 E0 E7+A9 E5+A7 E3+A5:4" data-key="4" data-scale="aeolian" data-title="Muted E with power-chord stabs" data-bpm="110" data-tone="metal"></div>
<h3>Drop D</h3>
<p>Tune the low E down a whole step to D. Now a power chord on the bottom three strings is one finger barred across one fret, and the open low D gives you a heavier root.</p>
<button class="btn jam" data-jam='{"prog":"aeolian_rock","key":4,"style":"hard_rock","scale":"pentatonic_minor","bpm":100}'>▶ Jam: E minor hard rock</button>
<div data-quiz='[{"q":"Which notes make up a power chord?","a":["Root and 5th","Root and 3rd","3rd and 5th"],"c":0},{"q":"Why do power chords work under heavy distortion?","a":["They have no 3rd, so fewer clashing overtones","They are louder","They use open strings"],"c":0}]'></div>`);

L('Foundations', 'barre', 'Barre Chords: The E and A Shapes', 15,
  'Two moveable shapes that let you play any major or minor chord anywhere.',
`<h2>Barre Chords: The E and A Shapes</h2>
<p>Take an open E chord, slide it up, and replace the nut with your first finger: that’s a barre chord. One shape now gives you all 12 major chords.</p>
<h3>E-shape (root on the 6th string)</h3>
<div data-chords="F@E Fm@E F7@E Fm7@E"></div>
<h3>A-shape (root on the 5th string)</h3>
<div data-chords="Bb@A Bbm@A Bb7@A Bbm7@A"></div>
<h3>Finding any chord</h3>
<p>Find the root on the low E string for an E-shape, or on the A string for an A-shape. G is at fret 3 on the low E, so G major is the E-shape at fret 3. C is at fret 3 on the A string, so C major is the A-shape at fret 3.</p>
<h3>Getting a clean barre</h3>
<ul>
<li>Roll the index finger slightly onto its bony edge, toward the headstock.</li>
<li>Keep the thumb behind the neck, roughly behind the middle finger.</li>
<li>Pull back gently with the arm instead of squeezing with the thumb.</li>
<li>Pick each string one at a time and adjust until each one rings.</li>
</ul>
<div class="ptip">You only need the barre to press the strings no other finger covers. In an E-shape major, that’s the low E, B and high e.</div>
<button class="btn jam" data-jam='{"prog":"sensitive","key":9,"style":"pop","scale":"pentatonic_minor","bpm":96}'>▶ Jam: Am – F – C – G with barres</button>
<div data-quiz='[{"q":"Where is the root of an A-shape barre chord?","a":["On the A string","On the low E string","On the B string"],"c":0},{"q":"G is at fret 3 of the low E. Where is the E-shape G major?","a":["Barre at fret 3","Barre at fret 5","Barre at fret 10"],"c":0}]'></div>`);

L('Foundations', 'major-scale', 'The Major Scale', 15,
  'The W-W-H-W-W-W-H formula, scale degrees, and why every other scale is measured against it.',
`<h2>The Major Scale</h2>
<p>The major scale is the measuring stick of Western music. Chords, intervals and modes are all described by comparing them to it.</p>
<h3>The formula</h3>
<p><b>W – W – H – W – W – W – H</b> (whole step = 2 frets, half step = 1 fret). Start on any note and follow the pattern.</p>
<p>From C: C D E F G A B C (no sharps or flats). From G: G A B C D E F♯ G.</p>
<h3>Scale degrees</h3>
<p>Each note gets a number: <b>1 2 3 4 5 6 7</b>. Musicians use these numbers to talk about melodies and chords in any key. “Bend the 2 up to the 3” works in every key.</p>
<h3>One octave on a single string group</h3>
<div data-tabc="E3 E5 A2 A3 A5 D2 D4 D5:3" data-key="7" data-scale="ionian" data-title="G major, one octave" data-bpm="80"></div>
<h3>A full position</h3>
<div data-neck='{"key":7,"scale":"ionian","pos":0,"labels":"degrees"}'></div>
<p class="cap">The half steps fall between 3–4 and 7–1. Find them in the pattern.</p>
<h3>Why it matters</h3>
<ul>
<li><b>Intervals</b> are named from it (major 3rd, perfect 5th…).</li>
<li><b>Chords</b> are built from it (1-3-5 is a major triad).</li>
<li><b>Modes</b> are rotations of it.</li>
<li><b>Other scales</b> are described as changes to it: natural minor is 1 2 ♭3 4 5 ♭6 ♭7.</li>
</ul>
<button class="btn jam" data-jam='{"prog":"pop_axis","key":7,"style":"pop","scale":"ionian","bpm":90}'>▶ Jam in G major</button>
<div data-quiz='[{"q":"Where are the half steps in the major scale?","a":["Between 3–4 and 7–1","Between 2–3 and 6–7","Between 1–2 and 4–5"],"c":0},{"q":"Which note is sharp in G major?","a":["F♯","C♯","B♭"],"c":0}]'></div>`);

L('Foundations', 'intervals', 'Intervals: The Distance Between Notes', 12,
  'Name, hear and find every interval. The vocabulary behind chords and melody.',
`<h2>Intervals</h2>
<p>An interval is the distance between two notes. Learn intervals and you can build any chord, understand any scale and find notes by sound.</p>
<table class="ltable">
<tr><th>Semitones</th><th>Name</th><th>Degree</th><th>Character</th></tr>
<tr><td>1</td><td>Minor 2nd</td><td>♭2</td><td>Tense</td></tr>
<tr><td>2</td><td>Major 2nd</td><td>2</td><td>Stepping</td></tr>
<tr><td>3</td><td>Minor 3rd</td><td>♭3</td><td>Sad, dark</td></tr>
<tr><td>4</td><td>Major 3rd</td><td>3</td><td>Bright</td></tr>
<tr><td>5</td><td>Perfect 4th</td><td>4</td><td>Open</td></tr>
<tr><td>6</td><td>Tritone</td><td>♭5 / ♯4</td><td>Unstable</td></tr>
<tr><td>7</td><td>Perfect 5th</td><td>5</td><td>Strong</td></tr>
<tr><td>8</td><td>Minor 6th</td><td>♭6</td><td>Bittersweet</td></tr>
<tr><td>9</td><td>Major 6th</td><td>6</td><td>Warm</td></tr>
<tr><td>10</td><td>Minor 7th</td><td>♭7</td><td>Bluesy</td></tr>
<tr><td>11</td><td>Major 7th</td><td>7</td><td>Yearning</td></tr>
<tr><td>12</td><td>Octave</td><td>8</td><td>Same note</td></tr>
</table>
<h3>Intervals on the fretboard</h3>
<ul>
<li>On one string, the interval is the number of frets.</li>
<li>Moving to the next higher string at the same fret adds a perfect 4th (5 semitones), except G to B, which adds a major 3rd (4 semitones).</li>
<li>So a perfect 5th is “next string, two frets up”, and an octave is “two strings, two frets up”.</li>
</ul>
<div data-tabc="E5 E6 E5 E7 E5 E8 E5 E9 E5 A5 E5 A6 E5 A7 E5 A8 E5 A9 E5 A10 E5 A11 E5 D7:3" data-key="9" data-scale="chromatic" data-title="Every interval from A" data-bpm="80"></div>
<h3>Consonance and inversion</h3>
<p>Unisons, octaves, 5ths and 4ths sound stable; 3rds and 6ths sound sweet; 2nds, 7ths and the tritone want to move. Flip an interval and the numbers add to 9: a 3rd becomes a 6th, a 2nd becomes a 7th.</p>
<div class="ptip">The <b>Theory → Intervals</b> page plays each interval and lists song references. The <b>Ear</b> tab quizzes you until you can name them by sound.</div>
<div data-quiz='[{"q":"How many semitones in a perfect 5th?","a":["7","5","4"],"c":0},{"q":"Moving from the G string to the B string at the same fret adds…","a":["A major 3rd","A perfect 4th","A perfect 5th"],"c":0},{"q":"A minor 3rd inverted becomes…","a":["A major 6th","A minor 6th","A perfect 5th"],"c":0}]'></div>`);

L('Foundations', 'pent-minor', 'Minor Pentatonic: The Five Boxes', 20,
  'The most-used soloing scale in rock and blues, across the whole neck.',
`<h2>Minor Pentatonic: The Five Boxes</h2>
<p>Five notes, no “wrong” half steps, and a sound that is pure rock and blues. If you learn one scale for soloing, learn this one.</p>
<h3>The formula</h3>
<p><b>1 ♭3 4 5 ♭7</b>. In A: <b>A C D E G</b>.</p>
<h3>Box 1</h3>
<p>Start with your first finger on the root at the 5th fret of the low E. Two notes per string. The roots are the gold dots.</p>
<div data-neck='{"key":9,"scale":"pentatonic_minor","pos":0,"labels":"degrees"}'></div>
<div data-tabc="E5 E8 A5 A7 D5 D7 G5 G7 B5 B8 e5 e8:2 e5 B8 B5 G7 G5 D7 D5 A7 A5 E8 E5:3" data-key="9" data-scale="pentatonic_minor" data-title="Box 1 up and down" data-bpm="90" data-tone="blues"></div>
<h3>All five boxes</h3>
<p>The same five notes repeat across the neck in five overlapping shapes. Each box shares its top notes with the next.</p>
<div data-neck='{"key":9,"scale":"pentatonic_minor","pos":1,"labels":"degrees"}'></div>
<div data-neck='{"key":9,"scale":"pentatonic_minor","pos":2,"labels":"degrees"}'></div>
<div data-neck='{"key":9,"scale":"pentatonic_minor","pos":3,"labels":"degrees"}'></div>
<div data-neck='{"key":9,"scale":"pentatonic_minor","pos":4,"labels":"degrees"}'></div>
<p>Use the <b>Neck</b> tab to step through positions in any key and hear each one.</p>
<h3>Three essential licks</h3>
<div data-tabc="e8b10~:3 e5 B8 B5 G7b9 G5:4" data-key="9" data-scale="pentatonic_minor" data-title="The bend-and-fall" data-bpm="80" data-tone="blues"></div>
<div data-tabc="B8 pB5 G7 pG5 B8 pB5 G7 pG5 D7:4" data-key="9" data-scale="pentatonic_minor" data-title="The pull-off roll" data-bpm="90" data-tone="blues"></div>
<div data-tabc="G7b9~:3 B8 B5 G7 G5 D7 D5~:4" data-key="9" data-scale="pentatonic_minor" data-title="The G-string bend" data-bpm="80" data-tone="blues"></div>
<h3>Connecting the boxes</h3>
<p>Slide on one string from the top of one box into the next. Start by connecting box 1 and box 2 with slides on the G and B strings.</p>
<button class="btn jam" data-jam='{"prog":"minor_blues","key":9,"style":"slow_blues","scale":"pentatonic_minor","bpm":64}'>▶ Jam: A minor blues</button>
<button class="btn jam" data-jam='{"prog":"aeolian_rock","key":9,"style":"rock","scale":"pentatonic_minor","bpm":110}'>▶ Jam: A minor rock</button>
<div data-quiz='[{"q":"What is the minor pentatonic formula?","a":["1 ♭3 4 5 ♭7","1 2 3 5 6","1 2 ♭3 4 5 ♭6 ♭7"],"c":0},{"q":"In box 1 of A minor pentatonic, where is the root on the low E string?","a":["5th fret","3rd fret","7th fret"],"c":0}]'></div>`);

L('Foundations', 'pent-major', 'Major Pentatonic & the Relative Trick', 15,
  'The sweet, country-flavored pentatonic, and the 3-fret shift that gives it to you for free.',
`<h2>Major Pentatonic & the Relative Trick</h2>
<p>The major pentatonic is the bright twin of the minor pentatonic. It sounds open, happy and a little country.</p>
<h3>The formula</h3>
<p><b>1 2 3 5 6</b>. In A: <b>A B C♯ E F♯</b>.</p>
<h3>The relative trick</h3>
<p>F♯ minor pentatonic (F♯ A B C♯ E) has exactly the same notes as A major pentatonic. Every major pentatonic shares its notes with the minor pentatonic <b>three frets lower</b>. So: to play A major pentatonic, play your minor pentatonic box 1 at the 2nd fret instead of the 5th.</p>
<div data-neck='{"key":9,"scale":"pentatonic_major","pos":4,"labels":"degrees"}'></div>
<p class="cap">The same box shape as minor pentatonic box 1, moved down three frets. Now the root is under your fourth finger on the low E.</p>
<div class="ptip">Same notes, different home. What makes it sound major is which note you treat as home: phrase toward A and lean on C♯ (the major 3rd).</div>
<h3>Licks</h3>
<div data-tabc="G2 G4b6 B2 B5 e2 e5:4" data-key="9" data-scale="pentatonic_major" data-title="Country bend to the 3rd" data-bpm="90" data-tone="clean"></div>
<div data-tabc="e5 e2 B5 B2 G4 G2 D4 D2:2 A4 A2:4" data-key="9" data-scale="pentatonic_major" data-title="Down through the box" data-bpm="90" data-tone="clean"></div>
<h3>When to use it</h3>
<ul>
<li>Over major chords and major-key songs: country, southern rock, pop.</li>
<li>Over the I chord of a blues for sweetness, then switch to minor pentatonic for grit.</li>
</ul>
<button class="btn jam" data-jam='{"prog":"country_train","key":9,"style":"country","scale":"pentatonic_major","bpm":140}'>▶ Jam: country in A</button>
<button class="btn jam" data-jam='{"prog":"blues12","key":9,"style":"blues_shuffle","scale":"pentatonic_major","bpm":92}'>▶ Jam: major pentatonic over a blues</button>
<div data-quiz='[{"q":"A major pentatonic shares its notes with which minor pentatonic?","a":["F♯ minor","C♯ minor","D minor"],"c":0},{"q":"What is the major pentatonic formula?","a":["1 2 3 5 6","1 ♭3 4 5 ♭7","1 2 3 4 5"],"c":0}]'></div>`);

L('Foundations', 'blues12', 'The 12-Bar Blues', 15,
  'The form behind blues and rock ’n’ roll: chords, shuffle rhythm, turnarounds and soloing.',
`<h2>The 12-Bar Blues</h2>
<p>Twelve bars, three chords, and the root of rock ’n’ roll, R&B, jazz and funk.</p>
<h3>The form in A</h3>
<table class="ltable">
<tr><td>A7</td><td>A7</td><td>A7</td><td>A7</td></tr>
<tr><td>D7</td><td>D7</td><td>A7</td><td>A7</td></tr>
<tr><td>E7</td><td>D7</td><td>A7</td><td>E7</td></tr>
</table>
<p>In numbers: <b>I7 – IV7 – V7</b>. In E: E7, A7, B7. In G: G7, C7, D7. The last bar (the V7) is the <b>turnaround</b> that sends you back to the top. The <b>quick change</b> version goes to the IV in bar 2.</p>
<h3>The shuffle rhythm</h3>
<p>This boogie pattern alternates the 5th and 6th above the root. Swing it: long-short.</p>
<div data-tabc="A0+D2 A0+D2 A0+D4 A0+D4 A0+D2 A0+D2 A0+D4 A0+D4 | D0+G2 D0+G2 D0+G4 D0+G4 D0+G2 D0+G2 D0+G4 D0+G4 | E0+A2 E0+A2 E0+A4 E0+A4 E0+A2 E0+A2 E0+A4 E0+A4" data-title="Boogie on A, D and E" data-bpm="100" data-tone="blues"></div>
<h3>A classic turnaround</h3>
<div data-tabc="G8+e5 G7+e5 G6+e5 G5+e5 | E0+A2+D0+G1+B0+e0:4" data-key="9" data-scale="chromatic" data-title="Chromatic turnaround into E7" data-bpm="80" data-tone="blues"></div>
<h3>Soloing</h3>
<ul>
<li><b>One scale:</b> A minor pentatonic or the A blues scale works over all 12 bars.</li>
<li><b>Sweeter:</b> use A major pentatonic over the A7, minor pentatonic over D7 and E7.</li>
<li><b>Follow the changes:</b> aim for each chord’s 3rd as it arrives: C♯ over A7, F♯ over D7, G♯ over E7.</li>
</ul>
<button class="btn jam" data-jam='{"prog":"blues12","key":9,"style":"blues_shuffle","scale":"blues","bpm":92}'>▶ Jam: 12-bar shuffle in A</button>
<button class="btn jam" data-jam='{"prog":"blues12_quick","key":4,"style":"blues_shuffle","scale":"pentatonic_minor","bpm":112}'>▶ Jam: quick-change in E</button>
<div data-quiz='[{"q":"In the key of E, what are the I, IV and V chords?","a":["E7, A7, B7","E7, A7, D7","E7, G7, A7"],"c":0},{"q":"What does the turnaround do?","a":["Sends the form back to the top","Changes the key","Ends the song"],"c":0}]'></div>`);

L('Foundations', 'expression', 'Bends, Vibrato & Slides', 12,
  'The three expressive tools that make a guitar sing. Learn to do them in tune and in time.',
`<h2>Bends, Vibrato & Slides</h2>
<p>These three techniques turn notes into a voice. They are what listeners remember.</p>
<h3>Bends: always to a target</h3>
<p>A bend should land exactly on a note. Play the target first, then bend up to match it.</p>
<div data-tabc="G9:2 G7b9~:4 B10:2 B8b10~:4" data-key="9" data-scale="pentatonic_minor" data-title="Hear the target, then bend to it" data-bpm="70" data-tone="blues"></div>
<ul>
<li>Use three fingers on the string: the ring finger bends, the index and middle push with it.</li>
<li>Turn the wrist like a key. The thumb hooks over the neck.</li>
<li>Bend the B, G and e strings toward the ceiling; bend the low strings toward the floor.</li>
</ul>
<h3>Vibrato: your fingerprint</h3>
<p>Repeatedly bend and release a small amount. Practice it slowly and in time, then vary width and speed.</p>
<div data-tabc="B5~:4 B8~:4 G7~:4 G7b9~:6" data-key="9" data-scale="pentatonic_minor" data-title="Vibrato on every finger, then on a bend" data-bpm="70" data-tone="blues"></div>
<h3>Slides</h3>
<p>Keep pressure on the string as you move so the note sustains. Slides are how you change positions without breaking the line.</p>
<div data-tabc="G7 /G9 B8 /B10 e8 /e10 e12~:4" data-key="9" data-scale="pentatonic_minor" data-title="Climbing with slides" data-bpm="80" data-tone="blues"></div>
<div class="ptip">See the <b>Technique</b> library for deeper drills on each, plus rakes, double-stops and harmonics.</div>
<div data-quiz='[{"q":"What should you do before a bend while learning?","a":["Play the target note so you know the pitch","Turn up the gain","Mute all strings"],"c":0},{"q":"Which direction do you bend the G string?","a":["Toward the ceiling","Toward the floor","Either, it doesn’t matter"],"c":0}]'></div>`);

/* ═══════════════════════ INTERMEDIATE ═══════════════════════ */

L('Intermediate', 'keys', 'Keys & the Circle of Fifths', 15,
  'What a key is, how key signatures work, relative minors, and how to find the key of a song.',
`<h2>Keys & the Circle of Fifths</h2>
<p>A <b>key</b> is a home note plus the family of notes and chords that orbit it. Knowing the key tells you which scale to play and which chords to expect.</p>
<h3>Key signatures</h3>
<p>Each major key uses a fixed set of sharps or flats. Sharps are added in the order <b>F C G D A E B</b>; flats in the order <b>B E A D G C F</b>.</p>
<h3>The circle of fifths</h3>
<p>Arrange the 12 keys so each step clockwise is a perfect 5th higher: C, G, D, A, E, B, F♯… Each step clockwise adds one sharp. Each step counter-clockwise (a 4th higher) adds one flat: C, F, B♭, E♭…</p>
<ul>
<li>Neighbors on the circle share six of seven notes, which is why songs modulate to them so smoothly.</li>
<li>The chord a step clockwise from the key is its <b>V</b>; a step counter-clockwise is its <b>IV</b>. I, IV and V sit side by side.</li>
<li>Jazz progressions move counter-clockwise: ii–V–I is two steps around the circle.</li>
</ul>
<div class="ptip">Open <b>Theory → Keys & Circle</b> for an interactive circle. Tap a key to see its chords and set it as your jam key.</div>
<h3>Relative major and minor</h3>
<p>Every major key has a <b>relative minor</b> with the same notes, starting on its 6th degree, three frets below the root. C major and A minor share every note. G major and E minor share every note.</p>
<h3>Finding the key of a song</h3>
<ol>
<li>List the chords. Find the major key whose diatonic chords contain them.</li>
<li>Find the chord that feels like home: songs usually start or end there.</li>
<li>If the home chord is minor, you are in the relative minor.</li>
<li>Check the melody: does one note feel like resolution?</li>
</ol>
<p>On guitar, keys are shapes. Box 1 of the minor pentatonic at the 5th fret is A minor; move it to the 7th fret and it’s B minor. No new fingering to learn.</p>
<div data-quiz='[{"q":"How many sharps does D major have?","a":["2","1","3"],"c":0},{"q":"What is the relative minor of G major?","a":["E minor","A minor","B minor"],"c":0},{"q":"Moving one step clockwise on the circle goes…","a":["Up a perfect 5th","Up a perfect 4th","Up a half step"],"c":0}]'></div>`);

L('Intermediate', 'diatonic', 'Diatonic Chords & Roman Numerals', 18,
  'Build every chord in a key, learn their functions, and read progressions in numbers.',
`<h2>Diatonic Chords & Roman Numerals</h2>
<p>Stack every other note of a scale (a 3rd apart) and you get its chords. These are the <b>diatonic</b> chords: the ones that belong to the key.</p>
<h3>In a major key</h3>
<table class="ltable">
<tr><th>Degree</th><th>I</th><th>ii</th><th>iii</th><th>IV</th><th>V</th><th>vi</th><th>vii°</th></tr>
<tr><td>Triad</td><td>Major</td><td>minor</td><td>minor</td><td>Major</td><td>Major</td><td>minor</td><td>dim</td></tr>
<tr><td>7th chord</td><td>maj7</td><td>m7</td><td>m7</td><td>maj7</td><td>7</td><td>m7</td><td>m7♭5</td></tr>
<tr><td>In C</td><td>C</td><td>Dm</td><td>Em</td><td>F</td><td>G</td><td>Am</td><td>B°</td></tr>
</table>
<div data-chords="C Dm Em F G Am Bdim"></div>
<p>Uppercase numerals are major, lowercase are minor, ° is diminished. The only dominant 7th chord in a major key is the <b>V7</b>, and its pull to I drives Western harmony.</p>
<h3>Function: tonic, predominant, dominant</h3>
<ul>
<li><b>Tonic</b> (home): I, and its substitutes vi and iii.</li>
<li><b>Predominant</b> (away): IV and ii.</li>
<li><b>Dominant</b> (tension): V and vii°, which want to resolve to I.</li>
</ul>
<p>Most progressions cycle tonic → predominant → dominant → tonic. I–IV–V–I, ii–V–I and I–vi–IV–V all follow it.</p>
<h3>In a minor key</h3>
<p>Natural minor gives <b>i ii° ♭III iv v ♭VI ♭VII</b>. In A minor: Am, B°, C, Dm, Em, F, G. Composers often raise the 7th to make the v a major <b>V</b> (E or E7 in A minor) for a stronger pull home. That raised note comes from harmonic minor.</p>
<h3>Why numbers?</h3>
<p>Numbers make every song transposable. I–V–vi–IV is G–D–Em–C in G and E–B–C♯m–A in E. Learn the shape of the progression once.</p>
<div class="ptip">The <b>Theory → Harmony</b> page builds triads and 7th chords for any key and mode, and plays them.</div>
<button class="btn jam" data-jam='{"prog":"pop_axis","key":0,"style":"pop","scale":"ionian","bpm":96}'>▶ Jam: I–V–vi–IV in C</button>
<button class="btn jam" data-jam='{"prog":"turnaround","key":5,"style":"jazz_swing","scale":"ionian","bpm":130}'>▶ Jam: I–vi–ii–V with 7th chords</button>
<div data-quiz='[{"q":"What quality is the ii chord in a major key?","a":["minor","Major","diminished"],"c":0},{"q":"Which chord is the dominant in G major?","a":["D","C","Em"],"c":0},{"q":"In a minor key, why is the v often made major?","a":["To create a leading tone that pulls to the root","To make it easier to play","Because the scale requires it"],"c":0}]'></div>`);

L('Intermediate', 'caged', 'The CAGED System', 18,
  'Five chord shapes that tile the neck and connect chords, arpeggios and scales.',
`<h2>The CAGED System</h2>
<p>The open chords C, A, G, E and D are not just chords; they are five shapes that, moved up the neck, tile the entire fretboard for any chord.</p>
<h3>Five shapes of one chord</h3>
<p>Here is C major played with each shape. Follow them up the neck in the order C → A → G → E → D, then the cycle repeats.</p>
<div data-chords="C@C C@A C@G C@E C@D"></div>
<h3>How the shapes connect</h3>
<p>The top of one shape overlaps the bottom of the next: they share root notes. Learn where the root sits in each shape and you can find any chord in five places.</p>
<ul>
<li><b>C shape</b>: root on the A string under the ring finger.</li>
<li><b>A shape</b>: root on the A string under the barre.</li>
<li><b>G shape</b>: root on the low E and high e under the ring/pinky.</li>
<li><b>E shape</b>: root on the low E under the barre.</li>
<li><b>D shape</b>: root on the D string.</li>
</ul>
<h3>From chords to scales and arpeggios</h3>
<p>Each chord shape has a matching scale position around it, and the chord tones inside that position are its arpeggio. When you solo, the chord shape is the skeleton; the scale notes are the flesh. Target the chord tones on strong beats.</p>
<div data-neck='{"key":0,"scale":"ionian","pos":0,"labels":"degrees","chord":[0,""]}'></div>
<p class="cap">C major scale with the C chord tones ringed. Turn on chord tones in the Neck tab for any key.</p>
<div class="ptip">Pick one chord a day and play it in all five shapes, then play its arpeggio in each shape.</div>
<div data-quiz='[{"q":"What is the order of the CAGED shapes going up the neck?","a":["C, A, G, E, D","A, B, C, D, E","E, A, D, G, C"],"c":0},{"q":"In the E shape, where is the root?","a":["On the low E string under the barre","On the D string","On the B string"],"c":0}]'></div>`);

L('Intermediate', '3nps', 'Three-Notes-Per-String Scales', 15,
  'Symmetrical scale patterns built for speed, legato and wide range.',
`<h2>Three-Notes-Per-String Scales</h2>
<p>Seven-note scales can be played with exactly three notes on every string. The result: seven even patterns, each covering more than two octaves, ideal for legato and alternate picking.</p>
<div data-neck='{"key":7,"scale":"ionian","pos":0,"labels":"degrees","system":"3nps"}'></div>
<p class="cap">G major, pattern 1 (starting on the root). Each string holds three notes; the shape shifts one fret up on the B string.</p>
<h3>Why 3nps?</h3>
<ul>
<li>Every string has the same number of notes, so picking patterns repeat cleanly.</li>
<li>Patterns of 3 work naturally in triplets and sextuplets.</li>
<li>Legato is easy: pick once per string, hammer the rest.</li>
<li>The patterns stretch wider than CAGED shapes, so use a relaxed thumb position.</li>
</ul>
<h3>Sequences</h3>
<p>Playing a scale straight up and down sounds like an exercise. Sequences sound like music. Here is G major in groups of three.</p>
<div data-tabc="E3 E5 E7 E5 E7 A3 E7 A3 A5 A3 A5 A7 A5 A7 D4 A7 D4 D5 D4 D5 D7 D5 D7 G4 D7 G4 G5 G4 G5 G7 G5 G7 B5 G7 B5 B7 B5 B7 B8 B7 B8 e5 B8 e5 e7 e5 e7 e8:3" data-key="7" data-scale="ionian" data-title="G major in groups of three" data-bpm="80" data-tone="lead"></div>
<div class="ptip">Accent the first note of each group. It keeps you in time and makes the pattern audible to the listener.</div>
<p>See the 3nps patterns for any scale in the <b>Neck</b> tab: choose a 7-note scale and step through positions.</p>
<div data-quiz='[{"q":"How many 3nps patterns does a 7-note scale have?","a":["7","5","3"],"c":0},{"q":"Why does the pattern shift on the B string?","a":["The G to B interval is a major 3rd, not a 4th","Because of the frets","It doesn’t shift"],"c":0}]'></div>`);

L('Intermediate', 'modes', 'Modes Made Simple', 20,
  'Seven moods from one scale. How to hear them, play them and use them over chords.',
`<h2>Modes Made Simple</h2>
<p>Play the C major scale but treat D as home, and you get <b>D Dorian</b>. Same notes, different center, completely different mood. That is all a mode is.</p>
<h3>Two ways to think</h3>
<ul>
<li><b>Parent thinking:</b> D Dorian = the notes of C major, starting on D. Useful for finding the notes.</li>
<li><b>Parallel thinking:</b> D Dorian = D natural minor with a raised 6th. Useful for hearing the color.</li>
</ul>
<p>Parallel thinking is what makes modes sound different. Each mode has one or two <b>character notes</b> that set it apart from plain major or minor.</p>
<table class="ltable">
<tr><th>Mode</th><th>Formula</th><th>Character</th><th>Sound</th></tr>
<tr><td>Lydian</td><td>1 2 3 ♯4 5 6 7</td><td>♯4</td><td>Floating, dreamy</td></tr>
<tr><td>Ionian</td><td>1 2 3 4 5 6 7</td><td>(reference)</td><td>Bright, settled</td></tr>
<tr><td>Mixolydian</td><td>1 2 3 4 5 6 ♭7</td><td>♭7</td><td>Bluesy major</td></tr>
<tr><td>Dorian</td><td>1 2 ♭3 4 5 6 ♭7</td><td>6</td><td>Soulful minor</td></tr>
<tr><td>Aeolian</td><td>1 2 ♭3 4 5 ♭6 ♭7</td><td>♭6</td><td>Sad, serious</td></tr>
<tr><td>Phrygian</td><td>1 ♭2 ♭3 4 5 ♭6 ♭7</td><td>♭2</td><td>Dark, Spanish</td></tr>
<tr><td>Locrian</td><td>1 ♭2 ♭3 4 ♭5 ♭6 ♭7</td><td>♭5</td><td>Unstable</td></tr>
</table>
<p>The table runs brightest to darkest. Each step down lowers exactly one note.</p>
<h3>Hearing a mode</h3>
<p>A mode only sounds like itself over a backing that supports it: a drone or a vamp that keeps the root as home. Use these vamps and lean on the character note.</p>
<button class="btn jam" data-jam='{"prog":"lydian_vamp","key":5,"style":"ballad","scale":"lydian","bpm":80}'>▶ Lydian (F)</button>
<button class="btn jam" data-jam='{"prog":"mixo_vamp","key":4,"style":"rock","scale":"mixolydian","bpm":116}'>▶ Mixolydian (E)</button>
<button class="btn jam" data-jam='{"prog":"dorian_vamp","key":9,"style":"funk","scale":"dorian","bpm":100}'>▶ Dorian (A)</button>
<button class="btn jam" data-jam='{"prog":"aeolian_vamp","key":4,"style":"ballad","scale":"aeolian","bpm":74}'>▶ Aeolian (E)</button>
<button class="btn jam" data-jam='{"prog":"phrygian_vamp","key":4,"style":"ballad68","scale":"phrygian","bpm":64}'>▶ Phrygian (E)</button>
<h3>Dorian vs Aeolian, side by side</h3>
<div data-neck='{"key":9,"scale":"dorian","pos":0,"labels":"degrees"}'></div>
<div data-neck='{"key":9,"scale":"aeolian","pos":0,"labels":"degrees"}'></div>
<p class="cap">One note changes: F♯ (6) in Dorian, F (♭6) in Aeolian. The diamond marks each mode’s character note.</p>
<div data-quiz='[{"q":"What is the character note of Mixolydian?","a":["♭7","♯4","♭2"],"c":0},{"q":"D Dorian uses the notes of which major scale?","a":["C major","D major","G major"],"c":0},{"q":"Which is the darkest of these?","a":["Phrygian","Dorian","Lydian"],"c":0}]'></div>`);

L('Intermediate', 'arpeggios', 'Arpeggios & Chord Tones', 18,
  'Play the chord one note at a time and make your lines follow the harmony.',
`<h2>Arpeggios & Chord Tones</h2>
<p>An <b>arpeggio</b> is a chord played one note at a time. Arpeggios are how solos follow the chords instead of floating over them.</p>
<h3>Triads and 7ths</h3>
<ul>
<li>Major triad: 1 3 5 · Minor triad: 1 ♭3 5 · Diminished: 1 ♭3 ♭5</li>
<li>maj7: 1 3 5 7 · m7: 1 ♭3 5 ♭7 · 7 (dominant): 1 3 5 ♭7 · m7♭5: 1 ♭3 ♭5 ♭7</li>
</ul>
<div data-tabc="E5 E8 A7 D5 D7 G5 B5 B8 e5:3" data-key="9" data-scale="aeolian" data-title="Am7 arpeggio (A C E G)" data-bpm="80" data-tone="clean"></div>
<h3>Targeting chord tones</h3>
<p>The strongest notes over any chord are its <b>3rd</b> and <b>7th</b>: they define major vs minor and dominant vs major 7. Land on them on beats 1 and 3, and fill between with scale notes.</p>
<ul>
<li>Approach a target from a half step below or above for a jazzy, intentional sound.</li>
<li>When the chord changes, move to the nearest chord tone of the new chord.</li>
</ul>
<h3>ii–V–I in C, outlined</h3>
<div data-tabc="A5 A8 D7 G5 | E3 A2 A5 D3 | A3 D2 D5 G4:4" data-key="0" data-scale="ionian" data-title="Dm7 → G7 → Cmaj7 arpeggios" data-bpm="90" data-tone="jazz"></div>
<button class="btn jam" data-jam='{"prog":"ii_V_I","key":0,"style":"jazz_swing","scale":"ionian","bpm":110,"follow":"chordtones"}'>▶ Jam: ii–V–I in C (chord-tone view)</button>
<div class="ptip">In the Jam tab, choose <b>Show: Chord tones</b> to see only the notes of the current chord, colored by function (root, 3rd, 5th, 7th).</div>
<div data-quiz='[{"q":"Which chord tones define a chord’s quality most?","a":["3rd and 7th","Root and 5th","5th and 9th"],"c":0},{"q":"What are the notes of G7?","a":["G B D F","G B D F♯","G B♭ D F"],"c":0}]'></div>`);

L('Intermediate', 'triads', 'Triads Up the Neck', 15,
  'Three-note chord shapes and inversions on the top strings for rhythm, fills and voice leading.',
`<h2>Triads Up the Neck</h2>
<p>Small three-string chords are the secret of players like Hendrix, Frusciante and John Mayer: they leave room for bass and vocals and sit right next to melody.</p>
<h3>Three inversions</h3>
<ul>
<li><b>Root position:</b> 1 3 5 (root on the bottom)</li>
<li><b>1st inversion:</b> 3 5 1</li>
<li><b>2nd inversion:</b> 5 1 3</li>
</ul>
<div data-tabc="G5+B5+e3:3 G9+B8+e8:3 G12+B13+e12:4" data-key="0" data-scale="ionian" data-title="C major on G-B-e: three inversions" data-bpm="70" data-tone="clean"></div>
<div data-tabc="G2+B1+e0:3 G5+B5+e5:3 G9+B10+e8:4" data-key="9" data-scale="aeolian" data-title="A minor on G-B-e" data-bpm="70" data-tone="clean"></div>
<h3>Voice leading</h3>
<p>Move between chords with the closest inversion, so each voice moves as little as possible. It sounds smooth and keeps your hand in one area.</p>
<div data-tabc="G5+B5+e3:3 G5+B6+e5:3 G4+B3+e3:3 G5+B5+e3:4" data-key="0" data-scale="ionian" data-title="C – F – G – C in one position" data-bpm="70" data-tone="clean"></div>
<h3>Using them</h3>
<ul>
<li>Rhythm: strum triads high on the neck while another guitar plays full chords.</li>
<li>Fills: hammer from a sus2 or sus4 into the triad, slide into the next inversion.</li>
<li>Lead: triad notes are guaranteed chord tones. Build melodies around them.</li>
</ul>
<div data-quiz='[{"q":"In 1st inversion, which chord tone is on the bottom?","a":["The 3rd","The root","The 5th"],"c":0},{"q":"Why use the closest inversion when changing chords?","a":["Smooth voice leading","It is louder","It is required"],"c":0}]'></div>`);

L('Intermediate', 'phrasing', 'Phrasing: Making Solos Speak', 15,
  'Call and response, space, motifs, rhythm and targets: the skills that turn scales into music.',
`<h2>Phrasing: Making Solos Speak</h2>
<p>Knowing a scale is like knowing an alphabet. Phrasing is how you form sentences. These ideas matter more than any new scale.</p>
<h3>1. Speak in sentences</h3>
<p>Play a 1- or 2-bar phrase, then stop. Breathe. Let the band answer. Singers have to breathe; guitarists forget to.</p>
<h3>2. Call and response</h3>
<p>Ask a question (a phrase that ends up, unresolved) and answer it (a phrase that ends on the root or a chord tone).</p>
<h3>3. Motif and variation</h3>
<p>Repeat a short idea, then change one thing: the rhythm, the last note, the octave. Listeners love to recognize something.</p>
<div data-tabc="e8b10~:3 e5 B8:2 - - | e8b10~:3 e5 B8 B5:2 - | e8b10r e8 e5 B8 B5 G7b9~:4" data-key="9" data-scale="pentatonic_minor" data-title="One motif, three variations" data-bpm="80" data-tone="blues"></div>
<h3>4. Rhythm first</h3>
<p>Try soloing on one note using only rhythm. Then two notes. A great rhythm with three notes beats a fast scale with no shape.</p>
<h3>5. Target notes</h3>
<p>Decide where a phrase will land before you play it: the root, the chord’s 3rd, or a bend into a chord tone on beat 1.</p>
<h3>6. Start off the beat</h3>
<p>Begin phrases on the “&” of 1 or on beat 2. It sounds conversational instead of mechanical.</p>
<h3>7. Dynamics and arc</h3>
<p>Start low and quiet, build to a peak, come back down. Save your highest, longest bend for the climax.</p>
<div class="ptip"><b>Exercise:</b> Over the minor blues jam, solo with only three notes: A, C and D. Make it interesting with rhythm, bends and space.</div>
<button class="btn jam" data-jam='{"prog":"minor_blues","key":9,"style":"slow_blues","scale":"pentatonic_minor","bpm":62}'>▶ Jam: A minor blues</button>
<div data-quiz='[{"q":"What is a motif?","a":["A short idea you repeat and vary","A fast scale run","A chord shape"],"c":0},{"q":"Why leave space between phrases?","a":["It lets ideas land and gives the band room to answer","It is easier","To tune"],"c":0}]'></div>`);

L('Intermediate', 'blues-solo', 'Blues Soloing: Mixing Major & Minor', 18,
  'The sound of real blues: minor and major colors, chord-following targets and the B.B. box.',
`<h2>Blues Soloing: Mixing Major & Minor</h2>
<p>A 12-bar blues uses dominant 7th chords, which contain a major 3rd, while the melody often uses the minor 3rd. That clash is the blues. Great players move between the two on purpose.</p>
<h3>The ♭3 to 3 curl</h3>
<p>Bend the minor 3rd a quarter or half step toward the major 3rd. Over the I chord it’s the most bluesy sound there is.</p>
<div data-tabc="e5 B5 G5b6:2 G7 D7:4" data-key="9" data-scale="blues" data-allow="1" data-title="The curl over A7" data-bpm="80" data-tone="blues"></div>
<h3>Which scale over which chord</h3>
<table class="ltable">
<tr><th>Chord (in A)</th><th>Sweet choice</th><th>Gritty choice</th><th>Target</th></tr>
<tr><td>A7 (I)</td><td>A major pentatonic / Mixolydian</td><td>A minor pentatonic</td><td>C♯ (its 3rd)</td></tr>
<tr><td>D7 (IV)</td><td>D Mixolydian</td><td>A minor pentatonic</td><td>F♯ (its 3rd), C (its ♭7)</td></tr>
<tr><td>E7 (V)</td><td>E Mixolydian</td><td>A minor pentatonic</td><td>G♯ (its 3rd)</td></tr>
</table>
<h3>Hitting the 3rds as the chords change</h3>
<div data-tabc="G5 hG6~:4 | B6 hB7~:4 | G12 hG13~:4" data-key="9" data-scale="mixolydian" data-allow="0,5,8" data-title="C♯ over A7, F♯ over D7, G♯ over E7" data-bpm="80" data-tone="blues" data-caption="Each target is approached from a half step below."></div>
<h3>The B.B. box</h3>
<p>Around the 10th fret in A, between the minor pentatonic boxes, lies the spot B.B. King lived in: the root on the B string, the 2nd and 4th above it, the 6th below. It blends major and minor in one small shape.</p>
<div data-tabc="e10 B12 B10~:2 e12 e10 B12b14 B10:2 G11 B10~:4" data-key="9" data-scale="mixolydian" data-title="B.B. box phrase" data-bpm="70" data-tone="blues"></div>
<button class="btn jam" data-jam='{"prog":"blues12","key":9,"style":"blues_shuffle","scale":"blues_major","bpm":90,"follow":"chord"}'>▶ Jam: 12-bar in A, chord-scale view</button>
<div data-quiz='[{"q":"Over A7, which note is the major 3rd?","a":["C♯","C","D"],"c":0},{"q":"Over E7 in an A blues, what is a strong target?","a":["G♯","G","F"],"c":0}]'></div>`);

L('Intermediate', 'harmonic-minor', 'Harmonic Minor & the V7 Chord', 15,
  'Why minor keys borrow a raised 7th, and how to play the exotic, neoclassical sound.',
`<h2>Harmonic Minor & the V7 Chord</h2>
<p>Natural minor has a weak v chord (Em in A minor). Raise the 7th degree a half step and the v becomes a major <b>V</b> or <b>V7</b> (E7), with a leading tone that pulls hard into the root. That scale is <b>harmonic minor</b>.</p>
<h3>Formula</h3>
<p><b>1 2 ♭3 4 5 ♭6 7</b>. In A: <b>A B C D E F G♯</b>. The gap from F to G♯ is an augmented 2nd (3 frets), the sound of “exotic” in Western ears.</p>
<div data-tabc="E5 E7 E8 A5 A7 A8 D6 D7 D9 G5 G7 G9 B6 B9 B10 e7 e8:3" data-key="9" data-scale="harmonic_minor" data-title="A harmonic minor, 5th position" data-bpm="80" data-tone="lead"></div>
<div data-neck='{"key":9,"scale":"harmonic_minor","pos":0,"labels":"degrees"}'></div>
<h3>Over the V7: Phrygian dominant</h3>
<p>Play A harmonic minor from E and you get <b>E Phrygian dominant</b> (1 ♭2 3 4 5 ♭6 ♭7): the go-to sound over E7 in A minor, in flamenco and in metal.</p>
<div data-tabc="e8 e7 B10 B9 B6 G9 G7 G5 D9 D7 D6 D7:4" data-key="9" data-scale="harmonic_minor" data-title="Neoclassical descent resolving to A" data-bpm="90" data-tone="metal"></div>
<div class="ptip">Over Am use natural minor or harmonic minor. When the E7 arrives, the G♯ is the note that makes it sound right. Then resolve G♯ up to A.</div>
<button class="btn jam" data-jam='{"prog":"neoclassical","key":9,"style":"metal","scale":"harmonic_minor","bpm":120}'>▶ Jam: Am – Dm – E7 (neoclassical)</button>
<button class="btn jam" data-jam='{"prog":"andalusian","key":4,"style":"reggae","scale":"harmonic_minor","bpm":84,"follow":"chord"}'>▶ Jam: Andalusian cadence</button>
<div data-quiz='[{"q":"Which degree does harmonic minor raise?","a":["The 7th","The 6th","The 3rd"],"c":0},{"q":"What is the 5th mode of harmonic minor called?","a":["Phrygian dominant","Mixolydian","Lydian dominant"],"c":0}]'></div>`);

L('Intermediate', 'ear', 'Ear Training for Guitarists', 12,
  'Hear intervals, chords and scale degrees, and learn songs by ear.',
`<h2>Ear Training for Guitarists</h2>
<p>Your ear is the bridge between what you imagine and what your hands play. It is trainable like any technique.</p>
<h3>What to train</h3>
<ul>
<li><b>Intervals:</b> the distance between two notes. Link each one to a song you know.</li>
<li><b>Chord quality:</b> major, minor, dominant 7, major 7, diminished.</li>
<li><b>Scale degrees:</b> over a key, which note is the 3rd, the 5th, the ♭7? This is the most useful skill for improvising.</li>
<li><b>Progressions:</b> recognize I–IV–V, ii–V–I, I–V–vi–IV by sound.</li>
</ul>
<h3>Daily habits</h3>
<ol>
<li><b>Sing what you play.</b> Play a note, sing it, then sing the next note before playing it.</li>
<li><b>Play over a drone.</b> Hold a root (or a one-chord jam) and feel how each scale degree sounds against it.</li>
<li><b>Quiz yourself</b> five minutes a day in the <b>Ear</b> tab.</li>
</ol>
<h3>Learning songs by ear</h3>
<ol>
<li>Find the key: hum the note that sounds like home, then find it on the guitar.</li>
<li>Loop a short section. Sing it before trying to play it.</li>
<li>Find the first note, then each next note by interval: up or down, how far?</li>
<li>Slow the recording down if you need to. Accuracy before speed.</li>
</ol>
<div class="ptip">Transcribing one solo teaches more phrasing than a hundred licks from tab, because you absorb the timing and feel.</div>
<div data-quiz='[{"q":"Which ear skill helps improvising most directly?","a":["Hearing scale degrees in a key","Perfect pitch","Naming chord inversions"],"c":0}]'></div>`);

L('Intermediate', 'rhythm-guitar', 'Rhythm Guitar: Grooves & Muting', 15,
  'Muting, accents and the core grooves: rock, funk, reggae, country and shuffle.',
`<h2>Rhythm Guitar: Grooves & Muting</h2>
<p>Most of a guitarist’s time in a band is spent playing rhythm. Great rhythm players get hired.</p>
<h3>Three rules</h3>
<ol>
<li><b>Keep the hand moving.</b> Down on the beat, up on the offbeat, even when you don’t hit the strings.</li>
<li><b>Mute everything you’re not playing.</b> Use the fretting hand to choke chords, the picking palm for low strings.</li>
<li><b>Lock to the drums.</b> Listen to the kick and snare; place your accents with them.</li>
</ol>
<h3>The grooves</h3>
<p><b>Rock:</b> driving 8ths, palm-muted verses, open choruses.</p>
<p><b>Funk:</b> 16th scratches with small chord stabs on the D, G and B strings.</p>
<div data-tabc="D6+G7+B7 Dx+Gx+Bx Dx+Gx+Bx D6+G7+B7 Dx+Gx+Bx D6+G7+B7 Dx+Gx+Bx Dx+Gx+Bx" data-key="4" data-scale="mixolydian" data-title="Funk scratch on E9" data-bpm="96" data-tone="funk"></div>
<p><b>Reggae:</b> short chord “skanks” on the offbeats (the “&” of each beat), choked right after.</p>
<div data-tabc="- G7+B8+e7 - G7+B8+e7 - G7+B8+e7 - G7+B8+e7" data-key="7" data-scale="ionian" data-title="Reggae skank on G" data-bpm="76" data-tone="funk"></div>
<p><b>Country:</b> bass note on the beat, chord on the offbeat (“boom-chicka”), alternating root and 5th.</p>
<div data-tabc="E3 D0+G0+B0 A5 D0+G0+B0 E3 D0+G0+B0 A5 D0+G0+B0" data-key="7" data-scale="ionian" data-title="Boom-chicka on G" data-bpm="120" data-tone="clean"></div>
<p><b>Shuffle:</b> the swung boogie from the 12-bar lesson.</p>
<button class="btn jam" data-jam='{"prog":"funk_vamp","key":4,"style":"funk","scale":"pentatonic_minor","bpm":100}'>▶ Jam: funk on E9</button>
<button class="btn jam" data-jam='{"prog":"reggae_one","key":7,"style":"reggae","scale":"pentatonic_major","bpm":76}'>▶ Jam: reggae in G</button>
<div class="ptip">Mute the Rhythm Gtr channel in the Jam mixer and play the rhythm part yourself.</div>
<div data-quiz='[{"q":"Where does the reggae skank fall?","a":["On the offbeats","On beats 1 and 3","Only on beat 1"],"c":0},{"q":"What keeps your strumming in time through rests?","a":["Keeping the hand moving","Stopping between chords","Strumming harder"],"c":0}]'></div>`);

/* ═══════════════════════ ADVANCED ═══════════════════════ */

L('Advanced', 'chord-scale', 'Chord-Scale Theory: Changing Scales with the Chords', 22,
  'When one scale works for a whole song, when it doesn’t, and how to switch scales smoothly as chords change.',
`<h2>Chord-Scale Theory: Changing Scales with the Chords</h2>
<p>Over a simple song, one scale covers everything. Over richer harmony, the “right” notes change from chord to chord. Chord-scale theory gives each chord a matching scale, and the skill is moving between them smoothly.</p>
<h3>Approach 1: one key scale</h3>
<p>If every chord belongs to one key, the key’s scale fits all of them. Over G – D – Em – C, G major (or E minor pentatonic) works throughout. Simple, melodic, and how most rock and pop is played.</p>
<h3>Approach 2: a scale for each chord</h3>
<p>Each chord gets a scale built on its own root. For diatonic chords, this is just the key scale started from a different note:</p>
<table class="ltable">
<tr><th>Chord in C</th><th>Chord scale</th><th>Same notes as</th></tr>
<tr><td>Cmaj7 (I)</td><td>C Ionian</td><td>C major</td></tr>
<tr><td>Dm7 (ii)</td><td>D Dorian</td><td>C major</td></tr>
<tr><td>Em7 (iii)</td><td>E Phrygian</td><td>C major</td></tr>
<tr><td>Fmaj7 (IV)</td><td>F Lydian</td><td>C major</td></tr>
<tr><td>G7 (V)</td><td>G Mixolydian</td><td>C major</td></tr>
<tr><td>Am7 (vi)</td><td>A Aeolian</td><td>C major</td></tr>
</table>
<p>The notes don’t change; your center does. Thinking “D Dorian” over Dm7 makes you lean on D, F, A and C (its chord tones) instead of wandering.</p>
<h3>When the notes really change</h3>
<p>Chords from outside the key bring new notes. That’s where a single scale fails and switching matters:</p>
<ul>
<li><b>Secondary dominants</b> (like B7 in G major, the V of Em) add a raised note (D♯). Use Phrygian dominant or Mixolydian on the chord’s root.</li>
<li><b>Borrowed chords</b> (like Cm in G major) come from the parallel minor. Use the mode of the parallel minor: C Dorian.</li>
<li><b>Non-resolving dominants</b> (♭VII7, ♭VI7, II7) want Lydian dominant.</li>
</ul>
<h3>Example: G – B – C – Cm</h3>
<table class="ltable">
<tr><th>Chord</th><th>Scale</th><th>What changed</th></tr>
<tr><td>G</td><td>G Ionian</td><td>Home</td></tr>
<tr><td>B</td><td>B Phrygian dominant</td><td>D becomes D♯ (the 3rd of B)</td></tr>
<tr><td>C</td><td>C Lydian</td><td>Back to G major notes</td></tr>
<tr><td>Cm</td><td>C Dorian</td><td>E becomes E♭ (the 3rd of Cm)</td></tr>
</table>
<p>Usually only <b>one or two notes</b> change between scales. Find those notes; they are the sound of the progression. Everything else stays the same.</p>
<button class="btn jam" data-jam='{"prog":"modal_mix","key":7,"style":"ballad","scale":"ionian","bpm":84,"follow":"chord"}'>▶ Jam: G – B – C – Cm with chord scales</button>
<h3>Guide-tone lines</h3>
<p>Connect the 3rds and 7ths of each chord, moving by the smallest step. In a ii–V–I, the 7th of each chord falls a half step to the 3rd of the next.</p>
<div data-tabc="D3+G5:4 | D3+G4:4 | D2+G4:4" data-key="0" data-scale="ionian" data-title="Guide tones: Dm7 → G7 → Cmaj7" data-bpm="70" data-tone="jazz" data-caption="F and C (Dm7) → F and B (G7) → E and B (Cmaj7). One note moves at a time."></div>
<h3>How AXELAB shows it</h3>
<p>In the Jam tab, set <b>Scale follows: Each chord</b>. The fretboard re-centers on every chord’s scale, rings the chord tones, and outlines the next chord’s notes just before the change so you can aim for them. Set it back to <b>Key</b> to hear the one-scale approach over the same progression.</p>
<div data-quiz='[{"q":"Over Dm7 in the key of C, which chord scale has the same notes as C major?","a":["D Dorian","D Aeolian","D Phrygian"],"c":0},{"q":"Over B major in the key of G, which note changes?","a":["D becomes D♯","G becomes G♯","C becomes C♯"],"c":0},{"q":"What connects in a guide-tone line?","a":["3rds and 7ths","Roots and 5ths","Only roots"],"c":0}]'></div>`);

L('Advanced', 'melodic-minor', 'Melodic Minor & Its Modes', 18,
  'Lydian dominant, altered, Locrian ♮2: the modern jazz and fusion palette.',
`<h2>Melodic Minor & Its Modes</h2>
<p>Melodic minor is the major scale with a ♭3: <b>1 2 ♭3 4 5 6 7</b>. (Jazz players use the same notes ascending and descending.) Its modes produce some of the most useful sounds in modern harmony.</p>
<table class="ltable">
<tr><th>Mode</th><th>Formula</th><th>Use over</th></tr>
<tr><td>1. Melodic minor</td><td>1 2 ♭3 4 5 6 7</td><td>m6, m(maj7)</td></tr>
<tr><td>2. Dorian ♭2</td><td>1 ♭2 ♭3 4 5 6 ♭7</td><td>7sus♭9</td></tr>
<tr><td>3. Lydian augmented</td><td>1 2 3 ♯4 ♯5 6 7</td><td>maj7♯5</td></tr>
<tr><td>4. Lydian dominant</td><td>1 2 3 ♯4 5 6 ♭7</td><td>Non-resolving 7th chords, 7♯11</td></tr>
<tr><td>5. Mixolydian ♭6</td><td>1 2 3 4 5 ♭6 ♭7</td><td>7♭13</td></tr>
<tr><td>6. Locrian ♮2</td><td>1 2 ♭3 4 ♭5 ♭6 ♭7</td><td>m7♭5</td></tr>
<tr><td>7. Altered</td><td>1 ♭9 ♯9 3 ♭5 ♯5 ♭7</td><td>V7 resolving (7alt)</td></tr>
</table>
<h3>Two shortcuts</h3>
<ul>
<li><b>Altered</b> on G = A♭ melodic minor (a half step above the root).</li>
<li><b>Lydian dominant</b> on D = A melodic minor (a 5th above the root).</li>
</ul>
<p>So one fingering (melodic minor) covers both, depending on where you start it.</p>
<h3>Altered line resolving</h3>
<div data-tabc="e7 e4 B6 B4 G6 G3 G4 | G5:4" data-key="8" data-scale="melodic_minor" data-allow="0" data-title="G7alt → C" data-bpm="90" data-tone="jazz" data-caption="B, A♭, F, E♭, D♭, B♭, B… then resolve up to C."></div>
<div data-neck='{"key":2,"scale":"lydian_dominant","pos":0,"labels":"degrees"}'></div>
<p class="cap">D Lydian dominant: Mixolydian with a ♯4 (G♯). Over D7 that doesn’t resolve, the ♯11 sounds open and modern.</p>
<button class="btn jam" data-jam='{"prog":"bossa","key":5,"style":"bossa","scale":"ionian","bpm":130,"follow":"chord"}'>▶ Jam: bossa with a Lydian dominant II7</button>
<button class="btn jam" data-jam='{"prog":"ii_V_i","key":2,"style":"jazz_swing","scale":"harmonic_minor","bpm":120,"follow":"chord"}'>▶ Jam: minor ii–V–i</button>
<div data-quiz='[{"q":"Which melodic minor gives you G altered?","a":["A♭ melodic minor","G melodic minor","D melodic minor"],"c":0},{"q":"Lydian dominant is best over…","a":["Dominant chords that don’t resolve down a 5th","Minor chords","Diminished chords"],"c":0}]'></div>`);

L('Advanced', 'symmetric', 'Diminished & Whole-Tone Scales', 15,
  'Scales that repeat every few frets: tension tools for dominant, diminished and augmented chords.',
`<h2>Diminished & Whole-Tone Scales</h2>
<p>Symmetric scales repeat at a fixed interval, so one pattern moves around the neck by a fixed distance and stays the same scale.</p>
<h3>Diminished (8 notes)</h3>
<ul>
<li><b>Half-whole</b> (H-W-H-W…): over dominant 7♭9 chords. G half-whole: G A♭ B♭ B C♯ D E F.</li>
<li><b>Whole-half</b> (W-H-W-H…): over diminished 7th chords.</li>
<li>Both repeat every minor 3rd (3 frets). Any lick works moved up or down 3 frets.</li>
</ul>
<div data-tabc="E3 E4 E6 E7 E9 E10 E12 E13:3" data-key="7" data-scale="diminished_hw" data-title="G half-whole on one string" data-bpm="80" data-tone="lead"></div>
<h3>Whole tone (6 notes)</h3>
<p>Only whole steps: 1 2 3 ♯4 ♯5 ♭7. It repeats every whole step, so there are only two whole-tone scales. Use it over augmented chords and 7♯5. It sounds dreamlike and unresolved.</p>
<div data-tabc="A3 A5 A7 D4 D6 D8 G5:3" data-key="0" data-scale="whole_tone" data-title="C whole tone" data-bpm="80" data-tone="clean"></div>
<h3>Diminished 7th arpeggios</h3>
<p>A dim7 chord stacks minor 3rds, so its shape repeats every 3 frets: four inversions of the same chord. Neoclassical players sweep these up the neck.</p>
<div class="ptip">Over a V7 chord, play a diminished 7th arpeggio a half step above the root (A♭°7 over G7) for an instant 7♭9 sound.</div>
<button class="btn jam" data-jam='{"prog":"jazz_blues","key":5,"style":"jazz_swing","scale":"bebop_dominant","bpm":130,"follow":"chord"}'>▶ Jam: jazz blues (watch the B°7)</button>
<div data-quiz='[{"q":"How often does the diminished scale repeat?","a":["Every 3 frets","Every 2 frets","Every 5 frets"],"c":0},{"q":"How many different whole-tone scales are there?","a":["2","12","6"],"c":0}]'></div>`);

L('Advanced', 'borrowed', 'Borrowed Chords & Modal Interchange', 15,
  'Darken a major key with chords from its parallel minor, and know what to play over them.',
`<h2>Borrowed Chords & Modal Interchange</h2>
<p>A song in G major can borrow chords from G minor (its <b>parallel</b> minor). These borrowed chords add drama, nostalgia and surprise.</p>
<h3>The usual suspects (in C major)</h3>
<table class="ltable">
<tr><th>Borrowed chord</th><th>In C</th><th>Sound</th><th>Scale over it</th></tr>
<tr><td>iv</td><td>Fm</td><td>Bittersweet, nostalgic</td><td>F Dorian</td></tr>
<tr><td>♭VII</td><td>B♭</td><td>Rock, heroic</td><td>B♭ Mixolydian</td></tr>
<tr><td>♭VI</td><td>A♭</td><td>Cinematic, epic</td><td>A♭ Lydian</td></tr>
<tr><td>♭III</td><td>E♭</td><td>Bold</td><td>E♭ Ionian</td></tr>
<tr><td>ii°</td><td>D°</td><td>Dark predominant</td><td>D Locrian</td></tr>
</table>
<p>Each of those scales has the notes of C natural minor. So the easy rule: <b>over a borrowed chord, switch to the parallel minor</b>. Then come back to major.</p>
<h3>Picardy third</h3>
<p>The reverse: ending a minor-key piece on a major I chord. Bach did it constantly.</p>
<button class="btn jam" data-jam='{"prog":"mario","key":0,"style":"rock","scale":"ionian","bpm":120,"follow":"chord"}'>▶ Jam: C – A♭ – B♭ – C</button>
<button class="btn jam" data-jam='{"prog":"modal_mix","key":7,"style":"ballad","scale":"ionian","bpm":84,"follow":"chord"}'>▶ Jam: G – B – C – Cm</button>
<div data-quiz='[{"q":"Where do borrowed chords usually come from?","a":["The parallel minor","The relative minor","The dominant key"],"c":0},{"q":"What scale fits the iv chord (Fm) in C major?","a":["F Dorian","F Lydian","F Ionian"],"c":0}]'></div>`);

L('Advanced', 'secondary', 'Secondary Dominants & Tritone Substitution', 15,
  'Dominant chords that point at other chords, and the jazz trick of replacing them.',
`<h2>Secondary Dominants & Tritone Substitution</h2>
<h3>Secondary dominants</h3>
<p>Any major or minor chord in a key can have its own V7 that leads into it. In C major:</p>
<table class="ltable">
<tr><th>Target</th><th>Its V7</th><th>Notation</th><th>New note</th></tr>
<tr><td>Dm (ii)</td><td>A7</td><td>V7/ii</td><td>C♯</td></tr>
<tr><td>Em (iii)</td><td>B7</td><td>V7/iii</td><td>D♯, F♯</td></tr>
<tr><td>F (IV)</td><td>C7</td><td>V7/IV</td><td>B♭</td></tr>
<tr><td>G (V)</td><td>D7</td><td>V7/V</td><td>F♯</td></tr>
<tr><td>Am (vi)</td><td>E7</td><td>V7/vi</td><td>G♯</td></tr>
</table>
<p>Over a secondary dominant that resolves to a <b>minor</b> chord, use <b>Phrygian dominant</b> (E7 → Am: E Phrygian dominant). If it resolves to a <b>major</b> chord, use <b>Mixolydian</b> (D7 → G: D Mixolydian). The new note is the leading tone of the target: aim it into the next chord.</p>
<h3>Tritone substitution</h3>
<p>G7 (G B D F) and D♭7 (D♭ F A♭ C♭) share the same 3rd and 7th: B and F. So D♭7 can replace G7, and the bass moves down by half step into C: Dm7 – D♭7 – Cmaj7.</p>
<p>Over the sub chord, use Lydian dominant from its root.</p>
<h3>Backdoor ii–V</h3>
<p>Fm7 – B♭7 – Cmaj7 resolves to C from a whole step below. B♭7 is the ♭VII7, borrowed from the parallel minor.</p>
<button class="btn jam" data-jam='{"prog":"rhythm","key":10,"style":"jazz_swing","scale":"ionian","bpm":150,"follow":"chord"}'>▶ Jam: Rhythm changes (VI7 secondary dominant)</button>
<button class="btn jam" data-jam='{"prog":"bossa","key":5,"style":"bossa","scale":"ionian","bpm":130,"follow":"chord"}'>▶ Jam: bossa with a tritone sub</button>
<div data-quiz='[{"q":"What is V7/vi in C major?","a":["E7","A7","D7"],"c":0},{"q":"Which notes do G7 and D♭7 share?","a":["B (C♭) and F","G and D♭","D and A♭"],"c":0}]'></div>`);

L('Advanced', 'outside', 'Outside Playing & Superimposition', 15,
  'Controlled tension: side-slipping, pentatonic superimposition and how to come back in.',
`<h2>Outside Playing & Superimposition</h2>
<p>Playing “outside” means stepping off the chord on purpose and then resolving. Done well it sounds intentional and exciting. The rule: <b>tension needs release</b>.</p>
<h3>Pentatonic superimposition</h3>
<p>Over one chord, play pentatonics from different roots to emphasize different color tones. Over Am7:</p>
<ul>
<li><b>A minor pentatonic:</b> home base (A C D E G).</li>
<li><b>E minor pentatonic:</b> brings in B (the 9th): E G A B D.</li>
<li><b>B minor pentatonic:</b> brings in B and F♯ (9th and 6th): a Dorian color.</li>
</ul>
<h3>Side-slipping</h3>
<p>Play a lick, repeat it a half step up (outside), then return. The brain hears the shape and accepts the detour.</p>
<div data-tabc="B8 B5 G7 G5:2 | B9 B6 G8 G6:2 | B8 B5 G7 G5:4" data-key="9" data-scale="pentatonic_minor" data-allow="8,5,3,1" data-title="In, out a half step, back in" data-bpm="90" data-tone="lead"></div>
<h3>Making it work</h3>
<ul>
<li>Use strong, recognizable shapes outside: arpeggios, pentatonic patterns.</li>
<li>Keep the rhythm confident. Hesitation sounds like a mistake.</li>
<li>Resolve to a chord tone on a strong beat.</li>
</ul>
<button class="btn jam" data-jam='{"prog":"dorian_vamp","key":9,"style":"funk","scale":"dorian","bpm":100}'>▶ Jam: A Dorian vamp</button>
<div data-quiz='[{"q":"What must outside playing do to sound intentional?","a":["Resolve back to the harmony","Stay outside","Be very fast"],"c":0}]'></div>`);

L('Advanced', 'speed', 'Building Speed the Right Way', 15,
  'How motor learning works and a method that raises your top tempo without tension.',
`<h2>Building Speed the Right Way</h2>
<p>Speed is a side effect of accuracy, relaxation and efficient motion. Practicing fast and sloppy trains fast, sloppy playing.</p>
<h3>How skills form</h3>
<p>Your brain builds motor programs from repetition, and it stores whatever you repeat, mistakes included. Slow, correct repetitions build the right program; sleep consolidates it. That’s why something impossible at night often works the next morning.</p>
<h3>The method</h3>
<ol>
<li><b>Baseline:</b> the tempo where you can play the passage perfectly three times in a row.</li>
<li><b>Work zone:</b> practice a few bpm above baseline until it’s clean, then raise 4 to 8 bpm.</li>
<li><b>Bursts:</b> play a short fragment (4 to 6 notes) much faster than you can play the whole thing, then stop. Speed comes in short packets first.</li>
<li><b>Chunking:</b> split long lines into groups and connect them later.</li>
<li><b>Sync:</b> the hard part is the hands lining up. Exaggerate accents to lock them together.</li>
<li><b>Tension check:</b> every few minutes, drop your shoulders, loosen your thumb.</li>
<li><b>Stop while it’s good.</b> End on clean repetitions.</li>
</ol>
<div data-tabc="e8 e7 e5 B8 B6 B5 e8 e7 e5 B8 B6 B5:4" data-key="9" data-scale="aeolian" data-title="Six-note burst" data-bpm="100" data-tone="lead"></div>
<div class="ptip">Use <b>Tools → Metronome → Speed trainer</b> to raise the tempo automatically every few bars, and log your clean tempo in <b>Practice</b>.</div>
<div data-quiz='[{"q":"What is your true current speed?","a":["The tempo you can play perfectly three times in a row","Your fastest attempt","The song’s tempo"],"c":0}]'></div>`);

L('Advanced', 'odd-meters', 'Odd Meters & Polyrhythms', 12,
  'Feel 5/4, 7/8 and three-over-four without losing your place.',
`<h2>Odd Meters & Polyrhythms</h2>
<p>Odd meters are just groups of 2 and 3. Count the groups, accent their first notes, and they flow.</p>
<h3>Common groupings</h3>
<ul>
<li><b>5/4:</b> 3 + 2 (Take Five) or 2 + 3.</li>
<li><b>7/8:</b> 2 + 2 + 3, or 4 + 3. Count “1-2 1-2 1-2-3”.</li>
<li><b>7/4:</b> 4 + 3 (Money by Pink Floyd).</li>
</ul>
<div data-tabc="E0 E0 E3 E0 E5 E0 E3 | E0 E0 E3 E0 E5 E7 E5 |" data-key="4" data-scale="aeolian" data-title="7/8 riff in E (2+2+3)" data-bpm="140" data-tone="metal"></div>
<h3>Three over four</h3>
<p>Play a 3-note pattern in straight 16ths: it repeats every three 16ths, cutting across the 4-note beat. Djent and progressive metal live here.</p>
<div data-tabc="E0 E3 E5 E0 E3 E5 E0 E3 E5 E0 E3 E5 E0 E3 E5 E0" data-key="4" data-scale="pentatonic_minor" data-title="3-note figure in 16ths (lands on 1 every three beats)" data-bpm="90" data-tone="metal"></div>
<div class="ptip">Set the metronome to 5/4 or 7/8 in <b>Tools</b> and say the groups out loud while you play.</div>
<div data-quiz='[{"q":"A common grouping of 7/8 is…","a":["2+2+3","3+3+3","4+4"],"c":0}]'></div>`);

L('Advanced', 'practice-system', 'Your Practice System', 10,
  'A weekly structure that balances technique, vocabulary, ear and real playing.',
`<h2>Your Practice System</h2>
<p>Random practice gives random results. A simple structure gets you further in less time.</p>
<h3>A 45-minute session</h3>
<table class="ltable">
<tr><th>Minutes</th><th>Block</th><th>In AXELAB</th></tr>
<tr><td>5</td><td>Warm-up: chromatic, slides, stretches</td><td>Technique → Alternate Picking</td></tr>
<tr><td>10</td><td>Technique focus (one per week)</td><td>Technique library</td></tr>
<tr><td>10</td><td>Vocabulary: one lick in three keys</td><td>Artists</td></tr>
<tr><td>10</td><td>Application: improvise over a backing track</td><td>Jam</td></tr>
<tr><td>5</td><td>Ear training</td><td>Ear</td></tr>
<tr><td>5</td><td>Review and log</td><td>Practice</td></tr>
</table>
<h3>Principles</h3>
<ul>
<li><b>One goal per week.</b> Write it down: “Box 2 of A minor pentatonic at 100 bpm.”</li>
<li><b>Record yourself</b> once a week and listen like a stranger would.</li>
<li><b>Apply everything.</b> A lick you never use over a backing track isn’t yours yet.</li>
<li><b>Rotate keys.</b> Turn on key cycling in the Jam song settings to practice in all 12 keys.</li>
<li><b>Rest.</b> Short daily sessions beat one long weekly session.</li>
</ul>
<div class="ptip">The <b>Practice</b> tab builds a timed routine from these blocks and logs your minutes and streak.</div>`);

if (typeof module !== 'undefined') module.exports = LESSONS;
