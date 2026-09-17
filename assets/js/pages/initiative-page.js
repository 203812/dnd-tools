/* ============================================================
   initiative-page.js - logic for tools/initiative.html
   ============================================================ */
(function () {
  'use strict';

  var state = H.store.get('encounter', null) || { combatants: [], round: 1, turn: 0, nextId: 1 };
  var selectedId = null;

  var listEl = H.qs('#combatants');
  var roundEl = H.qs('#round-label');
  var hintEl = H.qs('#turn-hint');
  var condEl = H.qs('#cond-panel');

  function save() { H.store.set('encounter', state); }

  /* ---------- Sorting and rendering ---------- */
  function sorted() {
    return state.combatants.slice().sort(function (a, b) {
      if (b.init !== a.init) return b.init - a.init;
      if ((b.dex || 0) !== (a.dex || 0)) return (b.dex || 0) - (a.dex || 0);
      return a.id - b.id;
    });
  }

  function render() {
    var list = sorted();
    roundEl.textContent = 'Round ' + state.round;

    if (!list.length) {
      listEl.innerHTML = '<div class="empty">No combatants yet. Add players and monsters to begin.</div>';
      hintEl.textContent = '';
      renderCond();
      return;
    }

    if (state.turn >= list.length) state.turn = 0;

    listEl.innerHTML = list.map(function (c, i) {
      var cls = 'combatant' + (i === state.turn ? ' active' : '') + (c.hp != null && c.hp <= 0 ? ' dead' : '');
      var hpPct = c.maxHp ? H.clamp(Math.round((c.hp / c.maxHp) * 100), 0, 100) : null;
      var barCls = hpPct == null ? '' : (hpPct <= 25 ? 'crit' : (hpPct <= 50 ? 'low' : ''));

      var sub = [];
      if (c.ac != null) sub.push('AC ' + c.ac);
      if (c.monster) sub.push(c.monster);
      if (c.conditions && c.conditions.length) sub.push(c.conditions.join(', '));

      return '<div class="' + cls + '" data-id="' + c.id + '">' +
        '<div class="c-init" title="Initiative">' + c.init + '</div>' +
        '<div class="c-main">' +
          '<div class="c-name">' + H.escape(c.name) +
            (c.pc ? ' <span class="tag green">PC</span>' : '') +
            (c.conditions || []).map(function (cd) { return ' <span class="tag red">' + H.escape(cd) + '</span>'; }).join('') +
          '</div>' +
          '<div class="c-sub">' + H.escape(sub.join(' · ')) + '</div>' +
          (hpPct != null ? '<div class="hpbar ' + barCls + '"><i style="width:' + hpPct + '%"></i></div>' : '') +
        '</div>' +
        (c.maxHp != null
          ? '<div class="c-hp no-print">' +
              '<button class="btn btn-sm" data-act="dmg" title="Damage">&#8722;</button>' +
              '<input type="number" data-act="hpnum" value="' + c.hp + '" aria-label="Hit points">' +
              '<span class="muted" style="font-size:.8rem">/' + c.maxHp + '</span>' +
              '<button class="btn btn-sm" data-act="heal" title="Heal">+</button>' +
            '</div>'
          : '<div class="c-hp no-print"><button class="btn btn-sm" data-act="sethp">HP</button></div>') +
        '<button class="btn btn-sm btn-danger no-print" data-act="del" title="Remove">&#10005;</button>' +
      '</div>';
    }).join('');

    var cur = list[state.turn];
    hintEl.textContent = cur ? 'Up now: ' + cur.name : '';
    renderCond();
  }

  /* ---------- Conditions ---------- */
  function renderCond() {
    var c = state.combatants.filter(function (x) { return x.id === selectedId; })[0];
    if (!c) { condEl.innerHTML = '<span class="muted">No combatant selected.</span>'; return; }

    var chips = RULES.conditions.map(function (cd) {
      var on = (c.conditions || []).indexOf(cd.n) !== -1;
      return '<button class="chip' + (on ? ' active' : '') + '" data-cond="' + cd.n + '">' + cd.n + '</button>';
    }).join('');

    condEl.innerHTML = '<div style="margin-bottom:8px"><b>' + H.escape(c.name) + '</b></div><div class="chips">' + chips + '</div>';
  }

  condEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cond]');
    if (!btn) return;
    var c = state.combatants.filter(function (x) { return x.id === selectedId; })[0];
    if (!c) return;
    c.conditions = c.conditions || [];
    var name = btn.getAttribute('data-cond');
    var i = c.conditions.indexOf(name);
    if (i === -1) c.conditions.push(name); else c.conditions.splice(i, 1);
    save(); render();
  });

  /* ---------- Interacting with the list ---------- */
  listEl.addEventListener('click', function (e) {
    var row = e.target.closest('.combatant');
    if (!row) return;
    var id = parseInt(row.getAttribute('data-id'), 10);
    var c = state.combatants.filter(function (x) { return x.id === id; })[0];
    if (!c) return;

    var act = e.target.closest('[data-act]');
    if (!act) { selectedId = id; renderCond(); return; }

    switch (act.getAttribute('data-act')) {
      case 'del':
        state.combatants = state.combatants.filter(function (x) { return x.id !== id; });
        if (selectedId === id) selectedId = null;
        break;
      case 'dmg': {
        var d = prompt('How much damage to ' + c.name + '?', '');
        if (d == null) return;
        c.hp = Math.max(0, c.hp - (parseInt(d, 10) || 0));
        break;
      }
      case 'heal': {
        var h = prompt('How much healing for ' + c.name + '?', '');
        if (h == null) return;
        c.hp = Math.min(c.maxHp, c.hp + (parseInt(h, 10) || 0));
        break;
      }
      case 'sethp': {
        var v = prompt('Hit points for ' + c.name + '?', '10');
        if (v == null) return;
        c.maxHp = c.hp = parseInt(v, 10) || 0;
        break;
      }
    }
    save(); render();
  });

  listEl.addEventListener('change', function (e) {
    var act = e.target.closest('[data-act="hpnum"]');
    if (!act) return;
    var id = parseInt(e.target.closest('.combatant').getAttribute('data-id'), 10);
    var c = state.combatants.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    c.hp = H.clamp(parseInt(e.target.value, 10) || 0, 0, c.maxHp);
    save(); render();
  });

  /* ---------- Turns ---------- */
  function step(dir) {
    var n = state.combatants.length;
    if (!n) return;
    state.turn += dir;
    if (state.turn >= n) { state.turn = 0; state.round++; }
    if (state.turn < 0) { state.turn = n - 1; state.round = Math.max(1, state.round - 1); }
    save(); render();
  }
  H.on('#btn-next', 'click', function () { step(1); });
  H.on('#btn-prev', 'click', function () { step(-1); });

  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); step(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  });

  /* ---------- Adding ---------- */
  function add(c) {
    c.id = state.nextId++;
    c.conditions = c.conditions || [];
    state.combatants.push(c);
  }

  H.on('#add-form', 'submit', function (e) {
    e.preventDefault();
    var name = H.qs('#c-name').value.trim();
    var initRaw = H.qs('#c-init').value;
    var dex = parseInt(H.qs('#c-dex').value, 10) || 0;
    var hp = H.qs('#c-hp').value === '' ? null : parseInt(H.qs('#c-hp').value, 10);
    var ac = H.qs('#c-ac').value === '' ? null : parseInt(H.qs('#c-ac').value, 10);
    var count = H.clamp(parseInt(H.qs('#c-count').value, 10) || 1, 1, 20);
    var pc = H.qs('#c-pc').checked;

    for (var i = 0; i < count; i++) {
      add({
        name: count > 1 ? name + ' ' + (i + 1) : name,
        init: initRaw === '' ? Dice.total('1d20') + dex : parseInt(initRaw, 10),
        dex: dex, hp: hp, maxHp: hp, ac: ac, pc: pc
      });
    }
    save(); render();
    this.reset();
    H.qs('#c-count').value = '1';
    H.qs('#c-dex').value = '0';
    H.qs('#c-name').focus();
  });

  /* ---------- Monster search ---------- */
  var searchInput = H.qs('#m-search');
  var resultsEl = H.qs('#m-results');

  function renderSearch() {
    var q = searchInput.value.trim().toLowerCase();
    var list = q
      ? MONSTERS.filter(function (m) { return m.name.toLowerCase().indexOf(q) !== -1 || m.type.indexOf(q) !== -1; })
      : MONSTERS.slice(0, 12);

    if (!list.length) { resultsEl.innerHTML = '<div class="empty">Nothing found.</div>'; return; }

    resultsEl.innerHTML = list.slice(0, 40).map(function (m) {
      return '<div class="stat-line" style="cursor:pointer" data-mon="' + H.escape(m.name) + '">' +
        '<span>' + H.escape(m.name) + '<br><small>' + m.type + ' · AC ' + m.ac + ' · ' + m.hp + ' HP</small></span>' +
        '<span>CR ' + crLabel(m.cr) + '</span></div>';
    }).join('');
  }

  resultsEl.addEventListener('click', function (e) {
    var row = e.target.closest('[data-mon]');
    if (!row) return;
    var m = MONSTERS.filter(function (x) { return x.name === row.getAttribute('data-mon'); })[0];
    if (!m) return;

    var count = H.clamp(parseInt(H.qs('#m-count').value, 10) || 1, 1, 20);
    var useRoll = H.qs('#m-hp').value === 'roll';
    var dexMod = H.mod(m.dex);

    for (var i = 0; i < count; i++) {
      var hp = useRoll && m.hd ? Math.max(1, Dice.total(m.hd)) : m.hp;
      add({
        name: count > 1 ? m.name + ' ' + (i + 1) : m.name,
        init: Dice.total('1d20') + dexMod,
        dex: dexMod, hp: hp, maxHp: hp, ac: m.ac, pc: false, monster: m.name
      });
    }
    save(); render();
    H.toast(count + '× ' + m.name + ' added');
  });

  searchInput.addEventListener('input', renderSearch);

  /* ---------- Managing the fight ---------- */
  H.on('#btn-reset', 'click', function () {
    if (!confirm('Clear the entire fight?')) return;
    state = { combatants: [], round: 1, turn: 0, nextId: 1 };
    selectedId = null;
    save(); render();
  });

  H.on('#btn-export', 'click', function () {
    H.download('encounter.json', JSON.stringify(state, null, 2), 'application/json');
  });

  H.on('#btn-import', 'click', function () {
    var inp = H.el('input');
    inp.type = 'file';
    inp.accept = '.json,application/json';
    inp.addEventListener('change', function () {
      var file = inp.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data || !Array.isArray(data.combatants)) throw new Error('bad');
          state = data;
          state.nextId = state.nextId || (Math.max.apply(null, [0].concat(state.combatants.map(function (c) { return c.id || 0; }))) + 1);
          save(); render();
          H.toast('Fight loaded');
        } catch (err) { H.toast('That file could not be read'); }
      };
      reader.readAsText(file);
    });
    inp.click();
  });

  /* Monsters handed over from the encounter builder */
  var pending = H.store.get('encounter-queue', null);
  if (pending && pending.length) {
    pending.forEach(function (p) {
      var m = MONSTERS.filter(function (x) { return x.name === p.name; })[0];
      if (!m) return;
      for (var i = 0; i < p.count; i++) {
        add({
          name: p.count > 1 ? m.name + ' ' + (i + 1) : m.name,
          init: Dice.total('1d20') + H.mod(m.dex),
          dex: H.mod(m.dex), hp: m.hp, maxHp: m.hp, ac: m.ac, pc: false, monster: m.name
        });
      }
    });
    H.store.del('encounter-queue');
    save();
    H.toast('Encounter imported from the builder');
  }

  renderSearch();
  render();
})();
