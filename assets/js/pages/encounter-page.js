/* ============================================================
   encounter-page.js - logic for tools/encounter.html
   XP thresholds and multipliers follow the DMG / SRD.
   ============================================================ */
(function () {
  'use strict';

  /* XP thresholds per character level: [easy, medium, hard, deadly] */
  var THRESHOLDS = {
    1: [25, 50, 75, 100], 2: [50, 100, 150, 200], 3: [75, 150, 225, 400],
    4: [125, 250, 375, 500], 5: [250, 500, 750, 1100], 6: [300, 600, 900, 1400],
    7: [350, 750, 1100, 1700], 8: [450, 900, 1400, 2100], 9: [550, 1100, 1600, 2400],
    10: [600, 1200, 1900, 2800], 11: [800, 1600, 2400, 3600], 12: [1000, 2000, 3000, 4500],
    13: [1100, 2200, 3400, 5100], 14: [1250, 2500, 3800, 5700], 15: [1400, 2800, 4300, 6400],
    16: [1600, 3200, 4800, 7200], 17: [2000, 3900, 5900, 8800], 18: [2100, 4200, 6300, 9500],
    19: [2400, 4900, 7300, 10900], 20: [2800, 5700, 8500, 12700]
  };

  /* Daily XP budget per character (adventuring day) */
  var DAILY = {
    1: 300, 2: 600, 3: 1200, 4: 1700, 5: 3500, 6: 4000, 7: 5000, 8: 6000, 9: 7500, 10: 9000,
    11: 10500, 12: 11500, 13: 13500, 14: 15000, 15: 18000, 16: 20000, 17: 25000, 18: 27000,
    19: 30000, 20: 40000
  };

  /* Multiplier scale; party size shifts one step up or down */
  var MULT_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

  function baseStep(count) {
    if (count <= 1) return 1;      // x1
    if (count === 2) return 2;     // x1.5
    if (count <= 6) return 3;      // x2
    if (count <= 10) return 4;     // x2.5
    if (count <= 14) return 5;     // x3
    return 6;                      // x4
  }

  function multiplier(monsterCount, partySize) {
    if (monsterCount === 0) return 1;
    var step = baseStep(monsterCount);
    if (partySize < 3) step += 1;
    else if (partySize >= 6) step -= 1;
    return MULT_STEPS[H.clamp(step, 0, MULT_STEPS.length - 1)];
  }

  /* ---------- State ---------- */
  var chosen = H.store.get('encounter-builder', []); // [{name, count}]

  var pCount = H.qs('#p-count');
  var pLevel = H.qs('#p-level');

  /* ---------- Filling the CR filters ---------- */
  var CR_VALUES = [0, 0.125, 0.25, 0.5].concat(
    Array.apply(null, { length: 24 }).map(function (_, i) { return i + 1; })
  );
  var crMin = H.qs('#f-cr-min'), crMax = H.qs('#f-cr-max');
  CR_VALUES.forEach(function (cr) {
    crMin.appendChild(new Option(crLabel(cr), cr));
    crMax.appendChild(new Option(crLabel(cr), cr));
  });
  crMin.value = '0';
  crMax.value = '24';

  /* ---------- Rendering ---------- */
  function renderThresholds() {
    var n = H.clamp(parseInt(pCount.value, 10) || 1, 1, 12);
    var lvl = H.clamp(parseInt(pLevel.value, 10) || 1, 1, 20);
    var t = THRESHOLDS[lvl];
    var labels = ['Easy', 'Medium', 'Hard', 'Deadly'];
    H.qs('#thresholds').innerHTML = labels.map(function (l, i) {
      return '<div class="stat-line"><span>' + l + '</span><span>' + H.num(t[i] * n) + ' XP</span></div>';
    }).join('') +
      '<div class="stat-line"><span>Daily budget</span><span>' + H.num(DAILY[lvl] * n) + ' XP</span></div>';
  }

  function renderChosen() {
    if (!chosen.length) {
      H.qs('#chosen').innerHTML = '<div class="empty">No monsters chosen yet.</div>';
      return;
    }
    H.qs('#chosen').innerHTML = chosen.map(function (c, i) {
      var m = monsterByName(c.name);
      return '<div class="stat-line">' +
        '<span><b>' + H.escape(c.name) + '</b><br><small>CR ' + crLabel(m.cr) + ' · ' + H.num(CR_XP[m.cr]) + ' XP each</small></span>' +
        '<span class="btn-group" style="align-items:center">' +
          '<button class="btn btn-sm" data-i="' + i + '" data-act="minus">&#8722;</button>' +
          '<span style="min-width:24px;display:inline-block;text-align:center">' + c.count + '</span>' +
          '<button class="btn btn-sm" data-i="' + i + '" data-act="plus">+</button>' +
          '<button class="btn btn-sm btn-danger" data-i="' + i + '" data-act="del">&#10005;</button>' +
        '</span></div>';
    }).join('');
  }

  function renderTotals() {
    var partySize = H.clamp(parseInt(pCount.value, 10) || 1, 1, 12);
    var lvl = H.clamp(parseInt(pLevel.value, 10) || 1, 1, 20);

    var raw = 0, count = 0;
    chosen.forEach(function (c) {
      var m = monsterByName(c.name);
      raw += (CR_XP[m.cr] || 0) * c.count;
      count += c.count;
    });

    var mult = multiplier(count, partySize);
    var adj = Math.round(raw * mult);
    var t = THRESHOLDS[lvl].map(function (x) { return x * partySize; });

    var diff = 'Trivial', cls = 'muted';
    if (adj >= t[3]) { diff = 'Deadly'; cls = 'tag red'; }
    else if (adj >= t[2]) { diff = 'Hard'; cls = 'tag gold'; }
    else if (adj >= t[1]) { diff = 'Medium'; cls = 'tag blue'; }
    else if (adj >= t[0]) { diff = 'Easy'; cls = 'tag green'; }

    H.qs('#r-raw').textContent = H.num(raw) + ' XP';
    H.qs('#r-count').textContent = count;
    H.qs('#r-mult').textContent = '×' + mult;
    H.qs('#r-adj').textContent = H.num(adj) + ' XP';
    H.qs('#r-diff').innerHTML = '<span class="' + cls + '">' + diff + '</span>';
    H.qs('#r-per').textContent = H.num(Math.floor(raw / partySize)) + ' XP';
    H.qs('#r-day').textContent = Math.round((adj / (DAILY[lvl] * partySize)) * 100) + '%';
  }

  function monsterByName(name) {
    return MONSTERS.filter(function (m) { return m.name === name; })[0];
  }

  function refresh() {
    H.store.set('encounter-builder', chosen);
    renderThresholds();
    renderChosen();
    renderTotals();
  }

  /* ---------- Monster list ---------- */
  function renderSearch() {
    var q = H.qs('#m-search').value.trim().toLowerCase();
    var lo = parseFloat(crMin.value), hi = parseFloat(crMax.value);

    var list = MONSTERS.filter(function (m) {
      if (m.cr < lo || m.cr > hi) return false;
      if (!q) return true;
      return m.name.toLowerCase().indexOf(q) !== -1 || m.type.indexOf(q) !== -1 ||
             (m.env || []).join(' ').toLowerCase().indexOf(q) !== -1;
    });

    if (!list.length) { H.qs('#m-results').innerHTML = '<div class="empty">Nothing found.</div>'; return; }

    H.qs('#m-results').innerHTML = list.map(function (m) {
      return '<div class="stat-line" style="cursor:pointer" data-add="' + H.escape(m.name) + '">' +
        '<span>' + H.escape(m.name) + '<br><small>' + m.type + ' · ' + (m.env || []).join(', ') + '</small></span>' +
        '<span>CR ' + crLabel(m.cr) + '<br><small>' + H.num(CR_XP[m.cr]) + ' XP</small></span></div>';
    }).join('');
  }

  H.qs('#m-results').addEventListener('click', function (e) {
    var row = e.target.closest('[data-add]');
    if (!row) return;
    addMonster(row.getAttribute('data-add'));
  });

  function addMonster(name) {
    var existing = chosen.filter(function (c) { return c.name === name; })[0];
    if (existing) existing.count++;
    else chosen.push({ name: name, count: 1 });
    refresh();
  }

  H.qs('#chosen').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    var i = parseInt(btn.getAttribute('data-i'), 10);
    switch (btn.getAttribute('data-act')) {
      case 'plus': chosen[i].count++; break;
      case 'minus': chosen[i].count--; if (chosen[i].count <= 0) chosen.splice(i, 1); break;
      case 'del': chosen.splice(i, 1); break;
    }
    refresh();
  });

  /* ---------- Buttons ---------- */
  H.on('#btn-clear', 'click', function () { chosen = []; refresh(); });

  H.on('#btn-random', 'click', function () {
    // fills up to roughly the "hard" threshold
    var partySize = H.clamp(parseInt(pCount.value, 10) || 1, 1, 12);
    var lvl = H.clamp(parseInt(pLevel.value, 10) || 1, 1, 20);
    var target = THRESHOLDS[lvl][2] * partySize;

    var pool = MONSTERS.filter(function (m) { return CR_XP[m.cr] <= target && CR_XP[m.cr] > 0; });
    if (!pool.length) { H.toast('No suitable monsters found'); return; }

    chosen = [];
    var guard = 0;
    while (guard++ < 30) {
      var m = H.pick(pool);
      var existing = chosen.filter(function (c) { return c.name === m.name; })[0];
      if (existing) existing.count++; else chosen.push({ name: m.name, count: 1 });

      var raw = 0, count = 0;
      chosen.forEach(function (c) { raw += CR_XP[monsterByName(c.name).cr] * c.count; count += c.count; });
      if (raw * multiplier(count, partySize) >= target) break;
    }
    refresh();
  });

  H.on('#btn-to-tracker', 'click', function () {
    if (!chosen.length) return;
    H.store.set('encounter-queue', chosen);
  });

  H.on('#btn-loot', 'click', function () {
    var maxCr = 0;
    chosen.forEach(function (c) { maxCr = Math.max(maxCr, monsterByName(c.name).cr); });
    H.store.set('loot-request', { cr: maxCr, type: chosen.length > 2 ? 'hoard' : 'individual' });
    location.href = 'loot.html';
  });

  /* ---------- Input ---------- */
  [pCount, pLevel].forEach(function (el) { el.addEventListener('input', refresh); });
  H.qs('#m-search').addEventListener('input', renderSearch);
  crMin.addEventListener('change', renderSearch);
  crMax.addEventListener('change', renderSearch);

  renderSearch();
  refresh();
})();
