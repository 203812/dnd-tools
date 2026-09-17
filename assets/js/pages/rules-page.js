/* ============================================================
   rules-page.js - logic for tools/rules.html
   ============================================================ */
(function () {
  'use strict';

  var contentEl = H.qs('#content');

  function match(q, text) {
    return !q || text.toLowerCase().indexOf(q) !== -1;
  }

  function panel(title, inner) {
    return inner ? '<div class="panel" style="margin-bottom:16px"><h2>' + title + '</h2>' + inner + '</div>' : '';
  }

  /* A row with a bold term on the left and the explanation on the right. */
  function defRow(term, text) {
    return '<div class="stat-line"><span><b>' + H.escape(term) + '</b></span>' +
      '<span style="flex:2 1 60%;font-weight:400;text-align:left">' + H.escape(text) + '</span></div>';
  }

  function render() {
    var q = H.qs('#q').value.trim().toLowerCase();
    var html = '';

    /* Conditions */
    var cond = RULES.conditions.filter(function (c) {
      return match(q, c.n + ' ' + c.p.join(' '));
    });
    html += panel('Conditions', cond.length ? '<div class="grid cols-2">' + cond.map(function (c) {
      return '<div class="result-box">' +
        '<h3 style="margin:0 0 6px">' + H.escape(c.n) + '</h3>' +
        '<ul style="margin:0;padding-left:18px">' + c.p.map(function (p) { return '<li>' + H.escape(p) + '</li>'; }).join('') + '</ul>' +
      '</div>';
    }).join('') + '</div>' : '');

    /* Actions */
    var actions = RULES.actions.filter(function (a) { return match(q, a.n + ' ' + a.d); });
    html += panel('Actions in combat', actions.length ? actions.map(function (a) {
      return defRow(a.n, a.d);
    }).join('') : '');

    /* Cover */
    var cover = RULES.cover.filter(function (d) { return match(q, d.n + ' ' + d.d); });
    html += panel('Cover', cover.length ? cover.map(function (d) {
      return defRow(d.n, d.d);
    }).join('') : '');

    /* Resting */
    var rest = RULES.resting.filter(function (r) { return match(q, r.n + ' ' + r.d); });
    html += panel('Resting', rest.length ? rest.map(function (r) {
      return defRow(r.n, r.d);
    }).join('') : '');

    /* Hazards */
    var hazards = RULES.hazards.filter(function (v) { return match(q, v.n + ' ' + v.d); });
    html += panel('Hazards and environment', hazards.length ? hazards.map(function (v) {
      return defRow(v.n, v.d);
    }).join('') : '');

    /* DCs */
    var dcMatch = RULES.dcs.filter(function (d) { return match(q, d.n + ' dc difficulty'); });
    html += panel('DC guidelines', dcMatch.length
      ? '<div class="grid cols-4">' + dcMatch.map(function (d) {
          return '<div class="result-box center"><div style="font-family:var(--font-display);font-size:1.6rem;color:var(--gold)">' + d.dc + '</div>' +
            '<div class="muted" style="font-size:.85rem">' + H.escape(d.n) + '</div></div>';
        }).join('') + '</div>'
      : '');

    /* Travel */
    var travel = RULES.travel.filter(function (r) { return match(q, r.pace + ' ' + r.effect + ' travel pace'); });
    html += panel('Travel pace', travel.length
      ? '<div class="table-wrap"><table><thead><tr><th>Pace</th><th>Per hour</th><th>Per day</th><th>Effect</th></tr></thead><tbody>' +
        travel.map(function (r) {
          return '<tr><td>' + H.escape(r.pace) + '</td><td>' + H.escape(r.perHour) + '</td><td>' + H.escape(r.perDay) + '</td><td>' + H.escape(r.effect) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : '');

    /* Skills by ability */
    var skills = RULES.skills.filter(function (v) { return match(q, v.n + ' ' + v.skills); });
    html += panel('Skills by ability', skills.length ? skills.map(function (v) {
      return '<div class="stat-line"><span><b>' + v.n + '</b></span><span style="font-weight:400">' + H.escape(v.skills) + '</span></div>';
    }).join('') : '');

    contentEl.innerHTML = html || '<div class="panel"><div class="empty">Nothing found for that search.</div></div>';
  }

  H.qs('#q').addEventListener('input', render);
  render();
})();
