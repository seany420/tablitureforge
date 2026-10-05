// End-to-end smoke test. Run: npx http-server -p 8765 . & node tests/e2e.js
// Requires Playwright (preinstalled in many CI images). Exits non-zero on any page error.
const { chromium } = require('playwright');
const OUT = process.env.SHOTS || null;
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR ' + e.message + ' ' + (e.stack || '').split('\n')[1]));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts|Failed to load resource/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  const base = process.env.BASE || 'http://localhost:8765/index.html';
  await page.goto(base);
  await page.waitForTimeout(500);
  const log = (...a) => console.log(...a);

  // 1. Every band style plays and every expected instrument makes sound
  const styles = await page.evaluate(() => Object.keys(Band.STYLES));
  await page.click('#tpPlay'); await page.waitForTimeout(400); await page.click('#tpPlay');
  for (const st of styles) {
    await page.evaluate((st) => { document.querySelector('#panel-jam select[aria-label="Style"]').value = st; document.querySelector('#panel-jam select[aria-label="Style"]').dispatchEvent(new Event('change')); App.state.countIn = false; Band.state.countIn = false; }, st);
    await page.click('#tpPlay');
    const peaks = await page.evaluate(async () => {
      const p = { drums: 0, bass: 0, gtr: 0, keys: 0 };
      for (let i = 0; i < 40; i++) { await new Promise(r => setTimeout(r, 50)); Object.keys(p).forEach(k => { p[k] = Math.max(p[k], Sound.level(k)); }); }
      return p;
    });
    await page.click('#tpPlay');
    const st2 = await page.evaluate((s) => ({ keys: !!Band.STYLES[s].keys, gtr: !!Band.STYLES[s].gtr }), st);
    const silent = ['drums', 'bass'].filter(k => peaks[k] < 0.005).concat(st2.gtr && peaks.gtr < 0.003 ? ['gtr'] : []).concat(st2.keys && peaks.keys < 0.002 ? ['keys'] : []);
    log('style', st.padEnd(14), Object.entries(peaks).map(([k, v]) => k + '=' + v.toFixed(3)).join(' '), silent.length ? 'SILENT: ' + silent : '');
    if (silent.length) errors.push('Silent instruments in ' + st + ': ' + silent);
    if (Object.values(peaks).some(v => v > 1.2)) errors.push('Clipping channel in ' + st);
  }

  // 2. Chord-scale following changes the displayed scale on chord changes
  await page.evaluate(() => App.loadJam({ prog: 'ii_V_I', key: 0, style: 'jazz_swing', scale: 'ionian', bpm: 240, follow: 'chord' }, false));
  await page.evaluate(() => { Band.state.countIn = false; });
  await page.click('#tpPlay');
  const seen = new Set();
  for (let i = 0; i < 40; i++) { await page.waitForTimeout(100); seen.add(await page.textContent('.now-scale')); }
  await page.click('#tpPlay');
  log('chord-scale stage showed:', [...seen].join(' | '));
  if (seen.size < 3) errors.push('Stage did not follow chord scales');

  // 3. Lessons: open each, upgrade widgets, play first tab
  await page.click('.ni[data-panel="learn"]');
  const nLessons = await page.evaluate(() => LESSONS.length);
  for (let i = 0; i < nLessons; i++) {
    await page.evaluate((i) => LearnPanel.openLesson(LESSONS[i].id), i);
    await page.waitForTimeout(60);
    const w = await page.evaluate(() => ({ tabs: document.querySelectorAll('.lcont .tabw').length, necks: document.querySelectorAll('.lcont .neckw').length, chords: document.querySelectorAll('.lcont .chordtile').length, raw: document.querySelectorAll('.lcont .tab-raw').length }));
    if (w.raw) errors.push('Lesson ' + i + ' has an unparsed tab');
  }
  await page.evaluate(() => LearnPanel.openLesson('pent-minor'));
  await page.click('.lcont .tabw .tab-btn.primary');
  await page.waitForTimeout(1500);
  const hl = await page.evaluate(() => document.querySelectorAll('.tab-note.on').length);
  log('tab playback highlighted notes:', hl);
  if (!hl) errors.push('Tab playback did not highlight');
  await page.evaluate(() => Tab.stop());
  for (const sub of ['techniques', 'artists', 'glossary']) {
    await page.evaluate((s) => LearnPanel.openTab(s), sub);
    await page.waitForTimeout(100);
    const heads = await page.$$('.xhead');
    for (const hd of heads) await hd.click();
    await page.waitForTimeout(100);
    const n = await page.evaluate(() => ({ tabs: document.querySelectorAll('#panel-learn .tabw').length, raw: document.querySelectorAll('#panel-learn .tab-raw').length }));
    log(sub, 'tabs rendered:', n.tabs);
    if (n.raw) errors.push(sub + ' has unparsed tabs');
  }

  // 4. Neck: every scale and position
  await page.click('.ni[data-panel="neck"]');
  const res = await page.evaluate(() => {
    let n = 0;
    Object.keys(Theory.SCALES).forEach(id => { for (let k = 0; k < 12; k += 5) { NeckPanel.open({ key: k, scale: id }); Guitar.positions(k, id).forEach((p, i) => { NeckPanel.open({ key: k, scale: id, pos: i }); n++; }); } });
    return n;
  });
  log('neck positions rendered:', res);

  // 5. Theory sub-pages
  await page.click('.ni[data-panel="theory"]');
  for (const s of ['scales', 'chords', 'harmony', 'circle', 'intervals', 'modes']) { await page.evaluate((s) => App.show('theory', s), s); await page.waitForTimeout(80); }
  await page.evaluate(() => App.show('theory', 'circle'));
  await page.click('.cof-seg');
  await page.evaluate(() => App.show('theory', 'chords'));
  const qs = await page.evaluate(() => Object.keys(Theory.CHORDS));
  for (const q of qs) await page.evaluate((q) => { const s = document.querySelector('select[aria-label="Chord quality"]'); s.value = q; s.dispatchEvent(new Event('change')); }, q);

  // 6. Ear modes: answer once each
  await page.click('.ni[data-panel="ear"]');
  for (const m of ['intervals', 'chords', 'scales', 'degrees', 'fretboard']) {
    await page.evaluate((m) => App.show('ear', m), m);
    await page.waitForTimeout(150);
    await page.click('.ear-ans button');
  }

  // 7. Tools
  await page.click('.ni[data-panel="tools"]');
  for (const s of ['metronome', 'tuner', 'riff', 'practice']) { await page.evaluate((s) => App.show('tools', s), s); await page.waitForTimeout(100); }
  await page.evaluate(() => App.show('tools', 'metronome'));
  await page.click('#panel-tools button:text-is("Start")'); await page.waitForTimeout(700); await page.click('#panel-tools button:text-is("Stop")');
  await page.evaluate(() => App.show('tools', 'riff'));
  await page.click('#panel-tools button:text-is("Example")'); await page.waitForTimeout(200);
  const fits = await page.evaluate(() => document.querySelectorAll('.badge').length);
  log('riff lab results:', fits);

  if (OUT) {
    await page.evaluate(() => App.show('jam'));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: OUT + '/mobile-jam.png', fullPage: true });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.evaluate(() => App.redrawNecks());
    await page.evaluate(() => App.show('neck'));
    await page.waitForTimeout(300);
    await page.screenshot({ path: OUT + '/mobile-neck-dark.png' });
  }
  console.log(errors.length ? errors.join('\n') : 'E2E OK: no errors');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
