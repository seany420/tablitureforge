// Verifies every lick and tab in the content files: parses, and notes fit the declared scale.
const { root, loadGlobal } = require('./load.js');
const path = require('path');
const T = Theory, G = Guitar;
let fails = 0, checked = 0;
function check(label, tabc, key, scaleId, allow, tuningId) {
  checked++;
  const tuning = tuningId ? G.TUNINGS[tuningId].midi : G.STD;
  let notes;
  try { notes = Tab.compactNotes(tabc, tuning); Tab.parse(Tab.fromCompact(tabc, tuning)); }
  catch (e) { console.log('PARSE FAIL', label, e.message); fails++; return; }
  if (!scaleId) return;
  const pcs = T.scalePcs(key, scaleId);
  const bad = notes.filter(n => pcs.indexOf(n.midi % 12) < 0 && (allow || []).indexOf(n.midi % 12) < 0);
  if (bad.length) {
    fails++;
    console.log('OUT OF SCALE', label, '·', T.rootName(key, scaleId), scaleId, '→', bad.map(n => 'string' + n.s + ' fret' + n.f + '=' + T.SHARPS[n.midi % 12]).join(', '));
  }
}
const ARTISTS = require(path.join(root, 'js/content/artists.js'));
ARTISTS.forEach(a => a.licks.forEach(l => check(a.n + ': ' + l.lbl, l.tabc, l.key, l.scale, l.allow, l.tuning)));
['techniques', 'lessons', 'routines'].forEach(name => {
  let data;
  try { data = require(path.join(root, 'js/content/' + name + '.js')); } catch (e) { if (e.code === 'MODULE_NOT_FOUND') return; throw e; }
  (Array.isArray(data) ? data : data.list || []).forEach(item => {
    (item.tabs || item.licks || []).forEach(t => check((item.n || item.title || item.t) + ': ' + t.lbl, t.tabc, t.key, t.scale, t.allow, t.tuning));
    if (item.tabc && item.scaleId) check('Daily: ' + item.t, item.tabc, item.key, item.scaleId, item.allow);
    const html = item.html || '';
    const re = /data-tabc="([^"]+)"(?:[^>]*?data-key="(\d+)")?(?:[^>]*?data-scale="([a-z_]+)")?(?:[^>]*?data-allow="([\d,]+)")?/g;
    let m;
    while ((m = re.exec(html))) check((item.title || item.n) + ' (inline)', m[1].replace(/&gt;/g, '>').replace(/&lt;/g, '<'), m[2] !== undefined ? +m[2] : null, m[3], m[4] ? m[4].split(',').map(Number) : []);
  });
});
// Progressions resolve and every chord gets a scale
T.PROGRESSIONS.forEach(p => {
  for (let k = 0; k < 12; k++) {
    const r = T.resolveProgression(p.steps, k, p.mode);
    r.chords.forEach(c => { if (!c.scales.length) { fails++; console.log('NO SCALE', p.id, c.symbol); } });
  }
});
console.log(checked + ' tabs checked, ' + fails + ' problems');
process.exit(fails ? 1 : 0);
