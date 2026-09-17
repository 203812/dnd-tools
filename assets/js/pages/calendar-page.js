/* ============================================================
   calendar-page.js - logic for tools/calendar.html
   ------------------------------------------------------------
   Dates are held as an absolute day number counted from day 0 of
   year 1, which keeps moon phases and "advance N days" trivial.
   ============================================================ */
(function () {
  'use strict';

  var state = H.store.get('calendar', null) || defaults();
  var viewMonth = state.today.month;
  var viewYear = state.today.year;
  var editorDay = null;

  function defaults() {
    var p = CALENDAR_PRESETS.fantasy;
    return {
      era: 'Age of Embers',
      weekdays: p.weekdays.slice(),
      months: JSON.parse(JSON.stringify(p.months)),
      moons: JSON.parse(JSON.stringify(p.moons)),
      today: { year: 1372, month: 0, day: 1 },
      hour: 8,
      events: [],
      climate: 'Temperate',
      weather: null,
      elapsed: 0
    };
  }

  function save() { H.store.set('calendar', state); }

  /* ---------- Date maths ---------- */
  function yearLength() {
    return state.months.reduce(function (s, m) { return s + m.days; }, 0);
  }

  /** Absolute day index, counting day 1 of month 0 of year 1 as 0. */
  function toAbsolute(d) {
    var days = (d.year - 1) * yearLength();
    for (var i = 0; i < d.month; i++) days += state.months[i].days;
    return days + (d.day - 1);
  }

  function fromAbsolute(abs) {
    var len = yearLength();
    var year = Math.floor(abs / len) + 1;
    var rest = abs - (year - 1) * len;
    var month = 0;
    while (month < state.months.length && rest >= state.months[month].days) {
      rest -= state.months[month].days;
      month++;
    }
    return { year: year, month: Math.min(month, state.months.length - 1), day: rest + 1 };
  }

  function weekdayOf(d) {
    return toAbsolute(d) % state.weekdays.length;
  }

  function sameDay(a, b) {
    return a.year === b.year && a.month === b.month && a.day === b.day;
  }

  function dateLabel(d) {
    var m = state.months[d.month];
    return state.weekdays[weekdayOf(d)] + ', ' + d.day + ' ' + (m ? m.name : '?') + ' ' + d.year +
      (state.era ? ' ' + state.era : '');
  }

  /* ---------- Seasons ---------- */
  function seasonOf(d) {
    var fraction = d.month / Math.max(1, state.months.length);
    if (fraction < 0.25) return 'Winter';
    if (fraction < 0.5) return 'Spring';
    if (fraction < 0.75) return 'Summer';
    return 'Autumn';
  }

  /* ---------- Moons ---------- */
  function moonPhase(moon, d) {
    var abs = toAbsolute(d) + (moon.offset || 0);
    var pos = ((abs % moon.cycle) + moon.cycle) % moon.cycle;
    return pos / moon.cycle;  // 0 = new, 0.5 = full
  }

  function phaseName(p) {
    if (p < 0.03 || p > 0.97) return 'New';
    if (p < 0.22) return 'Waxing crescent';
    if (p < 0.28) return 'First quarter';
    if (p < 0.47) return 'Waxing gibbous';
    if (p < 0.53) return 'Full';
    if (p < 0.72) return 'Waning gibbous';
    if (p < 0.78) return 'Last quarter';
    return 'Waning crescent';
  }

  /** A small CSS gradient that reads as a moon at that phase. */
  function moonStyle(p) {
    var lit = 1 - Math.abs(p - 0.5) * 2;  // 0 at new, 1 at full
    var grey = Math.round(35 + lit * 200);
    var bg = 'rgb(' + grey + ',' + grey + ',' + Math.round(grey * 0.94) + ')';
    return 'background:' + bg;
  }

  /* ---------- Rendering ---------- */
  function render() {
    renderCalendar();
    renderMoons();
    renderEvents();
    renderTime();
    H.qs('#season-out').value = seasonOf(state.today);
  }

  function renderCalendar() {
    var month = state.months[viewMonth];
    if (!month) { viewMonth = 0; month = state.months[0]; }

    H.qs('#month-title').textContent = month.name + ' ' + viewYear;
    H.qs('#today-line').textContent = 'Today: ' + dateLabel(state.today);

    var cols = state.weekdays.length;
    H.qs('#cal-headers').style.setProperty('--cal-cols', cols);
    H.qs('#cal-body').style.setProperty('--cal-cols', cols);
    H.qs('#cal-headers').innerHTML = state.weekdays.map(function (w) {
      return '<div class="cal-head">' + H.escape(w) + '</div>';
    }).join('');

    var firstWeekday = weekdayOf({ year: viewYear, month: viewMonth, day: 1 });
    var cells = '';
    for (var b = 0; b < firstWeekday; b++) cells += '<div class="cal-day blank"></div>';

    for (var day = 1; day <= month.days; day++) {
      var d = { year: viewYear, month: viewMonth, day: day };
      var isToday = sameDay(d, state.today);
      var dayEvents = eventsOn(d);

      var moons = state.moons.map(function (m) {
        return '<span class="moon" style="' + moonStyle(moonPhase(m, d)) + '" title="' +
          H.escape(m.name + ': ' + phaseName(moonPhase(m, d))) + '"></span>';
      }).join('');

      cells += '<div class="cal-day' + (isToday ? ' today' : '') + '" data-day="' + day + '">' +
        '<div class="num">' + day + '</div>' +
        '<div class="cal-moons">' + moons + '</div>' +
        (dayEvents.length ? '<div class="cal-event">' + H.escape(dayEvents[0].title) +
          (dayEvents.length > 1 ? ' +' + (dayEvents.length - 1) : '') + '</div>' : '') +
      '</div>';
    }
    H.qs('#cal-body').innerHTML = cells;
  }

  function renderMoons() {
    if (!state.moons.length) {
      H.qs('#moon-out').innerHTML = '<div class="empty">No moons defined.</div>';
      return;
    }
    H.qs('#moon-out').innerHTML = state.moons.map(function (m) {
      var p = moonPhase(m, state.today);
      var daysToFull = Math.ceil(((0.5 - p + 1) % 1) * m.cycle);
      return '<div class="stat-line">' +
        '<span><span class="moon" style="' + moonStyle(p) + ';width:15px;height:15px;vertical-align:-3px;margin-right:8px"></span>' +
          H.escape(m.name) + '<br><small>' + m.cycle + '-day cycle</small></span>' +
        '<span>' + phaseName(p) + '<br><small>full in ' + (daysToFull === 0 ? 'tonight' : daysToFull + ' days') + '</small></span>' +
      '</div>';
    }).join('');
  }

  function eventsOn(d) {
    return state.events.filter(function (e) {
      if (e.repeat === 'yearly') return e.month === d.month && e.day === d.day;
      return e.year === d.year && e.month === d.month && e.day === d.day;
    });
  }

  function renderEvents() {
    var upcoming = state.events.slice().sort(function (a, b) {
      var aa = a.repeat === 'yearly' ? toAbsolute({ year: state.today.year, month: a.month, day: a.day })
                                     : toAbsolute({ year: a.year, month: a.month, day: a.day });
      var bb = b.repeat === 'yearly' ? toAbsolute({ year: state.today.year, month: b.month, day: b.day })
                                     : toAbsolute({ year: b.year, month: b.month, day: b.day });
      return aa - bb;
    });

    H.qs('#event-count').textContent = state.events.length + ' entr' + (state.events.length === 1 ? 'y' : 'ies');

    if (!upcoming.length) {
      H.qs('#event-list').innerHTML = '<div class="empty">Nothing noted down yet.</div>';
      return;
    }

    var todayAbs = toAbsolute(state.today);
    H.qs('#event-list').innerHTML = upcoming.map(function (e, i) {
      var d = { year: e.repeat === 'yearly' ? state.today.year : e.year, month: e.month, day: e.day };
      var diff = toAbsolute(d) - todayAbs;
      var when = diff === 0 ? 'today' : (diff > 0 ? 'in ' + diff + ' days' : Math.abs(diff) + ' days ago');
      return '<div class="stat-line">' +
        '<span><b>' + H.escape(e.title) + '</b><br><small>' + e.day + ' ' + state.months[e.month].name +
          (e.repeat === 'yearly' ? ', every year' : ' ' + e.year) + ' · ' + when + '</small></span>' +
        '<span><button class="btn btn-sm btn-danger" data-del-event="' + state.events.indexOf(e) + '">&#10005;</button></span>' +
      '</div>';
    }).join('');
  }

  H.qs('#event-list').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-del-event]');
    if (!btn) return;
    state.events.splice(parseInt(btn.getAttribute('data-del-event'), 10), 1);
    save(); render();
  });

  function renderTime() {
    var h = state.hour % 24;
    var partOfDay = h < 5 ? 'deep night' : h < 8 ? 'dawn' : h < 12 ? 'morning'
      : h < 14 ? 'midday' : h < 18 ? 'afternoon' : h < 21 ? 'evening' : 'night';
    H.qs('#time-line').textContent = 'It is ' + String(h).padStart(2, '0') + ':00 — ' + partOfDay + '.';
    H.qs('#elapsed-line').textContent = state.elapsed + ' day' + (state.elapsed === 1 ? '' : 's') + ' since the campaign began';
  }

  /* ---------- Advancing time ---------- */
  function advance(days) {
    var abs = toAbsolute(state.today) + days;
    if (abs < 0) abs = 0;
    state.today = fromAbsolute(abs);
    state.elapsed += days;
    viewMonth = state.today.month;
    viewYear = state.today.year;
    rollWeather();
    save(); render();
  }

  H.qsa('[data-advance]').forEach(function (btn) {
    btn.addEventListener('click', function () { advance(parseInt(btn.getAttribute('data-advance'), 10)); });
  });
  H.on('#btn-advance', 'click', function () {
    advance(parseInt(H.qs('#adv-days').value, 10) || 0);
  });
  H.on('#btn-rest', 'click', function () {
    state.hour += 8;
    if (state.hour >= 24) { state.hour -= 24; advance(1); return; }
    save(); renderTime();
  });

  H.on('#btn-prev-month', 'click', function () {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = state.months.length - 1; viewYear--; }
    renderCalendar();
  });
  H.on('#btn-next-month', 'click', function () {
    viewMonth++;
    if (viewMonth >= state.months.length) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });
  H.on('#btn-today', 'click', function () {
    viewMonth = state.today.month; viewYear = state.today.year; renderCalendar();
  });

  /* ---------- Day editor ---------- */
  H.qs('#cal-body').addEventListener('click', function (e) {
    var cell = e.target.closest('[data-day]');
    if (!cell) return;
    editorDay = { year: viewYear, month: viewMonth, day: parseInt(cell.getAttribute('data-day'), 10) };
    openEditor();
  });

  function openEditor() {
    H.qs('#day-editor').classList.remove('hidden');
    H.qs('#editor-title').textContent = dateLabel(editorDay);
    renderDayEvents();
    H.reveal(H.qs('#day-editor'));
  }

  function renderDayEvents() {
    var list = eventsOn(editorDay);
    H.qs('#day-events').innerHTML = list.length
      ? list.map(function (e) {
          return '<div class="stat-line"><span>' + H.escape(e.title) +
            (e.repeat === 'yearly' ? ' <span class="tag blue">yearly</span>' : '') + '</span>' +
            '<span><button class="btn btn-sm btn-danger" data-del-event="' + state.events.indexOf(e) + '">&#10005;</button></span></div>';
        }).join('')
      : '<div class="empty">Nothing on this day yet.</div>';
  }

  H.qs('#day-events').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-del-event]');
    if (!btn) return;
    state.events.splice(parseInt(btn.getAttribute('data-del-event'), 10), 1);
    save(); renderDayEvents(); render();
  });

  H.on('#btn-close-editor', 'click', function () { H.qs('#day-editor').classList.add('hidden'); });

  H.on('#btn-add-event', 'click', function () {
    var title = H.qs('#ev-title').value.trim();
    if (!title || !editorDay) { H.toast('Give the event a name first'); return; }
    state.events.push({
      title: title, year: editorDay.year, month: editorDay.month, day: editorDay.day,
      repeat: H.qs('#ev-repeat').value
    });
    H.qs('#ev-title').value = '';
    save(); renderDayEvents(); render();
  });

  H.on('#btn-set-today', 'click', function () {
    if (!editorDay) return;
    state.today = { year: editorDay.year, month: editorDay.month, day: editorDay.day };
    rollWeather();
    save(); render();
    H.toast('Date set to ' + dateLabel(state.today));
  });

  /* ---------- Weather ---------- */
  Object.keys(WEATHER.climates).forEach(function (c) {
    H.qs('#climate').appendChild(new Option(c, c));
  });
  H.qs('#climate').value = state.climate;

  function rollWeather() {
    var climate = WEATHER.climates[state.climate] || WEATHER.climates.Temperate;
    var season = climate[seasonOf(state.today)];
    var condition = H.weighted(season.conditions).n;
    var temp = H.randInt(season.temp[0], season.temp[1]);
    var wind = H.weighted(WEATHER.winds).n;

    state.weather = { condition: condition, temp: temp, wind: wind, season: seasonOf(state.today) };
    renderWeather();
  }

  function renderWeather() {
    var w = state.weather;
    if (!w) { H.qs('#weather-out').innerHTML = '<div class="empty">Roll the weather for today.</div>'; return; }

    var effect = WEATHER.effects[w.condition];
    H.qs('#weather-out').innerHTML =
      '<div class="result-box">' +
        '<h3 style="margin:0 0 6px">' + H.escape(w.condition) + '</h3>' +
        '<div class="stat-line"><span>Temperature</span><span>' + w.temp + ' °C</span></div>' +
        '<div class="stat-line"><span>Wind</span><span>' + H.escape(w.wind) + '</span></div>' +
        '<div class="stat-line"><span>Season</span><span>' + w.season + '</span></div>' +
        (effect ? '<div class="hr"></div><p class="muted" style="font-size:.88rem;margin:0">' + H.escape(effect) + '</p>' : '') +
      '</div>';
  }

  H.on('#btn-weather', 'click', rollWeather);
  H.on('#climate', 'change', function () { state.climate = this.value; rollWeather(); save(); });

  /* ---------- Setup form ---------- */
  function fillSetup() {
    H.qs('#year-name').value = state.era;
    H.qs('#weekdays').value = state.weekdays.join(', ');
    H.qs('#months').value = state.months.map(function (m) { return m.name + ', ' + m.days; }).join('\n');
    H.qs('#moons').value = state.moons.map(function (m) { return m.name + ', ' + m.cycle + ', ' + (m.offset || 0); }).join('\n');
  }

  H.on('#preset', 'change', function () {
    var p = CALENDAR_PRESETS[this.value];
    if (!p) return;
    H.qs('#weekdays').value = p.weekdays.join(', ');
    H.qs('#months').value = p.months.map(function (m) { return m.name + ', ' + m.days; }).join('\n');
    H.qs('#moons').value = p.moons.map(function (m) { return m.name + ', ' + m.cycle + ', ' + (m.offset || 0); }).join('\n');
    H.toast('Preset loaded - press Apply to use it');
  });

  H.on('#btn-apply', 'click', function () {
    var weekdays = H.qs('#weekdays').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var months = H.qs('#months').value.split('\n').map(function (line) {
      var parts = line.split(',');
      if (parts.length < 2) return null;
      var days = parseInt(parts[1], 10);
      if (!parts[0].trim() || !days || days < 1) return null;
      return { name: parts[0].trim(), days: H.clamp(days, 1, 200) };
    }).filter(Boolean);
    var moons = H.qs('#moons').value.split('\n').map(function (line) {
      var parts = line.split(',');
      if (parts.length < 2) return null;
      var cycle = parseInt(parts[1], 10);
      if (!parts[0].trim() || !cycle || cycle < 2) return null;
      return { name: parts[0].trim(), cycle: H.clamp(cycle, 2, 999), offset: parseInt(parts[2], 10) || 0 };
    }).filter(Boolean);

    if (!weekdays.length) { H.toast('Give at least one weekday name'); return; }
    if (!months.length) { H.toast('Give at least one month as "Name, days"'); return; }

    state.era = H.qs('#year-name').value.trim();
    state.weekdays = weekdays;
    state.months = months;
    state.moons = moons;
    if (state.today.month >= months.length) state.today.month = months.length - 1;
    if (state.today.day > months[state.today.month].days) state.today.day = months[state.today.month].days;
    viewMonth = state.today.month;
    viewYear = state.today.year;
    save(); render();
    H.toast('Calendar updated');
  });

  /* ---------- Import, export, reset ---------- */
  H.on('#btn-export', 'click', function () {
    H.download('calendar.json', JSON.stringify(state, null, 2), 'application/json');
  });

  H.on('#btn-import', 'click', function () {
    H.pickFile('.json,application/json', false, function (file) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data.months || !data.today) throw new Error('bad');
          state = data;
          state.events = state.events || [];
          state.moons = state.moons || [];
          viewMonth = state.today.month;
          viewYear = state.today.year;
          H.qs('#climate').value = state.climate || 'Temperate';
          fillSetup(); save(); render(); renderWeather();
          H.toast('Calendar loaded');
        } catch (err) { H.toast('That file could not be read'); }
      };
      reader.readAsText(file);
    });
  });

  H.on('#btn-reset', 'click', function () {
    if (!confirm('Throw away this calendar and start over?')) return;
    state = defaults();
    viewMonth = state.today.month;
    viewYear = state.today.year;
    fillSetup(); rollWeather(); save(); render();
  });

  fillSetup();
  if (!state.weather) rollWeather(); else renderWeather();
  render();
})();
