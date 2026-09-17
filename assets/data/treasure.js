/* ============================================================
   treasure.js - schat- en muntdata
   ------------------------------------------------------------
   De munttabellen volgen de DMG/SRD-tabellen "Individual Treasure"
   en de muntregel van "Treasure Hoard". De verdeling van edelstenen,
   kunstvoorwerpen en magische items is een vereenvoudigde variant
   op de percentieltabellen: de verhoudingen kloppen, de exacte
   percentielrijen zijn samengevat tot gewogen kansen.
   ============================================================ */

window.TREASURE = {

  /* ---------- Individuele schat (per monster) ---------- */
  individueel: {
    "0-4": [
      { w: 30, munten: { cp: "5d6" } },
      { w: 30, munten: { sp: "4d6" } },
      { w: 10, munten: { ep: "3d6" } },
      { w: 25, munten: { gp: "3d6" } },
      { w: 5,  munten: { pp: "1d6" } }
    ],
    "5-10": [
      { w: 30, munten: { cp: "4d6*100", sp: "1d6*10" } },
      { w: 30, munten: { sp: "6d6*10", gp: "2d6*10" } },
      { w: 10, munten: { ep: "3d6*10", gp: "2d6*10" } },
      { w: 25, munten: { gp: "4d6*10" } },
      { w: 5,  munten: { gp: "2d6*10", pp: "3d6" } }
    ],
    "11-16": [
      { w: 20, munten: { sp: "4d6*100", gp: "1d6*100" } },
      { w: 15, munten: { ep: "1d6*100", gp: "1d6*100" } },
      { w: 40, munten: { gp: "2d6*100" } },
      { w: 25, munten: { gp: "2d6*100", pp: "1d6*100" } }
    ],
    "17+": [
      { w: 15, munten: { ep: "2d6*1000", gp: "8d6*100" } },
      { w: 40, munten: { gp: "1d6*1000", pp: "1d6*100" } },
      { w: 45, munten: { gp: "1d6*1000", pp: "2d6*100" } }
    ]
  },

  /* ---------- Schatkamer (hoard) ---------- */
  hoard: {
    "0-4": {
      munten: { cp: "6d6*100", sp: "3d6*100", gp: "2d6*10" },
      waardevol: [
        { w: 6,  type: null },
        { w: 34, type: "gem", waarde: 10, aantal: "2d6" },
        { w: 30, type: "art", waarde: 25, aantal: "2d6" },
        { w: 30, type: "gem", waarde: 50, aantal: "2d6" }
      ],
      items: [{ w: 55, tabel: null, aantal: 0 }, { w: 30, tabel: "A", aantal: "1d6" }, { w: 10, tabel: "B", aantal: "1d4" }, { w: 4, tabel: "C", aantal: "1d4" }, { w: 1, tabel: "F", aantal: "1" }]
    },
    "5-10": {
      munten: { cp: "2d6*100", sp: "2d6*1000", gp: "6d6*100", pp: "3d6*10" },
      waardevol: [
        { w: 4,  type: null },
        { w: 24, type: "art", waarde: 25, aantal: "2d4" },
        { w: 24, type: "art", waarde: 250, aantal: "2d4" },
        { w: 24, type: "gem", waarde: 50, aantal: "3d6" },
        { w: 24, type: "gem", waarde: 100, aantal: "3d6" }
      ],
      items: [{ w: 35, tabel: null, aantal: 0 }, { w: 25, tabel: "A", aantal: "1d6" }, { w: 20, tabel: "B", aantal: "1d4" }, { w: 12, tabel: "C", aantal: "1d4" }, { w: 6, tabel: "F", aantal: "1d4" }, { w: 2, tabel: "G", aantal: "1" }]
    },
    "11-16": {
      munten: { gp: "4d6*1000", pp: "5d6*100" },
      waardevol: [
        { w: 3,  type: null },
        { w: 25, type: "art", waarde: 250, aantal: "2d4" },
        { w: 25, type: "art", waarde: 750, aantal: "2d4" },
        { w: 24, type: "gem", waarde: 500, aantal: "3d6" },
        { w: 23, type: "gem", waarde: 1000, aantal: "3d6" }
      ],
      items: [{ w: 20, tabel: null, aantal: 0 }, { w: 22, tabel: "C", aantal: "1d6" }, { w: 22, tabel: "D", aantal: "1" }, { w: 18, tabel: "G", aantal: "1d4" }, { w: 12, tabel: "H", aantal: "1" }, { w: 6, tabel: "I", aantal: "1" }]
    },
    "17+": {
      munten: { gp: "12d6*1000", pp: "8d6*1000" },
      waardevol: [
        { w: 2,  type: null },
        { w: 25, type: "gem", waarde: 1000, aantal: "3d6" },
        { w: 25, type: "art", waarde: 2500, aantal: "1d10" },
        { w: 25, type: "art", waarde: 7500, aantal: "1d4" },
        { w: 23, type: "gem", waarde: 5000, aantal: "1d8" }
      ],
      items: [{ w: 12, tabel: null, aantal: 0 }, { w: 28, tabel: "H", aantal: "1d4" }, { w: 32, tabel: "I", aantal: "1d4" }, { w: 28, tabel: "G", aantal: "1d6" }]
    }
  },

  /* ---------- Edelstenen per waarde ---------- */
  gems: {
    10: ["azuriet (ondoorzichtig diepblauw)", "gestreepte agaat", "blauw kwarts", "oogagaat", "hematiet", "lapis lazuli", "maleachiet", "obsidiaan", "rodochrosiet", "tijgeroog", "toermalijn", "barnsteen (klein)"],
    50: ["bloedsteen", "carneool", "chalcedoon", "chrysopraas", "citrien", "jaspis", "maansteen", "onyx", "kwarts", "sardonyx", "sterrenroze kwarts", "zirkoon"],
    100: ["amber", "amethist", "chrysoberyl", "koraal", "granaat", "jade", "parel", "rode spinel", "roodbruine spinel", "toermalijn (fijn)"],
    500: ["alexandriet", "aquamarijn", "zwarte parel", "blauwe spinel", "peridoot", "topaas"],
    1000: ["zwarte opaal", "blauwe saffier", "smaragd", "vuuropaal", "opaal", "sterrenrobijn", "sterrensaffier", "gele saffier"],
    5000: ["diamant", "zwarte saffier", "robijn", "smaragd (vlekkeloos)", "vuurdiamant"]
  },

  /* ---------- Kunstvoorwerpen per waarde ---------- */
  art: {
    25: ["zilveren beker met loofwerk", "gestikte gouden kindermuts", "zwarte fluwelen masker met zilverdraad", "koperen kom met gedreven rand", "paar dansende zilveren beeldjes", "gelakt houten doosje met ivoor inleg", "bronzen olielampje met gravures"],
    250: ["gouden ring met bloedstenen", "ivoren beeldje van een krijger", "gouden armband met jade", "gouden halsketting met een hanger", "verluchte gebedenboek met slotje", "zilveren wierookvat", "gouden kroontje met turkoois"],
    750: ["zilveren kelk met gouden rand", "gegraveerde ivoren scepter", "gouden masker met edelstenen ogen", "zijden tapijt met zilverdraad", "gouden pauw met smaragden veren"],
    2500: ["gouden kroon met saffieren", "platina armband met smaragd", "borduurwerk van zijde en goud", "gouden en jaden statuette", "gouden borstplaat met reliëf"],
    7500: ["gouden juwelenkist met parels", "kroon van platina en diamant", "gouden scepter van een verloren rijk", "levensgroot gouden beeld van een god", "halssnoer van zwarte parels"]
  },

  /* ---------- Magische-itemtabellen (SRD 5.1) ---------- */
  itemTabellen: {
    A: ["Potion of Healing", "Spell Scroll (cantrip)", "Potion of Climbing", "Spell Scroll (1e niveau)", "Spell Scroll (2e niveau)", "Potion of Greater Healing", "Bag of Holding", "Driftglobe"],
    B: ["Potion of Greater Healing", "Potion of Fire Breath", "Potion of Resistance", "Ammunition +1", "Potion of Animal Friendship", "Potion of Hill Giant Strength", "Potion of Growth", "Potion of Water Breathing", "Spell Scroll (2e niveau)", "Spell Scroll (3e niveau)", "Bag of Holding", "Keoghtom's Ointment", "Oil of Slipperiness", "Dust of Disappearance", "Dust of Dryness", "Dust of Sneezing and Choking", "Elemental Gem", "Philter of Love", "Alchemy Jug", "Cap of Water Breathing", "Cloak of the Manta Ray", "Driftglobe", "Goggles of Night", "Helm of Comprehending Languages", "Immovable Rod", "Lantern of Revealing", "Mariner's Armor", "Mithral Armor", "Potion of Poison", "Ring of Swimming", "Robe of Useful Items", "Rope of Climbing", "Saddle of the Cavalier", "Wand of Magic Detection", "Wand of Secrets"],
    C: ["Potion of Superior Healing", "Spell Scroll (4e niveau)", "Ammunition +2", "Potion of Clairvoyance", "Potion of Diminution", "Potion of Gaseous Form", "Potion of Frost Giant Strength", "Potion of Stone Giant Strength", "Potion of Heroism", "Potion of Invulnerability", "Potion of Mind Reading", "Spell Scroll (5e niveau)", "Elixir of Health", "Oil of Etherealness", "Potion of Fire Giant Strength", "Quaal's Feather Token", "Scroll of Protection", "Bag of Beans", "Bead of Force", "Chime of Opening", "Decanter of Endless Water", "Eyes of Minute Seeing", "Folding Boat", "Heward's Handy Haversack", "Horseshoes of Speed", "Necklace of Fireballs", "Periapt of Health", "Sending Stones"],
    D: ["Potion of Supreme Healing", "Potion of Invisibility", "Potion of Speed", "Spell Scroll (6e niveau)", "Spell Scroll (7e niveau)", "Ammunition +3", "Oil of Sharpness", "Potion of Flying", "Potion of Cloud Giant Strength", "Potion of Longevity", "Potion of Vitality", "Spell Scroll (8e niveau)", "Horseshoes of a Zephyr", "Nolzur's Marvelous Pigments", "Bag of Devouring", "Portable Hole"],
    E: ["Spell Scroll (8e niveau)", "Potion of Storm Giant Strength", "Potion of Supreme Healing", "Spell Scroll (9e niveau)", "Universal Solvent", "Arrow of Slaying", "Sovereign Glue"],
    F: ["Weapon +1", "Shield +1", "Sentinel Shield", "Amulet of Proof against Detection and Location", "Boots of Elvenkind", "Boots of Striding and Springing", "Bracers of Archery", "Brooch of Shielding", "Broom of Flying", "Cloak of Elvenkind", "Cloak of Protection", "Gauntlets of Ogre Power", "Hat of Disguise", "Javelin of Lightning", "Pearl of Power", "Rod of the Pact Keeper +1", "Slippers of Spider Climbing", "Staff of the Adder", "Staff of the Python", "Sword of Vengeance", "Trident of Fish Command", "Wand of Magic Missiles", "Wand of the War Mage +1", "Wand of Web", "Weapon of Warning", "Adamantine Armor", "Bag of Tricks", "Boots of the Winterlands", "Deck of Illusions", "Eversmoking Bottle", "Eyes of Charming", "Eyes of the Eagle", "Figurine of Wondrous Power (silver raven)", "Gem of Brightness", "Gloves of Missile Snaring", "Gloves of Swimming and Climbing", "Gloves of Thievery", "Headband of Intellect", "Helm of Telepathy", "Instrument of the Bards", "Medallion of Thoughts", "Necklace of Adaptation", "Periapt of Wound Closure", "Pipes of Haunting", "Pipes of the Sewers", "Ring of Jumping", "Ring of Mind Shielding", "Ring of Warmth", "Ring of Water Walking", "Quiver of Ehlonna", "Stone of Good Luck", "Wind Fan", "Winged Boots"],
    G: ["Weapon +2", "Figurine of Wondrous Power", "Adamantine Armor (breastplate)", "Amulet of Health", "Armor +1", "Belt of Dwarvenkind", "Belt of Hill Giant Strength", "Berserker Axe", "Boots of Levitation", "Boots of Speed", "Bowl of Commanding Water Elementals", "Bracers of Defense", "Brazier of Commanding Fire Elementals", "Cape of the Mountebank", "Censer of Controlling Air Elementals", "Chain Mail +1", "Chain Shirt +1", "Cloak of Displacement", "Cloak of the Bat", "Cube of Force", "Daern's Instant Fortress", "Dagger of Venom", "Dimensional Shackles", "Dragon Slayer", "Elven Chain", "Flame Tongue", "Gem of Seeing", "Giant Slayer", "Glamoured Studded Leather", "Helm of Teleportation", "Horn of Blasting", "Horn of Valhalla (silver or brass)", "Instrument of the Bards (Canaith mandolin)", "Ioun Stone (protection)", "Iron Bands of Bilarro", "Mace of Disruption", "Mace of Smiting", "Mace of Terror", "Mantle of Spell Resistance", "Necklace of Prayer Beads", "Periapt of Proof against Poison", "Ring of Animal Influence", "Ring of Evasion", "Ring of Feather Falling", "Ring of Free Action", "Ring of Protection", "Ring of Resistance", "Ring of Spell Storing", "Ring of the Ram", "Ring of X-ray Vision", "Robe of Eyes", "Rod of Rulership", "Rod of the Pact Keeper +2", "Rope of Entanglement", "Scimitar of Speed", "Shield +2", "Shield of Missile Attraction", "Staff of Charming", "Staff of Healing", "Staff of Swarming Insects", "Staff of the Woodlands", "Staff of Withering", "Stone of Controlling Earth Elementals", "Sun Blade", "Sword of Life Stealing", "Sword of Wounding", "Tentacle Rod", "Vicious Weapon", "Wand of Binding", "Wand of Enemy Detection", "Wand of Fear", "Wand of Fireballs", "Wand of Lightning Bolts", "Wand of Paralysis", "Wand of the War Mage +2", "Wand of Wonder", "Wings of Flying"],
    H: ["Weapon +3", "Amulet of the Planes", "Carpet of Flying", "Crystal Ball", "Ring of Regeneration", "Ring of Shooting Stars", "Ring of Telekinesis", "Robe of Scintillating Colors", "Robe of Stars", "Rod of Absorption", "Rod of Alertness", "Rod of Security", "Rod of the Pact Keeper +3", "Scimitar of Speed", "Shield +3", "Staff of Fire", "Staff of Frost", "Staff of Power", "Staff of Striking", "Staff of Thunder and Lightning", "Sword of Sharpness", "Wand of Polymorph", "Wand of the War Mage +3", "Adamantine Armor (half plate)", "Adamantine Armor (plate)", "Animated Shield", "Belt of Fire Giant Strength", "Dancing Sword", "Demon Armor", "Dragon Scale Mail", "Dwarven Plate", "Dwarven Thrower", "Efreeti Bottle", "Figurine of Wondrous Power (obsidian steed)", "Frost Brand", "Helm of Brilliance", "Horn of Valhalla (bronze)", "Instrument of the Bards (Anstruth harp)", "Ioun Stone (absorption)", "Ioun Stone (agility)", "Ioun Stone (fortitude)", "Ioun Stone (insight)", "Ioun Stone (intellect)", "Ioun Stone (leadership)", "Ioun Stone (strength)", "Manual of Bodily Health", "Manual of Gainful Exercise", "Manual of Golems", "Manual of Quickness of Action", "Mirror of Life Trapping", "Nine Lives Stealer", "Oathbow", "Spellguard Shield", "Tome of Clear Thought", "Tome of Leadership and Influence", "Tome of Understanding"],
    I: ["Defender", "Hammer of Thunderbolts", "Luck Blade", "Sword of Answering", "Holy Avenger", "Ring of Djinni Summoning", "Ring of Invisibility", "Ring of Spell Turning", "Rod of Lordly Might", "Vorpal Sword", "Belt of Cloud Giant Strength", "Armor +2", "Robe of the Archmagi", "Rod of Resurrection", "Staff of the Magi", "Scarab of Protection", "Cubic Gate", "Deck of Many Things", "Efreeti Chain", "Armor of Invulnerability", "Iron Flask", "Sphere of Annihilation", "Talisman of Pure Good", "Talisman of the Sphere", "Talisman of Ultimate Evil", "Tome of the Stilled Tongue"]
  }
};
