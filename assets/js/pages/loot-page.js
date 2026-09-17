/* ============================================================
   loot-page.js - logica voor tools/loot.html
   ============================================================ */
(function () {
  'use strict';

  var MUNT = { cp: 'koperstukken', sp: 'zilverstukken', ep: 'elektrumstukken', gp: 'goudstukken', pp: 'platinastukken' };
  var IN_GP = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 };

  var outEl = H.qs('#loot-out');
  var results = [];

  /* ---------- Rolfuncties ---------- */
  function rollCoins(spec) {
    var coins = {};
    Object.keys(spec).forEach(function (k) {
      var v = Dice.total(spec[k]);
      if (v > 0) coins[k] = v;
    });
    return coins;
  }

  function rollIndividual(tier) {
    var row = H.weighted(TREASURE.individueel[tier]);
    return { titel: 'Individuele schat (CR ' + tier + ')', munten: rollCoins(row.munten), waardevol: [], items: [] };
  }

  function rollHoard(tier) {
    var t = TREASURE.hoard[tier];
    var out = { titel: 'Schatkamer (CR ' + tier + ')', munten: rollCoins(t.munten), waardevol: [], items: [] };

    var v = H.weighted(t.waardevol);
    if (v.type) {
      var aantal = Dice.total(v.aantal);
      var pool = v.type === 'gem' ? TREASURE.gems[v.waarde] : TREASURE.art[v.waarde];
      for (var i = 0; i < aantal; i++) {
        out.waardevol.push({
          naam: H.pick(pool),
          waarde: v.waarde,
          soort: v.type === 'gem' ? 'edelsteen' : 'kunstvoorwerp'
        });
      }
    }

    var it = H.weighted(t.items);
    if (it.tabel) {
      var n = typeof it.aantal === 'string' ? Dice.total(it.aantal) : it.aantal;
      for (var j = 0; j < n; j++) {
        out.items.push({ naam: H.pick(TREASURE.itemTabellen[it.tabel]), tabel: it.tabel });
      }
    }
    return out;
  }

  /* ---------- Weergave ---------- */
  function totalGp(res) {
    var total = 0;
    Object.keys(res.munten).forEach(function (k) { total += res.munten[k] * IN_GP[k]; });
    res.waardevol.forEach(function (w) { total += w.waarde; });
    return Math.round(total * 100) / 100;
  }

  function renderOne(res) {
    var munten = Object.keys(res.munten);
    var html = '<div class="result-box" style="margin-bottom:14px">';
    html += '<h3 style="margin-top:0">' + H.escape(res.titel) + '</h3>';

    if (munten.length) {
      html += munten.map(function (k) {
        return '<div class="stat-line"><span>' + MUNT[k] + '</span><span>' + H.num(res.munten[k]) + ' ' + k + '</span></div>';
      }).join('');
    } else {
      html += '<div class="stat-line"><span>Munten</span><span>geen</span></div>';
    }

    if (res.waardevol.length) {
      // groepeer identieke voorwerpen
      var groups = {};
      res.waardevol.forEach(function (w) {
        var key = w.naam + '|' + w.waarde;
        groups[key] = groups[key] || { naam: w.naam, waarde: w.waarde, soort: w.soort, n: 0 };
        groups[key].n++;
      });
      html += '<div class="hr"></div>';
      html += Object.keys(groups).map(function (k) {
        var g = groups[k];
        return '<div class="stat-line"><span>' + (g.n > 1 ? g.n + '× ' : '') + H.escape(g.naam) +
          '<br><small>' + g.soort + '</small></span><span>' + H.num(g.waarde) + ' gp p.st.</span></div>';
      }).join('');
    }

    if (res.items.length) {
      html += '<div class="hr"></div>';
      html += res.items.map(function (it) {
        return '<div class="stat-line"><span><b>' + H.escape(it.naam) + '</b></span><span class="tag gold">tabel ' + it.tabel + '</span></div>';
      }).join('');
    }

    html += '<div class="hr"></div>';
    html += '<div class="stat-line"><span><b>Totale waarde</b></span><span><b>' + H.num(totalGp(res)) + ' gp</b></span></div>';
    html += '</div>';
    return html;
  }

  function render() {
    if (!results.length) { outEl.innerHTML = '<div class="empty">Nog niets gerold.</div>'; return; }
    outEl.innerHTML = results.map(renderOne).join('');
    if (results.length > 1) {
      var sum = results.reduce(function (s, r) { return s + totalGp(r); }, 0);
      outEl.innerHTML += '<div class="result-box"><div class="stat-line"><span><b>Alles bij elkaar</b></span>' +
        '<span><b>' + H.num(Math.round(sum * 100) / 100) + ' gp</b></span></div></div>';
    }
  }

  /* ---------- Knoppen ---------- */
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
      var waardes = Object.keys(table);
      var waarde = H.pick(waardes);
      box.innerHTML = '<b>' + H.escape(H.pick(table[waarde])) + '</b><br><small>' +
        (what === 'gem' ? 'edelsteen' : 'kunstvoorwerp') + ' · ' + H.num(waarde) + ' gp</small>';
    } else {
      box.innerHTML = '<b>' + H.escape(H.pick(TREASURE.itemTabellen[what])) + '</b><br><small>magische-itemtabel ' + what + '</small>';
    }
  });

  /* ---------- Verzoek vanuit de encounter builder ---------- */
  var req = H.store.get('loot-request', null);
  if (req) {
    H.store.del('loot-request');
    var tier = req.cr <= 4 ? '0-4' : (req.cr <= 10 ? '5-10' : (req.cr <= 16 ? '11-16' : '17+'));
    H.qs('#f-cr').value = tier;
    H.qs('#f-type').value = req.type === 'hoard' ? 'hoard' : 'individueel';
    H.qs('#btn-roll').click();
    H.toast('Schat gerold voor CR ' + tier);
  }

  render();
})();
