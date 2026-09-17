/* ============================================================
   ambience.js - procedural ambience with the Web Audio API
   ------------------------------------------------------------
   Every channel builds its own little graph from noise, filters
   and randomly scheduled bursts. Nothing is sampled, so there is
   no audio to ship or license.
   ============================================================ */
(function () {
  'use strict';

  var ctx = null;
  var master = null;
  var noiseBuffer = null;
  var channels = {};   // id -> {nodes, gain, timers}

  /* ---------- Plumbing ---------- */
  function ensureContext() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
    noiseBuffer = makeNoiseBuffer(4);
    return ctx;
  }

  function makeNoiseBuffer(seconds) {
    var length = Math.floor(ctx.sampleRate * seconds);
    var buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function noiseSource() {
    var src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;
    return src;
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  /** A single filtered-noise bed, optionally wobbling over time. */
  function noiseBed(opts) {
    var src = noiseSource();
    var filter = ctx.createBiquadFilter();
    filter.type = opts.type || 'lowpass';
    filter.frequency.value = opts.freq;
    filter.Q.value = opts.q || 1;

    var gain = ctx.createGain();
    gain.gain.value = opts.gain != null ? opts.gain : 0.5;

    src.connect(filter);
    filter.connect(gain);

    var lfo = null, lfoGain = null;
    if (opts.wobble) {
      lfo = ctx.createOscillator();
      lfo.frequency.value = opts.wobble.rate;
      lfoGain = ctx.createGain();
      lfoGain.gain.value = opts.wobble.depth;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
    }

    src.start();
    return { nodes: [src, filter, gain, lfo, lfoGain].filter(Boolean), out: gain };
  }

  /** A short burst of filtered noise: a crackle, a drip, a gust. */
  function burst(out, opts) {
    var src = noiseSource();
    var filter = ctx.createBiquadFilter();
    filter.type = opts.type || 'bandpass';
    filter.frequency.value = opts.freq;
    filter.Q.value = opts.q || 6;

    var gain = ctx.createGain();
    var now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(opts.peak, now + (opts.attack || 0.005));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);

    src.connect(filter); filter.connect(gain); gain.connect(out);
    src.start(now);
    src.stop(now + opts.duration + 0.05);
  }

  /** A tuned blip, used for birdsong and tavern voices. */
  function tone(out, opts) {
    var osc = ctx.createOscillator();
    osc.type = opts.wave || 'sine';
    osc.frequency.setValueAtTime(opts.freq, ctx.currentTime);
    if (opts.sweepTo) {
      osc.frequency.exponentialRampToValueAtTime(opts.sweepTo, ctx.currentTime + opts.duration);
    }
    var gain = ctx.createGain();
    var now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(opts.peak, now + (opts.attack || 0.02));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + opts.duration);

    osc.connect(gain); gain.connect(out);
    osc.start(now);
    osc.stop(now + opts.duration + 0.05);
  }

  /** Schedules a repeating random event; returns a stop function. */
  function scheduler(fn, minDelay, maxDelay) {
    var stopped = false, timer = null;
    function tick() {
      if (stopped) return;
      fn();
      timer = setTimeout(tick, rand(minDelay, maxDelay) * 1000);
    }
    timer = setTimeout(tick, rand(0, maxDelay) * 1000);
    return function () { stopped = true; clearTimeout(timer); };
  }

  /* ---------- The channels ---------- */
  var BUILDERS = {
    rain: function (out) {
      var bed = noiseBed({ type: 'highpass', freq: 1100, gain: 0.34 });
      var body = noiseBed({ type: 'bandpass', freq: 520, q: 0.7, gain: 0.2 });
      bed.out.connect(out); body.out.connect(out);
      var stop = scheduler(function () {
        burst(out, { freq: rand(2200, 5200), q: 9, peak: rand(0.05, 0.14), duration: 0.05 });
      }, 0.04, 0.16);
      return { nodes: bed.nodes.concat(body.nodes), stops: [stop] };
    },

    thunder: function (out) {
      var stop = scheduler(function () {
        var rumble = noiseBed({ type: 'lowpass', freq: rand(90, 190), gain: 0 });
        rumble.out.connect(out);
        var now = ctx.currentTime;
        var length = rand(2.5, 5.5);
        rumble.out.gain.setValueAtTime(0.0001, now);
        rumble.out.gain.exponentialRampToValueAtTime(rand(0.5, 0.95), now + rand(0.05, 0.4));
        rumble.out.gain.exponentialRampToValueAtTime(0.0001, now + length);
        setTimeout(function () { rumble.nodes.forEach(stopNode); }, (length + 0.4) * 1000);
      }, 9, 34);
      return { nodes: [], stops: [stop] };
    },

    wind: function (out) {
      var bed = noiseBed({
        type: 'bandpass', freq: 420, q: 0.55, gain: 0.5,
        wobble: { rate: 0.07, depth: 260 }
      });
      bed.out.connect(out);
      var stop = scheduler(function () {
        var g = bed.out.gain, now = ctx.currentTime;
        var peak = rand(0.55, 1.0), length = rand(3, 8);
        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(peak, now + length * 0.4);
        g.linearRampToValueAtTime(0.32, now + length);
      }, 4, 11);
      return { nodes: bed.nodes, stops: [stop] };
    },

    fire: function (out) {
      var bed = noiseBed({ type: 'lowpass', freq: 380, gain: 0.16 });
      bed.out.connect(out);
      var stop = scheduler(function () {
        burst(out, { freq: rand(700, 2800), q: rand(4, 14), peak: rand(0.08, 0.3), duration: rand(0.04, 0.13) });
      }, 0.08, 0.5);
      return { nodes: bed.nodes, stops: [stop] };
    },

    cave: function (out) {
      var bed = noiseBed({ type: 'lowpass', freq: 130, gain: 0.22, wobble: { rate: 0.05, depth: 40 } });
      bed.out.connect(out);
      var stop = scheduler(function () {
        // a drip: a short tuned blip with a quick downward sweep
        tone(out, { freq: rand(900, 2100), sweepTo: rand(320, 600), peak: rand(0.07, 0.17), duration: rand(0.1, 0.2) });
      }, 1.2, 6);
      return { nodes: bed.nodes, stops: [stop] };
    },

    forest: function (out) {
      var bed = noiseBed({ type: 'bandpass', freq: 780, q: 0.6, gain: 0.14, wobble: { rate: 0.11, depth: 220 } });
      bed.out.connect(out);
      var birds = scheduler(function () {
        var notes = Math.floor(rand(2, 5));
        for (var i = 0; i < notes; i++) {
          (function (n) {
            setTimeout(function () {
              if (!ctx) return;
              tone(out, { freq: rand(1900, 3600), sweepTo: rand(1500, 4200), peak: rand(0.04, 0.1), duration: rand(0.06, 0.14), wave: 'triangle' });
            }, n * rand(70, 150));
          })(i);
        }
      }, 2.5, 9);
      return { nodes: bed.nodes, stops: [birds] };
    },

    tavern: function (out) {
      var murmur = noiseBed({ type: 'bandpass', freq: 460, q: 1.6, gain: 0.2, wobble: { rate: 0.3, depth: 120 } });
      murmur.out.connect(out);
      var voices = scheduler(function () {
        // a snatch of speech: two or three vowel-ish blips in a row
        var syllables = Math.floor(rand(2, 4));
        for (var i = 0; i < syllables; i++) {
          (function (n) {
            setTimeout(function () {
              if (!ctx) return;
              tone(out, {
                freq: rand(110, 260), sweepTo: rand(90, 300),
                peak: rand(0.03, 0.08), duration: rand(0.1, 0.22), wave: 'sawtooth'
              });
            }, n * rand(120, 220));
          })(i);
        }
      }, 0.7, 3);
      var clinks = scheduler(function () {
        tone(out, { freq: rand(1600, 3200), peak: rand(0.03, 0.09), duration: 0.12, wave: 'triangle' });
      }, 2, 9);
      return { nodes: murmur.nodes, stops: [voices, clinks] };
    },

    waves: function (out) {
      var bed = noiseBed({ type: 'lowpass', freq: 700, gain: 0.1 });
      bed.out.connect(out);
      var stop = scheduler(function () {
        var g = bed.out.gain, now = ctx.currentTime;
        var length = rand(4, 8);
        g.cancelScheduledValues(now);
        g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(rand(0.45, 0.8), now + length * 0.35);
        g.linearRampToValueAtTime(0.08, now + length);
      }, 4, 8);
      return { nodes: bed.nodes, stops: [stop] };
    },

    market: function (out) {
      var bed = noiseBed({ type: 'bandpass', freq: 620, q: 1.1, gain: 0.16, wobble: { rate: 0.4, depth: 180 } });
      bed.out.connect(out);
      var calls = scheduler(function () {
        tone(out, { freq: rand(180, 420), sweepTo: rand(140, 380), peak: rand(0.04, 0.09), duration: rand(0.25, 0.5), wave: 'sawtooth' });
      }, 1, 4);
      var carts = scheduler(function () {
        burst(out, { type: 'lowpass', freq: rand(200, 500), peak: rand(0.05, 0.12), duration: rand(0.3, 0.8) });
      }, 3, 11);
      return { nodes: bed.nodes, stops: [calls, carts] };
    },

    drums: function (out) {
      var interval = 0.55;
      var beat = 0;
      var stop = scheduler(function () {
        var strong = beat % 4 === 0;
        tone(out, { freq: strong ? 70 : 96, sweepTo: 42, peak: strong ? 0.5 : 0.26, duration: 0.3, wave: 'sine' });
        beat++;
      }, interval, interval);
      return { nodes: [], stops: [stop] };
    },

    heartbeat: function (out) {
      var stop = scheduler(function () {
        tone(out, { freq: 62, sweepTo: 38, peak: 0.55, duration: 0.2 });
        setTimeout(function () {
          if (ctx) tone(out, { freq: 56, sweepTo: 34, peak: 0.36, duration: 0.22 });
        }, 260);
      }, 1.15, 1.35);
      return { nodes: [], stops: [stop] };
    },

    chant: function (out) {
      var bed = noiseBed({ type: 'bandpass', freq: 240, q: 3, gain: 0.07 });
      bed.out.connect(out);
      var stop = scheduler(function () {
        [110, 165, 220].forEach(function (f, i) {
          setTimeout(function () {
            if (ctx) tone(out, { freq: f * rand(0.98, 1.02), peak: 0.1, duration: rand(1.6, 2.8), wave: 'sine', attack: 0.4 });
          }, i * 60);
        });
      }, 3, 6);
      return { nodes: bed.nodes, stops: [stop] };
    }
  };

  var CHANNEL_LIST = [
    { id: 'rain', name: 'Rain', icon: '\u{1F327}️', vol: 0.5 },
    { id: 'thunder', name: 'Distant thunder', icon: '⛈️', vol: 0.5 },
    { id: 'wind', name: 'Wind', icon: '\u{1F343}', vol: 0.4 },
    { id: 'fire', name: 'Campfire', icon: '\u{1F525}', vol: 0.5 },
    { id: 'cave', name: 'Dripping cave', icon: '\u{1F573}️', vol: 0.5 },
    { id: 'forest', name: 'Forest birds', icon: '\u{1F333}', vol: 0.45 },
    { id: 'tavern', name: 'Tavern crowd', icon: '\u{1F37A}', vol: 0.5 },
    { id: 'market', name: 'Busy market', icon: '\u{1F3EA}', vol: 0.45 },
    { id: 'waves', name: 'Sea waves', icon: '\u{1F30A}', vol: 0.5 },
    { id: 'drums', name: 'War drums', icon: '\u{1F941}', vol: 0.4 },
    { id: 'heartbeat', name: 'Heartbeat', icon: '\u{1FAC0}', vol: 0.4 },
    { id: 'chant', name: 'Distant chanting', icon: '\u{1F54F}', vol: 0.4 }
  ];

  var PRESETS = [
    { name: 'Tavern night', channels: { tavern: 0.6, fire: 0.35 } },
    { name: 'Forest camp', channels: { forest: 0.5, fire: 0.45, wind: 0.2 } },
    { name: 'Deep dungeon', channels: { cave: 0.6, chant: 0.18 } },
    { name: 'Thunderstorm', channels: { rain: 0.65, thunder: 0.6, wind: 0.45 } },
    { name: 'Coastal town', channels: { waves: 0.55, market: 0.4, wind: 0.25 } },
    { name: 'Before the battle', channels: { drums: 0.5, wind: 0.3, heartbeat: 0.25 } },
    { name: 'Haunted ruin', channels: { wind: 0.5, cave: 0.35, chant: 0.3 } },
    { name: 'Rainy road', channels: { rain: 0.5, wind: 0.3 } }
  ];

  /* ---------- Public control ---------- */
  function stopNode(node) {
    try { if (node.stop) node.stop(); } catch (e) { /* already stopped */ }
    try { node.disconnect(); } catch (e) { /* already detached */ }
  }

  function start(id, volume) {
    if (!ensureContext()) return false;
    if (ctx.state === 'suspended') ctx.resume();
    if (channels[id]) { setVolume(id, volume); return true; }

    var builder = BUILDERS[id];
    if (!builder) return false;

    var gain = ctx.createGain();
    gain.gain.value = volume != null ? volume : 0.5;
    gain.connect(master);

    var built = builder(gain);
    channels[id] = { gain: gain, nodes: built.nodes || [], stops: built.stops || [] };
    return true;
  }

  function stop(id) {
    var ch = channels[id];
    if (!ch) return;
    ch.stops.forEach(function (fn) { fn(); });
    ch.nodes.forEach(stopNode);
    try { ch.gain.disconnect(); } catch (e) { /* already detached */ }
    delete channels[id];
  }

  function stopAll() {
    Object.keys(channels).forEach(stop);
  }

  function setVolume(id, v) {
    if (channels[id]) channels[id].gain.gain.value = v;
  }

  function setMaster(v) {
    if (master) master.gain.value = v;
  }

  function isPlaying(id) { return !!channels[id]; }

  function resume() {
    if (!ensureContext()) return false;
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  function audioContext() { return ctx; }

  window.Ambience = {
    channels: CHANNEL_LIST,
    presets: PRESETS,
    start: start, stop: stop, stopAll: stopAll,
    setVolume: setVolume, setMaster: setMaster,
    isPlaying: isPlaying, resume: resume, context: audioContext
  };
})();
