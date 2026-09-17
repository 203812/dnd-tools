/* ============================================================
   spells-page.js - logic for tools/spells.html
   ============================================================ */
(function () {
  'use strict';

  var levels = [];  // active level filters; empty means all

  SPELL_CLASSES.forEach(function (c) { H.qs('#f-class').appendChild(new Option(c, c)); });
  SPELL_SCHOOLS.forEach(function (s) { H.qs('#f-school').appendChild(new Option(s, s)); });

  /* Level chips */
  var chipHost = H.qs('#level-chips');
  ['Cantrip', '1', '2', '3', '4', '5', '6', '7', '8', '9'].forEach(function (label, i) {
    var b = H.el('button', 'chip', label);
    b.type = 'button';
    b.setAttribute('data-lvl', i);
    chipHost.appendChild(b);
  });

  chipHost.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lvl]');
    if (!b) return;
    var lvl = parseInt(b.getAttribute('data-lvl'), 10);
    var i = levels.indexOf(lvl);
    if (i === -1) levels.push(lvl); else levels.splice(i, 1);
    b.classList.toggle('active');
    render();
  });

  function lvlLabel(l) { return l === 0 ? 'Cantrip' : 'Level ' + l; }

  function filtered() {
    var q = H.qs('#q').value.trim().toLowerCase();
    var cls = H.qs('#f-class').value;
    var school = H.qs('#f-school').value;
    var extra = H.qs('#f-extra').value;

    return SPELLS.filter(function (s) {
      if (levels.length && levels.indexOf(s.lvl) === -1) return false;
      if (cls && (s.classes || []).indexOf(cls) === -1) return false;
      if (school && s.school !== school) return false;
      if (extra === 'conc' && !s.conc) return false;
      if (extra === 'noconc' && s.conc) return false;
      if (extra === 'ritual' && !s.ritual) return false;
      if (!q) return true;
      return s.n.toLowerCase().indexOf(q) !== -1 || (s.desc || '').toLowerCase().indexOf(q) !== -1;
    }).sort(function (a, b) { return a.lvl - b.lvl || a.n.localeCompare(b.n); });
  }

  function render() {
    var list = filtered();
    H.qs('#count').textContent = list.length + ' of ' + SPELLS.length;

    if (!list.length) {
      H.qs('#list').innerHTML = '<div class="empty">No spells match these filters.</div>';
      return;
    }

    H.qs('#list').innerHTML = list.map(function (s) {
      var tags = '';
      if (s.conc) tags += ' <span class="tag purple">C</span>';
      if (s.ritual) tags += ' <span class="tag blue">R</span>';
      return '<div class="stat-line" style="cursor:pointer" data-spell="' + H.escape(s.n) + '">' +
        '<span><b>' + H.escape(s.n) + '</b>' + tags + '<br><small>' + s.school + ' · ' + (s.classes || []).join(', ') + '</small></span>' +
        '<span>' + (s.lvl === 0 ? 'Cantrip' : 'Lvl ' + s.lvl) + '</span></div>';
    }).join('');
  }

  function show(s) {
    H.qs('#detail').innerHTML =
      '<div class="panel">' +
        '<div class="panel-head no-print">' +
          '<h2 style="margin:0">' + H.escape(s.n) + '</h2>' +
          '<button class="btn btn-sm" data-copy="#spell-body">Copy</button>' +
        '</div>' +
        '<div id="spell-body">' +
          '<p class="muted" style="font-style:italic;margin-bottom:12px">' + lvlLabel(s.lvl) + ' · ' + s.school +
            (s.ritual ? ' (ritual)' : '') + '</p>' +
          '<div class="stat-line"><span>Casting time</span><span>' + H.escape(s.time) + '</span></div>' +
          '<div class="stat-line"><span>Range</span><span>' + H.escape(s.range) + '</span></div>' +
          '<div class="stat-line"><span>Components</span><span>' + H.escape(s.comp) + '</span></div>' +
          '<div class="stat-line"><span>Duration</span><span>' + H.escape(s.dur) + '</span></div>' +
          '<div class="stat-line"><span>Classes</span><span>' + (s.classes || []).join(', ') + '</span></div>' +
          '<div class="hr"></div>' +
          '<p>' + H.escape(s.desc) + '</p>' +
          (s.higher ? '<p><b>At higher levels.</b> ' + H.escape(s.higher) + '</p>' : '') +
        '</div>' +
      '</div>';
  }

  H.qs('#list').addEventListener('click', function (e) {
    var row = e.target.closest('[data-spell]');
    if (!row) return;
    var s = SPELLS.filter(function (x) { return x.n === row.getAttribute('data-spell'); })[0];
    if (s) {
      show(s);
      if (window.matchMedia && window.matchMedia('(max-width: 900px)').matches) H.reveal(H.qs('#detail'));
    }
  });

  ['#q', '#f-class', '#f-school', '#f-extra'].forEach(function (sel) {
    H.qs(sel).addEventListener('input', render);
    H.qs(sel).addEventListener('change', render);
  });

  render();
})();
