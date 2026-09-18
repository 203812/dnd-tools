/* ============================================================
   campaign.js - constants for the session console
   ============================================================ */

/* Experience needed to reach each level (SRD 5.1) */
window.XP_LEVELS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
];

/** The level a total amount of experience corresponds to. */
window.levelForXp = function (xp) {
  var level = 1;
  for (var i = 0; i < XP_LEVELS.length; i++) if (xp >= XP_LEVELS[i]) level = i + 1;
  return level;
};

/** Proficiency bonus at a given level. */
window.profBonus = function (level) {
  return Math.floor((Math.max(1, level) - 1) / 4) + 2;
};

window.CAMPAIGN_DATA = {
  classes: ['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin',
            'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard', 'Other'],

  /* Hit die per class, used by the rest calculator */
  hitDie: {
    Barbarian: 12, Bard: 8, Cleric: 8, Druid: 8, Fighter: 10, Monk: 8, Paladin: 10,
    Ranger: 10, Rogue: 8, Sorcerer: 6, Warlock: 8, Wizard: 6, Other: 8
  },

  questStatus: ['Active', 'On hold', 'Completed', 'Failed'],

  npcAttitudes: ['Hostile', 'Suspicious', 'Indifferent', 'Helpful', 'Friendly', 'Devoted'],

  placeTypes: ['City', 'Town', 'Village', 'Dungeon', 'Wilderness', 'Stronghold', 'Temple', 'Other'],

  logKinds: [
    { id: 'note', label: 'Note', icon: '✍️' },
    { id: 'combat', label: 'Combat', icon: '⚔️' },
    { id: 'roleplay', label: 'Roleplay', icon: '\u{1F5E3}️' },
    { id: 'loot', label: 'Loot', icon: '\u{1F4B0}' },
    { id: 'travel', label: 'Travel', icon: '\u{1F97E}' },
    { id: 'rest', label: 'Rest', icon: '\u{1F3D5}️' },
    { id: 'level', label: 'Level up', icon: '⭐' }
  ],

  /* What a fresh campaign starts out as */
  blank: function () {
    return {
      name: 'New campaign',
      session: 1,
      inGameDate: '',
      milestone: false,
      party: [],
      log: [],
      quests: [],
      npcs: [],
      places: [],
      loot: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0, items: [] },
      created: new Date().toISOString()
    };
  }
};
