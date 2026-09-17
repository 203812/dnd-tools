/* ============================================================
   treasure.js - treasure and coin data
   ------------------------------------------------------------
   The coin tables follow the DMG/SRD "Individual Treasure" tables
   and the coin rows of "Treasure Hoard". The distribution of gems,
   art objects and magic items is a simplified variant of the
   percentile tables: the proportions hold, but the exact
   percentile rows are condensed into weighted chances.
   ============================================================ */

window.TREASURE = {

  /* ---------- Individual treasure (per monster) ---------- */
  individual: {
    "0-4": [
      { w: 30, coins: { cp: "5d6" } },
      { w: 30, coins: { sp: "4d6" } },
      { w: 10, coins: { ep: "3d6" } },
      { w: 25, coins: { gp: "3d6" } },
      { w: 5,  coins: { pp: "1d6" } }
    ],
    "5-10": [
      { w: 30, coins: { cp: "4d6*100", sp: "1d6*10" } },
      { w: 30, coins: { sp: "6d6*10", gp: "2d6*10" } },
      { w: 10, coins: { ep: "3d6*10", gp: "2d6*10" } },
      { w: 25, coins: { gp: "4d6*10" } },
      { w: 5,  coins: { gp: "2d6*10", pp: "3d6" } }
    ],
    "11-16": [
      { w: 20, coins: { sp: "4d6*100", gp: "1d6*100" } },
      { w: 15, coins: { ep: "1d6*100", gp: "1d6*100" } },
      { w: 40, coins: { gp: "2d6*100" } },
      { w: 25, coins: { gp: "2d6*100", pp: "1d6*100" } }
    ],
    "17+": [
      { w: 15, coins: { ep: "2d6*1000", gp: "8d6*100" } },
      { w: 40, coins: { gp: "1d6*1000", pp: "1d6*100" } },
      { w: 45, coins: { gp: "1d6*1000", pp: "2d6*100" } }
    ]
  },

  /* ---------- Treasure hoard ---------- */
  hoard: {
    "0-4": {
      coins: { cp: "6d6*100", sp: "3d6*100", gp: "2d6*10" },
      valuables: [
        { w: 6,  type: null },
        { w: 34, type: "gem", value: 10, count: "2d6" },
        { w: 30, type: "art", value: 25, count: "2d6" },
        { w: 30, type: "gem", value: 50, count: "2d6" }
      ],
      items: [{ w: 55, table: null, count: 0 }, { w: 30, table: "A", count: "1d6" }, { w: 10, table: "B", count: "1d4" }, { w: 4, table: "C", count: "1d4" }, { w: 1, table: "F", count: "1" }]
    },
    "5-10": {
      coins: { cp: "2d6*100", sp: "2d6*1000", gp: "6d6*100", pp: "3d6*10" },
      valuables: [
        { w: 4,  type: null },
        { w: 24, type: "art", value: 25, count: "2d4" },
        { w: 24, type: "art", value: 250, count: "2d4" },
        { w: 24, type: "gem", value: 50, count: "3d6" },
        { w: 24, type: "gem", value: 100, count: "3d6" }
      ],
      items: [{ w: 35, table: null, count: 0 }, { w: 25, table: "A", count: "1d6" }, { w: 20, table: "B", count: "1d4" }, { w: 12, table: "C", count: "1d4" }, { w: 6, table: "F", count: "1d4" }, { w: 2, table: "G", count: "1" }]
    },
    "11-16": {
      coins: { gp: "4d6*1000", pp: "5d6*100" },
      valuables: [
        { w: 3,  type: null },
        { w: 25, type: "art", value: 250, count: "2d4" },
        { w: 25, type: "art", value: 750, count: "2d4" },
        { w: 24, type: "gem", value: 500, count: "3d6" },
        { w: 23, type: "gem", value: 1000, count: "3d6" }
      ],
      items: [{ w: 20, table: null, count: 0 }, { w: 22, table: "C", count: "1d6" }, { w: 22, table: "D", count: "1" }, { w: 18, table: "G", count: "1d4" }, { w: 12, table: "H", count: "1" }, { w: 6, table: "I", count: "1" }]
    },
    "17+": {
      coins: { gp: "12d6*1000", pp: "8d6*1000" },
      valuables: [
        { w: 2,  type: null },
        { w: 25, type: "gem", value: 1000, count: "3d6" },
        { w: 25, type: "art", value: 2500, count: "1d10" },
        { w: 25, type: "art", value: 7500, count: "1d4" },
        { w: 23, type: "gem", value: 5000, count: "1d8" }
      ],
      items: [{ w: 12, table: null, count: 0 }, { w: 28, table: "H", count: "1d4" }, { w: 32, table: "I", count: "1d4" }, { w: 28, table: "G", count: "1d6" }]
    }
  },

  /* ---------- Gemstones by value ---------- */
  gems: {
    10: ["azurite (opaque deep blue)", "banded agate", "blue quartz", "eye agate", "hematite", "lapis lazuli", "malachite", "obsidian", "rhodochrosite", "tiger eye", "tourmaline", "small amber"],
    50: ["bloodstone", "carnelian", "chalcedony", "chrysoprase", "citrine", "jasper", "moonstone", "onyx", "quartz", "sardonyx", "star rose quartz", "zircon"],
    100: ["amber", "amethyst", "chrysoberyl", "coral", "garnet", "jade", "pearl", "red spinel", "reddish brown spinel", "fine tourmaline"],
    500: ["alexandrite", "aquamarine", "black pearl", "blue spinel", "peridot", "topaz"],
    1000: ["black opal", "blue sapphire", "emerald", "fire opal", "opal", "star ruby", "star sapphire", "yellow sapphire"],
    5000: ["diamond", "black sapphire", "ruby", "flawless emerald", "jacinth"]
  },

  /* ---------- Art objects by value ---------- */
  art: {
    25: ["silver ewer chased with leaves", "embroidered gold child's cap", "black velvet mask stitched with silver thread", "copper bowl with a hammered rim", "pair of dancing silver figurines", "lacquered wooden box inlaid with ivory", "bronze oil lamp with engravings"],
    250: ["gold ring set with bloodstones", "carved ivory statuette of a warrior", "gold bracelet set with jade", "gold necklace with a pendant", "illuminated prayer book with a clasp", "silver censer", "small gold circlet set with turquoise"],
    750: ["silver chalice with a gold rim", "engraved ivory sceptre", "gold mask with gemstone eyes", "silk carpet woven with silver thread", "gold peacock with emerald feathers"],
    2500: ["gold crown set with sapphires", "platinum bracelet set with an emerald", "embroidery of silk and gold", "gold and jade statuette", "gold breastplate worked in relief"],
    7500: ["gold jewellery box set with pearls", "crown of platinum and diamond", "gold sceptre of a fallen kingdom", "life-sized gold statue of a god", "necklace of black pearls"]
  },

  /* ---------- Magic item tables (SRD 5.1) ---------- */
  itemTables: {
    A: ["Potion of Healing", "Spell Scroll (cantrip)", "Potion of Climbing", "Spell Scroll (1st level)", "Spell Scroll (2nd level)", "Potion of Greater Healing", "Bag of Holding", "Driftglobe"],
    B: ["Potion of Greater Healing", "Potion of Fire Breath", "Potion of Resistance", "Ammunition +1", "Potion of Animal Friendship", "Potion of Hill Giant Strength", "Potion of Growth", "Potion of Water Breathing", "Spell Scroll (2nd level)", "Spell Scroll (3rd level)", "Bag of Holding", "Keoghtom's Ointment", "Oil of Slipperiness", "Dust of Disappearance", "Dust of Dryness", "Dust of Sneezing and Choking", "Elemental Gem", "Philter of Love", "Alchemy Jug", "Cap of Water Breathing", "Cloak of the Manta Ray", "Driftglobe", "Goggles of Night", "Helm of Comprehending Languages", "Immovable Rod", "Lantern of Revealing", "Mariner's Armor", "Mithral Armor", "Potion of Poison", "Ring of Swimming", "Robe of Useful Items", "Rope of Climbing", "Saddle of the Cavalier", "Wand of Magic Detection", "Wand of Secrets"],
    C: ["Potion of Superior Healing", "Spell Scroll (4th level)", "Ammunition +2", "Potion of Clairvoyance", "Potion of Diminution", "Potion of Gaseous Form", "Potion of Frost Giant Strength", "Potion of Stone Giant Strength", "Potion of Heroism", "Potion of Invulnerability", "Potion of Mind Reading", "Spell Scroll (5th level)", "Elixir of Health", "Oil of Etherealness", "Potion of Fire Giant Strength", "Quaal's Feather Token", "Scroll of Protection", "Bag of Beans", "Bead of Force", "Chime of Opening", "Decanter of Endless Water", "Eyes of Minute Seeing", "Folding Boat", "Heward's Handy Haversack", "Horseshoes of Speed", "Necklace of Fireballs", "Periapt of Health", "Sending Stones"],
    D: ["Potion of Supreme Healing", "Potion of Invisibility", "Potion of Speed", "Spell Scroll (6th level)", "Spell Scroll (7th level)", "Ammunition +3", "Oil of Sharpness", "Potion of Flying", "Potion of Cloud Giant Strength", "Potion of Longevity", "Potion of Vitality", "Spell Scroll (8th level)", "Horseshoes of a Zephyr", "Nolzur's Marvelous Pigments", "Bag of Devouring", "Portable Hole"],
    E: ["Spell Scroll (8th level)", "Potion of Storm Giant Strength", "Potion of Supreme Healing", "Spell Scroll (9th level)", "Universal Solvent", "Arrow of Slaying", "Sovereign Glue"],
    F: ["Weapon +1", "Shield +1", "Sentinel Shield", "Amulet of Proof against Detection and Location", "Boots of Elvenkind", "Boots of Striding and Springing", "Bracers of Archery", "Brooch of Shielding", "Broom of Flying", "Cloak of Elvenkind", "Cloak of Protection", "Gauntlets of Ogre Power", "Hat of Disguise", "Javelin of Lightning", "Pearl of Power", "Rod of the Pact Keeper +1", "Slippers of Spider Climbing", "Staff of the Adder", "Staff of the Python", "Sword of Vengeance", "Trident of Fish Command", "Wand of Magic Missiles", "Wand of the War Mage +1", "Wand of Web", "Weapon of Warning", "Adamantine Armor", "Bag of Tricks", "Boots of the Winterlands", "Deck of Illusions", "Eversmoking Bottle", "Eyes of Charming", "Eyes of the Eagle", "Figurine of Wondrous Power (silver raven)", "Gem of Brightness", "Gloves of Missile Snaring", "Gloves of Swimming and Climbing", "Gloves of Thievery", "Headband of Intellect", "Helm of Telepathy", "Instrument of the Bards", "Medallion of Thoughts", "Necklace of Adaptation", "Periapt of Wound Closure", "Pipes of Haunting", "Pipes of the Sewers", "Ring of Jumping", "Ring of Mind Shielding", "Ring of Warmth", "Ring of Water Walking", "Quiver of Ehlonna", "Stone of Good Luck", "Wind Fan", "Winged Boots"],
    G: ["Weapon +2", "Figurine of Wondrous Power", "Adamantine Armor (breastplate)", "Amulet of Health", "Armor +1", "Belt of Dwarvenkind", "Belt of Hill Giant Strength", "Berserker Axe", "Boots of Levitation", "Boots of Speed", "Bowl of Commanding Water Elementals", "Bracers of Defense", "Brazier of Commanding Fire Elementals", "Cape of the Mountebank", "Censer of Controlling Air Elementals", "Chain Mail +1", "Chain Shirt +1", "Cloak of Displacement", "Cloak of the Bat", "Cube of Force", "Daern's Instant Fortress", "Dagger of Venom", "Dimensional Shackles", "Dragon Slayer", "Elven Chain", "Flame Tongue", "Gem of Seeing", "Helm of Teleportation", "Horn of Blasting", "Horn of Valhalla (silver or brass)", "Instrument of the Bards (Canaith mandolin)", "Ioun Stone (protection)", "Iron Bands of Bilarro", "Mace of Disruption", "Mace of Smiting", "Mace of Terror", "Mantle of Spell Resistance", "Necklace of Prayer Beads", "Periapt of Proof against Poison", "Ring of Animal Influence", "Ring of Evasion", "Ring of Feather Falling", "Ring of Free Action", "Ring of Protection", "Ring of Resistance", "Ring of Spell Storing", "Ring of the Ram", "Ring of X-ray Vision", "Robe of Eyes", "Rod of Rulership", "Rod of the Pact Keeper +2", "Rope of Entanglement", "Scimitar of Speed", "Shield +2", "Shield of Missile Attraction", "Staff of Charming", "Staff of Healing", "Staff of Swarming Insects", "Staff of the Woodlands", "Staff of Withering", "Stone of Controlling Earth Elementals", "Sun Blade", "Sword of Life Stealing", "Sword of Wounding", "Tentacle Rod", "Vicious Weapon", "Wand of Binding", "Wand of Enemy Detection", "Wand of Fear", "Wand of Fireballs", "Wand of Lightning Bolts", "Wand of Paralysis", "Wand of the War Mage +2", "Wand of Wonder", "Wings of Flying"],
    H: ["Weapon +3", "Amulet of the Planes", "Carpet of Flying", "Crystal Ball", "Ring of Regeneration", "Ring of Shooting Stars", "Ring of Telekinesis", "Robe of Scintillating Colors", "Robe of Stars", "Rod of Absorption", "Rod of Alertness", "Rod of Security", "Rod of the Pact Keeper +3", "Scimitar of Speed", "Shield +3", "Staff of Fire", "Staff of Frost", "Staff of Power", "Staff of Striking", "Staff of Thunder and Lightning", "Sword of Sharpness", "Wand of Polymorph", "Wand of the War Mage +3", "Adamantine Armor (half plate)", "Adamantine Armor (plate)", "Animated Shield", "Belt of Fire Giant Strength", "Dancing Sword", "Demon Armor", "Dragon Scale Mail", "Dwarven Plate", "Dwarven Thrower", "Efreeti Bottle", "Figurine of Wondrous Power (obsidian steed)", "Frost Brand", "Helm of Brilliance", "Horn of Valhalla (bronze)", "Instrument of the Bards (Anstruth harp)", "Ioun Stone (absorption)", "Ioun Stone (agility)", "Ioun Stone (fortitude)", "Ioun Stone (insight)", "Ioun Stone (intellect)", "Ioun Stone (leadership)", "Ioun Stone (strength)", "Manual of Bodily Health", "Manual of Gainful Exercise", "Manual of Golems", "Manual of Quickness of Action", "Mirror of Life Trapping", "Nine Lives Stealer", "Oathbow", "Spellguard Shield", "Tome of Clear Thought", "Tome of Leadership and Influence", "Tome of Understanding"],
    I: ["Defender", "Hammer of Thunderbolts", "Luck Blade", "Sword of Answering", "Holy Avenger", "Ring of Djinni Summoning", "Ring of Invisibility", "Ring of Spell Turning", "Rod of Lordly Might", "Vorpal Sword", "Belt of Cloud Giant Strength", "Armor +2", "Robe of the Archmagi", "Rod of Resurrection", "Staff of the Magi", "Scarab of Protection", "Cubic Gate", "Deck of Many Things", "Efreeti Chain", "Armor of Invulnerability", "Iron Flask", "Sphere of Annihilation", "Talisman of Pure Good", "Talisman of the Sphere", "Talisman of Ultimate Evil", "Tome of the Stilled Tongue"]
  }
};
