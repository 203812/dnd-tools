/* ============================================================
   dice-page.js - logic for tools/dice.html
   ============================================================ */
(function () {
  'use strict';

  var form = H.qs('#dice-form');
  var input = H.qs('#notation');
  var timesInput = H.qs('#times');
  var labelInput = H.qs('#label');
  var resultEmpty = H.qs('#result-empty');
  var resultBody = H.qs('#result-body');
  var totalEl = H.qs('#total');
  var breakEl = H.qs('#breakdown');
  var metaEl = H.qs('#meta');
  var multiEl = H.qs('#multi-list');
  var historyEl = H.qs('#history');

  var history = H.store.get('dice-history', []);

  /* ---------- Buttons ---------- */
  var DICE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
  DICE.forEach(function (d) {
    var b = H.el('button', 'chip', d);
    b.type = 'button';
    b.addEventListener('click', function () {
      // clicking adds one to the same die already in the input
      var cur = input.value.trim();
      var re = new RegExp('(^|[+\\-*/(])(\\d*)' + d + '(?![0-9a-z])');
      var m = re.exec(cur);
      if (m) {
        var count = (m[2] === '' ? 1 : parseInt(m[2], 10)) + 1;
        input.value = cur.replace(re, m[1] + count + d);
      } else {
        input.value = cur ? cur + '+1' + d : '1' + d;
      }
      input.focus();
    });
    H.qs('#die-buttons').appendChild(b);
  });

  var PRESETS = [
    { l: 'Attack', n: '1d20+5' }, { l: 'Advantage', n: 'adv' }, { l: 'Disadvantage', n: 'dis' },
    { l: 'Ability score', n: '4d6kh3' }, { l: 'Fireball', n: '8d6' }, { l: 'Healing word', n: '1d4+3' },
    { l: 'Percentile', n: '1d%' }, { l: 'Full stat line', n: '6#4d6kh3' }, { l: 'Death save', n: '1d20' },
    { l: 'Sneak attack', n: '1d6+3d6' }, { l: 'Greatsword', n: '2d6+4' }
  ];
  PRESETS.forEach(function (p) {
    var b = H.el('button', 'chip', p.l);
    b.type = 'button';
    b.title = p.n;
    b.addEventListener('click', function () { input.value = p.n; roll(); });
    H.qs('#preset-buttons').appendChild(b);
  });

  /* ---------- Rolling ---------- */
  function roll() {
    var notation = input.value.trim();
    var times = H.clamp(parseInt(timesInput.value, 10) || 1, 1, 50);
    var label = labelInput.value.trim();

    resultEmpty.classList.add('hidden');
    resultBody.classList.remove('hidden');
    multiEl.innerHTML = '';

    var results;
    try {
      // "N#expr" typed in the field itself takes precedence over the count field
      results = /#/.test(notation) ? Dice.rollMany(notation) : (function () {
        var out = [];
        for (var i = 0; i < times; i++) out.push(Dice.roll(notation));
        return out;
      })();
    } catch (err) {
      totalEl.textContent = '!';
      totalEl.className = 'dice-total fumble';
      breakEl.textContent = err.message;
      metaEl.textContent = '';
      return;
    }

    var first = results[0];
    var sum = results.reduce(function (s, r) { return s + r.total; }, 0);

    totalEl.textContent = results.length > 1 ? sum : first.total;
    totalEl.className = 'dice-total roll-anim ' + critClass(first);
    void totalEl.offsetWidth; // restart the animation
    breakEl.innerHTML = Dice.breakdownHtml(first);

    var metaParts = [];
    if (label) metaParts.push(label);
    metaParts.push(H.escape(notation));
    if (results.length > 1) metaParts.push(results.length + ' rolls, total ' + sum + ', average ' + (sum / results.length).toFixed(1));
    metaEl.textContent = metaParts.join(' · ');

    if (results.length > 1) {
      results.forEach(function (r, i) {
        var row = H.el('div', 'stat-line');
        row.innerHTML = '<span>#' + (i + 1) + ' &nbsp;' + Dice.breakdownHtml(r) + '</span><span>' + r.total + '</span>';
        multiEl.appendChild(row);
      });
    }

    addHistory({
      label: label,
      notation: notation,
      totals: results.map(function (r) { return r.total; }),
      breakdown: results.length === 1 ? stripTags(Dice.breakdownHtml(first)) : '',
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    });
  }

  function critClass(res) {
    // highlight a natural 20 or 1 on a single d20
    var d20 = null, count = 0;
    res.terms.forEach(function (t) {
      t.dice.forEach(function (d) { if (d.sides === 20 && !d.dropped) { d20 = d.value; count++; } });
    });
    if (count !== 1) return '';
    if (d20 === 20) return 'crit';
    if (d20 === 1) return 'fumble';
    return '';
  }

  function stripTags(html) {
    var tmp = H.el('div', null, html);
    return tmp.textContent.replace(/\s+/g, ' ').trim();
  }

  /* ---------- History ---------- */
  function addHistory(entry) {
    history.unshift(entry);
    if (history.length > 60) history.length = 60;
    H.store.set('dice-history', history);
    renderHistory();
  }

  function renderHistory() {
    if (!history.length) {
      historyEl.innerHTML = '<div class="empty">No rolls yet.</div>';
      return;
    }
    historyEl.innerHTML = history.map(function (h) {
      var totals = h.totals.length > 1
        ? h.totals.join(', ') + ' (∑ ' + h.totals.reduce(function (a, b) { return a + b; }, 0) + ')'
        : h.totals[0];
      return '<div class="stat-line">' +
        '<span>' + (h.label ? '<b>' + H.escape(h.label) + '</b> · ' : '') +
          '<span class="mono">' + H.escape(h.notation) + '</span>' +
          (h.breakdown ? '<br><small>' + H.escape(h.breakdown) + '</small>' : '') +
        '</span>' +
        '<span>' + totals + '<br><small>' + h.time + '</small></span>' +
      '</div>';
    }).join('');
  }

  H.on('#clear-history', 'click', function () {
    history = [];
    H.store.set('dice-history', history);
    renderHistory();
    H.toast('History cleared');
  });

  H.on('#copy-history', 'click', function () {
    if (!history.length) { H.toast('Nothing to copy'); return; }
    H.copy(history.map(function (h) {
      return h.time + '  ' + (h.label ? h.label + ' - ' : '') + h.notation + ' = ' + h.totals.join(', ');
    }).join('\n'));
  });

  /* ---------- Input ---------- */
  form.addEventListener('submit', function (e) { e.preventDefault(); roll(); });

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (e.key.toLowerCase() === 'r' && !typing && !e.ctrlKey && !e.metaKey) { e.preventDefault(); roll(); }
  });

  renderHistory();
  input.focus();
  input.select();
})();
