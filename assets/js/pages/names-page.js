/* ============================================================
   names-page.js - logic for tools/names.html
   ============================================================ */
(function () {
  'use strict';

  var ancestries = Object.keys(NAMES.ancestries);
  ancestries.forEach(function (v) { H.qs('#f-ancestry').appendChild(new Option(v, v)); });

  /* ---------- Character names ---------- */
  function personName(ancestry, gender) {
    var d = NAMES.ancestries[ancestry];
    var g = gender || H.pick(['m', 'f']);
    var family = d.family && d.family.length ? ' ' + H.pick(d.family) : '';
    return H.pick(d[g]) + family;
  }

  function list(container, items) {
    container.innerHTML = items.map(function (t) {
      return '<div class="stat-line" style="cursor:pointer" data-name="' + H.escape(t) + '">' +
        '<span>' + H.escape(t) + '</span><span class="muted" style="font-size:.8rem">copy</span></div>';
    }).join('');
  }

  H.on('#btn-names', 'click', function () {
    var ancestry = H.qs('#f-ancestry').value;
    var g = H.qs('#f-gender').value || null;
    var n = H.clamp(parseInt(H.qs('#f-count').value, 10) || 8, 1, 30);
    var out = [];
    for (var i = 0; i < n; i++) out.push(personName(ancestry, g));
    list(H.qs('#out-names'), out);
  });

  /* ---------- Places and businesses ---------- */
  var KINDS = {
    Tavern: function () {
      return Math.random() < 0.55
        ? H.pick(NAMES.tavernAdjective) + ' ' + H.pick(NAMES.tavernBeast)
        : H.pick(NAMES.tavernAdjective) + ' ' + H.pick(NAMES.tavernThing);
    },
    Shop: function () {
      return 'The ' + H.pick(NAMES.shopAdjective) + ' ' + H.pick(NAMES.shopType).toLowerCase() +
             ' of ' + personName(H.pick(ancestries)).split(' ')[0];
    },
    Village: function () { return H.pick(NAMES.placePrefix) + H.pick(NAMES.placeSuffix); },
    Company: function () { return H.pick(NAMES.companyPrefix) + ' ' + H.pick(NAMES.companySuffix); }
  };

  var activeKind = 'Tavern';
  var chipHost = H.qs('#kind-chips');
  Object.keys(KINDS).forEach(function (s) {
    var b = H.el('button', 'chip' + (s === activeKind ? ' active' : ''), s);
    b.type = 'button';
    b.setAttribute('data-kind', s);
    chipHost.appendChild(b);
  });

  function renderPlaces() {
    var n = H.clamp(parseInt(H.qs('#f-place-count').value, 10) || 6, 1, 20);
    var out = [];
    for (var i = 0; i < n; i++) out.push(KINDS[activeKind]());
    list(H.qs('#out-places'), out);
  }

  chipHost.addEventListener('click', function (e) {
    var b = e.target.closest('[data-kind]');
    if (!b) return;
    H.qsa('.chip', chipHost).forEach(function (c) { c.classList.remove('active'); });
    b.classList.add('active');
    activeKind = b.getAttribute('data-kind');
    renderPlaces();
  });

  H.qs('#f-place-count').addEventListener('input', renderPlaces);

  /* ---------- A tavern with contents ---------- */
  H.on('#btn-tavern', 'click', function () {
    var host = personName(H.pick(ancestries));
    H.qs('#out-tavern').innerHTML =
      '<div class="result-box">' +
        '<h3 style="margin-top:0">' + H.escape(KINDS.Tavern()) + '</h3>' +
        '<div class="stat-line"><span>Innkeeper</span><span>' + H.escape(host) + '</span></div>' +
        '<div class="stat-line"><span>Mood</span><span>' + H.escape(H.pick(TAVERN_DATA.mood)) + '</span></div>' +
        '<div class="stat-line"><span>Speciality</span><span>' + H.escape(H.pick(TAVERN_DATA.speciality)) + '</span></div>' +
        '<div class="stat-line"><span>Room per night</span><span>' + H.randInt(2, 15) + ' sp</span></div>' +
        '<div class="stat-line"><span>Something is going on</span><span>' + H.escape(H.pick(TAVERN_DATA.trouble)) + '</span></div>' +
      '</div>';
  });

  /* ---------- Copying ---------- */
  document.addEventListener('click', function (e) {
    var row = e.target.closest('[data-name]');
    if (!row) return;
    H.copy(row.getAttribute('data-name'));
  });

  H.qs('#btn-names').click();
  renderPlaces();
  H.qs('#btn-tavern').click();
})();
