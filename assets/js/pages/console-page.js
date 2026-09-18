/* ============================================================
   console-page.js - logic for tools/console.html
   ------------------------------------------------------------
   One campaign object holds everything; it is written back to
   local storage a moment after any change. Several campaigns can
   live side by side and are switched with the dropdown.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Storage ---------- */
  var campaigns = H.store.get('campaigns', null);
  var activeIndex = H.store.get('campaign-active', 0);

  if (!campaigns || !campaigns.length) {
    campaigns = [CAMPAIGN_DATA.blank()];
    activeIndex = 0;
  }
  if (activeIndex >= campaigns.length) activeIndex = 0;

  function camp() { return campaigns[activeIndex]; }

  /* Writing is debounced so typing doesn't hit storage on every keystroke,
     but a change is never held back longer than MAX_WAIT: without that ceiling
     a steady stream of edits would keep resetting the timer forever. */
  var saveTimer = null;
  var firstPending = 0;
  var MAX_WAIT = 1500;

  function writeNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    firstPending = 0;
    var dot = H.qs('#save-dot');
    var ok = H.store.set('campaigns', campaigns) && H.store.set('campaign-active', activeIndex);
    dot.textContent = ok ? 'saved' : 'could not save';
    dot.classList.toggle('saved', ok);
  }

  function save(immediate) {
    var dot = H.qs('#save-dot');
    dot.textContent = 'saving…';
    dot.classList.remove('saved');

    if (immediate) { writeNow(); return; }

    var now = Date.now();
    if (!firstPending) firstPending = now;
    if (now - firstPending >= MAX_WAIT) { writeNow(); return; }

    clearTimeout(saveTimer);
    saveTimer = setTimeout(writeNow, 400);
  }

  // Never lose the last few keystrokes when the tab is closed or hidden.
  window.addEventListener('pagehide', function () { if (saveTimer) writeNow(); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && saveTimer) writeNow();
  });

  /* ---------- Small helpers ---------- */
  var COIN_IN_GP = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 };

  function purseInGp(loot) {
    return Object.keys(COIN_IN_GP).reduce(function (sum, k) {
      return sum + (loot[k] || 0) * COIN_IN_GP[k];
    }, 0);
  }

  function averageLevel() {
    var party = camp().party;
    if (!party.length) return 1;
    return Math.round(party.reduce(function (s, p) { return s + p.level; }, 0) / party.length);
  }

  function stamp() {
    var d = new Date();
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  /* ---------- Filling the dropdowns ---------- */
  CAMPAIGN_DATA.classes.forEach(function (c) { H.qs('#pc-class').appendChild(new Option(c, c)); });
  CAMPAIGN_DATA.npcAttitudes.forEach(function (a) { H.qs('#n-attitude').appendChild(new Option(a, a)); });
  CAMPAIGN_DATA.placeTypes.forEach(function (t) { H.qs('#p-type').appendChild(new Option(t, t)); });
  CAMPAIGN_DATA.logKinds.forEach(function (k) {
    H.qs('#log-kind').appendChild(new Option(k.icon + ' ' + k.label, k.id));
    H.qs('#log-filter').appendChild(new Option(k.label, k.id));
  });
  CAMPAIGN_DATA.questStatus.forEach(function (s) { H.qs('#quest-filter').appendChild(new Option(s, s)); });

  /* ============================================================
     Rendering
     ============================================================ */
  function renderAll() {
    renderBar();
    renderParty();
    renderLog();
    renderQuests();
    renderWorld();
    renderLoot();
    renderProgress();
  }

  function renderBar() {
    var c = camp();
    H.qs('#camp-name').value = c.name;
    H.qs('#stat-session').textContent = c.session;
    H.qs('#stat-party').textContent = c.party.length;
    H.qs('#stat-level').textContent = averageLevel();
    H.qs('#stat-gold').textContent = H.num(Math.round(purseInGp(c.loot)));
    H.qs('#sess-num').value = c.session;
    H.qs('#sess-date').value = c.inGameDate || '';

    var sel = H.qs('#camp-select');
    sel.innerHTML = campaigns.map(function (x, i) {
      return '<option value="' + i + '"' + (i === activeIndex ? ' selected' : '') + '>' + H.escape(x.name) + '</option>';
    }).join('');

    H.qs('#c-party').textContent = c.party.length;
    H.qs('#c-log').textContent = c.log.length;
    H.qs('#c-quests').textContent = c.quests.filter(function (q) { return q.status === 'Active'; }).length;
    H.qs('#c-world').textContent = c.npcs.length + c.places.length;
  }

  /* ---------- Party ---------- */
  function renderParty() {
    var party = camp().party;
    var host = H.qs('#party-list');

    if (!party.length) {
      host.innerHTML = '<div class="empty" style="grid-column:1/-1">' +
        'No characters yet. Add your players with the form on the right.</div>';
    } else {
      host.innerHTML = party.map(function (p, i) {
        var pct = p.maxHp ? H.clamp(Math.round((p.hp / p.maxHp) * 100), 0, 100) : 0;
        var cls = 'pc-card' + (p.hp <= 0 ? ' down' : (pct <= 50 ? ' bloodied' : ''));
        var barCls = pct <= 25 ? 'crit' : (pct <= 50 ? 'low' : '');
        var level = camp().milestone ? p.level : levelForXp(p.xp || 0);

        return '<div class="' + cls + '" data-pc="' + i + '">' +

          '<div class="pc-top">' +
            '<div style="min-width:0">' +
              '<div class="pc-name">' + H.escape(p.name) +
                (p.inspiration ? '<span class="tag gold">inspired</span>' : '') +
                (p.temp ? '<span class="tag blue">+' + p.temp + ' temp</span>' : '') + '</div>' +
              '<div class="pc-sub">' + H.escape(p.cls) + ' ' + level +
                (p.player ? ' · ' + H.escape(p.player) : '') + '</div>' +
            '</div>' +
            '<div class="pc-actions no-print">' +
              '<button class="btn btn-sm" data-act="inspire" title="Toggle inspiration">★</button>' +
              '<button class="btn btn-sm" data-act="edit" title="Edit">✎</button>' +
              '<button class="btn btn-sm btn-danger" data-act="remove" title="Remove">✕</button>' +
            '</div>' +
          '</div>' +

          '<div class="pc-hp">' +
            '<div class="pc-hp-row">' +
              '<input class="pc-hp-num" type="number" data-act="hp" value="' + p.hp + '" aria-label="Current hit points">' +
              '<span class="pc-hp-max">/ ' + p.maxHp + '</span>' +
              '<span class="pc-hp-btns no-print">' +
                '<button class="btn btn-sm" data-act="damage" title="Take damage">&#8722;</button>' +
                '<button class="btn btn-sm" data-act="heal" title="Heal">+</button>' +
              '</span>' +
            '</div>' +
            '<div class="hpbar ' + barCls + '"><i style="width:' + pct + '%"></i></div>' +
          '</div>' +

          (p.hp <= 0 ? deathSaveHtml(p) : '') +

          '<div class="pc-foot">' +
            '<div><b>AC</b><span>' + p.ac + '</span></div>' +
            '<div><b>Passive</b><span>' + p.pp + '</span></div>' +
            '<div><b>Prof</b><span>' + H.signed(profBonus(level)) + '</span></div>' +
            '<div><b>Hit dice</b><span>' + p.hitDice + '/' + level + '</span></div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    renderPartySummary();
    renderThresholds();
  }

  function deathSaveHtml(p) {
    function pips(kind, n) {
      var out = '';
      for (var i = 1; i <= 3; i++) {
        out += '<span class="pip' + (n >= i ? ' on-' + kind : '') + '" data-act="death" data-kind="' +
          kind + '" data-n="' + i + '"></span>';
      }
      return out;
    }
    return '<div class="death-saves">' +
      '<span>Saved<span class="pips" style="display:inline-flex;margin-left:6px;vertical-align:-2px">' +
        pips('success', p.deathSuccess || 0) + '</span></span>' +
      '<span>Failed<span class="pips" style="display:inline-flex;margin-left:6px;vertical-align:-2px">' +
        pips('fail', p.deathFail || 0) + '</span></span>' +
    '</div>';
  }

  function renderPartySummary() {
    var party = camp().party;
    if (!party.length) {
      H.qs('#party-summary').innerHTML = '<div class="empty">Nothing to summarise yet.</div>';
      return;
    }
    var passives = party.map(function (p) { return p.pp; });
    var lowestAc = Math.min.apply(null, party.map(function (p) { return p.ac; }));
    var hurt = party.filter(function (p) { return p.hp < p.maxHp; }).length;
    var down = party.filter(function (p) { return p.hp <= 0; }).length;

    H.qs('#party-summary').innerHTML =
      '<div class="stat-line"><span>Average level</span><span>' + averageLevel() + '</span></div>' +
      '<div class="stat-line"><span>Best passive Perception</span><span>' + Math.max.apply(null, passives) + '</span></div>' +
      '<div class="stat-line"><span>Group stealth beats</span><span>DC ' + Math.max.apply(null, passives) + ' to spot them</span></div>' +
      '<div class="stat-line"><span>Lowest AC</span><span>' + lowestAc + '</span></div>' +
      '<div class="stat-line"><span>Hurt / down</span><span>' + hurt + ' / ' + down + '</span></div>' +
      '<div class="stat-line"><span>Total party HP</span><span>' +
        party.reduce(function (s, p) { return s + p.hp; }, 0) + ' of ' +
        party.reduce(function (s, p) { return s + p.maxHp; }, 0) + '</span></div>';
  }

  /* XP thresholds, matching the encounter builder */
  var THRESHOLDS = {
    1: [25, 50, 75, 100], 2: [50, 100, 150, 200], 3: [75, 150, 225, 400],
    4: [125, 250, 375, 500], 5: [250, 500, 750, 1100], 6: [300, 600, 900, 1400],
    7: [350, 750, 1100, 1700], 8: [450, 900, 1400, 2100], 9: [550, 1100, 1600, 2400],
    10: [600, 1200, 1900, 2800], 11: [800, 1600, 2400, 3600], 12: [1000, 2000, 3000, 4500],
    13: [1100, 2200, 3400, 5100], 14: [1250, 2500, 3800, 5700], 15: [1400, 2800, 4300, 6400],
    16: [1600, 3200, 4800, 7200], 17: [2000, 3900, 5900, 8800], 18: [2100, 4200, 6300, 9500],
    19: [2400, 4900, 7300, 10900], 20: [2800, 5700, 8500, 12700]
  };

  function renderThresholds() {
    var party = camp().party;
    if (!party.length) {
      H.qs('#party-thresholds').innerHTML = '<div class="empty">Add characters first.</div>';
      return;
    }
    // each character contributes their own level's threshold
    var totals = [0, 0, 0, 0];
    party.forEach(function (p) {
      var lvl = H.clamp(camp().milestone ? p.level : levelForXp(p.xp || 0), 1, 20);
      THRESHOLDS[lvl].forEach(function (v, i) { totals[i] += v; });
    });
    var labels = ['Easy', 'Medium', 'Hard', 'Deadly'];
    H.qs('#party-thresholds').innerHTML = labels.map(function (l, i) {
      return '<div class="stat-line"><span>' + l + '</span><span>' + H.num(totals[i]) + ' XP</span></div>';
    }).join('') +
      '<div class="btn-group no-print" style="margin-top:10px"><a class="btn btn-sm" href="encounter.html">Build an encounter</a></div>';
  }

  H.qs('#party-list').addEventListener('click', function (e) {
    var card = e.target.closest('[data-pc]');
    if (!card) return;
    var i = parseInt(card.getAttribute('data-pc'), 10);
    var p = camp().party[i];
    var act = e.target.closest('[data-act]');
    if (!act || !p) return;

    switch (act.getAttribute('data-act')) {
      case 'remove':
        if (!confirm('Remove ' + p.name + ' from the party?')) return;
        camp().party.splice(i, 1);
        break;
      case 'inspire':
        p.inspiration = !p.inspiration;
        break;
      case 'damage': {
        var d = prompt('Damage to ' + p.name + '?', '');
        if (d == null) return;
        var amount = Math.max(0, parseInt(d, 10) || 0);
        if (p.temp) {
          var absorbed = Math.min(p.temp, amount);
          p.temp -= absorbed;
          amount -= absorbed;
        }
        p.hp = Math.max(0, p.hp - amount);
        if (p.hp === 0) { p.deathSuccess = 0; p.deathFail = 0; }
        break;
      }
      case 'heal': {
        var h = prompt('Healing for ' + p.name + '?', '');
        if (h == null) return;
        var was = p.hp;
        p.hp = Math.min(p.maxHp, p.hp + (parseInt(h, 10) || 0));
        if (was <= 0 && p.hp > 0) { p.deathSuccess = 0; p.deathFail = 0; }
        break;
      }
      case 'death': {
        var kind = act.getAttribute('data-kind');
        var n = parseInt(act.getAttribute('data-n'), 10);
        var key = kind === 'success' ? 'deathSuccess' : 'deathFail';
        p[key] = (p[key] === n) ? n - 1 : n;
        if (p.deathSuccess >= 3) addLog('level', p.name + ' stabilised.');
        if (p.deathFail >= 3) addLog('combat', p.name + ' died.');
        break;
      }
      case 'edit':
        editCharacter(i);
        return;
    }
    save(); renderBar(); renderParty();
  });

  H.qs('#party-list').addEventListener('change', function (e) {
    var input = e.target.closest('[data-act="hp"]');
    if (!input) return;
    var i = parseInt(e.target.closest('[data-pc]').getAttribute('data-pc'), 10);
    var p = camp().party[i];
    p.hp = H.clamp(parseInt(input.value, 10) || 0, 0, p.maxHp);
    save(); renderParty();
  });

  function editCharacter(i) {
    var p = camp().party[i];
    var name = prompt('Character name', p.name);
    if (name == null) return;
    p.name = name.trim() || p.name;
    p.player = prompt('Player', p.player || '') || p.player;
    var maxHp = prompt('Maximum hit points', p.maxHp);
    if (maxHp != null) { p.maxHp = Math.max(1, parseInt(maxHp, 10) || p.maxHp); p.hp = Math.min(p.hp, p.maxHp); }
    var ac = prompt('Armour class', p.ac);
    if (ac != null) p.ac = parseInt(ac, 10) || p.ac;
    var pp = prompt('Passive Perception', p.pp);
    if (pp != null) p.pp = parseInt(pp, 10) || p.pp;
    var temp = prompt('Temporary hit points', p.temp || 0);
    if (temp != null) p.temp = Math.max(0, parseInt(temp, 10) || 0);
    save(); renderParty();
  }

  H.qs('#pc-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var level = H.clamp(parseInt(H.qs('#pc-level').value, 10) || 1, 1, 20);
    var maxHp = Math.max(1, parseInt(H.qs('#pc-hp').value, 10) || 10);
    camp().party.push({
      name: H.qs('#pc-name').value.trim(),
      player: H.qs('#pc-player').value.trim(),
      cls: H.qs('#pc-class').value,
      level: level,
      xp: XP_LEVELS[level - 1],
      maxHp: maxHp, hp: maxHp, temp: 0,
      ac: parseInt(H.qs('#pc-ac').value, 10) || 10,
      pp: parseInt(H.qs('#pc-pp').value, 10) || 10,
      hitDice: level,
      inspiration: false, deathSuccess: 0, deathFail: 0
    });
    this.reset();
    H.qs('#pc-level').value = '1';
    H.qs('#pc-hp').value = '10';
    H.qs('#pc-ac').value = '14';
    H.qs('#pc-pp').value = '12';
    save(); renderBar(); renderParty(); renderProgress();
  });

  /* ---------- Rests ---------- */
  H.on('#btn-short-rest', 'click', function () {
    var party = camp().party;
    if (!party.length) return;
    var spent = 0;
    party.forEach(function (p) {
      if (p.hp >= p.maxHp || p.hitDice <= 0) return;
      var die = CAMPAIGN_DATA.hitDie[p.cls] || 8;
      var healed = Dice.total('1d' + die) + 2;
      p.hp = Math.min(p.maxHp, p.hp + healed);
      p.hitDice--;
      spent++;
    });
    addLog('rest', 'Short rest. ' + spent + ' hit ' + (spent === 1 ? 'die' : 'dice') + ' spent.');
    save(); renderAll();
    H.toast('Short rest taken');
  });

  H.on('#btn-long-rest', 'click', function () {
    var party = camp().party;
    if (!party.length) return;
    party.forEach(function (p) {
      var level = camp().milestone ? p.level : levelForXp(p.xp || 0);
      p.hp = p.maxHp;
      p.temp = 0;
      p.deathSuccess = 0;
      p.deathFail = 0;
      p.hitDice = Math.min(level, p.hitDice + Math.max(1, Math.floor(level / 2)));
    });
    addLog('rest', 'Long rest. Everyone back to full.');
    save(); renderAll();
    H.toast('Long rest taken');
  });

  H.on('#btn-to-initiative', 'click', function () {
    var party = camp().party;
    if (!party.length) { H.toast('The party is empty'); return; }
    var enc = H.store.get('encounter', null) || { combatants: [], round: 1, turn: 0, nextId: 1 };
    party.forEach(function (p) {
      enc.combatants.push({
        id: enc.nextId++, name: p.name, init: Dice.total('1d20'), dex: 0,
        hp: p.hp, maxHp: p.maxHp, ac: p.ac, pc: true, conditions: [], temp: p.temp || 0
      });
    });
    H.store.set('encounter', enc);
    H.toast('Party sent to the initiative tracker');
  });

  /* ---------- Session log ---------- */
  function addLog(kind, text) {
    camp().log.unshift({
      kind: kind, text: text, session: camp().session,
      when: stamp(), inGame: camp().inGameDate || ''
    });
    save();
  }

  function renderLog() {
    var filter = H.qs('#log-filter').value;
    var list = camp().log.filter(function (e) { return !filter || e.kind === filter; });

    if (!list.length) {
      H.qs('#log-list').innerHTML = '<div class="empty">Nothing logged yet.</div>';
      return;
    }
    H.qs('#log-list').innerHTML = list.map(function (e) {
      var kind = CAMPAIGN_DATA.logKinds.filter(function (k) { return k.id === e.kind; })[0] ||
                 { icon: '✍️', label: 'Note' };
      var idx = camp().log.indexOf(e);
      return '<div class="entry' + (e.kind === 'level' ? ' highlight' : '') + '">' +
        '<div class="entry-meta">' + kind.icon + ' ' + kind.label + ' · session ' + e.session +
          ' · ' + H.escape(e.when) + (e.inGame ? ' · ' + H.escape(e.inGame) : '') +
          ' <button class="btn btn-sm btn-danger no-print" data-log-del="' + idx + '" style="padding:0 6px;margin-left:6px">✕</button>' +
        '</div>' +
        '<div class="entry-body">' + H.escape(e.text) + '</div>' +
      '</div>';
    }).join('');
  }

  H.qs('#log-list').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-log-del]');
    if (!btn) return;
    camp().log.splice(parseInt(btn.getAttribute('data-log-del'), 10), 1);
    save(); renderBar(); renderLog();
  });

  H.qs('#log-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = H.qs('#log-text').value.trim();
    if (!text) return;
    addLog(H.qs('#log-kind').value, text);
    H.qs('#log-text').value = '';
    renderBar(); renderLog();
  });

  H.qs('#log-text').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      H.qs('#log-form').dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  H.on('#log-filter', 'change', renderLog);

  H.on('#btn-end-session', 'click', function () {
    addLog('note', '— End of session ' + camp().session + ' —');
    camp().session++;
    H.qs('#sess-num').value = camp().session;
    save(); renderBar(); renderLog();
    H.toast('Session ' + camp().session + ' begins');
  });

  H.on('#sess-num', 'input', function () {
    camp().session = Math.max(1, parseInt(this.value, 10) || 1);
    save(); renderBar();
  });
  H.on('#sess-date', 'input', function () {
    camp().inGameDate = this.value;
    save();
  });

  /* ---------- Quick and secret rolls ---------- */
  function quickRoll(notation) {
    try {
      var r = Dice.roll(notation);
      H.qs('#quick-total').textContent = r.total;
      H.qs('#quick-detail').innerHTML = Dice.breakdownHtml(r);
    } catch (err) {
      H.qs('#quick-total').textContent = '!';
      H.qs('#quick-detail').textContent = err.message;
    }
  }
  ['1d20', 'adv', 'dis', '1d4', '1d6', '1d8', '1d10', '1d12', '1d100'].forEach(function (n) {
    var b = H.el('button', 'chip', n);
    b.type = 'button';
    b.addEventListener('click', function () { quickRoll(n); });
    H.qs('#quick-chips').appendChild(b);
  });
  H.qs('#quick-form').addEventListener('submit', function (e) {
    e.preventDefault();
    quickRoll(H.qs('#quick-input').value);
  });

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-secret]');
    if (!btn) return;
    var out = H.qs('#secret-out');
    var party = camp().party;

    if (btn.getAttribute('data-secret') === 'perception') {
      if (!party.length) { out.innerHTML = '<div class="empty">Add the party first.</div>'; return; }
      var dc = Dice.total('1d20') + 5;
      out.innerHTML = '<div class="result-box"><b>Hidden DC ' + dc + '</b>' +
        party.map(function (p) {
          return '<div class="stat-line"><span>' + H.escape(p.name) + '</span><span>' +
            (p.pp >= dc ? '<span class="tag green">notices</span>' : '<span class="tag">misses it</span>') +
            ' (passive ' + p.pp + ')</span></div>';
        }).join('') + '</div>';
    } else if (btn.getAttribute('data-secret') === 'insight') {
      if (!party.length) { out.innerHTML = '<div class="empty">Add the party first.</div>'; return; }
      out.innerHTML = '<div class="result-box">' + party.map(function (p) {
        var roll = Dice.total('1d20');
        return '<div class="stat-line"><span>' + H.escape(p.name) + '</span><span>rolled ' + roll + '</span></div>';
      }).join('') + '<div class="muted" style="font-size:.82rem;margin-top:6px">Add each player\'s Insight modifier yourself.</div></div>';
    } else {
      var chance = Dice.total('1d20');
      out.innerHTML = '<div class="result-box"><b>' +
        (chance >= 18 ? 'Something finds them' : 'The road stays quiet') + '</b>' +
        '<div class="muted" style="font-size:.85rem">rolled ' + chance + ', encounter on 18+</div></div>';
    }
  });

  /* ---------- Quests ---------- */
  function renderQuests() {
    var filter = H.qs('#quest-filter').value;
    var list = camp().quests.filter(function (q) { return !filter || q.status === filter; });

    if (!list.length) {
      H.qs('#quest-list').innerHTML = '<div class="empty">No quests here.</div>';
      return;
    }
    H.qs('#quest-list').innerHTML = list.map(function (q) {
      var i = camp().quests.indexOf(q);
      var doneCount = q.objectives.filter(function (o) { return o.done; }).length;
      return '<div class="quest' + (q.status === 'Completed' ? ' done' : '') + '">' +
        '<div class="panel-head" style="margin-bottom:6px">' +
          '<div><span class="quest-title">' + H.escape(q.title) + '</span>' +
            (q.giver ? '<div class="muted" style="font-size:.82rem">from ' + H.escape(q.giver) + '</div>' : '') + '</div>' +
          '<div class="btn-group no-print">' +
            '<select data-quest-status="' + i + '" style="width:auto;padding:3px 6px;font-size:.8rem">' +
              CAMPAIGN_DATA.questStatus.map(function (s) {
                return '<option' + (s === q.status ? ' selected' : '') + '>' + s + '</option>';
              }).join('') +
            '</select>' +
            '<button class="btn btn-sm btn-danger" data-quest-del="' + i + '">✕</button>' +
          '</div>' +
        '</div>' +
        (q.objectives.length
          ? '<div style="margin:6px 0">' + q.objectives.map(function (o, oi) {
              return '<label class="objective' + (o.done ? ' done' : '') + '">' +
                '<input type="checkbox" data-obj="' + i + ':' + oi + '"' + (o.done ? ' checked' : '') + '>' +
                '<span>' + H.escape(o.text) + '</span></label>';
            }).join('') +
            '<div class="muted" style="font-size:.8rem">' + doneCount + ' of ' + q.objectives.length + ' done</div></div>'
          : '') +
        (q.reward ? '<div class="stat-line"><span>Reward</span><span>' + H.escape(q.reward) + '</span></div>' : '') +
        (q.notes ? '<div class="muted" style="font-size:.88rem;margin-top:6px;white-space:pre-wrap">' + H.escape(q.notes) + '</div>' : '') +
      '</div>';
    }).join('');
  }

  H.qs('#quest-form').addEventListener('submit', function (e) {
    e.preventDefault();
    camp().quests.unshift({
      title: H.qs('#q-title').value.trim(),
      giver: H.qs('#q-giver').value.trim(),
      reward: H.qs('#q-reward').value.trim(),
      notes: H.qs('#q-notes').value.trim(),
      status: 'Active',
      objectives: H.qs('#q-objectives').value.split('\n')
        .map(function (s) { return s.trim(); }).filter(Boolean)
        .map(function (t) { return { text: t, done: false }; })
    });
    this.reset();
    save(); renderBar(); renderQuests();
  });

  H.qs('#quest-list').addEventListener('change', function (e) {
    var status = e.target.closest('[data-quest-status]');
    if (status) {
      var q = camp().quests[parseInt(status.getAttribute('data-quest-status'), 10)];
      q.status = status.value;
      if (q.status === 'Completed') addLog('note', 'Quest completed: ' + q.title);
      save(); renderBar(); renderQuests(); renderLog();
      return;
    }
    var obj = e.target.closest('[data-obj]');
    if (obj) {
      var parts = obj.getAttribute('data-obj').split(':');
      camp().quests[parseInt(parts[0], 10)].objectives[parseInt(parts[1], 10)].done = obj.checked;
      save(); renderQuests();
    }
  });

  H.qs('#quest-list').addEventListener('click', function (e) {
    var del = e.target.closest('[data-quest-del]');
    if (!del) return;
    camp().quests.splice(parseInt(del.getAttribute('data-quest-del'), 10), 1);
    save(); renderBar(); renderQuests();
  });

  H.on('#quest-filter', 'change', renderQuests);

  /* ---------- World: NPCs and places ---------- */
  function renderWorld() {
    var q = H.qs('#npc-search').value.trim().toLowerCase();
    var npcs = camp().npcs.filter(function (n) {
      return !q || n.name.toLowerCase().indexOf(q) !== -1 ||
        (n.where || '').toLowerCase().indexOf(q) !== -1 ||
        (n.note || '').toLowerCase().indexOf(q) !== -1;
    });

    H.qs('#npc-list').innerHTML = npcs.length
      ? npcs.map(function (n) {
          var i = camp().npcs.indexOf(n);
          return '<div class="stat-line">' +
            '<span><b>' + H.escape(n.name) + '</b>' +
              '<br><small>' + H.escape(n.where || 'somewhere') + ' · ' + H.escape(n.attitude) + '</small>' +
              (n.note ? '<br><small class="muted">' + H.escape(n.note) + '</small>' : '') + '</span>' +
            '<span class="btn-group no-print"><button class="btn btn-sm btn-danger" data-npc-del="' + i + '">✕</button></span>' +
          '</div>';
        }).join('')
      : '<div class="empty">No NPCs noted yet.</div>';

    H.qs('#place-list').innerHTML = camp().places.length
      ? camp().places.map(function (p, i) {
          return '<div class="stat-line">' +
            '<span><b>' + H.escape(p.name) + '</b><br><small>' + H.escape(p.type) + '</small>' +
              (p.note ? '<br><small class="muted">' + H.escape(p.note) + '</small>' : '') + '</span>' +
            '<span class="btn-group no-print"><button class="btn btn-sm btn-danger" data-place-del="' + i + '">✕</button></span>' +
          '</div>';
        }).join('')
      : '<div class="empty">No places noted yet.</div>';
  }

  H.qs('#npc-form').addEventListener('submit', function (e) {
    e.preventDefault();
    camp().npcs.unshift({
      name: H.qs('#n-name').value.trim(),
      where: H.qs('#n-where').value.trim(),
      attitude: H.qs('#n-attitude').value,
      note: H.qs('#n-note').value.trim()
    });
    H.qs('#n-name').value = ''; H.qs('#n-where').value = ''; H.qs('#n-note').value = '';
    save(); renderBar(); renderWorld();
  });

  H.qs('#place-form').addEventListener('submit', function (e) {
    e.preventDefault();
    camp().places.unshift({
      name: H.qs('#p-name').value.trim(),
      type: H.qs('#p-type').value,
      note: H.qs('#p-note').value.trim()
    });
    H.qs('#p-name').value = ''; H.qs('#p-note').value = '';
    save(); renderBar(); renderWorld();
  });

  H.qs('#npc-list').addEventListener('click', function (e) {
    var del = e.target.closest('[data-npc-del]');
    if (!del) return;
    camp().npcs.splice(parseInt(del.getAttribute('data-npc-del'), 10), 1);
    save(); renderBar(); renderWorld();
  });
  H.qs('#place-list').addEventListener('click', function (e) {
    var del = e.target.closest('[data-place-del]');
    if (!del) return;
    camp().places.splice(parseInt(del.getAttribute('data-place-del'), 10), 1);
    save(); renderBar(); renderWorld();
  });

  H.on('#npc-search', 'input', renderWorld);

  H.on('#btn-gen-npc', 'click', function () {
    var ancestries = Object.keys(NAMES.ancestries);
    var d = NAMES.ancestries[H.pick(ancestries)];
    var g = H.pick(['m', 'f']);
    H.qs('#n-name').value = H.pick(d[g]) + (d.family && d.family.length ? ' ' + H.pick(d.family) : '');
    H.qs('#n-note').value = H.pick(NPC_DATA.occupations) + ', ' + H.pick(NPC_DATA.trait);
    H.qs('#n-attitude').value = H.weighted(NPC_DATA.attitude).label;
  });

  H.on('#btn-gen-place', 'click', function () {
    H.qs('#p-name').value = H.pick(NAMES.placePrefix) + H.pick(NAMES.placeSuffix);
  });

  /* ---------- Loot ---------- */
  function renderLoot() {
    var loot = camp().loot;
    ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(function (k) { H.qs('#coin-' + k).value = loot[k] || 0; });

    var coinGp = purseInGp(loot);
    var itemGp = loot.items.reduce(function (s, i) { return s + (i.value || 0); }, 0);

    H.qs('#purse-summary').innerHTML =
      '<div class="stat-line"><span>Coins in gold</span><span>' + H.num(Math.round(coinGp * 100) / 100) + ' gp</span></div>' +
      '<div class="stat-line"><span>Items</span><span>' + H.num(itemGp) + ' gp</span></div>' +
      '<div class="stat-line"><span><b>Everything</b></span><span><b>' + H.num(Math.round((coinGp + itemGp) * 100) / 100) + ' gp</b></span></div>' +
      '<div class="stat-line"><span>Per party member</span><span>' +
        (camp().party.length ? H.num(Math.round((coinGp + itemGp) / camp().party.length * 100) / 100) + ' gp' : '—') +
      '</span></div>';

    H.qs('#item-count').textContent = loot.items.length + ' item' + (loot.items.length === 1 ? '' : 's');
    H.qs('#item-list').innerHTML = loot.items.length
      ? loot.items.map(function (it, i) {
          return '<div class="stat-line">' +
            '<span><b>' + H.escape(it.name) + '</b>' +
              (it.holder ? '<br><small>carried by ' + H.escape(it.holder) + '</small>' : '') + '</span>' +
            '<span>' + (it.value ? H.num(it.value) + ' gp ' : '') +
              '<button class="btn btn-sm btn-danger no-print" data-item-del="' + i + '">✕</button></span>' +
          '</div>';
        }).join('')
      : '<div class="empty">Nothing carried yet.</div>';
  }

  ['cp', 'sp', 'ep', 'gp', 'pp'].forEach(function (k) {
    H.on('#coin-' + k, 'input', function () {
      camp().loot[k] = Math.max(0, parseInt(this.value, 10) || 0);
      save(); renderBar(); renderLoot();
    });
  });

  H.qs('#coin-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var coin = H.qs('#add-coin').value;
    var amount = parseInt(H.qs('#add-amount').value, 10) || 0;
    camp().loot[coin] = Math.max(0, (camp().loot[coin] || 0) + amount);
    addLog('loot', (amount >= 0 ? 'Gained ' : 'Spent ') + Math.abs(amount) + ' ' + coin + '.');
    save(); renderBar(); renderLoot(); renderLog();
  });

  H.qs('#item-form').addEventListener('submit', function (e) {
    e.preventDefault();
    camp().loot.items.unshift({
      name: H.qs('#i-name').value.trim(),
      value: parseInt(H.qs('#i-value').value, 10) || 0,
      holder: H.qs('#i-holder').value.trim()
    });
    addLog('loot', 'Found: ' + H.qs('#i-name').value.trim());
    H.qs('#i-name').value = ''; H.qs('#i-value').value = '0';
    save(); renderLoot(); renderLog();
  });

  H.qs('#item-list').addEventListener('click', function (e) {
    var del = e.target.closest('[data-item-del]');
    if (!del) return;
    camp().loot.items.splice(parseInt(del.getAttribute('data-item-del'), 10), 1);
    save(); renderLoot();
  });

  H.on('#btn-split', 'click', function () {
    var party = camp().party;
    if (!party.length) { H.toast('Add the party first'); return; }

    // work in copper so nothing is lost to rounding
    var totalCp = Math.round(purseInGp(camp().loot) * 100);
    var share = Math.floor(totalCp / party.length);
    var remainder = totalCp - share * party.length;

    // Gold, silver and copper only: nobody at the table thinks in platinum
    // when working out what each person is owed.
    function breakdown(cp) {
      var out = {}, left = cp;
      [['gp', 100], ['sp', 10], ['cp', 1]].forEach(function (pair) {
        out[pair[0]] = Math.floor(left / pair[1]);
        left -= out[pair[0]] * pair[1];
      });
      return out;
    }

    var per = breakdown(share);
    H.qs('#split-out').innerHTML = '<div class="result-box">' +
      '<b>Each of the ' + party.length + ' gets</b>' +
      ['gp', 'sp', 'cp'].filter(function (k) { return per[k]; }).map(function (k) {
        return '<div class="stat-line"><span>' + k + '</span><span>' + H.num(per[k]) + '</span></div>';
      }).join('') +
      (remainder ? '<div class="stat-line"><span>left over</span><span>' + remainder + ' cp</span></div>' : '') +
      '<div class="muted" style="font-size:.82rem;margin-top:6px">The purse is left untouched &mdash; this is just the sum.</div>' +
    '</div>';
  });

  H.on('#btn-consolidate', 'click', function () {
    var loot = camp().loot;
    var totalCp = Math.round(purseInGp(loot) * 100);
    loot.pp = Math.floor(totalCp / 1000); totalCp -= loot.pp * 1000;
    loot.gp = Math.floor(totalCp / 100); totalCp -= loot.gp * 100;
    loot.sp = Math.floor(totalCp / 10); totalCp -= loot.sp * 10;
    loot.cp = totalCp;
    loot.ep = 0;
    save(); renderBar(); renderLoot();
    H.toast('Purse converted upward');
  });

  /* ---------- Progress ---------- */
  function renderProgress() {
    var c = camp();
    H.qs('#milestone').checked = !!c.milestone;
    H.qs('#xp-award-panel').classList.toggle('hidden', !!c.milestone);

    if (!c.party.length) {
      H.qs('#xp-out').innerHTML = '<div class="empty">Add characters first.</div>';
      H.qs('#level-controls').innerHTML = '<div class="empty">Add characters first.</div>';
    } else {
      H.qs('#xp-out').innerHTML = c.party.map(function (p) {
        var level = c.milestone ? p.level : levelForXp(p.xp || 0);
        var next = level < 20 ? XP_LEVELS[level] : null;
        var into = (p.xp || 0) - XP_LEVELS[level - 1];
        var span = next ? next - XP_LEVELS[level - 1] : 1;
        var pct = next ? H.clamp(Math.round((into / span) * 100), 0, 100) : 100;

        return '<div style="margin-bottom:12px">' +
          '<div class="stat-line" style="border:0;padding-bottom:2px">' +
            '<span><b>' + H.escape(p.name) + '</b> · level ' + level + '</span>' +
            '<span>' + (c.milestone ? '—' : H.num(p.xp || 0) + ' XP') + '</span></div>' +
          (c.milestone ? '' :
            '<div class="hpbar"><i style="width:' + pct + '%;background:var(--gold)"></i></div>' +
            '<div class="muted" style="font-size:.78rem;margin-top:3px">' +
              (next ? H.num(next - (p.xp || 0)) + ' XP to level ' + (level + 1) : 'maximum level') +
            '</div>') +
        '</div>';
      }).join('');

      H.qs('#level-controls').innerHTML = c.party.map(function (p, i) {
        var level = c.milestone ? p.level : levelForXp(p.xp || 0);
        return '<div class="stat-line"><span>' + H.escape(p.name) + ' · level ' + level + '</span>' +
          '<span class="btn-group">' +
            '<button class="btn btn-sm" data-level="' + i + ':-1">&#8722;</button>' +
            '<button class="btn btn-sm" data-level="' + i + ':1">+</button>' +
          '</span></div>';
      }).join('');
    }

    var sessions = c.session;
    var logCount = c.log.length;
    H.qs('#campaign-stats').innerHTML =
      '<div class="stat-line"><span>Sessions played</span><span>' + (sessions - 1) + '</span></div>' +
      '<div class="stat-line"><span>Log entries</span><span>' + logCount + '</span></div>' +
      '<div class="stat-line"><span>Quests completed</span><span>' +
        c.quests.filter(function (q) { return q.status === 'Completed'; }).length + ' of ' + c.quests.length + '</span></div>' +
      '<div class="stat-line"><span>NPCs met</span><span>' + c.npcs.length + '</span></div>' +
      '<div class="stat-line"><span>Places visited</span><span>' + c.places.length + '</span></div>' +
      '<div class="stat-line"><span>Party worth</span><span>' + H.num(Math.round(purseInGp(c.loot))) + ' gp</span></div>';
  }

  H.qs('#level-controls').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-level]');
    if (!btn) return;
    var parts = btn.getAttribute('data-level').split(':');
    var p = camp().party[parseInt(parts[0], 10)];
    var delta = parseInt(parts[1], 10);
    var level = H.clamp((camp().milestone ? p.level : levelForXp(p.xp || 0)) + delta, 1, 20);
    p.level = level;
    p.xp = XP_LEVELS[level - 1];
    p.hitDice = Math.min(p.hitDice, level);
    if (delta > 0) addLog('level', p.name + ' reached level ' + level + '.');
    save(); renderAll();
  });

  H.on('#milestone', 'change', function () {
    camp().milestone = this.checked;
    if (this.checked) {
      // freeze each character at the level their XP already bought
      camp().party.forEach(function (p) { p.level = levelForXp(p.xp || 0); });
    }
    save(); renderAll();
  });

  H.qs('#xp-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var party = camp().party;
    if (!party.length) { H.toast('Add the party first'); return; }
    var total = parseInt(H.qs('#xp-amount').value, 10) || 0;
    var each = H.qs('#xp-mode').value === 'split' ? Math.floor(total / party.length) : total;

    party.forEach(function (p) {
      var before = levelForXp(p.xp || 0);
      p.xp = Math.max(0, (p.xp || 0) + each);
      var after = levelForXp(p.xp);
      if (after > before) {
        p.level = after;
        p.hitDice = after;
        addLog('level', p.name + ' reached level ' + after + '.');
        H.toast(p.name + ' levelled up');
      }
    });
    addLog('note', 'Awarded ' + H.num(each) + ' XP each.');
    save(); renderAll();
  });

  H.on('#btn-xp-from-encounter', 'click', function () {
    var builder = H.store.get('encounter-builder', []);
    if (!builder.length) { H.toast('The encounter builder is empty'); return; }
    // the builder stores names and counts; XP comes from the monster data it shares
    var monsters = window.MONSTERS || [];
    if (!monsters.length) { H.toast('Open the encounter builder first to load the monster data'); return; }
    var total = builder.reduce(function (sum, row) {
      var m = monsters.filter(function (x) { return x.name === row.name; })[0];
      return sum + (m ? (window.CR_XP[m.cr] || 0) * row.count : 0);
    }, 0);
    H.qs('#xp-amount').value = total;
    H.toast(H.num(total) + ' XP loaded from the builder');
  });

  /* ---------- Campaign management ---------- */
  H.on('#camp-name', 'input', function () {
    camp().name = this.value;
    save(); renderBar();
  });

  H.on('#camp-select', 'change', function () {
    activeIndex = parseInt(this.value, 10);
    save(true); renderAll();
  });

  H.on('#btn-new', 'click', function () {
    var name = prompt('Name for the new campaign', 'New campaign');
    if (name == null) return;
    var fresh = CAMPAIGN_DATA.blank();
    fresh.name = name.trim() || 'New campaign';
    campaigns.push(fresh);
    activeIndex = campaigns.length - 1;
    save(true); renderAll();
  });

  H.on('#btn-delete', 'click', function () {
    if (campaigns.length === 1) { H.toast('This is the only campaign'); return; }
    if (!confirm('Delete "' + camp().name + '" and everything in it?')) return;
    campaigns.splice(activeIndex, 1);
    activeIndex = 0;
    save(true); renderAll();
  });

  H.on('#btn-export', 'click', function () {
    var name = camp().name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase() || 'campaign';
    H.download(name + '.json', JSON.stringify(camp(), null, 2), 'application/json');
  });

  H.on('#btn-import', 'click', function () {
    H.pickFile('.json,application/json', false, function (file) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data || !Array.isArray(data.party)) throw new Error('bad');
          // fill in anything an older export might be missing
          var blank = CAMPAIGN_DATA.blank();
          Object.keys(blank).forEach(function (k) { if (data[k] === undefined) data[k] = blank[k]; });
          campaigns.push(data);
          activeIndex = campaigns.length - 1;
          save(true); renderAll();
          H.toast('Campaign imported');
        } catch (err) { H.toast('That file could not be read'); }
      };
      reader.readAsText(file);
    });
  });

  /* ---------- Recap ---------- */
  function buildRecap() {
    var c = camp();
    var thisSession = c.log.filter(function (e) { return e.session === c.session; }).slice().reverse();
    var lines = [];

    lines.push('# ' + c.name);
    lines.push('## Session ' + c.session + (c.inGameDate ? ' — ' + c.inGameDate : ''));
    lines.push('');

    lines.push('### The party');
    c.party.forEach(function (p) {
      var level = c.milestone ? p.level : levelForXp(p.xp || 0);
      lines.push('- **' + p.name + '** (' + (p.player || 'no player') + ') — ' + p.cls + ' ' + level +
        ', ' + p.hp + '/' + p.maxHp + ' hp' + (c.milestone ? '' : ', ' + H.num(p.xp || 0) + ' XP'));
    });
    lines.push('');

    if (thisSession.length) {
      lines.push('### What happened');
      thisSession.forEach(function (e) {
        var kind = CAMPAIGN_DATA.logKinds.filter(function (k) { return k.id === e.kind; })[0];
        lines.push('- *' + (kind ? kind.label : 'Note') + ':* ' + e.text);
      });
      lines.push('');
    }

    var active = c.quests.filter(function (q) { return q.status === 'Active'; });
    if (active.length) {
      lines.push('### Open quests');
      active.forEach(function (q) {
        var done = q.objectives.filter(function (o) { return o.done; }).length;
        lines.push('- **' + q.title + '**' + (q.objectives.length ? ' (' + done + '/' + q.objectives.length + ')' : ''));
        q.objectives.filter(function (o) { return !o.done; }).forEach(function (o) {
          lines.push('  - [ ] ' + o.text);
        });
      });
      lines.push('');
    }

    lines.push('### The purse');
    lines.push('- ' + H.num(Math.round(purseInGp(c.loot) * 100) / 100) + ' gp in coin');
    if (c.loot.items.length) {
      c.loot.items.forEach(function (it) {
        lines.push('- ' + it.name + (it.value ? ' (' + H.num(it.value) + ' gp)' : '') +
          (it.holder ? ' — ' + it.holder : ''));
      });
    }

    return lines.join('\n');
  }

  H.on('#btn-recap', 'click', function () {
    H.qs('#recap-text').textContent = buildRecap();
    H.qs('#recap-panel').classList.remove('hidden');
    H.reveal(H.qs('#recap-panel'));
  });
  H.on('#btn-recap-close', 'click', function () { H.qs('#recap-panel').classList.add('hidden'); });
  H.on('#btn-recap-download', 'click', function () {
    var name = camp().name.replace(/[^a-z0-9_-]+/gi, '-').toLowerCase() || 'campaign';
    H.download(name + '-session-' + camp().session + '.md', buildRecap(), 'text/markdown;charset=utf-8');
  });

  /* ---------- Tabs ---------- */
  H.qs('#tabs').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-tab]');
    if (!btn) return;
    H.qsa('.tab').forEach(function (t) { t.classList.remove('active'); });
    H.qsa('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
    btn.classList.add('active');
    H.qs('#panel-' + btn.getAttribute('data-tab')).classList.add('active');
    H.store.set('console-tab', btn.getAttribute('data-tab'));
  });

  var lastTab = H.store.get('console-tab', 'party');
  var tabBtn = H.qs('[data-tab="' + lastTab + '"]');
  if (tabBtn) tabBtn.click();

  renderAll();
  save(true);
})();
