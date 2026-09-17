/* ============================================================
   loot-page.js - logic for tools/loot.html
   ============================================================ */
(function () {
  'use strict';

  var COIN = { cp: 'copper pieces', sp: 'silver pieces', ep: 'electrum pieces', gp: 'gold pieces', pp: 'platinum pieces' };
  var IN_GP = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 };

  var outEl = H.qs('#loot-out');
  var results = [];

  /* ---------- Rolling ---------- */
  function rollCoins(spec) {
    var coins = {};
    Object.keys(spec).forEach(function (k) {
      var v = Dice.total(spec[k]);
      if (v > 0) coins[k] = v;
    });
    return coins;
  }

  function rollIndividual(tier) {
    var row = H.weighted(TREASURE.individual[tier]);
    return { title: 'Individual treasure (CR ' + tier + ')', coins: rollCoins(row.coins), valuables: [], items: [] };
  }

  function rollHoard(tier) {
    var t = TREASURE.hoard[tier];
    var out = { title: 'Treasure hoard (CR ' + tier + ')', coins: rollCoins(t.coins), valuables: [], items: [] };

    var v = H.weighted(t.valuables);
    if (v.type) {
      var count = Dice.total(v.count);
      var pool = v.type === 'gem' ? TREASURE.gems[v.value] : TREASURE.art[v.value];
      for (var i = 0; i < count; i++) {
        out.valuables.push({
          name: H.pick(pool),
          value: v.value,
          kind: v.type === 'gem' ? 'gemstone' : 'art object'
        });
      }
    }

    var it = H.weighted(t.items);
    if (it.table) {
      var n = typeof it.count === 'string' ? Dice.total(it.count) : it.count;
      for (var j = 0; j < n; j++) {
        out.items.push({ name: H.pick(TREASURE.itemTables[it.table]), table: it.table });
      }
    }
    return out;
  }

  /* ---------- Display ---------- */
  function totalGp(res) {
    var total = 0;
    Object.keys(res.coins).forEach(function (k) { total += res.coins[k] * IN_GP[k]; });
    res.valuables.forEach(function (w) { total += w.value; });
    return Math.round(total * 100) / 100;
  }

  function renderOne(res) {
    var coins = Object.keys(res.coins);
    var html = '<div class="result-box" style="margin-bottom:14px">';
    html += '<h3 style="margin-top:0">' + H.escape(res.title) + '</h3>';

    if (coins.length) {
      html += coins.map(function (k) {
        return '<div class="stat-line"><span>' + COIN[k] + '</span><span>' + H.num(res.coins[k]) + ' ' + k + '</span></div>';
      }).join('');
    } else {
      html += '<div class="stat-line"><span>Coins</span><span>none</span></div>';
    }

    if (res.valuables.length) {
      // group identical items together
      var groups = {};
      res.valuables.forEach(function (w) {
        var key = w.name + '|' + w.value;
        groups[key] = groups[key] || { name: w.name, value: w.value, kind: w.kind, n: 0 };
        groups[key].n++;
      });
      html += '<div class="hr"></div>';
      html += Object.keys(groups).map(function (k) {
        var g = groups[k];
        return '<div class="stat-line"><span>' + (g.n > 1 ? g.n + '× ' : '') + H.escape(g.name) +
          '<br><small>' + g.kind + '</small></span><span>' + H.num(g.value) + ' gp each</span></div>';
      }).join('');
    }

    if (res.items.length) {
      html += '<div class="hr"></div>';
      html += res.items.map(function (it) {
        return '<div class="stat-line"><span><b>' + H.escape(it.name) + '</b></span><span class="tag gold">table ' + it.table + '</span></div>';
      }).join('');
    }

    html += '<div class="hr"></div>';
    html += '<div class="stat-line"><span><b>Total value</b></span><span><b>' + H.num(totalGp(res)) + ' gp</b></span></div>';
    html += '</div>';
    return html;
  }

  function render() {
    if (!results.length) { outEl.innerHTML = '<div class="empty">Nothing rolled yet.</div>'; return; }
    outEl.innerHTML = results.map(renderOne).join('');
    if (results.length > 1) {
      var sum = results.reduce(function (s, r) { return s + totalGp(r); }, 0);
      outEl.innerHTML += '<div class="result-box"><div class="stat-line"><span><b>Everything together</b></span>' +
        '<span><b>' + H.num(Math.round(sum * 100) / 100) + ' gp</b></span></div></div>';
    }
  }

  /* ---------- Buttons ---------- */
  H.on('#btn-roll', 'click', function () {
    var type = H.qs('#f-type').value;
    var tier = H.qs('#f-cr').value;
    var times = H.clamp(parseInt(H.qs('#f-times').value, 10) || 1, 1, 20);

    results = [];
    for (var i = 0; i < times; i++) {
      results.push(type === 'hoard' ? rollHoard(tier) : rollIndividual(tier));
    }
    render();
  });

  H.on('#btn-clear', 'click', function () { results = []; render(); });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-single]');
    if (!btn) return;
    var what = btn.getAttribute('data-single');
    var box = H.qs('#single-result');
    box.classList.remove('hidden');

    if (what === 'gem' || what === 'art') {
      var table = what === 'gem' ? TREASURE.gems : TREASURE.art;
      var values = Object.keys(table);
      var value = H.pick(values);
      box.innerHTML = '<b>' + H.escape(H.pick(table[value])) + '</b><br><small>' +
        (what === 'gem' ? 'gemstone' : 'art object') + ' · ' + H.num(value) + ' gp</small>';
    } else {
      box.innerHTML = '<b>' + H.escape(H.pick(TREASURE.itemTables[what])) + '</b><br><small>magic item table ' + what + '</small>';
    }
  });

  /* ---------- Request handed over from the encounter builder ---------- */
  var req = H.store.get('loot-request', null);
  if (req) {
    H.store.del('loot-request');
    var tier = req.cr <= 4 ? '0-4' : (req.cr <= 10 ? '5-10' : (req.cr <= 16 ? '11-16' : '17+'));
    H.qs('#f-cr').value = tier;
    H.qs('#f-type').value = req.type === 'hoard' ? 'hoard' : 'individual';
    H.qs('#btn-roll').click();
    H.toast('Treasure rolled for CR ' + tier);
  }

  render();
})();
