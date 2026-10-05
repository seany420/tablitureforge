/* AXELAB · Learn: lessons, techniques, artists, glossary. */
const LearnPanel = (function () {
  'use strict';
  const T = Theory, h = UI.h;
  let root, body, sub = 'lessons', curLesson = null;
  const done = new Set(UI.store.get('lessonsDone', []));
  const LEVELS = ['Foundations', 'Intermediate', 'Advanced'];

  function subnav() {
    const nav = h('div.subnav', { role: 'tablist' });
    [['lessons', 'Lessons'], ['techniques', 'Techniques'], ['artists', 'Artists'], ['glossary', 'Glossary']].forEach(function (s) {
      const b = h('button', { type: 'button', role: 'tab', text: s[1] });
      b.classList.toggle('on', s[0] === sub);
      b.addEventListener('click', function () { go(s[0]); });
      nav.appendChild(b);
    });
    return nav;
  }
  function go(s, arg) {
    sub = s;
    root.innerHTML = '';
    root.appendChild(subnav());
    body = h('div');
    root.appendChild(body);
    ({ lessons: lessons, techniques: techniques, artists: artists, glossary: glossary })[s](arg);
    try { history.replaceState(null, '', '#learn/' + s + (arg ? '/' + arg : '')); } catch (e) { /* ignore */ }
  }

  /* ── Lessons ──────────────────────────────────────── */
  function lessons(id) {
    const nav = h('div.lnav.card');
    const search = h('input.lsearch', { type: 'search', placeholder: 'Search lessons…', 'aria-label': 'Search lessons' });
    const list = h('div');
    const prog = h('div.lprogress', h('div'));
    const progTxt = h('div.small.muted');
    nav.appendChild(search); nav.appendChild(progTxt); nav.appendChild(prog); nav.appendChild(list);
    const content = h('article.card.lcont');
    body.appendChild(h('div.learn-wrap', nav, content));
    function drawList() {
      const q = search.value.trim().toLowerCase();
      list.innerHTML = '';
      LEVELS.forEach(function (lv) {
        const items = LESSONS.filter(function (l) { return l.level === lv && (!q || (l.title + ' ' + l.summary + ' ' + l.html).toLowerCase().indexOf(q) >= 0); });
        if (!items.length) return;
        list.appendChild(h('h4', lv));
        items.forEach(function (l) {
          const b = h('button.lbtn' + (done.has(l.id) ? '.done' : '') + (curLesson === l.id ? '.active' : ''), { type: 'button' },
            h('span.chk', done.has(l.id) ? '✓' : ''), h('span', l.title), h('span.mins', l.mins + 'm'));
          b.addEventListener('click', function () { open(l.id); if (window.innerWidth < 900) content.scrollIntoView({ behavior: 'smooth' }); });
          list.appendChild(b);
        });
      });
      const pct = Math.round(done.size / LESSONS.length * 100);
      prog.firstChild.style.width = pct + '%';
      progTxt.textContent = done.size + ' of ' + LESSONS.length + ' lessons complete';
    }
    function open(lid) {
      const i = LESSONS.findIndex(function (l) { return l.id === lid; });
      const l = LESSONS[i < 0 ? 0 : i];
      curLesson = l.id;
      UI.store.set('lastLesson', l.id);
      Tab.stop();
      content.innerHTML = '';
      content.appendChild(h('div.lmeta', l.level + ' · ' + l.mins + ' min · ' + l.summary));
      const div = h('div', { html: l.html });
      content.appendChild(div);
      App.upgrade(div);
      const prev = LESSONS[i - 1], next = LESSONS[i + 1];
      const mark = h('button.btn' + (done.has(l.id) ? '' : '.primary'), { type: 'button', text: done.has(l.id) ? '✓ Completed' : 'Mark complete' });
      mark.addEventListener('click', function () {
        if (done.has(l.id)) done.delete(l.id); else done.add(l.id);
        UI.store.set('lessonsDone', Array.from(done));
        mark.textContent = done.has(l.id) ? '✓ Completed' : 'Mark complete';
        mark.classList.toggle('primary', !done.has(l.id));
        drawList();
      });
      content.appendChild(h('div.lfoot',
        prev ? h('button.btn', { type: 'button', text: '← ' + prev.title, onclick: function () { open(prev.id); window.scrollTo({ top: 0, behavior: 'smooth' }); } }) : null,
        h('span.spacer'), mark,
        next ? h('button.btn', { type: 'button', text: next.title + ' →', onclick: function () { open(next.id); window.scrollTo({ top: 0, behavior: 'smooth' }); } }) : null));
      drawList();
      try { history.replaceState(null, '', '#learn/lessons/' + l.id); } catch (e) { /* ignore */ }
    }
    search.addEventListener('input', drawList);
    open(id || curLesson || UI.store.get('lastLesson', LESSONS[0].id));
  }

  /* ── Techniques ───────────────────────────────────── */
  function techniques() {
    let level = 'all', cat = 'all';
    const cats = ['all'].concat(TECHNIQUES.map(function (t) { return t.cat; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
    const listEl = h('div');
    const filters = h('div.filters',
      UI.seg([['all', 'All'], ['beg', 'Beginner'], ['int', 'Intermediate'], ['adv', 'Advanced']], level, function (v) { level = v; draw(); }),
      (function () { const s = UI.options(h('select', { 'aria-label': 'Category' }), cats.map(function (c) { return { value: c, label: c === 'all' ? 'All categories' : c }; }), cat); s.addEventListener('change', function () { cat = s.value; draw(); }); return s; })());
    body.appendChild(filters);
    body.appendChild(listEl);
    function draw() {
      listEl.innerHTML = '';
      TECHNIQUES.filter(function (t) { return (level === 'all' || t.d === level) && (cat === 'all' || t.cat === cat); }).forEach(function (t) {
        const lbl = { beg: 'Beginner', int: 'Intermediate', adv: 'Advanced' }[t.d];
        listEl.appendChild(expander(
          [h('div', h('div.xname', t.n), h('div.xsub', t.cat)), h('span.badge.b-' + t.d, { style: { marginLeft: 'auto' } }, lbl)],
          function (b) {
            b.appendChild(h('h5', 'What it is')); b.appendChild(h('p', t.desc));
            b.appendChild(h('h5', 'Why it matters')); b.appendChild(h('p', t.why));
            b.appendChild(h('h5', 'How to do it')); b.appendChild(h('ol', t.how.map(function (x) { return h('li', x); })));
            b.appendChild(h('h5', 'Common mistakes')); b.appendChild(h('ul', t.mistakes.map(function (x) { return h('li', x); })));
            b.appendChild(h('h5', 'Drills')); b.appendChild(h('ul', t.drills.map(function (x) { return h('li', x); })));
            b.appendChild(h('h5', 'Practice tabs'));
            t.tabs.forEach(function (tb) {
              const n = h('div'); b.appendChild(n);
              Tab.mount(n, Tab.fromCompact(tb.tabc), { title: tb.lbl, bpm: tb.bpm, tone: tb.tone, caption: tb.cap, neck: false });
            });
          }));
      });
    }
    draw();
  }

  function expander(head, fill) {
    const c = h('div.xcard');
    const btn = h('button.xhead', { type: 'button', 'aria-expanded': 'false' }, head, h('span.xchev', '▾'));
    const b = h('div.xbody');
    let filled = false;
    btn.addEventListener('click', function () {
      const open = !c.classList.contains('open');
      c.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open && !filled) { filled = true; fill(b); }
      if (!open) Tab.stop();
    });
    c.appendChild(btn); c.appendChild(b);
    return c;
  }

  /* ── Artists ──────────────────────────────────────── */
  function artists() {
    const search = h('input', { type: 'search', placeholder: 'Search artists, scales, techniques…', 'aria-label': 'Search artists', style: { width: '100%', maxWidth: '420px' } });
    const listEl = h('div');
    body.appendChild(h('div.filters', search));
    body.appendChild(listEl);
    function draw() {
      const q = search.value.trim().toLowerCase();
      listEl.innerHTML = '';
      ARTISTS.filter(function (a) { return !q || JSON.stringify(a).toLowerCase().indexOf(q) >= 0; }).forEach(function (a) {
        listEl.appendChild(expander([h('div.xico', a.ico), h('div', h('div.xname', a.n), h('div.xsub', a.b + ' · ' + a.st))], function (b) {
          b.appendChild(h('p', { style: { marginTop: '12px' } }, a.sig));
          b.appendChild(h('div.fields', { style: { marginTop: '10px' } },
            h('div', h('div.flabel', 'Era'), h('div', a.era)), h('div', h('div.flabel', 'Tuning'), h('div', a.tuning)),
            h('div', { style: { gridColumn: 'span 2' } }, h('div.flabel', 'Gear & tone'), h('div', a.gear))));
          b.appendChild(h('h5', 'Scales')); b.appendChild(h('div', a.scales.map(function (s) { return h('span.pill.sc', s); })));
          b.appendChild(h('h5', 'Techniques')); b.appendChild(h('div', a.techs.map(function (s) { return h('span.pill.tc', s); })));
          b.appendChild(h('h5', 'How to sound like ' + a.n.split(' ')[0])); b.appendChild(h('ul', a.tips.map(function (x) { return h('li', x); })));
          b.appendChild(h('h5', 'Songs to study')); b.appendChild(h('ul', a.listen.map(function (x) { return h('li', x); })));
          b.appendChild(h('h5', 'Licks in the style of ' + a.n));
          a.licks.forEach(function (l) {
            const n = h('div'); b.appendChild(n);
            const tun = l.tuning ? Guitar.TUNINGS[l.tuning].midi : undefined;
            Tab.mount(n, Tab.fromCompact(l.tabc, tun), { title: l.lbl + (l.tuning ? ' · ' + Guitar.TUNINGS[l.tuning].name : ''), bpm: l.bpm, tone: l.tone, caption: l.cap, tuning: tun });
          });
          const j = a.jam, p = T.progression(j.prog);
          b.appendChild(h('button.btn.jam', { type: 'button', text: '▶ Jam in this style: ' + p.name + ' in ' + T.pretty(T.rootName(j.key, p.mode)), onclick: function () { App.loadJam(j); } }));
        }));
      });
    }
    search.addEventListener('input', draw);
    draw();
  }

  /* ── Glossary ─────────────────────────────────────── */
  function glossary() {
    const search = h('input', { type: 'search', placeholder: 'Search terms…', 'aria-label': 'Search glossary', style: { width: '100%', maxWidth: '420px' } });
    const dl = h('dl.gloss');
    body.appendChild(h('div.filters', search));
    body.appendChild(UI.card(null, dl));
    function draw() {
      const q = search.value.trim().toLowerCase();
      dl.innerHTML = '';
      GLOSSARY.filter(function (g) { return !q || (g[0] + g[1]).toLowerCase().indexOf(q) >= 0; }).forEach(function (g) { dl.appendChild(h('dt', g[0])); dl.appendChild(h('dd', g[1])); });
    }
    search.addEventListener('input', draw);
    draw();
  }

  const mod = {
    build: function (r) { root = r; },
    shown: function (arg) {
      const parts = (location.hash || '').replace('#', '').split('/');
      const s = arg && ['lessons', 'techniques', 'artists', 'glossary'].indexOf(arg) >= 0 ? arg : sub;
      go(s, parts[0] === 'learn' && parts[1] === s ? parts[2] : undefined);
    },
    openLesson: function (id) { App.show('learn', 'lessons'); go('lessons', id); },
    openTab: function (s) { App.show('learn', s); }
  };
  App.register('learn', mod);
  return mod;
})();
