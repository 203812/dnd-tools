/* ============================================================
   names-page.js - logica voor tools/names.html
   ============================================================ */
(function () {
  'use strict';

  var volken = Object.keys(NAMES.volken);
  volken.forEach(function (v) { H.qs('#f-volk').appendChild(new Option(v, v)); });

  /* ---------- Personagenamen ---------- */
  function persoonsnaam(volk, geslacht) {
    var d = NAMES.volken[volk];
    var g = geslacht || H.pick(['m', 'v']);
    var achter = d.achter && d.achter.length ? ' ' + H.pick(d.achter) : '';
    return H.pick(d[g]) + achter;
  }

  function lijst(container, items) {
    container.innerHTML = items.map(function (t) {
      return '<div class="stat-line" style="cursor:pointer" data-name="' + H.escape(t) + '">' +
        '<span>' + H.escape(t) + '</span><span class="muted" style="font-size:.8rem">kopieer</span></div>';
    }).join('');
  }

  H.on('#btn-namen', 'click', function () {
    var volk = H.qs('#f-volk').value;
    var g = H.qs('#f-geslacht').value || null;
    var n = H.clamp(parseInt(H.qs('#f-aantal').value, 10) || 8, 1, 30);
    var out = [];
    for (var i = 0; i < n; i++) out.push(persoonsnaam(volk, g));
    lijst(H.qs('#out-namen'), out);
  });

  /* ---------- Plaatsen en zaken ---------- */
  var SOORTEN = {
    Herberg: function () {
      return Math.random() < 0.55
        ? H.pick(NAMES.herbergVoor) + ' ' + H.pick(NAMES.herbergDier)
        : H.pick(NAMES.herbergVoor) + ' ' + H.pick(NAMES.herbergDing);
    },
    Winkel: function () {
      return 'De ' + H.pick(NAMES.winkelBijvoeglijk) + ' ' + H.pick(NAMES.winkelType).toLowerCase() +
             ' van ' + persoonsnaam(H.pick(volken)).split(' ')[0];
    },
    Dorp: function () { return H.pick(NAMES.plaatsVoor) + H.pick(NAMES.plaatsAchter); },
    Gezelschap: function () { return H.pick(NAMES.gezelschapVoor) + ' ' + H.pick(NAMES.gezelschapAchter); }
  };

  var actieveSoort = 'Herberg';
  var chipHost = H.qs('#soort-chips');
  Object.keys(SOORTEN).forEach(function (s) {
    var b = H.el('button', 'chip' + (s === actieveSoort ? ' active' : ''), s);
    b.type = 'button';
    b.setAttribute('data-soort', s);
    chipHost.appendChild(b);
  });

  function renderPlaatsen() {
    var n = H.clamp(parseInt(H.qs('#f-plaats-aantal').value, 10) || 6, 1, 20);
    var out = [];
    for (var i = 0; i < n; i++) out.push(SOORTEN[actieveSoort]());
    lijst(H.qs('#out-plaats'), out);
  }

  chipHost.addEventListener('click', function (e) {
    var b = e.target.closest('[data-soort]');
    if (!b) return;
    H.qsa('.chip', chipHost).forEach(function (c) { c.classList.remove('active'); });
    b.classList.add('active');
    actieveSoort = b.getAttribute('data-soort');
    renderPlaatsen();
  });

  H.qs('#f-plaats-aantal').addEventListener('input', renderPlaatsen);

  /* ---------- Herberg met inhoud ---------- */
  H.on('#btn-herberg', 'click', function () {
    var waard = persoonsnaam(H.pick(volken));
    H.qs('#out-herberg').innerHTML =
      '<div class="result-box">' +
        '<h3 style="margin-top:0">' + H.escape(SOORTEN.Herberg()) + '</h3>' +
        '<div class="stat-line"><span>Waard</span><span>' + H.escape(waard) + '</span></div>' +
        '<div class="stat-line"><span>Sfeer</span><span>' + H.escape(H.pick(TAVERN_DATA.sfeer)) + '</span></div>' +
        '<div class="stat-line"><span>Specialiteit</span><span>' + H.escape(H.pick(TAVERN_DATA.specialiteit)) + '</span></div>' +
        '<div class="stat-line"><span>Kamer per nacht</span><span>' + H.randInt(2, 15) + ' sp</span></div>' +
        '<div class="stat-line"><span>Er speelt iets</span><span>' + H.escape(H.pick(TAVERN_DATA.probleem)) + '</span></div>' +
      '</div>';
  });

  /* ---------- Kopiëren ---------- */
  document.addEventListener('click', function (e) {
    var row = e.target.closest('[data-name]');
    if (!row) return;
    H.copy(row.getAttribute('data-name'));
  });

  H.qs('#btn-namen').click();
  renderPlaatsen();
  H.qs('#btn-herberg').click();
})();
