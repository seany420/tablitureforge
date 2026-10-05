/* AXELAB · Small DOM helpers, storage and shared widgets. */
const UI = (function () {
  'use strict';
  const T = Theory;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /** h('div.card#id', {onclick, style, data-x}, child, …) */
  function h(spec, attrs) {
    const m = /^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i.exec(spec) || [];
    const e = document.createElement(m[1] || 'div');
    (m[2] || '').replace(/([.#])([\w-]+)/g, function (_, t, v) { if (t === '.') e.classList.add(v); else e.id = v; });
    let kids = Array.prototype.slice.call(arguments, 1);
    if (attrs && typeof attrs === 'object' && !(attrs instanceof Node) && !Array.isArray(attrs)) {
      kids = kids.slice(1);
      Object.keys(attrs).forEach(function (k) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k.indexOf('on') === 0 && typeof v === 'function') e.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (k === 'html') e.innerHTML = v;
        else if (k === 'text') e.textContent = v;
        else if (k in e && k !== 'list' && typeof v !== 'string') e[k] = v;
        else e.setAttribute(k, v === true ? '' : v);
      });
    }
    append(e, kids);
    return e;
  }
  function append(e, kids) {
    kids.forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) append(e, c);
      else e.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
    });
  }

  /* ── Storage (guarded: private windows and blocked storage must not break the app) ── */
  const NS = 'axelab2.';
  const store = {
    get: function (k, d) { try { const v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };

  let toastT = null;
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = h('div#toast'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function options(sel, list, value) {
    sel.innerHTML = '';
    list.forEach(function (o) {
      if (o.group) {
        const g = h('optgroup', { label: o.group });
        o.items.forEach(function (it) { g.appendChild(h('option', { value: it.value, text: it.label })); });
        sel.appendChild(g);
      } else sel.appendChild(h('option', { value: o.value, text: o.label }));
    });
    if (value !== undefined) sel.value = String(value);
    return sel;
  }
  function rootSelect(value, onChange, cls) {
    const s = h('select' + (cls ? '.' + cls : ''), { 'aria-label': 'Key' });
    options(s, T.ROOT_CHOICES.map(function (r) { return { value: r.pc, label: r.label }; }), value);
    s.addEventListener('change', function () { onChange(+s.value); });
    return s;
  }
  function scaleSelect(value, onChange, suggest) {
    const s = h('select', { 'aria-label': 'Scale' });
    const groups = [];
    if (suggest && suggest.length) groups.push({ group: 'Suggested', items: suggest.map(function (id) { return { value: id, label: T.scale(id).name }; }) });
    T.SCALE_FAMILIES.forEach(function (f) {
      groups.push({ group: f, items: Object.keys(T.SCALES).filter(function (id) { return T.SCALES[id].fam === f; }).map(function (id) { return { value: id, label: T.SCALES[id].name }; }) });
    });
    options(s, groups, value);
    s.addEventListener('change', function () { onChange(s.value); });
    return s;
  }
  /** Segmented control. items: [[value, label], …] */
  function seg(items, value, onChange, cls) {
    const wrap = h('div.seg' + (cls ? '.' + cls : ''), { role: 'group' });
    items.forEach(function (it) {
      const b = h('button', { type: 'button', text: it[1], 'aria-pressed': String(it[0] === value), title: it[2] || '' });
      if (it[0] === value) b.classList.add('on');
      b.addEventListener('click', function () {
        $$('button', wrap).forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
        onChange(it[0]);
      });
      wrap.appendChild(b);
    });
    wrap.set = function (v) { $$('button', wrap).forEach(function (b, i) { const on = items[i][0] === v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }); };
    return wrap;
  }
  function toggle(label, value, onChange, title) {
    const b = h('button.tog', { type: 'button', text: label, title: title || '', 'aria-pressed': String(!!value) });
    if (value) b.classList.add('on');
    b.addEventListener('click', function () { const v = !b.classList.contains('on'); b.classList.toggle('on', v); b.setAttribute('aria-pressed', String(v)); onChange(v); });
    b.set = function (v) { b.classList.toggle('on', !!v); b.setAttribute('aria-pressed', String(!!v)); };
    return b;
  }
  function field(label, control, hint) {
    return h('label.field', h('span.flabel', label), control, hint ? h('span.fhint', hint) : null);
  }
  function card(title, body, opts) {
    opts = opts || {};
    const c = h('section.card' + (opts.cls ? '.' + opts.cls : ''));
    if (title) {
      const head = h('div.ct', h('span', title), opts.right || null);
      if (opts.collapsible) {
        head.classList.add('collapsible');
        head.setAttribute('role', 'button'); head.tabIndex = 0;
        const flip = function () { c.classList.toggle('closed'); };
        head.addEventListener('click', function (e) { if (e.target.closest('button,select,input')) return; flip(); });
        head.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
        if (opts.closed) c.classList.add('closed');
      }
      c.appendChild(head);
    }
    const b = h('div.cbody'); append(b, [body]); c.appendChild(b);
    return c;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /** Parse "F#m7b5", "Bb@A", "Cmaj7" → {root, rootPc, q, shape} */
  const Q_ALIASES = { '': '', 'maj': '', 'M': '', 'min': 'm', '-': 'm', '+': 'aug', 'o': 'dim', '°': 'dim', 'o7': 'dim7', '°7': 'dim7', 'ø': 'm7b5', 'ø7': 'm7b5', 'M7': 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7', 'mmaj7': 'mMaj7', 'm(maj7)': 'mMaj7', 'min7': 'm7', 'dom7': '7', '2': 'sus2', '4': 'sus4' };
  function parseChord(sym) {
    const parts = String(sym).split('@');
    const m = /^([A-G][#b♯♭]?)(.*)$/.exec(parts[0].trim());
    if (!m) return null;
    let q = m[2].replace('♯', '#').replace('♭', 'b');
    if (Q_ALIASES[q] !== undefined) q = Q_ALIASES[q];
    if (!T.CHORDS[q]) return null;
    return { root: m[1].replace('♯', '#').replace('♭', 'b'), rootPc: T.pcOf(m[1].replace('♯', '#').replace('♭', 'b')), q: q, shape: parts[1] || null };
  }

  return { $, $$, h, store, toast, options, rootSelect, scaleSelect, seg, toggle, field, card, esc, parseChord };
})();
