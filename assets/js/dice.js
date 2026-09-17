/* ============================================================
   dice.js - parser en evaluator voor dobbelsteennotatie
   ------------------------------------------------------------
   Ondersteunt o.a.:
     1d20+5            standaard worp met modifier
     4d6kh3            hoogste 3 van 4 dobbelstenen houden
     2d20kl1           laagste houden (disadvantage)
     adv / dis         afkorting voor 2d20kh1 / 2d20kl1
     8d6!              exploderende dobbelstenen (max op nieuw = extra worp)
     4d6r1             eenmalig hergooien bij een 1
     2d10min2          elke worp telt minimaal 2
     (2d6+3)*2         haakjes en vermenigvuldiging
     1d100 / 1dF       procentwoorden en Fudge/Fate-dobbelstenen
     6#1d20+3          zes losse worpen achter elkaar
   ============================================================ */
(function () {
  'use strict';

  var MAX_DICE = 500;        // veiligheidsgrens per term
  var MAX_EXPLOSIONS = 100;  // voorkomt eindeloos exploderen

  function rnd(sides) { return Math.floor(Math.random() * sides) + 1; }

  /* ---------------- Tokenizer ---------------- */
  function tokenize(input) {
    var s = input.toLowerCase().replace(/\s+/g, '');
    s = s.replace(/\badvantage\b|\badv\b/g, '2d20kh1')
         .replace(/\bdisadvantage\b|\bdisadv\b|\bdis\b/g, '2d20kl1');
    var tokens = [], i = 0;

    while (i < s.length) {
      var c = s[i];

      if ('+-*/()'.indexOf(c) !== -1) { tokens.push({ t: c }); i++; continue; }

      // dobbelsteenterm of getal
      var m = /^(\d*)d(%|f|\d+)((?:(?:kh|kl|dh|dl|min|max|ro|r)\d+|!)*)/.exec(s.slice(i));
      if (m) {
        tokens.push({ t: 'dice', count: m[1] === '' ? 1 : parseInt(m[1], 10), sides: m[2], mods: m[3] || '' });
        i += m[0].length;
        continue;
      }
      var n = /^\d+(?:\.\d+)?/.exec(s.slice(i));
      if (n) { tokens.push({ t: 'num', value: parseFloat(n[0]) }); i += n[0].length; continue; }

      throw new Error('Onbegrepen teken "' + c + '" in de notatie.');
    }
    return tokens;
  }

  /* ---------------- Dobbelsteenterm uitvoeren ---------------- */
  function parseMods(str) {
    var mods = { keepHigh: null, keepLow: null, dropHigh: null, dropLow: null, explode: false, reroll: null, rerollOnce: null, min: null, max: null };
    var re = /(kh|kl|dh|dl|min|max|ro|r)(\d+)|(!)/g, m;
    while ((m = re.exec(str))) {
      if (m[3]) { mods.explode = true; continue; }
      var v = parseInt(m[2], 10);
      switch (m[1]) {
        case 'kh': mods.keepHigh = v; break;
        case 'kl': mods.keepLow = v; break;
        case 'dh': mods.dropHigh = v; break;
        case 'dl': mods.dropLow = v; break;
        case 'min': mods.min = v; break;
        case 'max': mods.max = v; break;
        case 'ro': mods.rerollOnce = v; break;
        case 'r': mods.reroll = v; break;
      }
    }
    return mods;
  }

  function rollTerm(count, sidesRaw, modStr) {
    if (count < 1) count = 1;
    if (count > MAX_DICE) throw new Error('Maximaal ' + MAX_DICE + ' dobbelstenen per term.');

    var fudge = sidesRaw === 'f';
    var sides = fudge ? 3 : (sidesRaw === '%' ? 100 : parseInt(sidesRaw, 10));
    if (!fudge && (!sides || sides < 1)) throw new Error('Ongeldig aantal zijden.');

    var mods = parseMods(modStr);
    var dice = [];

    for (var i = 0; i < count; i++) {
      var v = rnd(sides);
      var note = '';

      // hergooien
      if (mods.reroll != null) {
        var guard = 0;
        while (v <= mods.reroll && guard++ < 50) { v = rnd(sides); note = 'reroll'; }
      } else if (mods.rerollOnce != null && v <= mods.rerollOnce) {
        v = rnd(sides); note = 'reroll';
      }

      if (fudge) v = v - 2; // -1, 0, +1
      if (mods.min != null && v < mods.min) { v = mods.min; note = 'min'; }
      if (mods.max != null && v > mods.max) { v = mods.max; note = 'max'; }

      dice.push({ value: v, sides: fudge ? 'F' : sides, note: note, dropped: false });

      // exploderen: elke max-worp levert een extra dobbelsteen op
      if (mods.explode && !fudge && v === sides) {
        var extra = 0;
        var cur = v;
        while (cur === sides && extra < MAX_EXPLOSIONS) {
          cur = rnd(sides);
          dice.push({ value: cur, sides: sides, note: 'explode', dropped: false });
          extra++;
        }
      }
    }

    // houden / laten vallen
    var order = dice.map(function (d, idx) { return idx; });
    var keep = null;
    if (mods.keepHigh != null) {
      keep = order.slice().sort(function (a, b) { return dice[b].value - dice[a].value; }).slice(0, mods.keepHigh);
    } else if (mods.keepLow != null) {
      keep = order.slice().sort(function (a, b) { return dice[a].value - dice[b].value; }).slice(0, mods.keepLow);
    } else if (mods.dropLow != null) {
      keep = order.slice().sort(function (a, b) { return dice[a].value - dice[b].value; }).slice(mods.dropLow);
    } else if (mods.dropHigh != null) {
      keep = order.slice().sort(function (a, b) { return dice[b].value - dice[a].value; }).slice(mods.dropHigh);
    }
    if (keep) {
      var keepSet = {};
      keep.forEach(function (idx) { keepSet[idx] = true; });
      dice.forEach(function (d, idx) { d.dropped = !keepSet[idx]; });
    }

    var sum = dice.reduce(function (s, d) { return s + (d.dropped ? 0 : d.value); }, 0);
    return { sum: sum, dice: dice, notation: (count) + 'd' + (fudge ? 'F' : sides) + modStr };
  }

  /* ---------------- Parser (recursive descent) ---------------- */
  function parse(tokens) {
    var pos = 0;
    var allDice = [];

    function peek() { return tokens[pos]; }
    function next() { return tokens[pos++]; }

    function expr() {
      var v = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        var op = next().t;
        var r = term();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    }
    function term() {
      var v = factor();
      while (peek() && (peek().t === '*' || peek().t === '/')) {
        var op = next().t;
        var r = factor();
        if (op === '/' && r === 0) throw new Error('Deling door nul.');
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function factor() {
      var tk = peek();
      if (!tk) throw new Error('Onverwacht einde van de notatie.');
      if (tk.t === '-') { next(); return -factor(); }
      if (tk.t === '+') { next(); return factor(); }
      if (tk.t === '(') {
        next();
        var v = expr();
        if (!peek() || peek().t !== ')') throw new Error('Ontbrekend sluithaakje.');
        next();
        return v;
      }
      if (tk.t === 'num') { next(); return tk.value; }
      if (tk.t === 'dice') {
        next();
        var res = rollTerm(tk.count, tk.sides, tk.mods);
        allDice.push(res);
        return res.sum;
      }
      throw new Error('Onverwacht onderdeel in de notatie.');
    }

    var total = expr();
    if (pos < tokens.length) throw new Error('Notatie kon niet volledig gelezen worden.');
    return { total: total, terms: allDice };
  }

  /* ---------------- Publieke API ---------------- */

  /**
   * Rolt een notatie en geeft {total, terms, notation} terug.
   * Gooit een Error met een leesbare melding bij ongeldige invoer.
   */
  function roll(notation) {
    var input = String(notation || '').trim();
    if (!input) throw new Error('Geen notatie ingevuld.');
    var res = parse(tokenize(input));
    res.total = Math.round(res.total * 100) / 100;
    res.notation = input;
    return res;
  }

  /** Rolt "N#expr" vorm: geeft altijd een array met resultaten terug. */
  function rollMany(notation) {
    var input = String(notation || '').trim();
    var m = /^(\d+)\s*#\s*(.+)$/.exec(input);
    var times = 1, expr = input;
    if (m) { times = Math.min(parseInt(m[1], 10), 100); expr = m[2]; }
    var out = [];
    for (var i = 0; i < times; i++) out.push(roll(expr));
    return out;
  }

  /** Alleen het totaal, handig voor generatoren. Bij fouten: 0. */
  function total(notation) {
    try { return roll(notation).total; } catch (e) { return 0; }
  }

  /** Renderbare HTML met per dobbelsteen een "pill". */
  function breakdownHtml(result) {
    if (!result.terms.length) return '<span class="muted">vaste waarde</span>';
    return result.terms.map(function (term) {
      var pills = term.dice.map(function (d) {
        var cls = 'die-pill';
        if (d.dropped) cls += ' dropped';
        else if (typeof d.sides === 'number' && d.value === d.sides) cls += ' max';
        else if (d.value === 1 && typeof d.sides === 'number') cls += ' min';
        var title = d.note ? ' title="' + d.note + '"' : '';
        return '<span class="' + cls + '"' + title + '>' + (d.value > 0 && d.sides === 'F' ? '+' : '') + d.value + '</span>';
      }).join('');
      return '<span class="mono muted">' + term.notation + ':</span> ' + pills;
    }).join(' &nbsp; ');
  }

  window.Dice = { roll: roll, rollMany: rollMany, total: total, breakdownHtml: breakdownHtml, rollTerm: rollTerm };
})();
