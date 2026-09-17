/* ============================================================
   calendar.js - presets for the campaign calendar and the
   weather tables that go with it.
   ============================================================ */
window.CALENDAR_PRESETS = {
  earth: {
    name: 'Earth-like',
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: [
      { name: 'January', days: 31 }, { name: 'February', days: 28 }, { name: 'March', days: 31 },
      { name: 'April', days: 30 }, { name: 'May', days: 31 }, { name: 'June', days: 30 },
      { name: 'July', days: 31 }, { name: 'August', days: 31 }, { name: 'September', days: 30 },
      { name: 'October', days: 31 }, { name: 'November', days: 30 }, { name: 'December', days: 31 }
    ],
    moons: [{ name: 'The Moon', cycle: 29, offset: 0 }]
  },
  fantasy: {
    name: 'Fantasy',
    weekdays: ['Sunsday', 'Moonsday', 'Godsday', 'Waterday', 'Earthday', 'Freeday', 'Starday'],
    months: [
      { name: 'Deepfrost', days: 30 }, { name: 'Thawing', days: 30 }, { name: 'Seedfall', days: 30 },
      { name: 'Greentide', days: 30 }, { name: 'Highsun', days: 30 }, { name: 'Emberwane', days: 30 },
      { name: 'Goldreap', days: 30 }, { name: 'Harvestmoon', days: 30 }, { name: 'Leaffall', days: 30 },
      { name: 'Duskwind', days: 30 }, { name: 'Longnight', days: 30 }, { name: 'Hearthkeep', days: 30 }
    ],
    moons: [
      { name: 'Selene', cycle: 30, offset: 0 },
      { name: 'The Ember', cycle: 47, offset: 12 }
    ]
  },
  simple: {
    name: 'Simple',
    weekdays: ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'],
    months: [
      { name: 'Frost', days: 36 }, { name: 'Rains', days: 36 }, { name: 'Seed', days: 36 },
      { name: 'Bloom', days: 36 }, { name: 'Sun', days: 36 }, { name: 'Dust', days: 36 },
      { name: 'Reap', days: 36 }, { name: 'Fade', days: 36 }, { name: 'Storm', days: 36 },
      { name: 'Dark', days: 36 }
    ],
    moons: [{ name: 'The Pale', cycle: 36, offset: 0 }]
  }
};

/* ---------- Weather ----------
   Per climate and season: weighted conditions, a temperature band in
   degrees Celsius, and the wind that usually comes with it. */
