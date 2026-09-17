/* ============================================================
   tokens-page.js - logic for tools/tokens.html
   Everything is drawn on a canvas in the browser; no uploads.
   ============================================================ */
(function () {
  'use strict';

  var canvas = H.qs('#token-canvas');
  var ctx = canvas.getContext('2d');
  var scaleCanvas = H.qs('#scale-canvas');
  var scaleCtx = scaleCanvas.getContext('2d');

  var PREVIEW = 256;           // on-screen preview size
  var img = null;              // the loaded picture
  var view = { x: 0.5, y: 0.5, zoom: 1 };   // centre point (0-1) and zoom factor

  var COLOURS = [
    { n: 'Gold', v: '#c8a24a' }, { n: 'Blood', v: '#a8342b' }, { n: 'Forest', v: '#5c8a4a' },
    { n: 'Steel', v: '#6b7480' }, { n: 'Arcane', v: '#7d5ba6' }, { n: 'Ocean', v: '#3d7ea8' },
    { n: 'Bone', v: '#e0d8c4' }, { n: 'Ink', v: '#1b1610' }
  ];
  COLOURS.forEach(function (c) {
    var b = H.el('button', 'chip', c.n);
    b.type = 'button';
    b.addEventListener('click', function () { H.qs('#border-color').value = c.v; draw(); });
    H.qs('#colour-chips').appendChild(b);
  });

  /* ---------- Loading a picture ---------- */
  function loadFile(file) {
    if (!file || !/^image\//.test(file.type)) { H.toast('That is not an image file'); return; }
    H.readImage(file, function (image) {
      img = image;
      view = { x: 0.5, y: 0.5, zoom: 1 };
      H.qs('#zoom').value = 100;
      H.qs('#img-info').textContent = image.naturalWidth + ' × ' + image.naturalHeight + ' px' +
        (file.name ? ' · ' + file.name : '');
      draw();
    }, function (msg) { H.toast(msg); });
  }

  var dropzone = H.qs('#dropzone');
  dropzone.addEventListener('click', function () {
    H.pickFile('image/*', false, loadFile);
  });
  ['dragenter', 'dragover'].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add('drop-active'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove('drop-active'); });
  });
  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
  });
  document.addEventListener('paste', function (e) {
    var items = (e.clipboardData || {}).items || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) { loadFile(items[i].getAsFile()); return; }
    }
  });

  /* ---------- Shape path ---------- */
  function shapePath(c, size, inset) {
    var shape = H.qs('#shape').value;
    var r = size / 2 - inset;
    var cx = size / 2, cy = size / 2;
    c.beginPath();
    if (shape === 'circle') {
      c.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (shape === 'square') {
      c.rect(inset, inset, size - inset * 2, size - inset * 2);
    } else if (shape === 'rounded') {
      var rad = size * 0.16;
      var x = inset, y = inset, w = size - inset * 2, h = w;
      c.moveTo(x + rad, y);
      c.arcTo(x + w, y, x + w, y + h, rad);
      c.arcTo(x + w, y + h, x, y + h, rad);
      c.arcTo(x, y + h, x, y, rad);
      c.arcTo(x, y, x + w, y, rad);
    } else { // hexagon, flat top
      for (var i = 0; i < 6; i++) {
        var a = Math.PI / 180 * (60 * i - 30);
        var px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
      }
    }
    c.closePath();
  }

  /* ---------- Drawing ---------- */
  function drawToken(c, size) {
    var border = parseInt(H.qs('#border').value, 10);
    var scaled = border * (size / PREVIEW);
    var transparent = H.qs('#transparent').checked;

    c.clearRect(0, 0, size, size);

    if (!transparent) {
      c.fillStyle = H.qs('#bg-color').value;
      c.fillRect(0, 0, size, size);
    }

    // the picture, clipped to the frame
    c.save();
    shapePath(c, size, scaled);
    c.clip();

    c.fillStyle = H.qs('#bg-color').value;
    c.fillRect(0, 0, size, size);

    if (img) {
      var inner = size - scaled * 2;
      // cover the frame, then apply the user's zoom
      var base = Math.max(inner / img.naturalWidth, inner / img.naturalHeight);
      var scale = base * view.zoom;
      var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      var x = size / 2 - w * view.x;
      var y = size / 2 - h * view.y;
      c.imageSmoothingQuality = 'high';
      c.drawImage(img, x, y, w, h);
    } else {
      c.fillStyle = 'rgba(200,162,74,.16)';
      c.fillRect(0, 0, size, size);
      c.fillStyle = '#a89c88';
      c.font = (size * 0.075) + 'px sans-serif';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('no picture yet', size / 2, size / 2);
    }
    c.restore();

    // the border itself
    if (scaled > 0) {
      c.save();
      c.lineWidth = scaled;
      c.strokeStyle = H.qs('#border-color').value;
      shapePath(c, size, scaled / 2);
      c.stroke();
      c.restore();
    }

    // name label
    var text = H.qs('#label-text').value.trim();
    if (text) {
      var bandH = size * 0.18;
      var atTop = H.qs('#label-pos').value === 'top';
      var bandY = atTop ? scaled : size - bandH - scaled;

      c.save();
      shapePath(c, size, scaled);
      c.clip();
      c.fillStyle = H.qs('#border-color').value;
      c.fillRect(0, bandY, size, bandH);

      c.fillStyle = H.qs('#label-color').value;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      var fontSize = size * 0.115;
      c.font = '600 ' + fontSize + 'px "Segoe UI", Roboto, sans-serif';
      // shrink the text until it fits inside the frame
      while (c.measureText(text).width > size * 0.82 && fontSize > 6) {
        fontSize -= 1;
        c.font = '600 ' + fontSize + 'px "Segoe UI", Roboto, sans-serif';
      }
      c.fillText(text, size / 2, bandY + bandH / 2);
      c.restore();
    }
  }

  function drawScalePreview() {
    var s = scaleCanvas.width;
    var cell = s / 3;
    scaleCtx.clearRect(0, 0, s, s);
    scaleCtx.fillStyle = 'rgba(120,110,95,.14)';
    scaleCtx.fillRect(0, 0, s, s);
    scaleCtx.strokeStyle = 'rgba(160,150,130,.5)';
    scaleCtx.lineWidth = 1;
    for (var i = 0; i <= 3; i++) {
      scaleCtx.beginPath();
      scaleCtx.moveTo(i * cell, 0); scaleCtx.lineTo(i * cell, s);
      scaleCtx.moveTo(0, i * cell); scaleCtx.lineTo(s, i * cell);
      scaleCtx.stroke();
    }
    // the token, one square across, in the middle
    var tmp = document.createElement('canvas');
    tmp.width = tmp.height = 128;
    drawToken(tmp.getContext('2d'), 128);
    scaleCtx.drawImage(tmp, cell, cell, cell, cell);
  }

  function draw() {
    drawToken(ctx, PREVIEW);
    drawScalePreview();
    H.qs('#zoom-val').textContent = Math.round(view.zoom * 100) + '%';
    H.qs('#border-val').textContent = H.qs('#border').value;
  }

  /* ---------- Dragging and zooming the preview ---------- */
  var dragging = false, last = null;
  canvas.addEventListener('pointerdown', function (e) {
    if (!img) return;
    dragging = true; last = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!dragging || !img) return;
    var inner = PREVIEW - parseInt(H.qs('#border').value, 10) * 2;
    var base = Math.max(inner / img.naturalWidth, inner / img.naturalHeight) * view.zoom;
    view.x -= (e.clientX - last.x) / (img.naturalWidth * base);
    view.y -= (e.clientY - last.y) / (img.naturalHeight * base);
    view.x = H.clamp(view.x, 0, 1);
    view.y = H.clamp(view.y, 0, 1);
    last = { x: e.clientX, y: e.clientY };
    draw();
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) {
    canvas.addEventListener(ev, function () { dragging = false; });
  });
  canvas.addEventListener('wheel', function (e) {
    if (!img) return;
    e.preventDefault();
    var z = H.clamp(view.zoom * (e.deltaY < 0 ? 1.12 : 0.89), 0.2, 4);
    view.zoom = z;
    H.qs('#zoom').value = Math.round(z * 100);
    draw();
  }, { passive: false });

  H.on('#zoom', 'input', function () { view.zoom = parseInt(this.value, 10) / 100; draw(); });
  H.on('#btn-center', 'click', function () { view = { x: 0.5, y: 0.5, zoom: 1 }; H.qs('#zoom').value = 100; draw(); });

  ['#shape', '#border', '#border-color', '#bg-color', '#transparent', '#label-text', '#label-pos', '#label-color']
    .forEach(function (sel) {
      H.qs(sel).addEventListener('input', draw);
      H.qs(sel).addEventListener('change', draw);
    });

  /* ---------- Export ---------- */
  function renderAtExportSize() {
    var size = parseInt(H.qs('#size').value, 10);
    var out = document.createElement('canvas');
    out.width = out.height = size;
    drawToken(out.getContext('2d'), size);
    return out;
  }

  H.on('#btn-download', 'click', function () {
    var name = (H.qs('#label-text').value.trim() || 'token').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase();
    renderAtExportSize().toBlob(function (blob) {
      H.downloadBlob(name + '.png', blob);
    }, 'image/png');
  });

  /* ---------- Saved tokens ---------- */
  function savedTokens() { return H.store.get('tokens', []); }

  function renderSaved() {
    var list = savedTokens();
    if (!list.length) {
      H.qs('#saved-list').innerHTML = '<div class="empty">Nothing saved yet.</div>';
      return;
    }
    H.qs('#saved-list').innerHTML = '<div class="chips" style="gap:10px">' + list.map(function (t, i) {
      return '<span style="text-align:center">' +
        '<img src="' + t.data + '" alt="' + H.escape(t.name) + '" width="52" height="52" style="display:block;border-radius:8px">' +
        '<button class="btn btn-sm btn-danger" data-del="' + i + '" style="margin-top:4px;padding:2px 7px">remove</button>' +
      '</span>';
    }).join('') + '</div>';
  }

  H.qs('#saved-list').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-del]');
    if (!btn) return;
    var list = savedTokens();
    list.splice(parseInt(btn.getAttribute('data-del'), 10), 1);
    H.store.set('tokens', list);
    renderSaved();
  });

  function saveCurrent(quiet) {
    var small = document.createElement('canvas');
    small.width = small.height = 128;
    drawToken(small.getContext('2d'), 128);

    var list = savedTokens();
    list.push({ name: H.qs('#label-text').value.trim() || 'Token', data: small.toDataURL('image/png') });
    if (list.length > 40) list.shift();

    if (!H.store.set('tokens', list)) {
      H.toast('No room left in browser storage');
      return false;
    }
    renderSaved();
    if (!quiet) H.toast('Token saved');
    return true;
  }

  H.on('#btn-save', 'click', function () { saveCurrent(); });

  H.on('#btn-to-map', 'click', function () {
    if (!img) { H.toast('Load a picture first'); return; }
    if (saveCurrent(true)) {
      var list = savedTokens();
      H.store.set('map-pending-token', list[list.length - 1]);
      location.href = 'battlemap.html';
    }
  });

  renderSaved();
  draw();
})();
