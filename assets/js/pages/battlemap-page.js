/* ============================================================
   battlemap-page.js - logic for tools/battlemap.html
   ------------------------------------------------------------
   One canvas, drawn every frame:
     background image -> grid -> tokens -> fog -> measuring line
   World coordinates are in map pixels; the camera converts them
   to screen pixels.
   ============================================================ */
(function () {
  'use strict';

  var wrap = H.qs('#map-wrap');
  var canvas = H.qs('#map-canvas');
  var ctx = canvas.getContext('2d');

  /* Fog lives on its own offscreen canvas so the brush can paint holes in it. */
  var fog = document.createElement('canvas');
  var fogCtx = fog.getContext('2d');
  var FOG_W = 2400, FOG_H = 1800;
  fog.width = FOG_W; fog.height = FOG_H;

  var state = {
    camera: { x: 0, y: 0, zoom: 1 },
    tokens: [],
    nextId: 1,
    background: null,      // data URL
    grid: 70,
    feet: 5
  };

  var bgImage = null;
  var tokenImages = {};    // token id -> HTMLImageElement
  var tool = 'select';
  var brush = 110;
  var selectedId = null;
  var measureFrom = null, measureTo = null;
  var pings = [];

  /* ---------- Sizing ---------- */
  function resize() {
    var rect = wrap.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  window.addEventListener('resize', resize);

  function viewSize() {
    var rect = wrap.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }

  /* ---------- Coordinate conversion ---------- */
  function toWorld(sx, sy) {
    var c = state.camera;
    return { x: (sx - c.x) / c.zoom, y: (sy - c.y) / c.zoom };
  }
  function pointerPos(e) {
    var rect = wrap.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  /* ---------- Drawing ---------- */
  function draw() {
    var v = viewSize();
    var c = state.camera;

    ctx.save();
    ctx.clearRect(0, 0, v.w, v.h);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-2').trim() || '#1a1714';
    ctx.fillRect(0, 0, v.w, v.h);

    ctx.translate(c.x, c.y);
    ctx.scale(c.zoom, c.zoom);

    if (bgImage) ctx.drawImage(bgImage, 0, 0);

    drawGrid();
    drawTokens();
    ctx.restore();

    drawFog();
    drawOverlay();
  }

  function drawGrid() {
    if (!H.qs('#show-grid').checked) return;
    var g = state.grid;
    var v = viewSize(), c = state.camera;
    var topLeft = toWorld(0, 0), bottomRight = toWorld(v.w, v.h);

    var x0 = Math.floor(topLeft.x / g) * g;
    var y0 = Math.floor(topLeft.y / g) * g;

    ctx.save();
    ctx.lineWidth = 1 / c.zoom;
    ctx.strokeStyle = 'rgba(160,150,130,.35)';
    ctx.beginPath();
    for (var x = x0; x <= bottomRight.x; x += g) { ctx.moveTo(x, topLeft.y); ctx.lineTo(x, bottomRight.y); }
    for (var y = y0; y <= bottomRight.y; y += g) { ctx.moveTo(topLeft.x, y); ctx.lineTo(bottomRight.x, y); }
    ctx.stroke();
    ctx.restore();
  }

  function drawTokens() {
    state.tokens.forEach(function (t) {
      var r = (state.grid * t.size) / 2;
      var cx = t.x + r, cy = t.y + r;

      ctx.save();
      if (tokenImages[t.id]) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(tokenImages[t.id], t.x, t.y, r * 2, r * 2);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.fill();

        var initials = (t.name || '?').trim().slice(0, 2).toUpperCase();
        ctx.fillStyle = '#fff';
        ctx.font = '600 ' + (r * 0.8) + 'px "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(initials, cx, cy);
      }

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, r * 0.09);
      ctx.strokeStyle = t.id === selectedId ? '#c8a24a' : 'rgba(0,0,0,.55)';
      ctx.stroke();

      if (t.name) {
        ctx.font = '600 ' + Math.max(10, r * 0.42) + 'px "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        var label = t.name;
        var w = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(18,16,14,.72)';
        ctx.fillRect(cx - w / 2 - 4, cy + r + 3, w + 8, r * 0.55);
        ctx.fillStyle = '#ece3d4';
        ctx.fillText(label, cx, cy + r + 4);
      }
      ctx.restore();
    });
  }

  function drawFog() {
    var c = state.camera;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.zoom, c.zoom);
    ctx.globalAlpha = 0.93;
    ctx.drawImage(fog, 0, 0);
    ctx.restore();
  }

  function drawOverlay() {
    var c = state.camera;

    // measuring line
    if (measureFrom && measureTo) {
      var a = { x: measureFrom.x * c.zoom + c.x, y: measureFrom.y * c.zoom + c.y };
      var b = { x: measureTo.x * c.zoom + c.x, y: measureTo.y * c.zoom + c.y };
      ctx.save();
      ctx.setLineDash([7, 5]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#c8a24a';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      [a, b].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#c8a24a'; ctx.fill();
      });
      ctx.restore();
    }

    // pings fade out over a second and a half
    var now = Date.now();
    pings = pings.filter(function (p) { return now - p.t < 1500; });
    pings.forEach(function (p) {
      var age = (now - p.t) / 1500;
      var sx = p.x * c.zoom + c.x, sy = p.y * c.zoom + c.y;
      ctx.save();
      ctx.globalAlpha = 1 - age;
      ctx.strokeStyle = '#c8a24a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(sx, sy, 8 + age * 44, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    if (pings.length) requestAnimationFrame(draw);
  }

  /* ---------- Distance ---------- */
  function distanceFeet(a, b) {
    var g = state.grid;
    var dx = Math.abs(b.x - a.x) / g, dy = Math.abs(b.y - a.y) / g;
    var squares;
    if (H.qs('#diag-5105').checked) {
      // every second diagonal step costs double, as in the optional DMG rule
      var diagonals = Math.min(dx, dy), straight = Math.abs(dx - dy);
      squares = straight + Math.floor(diagonals) + Math.floor(diagonals / 2) + (diagonals % 1);
    } else {
      squares = Math.max(dx, dy);
    }
    return squares * state.feet;
  }

  /* ---------- Fog ---------- */
  function fogAll() {
    fogCtx.globalCompositeOperation = 'source-over';
    fogCtx.fillStyle = '#0b0a09';
    fogCtx.fillRect(0, 0, FOG_W, FOG_H);
    draw();
  }
  function fogNone() {
    fogCtx.clearRect(0, 0, FOG_W, FOG_H);
    draw();
  }
  function paintFog(world, reveal) {
    fogCtx.globalCompositeOperation = reveal ? 'destination-out' : 'source-over';
    fogCtx.fillStyle = '#0b0a09';
    fogCtx.beginPath();
    fogCtx.arc(world.x, world.y, brush / 2, 0, Math.PI * 2);
    fogCtx.fill();
    fogCtx.globalCompositeOperation = 'source-over';
    draw();
  }

  /* ---------- Tokens ---------- */
  function addToken(opts) {
    var v = viewSize();
    var centre = toWorld(v.w / 2, v.h / 2);
    var size = opts.size || 1;
    var t = {
      id: state.nextId++,
      name: opts.name || '',
      color: opts.color || '#a8342b',
      size: size,
      x: centre.x - (state.grid * size) / 2,
      y: centre.y - (state.grid * size) / 2,
      img: opts.img || null
    };
    if (H.qs('#snap').checked) snapToken(t);
    state.tokens.push(t);
    if (t.img) loadTokenImage(t);
    selectedId = t.id;
    renderTokenList();
    save();
    draw();
    return t;
  }

  function snapToken(t) {
    var g = state.grid;
    t.x = Math.round(t.x / g) * g;
    t.y = Math.round(t.y / g) * g;
  }

  function loadTokenImage(t) {
    var image = new Image();
    image.onload = function () { tokenImages[t.id] = image; draw(); };
    image.src = t.img;
  }

  function tokenAt(world) {
    for (var i = state.tokens.length - 1; i >= 0; i--) {
      var t = state.tokens[i];
      var r = (state.grid * t.size) / 2;
      var dx = world.x - (t.x + r), dy = world.y - (t.y + r);
      if (dx * dx + dy * dy <= r * r) return t;
    }
    return null;
  }

  function renderTokenList() {
    H.qs('#token-count').textContent = state.tokens.length + ' token' + (state.tokens.length === 1 ? '' : 's');
    if (!state.tokens.length) {
      H.qs('#token-list').innerHTML = '<div class="empty">No tokens placed yet.</div>';
      return;
    }
    H.qs('#token-list').innerHTML = state.tokens.map(function (t) {
      return '<div class="stat-line" style="cursor:pointer" data-token="' + t.id + '">' +
        '<span><span style="display:inline-block;width:13px;height:13px;border-radius:50%;background:' + t.color + ';margin-right:8px;vertical-align:-2px"></span>' +
          H.escape(t.name || 'Unnamed') + '</span>' +
        '<span class="btn-group">' +
          '<button class="btn btn-sm" data-act="centre" data-id="' + t.id + '">find</button>' +
          '<button class="btn btn-sm btn-danger" data-act="del" data-id="' + t.id + '">&#10005;</button>' +
        '</span></div>';
    }).join('');
  }

  H.qs('#token-list').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (btn) {
      var id = parseInt(btn.getAttribute('data-id'), 10);
      if (btn.getAttribute('data-act') === 'del') {
        state.tokens = state.tokens.filter(function (t) { return t.id !== id; });
        delete tokenImages[id];
        if (selectedId === id) selectedId = null;
      } else {
        var t = state.tokens.filter(function (x) { return x.id === id; })[0];
        if (t) {
          var v = viewSize(), r = (state.grid * t.size) / 2;
          state.camera.x = v.w / 2 - (t.x + r) * state.camera.zoom;
          state.camera.y = v.h / 2 - (t.y + r) * state.camera.zoom;
          selectedId = id;
        }
      }
      renderTokenList(); save(); draw();
      return;
    }
    var row = e.target.closest('[data-token]');
    if (row) { selectedId = parseInt(row.getAttribute('data-token'), 10); draw(); }
  });

  /* ---------- Pointer handling ---------- */
  var drag = null;

  wrap.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  wrap.addEventListener('pointerdown', function (e) {
    wrap.setPointerCapture(e.pointerId);
    var p = pointerPos(e);
    var world = toWorld(p.x, p.y);

    // right or middle button always pans, whatever the tool
    if (e.button === 2 || e.button === 1) {
      drag = { type: 'pan', from: p, camera: { x: state.camera.x, y: state.camera.y } };
      return;
    }

    if (tool === 'select') {
      var t = tokenAt(world);
      if (t) {
        selectedId = t.id;
        drag = { type: 'token', token: t, offset: { x: world.x - t.x, y: world.y - t.y } };
      } else {
        selectedId = null;
        drag = { type: 'pan', from: p, camera: { x: state.camera.x, y: state.camera.y } };
      }
      renderTokenList();
      draw();
    } else if (tool === 'measure') {
      measureFrom = world; measureTo = world;
      drag = { type: 'measure' };
      draw();
    } else if (tool === 'fog' || tool === 'fog-add') {
      drag = { type: 'fog', reveal: tool === 'fog' };
      paintFog(world, drag.reveal);
    } else if (tool === 'ping') {
      pings.push({ x: world.x, y: world.y, t: Date.now() });
      draw();
    }
  });

  wrap.addEventListener('pointermove', function (e) {
    var p = pointerPos(e);
    var world = toWorld(p.x, p.y);
    updateReadout(world);

    if (!drag) return;
    if (drag.type === 'pan') {
      state.camera.x = drag.camera.x + (p.x - drag.from.x);
      state.camera.y = drag.camera.y + (p.y - drag.from.y);
      draw();
    } else if (drag.type === 'token') {
      drag.token.x = world.x - drag.offset.x;
      drag.token.y = world.y - drag.offset.y;
      draw();
    } else if (drag.type === 'measure') {
      measureTo = world;
      draw();
    } else if (drag.type === 'fog') {
      paintFog(world, drag.reveal);
    }
  });

  ['pointerup', 'pointercancel'].forEach(function (ev) {
    wrap.addEventListener(ev, function () {
      if (drag && drag.type === 'token') {
        if (H.qs('#snap').checked) snapToken(drag.token);
        save();
        draw();
      }
      if (drag && drag.type === 'fog') saveFog();
      drag = null;
    });
  });

  wrap.addEventListener('wheel', function (e) {
    e.preventDefault();
    var p = pointerPos(e);
    var before = toWorld(p.x, p.y);
    var factor = e.deltaY < 0 ? 1.12 : 0.893;
    state.camera.zoom = H.clamp(state.camera.zoom * factor, 0.15, 6);
    var after = toWorld(p.x, p.y);
    state.camera.x += (after.x - before.x) * state.camera.zoom;
    state.camera.y += (after.y - before.y) * state.camera.zoom;
    draw();
  }, { passive: false });

  function updateReadout(world) {
    var parts = [];
    if (measureFrom && measureTo) {
      parts.push(Math.round(distanceFeet(measureFrom, measureTo)) + ' ft');
    }
    var g = state.grid;
    parts.push('square ' + Math.floor(world.x / g) + ', ' + Math.floor(world.y / g));
    parts.push(Math.round(state.camera.zoom * 100) + '%');
    if (tool === 'fog' || tool === 'fog-add') parts.push('brush ' + brush);
    H.qs('#readout').textContent = parts.join('  ·  ');
  }

  /* ---------- Keyboard ---------- */
  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId != null) {
      e.preventDefault();
      state.tokens = state.tokens.filter(function (t) { return t.id !== selectedId; });
      delete tokenImages[selectedId];
      selectedId = null;
      renderTokenList(); save(); draw();
    }
    if (e.key === '[') { brush = H.clamp(brush - 20, 20, 500); H.toast('Brush ' + brush); }
    if (e.key === ']') { brush = H.clamp(brush + 20, 20, 500); H.toast('Brush ' + brush); }
    if (e.key === 'Escape') { measureFrom = measureTo = null; draw(); }
  });

  /* ---------- Toolbar ---------- */
  H.qsa('[data-tool]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      H.qsa('[data-tool]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      tool = btn.getAttribute('data-tool');
      measureFrom = measureTo = null;
      wrap.style.cursor = tool === 'select' ? 'grab' : 'crosshair';
      draw();
    });
  });

  H.on('#btn-fog-all', 'click', function () { fogAll(); saveFog(); });
  H.on('#btn-fog-none', 'click', function () { fogNone(); saveFog(); });

  H.on('#btn-fit', 'click', function () {
    var v = viewSize();
    if (bgImage) {
      var zoom = Math.min(v.w / bgImage.naturalWidth, v.h / bgImage.naturalHeight);
      state.camera.zoom = H.clamp(zoom, 0.15, 6);
      state.camera.x = (v.w - bgImage.naturalWidth * state.camera.zoom) / 2;
      state.camera.y = (v.h - bgImage.naturalHeight * state.camera.zoom) / 2;
    } else {
      state.camera = { x: 0, y: 0, zoom: 1 };
    }
    save(); draw();
  });

  /* ---------- Background image ---------- */
  function setBackground(dataUrl) {
    var image = new Image();
    image.onload = function () {
      bgImage = image;
      state.background = dataUrl;
      H.qs('#btn-fit').click();
    };
    image.src = dataUrl;
  }

  function loadMapFile(file) {
    if (!file || !/^image\//.test(file.type)) { H.toast('That is not an image file'); return; }
    H.readImage(file, function (image, dataUrl) {
      bgImage = image;
      state.background = dataUrl;
      H.qs('#btn-fit').click();
      if (!save()) H.toast('Map shown, but too large to store in this browser');
    }, function (msg) { H.toast(msg); });
  }

  var dz = H.qs('#dropzone');
  dz.addEventListener('click', function () { H.pickFile('image/*', false, loadMapFile); });
  ['dragenter', 'dragover'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('drop-active'); });
    wrap.addEventListener(ev, function (e) { e.preventDefault(); wrap.classList.add('drop-active'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('drop-active'); });
    wrap.addEventListener(ev, function (e) { e.preventDefault(); wrap.classList.remove('drop-active'); });
  });
  dz.addEventListener('drop', function (e) { if (e.dataTransfer.files.length) loadMapFile(e.dataTransfer.files[0]); });
  wrap.addEventListener('drop', function (e) { if (e.dataTransfer.files.length) loadMapFile(e.dataTransfer.files[0]); });

  /* ---------- Adding tokens ---------- */
  H.qs('#token-form').addEventListener('submit', function (e) {
    e.preventDefault();
    addToken({
      name: H.qs('#t-name').value.trim(),
      color: H.qs('#t-color').value,
      size: parseFloat(H.qs('#t-size').value)
    });
    H.qs('#t-name').value = '';
  });

  H.on('#btn-from-tracker', 'click', function () {
    var enc = H.store.get('encounter', null);
    if (!enc || !enc.combatants || !enc.combatants.length) {
      H.toast('The initiative tracker is empty');
      return;
    }
    enc.combatants.forEach(function (c) {
      addToken({ name: c.name, color: c.pc ? '#5c8a4a' : '#a8342b', size: 1 });
    });
    H.toast(enc.combatants.length + ' tokens placed');
  });

  H.on('#btn-from-saved', 'click', function () {
    var saved = H.store.get('tokens', []);
    if (!saved.length) { H.toast('No saved tokens yet - make some in the Token Maker'); return; }
    saved.forEach(function (s) { addToken({ name: s.name, img: s.data, size: 1 }); });
    H.toast(saved.length + ' tokens placed');
  });

  /* ---------- Persistence ---------- */
  function save() {
    return H.store.set('battlemap', {
      camera: state.camera, tokens: state.tokens, nextId: state.nextId,
      background: state.background, grid: state.grid, feet: state.feet
    });
  }
  function saveFog() {
    try { H.store.set('battlemap-fog', fog.toDataURL('image/png')); } catch (e) { /* fog is optional */ }
  }

  function load() {
    var s = H.store.get('battlemap', null);
    if (s) {
      state.camera = s.camera || state.camera;
      state.tokens = s.tokens || [];
      state.nextId = s.nextId || (state.tokens.length + 1);
      state.grid = s.grid || 70;
      state.feet = s.feet || 5;
      H.qs('#grid-size').value = state.grid;
      H.qs('#grid-feet').value = state.feet;
      state.tokens.forEach(function (t) { if (t.img) loadTokenImage(t); });
      if (s.background) setBackground(s.background);
    }
    var fogData = H.store.get('battlemap-fog', null);
    if (fogData) {
      var fimg = new Image();
      fimg.onload = function () { fogCtx.clearRect(0, 0, FOG_W, FOG_H); fogCtx.drawImage(fimg, 0, 0); draw(); };
      fimg.src = fogData;
    }
  }

  H.on('#btn-save', 'click', function () {
    H.download('battlemap.json', JSON.stringify({
      map: { camera: state.camera, tokens: state.tokens, nextId: state.nextId, background: state.background, grid: state.grid, feet: state.feet },
      fog: fog.toDataURL('image/png')
    }, null, 2), 'application/json');
  });

  H.on('#btn-load', 'click', function () {
    H.pickFile('.json,application/json', false, function (file) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          var m = data.map || data;
          state.camera = m.camera || state.camera;
          state.tokens = m.tokens || [];
          state.nextId = m.nextId || state.tokens.length + 1;
          state.grid = m.grid || 70;
          state.feet = m.feet || 5;
          H.qs('#grid-size').value = state.grid;
          H.qs('#grid-feet').value = state.feet;
          tokenImages = {};
          state.tokens.forEach(function (t) { if (t.img) loadTokenImage(t); });
          if (m.background) setBackground(m.background); else { bgImage = null; state.background = null; }
          if (data.fog) {
            var fimg = new Image();
            fimg.onload = function () { fogCtx.clearRect(0, 0, FOG_W, FOG_H); fogCtx.drawImage(fimg, 0, 0); draw(); };
            fimg.src = data.fog;
          }
          renderTokenList(); save(); draw();
          H.toast('Map loaded');
        } catch (err) { H.toast('That file could not be read'); }
      };
      reader.readAsText(file);
    });
  });

  H.on('#btn-png', 'click', function () {
    canvas.toBlob(function (blob) { H.downloadBlob('battlemap.png', blob); }, 'image/png');
  });

  H.on('#btn-clear', 'click', function () {
    if (!confirm('Clear the map, all tokens and the fog?')) return;
    state.tokens = [];
    state.nextId = 1;
    state.background = null;
    bgImage = null;
    tokenImages = {};
    selectedId = null;
    fogNone();
    H.store.del('battlemap-fog');
    save();
    renderTokenList();
    draw();
  });

  H.on('#grid-size', 'input', function () {
    state.grid = H.clamp(parseInt(this.value, 10) || 70, 10, 400);
    save(); draw();
  });
  H.on('#grid-feet', 'input', function () {
    state.feet = H.clamp(parseInt(this.value, 10) || 5, 1, 100);
    save(); draw();
  });
  ['#show-grid', '#snap', '#diag-5105'].forEach(function (sel) {
    H.qs(sel).addEventListener('change', draw);
  });

  /* ---------- A token handed over by the token maker ---------- */
  var pending = H.store.get('map-pending-token', null);
  if (pending) {
    H.store.del('map-pending-token');
    setTimeout(function () {
      addToken({ name: pending.name, img: pending.data, size: 1 });
      H.toast('Token added from the Token Maker');
    }, 50);
  }

  wrap.style.cursor = 'grab';
  load();
  renderTokenList();
  resize();
})();
