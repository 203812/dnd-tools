/* ============================================================
   rules-page.js - logica voor tools/rules.html
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

  function render() {
    var q = H.qs('#q').value.trim().toLowerCase();
    var html = '';

    /* Condities */
    var cond = RULES.condities.filter(function (c) {
      return match(q, c.n + ' ' + c.nl + ' ' + c.p.join(' '));
    });
    html += panel('Condities', cond.length ? '<div class="grid cols-2">' + cond.map(function (c) {
      return '<div class="result-box">' +
        '<h3 style="margin:0 0 6px"> ' + H.escape(c.n) + ' <span class="muted" style="font-size:.85rem;font-family:var(--font-body)">(' + H.escape(c.nl) + ')</span></h3>' +
        '<ul style="margin:0;padding-left:18px">' + c.p.map(function (p) { return '<li>' + H.escape(p) + '</li>'; }).join('') + '</ul>' +
      '</div>';
    }).join('') + '</div>' : '');

    /* Acties */
    var acties = RULES.acties.filter(function (a) { return match(q, a.n + ' ' + a.d); });
    html += panel('Acties in gevecht', acties.length ? acties.map(function (a) {
      return '<div class="stat-line"><span><b>' + H.escape(a.n) + '</b></span><span style="flex:2 1 60%;font-weight:400;text-align:left">' + H.escape(a.d) + '</span></div>';
    }).join('') : '');

    /* Dekking */
    var dekking = RULES.dekking.filter(function (d) { return match(q, d.n + ' ' + d.d); });
    html += panel('Dekking', dekking.length ? dekking.map(function (d) {
      return '<div class="stat-line"><span><b>' + H.escape(d.n) + '</b></span><span style="flex:2 1 60%;font-weight:400;text-align:left">' + H.escape(d.d) + '</span></div>';
    }).join('') : '');

    /* Rusten */
    var rust = RULES.rusten.filter(function (r) { return match(q, r.n + ' ' + r.d); });
    html += panel('Rusten', rust.length ? rust.map(function (r) {
      return '<div class="stat-line"><span><b>' + H.escape(r.n) + '</b></span><span style="flex:2 1 60%;font-weight:400;text-align:left">' + H.escape(r.d) + '</span></div>';
    }).join('') : '');

    /* Gevaren */
    var gevaar = RULES.vallen.filter(function (v) { return match(q, v.n + ' ' + v.d); });
    html += panel('Gevaren en omgeving', gevaar.length ? gevaar.map(function (v) {
      return '<div class="stat-line"><span><b>' + H.escape(v.n) + '</b></span><span style="flex:2 1 60%;font-weight:400;text-align:left">' + H.escape(v.d) + '</span></div>';
    }).join('') : '');

    /* DC's + reizen + vaardigheden: alleen zonder zoekterm of bij een treffer */
    var dcMatch = RULES.dcs.filter(function (d) { return match(q, d.n + ' dc moeilijkheid'); });
    html += panel('Richtlijnen voor DCs', dcMatch.length
      ? '<div class="grid cols-4">' + dcMatch.map(function (d) {
          return '<div class="result-box center"><div style="font-family:var(--font-display);font-size:1.6rem;color:var(--gold)">' + d.dc + '</div>' +
            '<div class="muted" style="font-size:.85rem">' + H.escape(d.n) + '</div></div>';
        }).join('') + '</div>'
      : '');

    var reizen = RULES.reizen.filter(function (r) { return match(q, r.tempo + ' ' + r.effect + ' reizen tempo'); });
    html += panel('Reistempo', reizen.length
      ? '<div class="table-wrap"><table><thead><tr><th>Tempo</th><th>Per uur</th><th>Per dag</th><th>Effect</th></tr></thead><tbody>' +
        reizen.map(function (r) {
          return '<tr><td>' + H.escape(r.tempo) + '</td><td>' + H.escape(r.perUur) + '</td><td>' + H.escape(r.perDag) + '</td><td>' + H.escape(r.effect) + '</td></tr>';
        }).join('') + '</tbody></table></div>'
      : '');

    var vaardig = RULES.vaardigheden.filter(function (v) { return match(q, v.n + ' ' + v.skills); });
    html += panel('Vaardigheden per ability', vaardig.length ? vaardig.map(function (v) {
      return '<div class="stat-line"><span><b>' + v.n + '</b></span><span style="font-weight:400">' + H.escape(v.skills) + '</span></div>';
    }).join('') : '');

    contentEl.innerHTML = html || '<div class="panel"><div class="empty">Niets gevonden voor deze zoekterm.</div></div>';
  }

  H.qs('#q').addEventListener('input', render);
  render();
})();
