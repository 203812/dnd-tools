/* ============================================================
   core.js - gedeelde basis: navigatie, thema, helpers
   Elke pagina zet vooraf: window.PAGE = 'dice'; window.BASE = '..';
   ============================================================ */
(function () {
  'use strict';

  var BASE = window.BASE || '.';
  var PAGE = window.PAGE || 'home';

  /* ---------- Toolregister (bron voor nav + homepage) ---------- */
  var TOOLS = [
    { id: 'dice',       href: 'tools/dice.html',       icon: '\u{1F3B2}', name: 'Dobbelsteenroller', short: 'Dobbelen',
      desc: 'Volledige dice-notatie: 4d6kh3, 2d20adv, 3d6!, rerolls, modifiers en een rolgeschiedenis.' },
    { id: 'initiative', href: 'tools/initiative.html', icon: '⚔️', name: 'Initiatief-tracker', short: 'Initiatief',
      desc: 'Beheer het gevecht: initiatief, HP, condities, rondes en legendarische acties. Slaat automatisch op.' },
    { id: 'encounter',  href: 'tools/encounter.html',  icon: '\u{1F4C8}', name: 'Encounter builder', short: 'Encounters',
      desc: 'Bereken XP-budget en moeilijkheidsgraad voor je party, en stel een gevecht samen uit de monsterlijst.' },
    { id: 'monsters',   href: 'tools/monsters.html',   icon: '\u{1F409}', name: 'Monsterboek', short: 'Monsters',
      desc: 'Doorzoekbare statblocks met filters op CR, type en omgeving. Direct naar tracker of encounter.' },
    { id: 'spells',     href: 'tools/spells.html',     icon: '✨', name: 'Sprekenlijst', short: 'Spreuken',
      desc: 'Zoek spreuken op naam, niveau, school of klasse. Met volledige beschrijving en componenten.' },
    { id: 'loot',       href: 'tools/loot.html',       icon: '\u{1F4B0}', name: 'Schatgenerator', short: 'Schatten',
      desc: 'Rol individuele schat of een hoard per CR-niveau: munten, edelstenen, kunst en magische items.' },
    { id: 'npc',        href: 'tools/npc.html',        icon: '\u{1F9D9}', name: 'NPC-generator', short: 'NPCs',
      desc: 'Complete NPC in een klik: naam, ras, beroep, uiterlijk, karakter, geheim en scores.' },
    { id: 'names',      href: 'tools/names.html',      icon: '\u{1F4DC}', name: 'Naamgenerator', short: 'Namen',
      desc: 'Namen per volk en geslacht, plus herbergen, winkels, dorpen en gezelschappen.' },
    { id: 'abilities',  href: 'tools/abilities.html',  icon: '\u{1F4CA}', name: 'Ability scores', short: 'Scores',
      desc: 'Point buy, standard array en 4d6-drop-lowest met automatische modifiers en rasbonussen.' },
    { id: 'rules',      href: 'tools/rules.html',      icon: '\u{1F4D6}', name: 'Regelnaslag', short: 'Regels',
      desc: 'Condities, acties in gevecht, dekking, vallen, rustregels, reizen en DC-richtlijnen.' }
  ];
  window.TOOLS = TOOLS;

  /* ---------- Helpers ---------- */
  var H = {
    /** Willekeurig geheel getal tussen min en max (beide inclusief). */
    randInt: function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    /** Eén willekeurig element uit een array. */
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    /** n unieke willekeurige elementen (of minder als de array te klein is). */
    pickN: function (arr, n) {
      var copy = arr.slice(), out = [];
      while (out.length < n && copy.length) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
      return out;
    },
    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    },
    clamp: function (v, min, max) { return Math.min(max, Math.max(min, v)); },
    /** Modifier uit een ability score, bv. 16 -> +3 */
    mod: function (score) { return Math.floor((score - 10) / 2); },
    signed: function (n) { return (n >= 0 ? '+' : '') + n; },
    escape: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    /** Kiest uit [{w: gewicht, ...}] op basis van gewicht. */
    weighted: function (list) {
      var total = list.reduce(function (s, o) { return s + (o.w || 1); }, 0);
      var r = Math.random() * total;
      for (var i = 0; i < list.length; i++) { r -= (list[i].w || 1); if (r <= 0) return list[i]; }
      return list[list.length - 1];
    },
    /** Duizendtalscheiding met punt (NL-notatie). */
    num: function (n) { return Number(n).toLocaleString('nl-NL'); },
    el: function (tag, cls, html) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (html != null) e.innerHTML = html;
      return e;
    },
    qs: function (sel, root) { return (root || document).querySelector(sel); },
    qsa: function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); },
    on: function (sel, ev, fn, root) {
      var e = typeof sel === 'string' ? H.qs(sel, root) : sel;
      if (e) e.addEventListener(ev, fn);
      return e;
    },
    store: {
      get: function (key, fallback) {
        try { var v = localStorage.getItem('dndtools:' + key); return v == null ? fallback : JSON.parse(v); }
        catch (e) { return fallback; }
      },
      set: function (key, value) {
        try { localStorage.setItem('dndtools:' + key, JSON.stringify(value)); return true; }
        catch (e) { return false; }
      },
      del: function (key) { try { localStorage.removeItem('dndtools:' + key); } catch (e) {} }
    },
    toast: function (msg) {
      var host = document.getElementById('toast-host');
      if (!host) { host = H.el('div'); host.id = 'toast-host'; document.body.appendChild(host); }
      var t = H.el('div', 'toast', H.escape(msg));
      host.appendChild(t);
      setTimeout(function () { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, 2200);
    },
    copy: function (text) {
      var done = function () { H.toast('Gekopieerd naar klembord'); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { H.fallbackCopy(text, done); });
      } else { H.fallbackCopy(text, done); }
    },
    fallbackCopy: function (text, done) {
      var ta = H.el('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { H.toast('Kopiëren mislukt'); }
      ta.remove();
    },
    download: function (filename, text, type) {
      var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
      var a = H.el('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },
    /** Serialiseert een formulier naar een object. */
    formData: function (form) {
      var o = {};
      H.qsa('input,select,textarea', form).forEach(function (f) {
        if (!f.name) return;
        o[f.name] = f.type === 'checkbox' ? f.checked : f.value;
      });
      return o;
    }
  };
  window.H = H;

  /* ---------- Thema ---------- */
  var savedTheme = H.store.get('theme', null);
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  function toggleTheme() {
    var now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', now);
    H.store.set('theme', now);
    updateThemeButton();
  }
  function updateThemeButton() {
    var btn = document.getElementById('theme-btn');
    if (!btn) return;
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    btn.textContent = light ? '☽' : '☀';
    btn.title = light ? 'Donker thema' : 'Licht thema';
  }

  /* ---------- Header + footer renderen ---------- */
  var D20 = '<svg class="d20" viewBox="0 0 100 100" aria-hidden="true">' +
    '<polygon points="50,4 93,29 93,71 50,96 7,71 7,29" fill="none" stroke="currentColor" stroke-width="5"/>' +
    '<polygon points="50,22 76,62 24,62" fill="none" stroke="currentColor" stroke-width="5"/>' +
    '<path d="M50 4 L50 22 M93 29 L76 62 M93 71 L76 62 M7 29 L24 62 M7 71 L24 62 M50 96 L50 62" stroke="currentColor" stroke-width="3" fill="none" opacity=".55"/>' +
    '</svg>';

  function buildHeader() {
    var links = TOOLS.map(function (t) {
      return '<a href="' + BASE + '/' + t.href + '"' + (t.id === PAGE ? ' class="active"' : '') + '>' + t.short + '</a>';
    }).join('');

    var header = H.el('header', 'site-header');
    header.innerHTML =
      '<div class="wrap nav">' +
        '<a class="brand" href="' + BASE + '/index.html">' + D20 + '<span>DnD&nbsp;Tools</span></a>' +
        '<button class="icon-btn nav-toggle" id="nav-btn" aria-label="Menu" aria-expanded="false">≡</button>' +
        '<nav class="nav-links" id="nav-links">' + links + '</nav>' +
        '<button class="icon-btn" id="theme-btn" aria-label="Thema wisselen"></button>' +
      '</div>';
    document.body.insertBefore(header, document.body.firstChild);

    H.on('#nav-btn', 'click', function () {
      var nav = document.getElementById('nav-links');
      var open = nav.classList.toggle('open');
      this.setAttribute('aria-expanded', String(open));
    });
    H.on('#theme-btn', 'click', toggleTheme);
    updateThemeButton();
  }

  function buildFooter() {
    var f = H.el('footer', 'site-footer');
    f.innerHTML =
      '<div class="wrap">' +
        '<span>DnD Tools — gratis hulpmiddelen voor spelers en DMs.</span>' +
        '<span>Speldata op basis van de SRD 5.1 (CC-BY-4.0, Wizards of the Coast). Geen officieel Wizards-product.</span>' +
      '</div>';
    document.body.appendChild(f);
  }

  /* ---------- Scrollbare lijsten: duidelijk maken dat er meer is ----------
     Elke .scroll-y krijgt een vervaging onderaan en een hint-regel zolang er
     nog inhoud onder de rand zit. Beide verdwijnen zodra je beneden bent of
     als de inhoud sowieso past. */
  function setupScrollHints() {
    H.qsa('.scroll-y').forEach(function (box) {
      var hint = H.el('div', 'scroll-hint', 'meer ▾');
      box.insertAdjacentElement('afterend', hint);

      function update() {
        var overflow = box.scrollHeight - box.clientHeight;
        var fits = overflow <= 2;
        var atEnd = fits || (box.scrollTop >= overflow - 2);
        box.classList.toggle('no-scroll', fits);
        box.classList.toggle('at-end', atEnd);
        hint.classList.toggle('show', !atEnd);
      }

      box.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      // de lijsten worden herbouwd bij elke filterwijziging
      new MutationObserver(update).observe(box, { childList: true, subtree: true });
      update();
    });
  }

  function init() {
    buildHeader();
    buildFooter();
    setupScrollHints();
    if (!document.getElementById('toast-host')) {
      var host = H.el('div'); host.id = 'toast-host'; document.body.appendChild(host);
    }
    // data-copy="<selector>" kopieert de tekst van dat element
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-copy]');
      if (!btn) return;
      var src = H.qs(btn.getAttribute('data-copy'));
      if (src) H.copy(src.innerText.trim());
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
