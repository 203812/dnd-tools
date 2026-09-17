/* ============================================================
   initiative-page.js - logic for tools/initiative.html
   ============================================================ */
(function () {
  'use strict';

  var state = H.store.get('encounter', null) || { combatants: [], round: 1, turn: 0, nextId: 1 };
  var selectedId = null;
  var openStatblocks = {};   // combatant id -> stat block expanded?

  var listEl = H.qs('#combatants');
  var roundEl = H.qs('#round-label');
  var hintEl = H.qs('#turn-hint');
  var condEl = H.qs('#cond-panel');

  function save() { H.store.set('encounter', state); }
  function byId(id) { return state.combatants.filter(function (x) { return x.id === id; })[0]; }

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
      var cls = 'combatant' + (i === state.turn ? ' active' : '') + (c.hp != null && c.hp <= 0 ? ' dead' : '') +
        (c.id === selectedId ? ' selected' : '');
      var effectiveMax = c.maxHp;
      var hpPct = effectiveMax ? H.clamp(Math.round((c.hp / effectiveMax) * 100), 0, 100) : null;
      var barCls = hpPct == null ? '' : (hpPct <= 25 ? 'crit' : (hpPct <= 50 ? 'low' : ''));

      var sub = [];
      if (c.ac != null) sub.push('AC ' + c.ac);
      if (c.temp) sub.push(c.temp + ' temp hp');
      if (c.monster) sub.push(c.monster);
      if (c.note) sub.push(c.note);

      var tags = '';
      if (c.pc) tags += ' <span class="tag green">PC</span>';
      if (c.concentrating) tags += ' <span class="tag purple" title="Concentrating on a spell">CONC</span>';
      tags += (c.conditions || []).map(function (cd) {
        return ' <span class="tag red">' + H.escape(cd) + '</span>';
      }).join('');

      return '<div class="' + cls + '" data-id="' + c.id + '">' +
        '<div class="c-init" title="Initiative">' + c.init + '</div>' +
        '<div class="c-main">' +
          '<div class="c-name">' + H.escape(c.name) + tags + '</div>' +
          (sub.length ? '<div class="c-sub">' + H.escape(sub.join(' · ')) + '</div>' : '') +
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
        '<div class="btn-group no-print" style="flex:none">' +
          '<button class="btn btn-sm" data-act="conc" title="Toggle concentration">C</button>' +
          (c.monster ? '<button class="btn btn-sm" data-act="statblock" title="Show the stat block">&#9776;</button>' : '') +
          '<button class="btn btn-sm" data-act="dup" title="Duplicate">&#10133;</button>' +
          '<button class="btn btn-sm btn-danger" data-act="del" title="Remove">&#10005;</button>' +
        '</div>' +
      '</div>' +
      (openStatblocks[c.id] ? statblockHtml(c) : '');
    }).join('');

    var cur = list[state.turn];
    hintEl.textContent = cur ? 'Up now: ' + cur.name : '';
    renderCond();
  }

  /* ---------- Inline stat block ---------- */
  function statblockHtml(c) {
    var m = MONSTERS.filter(function (x) { return x.name === c.monster; })[0];
    if (!m) return '';

    function prop(label, value) {
      return value ? '<p class="sb-prop"><b>' + label + '</b> ' + H.escape(value) + '</p>' : '';
    }
    function cell(label, score) {
      return '<div><b>' + label + '</b>' + score + ' (' + H.signed(H.mod(score)) + ')</div>';
    }

    return '<div class="statblock" style="margin:-4px 0 10px 46px">' +
      '<h3>' + H.escape(m.name) + '</h3>' +
      '<div class="sb-type">' + m.size + ' ' + m.type + ', ' + m.align + '</div>' +
      '<hr class="sb-rule">' +
      '<p class="sb-prop"><b>Armor Class</b> ' + m.ac + '</p>' +
      '<p class="sb-prop"><b>Hit Points</b> ' + m.hp + ' (' + m.hd + ')</p>' +
      '<p class="sb-prop"><b>Speed</b> ' + H.escape(m.speed) + '</p>' +
      '<div class="sb-abilities">' +
        cell('STR', m.str) + cell('DEX', m.dex) + cell('CON', m.con) +
        cell('INT', m.int) + cell('WIS', m.wis) + cell('CHA', m.cha) +
      '</div>' +
      prop('Saving Throws', m.saves) + prop('Skills', m.skills) +
      prop('Damage Vulnerabilities', m.vuln) + prop('Damage Resistances', m.resist) +
      prop('Damage Immunities', m.immune) + prop('Condition Immunities', m.condImmune) +
      prop('Senses', m.senses) + prop('Languages', m.langs) +
      '<hr class="sb-rule">' +
      (m.traits || []).map(function (t) {
        return '<p class="sb-action"><b>' + H.escape(t.n) + '.</b> ' + H.escape(t.d) + '</p>';
      }).join('') +
      ((m.actions || []).length ? '<h4 style="color:var(--red-soft);margin:12px 0 4px">Actions</h4>' : '') +
      (m.actions || []).map(function (a) {
        return '<p class="sb-action"><b>' + H.escape(a.n) + '.</b> ' + H.escape(a.d) + '</p>';
      }).join('') +
      ((m.legendary || []).length ? '<h4 style="color:var(--red-soft);margin:12px 0 4px">Legendary Actions</h4>' : '') +
      (m.legendary || []).map(function (a) {
        return '<p class="sb-action"><b>' + H.escape(a.n) + '.</b> ' + H.escape(a.d) + '</p>';
      }).join('') +
    '</div>';
  }

  /* ---------- Conditions ---------- */
  function renderCond() {
    var c = byId(selectedId);
    if (!c) { condEl.innerHTML = '<span class="muted">No combatant selected.</span>'; return; }

    var chips = RULES.conditions.map(function (cd) {
      var on = (c.conditions || []).indexOf(cd.n) !== -1;
      return '<button class="chip' + (on ? ' active' : '') + '" data-cond="' + cd.n + '">' + cd.n + '</button>';
    }).join('');

    condEl.innerHTML = '<div style="margin-bottom:8px"><b>' + H.escape(c.name) + '</b></div>' +
      '<div class="chips">' + chips + '</div>' +
      '<div class="field" style="margin-top:12px">' +
        '<label for="sel-note">Note</label>' +
        '<input id="sel-note" value="' + H.escape(c.note || '') + '" placeholder="reminder for this combatant">' +
      '</div>' +
      '<div class="field-row">' +
        '<div class="field"><label for="sel-temp">Temp HP</label>' +
          '<input id="sel-temp" type="number" value="' + (c.temp || 0) + '" min="0"></div>' +
        '<div class="field"><label for="sel-ac">AC</label>' +
          '<input id="sel-ac" type="number" value="' + (c.ac != null ? c.ac : '') + '"></div>' +
      '</div>';
  }

  condEl.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-cond]');
    if (!btn) return;
    var c = byId(selectedId);
    if (!c) return;
    c.conditions = c.conditions || [];
    var name = btn.getAttribute('data-cond');
    var i = c.conditions.indexOf(name);
    if (i === -1) c.conditions.push(name); else c.conditions.splice(i, 1);
    save(); render();
  });

  condEl.addEventListener('input', function (e) {
    var c = byId(selectedId);
    if (!c) return;
    if (e.target.id === 'sel-note') c.note = e.target.value.trim();
    if (e.target.id === 'sel-temp') c.temp = Math.max(0, parseInt(e.target.value, 10) || 0);
    if (e.target.id === 'sel-ac') c.ac = e.target.value === '' ? null : parseInt(e.target.value, 10);
    save();
    // redraw the list but leave the field being typed in alone
    var active = document.activeElement.id;
    render();
    var again = document.getElementById(active);
    if (again) { again.focus(); if (again.setSelectionRange && again.type === 'text') { var l = again.value.length; again.setSelectionRange(l, l); } }
  });

  /* ---------- Damage, healing and temporary hit points ---------- */
  function applyDamage(c, amount) {
    if (c.temp) {
      var absorbed = Math.min(c.temp, amount);
      c.temp -= absorbed;
      amount -= absorbed;
    }
    c.hp = Math.max(0, c.hp - amount);

    if (c.concentrating && amount > 0) {
      var dc = Math.max(10, Math.floor(amount / 2));
      H.toast(c.name + ': concentration save DC ' + dc);
    }
    if (c.hp === 0) c.concentrating = false;
  }

  /* ---------- Interacting with the list ---------- */
  listEl.addEventListener('click', function (e) {
    var row = e.target.closest('.combatant');
    if (!row) return;
    var id = parseInt(row.getAttribute('data-id'), 10);
    var c = byId(id);
    if (!c) return;

    var act = e.target.closest('[data-act]');
    if (!act) { selectedId = id; render(); return; }

    switch (act.getAttribute('data-act')) {
      case 'del':
        state.combatants = state.combatants.filter(function (x) { return x.id !== id; });
        if (selectedId === id) selectedId = null;
        delete openStatblocks[id];
        break;
      case 'dup': {
        var copy = JSON.parse(JSON.stringify(c));
        copy.id = state.nextId++;
        copy.name = nextName(c.name);
        state.combatants.push(copy);
        break;
      }
      case 'conc':
        c.concentrating = !c.concentrating;
        break;
      case 'statblock':
        openStatblocks[id] = !openStatblocks[id];
        break;
      case 'dmg': {
        var d = prompt('How much damage to ' + c.name + '?', '');
        if (d == null) return;
        applyDamage(c, Math.max(0, parseInt(d, 10) || 0));
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

  /** "Goblin 3" -> "Goblin 4"; "Goblin" -> "Goblin 2" */
  function nextName(name) {
    var m = /^(.*?)(\d+)$/.exec(name);
    if (m) return m[1] + (parseInt(m[2], 10) + 1);
    return name + ' 2';
  }

  listEl.addEventListener('change', function (e) {
    var act = e.target.closest('[data-act="hpnum"]');
    if (!act) return;
    var id = parseInt(e.target.closest('.combatant').getAttribute('data-id'), 10);
    var c = byId(id);
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
    if (e.key.toLowerCase() === 'c' && selectedId != null) {
      var c = byId(selectedId);
      if (c) { c.concentrating = !c.concentrating; save(); render(); }
    }
  });

  /* ---------- Adding ---------- */
  function add(c) {
    c.id = state.nextId++;
    c.conditions = c.conditions || [];
    state.combatants.push(c);
    return c;
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
    var note = H.qs('#c-note').value.trim();

    for (var i = 0; i < count; i++) {
      add({
        name: count > 1 ? name + ' ' + (i + 1) : name,
        init: initRaw === '' ? Dice.total('1d20') + dex : parseInt(initRaw, 10),
        dex: dex, hp: hp, maxHp: hp, ac: ac, pc: pc, note: note, temp: 0
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
        dex: dexMod, hp: hp, maxHp: hp, ac: m.ac, pc: false, monster: m.name, temp: 0
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
    openStatblocks = {};
    save(); render();
  });

  H.on('#btn-export', 'click', function () {
    H.download('encounter.json', JSON.stringify(state, null, 2), 'application/json');
  });

  H.on('#btn-import', 'click', function () {
    H.pickFile('.json,application/json', false, function (file) {
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
          dex: H.mod(m.dex), hp: m.hp, maxHp: m.hp, ac: m.ac, pc: false, monster: m.name, temp: 0
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
