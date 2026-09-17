/* ============================================================
   npc-page.js - logica voor tools/npc.html
   ============================================================ */
(function () {
  'use strict';

  var volken = Object.keys(NAMES.volken);
  volken.forEach(function (v) { H.qs('#f-volk').appendChild(new Option(v, v)); });
  NPC_DATA.beroepen.slice().sort().forEach(function (b) { H.qs('#f-beroep').appendChild(new Option(b, b)); });

  function naam(volk, geslacht) {
    var data = NAMES.volken[volk];
    var g = geslacht || H.pick(['m', 'v']);
    var voor = H.pick(data[g]);
    var achter = data.achter && data.achter.length ? ' ' + H.pick(data.achter) : '';
    return voor + achter;
  }

  function scores() {
    // 4d6 drop lowest, gesorteerd van hoog naar laag over de zes abilities
    var vals = [];
    for (var i = 0; i < 6; i++) vals.push(Dice.total('4d6kh3'));
    return vals;
  }

  function maakNpc() {
    var volk = H.qs('#f-volk').value || H.pick(volken);
    var geslacht = H.qs('#f-geslacht').value || null;
    var beroep = H.qs('#f-beroep').value || H.pick(NPC_DATA.beroepen);

    return {
      naam: naam(volk, geslacht),
      volk: volk,
      beroep: beroep,
      leeftijd: H.randInt(17, 68),
      uiterlijk: H.pickN(NPC_DATA.uiterlijk, 2),
      stem: H.pick(NPC_DATA.stem),
      trek: H.pick(NPC_DATA.karaktertrek),
      ideaal: H.pick(NPC_DATA.ideaal),
      band: H.pick(NPC_DATA.band),
      zwakte: H.pick(NPC_DATA.zwakte),
      geheim: H.pick(NPC_DATA.geheim),
      houding: H.weighted(NPC_DATA.houding).label,
      behoefte: H.pick(NPC_DATA.behoefte),
      scores: H.qs('#f-stats').checked ? scores() : null
    };
  }

  function render(npcs) {
    H.qs('#npc-out').innerHTML = npcs.map(function (n) {
      var stats = '';
      if (n.scores) {
        var labels = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
        stats = '<div class="sb-abilities" style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;text-align:center;margin:12px 0">' +
          labels.map(function (l, i) {
            return '<div style="background:var(--panel-2);border:1px solid var(--line-soft);border-radius:6px;padding:6px 2px">' +
              '<b style="display:block;font-size:.72rem;letter-spacing:.08em;color:var(--text-faint)">' + l + '</b>' +
              n.scores[i] + ' (' + H.signed(H.mod(n.scores[i])) + ')</div>';
          }).join('') + '</div>';
      }

      return '<div class="result-box" style="margin-bottom:14px">' +
        '<h3 style="margin-top:0">' + H.escape(n.naam) + '</h3>' +
        '<p class="muted" style="font-style:italic;margin-bottom:10px">' +
          H.escape(n.volk) + ' · ' + H.escape(n.beroep) + ' · ' + n.leeftijd + ' jaar</p>' +
        stats +
        '<div class="stat-line"><span>Uiterlijk</span><span>' + H.escape(n.uiterlijk.join(', ')) + '</span></div>' +
        '<div class="stat-line"><span>Stem</span><span>' + H.escape(n.stem) + '</span></div>' +
        '<div class="stat-line"><span>Karaktertrek</span><span>' + H.escape(n.trek) + '</span></div>' +
        '<div class="stat-line"><span>Ideaal</span><span>' + H.escape(n.ideaal) + '</span></div>' +
        '<div class="stat-line"><span>Band</span><span>' + H.escape(n.band) + '</span></div>' +
        '<div class="stat-line"><span>Zwakte</span><span>' + H.escape(n.zwakte) + '</span></div>' +
        '<div class="stat-line"><span>Houding tegenover de party</span><span>' + H.escape(n.houding) + '</span></div>' +
        '<div class="stat-line"><span>Wil iets van de party</span><span>' + H.escape(n.behoefte) + '</span></div>' +
        '<div class="stat-line"><span>Geheim (alleen DM)</span><span>' + H.escape(n.geheim) + '</span></div>' +
      '</div>';
    }).join('');
  }

  H.on('#btn-gen', 'click', function () {
    var n = H.clamp(parseInt(H.qs('#f-aantal').value, 10) || 1, 1, 10);
    var out = [];
    for (var i = 0; i < n; i++) out.push(maakNpc());
    render(out);
  });

  // meteen één NPC tonen bij binnenkomst
  render([maakNpc()]);
})();
