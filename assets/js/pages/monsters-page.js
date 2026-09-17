/* ============================================================
   monsters-page.js - logica voor tools/monsters.html
   ============================================================ */
(function () {
  'use strict';

  var listEl = H.qs('#list');
  var detailEl = H.qs('#detail');
  var countEl = H.qs('#count');

  /* ---------- Filters vullen ---------- */
  var types = [], envs = [];
  MONSTERS.forEach(function (m) {
    if (types.indexOf(m.type) === -1) types.push(m.type);
    (m.env || []).forEach(function (e) { if (envs.indexOf(e) === -1) envs.push(e); });
  });
  types.sort(); envs.sort();
  types.forEach(function (t) { H.qs('#f-type').appendChild(new Option(t, t)); });
  envs.forEach(function (e) { H.qs('#f-env').appendChild(new Option(e, e)); });

  var CR_VALUES = [0, 0.125, 0.25, 0.5].concat(
    Array.apply(null, { length: 24 }).map(function (_, i) { return i + 1; })
  );
  CR_VALUES.forEach(function (cr) {
    H.qs('#f-cr-min').appendChild(new Option(crLabel(cr), cr));
    H.qs('#f-cr-max').appendChild(new Option(crLabel(cr), cr));
  });
  H.qs('#f-cr-min').value = '0';
  H.qs('#f-cr-max').value = '24';

  /* ---------- Lijst ---------- */
  function filtered() {
    var q = H.qs('#q').value.trim().toLowerCase();
    var type = H.qs('#f-type').value;
    var env = H.qs('#f-env').value;
    var lo = parseFloat(H.qs('#f-cr-min').value);
    var hi = parseFloat(H.qs('#f-cr-max').value);
    var sort = H.qs('#f-sort').value;

    var list = MONSTERS.filter(function (m) {
      if (type && m.type !== type) return false;
      if (env && (m.env || []).indexOf(env) === -1) return false;
      if (m.cr < lo || m.cr > hi) return false;
      if (!q) return true;
      return m.name.toLowerCase().indexOf(q) !== -1 ||
             m.type.indexOf(q) !== -1 ||
             (m.env || []).join(' ').toLowerCase().indexOf(q) !== -1;
    });

    list.sort(function (a, b) {
      if (sort === 'cr') return a.cr - b.cr || a.name.localeCompare(b.name);
      if (sort === 'hp') return b.hp - a.hp;
      return a.name.localeCompare(b.name);
    });
    return list;
  }

  function render() {
    var list = filtered();
    countEl.textContent = list.length + ' van ' + MONSTERS.length;

    if (!list.length) {
      listEl.innerHTML = '<div class="empty">Geen monsters gevonden met deze filters.</div>';
      return;
    }

    listEl.innerHTML = list.map(function (m) {
      return '<div class="stat-line" style="cursor:pointer" data-name="' + H.escape(m.name) + '">' +
        '<span><b>' + H.escape(m.name) + '</b><br><small>' + m.size + ' ' + m.type + ' · AC ' + m.ac + ' · ' + m.hp + ' HP</small></span>' +
        '<span>CR ' + crLabel(m.cr) + '<br><small>' + H.num(CR_XP[m.cr]) + ' XP</small></span></div>';
    }).join('');
  }

  /* ---------- Statblock ---------- */
  function abilityCell(label, score) {
    return '<div><b>' + label + '</b>' + score + ' (' + H.signed(H.mod(score)) + ')</div>';
  }

  function prop(label, value) {
    return value ? '<p class="sb-prop"><b>' + label + '</b> ' + H.escape(value) + '</p>' : '';
  }

  function showMonster(m) {
    var html =
      '<div class="panel">' +
        '<div class="panel-head no-print">' +
          '<h2 style="margin:0">Statblock</h2>' +
          '<div class="btn-group">' +
            '<button class="btn btn-sm" id="sb-roll-hp">Rol HP</button>' +
            '<button class="btn btn-sm" data-copy="#sb">Kopieer</button>' +
            '<button class="btn btn-sm" onclick="window.print()">Print</button>' +
          '</div>' +
        '</div>' +
        '<div class="statblock" id="sb">' +
          '<h3>' + H.escape(m.name) + '</h3>' +
          '<div class="sb-type">' + m.size + ' ' + m.type + ', ' + m.align + '</div>' +
          '<hr class="sb-rule">' +
          '<p class="sb-prop"><b>Armor Class</b> ' + m.ac + '</p>' +
          '<p class="sb-prop"><b>Hit Points</b> <span id="sb-hp">' + m.hp + '</span> (' + m.hd + ')</p>' +
          '<p class="sb-prop"><b>Speed</b> ' + H.escape(m.speed) + '</p>' +
          '<hr class="sb-rule">' +
          '<div class="sb-abilities">' +
            abilityCell('STR', m.str) + abilityCell('DEX', m.dex) + abilityCell('CON', m.con) +
            abilityCell('INT', m.int) + abilityCell('WIS', m.wis) + abilityCell('CHA', m.cha) +
          '</div>' +
          '<hr class="sb-rule">' +
          prop('Saving Throws', m.saves) +
          prop('Skills', m.skills) +
          prop('Damage Vulnerabilities', m.vuln) +
          prop('Damage Resistances', m.resist) +
          prop('Damage Immunities', m.immune) +
          prop('Condition Immunities', m.condImmune) +
          prop('Senses', m.senses) +
          prop('Languages', m.langs) +
          '<p class="sb-prop"><b>Challenge</b> ' + crLabel(m.cr) + ' (' + H.num(CR_XP[m.cr]) + ' XP)</p>' +
          '<hr class="sb-rule">' +
          (m.traits || []).map(function (t) {
            return '<p class="sb-action"><b>' + H.escape(t.n) + '.</b> ' + H.escape(t.d) + '</p>';
          }).join('') +
          ((m.actions || []).length ? '<h4 style="color:var(--red-soft);margin:14px 0 4px">Acties</h4>' : '') +
          (m.actions || []).map(function (a) {
            return '<p class="sb-action"><b>' + H.escape(a.n) + '.</b> ' + H.escape(a.d) + '</p>';
          }).join('') +
          ((m.legendary || []).length ? '<h4 style="color:var(--red-soft);margin:14px 0 4px">Legendarische acties</h4>' : '') +
          (m.legendary || []).map(function (a) {
            return '<p class="sb-action"><b>' + H.escape(a.n) + '.</b> ' + H.escape(a.d) + '</p>';
          }).join('') +
        '</div>' +
        '<div class="btn-group no-print" style="margin-top:14px">' +
          '<button class="btn" id="sb-to-tracker">Naar initiatief-tracker</button>' +
          '<button class="btn" id="sb-to-encounter">Naar encounter builder</button>' +
        '</div>' +
      '</div>';

    detailEl.innerHTML = html;

    H.on('#sb-roll-hp', 'click', function () {
      H.qs('#sb-hp').textContent = Math.max(1, Dice.total(m.hd));
    });
    H.on('#sb-to-tracker', 'click', function () {
      var q = H.store.get('encounter-queue', []);
      q.push({ name: m.name, count: 1 });
      H.store.set('encounter-queue', q);
      location.href = 'initiative.html';
    });
    H.on('#sb-to-encounter', 'click', function () {
      var b = H.store.get('encounter-builder', []);
      var e = b.filter(function (c) { return c.name === m.name; })[0];
      if (e) e.count++; else b.push({ name: m.name, count: 1 });
      H.store.set('encounter-builder', b);
      location.href = 'encounter.html';
    });
  }

  listEl.addEventListener('click', function (e) {
    var row = e.target.closest('[data-name]');
    if (!row) return;
    var m = MONSTERS.filter(function (x) { return x.name === row.getAttribute('data-name'); })[0];
    if (m) {
      showMonster(m);
      if (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) detailEl.scrollIntoView({ behavior: 'smooth' });
    }
  });

  ['#q', '#f-type', '#f-env', '#f-cr-min', '#f-cr-max', '#f-sort'].forEach(function (sel) {
    H.qs(sel).addEventListener('input', render);
    H.qs(sel).addEventListener('change', render);
  });

  render();
})();
