/* ============================================================
   screen-page.js - logic for tools/screen.html
   A dashboard of small panels the DM chooses and orders.
   ============================================================ */
(function () {
  'use strict';

  var DEFAULT_LAYOUT = ['dice', 'initiative', 'conditions', 'dcs', 'notes', 'actions'];
  var layout = H.store.get('screen-layout', null) || DEFAULT_LAYOUT.slice();

  /* ---------- Panel definitions ----------
     render() returns the HTML body; wire() hooks up any controls. */
  var WIDGETS = {
    dice: {
      title: 'Quick rolls',
      render: function () {
        return '<div class="chips" data-role="dice-chips"></div>' +
          '<div class="result-box" style="margin-top:10px;text-align:center">' +
            '<div style="font-family:var(--font-display);font-size:2rem;color:var(--gold)" data-role="dice-total">&mdash;</div>' +
            '<div class="muted mono" style="font-size:.8rem" data-role="dice-detail"></div>' +
          '</div>' +
          '<form data-role="dice-form" style="margin-top:10px" class="field-row">' +
            '<input class="mono" data-role="dice-input" value="1d20" style="flex:1 1 120px">' +
            '<button class="btn btn-sm" type="submit">Roll</button>' +
          '</form>';
      },
      wire: function (el) {
        var chips = H.qs('[data-role="dice-chips"]', el);
        var totalEl = H.qs('[data-role="dice-total"]', el);
        var detailEl = H.qs('[data-role="dice-detail"]', el);

        function roll(notation) {
          try {
            var r = Dice.roll(notation);
            totalEl.textContent = r.total;
            detailEl.innerHTML = Dice.breakdownHtml(r);
          } catch (err) {
            totalEl.textContent = '!';
            detailEl.textContent = err.message;
          }
        }

        ['1d20', 'adv', 'dis', '1d4', '1d6', '1d8', '1d10', '1d12', '1d100', '2d6'].forEach(function (n) {
          var b = H.el('button', 'chip', n);
          b.type = 'button';
          b.addEventListener('click', function () { roll(n); });
          chips.appendChild(b);
        });

        H.qs('[data-role="dice-form"]', el).addEventListener('submit', function (e) {
          e.preventDefault();
          roll(H.qs('[data-role="dice-input"]', el).value);
        });
      }
    },

    initiative: {
      title: 'Initiative order',
      render: function () {
        var enc = H.store.get('encounter', null);
        if (!enc || !enc.combatants || !enc.combatants.length) {
          return '<div class="empty">Nothing running. Start a fight in the Initiative Tracker.</div>';
        }
        var list = enc.combatants.slice().sort(function (a, b) { return b.init - a.init || (b.dex || 0) - (a.dex || 0); });
        return '<div class="muted" style="font-size:.85rem;margin-bottom:8px">Round ' + enc.round + '</div>' +
          list.map(function (c, i) {
            return '<div class="stat-line"' + (i === enc.turn ? ' style="color:var(--gold)"' : '') + '>' +
              '<span>' + (i === enc.turn ? '▶ ' : '') + H.escape(c.name) + '</span>' +
              '<span>' + c.init + (c.maxHp != null ? ' · ' + c.hp + '/' + c.maxHp + ' hp' : '') + '</span></div>';
          }).join('') +
          '<div style="margin-top:10px"><a class="btn btn-sm" href="initiative.html">Open the tracker</a></div>';
      }
    },

    conditions: {
      title: 'Conditions',
      render: function () {
        return '<div class="chips" data-role="cond-chips">' +
          RULES.conditions.map(function (c, i) {
            return '<button class="chip" data-cond="' + i + '">' + c.n + '</button>';
          }).join('') + '</div>' +
          '<div data-role="cond-detail" class="muted" style="margin-top:10px;font-size:.88rem">Click a condition to see what it does.</div>';
      },
      wire: function (el) {
        H.qs('[data-role="cond-chips"]', el).addEventListener('click', function (e) {
          var btn = e.target.closest('[data-cond]');
          if (!btn) return;
          H.qsa('[data-cond]', el).forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var c = RULES.conditions[parseInt(btn.getAttribute('data-cond'), 10)];
          H.qs('[data-role="cond-detail"]', el).innerHTML =
            '<b>' + H.escape(c.n) + '</b><ul style="margin:6px 0 0;padding-left:18px">' +
            c.p.map(function (p) { return '<li>' + H.escape(p) + '</li>'; }).join('') + '</ul>';
        });
      }
    },

    dcs: {
      title: 'Difficulty classes',
      render: function () {
        return RULES.dcs.map(function (d) {
          return '<div class="stat-line"><span>' + H.escape(d.n) + '</span><span>DC ' + d.dc + '</span></div>';
        }).join('') +
        '<div class="hr"></div>' +
        '<div class="muted" style="font-size:.85rem">Cover: half +2 AC, three-quarters +5 AC, total cannot be targeted.</div>';
      }
    },

    actions: {
      title: 'Actions in combat',
      render: function () {
        return RULES.actions.map(function (a) {
          return '<div class="stat-line"><span><b>' + H.escape(a.n) + '</b></span>' +
            '<span style="flex:2 1 62%;text-align:left;font-weight:400">' + H.escape(a.d) + '</span></div>';
        }).join('');
      }
    },

    travel: {
      title: 'Travel and rest',
      render: function () {
        return '<div class="table-wrap"><table><thead><tr><th>Pace</th><th>Hour</th><th>Day</th></tr></thead><tbody>' +
          RULES.travel.map(function (r) {
            return '<tr><td>' + H.escape(r.pace) + '</td><td>' + H.escape(r.perHour) + '</td><td>' + H.escape(r.perDay) + '</td></tr>';
          }).join('') + '</tbody></table></div>' +
          '<div class="hr"></div>' +
          RULES.resting.map(function (r) {
            return '<div class="muted" style="font-size:.85rem;margin-bottom:6px"><b>' + H.escape(r.n) + '.</b> ' + H.escape(r.d) + '</div>';
          }).join('');
      }
    },

    notes: {
      title: 'Session notes',
      render: function () {
        var text = H.store.get('screen-notes', '');
        return '<textarea data-role="notes" placeholder="Names you improvised, that promise you made, the door you forgot to describe...">' +
          H.escape(text) + '</textarea>';
      },
      wire: function (el) {
        var ta = H.qs('[data-role="notes"]', el);
        var timer = null;
        ta.addEventListener('input', function () {
          clearTimeout(timer);
          timer = setTimeout(function () { H.store.set('screen-notes', ta.value); }, 400);
        });
      }
    },

    npc: {
      title: 'NPC on the spot',
      render: function () {
        return '<button class="btn btn-sm btn-block" data-role="npc-roll">Someone walks in</button>' +
          '<div data-role="npc-out" style="margin-top:10px"></div>';
      },
      wire: function (el) {
        var out = H.qs('[data-role="npc-out"]', el);
        function go() {
          var ancestries = Object.keys(NAMES.ancestries);
          var a = H.pick(ancestries);
          var d = NAMES.ancestries[a];
          var g = H.pick(['m', 'f']);
          var name = H.pick(d[g]) + (d.family && d.family.length ? ' ' + H.pick(d.family) : '');
          out.innerHTML =
            '<div class="result-box">' +
              '<b>' + H.escape(name) + '</b><br>' +
              '<small class="muted">' + a + ' · ' + H.escape(H.pick(NPC_DATA.occupations)) + '</small>' +
              '<div class="stat-line"><span>Looks</span><span>' + H.escape(H.pick(NPC_DATA.appearance)) + '</span></div>' +
              '<div class="stat-line"><span>Manner</span><span>' + H.escape(H.pick(NPC_DATA.trait)) + '</span></div>' +
              '<div class="stat-line"><span>Wants</span><span>' + H.escape(H.pick(NPC_DATA.need)) + '</span></div>' +
            '</div>';
        }
        H.qs('[data-role="npc-roll"]', el).addEventListener('click', go);
        go();
      }
    },

    names: {
      title: 'Names on demand',
      render: function () {
        return '<div class="chips" data-role="name-kinds"></div>' +
          '<div data-role="name-out" style="margin-top:10px"></div>';
      },
      wire: function (el) {
        var out = H.qs('[data-role="name-out"]', el);
        var ancestries = Object.keys(NAMES.ancestries);

        function person() {
          var d = NAMES.ancestries[H.pick(ancestries)];
          var g = H.pick(['m', 'f']);
          return H.pick(d[g]) + (d.family && d.family.length ? ' ' + H.pick(d.family) : '');
        }
        var KINDS = {
          Person: person,
          Tavern: function () {
            return H.pick(NAMES.tavernAdjective) + ' ' +
              (Math.random() < 0.5 ? H.pick(NAMES.tavernBeast) : H.pick(NAMES.tavernThing));
          },
          Village: function () { return H.pick(NAMES.placePrefix) + H.pick(NAMES.placeSuffix); },
          Company: function () { return H.pick(NAMES.companyPrefix) + ' ' + H.pick(NAMES.companySuffix); }
        };

        Object.keys(KINDS).forEach(function (k) {
          var b = H.el('button', 'chip', k);
          b.type = 'button';
          b.addEventListener('click', function () {
            var list = [];
            for (var i = 0; i < 5; i++) list.push(KINDS[k]());
            out.innerHTML = list.map(function (n) {
              return '<div class="stat-line" style="cursor:pointer" data-copy-name="' + H.escape(n) + '">' +
                '<span>' + H.escape(n) + '</span><span class="muted" style="font-size:.78rem">copy</span></div>';
            }).join('');
          });
          H.qs('[data-role="name-kinds"]', el).appendChild(b);
        });

        out.addEventListener('click', function (e) {
          var row = e.target.closest('[data-copy-name]');
          if (row) H.copy(row.getAttribute('data-copy-name'));
        });
      }
    },

    loot: {
      title: 'Pocket loot',
      render: function () {
        return '<div class="btn-group">' +
          '<button class="btn btn-sm" data-loot="gem">Gem</button>' +
          '<button class="btn btn-sm" data-loot="art">Art</button>' +
          '<button class="btn btn-sm" data-loot="A">Minor item</button>' +
          '<button class="btn btn-sm" data-loot="G">Major item</button>' +
          '<button class="btn btn-sm" data-loot="coins">Coins</button>' +
          '</div><div data-role="loot-out" style="margin-top:10px"></div>';
      },
      wire: function (el) {
        var out = H.qs('[data-role="loot-out"]', el);
        el.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-loot]');
          if (!btn) return;
          var what = btn.getAttribute('data-loot');
          if (what === 'coins') {
            out.innerHTML = '<div class="result-box"><b>' + H.num(Dice.total('3d6*10')) + ' gp</b> and ' +
              H.num(Dice.total('4d6')) + ' sp</div>';
          } else if (what === 'gem' || what === 'art') {
            var table = what === 'gem' ? TREASURE.gems : TREASURE.art;
            var value = H.pick(Object.keys(table));
            out.innerHTML = '<div class="result-box"><b>' + H.escape(H.pick(table[value])) + '</b><br>' +
              '<small class="muted">' + H.num(value) + ' gp</small></div>';
          } else {
            out.innerHTML = '<div class="result-box"><b>' + H.escape(H.pick(TREASURE.itemTables[what])) + '</b><br>' +
              '<small class="muted">magic item table ' + what + '</small></div>';
          }
        });
      }
    },

    monster: {
      title: 'Monster lookup',
      render: function () {
        return '<input data-role="mon-search" placeholder="Search the bestiary" autocomplete="off">' +
          '<div data-role="mon-out" class="scroll-y" style="max-height:260px;margin-top:10px"></div>';
      },
      wire: function (el) {
        var input = H.qs('[data-role="mon-search"]', el);
        var out = H.qs('[data-role="mon-out"]', el);

        function render() {
          var q = input.value.trim().toLowerCase();
          var list = q ? MONSTERS.filter(function (m) {
            return m.name.toLowerCase().indexOf(q) !== -1 || m.type.indexOf(q) !== -1;
          }).slice(0, 12) : [];
          if (!q) { out.innerHTML = '<div class="empty">Type a name or a type.</div>'; return; }
          if (!list.length) { out.innerHTML = '<div class="empty">Nothing found.</div>'; return; }
          out.innerHTML = list.map(function (m) {
            return '<div class="stat-line"><span><b>' + H.escape(m.name) + '</b><br><small>' +
              m.type + ' · AC ' + m.ac + ' · ' + m.hp + ' hp</small></span>' +
              '<span>CR ' + crLabel(m.cr) + '</span></div>';
          }).join('');
        }
        input.addEventListener('input', render);
        render();
      }
    },

    tracker: {
      title: 'Party tracker',
      render: function () {
        var party = H.store.get('screen-party', []);
        return '<div data-role="party-list"></div>' +
          '<form data-role="party-form" class="field-row" style="margin-top:10px">' +
            '<input data-role="party-name" placeholder="Name" style="flex:2 1 110px">' +
            '<input data-role="party-pp" type="number" placeholder="Pass. Perc." style="flex:1 1 90px">' +
            '<button class="btn btn-sm" type="submit">Add</button>' +
          '</form>';
      },
      wire: function (el) {
        var listEl = H.qs('[data-role="party-list"]', el);

        function party() { return H.store.get('screen-party', []); }
        function render() {
          var p = party();
          listEl.innerHTML = p.length
            ? p.map(function (m, i) {
                return '<div class="stat-line"><span>' + H.escape(m.name) + '</span>' +
                  '<span>passive ' + m.pp + ' <button class="btn btn-sm btn-danger" data-party-del="' + i + '">&#10005;</button></span></div>';
              }).join('')
            : '<div class="empty">Add your players so their passive Perception is always in view.</div>';
        }

        H.qs('[data-role="party-form"]', el).addEventListener('submit', function (e) {
          e.preventDefault();
          var name = H.qs('[data-role="party-name"]', el).value.trim();
          var pp = parseInt(H.qs('[data-role="party-pp"]', el).value, 10);
          if (!name) return;
          var p = party();
          p.push({ name: name, pp: isNaN(pp) ? 10 : pp });
          H.store.set('screen-party', p);
          H.qs('[data-role="party-name"]', el).value = '';
          H.qs('[data-role="party-pp"]', el).value = '';
          render();
        });

        listEl.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-party-del]');
          if (!btn) return;
          var p = party();
          p.splice(parseInt(btn.getAttribute('data-party-del'), 10), 1);
          H.store.set('screen-party', p);
          render();
        });

        render();
      }
    }
  };

  var WIDGET_ORDER = ['dice', 'initiative', 'conditions', 'dcs', 'actions', 'travel', 'notes', 'npc', 'names', 'loot', 'monster', 'tracker'];

  /* ---------- Rendering the board ---------- */
  function renderChips() {
    H.qs('#widget-chips').innerHTML = WIDGET_ORDER.map(function (id) {
      var on = layout.indexOf(id) !== -1;
      return '<button class="chip' + (on ? ' active' : '') + '" data-widget="' + id + '">' +
        H.escape(WIDGETS[id].title) + '</button>';
    }).join('');
  }

  function renderBoard() {
    var board = H.qs('#screen');
    if (!layout.length) {
      board.innerHTML = '<div class="panel"><div class="empty">No panels chosen. Pick a few above.</div></div>';
      return;
    }

    board.innerHTML = layout.map(function (id, i) {
      var w = WIDGETS[id];
      if (!w) return '';
      var wide = (id === 'actions' || id === 'travel') ? ' wide' : '';
      return '<div class="widget' + wide + '" data-id="' + id + '">' +
        '<div class="widget-head">' +
          '<h3>' + H.escape(w.title) + '</h3>' +
          '<div class="widget-tools no-print">' +
            '<button class="btn btn-sm" data-move="-1" data-i="' + i + '" title="Move up">&#8592;</button>' +
            '<button class="btn btn-sm" data-move="1" data-i="' + i + '" title="Move down">&#8594;</button>' +
            '<button class="btn btn-sm btn-danger" data-remove="' + id + '" title="Remove">&#10005;</button>' +
          '</div>' +
        '</div>' +
        '<div class="widget-body">' + w.render() + '</div>' +
      '</div>';
    }).join('');

    // hook up the panels that need behaviour
    layout.forEach(function (id) {
      var w = WIDGETS[id];
      if (!w || !w.wire) return;
      var el = H.qs('.widget[data-id="' + id + '"] .widget-body', board);
      if (el) w.wire(el);
    });
  }

  function save() { H.store.set('screen-layout', layout); }

  H.qs('#widget-chips').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-widget]');
    if (!btn) return;
    var id = btn.getAttribute('data-widget');
    var i = layout.indexOf(id);
    if (i === -1) layout.push(id); else layout.splice(i, 1);
    save(); renderChips(); renderBoard();
  });

  H.qs('#screen').addEventListener('click', function (e) {
    var move = e.target.closest('[data-move]');
    if (move) {
      var from = parseInt(move.getAttribute('data-i'), 10);
      var to = from + parseInt(move.getAttribute('data-move'), 10);
      if (to < 0 || to >= layout.length) return;
      var item = layout.splice(from, 1)[0];
      layout.splice(to, 0, item);
      save(); renderChips(); renderBoard();
      return;
    }
    var remove = e.target.closest('[data-remove]');
    if (remove) {
      layout = layout.filter(function (x) { return x !== remove.getAttribute('data-remove'); });
      save(); renderChips(); renderBoard();
    }
  });

  H.on('#btn-reset', 'click', function () {
    layout = DEFAULT_LAYOUT.slice();
    save(); renderChips(); renderBoard();
  });

  renderChips();
  renderBoard();
})();
