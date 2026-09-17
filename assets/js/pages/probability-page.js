/* ============================================================
   probability-page.js - logic for tools/probability.html
   ============================================================ */
(function () {
  'use strict';

  var current = null;

  var PRESETS = ['1d20', '4d6kh3', 'adv', 'dis', '2d6', '8d6', '3d8+5', '1d20+7', '2d20kh1+5', '10d6'];
  PRESETS.forEach(function (p) {
    var b = H.el('button', 'chip', p);
    b.type = 'button';
    b.addEventListener('click', function () { H.qs('#notation').value = p; run(); });
    H.qs('#preset-chips').appendChild(b);
  });

  function showError(msg) {
    H.qs('#error-box').classList.remove('hidden');
    H.qs('#error-text').textContent = msg;
  }
  function clearError() { H.qs('#error-box').classList.add('hidden'); }

  /* ---------- Main calculation ---------- */
  function run() {
    var notation = H.qs('#notation').value.trim();
    try {
      current = Prob.analyse(notation);
      clearError();
    } catch (err) {
      showError(err.message);
      return;
    }
    renderHistogram();
    renderStats();
    renderTarget();
  }

  function renderHistogram() {
    var dist = current.dist, stats = current.stats;
    var values = stats.values;
    var maxP = Math.max.apply(null, values.map(function (v) { return dist[v]; }));
    var target = parseFloat(H.qs('#target').value);

    // With a very wide spread, group values into buckets so the bars stay readable.
    var bars = values;
    if (values.length > 160) {
      var bucketSize = Math.ceil(values.length / 160);
      var grouped = {};
      values.forEach(function (v, i) {
        var key = values[Math.floor(i / bucketSize) * bucketSize];
        grouped[key] = (grouped[key] || 0) + dist[v];
      });
      bars = Object.keys(grouped).map(parseFloat).sort(function (a, b) { return a - b; });
      maxP = Math.max.apply(null, bars.map(function (v) { return grouped[v]; }));
      dist = grouped;
    }

    H.qs('#hist').innerHTML = bars.map(function (v) {
      var p = dist[v];
      var height = Math.max(1, Math.round((p / maxP) * 100));
      var inRange = !isNaN(target) && v >= target;
      return '<div class="hist-bar' + (inRange ? ' in-range' : '') + '" style="height:' + height + '%">' +
        '<span class="hist-tip">' + v + ' · ' + H.pct(p) + '</span></div>';
    }).join('');

    H.qs('#axis-min').textContent = stats.min;
    H.qs('#axis-max').textContent = stats.max;

    var tag = H.qs('#method-tag');
    if (current.method === 'exact') {
      tag.textContent = 'exact';
      tag.className = 'tag green';
    } else {
      tag.textContent = 'simulated · ' + H.num(current.samples) + ' rolls';
      tag.className = 'tag blue';
    }
  }

  function renderStats() {
    var s = current.stats;
    H.qs('#stats-out').innerHTML =
      '<div class="stat-line"><span>Average</span><span>' + s.mean.toFixed(2) + '</span></div>' +
      '<div class="stat-line"><span>Median</span><span>' + s.median + '</span></div>' +
      '<div class="stat-line"><span>Most likely</span><span>' + s.mode + ' (' + H.pct(s.modeP) + ')</span></div>' +
      '<div class="stat-line"><span>Range</span><span>' + s.min + ' to ' + s.max + '</span></div>' +
      '<div class="stat-line"><span>Standard deviation</span><span>' + s.stdev.toFixed(2) + '</span></div>' +
      '<div class="stat-line"><span>Distinct outcomes</span><span>' + H.num(s.values.length) + '</span></div>';
  }

  function renderTarget() {
    var target = parseFloat(H.qs('#target').value);
    if (isNaN(target)) { H.qs('#target-out').innerHTML = '<div class="empty">Enter a target to compare against.</div>'; return; }

    var d = current.dist;
    H.qs('#target-out').innerHTML =
      '<div class="stat-line"><span>At least ' + target + '</span><span>' + H.pct(Prob.chance(d, '>=', target)) + '</span></div>' +
      '<div class="stat-line"><span>More than ' + target + '</span><span>' + H.pct(Prob.chance(d, '>', target)) + '</span></div>' +
      '<div class="stat-line"><span>Exactly ' + target + '</span><span>' + H.pct(Prob.chance(d, '=', target)) + '</span></div>' +
      '<div class="stat-line"><span>At most ' + target + '</span><span>' + H.pct(Prob.chance(d, '<=', target)) + '</span></div>' +
      '<div class="stat-line"><span>Less than ' + target + '</span><span>' + H.pct(Prob.chance(d, '<', target)) + '</span></div>';
  }

  /* ---------- Attack maths ---------- */
  function runAttack() {
    var diceNotation = H.qs('#a-dice').value.trim();
    var diceMean = 0;
    try {
      diceMean = Prob.analyse(diceNotation).stats.mean;
    } catch (err) {
      H.qs('#attack-out').innerHTML = '<div class="empty">Damage dice not understood: ' + H.escape(err.message) + '</div>';
      return;
    }

    var r = Prob.attack({
      bonus: parseInt(H.qs('#a-bonus').value, 10) || 0,
      ac: parseInt(H.qs('#a-ac').value, 10) || 10,
      critOn: parseInt(H.qs('#a-crit').value, 10) || 20,
      diceMean: diceMean,
      flat: parseInt(H.qs('#a-flat').value, 10) || 0,
      attacks: parseInt(H.qs('#a-attacks').value, 10) || 1,
      mode: H.qs('#a-mode').value
    });

    H.qs('#attack-out').innerHTML =
      '<div class="stat-line"><span>Needs on the d20</span><span>' + r.needed + '+</span></div>' +
      '<div class="stat-line"><span>Chance to hit</span><span>' + H.pct(r.hit) + '</span></div>' +
      '<div class="stat-line"><span>Chance to crit</span><span>' + H.pct(r.crit) + '</span></div>' +
      '<div class="stat-line"><span>Chance to miss</span><span>' + H.pct(r.miss) + '</span></div>' +
      '<div class="hr"></div>' +
      '<div class="stat-line"><span>Damage on a hit</span><span>' + r.onHit.toFixed(1) + '</span></div>' +
      '<div class="stat-line"><span>Damage on a crit</span><span>' + r.onCrit.toFixed(1) + '</span></div>' +
      '<div class="stat-line"><span>Average per attack</span><span>' + r.perAttack.toFixed(2) + '</span></div>' +
      '<div class="stat-line"><span><b>Damage per round</b></span><span><b>' + r.perRound.toFixed(2) + '</b></span></div>';
  }

  /* ---------- Wiring ---------- */
  H.qs('#prob-form').addEventListener('submit', function (e) { e.preventDefault(); run(); });
  H.qs('#target').addEventListener('input', function () {
    if (!current) return;
    renderTarget();
    renderHistogram();
  });

  ['#a-bonus', '#a-ac', '#a-attacks', '#a-dice', '#a-flat', '#a-crit', '#a-mode'].forEach(function (sel) {
    H.qs(sel).addEventListener('input', runAttack);
    H.qs(sel).addEventListener('change', runAttack);
  });

  run();
  runAttack();
})();
