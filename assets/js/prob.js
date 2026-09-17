/* ============================================================
   prob.js - probability distributions for dice notation
   ------------------------------------------------------------
   Works out the exact distribution wherever that is feasible:
     - plain sums of dice are convolved
     - keep/drop terms are enumerated over all multisets of faces
   Features that resist exact maths (exploding dice, rerolls) or
   terms that are simply too large fall back to simulation, and the
   result says which method was used.
   ============================================================ */
(function () {
  'use strict';

  var MAX_MULTISETS = 250000;  // enumeration ceiling for keep/drop terms
  var MAX_OUTCOMES = 60000;    // ceiling on distinct values in a distribution
  var DEFAULT_SAMPLES = 200000;

  /** Raised when exact maths isn't possible; triggers the simulation path. */
  function NotExact(reason) { this.reason = reason; }

  /* ---------- Distribution helpers: plain objects value -> probability ---------- */

  function single(value) { var d = {}; d[value] = 1; return d; }

  function uniformDie(sides) {
    var d = {}, p = 1 / sides;
    for (var v = 1; v <= sides; v++) d[v] = p;
    return d;
  }

  function combine(a, b, fn) {
    var out = {}, ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length * kb.length > MAX_OUTCOMES * 12) throw new NotExact('too many combinations');
    for (var i = 0; i < ka.length; i++) {
      var va = parseFloat(ka[i]), pa = a[ka[i]];
      for (var j = 0; j < kb.length; j++) {
        var v = fn(va, parseFloat(kb[j]));
        out[v] = (out[v] || 0) + pa * b[kb[j]];
      }
    }
    if (Object.keys(out).length > MAX_OUTCOMES) throw new NotExact('distribution too wide');
    return out;
  }

  var ADD = function (x, y) { return x + y; };
  var SUB = function (x, y) { return x - y; };
  var MUL = function (x, y) { return x * y; };
  var DIV = function (x, y) { if (y === 0) throw new Error('Division by zero.'); return x / y; };

  /** Sum of n independent dice, by repeated convolution (exponentiation by squaring). */
  function sumOfDice(n, sides) {
    if (n === 0) return single(0);
    var result = null, base = uniformDie(sides), k = n;
    while (k > 0) {
      if (k & 1) result = result ? combine(result, base, ADD) : base;
      k >>= 1;
      if (k > 0) base = combine(base, base, ADD);
    }
    return result;
  }

  /** Binomial coefficient, exact enough for our sizes. */
  function choose(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return r;
  }

  /**
   * Exact distribution for "keep k of n dice", by walking every multiset of
   * faces and weighting it with its multinomial coefficient.
   * mode: 'kh' | 'kl'
   */
  function keepDistribution(n, sides, keep, mode) {
    if (choose(n + sides - 1, n) > MAX_MULTISETS) throw new NotExact('too many dice to enumerate');

    var out = {};
    var counts = new Array(sides).fill(0);
    var logFactorial = [0];
    for (var i = 1; i <= n; i++) logFactorial[i] = logFactorial[i - 1] + Math.log(i);
    var logTotal = n * Math.log(sides);

    function emit() {
      // sum of the kept dice: highest faces first for kh, lowest first for kl
      var need = keep, sum = 0, f;
      if (mode === 'kh') {
        for (f = sides - 1; f >= 0 && need > 0; f--) {
          var takeH = Math.min(counts[f], need);
          sum += takeH * (f + 1); need -= takeH;
        }
      } else {
        for (f = 0; f < sides && need > 0; f++) {
          var takeL = Math.min(counts[f], need);
          sum += takeL * (f + 1); need -= takeL;
        }
      }
      var logW = logFactorial[n];
      for (var c = 0; c < sides; c++) logW -= logFactorial[counts[c]];
      out[sum] = (out[sum] || 0) + Math.exp(logW - logTotal);
    }

    (function walk(face, left) {
      if (face === sides - 1) { counts[face] = left; emit(); counts[face] = 0; return; }
      for (var c = left; c >= 0; c--) { counts[face] = c; walk(face + 1, left - c); }
      counts[face] = 0;
    })(0, n);

    return out;
  }

  /* ---------- Tokenizer (same grammar as dice.js) ---------- */
  function tokenize(input) {
    var s = String(input).toLowerCase().replace(/\s+/g, '');
    s = s.replace(/\badvantage\b|\badv\b/g, '2d20kh1')
         .replace(/\bdisadvantage\b|\bdisadv\b|\bdis\b/g, '2d20kl1');
    var tokens = [], i = 0;
    while (i < s.length) {
      var c = s[i];
      if ('+-*/()'.indexOf(c) !== -1) { tokens.push({ t: c }); i++; continue; }
      var m = /^(\d*)d(%|f|\d+)((?:(?:kh|kl|dh|dl|min|max|ro|r)\d+|!)*)/.exec(s.slice(i));
      if (m) {
        tokens.push({ t: 'dice', count: m[1] === '' ? 1 : parseInt(m[1], 10), sides: m[2], mods: m[3] || '' });
        i += m[0].length; continue;
      }
      var n = /^\d+(?:\.\d+)?/.exec(s.slice(i));
      if (n) { tokens.push({ t: 'num', value: parseFloat(n[0]) }); i += n[0].length; continue; }
      throw new Error('Unrecognised character "' + c + '" in the notation.');
    }
    return tokens;
  }

  /* ---------- Exact evaluation ---------- */
  function termDistribution(tk) {
    if (tk.sides === 'f') throw new NotExact('Fudge dice');
    if (/!/.test(tk.mods)) throw new NotExact('exploding dice');
    if (/(?:^|[^a-z])r(?:o)?\d/.test(tk.mods) || /\bro\d/.test(tk.mods)) throw new NotExact('rerolls');
    if (/(min|max)\d/.test(tk.mods)) throw new NotExact('min/max clamps');

    var sides = tk.sides === '%' ? 100 : parseInt(tk.sides, 10);
    var n = tk.count;
    if (!sides || sides < 1) throw new Error('Invalid number of sides.');
    if (n < 1) n = 1;
    if (n > 300) throw new NotExact('too many dice');

    var kh = /kh(\d+)/.exec(tk.mods);
    var kl = /kl(\d+)/.exec(tk.mods);
    var dh = /dh(\d+)/.exec(tk.mods);
    var dl = /dl(\d+)/.exec(tk.mods);

    if (kh) return keepDistribution(n, sides, Math.min(parseInt(kh[1], 10), n), 'kh');
    if (kl) return keepDistribution(n, sides, Math.min(parseInt(kl[1], 10), n), 'kl');
    if (dl) return keepDistribution(n, sides, Math.max(n - parseInt(dl[1], 10), 0), 'kh');
    if (dh) return keepDistribution(n, sides, Math.max(n - parseInt(dh[1], 10), 0), 'kl');
    return sumOfDice(n, sides);
  }

  function evaluateExact(tokens) {
    var pos = 0;
    function peek() { return tokens[pos]; }
    function next() { return tokens[pos++]; }

    function expr() {
      var v = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) {
        var op = next().t;
        v = combine(v, term(), op === '+' ? ADD : SUB);
      }
      return v;
    }
    function term() {
      var v = factor();
      while (peek() && (peek().t === '*' || peek().t === '/')) {
        var op = next().t;
        v = combine(v, factor(), op === '*' ? MUL : DIV);
      }
      return v;
    }
    function factor() {
      var tk = peek();
      if (!tk) throw new Error('Unexpected end of notation.');
      if (tk.t === '-') { next(); return combine(single(0), factor(), SUB); }
      if (tk.t === '+') { next(); return factor(); }
      if (tk.t === '(') {
        next();
        var v = expr();
        if (!peek() || peek().t !== ')') throw new Error('Missing closing bracket.');
        next();
        return v;
      }
      if (tk.t === 'num') { next(); return single(tk.value); }
      if (tk.t === 'dice') { next(); return termDistribution(tk); }
      throw new Error('Unexpected part in the notation.');
    }

    var dist = expr();
    if (pos < tokens.length) throw new Error('The notation could not be read in full.');
    return dist;
  }

  /* ---------- Simulation fallback ---------- */
  function simulate(notation, samples) {
    var counts = {}, step = 1 / samples;
    for (var i = 0; i < samples; i++) {
      var v = window.Dice.roll(notation).total;
      counts[v] = (counts[v] || 0) + step;
    }
    return counts;
  }

  /* ---------- Public API ---------- */

  /**
   * Returns {dist, method, samples, stats} for a notation.
   * dist maps each outcome to its probability.
   */
  function analyse(notation, samples) {
    var input = String(notation || '').trim();
    if (!input) throw new Error('No notation entered.');
    if (/#/.test(input)) throw new Error('Use a single expression here, without the "6#" repeat form.');

    var tokens = tokenize(input);  // syntax errors surface here for both paths
    var dist, method = 'exact', used = 0;
    try {
      dist = evaluateExact(tokens);
    } catch (err) {
      if (!(err instanceof NotExact)) throw err;
      used = samples || DEFAULT_SAMPLES;
      dist = simulate(input, used);
      method = 'simulated';
    }

    return { dist: dist, method: method, samples: used, stats: describe(dist), notation: input };
  }

  /** Mean, median, mode, spread and extremes of a distribution. */
  function describe(dist) {
    var values = Object.keys(dist).map(parseFloat).sort(function (a, b) { return a - b; });
    var mean = 0, mode = values[0], modeP = 0, cumulative = 0, median = values[0];

    values.forEach(function (v) {
      var p = dist[v];
      mean += v * p;
      if (p > modeP) { modeP = p; mode = v; }
    });

    for (var i = 0; i < values.length; i++) {
      cumulative += dist[values[i]];
      if (cumulative >= 0.5) { median = values[i]; break; }
    }

    var variance = 0;
    values.forEach(function (v) { variance += dist[v] * (v - mean) * (v - mean); });

    return {
      min: values[0], max: values[values.length - 1],
      mean: mean, median: median, mode: mode, modeP: modeP,
      stdev: Math.sqrt(variance), values: values
    };
  }

  /** Probability that the outcome satisfies a comparison against a target. */
  function chance(dist, op, target) {
    var total = 0;
    Object.keys(dist).forEach(function (k) {
      var v = parseFloat(k);
      var hit = op === '>=' ? v >= target
        : op === '>' ? v > target
        : op === '<=' ? v <= target
        : op === '<' ? v < target
        : v === target;
      if (hit) total += dist[k];
    });
    return total;
  }

  /**
   * Attack maths. Returns hit/crit chances and damage per attack and per round.
   * mode: 'normal' | 'adv' | 'dis'
   */
  function attack(opts) {
    var bonus = opts.bonus || 0;
    var ac = opts.ac || 10;
    var critOn = opts.critOn || 20;                 // lowest d20 face that crits
    var diceMean = opts.diceMean || 0;              // average of the damage dice alone
    var flat = opts.flat || 0;                      // flat damage modifier
    var attacks = Math.max(1, opts.attacks || 1);

    // A natural 1 always misses, a natural crit always hits.
    var needed = H.clamp(ac - bonus, 2, 20);
    var pSingleHit = (21 - needed) / 20;
    var pSingleCrit = (21 - critOn) / 20;

    var pHit, pCrit;
    if (opts.mode === 'adv') {
      pHit = 1 - Math.pow(1 - pSingleHit, 2);
      pCrit = 1 - Math.pow(1 - pSingleCrit, 2);
    } else if (opts.mode === 'dis') {
      pHit = Math.pow(pSingleHit, 2);
      pCrit = Math.pow(pSingleCrit, 2);
    } else {
      pHit = pSingleHit;
      pCrit = pSingleCrit;
    }
    pCrit = Math.min(pCrit, pHit);

    var pNormalHit = pHit - pCrit;
    var perAttack = pNormalHit * (diceMean + flat) + pCrit * (2 * diceMean + flat);

    return {
      needed: needed,
      hit: pHit,
      crit: pCrit,
      miss: 1 - pHit,
      perAttack: perAttack,
      perRound: perAttack * attacks,
      onHit: diceMean + flat,
      onCrit: 2 * diceMean + flat
    };
  }

  window.Prob = { analyse: analyse, describe: describe, chance: chance, attack: attack, DEFAULT_SAMPLES: DEFAULT_SAMPLES };
})();
