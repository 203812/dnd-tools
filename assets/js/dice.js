/* ============================================================
   dice.js - parser and evaluator for dice notation
   ------------------------------------------------------------
   Supports, among others:
     1d20+5            standard roll with a modifier
     4d6kh3            keep the highest 3 of 4 dice
     2d20kl1           keep the lowest (disadvantage)
     adv / dis         shorthand for 2d20kh1 / 2d20kl1
     8d6!              exploding dice (a maximum rolls again)
     4d6r1             reroll any 1
     2d10min2          every die counts as at least 2
     (2d6+3)*2         parentheses and multiplication
     1d100 / 1dF       percentile and Fudge/Fate dice
     6#1d20+3          six separate rolls in a row
   ============================================================ */
(function () {
  'use strict';

  var MAX_DICE = 500;        // safety limit per term
  var MAX_EXPLOSIONS = 100;  // prevents endless exploding

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

      // dice term or number
      var m = /^(\d*)d(%|f|\d+)((?:(?:kh|kl|dh|dl|min|max|ro|r)\d+|!)*)/.exec(s.slice(i));
      if (m) {
        tokens.push({ t: 'dice', count: m[1] === '' ? 1 : parseInt(m[1], 10), sides: m[2], mods: m[3] || '' });
        i += m[0].length;
        continue;
      }
      var n = /^\d+(?:\.\d+)?/.exec(s.slice(i));
      if (n) { tokens.push({ t: 'num', value: parseFloat(n[0]) }); i += n[0].length; continue; }

      throw new Error('Unrecognised character "' + c + '" in the notation.');
    }
    return tokens;
  }

  /* ---------------- Rolling a dice term ---------------- */
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
    if (count > MAX_DICE) throw new Error('At most ' + MAX_DICE + ' dice per term.');

    var fudge = sidesRaw === 'f';
    var sides = fudge ? 3 : (sidesRaw === '%' ? 100 : parseInt(sidesRaw, 10));
    if (!fudge && (!sides || sides < 1)) throw new Error('Invalid number of sides.');

    var mods = parseMods(modStr);
    var dice = [];

    for (var i = 0; i < count; i++) {
      var v = rnd(sides);
      var note = '';

      // rerolls
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

      // exploding: every maximum roll grants an extra die
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

    // keep / drop
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
        if (op === '/' && r === 0) throw new Error('Division by zero.');
        v = op === '*' ? v * r : v / r;
      }
      return v;
    }
    function factor() {
      var tk = peek();
      if (!tk) throw new Error('Unexpected end of notation.');
      if (tk.t === '-') { next(); return -factor(); }
      if (tk.t === '+') { next(); return factor(); }
      if (tk.t === '(') {
        next();
        var v = expr();
        if (!peek() || peek().t !== ')') throw new Error('Missing closing bracket.');
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
      throw new Error('Unexpected part in the notation.');
    }

    var total = expr();
    if (pos < tokens.length) throw new Error('The notation could not be read in full.');
    return { total: total, terms: allDice };
  }

  /* ---------------- Public API ---------------- */

  /**
   * Rolls a notation and returns {total, terms, notation}.
   * Throws an Error with a readable message on invalid input.
   */
  function roll(notation) {
    var input = String(notation || '').trim();
    if (!input) throw new Error('No notation entered.');
    var res = parse(tokenize(input));
    res.total = Math.round(res.total * 100) / 100;
    res.notation = input;
    return res;
  }

  /** Rolls the "N#expr" form: always returns an array of results. */
  function rollMany(notation) {
    var input = String(notation || '').trim();
    var m = /^(\d+)\s*#\s*(.+)$/.exec(input);
    var times = 1, expr = input;
    if (m) { times = Math.min(parseInt(m[1], 10), 100); expr = m[2]; }
    var out = [];
    for (var i = 0; i < times; i++) out.push(roll(expr));
    return out;
  }

  /** Just the total, handy for generators. Returns 0 on error. */
  function total(notation) {
    try { return roll(notation).total; } catch (e) { return 0; }
  }

  /** Renderable HTML with a pill per die. */
  function breakdownHtml(result) {
    if (!result.terms.length) return '<span class="muted">fixed value</span>';
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