window.WEATHER = {
  climates: {
    Temperate: {
      Spring: { temp: [4, 17], conditions: [
        { w: 30, n: 'Clear and bright' }, { w: 25, n: 'Broken cloud' }, { w: 20, n: 'Overcast' },
        { w: 18, n: 'Steady rain' }, { w: 5, n: 'Heavy downpour' }, { w: 2, n: 'Thunderstorm' } ] },
      Summer: { temp: [14, 31], conditions: [
        { w: 40, n: 'Clear and hot' }, { w: 24, n: 'Hazy sunshine' }, { w: 15, n: 'Broken cloud' },
        { w: 12, n: 'Short shower' }, { w: 6, n: 'Thunderstorm' }, { w: 3, n: 'Oppressive heat' } ] },
      Autumn: { temp: [2, 15], conditions: [
        { w: 22, n: 'Crisp and clear' }, { w: 26, n: 'Grey overcast' }, { w: 24, n: 'Drizzle' },
        { w: 16, n: 'Heavy rain' }, { w: 8, n: 'Thick morning fog' }, { w: 4, n: 'Gale' } ] },
      Winter: { temp: [-9, 6], conditions: [
        { w: 24, n: 'Cold and clear' }, { w: 26, n: 'Leaden overcast' }, { w: 18, n: 'Sleet' },
        { w: 16, n: 'Snowfall' }, { w: 10, n: 'Hard frost' }, { w: 6, n: 'Blizzard' } ] }
    },
    Arid: {
      Spring: { temp: [12, 30], conditions: [
        { w: 55, n: 'Cloudless' }, { w: 20, n: 'Dusty haze' }, { w: 15, n: 'Wind-blown sand' },
        { w: 8, n: 'Rare rain' }, { w: 2, n: 'Sandstorm' } ] },
      Summer: { temp: [22, 46], conditions: [
        { w: 60, n: 'Blistering sun' }, { w: 18, n: 'Shimmering heat haze' }, { w: 14, n: 'Hot wind' },
        { w: 6, n: 'Dust devils' }, { w: 2, n: 'Sandstorm' } ] },
      Autumn: { temp: [10, 28], conditions: [
        { w: 50, n: 'Cloudless' }, { w: 22, n: 'Cool nights, hot days' }, { w: 16, n: 'Dusty wind' },
        { w: 10, n: 'Brief storm' }, { w: 2, n: 'Sandstorm' } ] },
      Winter: { temp: [-4, 18], conditions: [
        { w: 45, n: 'Clear and sharp' }, { w: 25, n: 'Bitter night, mild day' }, { w: 18, n: 'Cold wind' },
        { w: 10, n: 'Rain over the dunes' }, { w: 2, n: 'Freezing fog' } ] }
    },
    Arctic: {
      Spring: { temp: [-18, 0], conditions: [
        { w: 26, n: 'Pale clear sky' }, { w: 28, n: 'Flat white overcast' }, { w: 22, n: 'Light snow' },
        { w: 16, n: 'Driving snow' }, { w: 8, n: 'Whiteout' } ] },
      Summer: { temp: [-4, 10], conditions: [
        { w: 34, n: 'Bright and clear' }, { w: 26, n: 'Low cloud' }, { w: 20, n: 'Cold drizzle' },
        { w: 14, n: 'Thick fog' }, { w: 6, n: 'Sleet' } ] },
      Autumn: { temp: [-22, -2], conditions: [
        { w: 22, n: 'Clear and biting' }, { w: 28, n: 'Heavy grey sky' }, { w: 24, n: 'Snowfall' },
        { w: 16, n: 'Freezing gale' }, { w: 10, n: 'Blizzard' } ] },
      Winter: { temp: [-40, -12], conditions: [
        { w: 20, n: 'Still and lethal cold' }, { w: 22, n: 'Starless overcast' }, { w: 22, n: 'Snowfall' },
        { w: 20, n: 'Screaming wind' }, { w: 16, n: 'Blizzard' } ] }
    },
    Tropical: {
      Spring: { temp: [22, 33], conditions: [
        { w: 30, n: 'Humid sunshine' }, { w: 26, n: 'Towering cloud' }, { w: 26, n: 'Afternoon downpour' },
        { w: 14, n: 'Thunderstorm' }, { w: 4, n: 'Torrential rain' } ] },
      Summer: { temp: [24, 36], conditions: [
        { w: 24, n: 'Stifling humidity' }, { w: 22, n: 'Heavy cloud' }, { w: 28, n: 'Monsoon rain' },
        { w: 18, n: 'Thunderstorm' }, { w: 8, n: 'Tropical storm' } ] },
      Autumn: { temp: [21, 32], conditions: [
        { w: 28, n: 'Warm and bright' }, { w: 24, n: 'Muggy overcast' }, { w: 26, n: 'Steady rain' },
        { w: 16, n: 'Thunderstorm' }, { w: 6, n: 'Tropical storm' } ] },
      Winter: { temp: [18, 29], conditions: [
        { w: 40, n: 'Warm and dry' }, { w: 26, n: 'Scattered cloud' }, { w: 20, n: 'Short shower' },
        { w: 11, n: 'Thunderstorm' }, { w: 3, n: 'Heavy rain' } ] }
    },
    Coastal: {
      Spring: { temp: [6, 16], conditions: [
        { w: 26, n: 'Fresh and clear' }, { w: 26, n: 'Sea fog' }, { w: 24, n: 'Squally showers' },
        { w: 16, n: 'Strong onshore wind' }, { w: 8, n: 'Storm at sea' } ] },
      Summer: { temp: [14, 26], conditions: [
        { w: 36, n: 'Bright with a sea breeze' }, { w: 24, n: 'Light haze' }, { w: 20, n: 'Passing shower' },
        { w: 14, n: 'Morning fog' }, { w: 6, n: 'Summer gale' } ] },
      Autumn: { temp: [5, 17], conditions: [
        { w: 20, n: 'Clear between squalls' }, { w: 24, n: 'Low grey cloud' }, { w: 24, n: 'Driving rain' },
        { w: 20, n: 'Gale' }, { w: 12, n: 'Storm' } ] },
      Winter: { temp: [-2, 9], conditions: [
        { w: 18, n: 'Cold and clear' }, { w: 24, n: 'Sullen overcast' }, { w: 24, n: 'Cold rain' },
        { w: 20, n: 'Severe gale' }, { w: 14, n: 'Winter storm' } ] }
    }
  },

  winds: [
    { w: 30, n: 'still' }, { w: 30, n: 'a light breeze' }, { w: 22, n: 'a steady wind' },
    { w: 13, n: 'strong gusts' }, { w: 5, n: 'a howling gale' }
  ],

  /* Flavour for the DM: what the weather does to the day's travel */
  effects: {
    'Thunderstorm': 'Disadvantage on Perception checks that rely on hearing; open flames gutter out.',
    'Blizzard': 'Heavily obscured beyond 30 feet, difficult terrain, and a DC 10 CON save per hour against exhaustion.',
    'Whiteout': 'Heavily obscured; travel without a guide risks getting lost.',
    'Sandstorm': 'Heavily obscured, difficult terrain, and 1d4 slashing damage per hour without cover.',
    'Thick morning fog': 'Heavily obscured beyond 30 feet until midday.',
    'Thick fog': 'Heavily obscured beyond 30 feet.',
    'Sea fog': 'Heavily obscured beyond 60 feet near the shore.',
    'Heavy downpour': 'Disadvantage on Perception checks relying on sight; ranged attacks beyond normal range are impossible.',
    'Torrential rain': 'Disadvantage on sight-based Perception; fords and rivers become dangerous.',
    'Monsoon rain': 'Difficult terrain on unpaved roads; rivers rise fast.',
    'Oppressive heat': 'A DC 5 CON save each hour without water, or gain a level of exhaustion.',
    'Blistering sun': 'A DC 5 CON save each hour without water, or gain a level of exhaustion.',
    'Hard frost': 'A DC 10 CON save at the end of the day without cold-weather gear.',
    'Still and lethal cold': 'A DC 10 CON save each hour without cold-weather gear, or gain a level of exhaustion.',
    'Gale': 'Ranged attacks have disadvantage; flying creatures struggle to hold course.',
    'Severe gale': 'Ranged attacks have disadvantage; small boats should stay in harbour.',
    'Storm': 'Ranged attacks have disadvantage and travel pace drops to slow.',
    'Winter storm': 'Ranged attacks have disadvantage; travel pace drops to slow.',
    'Storm at sea': 'No safe sailing; the harbour is crowded with waiting crews.',
    'Tropical storm': 'Travel is impossible; find shelter or take 1d6 bludgeoning per hour from debris.',
    'Freezing gale': 'Difficult terrain and a DC 10 CON save each hour without cold-weather gear.',
    'Screaming wind': 'Ranged attacks are impossible; speech beyond 10 feet cannot be heard.'
  }
};
