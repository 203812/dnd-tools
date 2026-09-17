/* ============================================================
   rules.js - reference data: conditions, actions, cover, rest, travel
   Summarised from the SRD 5.1 (CC-BY-4.0).
   ============================================================ */
window.RULES = {

  conditions: [
    { n: "Blinded", p: [
      "You can't see and automatically fail any check that requires sight.",
      "Attack rolls against you have advantage, and your attack rolls have disadvantage."
    ] },
    { n: "Charmed", p: [
      "You can't attack the charmer or target them with harmful abilities or magical effects.",
      "The charmer has advantage on any ability check to interact socially with you."
    ] },
    { n: "Deafened", p: [
      "You can't hear and automatically fail any check that requires hearing."
    ] },
    { n: "Exhaustion", p: [
      "Level 1: disadvantage on ability checks.",
      "Level 2: speed halved.",
      "Level 3: disadvantage on attack rolls and saving throws.",
      "Level 4: hit point maximum halved.",
      "Level 5: speed reduced to 0.",
      "Level 6: death. A long rest removes one level, provided you have food and drink."
    ] },
    { n: "Frightened", p: [
      "Disadvantage on ability checks and attack rolls while the source of your fear is in line of sight.",
      "You can't willingly move closer to the source of your fear."
    ] },
    { n: "Grappled", p: [
      "Your speed becomes 0 and you can't benefit from any bonus to your speed.",
      "Ends if the grappler is incapacitated, or if you are moved out of its reach."
    ] },
    { n: "Incapacitated", p: [
      "You can't take actions or reactions."
    ] },
    { n: "Invisible", p: [
      "You can't be seen without magic or a special sense; your location can still be given away by noise or tracks.",
      "Attack rolls against you have disadvantage, and your attack rolls have advantage."
    ] },
    { n: "Paralyzed", p: [
      "You are incapacitated and can't move or speak.",
      "You automatically fail STR and DEX saves. Attacks against you have advantage.",
      "Any attack that hits you from within 5 feet is a critical hit."
    ] },
    { n: "Petrified", p: [
      "You are transformed into stone: incapacitated, unable to move or speak, and unaware of your surroundings.",
      "Your weight increases tenfold and you stop aging.",
      "Attacks against you have advantage; you automatically fail STR and DEX saves.",
      "You have resistance to all damage and are immune to poison and disease."
    ] },
    { n: "Poisoned", p: [
      "Disadvantage on attack rolls and ability checks."
    ] },
    { n: "Prone", p: [
      "Your only movement option is to crawl, unless you stand up (costing half your speed).",
      "Disadvantage on attack rolls.",
      "Attacks against you have advantage within 5 feet, otherwise disadvantage."
    ] },
    { n: "Restrained", p: [
      "Your speed becomes 0.",
      "Attacks against you have advantage, and your attacks have disadvantage.",
      "Disadvantage on DEX saving throws."
    ] },
    { n: "Stunned", p: [
      "You are incapacitated, can't move, and can speak only falteringly.",
      "You automatically fail STR and DEX saves; attacks against you have advantage."
    ] },
    { n: "Unconscious", p: [
      "You are incapacitated, unaware of your surroundings, drop what you're holding, and fall prone.",
      "You automatically fail STR and DEX saves; attacks against you have advantage.",
      "Any attack that hits you from within 5 feet is a critical hit."
    ] }
  ],

  actions: [
    { n: "Attack", d: "Make one weapon attack (more with Extra Attack). You can split your movement around the attacks." },
    { n: "Cast a Spell", d: "Cast a spell; its casting time determines whether it takes an action, bonus action, or reaction." },
    { n: "Dash", d: "Double your movement for the turn." },
    { n: "Disengage", d: "Your movement doesn't provoke opportunity attacks for the rest of the turn." },
    { n: "Dodge", d: "Attacks against you have disadvantage and you have advantage on DEX saves until your next turn. Lost if you become incapacitated or your speed drops to 0." },
    { n: "Help", d: "Give an ally advantage on their next ability check, or on their next attack against a creature within 5 feet of you." },
    { n: "Hide", d: "Make a DEX (Stealth) check to hide." },
    { n: "Ready", d: "Choose a trigger and a reaction. You maintain concentration on a readied spell." },
    { n: "Search", d: "Devote your attention to finding something: WIS (Perception) or INT (Investigation)." },
    { n: "Use an Object", d: "Interact with an object that requires an action, or use a second object in the same turn." },
    { n: "Grapple (part of Attack)", d: "Athletics contested by the target's Athletics or Acrobatics; on a success the target is grappled." },
    { n: "Shove (part of Attack)", d: "Athletics contested by Athletics or Acrobatics; on a success push the target 5 feet or knock it prone." },
    { n: "Opportunity Attack (reaction)", d: "When a hostile creature leaves your reach, you can make one melee attack against it." },
    { n: "Two-Weapon Fighting (bonus action)", d: "With two light weapons, make one extra attack with the off-hand weapon, adding no ability modifier to the damage unless it is negative." }
  ],

  cover: [
    { n: "Half cover", d: "+2 AC and +2 on DEX saves. For example behind a low wall or another creature." },
    { n: "Three-quarters cover", d: "+5 AC and +5 on DEX saves. For example through an arrow slit or behind a tree trunk." },
    { n: "Total cover", d: "Can't be targeted directly by an attack or spell." }
  ],

  resting: [
    { n: "Short rest", d: "At least 1 hour of light activity. You can spend Hit Dice to regain hit points (roll + CON modifier per die)." },
    { n: "Long rest", d: "At least 8 hours, of which at most 2 hours on watch. You regain all hit points and half your Hit Dice (minimum 1), and lose one level of exhaustion. At most one long rest per 24 hours." }
  ],

  dcs: [
    { dc: 5, n: "Very easy" }, { dc: 10, n: "Easy" }, { dc: 15, n: "Medium" },
    { dc: 20, n: "Hard" }, { dc: 25, n: "Very hard" }, { dc: 30, n: "Nearly impossible" }
  ],

  travel: [
    { pace: "Slow", perHour: "2 miles", perDay: "18 miles", effect: "Able to use stealth while travelling." },
    { pace: "Normal", perHour: "3 miles", perDay: "24 miles", effect: "No special effect." },
    { pace: "Fast", perHour: "4 miles", perDay: "30 miles", effect: "-5 penalty to passive Perception." }
  ],

  hazards: [
    { n: "Falling", d: "1d6 bludgeoning per 10 feet fallen, to a maximum of 20d6. You land prone unless you avoid the damage entirely." },
    { n: "Suffocating", d: "You can hold your breath for 1 + CON modifier minutes (minimum 30 seconds). After that you survive a number of rounds equal to your CON modifier, then drop to 0 hit points." },
    { n: "Burning and lava", d: "Guideline: 10d10 fire damage per turn in lava, 1d10 for a torch or open flame." },
    { n: "Hunger and thirst", d: "Without enough water: one level of exhaustion per day. Without food: one level per day after a number of days equal to 3 + your CON modifier." }
  ],

  /* Which skills belong to which ability */
  skills: [
    { n: "STR", skills: "Athletics" },
    { n: "DEX", skills: "Acrobatics, Sleight of Hand, Stealth" },
    { n: "INT", skills: "Arcana, History, Investigation, Nature, Religion" },
    { n: "WIS", skills: "Animal Handling, Insight, Medicine, Perception, Survival" },
    { n: "CHA", skills: "Deception, Intimidation, Performance, Persuasion" },
    { n: "CON", skills: "no skills - saving throws only" }
  ]
};
