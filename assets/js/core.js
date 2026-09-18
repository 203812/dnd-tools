/* ============================================================
   core.js - shared foundation: navigation, theme, helpers
   Every page sets: window.PAGE = 'dice'; window.BASE = '..';
   ============================================================ */
(function () {
  'use strict';

  var BASE = window.BASE || '.';
  var PAGE = window.PAGE || 'home';

  /* ---------- Tool registry (source for nav + home page) ---------- */
  var TOOLS = [
    /* --- Campaign: the things that run all session --- */
    { id: 'console', cat: 'Campaign', href: 'tools/console.html', icon: '\u{1F4DD}', name: 'Session Console', short: 'Console',
      desc: 'The laptop beside the DM. Party, hit points, experience, quests, NPCs, loot and session notes in one place, saved as you go.' },
    { id: 'calendar', cat: 'Campaign', href: 'tools/calendar.html', icon: '\u{1F4C5}', name: 'Campaign Calendar', short: 'Calendar',
      desc: 'Build your own calendar with custom months and moons, track the date as the party travels, and roll the weather.' },
    { id: 'ambience', cat: 'Campaign', href: 'tools/ambience.html', icon: '\u{1F50A}', name: 'Ambience Mixer', short: 'Ambience',
      desc: 'Layered background sound built in your browser: rain, wind, fire, caves and taverns, plus your own audio files.' },

    /* --- Combat --- */
    { id: 'initiative', cat: 'Combat', href: 'tools/initiative.html', icon: '⚔️', name: 'Initiative Tracker', short: 'Initiative',
      desc: 'Run the fight: initiative order, hit points, concentration, conditions and rounds. Opens stat blocks inline and saves automatically.' },
    { id: 'encounter', cat: 'Combat', href: 'tools/encounter.html', icon: '\u{1F4C8}', name: 'Encounter Builder', short: 'Encounters',
      desc: 'Work out the XP budget and difficulty for your party, filter by environment and roll a random encounter that fits.' },
    { id: 'battlemap', cat: 'Combat', href: 'tools/battlemap.html', icon: '\u{1F5FA}️', name: 'Battle Map', short: 'Battle Map',
      desc: 'Drop a map image, snap tokens to the grid, measure distances and hide the unexplored parts behind fog of war.' },
    { id: 'monsters', cat: 'Combat', href: 'tools/monsters.html', icon: '\u{1F409}', name: 'Bestiary', short: 'Monsters',
      desc: 'Searchable stat blocks with filters for challenge rating, type and environment. One click to the tracker.' },

    /* --- Dice --- */
    { id: 'dice', cat: 'Dice', href: 'tools/dice.html', icon: '\u{1F3B2}', name: 'Dice Roller', short: 'Roller',
      desc: 'Full dice notation: 4d6kh3, advantage, exploding dice, rerolls, modifiers and a roll history.' },
    { id: 'probability', cat: 'Dice', href: 'tools/probability.html', icon: '\u{1F4C9}', name: 'Dice Probability', short: 'Probability',
      desc: 'The odds behind the dice: full distribution, averages, chance to beat a target, and attack maths for homebrew monsters.' },

    /* --- Reference --- */
    { id: 'spells', cat: 'Reference', href: 'tools/spells.html', icon: '✨', name: 'Spell List', short: 'Spells',
      desc: 'Search spells by name, level, school or class, with components, duration and description.' },
    { id: 'rules', cat: 'Reference', href: 'tools/rules.html', icon: '\u{1F4D6}', name: 'Rules Reference', short: 'Rules',
      desc: 'Conditions, actions in combat, cover, hazards, resting, travel and DC guidelines.' },
    { id: 'screen', cat: 'Reference', href: 'tools/screen.html', icon: '\u{1F5C2}️', name: 'DM Screen', short: 'DM Screen',
      desc: 'Your own dashboard: pick the panels you want behind the screen and arrange them however you like.' },

    /* --- Generators --- */
    { id: 'npc', cat: 'Generators', href: 'tools/npc.html', icon: '\u{1F9D9}', name: 'NPC Generator', short: 'NPCs',
      desc: 'A complete NPC in one click: name, ancestry, trade, looks, personality, secret and ability scores.' },
    { id: 'names', cat: 'Generators', href: 'tools/names.html', icon: '\u{1F4DC}', name: 'Name Generator', short: 'Names',
      desc: 'Names by ancestry, plus taverns, shops, villages and companies.' },
    { id: 'loot', cat: 'Generators', href: 'tools/loot.html', icon: '\u{1F4B0}', name: 'Treasure Generator', short: 'Treasure',
      desc: 'Roll individual treasure or a full hoard by CR: coins, gems, art objects and magic items.' },
    { id: 'tokens', cat: 'Generators', href: 'tools/tokens.html', icon: '\u{1F535}', name: 'Token Maker', short: 'Tokens',
      desc: 'Turn any picture into a round token with a border and a name, ready to print or drop on the battle map.' },
    { id: 'abilities', cat: 'Generators', href: 'tools/abilities.html', icon: '\u{1F4CA}', name: 'Ability Scores', short: 'Scores',
      desc: 'Point buy, standard array and 4d6 drop lowest with automatic modifiers and racial bonuses.' }
  ];
  window.TOOLS = TOOLS;

  var CATEGORIES = [];
  TOOLS.forEach(function (t) { if (CATEGORIES.indexOf(t.cat) === -1) CATEGORIES.push(t.cat); });
  window.TOOL_CATEGORIES = CATEGORIES;

  /* ---------- Helpers ---------- */
  var H = {
    /** Random integer between min and max (both inclusive). */
    randInt: function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
    /** One random element from an array. */
    pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
    /** n unique random elements (or fewer if the array is too small). */
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
    /** Modifier from an ability score, e.g. 16 -> +3 */
    mod: function (score) { return Math.floor((score - 10) / 2); },
    signed: function (n) { return (n >= 0 ? '+' : '') + n; },
    escape: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    /** Picks from [{w: weight, ...}] according to weight. */
    weighted: function (list) {
      var total = list.reduce(function (s, o) { return s + (o.w || 1); }, 0);
      var r = Math.random() * total;
      for (var i = 0; i < list.length; i++) { r -= (list[i].w || 1); if (r <= 0) return list[i]; }
      return list[list.length - 1];
    },
    /** Thousands separator. */
    num: function (n) { return Number(n).toLocaleString('en-US'); },
    /** Percentage with one decimal, without trailing ".0". */
    pct: function (v) {
      var s = (v * 100).toFixed(1);
      return (s.slice(-2) === '.0' ? s.slice(0, -2) : s) + '%';
    },
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
      var done = function () { H.toast('Copied to clipboard'); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { H.fallbackCopy(text, done); });
      } else { H.fallbackCopy(text, done); }
    },
    fallbackCopy: function (text, done) {
      var ta = H.el('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { H.toast('Copying failed'); }
      ta.remove();
    },
    download: function (filename, text, type) {
      var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
      H.downloadBlob(filename, blob);
    },
    downloadBlob: function (filename, blob) {
      var a = H.el('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    },
    /** Opens a file picker and hands the chosen File objects to the callback. */
    pickFile: function (accept, multiple, cb) {
      var inp = H.el('input');
      inp.type = 'file';
      inp.accept = accept;
      inp.multiple = !!multiple;
      inp.addEventListener('change', function () {
        if (inp.files && inp.files.length) cb(multiple ? Array.prototype.slice.call(inp.files) : inp.files[0]);
      });
      inp.click();
    },
    /** Reads an image File into a loaded HTMLImageElement. */
    readImage: function (file, cb, onError) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () { cb(img, reader.result); };
        img.onerror = function () { if (onError) onError('That file could not be read as an image.'); };
        img.src = reader.result;
      };
      reader.onerror = function () { if (onError) onError('That file could not be read.'); };
      reader.readAsDataURL(file);
    },
    /** Scrolls an element into view where the browser supports it. */
    reveal: function (el, opts) {
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView(opts || { behavior: 'smooth', block: 'nearest' });
      }
    },
    /** Serialises a form into a plain object. */
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

  /* ---------- Theme ---------- */
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
    btn.title = light ? 'Dark theme' : 'Light theme';
  }

  /* ---------- Header and footer ---------- */
  var D20 = '<svg class="d20" viewBox="0 0 100 100" aria-hidden="true">' +
    '<polygon points="50,4 93,29 93,71 50,96 7,71 7,29" fill="none" stroke="currentColor" stroke-width="5"/>' +
    '<polygon points="50,22 76,62 24,62" fill="none" stroke="currentColor" stroke-width="5"/>' +
    '<path d="M50 4 L50 22 M93 29 L76 62 M93 71 L76 62 M7 29 L24 62 M7 71 L24 62 M50 96 L50 62" stroke="currentColor" stroke-width="3" fill="none" opacity=".55"/>' +
    '</svg>';

  function buildHeader() {
    var menus = CATEGORIES.map(function (cat) {
      var tools = TOOLS.filter(function (t) { return t.cat === cat; });
      var active = tools.some(function (t) { return t.id === PAGE; });
      var items = tools.map(function (t) {
        return '<a href="' + BASE + '/' + t.href + '"' + (t.id === PAGE ? ' class="active"' : '') + '>' +
          '<span class="menu-icon">' + t.icon + '</span>' + t.name + '</a>';
      }).join('');
      return '<div class="nav-group' + (active ? ' has-active' : '') + '">' +
        '<button type="button" class="nav-trigger" aria-expanded="false">' + cat + '<span class="caret">▾</span></button>' +
        '<div class="nav-menu">' + items + '</div>' +
      '</div>';
    }).join('');

    var header = H.el('header', 'site-header');
    header.innerHTML =
      '<div class="wrap nav">' +
        '<a class="brand" href="' + BASE + '/index.html">' + D20 + '<span>DnD&nbsp;Tools</span></a>' +
        '<button class="icon-btn nav-toggle" id="nav-btn" aria-label="Menu" aria-expanded="false">≡</button>' +
        '<nav class="nav-links" id="nav-links">' + menus + '</nav>' +
        '<button class="icon-btn" id="theme-btn" aria-label="Toggle theme"></button>' +
      '</div>';
    document.body.insertBefore(header, document.body.firstChild);

    // Category menus: click to open, click elsewhere or Escape to close.
    H.qsa('.nav-trigger', header).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var group = btn.parentNode;
        var open = group.classList.contains('open');
        H.qsa('.nav-group', header).forEach(function (g) {
          g.classList.remove('open');
          H.qs('.nav-trigger', g).setAttribute('aria-expanded', 'false');
        });
        if (!open) { group.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });
    document.addEventListener('click', function () {
      H.qsa('.nav-group.open', header).forEach(function (g) {
        g.classList.remove('open');
        H.qs('.nav-trigger', g).setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      H.qsa('.nav-group.open', header).forEach(function (g) {
        g.classList.remove('open');
        H.qs('.nav-trigger', g).setAttribute('aria-expanded', 'false');
      });
    });

    H.on('#nav-btn', 'click', function (e) {
      e.stopPropagation();
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
        '<span>DnD Tools — free tools for players and Dungeon Masters.</span>' +
        '<span>Game data based on the SRD 5.1 (CC-BY-4.0, Wizards of the Coast). Not an official Wizards product.</span>' +
      '</div>';
    document.body.appendChild(f);
  }

  /* ---------- Scrollable lists: make it obvious there is more ----------
     Every .scroll-y gets a fade at the bottom and a hint line for as long
     as there is content below the edge. Both disappear once you reach the
     bottom, or if the content fits anyway. */
  function setupScrollHints() {
    H.qsa('.scroll-y').forEach(function (box) {
      var hint = H.el('div', 'scroll-hint', 'more ▾');
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
      // the lists are rebuilt whenever a filter changes
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
    // data-copy="<selector>" copies the text of that element
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
