/* ============================================================
   npc-page.js - logic for tools/npc.html
   ============================================================ */
(function () {
  'use strict';

  var ancestries = Object.keys(NAMES.ancestries);
  ancestries.forEach(function (v) { H.qs('#f-ancestry').appendChild(new Option(v, v)); });
  NPC_DATA.occupations.slice().sort().forEach(function (b) { H.qs('#f-occupation').appendChild(new Option(b, b)); });

  function fullName(ancestry, gender) {
    var data = NAMES.ancestries[ancestry];
    var g = gender || H.pick(['m', 'f']);
    var first = H.pick(data[g]);
    var family = data.family && data.family.length ? ' ' + H.pick(data.family) : '';
    return first + family;
  }

  function scores() {
    // 4d6 drop lowest, one roll per ability
    var vals = [];
    for (var i = 0; i < 6; i++) vals.push(Dice.total('4d6kh3'));
    return vals;
  }

  function makeNpc() {
    var ancestry = H.qs('#f-ancestry').value || H.pick(ancestries);
    var gender = H.qs('#f-gender').value || null;
    var occupation = H.qs('#f-occupation').value || H.pick(NPC_DATA.occupations);

    return {
      name: fullName(ancestry, gender),
      ancestry: ancestry,
      occupation: occupation,
      age: H.randInt(17, 68),
      appearance: H.pickN(NPC_DATA.appearance, 2),
      voice: H.pick(NPC_DATA.voice),
      trait: H.pick(NPC_DATA.trait),
      ideal: H.pick(NPC_DATA.ideal),
      bond: H.pick(NPC_DATA.bond),
      flaw: H.pick(NPC_DATA.flaw),
      secret: H.pick(NPC_DATA.secret),
      attitude: H.weighted(NPC_DATA.attitude).label,
      need: H.pick(NPC_DATA.need),
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
        '<h3 style="margin-top:0">' + H.escape(n.name) + '</h3>' +
        '<p class="muted" style="font-style:italic;margin-bottom:10px">' +
          H.escape(n.ancestry) + ' · ' + H.escape(n.occupation) + ' · ' + n.age + ' years old</p>' +
        stats +
        '<div class="stat-line"><span>Appearance</span><span>' + H.escape(n.appearance.join(', ')) + '</span></div>' +
        '<div class="stat-line"><span>Voice</span><span>' + H.escape(n.voice) + '</span></div>' +
        '<div class="stat-line"><span>Personality</span><span>' + H.escape(n.trait) + '</span></div>' +
        '<div class="stat-line"><span>Ideal</span><span>' + H.escape(n.ideal) + '</span></div>' +
        '<div class="stat-line"><span>Bond</span><span>' + H.escape(n.bond) + '</span></div>' +
        '<div class="stat-line"><span>Flaw</span><span>' + H.escape(n.flaw) + '</span></div>' +
        '<div class="stat-line"><span>Attitude to the party</span><span>' + H.escape(n.attitude) + '</span></div>' +
        '<div class="stat-line"><span>Wants from the party</span><span>' + H.escape(n.need) + '</span></div>' +
        '<div class="stat-line"><span>Secret (DM only)</span><span>' + H.escape(n.secret) + '</span></div>' +
      '</div>';
    }).join('');
  }

  H.on('#btn-gen', 'click', function () {
    var n = H.clamp(parseInt(H.qs('#f-count').value, 10) || 1, 1, 10);
    var out = [];
    for (var i = 0; i < n; i++) out.push(makeNpc());
    render(out);
  });

  // show one NPC straight away
  render([makeNpc()]);
})();
