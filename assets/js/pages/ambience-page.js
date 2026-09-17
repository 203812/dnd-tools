/* ============================================================
   ambience-page.js - logic for tools/ambience.html
   ============================================================ */
(function () {
  'use strict';

  var settings = H.store.get('ambience', { master: 0.7, volumes: {} });
  var started = false;
  var ownAudio = [];   // {name, el, url}

  /* ---------- Channel strips ---------- */
  function renderMixer() {
    H.qs('#mixer').innerHTML = Ambience.channels.map(function (c) {
      var vol = settings.volumes[c.id] != null ? settings.volumes[c.id] : c.vol;
      var on = Ambience.isPlaying(c.id);
      return '<div class="channel' + (on ? ' on' : '') + '" data-channel="' + c.id + '">' +
        '<div class="channel-head">' +
          '<span class="channel-name">' + c.icon + ' ' + H.escape(c.name) + '</span>' +
          '<button class="btn btn-sm' + (on ? ' btn-primary' : '') + '" data-toggle="' + c.id + '">' +
            (on ? 'On' : 'Off') + '</button>' +
        '</div>' +
        '<input type="range" min="0" max="100" value="' + Math.round(vol * 100) + '" data-vol="' + c.id + '">' +
      '</div>';
    }).join('');

    var count = Ambience.channels.filter(function (c) { return Ambience.isPlaying(c.id); }).length;
    H.qs('#active-count').textContent = count ? count + ' channel' + (count === 1 ? '' : 's') + ' playing' : 'nothing playing';
  }

  H.qs('#mixer').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-toggle]');
    if (!btn) return;
    var id = btn.getAttribute('data-toggle');

    if (!Ambience.resume()) { H.toast('This browser has no Web Audio support'); return; }
    started = true;
    updateMasterButton();

    if (Ambience.isPlaying(id)) {
      Ambience.stop(id);
    } else {
      var vol = settings.volumes[id];
      if (vol == null) {
        vol = Ambience.channels.filter(function (c) { return c.id === id; })[0].vol;
      }
      Ambience.start(id, vol);
    }
    renderMixer();
  });

  H.qs('#mixer').addEventListener('input', function (e) {
    var slider = e.target.closest('[data-vol]');
    if (!slider) return;
    var id = slider.getAttribute('data-vol');
    var v = parseInt(slider.value, 10) / 100;
    settings.volumes[id] = v;
    Ambience.setVolume(id, v);
    H.store.set('ambience', settings);
  });

  /* ---------- Master ---------- */
  function updateMasterButton() {
    var anyPlaying = Ambience.channels.some(function (c) { return Ambience.isPlaying(c.id); });
    H.qs('#btn-master').innerHTML = started && anyPlaying ? '■ Pause everything' : '▶ Start sound';
  }

  H.on('#btn-master', 'click', function () {
    if (!Ambience.resume()) { H.toast('This browser has no Web Audio support'); return; }
    var anyPlaying = Ambience.channels.some(function (c) { return Ambience.isPlaying(c.id); });
    if (anyPlaying) {
      Ambience.stopAll();
      started = false;
    } else {
      started = true;
      // nothing selected yet? start a gentle default so the button does something audible
      if (!Object.keys(settings.volumes).length) applyPreset(Ambience.presets[0]);
      else {
        Object.keys(settings.volumes).forEach(function (id) {
          if (settings.volumes[id] > 0) Ambience.start(id, settings.volumes[id]);
        });
      }
    }
    renderMixer();
    updateMasterButton();
  });

  H.on('#btn-stop-all', 'click', function () {
    Ambience.stopAll();
    ownAudio.forEach(function (a) { a.el.pause(); });
    started = false;
    renderMixer();
    renderOwn();
    updateMasterButton();
  });

  H.on('#master-vol', 'input', function () {
    var v = parseInt(this.value, 10) / 100;
    settings.master = v;
    Ambience.setMaster(v);
    H.qs('#master-val').textContent = this.value;
    H.store.set('ambience', settings);
  });

  /* ---------- Presets ---------- */
  function applyPreset(preset) {
    Ambience.resume();
    started = true;
    Ambience.stopAll();
    settings.volumes = {};
    Object.keys(preset.channels).forEach(function (id) {
      settings.volumes[id] = preset.channels[id];
      Ambience.start(id, preset.channels[id]);
    });
    Ambience.setMaster(settings.master);
    H.store.set('ambience', settings);
    renderMixer();
    updateMasterButton();
  }

  Ambience.presets.forEach(function (p) {
    var b = H.el('button', 'chip', p.name);
    b.type = 'button';
    b.addEventListener('click', function () {
      applyPreset(p);
      H.toast(p.name);
    });
    H.qs('#preset-chips').appendChild(b);
  });

  /* ---------- Your own audio files ---------- */
  function renderOwn() {
    if (!ownAudio.length) {
      H.qs('#own-list').innerHTML = '<div class="empty">No files added.</div>';
      return;
    }
    H.qs('#own-list').innerHTML = ownAudio.map(function (a, i) {
      return '<div class="stat-line">' +
        '<span>' + H.escape(a.name) + '</span>' +
        '<span class="btn-group">' +
          '<button class="btn btn-sm" data-play="' + i + '">' + (a.el.paused ? 'Play' : 'Pause') + '</button>' +
          '<button class="btn btn-sm btn-danger" data-remove="' + i + '">&#10005;</button>' +
        '</span></div>';
    }).join('');
  }

  H.on('#btn-add-audio', 'click', function () {
    H.pickFile('audio/*', true, function (files) {
      files.forEach(function (file) {
        var url = URL.createObjectURL(file);
        var el = new Audio(url);
        el.loop = true;
        el.volume = 0.6;
        el.addEventListener('play', renderOwn);
        el.addEventListener('pause', renderOwn);
        ownAudio.push({ name: file.name, el: el, url: url });
      });
      renderOwn();
    });
  });

  H.qs('#own-list').addEventListener('click', function (e) {
    var play = e.target.closest('[data-play]');
    if (play) {
      var a = ownAudio[parseInt(play.getAttribute('data-play'), 10)];
      if (a.el.paused) a.el.play().catch(function () { H.toast('That file could not be played'); });
      else a.el.pause();
      return;
    }
    var rm = e.target.closest('[data-remove]');
    if (rm) {
      var i = parseInt(rm.getAttribute('data-remove'), 10);
      ownAudio[i].el.pause();
      URL.revokeObjectURL(ownAudio[i].url);
      ownAudio.splice(i, 1);
      renderOwn();
    }
  });

  /* ---------- Tidy up ---------- */
  window.addEventListener('beforeunload', function () {
    ownAudio.forEach(function (a) { URL.revokeObjectURL(a.url); });
  });

  H.qs('#master-vol').value = Math.round(settings.master * 100);
  H.qs('#master-val').textContent = Math.round(settings.master * 100);
  renderMixer();
  renderOwn();
  updateMasterButton();
})();
