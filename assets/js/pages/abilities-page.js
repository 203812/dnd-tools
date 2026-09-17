/* ============================================================
   abilities-page.js - logic for tools/abilities.html
   ============================================================ */
(function () {
  'use strict';

  var ABILITIES = [
    { k: 'str', n: 'Strength' }, { k: 'dex', n: 'Dexterity' }, { k: 'con', n: 'Constitution' },
    { k: 'int', n: 'Intelligence' }, { k: 'wis', n: 'Wisdom' }, { k: 'cha', n: 'Charisma' }
  ];

  var COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
  var ARRAY = [15, 14, 13, 12, 10, 8];
  var BUDGET = 27;

  /* Racial bonuses from the SRD 5.1 */
  var RACES = {
    'None': {},
    'Human': { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    'Hill Dwarf': { con: 2, wis: 1 },
    'Mountain Dwarf': { con: 2, str: 2 },
    'High Elf': { dex: 2, int: 1 },
    'Wood Elf': { dex: 2, wis: 1 },
    'Dark Elf (Drow)': { dex: 2, cha: 1 },
    'Lightfoot Halfling': { dex: 2, cha: 1 },
    'Stout Halfling': { dex: 2, con: 1 },
    'Rock Gnome': { int: 2, con: 1 },
    'Half-elf': { cha: 2 },
    'Half-orc': { str: 2, con: 1 },
    'Dragonborn': { str: 2, cha: 1 },
    'Tiefling': { int: 1, cha: 2 }
  };

  Object.keys(RACES).forEach(function (r) { H.qs('#f-race').appendChild(new Option(r, r)); });

  var base = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
  var pool = [];          // available values for array/roll
  var assigned = {};      // ability -> index in pool

  function method() { return H.qs('#f-method').value; }
  function bonuses() { return RACES[H.qs('#f-race').value] || {}; }

  function pointsUsed() {
    return ABILITIES.reduce(function (s, a) { return s + (COST[base[a.k]] || 0); }, 0);
  }

  function finalScore(k) {
    return (base[k] || 0) + (bonuses()[k] || 0);
  }

  /* ---------- Rendering ---------- */
  function render() {
    var m = method();
    var usePool = (m === 'array' || m === 'roll');

    H.qs('#pool').classList.toggle('hidden', !usePool);
    H.qs('#points-left').classList.toggle('hidden', m !== 'pointbuy');
    H.qs('#btn-roll').classList.toggle('hidden', m !== 'roll');

    if (m === 'pointbuy') {
      var left = BUDGET - pointsUsed();
      var el = H.qs('#points-left');
      el.textContent = left + ' points left';
      el.className = 'tag ' + (left < 0 ? 'red' : (left === 0 ? 'green' : 'gold'));
    }

    H.qs('#score-rows').innerHTML = ABILITIES.map(function (a) {
      var bonus = bonuses()[a.k] || 0;
      var total = finalScore(a.k);
      var controls;

      if (m === 'pointbuy') {
        controls =
          '<button class="btn btn-sm" data-k="' + a.k + '" data-act="dec">&#8722;</button>' +
          '<span style="min-width:30px;display:inline-block;text-align:center" class="mono">' + base[a.k] + '</span>' +
          '<button class="btn btn-sm" data-k="' + a.k + '" data-act="inc">+</button>';
      } else if (usePool) {
        var opts = '<option value="">&mdash;</option>' + pool.map(function (v, i) {
          var takenBy = Object.keys(assigned).filter(function (kk) { return assigned[kk] === i; })[0];
          if (takenBy && takenBy !== a.k) return '';
          return '<option value="' + i + '"' + (assigned[a.k] === i ? ' selected' : '') + '>' + v + '</option>';
        }).join('');
        controls = '<select data-k="' + a.k + '" data-act="assign" style="width:80px">' + opts + '</select>';
      } else {
        controls = '<input type="number" data-k="' + a.k + '" data-act="manual" value="' + base[a.k] + '" min="1" max="30" style="width:80px">';
      }

      return '<div class="stat-line" style="align-items:center">' +
        '<span><b>' + a.n + '</b>' + (bonus ? ' <span class="tag green">+' + bonus + '</span>' : '') + '</span>' +
        '<span class="btn-group" style="align-items:center">' + controls +
          '<span style="min-width:74px;text-align:right">= <b>' + total + '</b> (' + H.signed(H.mod(total)) + ')</span>' +
        '</span></div>';
    }).join('');

    if (usePool) {
      H.qs('#pool-chips').innerHTML = pool.map(function (v, i) {
        var taken = Object.keys(assigned).some(function (kk) { return assigned[kk] === i; });
        return '<span class="chip' + (taken ? '' : ' active') + '">' + v + '</span>';
      }).join('');
    }

    renderSummary();
  }

  function renderSummary() {
    var level = H.clamp(parseInt(H.qs('#f-level').value, 10) || 1, 1, 20);
    var prof = Math.floor((level - 1) / 4) + 2;
    var totals = ABILITIES.map(function (a) { return finalScore(a.k); });
    var sum = totals.reduce(function (s, v) { return s + v; }, 0);
    var mods = totals.reduce(function (s, v) { return s + H.mod(v); }, 0);

    H.qs('#summary').innerHTML =
      '<div class="stat-line"><span>Sum of scores</span><span>' + sum + '</span></div>' +
      '<div class="stat-line"><span>Sum of modifiers</span><span>' + H.signed(mods) + '</span></div>' +
      '<div class="stat-line"><span>Highest score</span><span>' + Math.max.apply(null, totals) + '</span></div>' +
      '<div class="stat-line"><span>Proficiency bonus (level ' + level + ')</span><span>' + H.signed(prof) + '</span></div>' +
      '<div class="stat-line"><span>Spell save DC (8 + prof + mod)</span><span>' +
        (8 + prof + Math.max.apply(null, totals.map(function (t) { return H.mod(t); }))) + ' using your best score</span></div>' +
      '<div class="hr"></div>' +
      ABILITIES.map(function (a) {
        return '<div class="stat-line"><span>' + a.n + '</span><span>' + finalScore(a.k) +
          ' (' + H.signed(H.mod(finalScore(a.k))) + ') · save ' + H.signed(H.mod(finalScore(a.k))) + '</span></div>';
      }).join('');
  }

  /* ---------- Interaction ---------- */
  H.qs('#score-rows').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn || method() !== 'pointbuy') return;
    var k = btn.getAttribute('data-k');
    var act = btn.getAttribute('data-act');
    if (act === 'inc' && base[k] < 15) {
      if (pointsUsed() - COST[base[k]] + COST[base[k] + 1] > BUDGET) { H.toast('Not enough points'); return; }
      base[k]++;
    }
    if (act === 'dec' && base[k] > 8) base[k]--;
    render();
  });

  H.qs('#score-rows').addEventListener('change', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var k = el.getAttribute('data-k');

    if (el.getAttribute('data-act') === 'assign') {
      if (el.value === '') delete assigned[k];
      else assigned[k] = parseInt(el.value, 10);
      base[k] = el.value === '' ? 0 : pool[parseInt(el.value, 10)];
    }
    if (el.getAttribute('data-act') === 'manual') {
      base[k] = H.clamp(parseInt(el.value, 10) || 0, 1, 30);
    }
    render();
  });

  function rollPool() {
    pool = [];
    for (var i = 0; i < 6; i++) pool.push(Dice.total('4d6kh3'));
    pool.sort(function (a, b) { return b - a; });
    assigned = {};
    ABILITIES.forEach(function (a) { base[a.k] = 0; });
  }

  function setupMethod() {
    var m = method();
    if (m === 'pointbuy') {
      ABILITIES.forEach(function (a) { base[a.k] = 8; });
    } else if (m === 'array') {
      pool = ARRAY.slice();
      assigned = {};
      ABILITIES.forEach(function (a) { base[a.k] = 0; });
    } else if (m === 'roll') {
      rollPool();
    } else {
      ABILITIES.forEach(function (a) { base[a.k] = base[a.k] || 10; });
    }
    render();
  }

  H.qs('#f-method').addEventListener('change', setupMethod);
  H.qs('#f-race').addEventListener('change', render);
  H.qs('#f-level').addEventListener('input', renderSummary);
  H.on('#btn-roll', 'click', function () { rollPool(); render(); });
  H.on('#btn-reset', 'click', setupMethod);

  setupMethod();
})();
