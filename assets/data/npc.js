/* ============================================================
   npc.js - building blocks for the NPC generator
   ============================================================ */
window.NPC_DATA = {
  occupations: [
    "innkeeper", "blacksmith", "city guard", "farmer", "merchant", "boat captain", "priest", "thief", "bard", "herbalist",
    "hunter", "miller", "fisher", "scribe", "alchemist", "bodyguard", "stablehand", "beggar", "gambler", "courier",
    "miner", "woodcutter", "weaver", "potter", "tanner", "butcher", "brewer", "cartographer", "gravedigger",
    "tax collector", "guild master", "mercenary", "street musician", "fortune teller", "hermit", "rat catcher", "cook", "chronicler"
  ],
  appearance: [
    "a scar straight across one cheek", "strikingly green eyes", "a shaved head", "an unkempt beard",
    "a gold front tooth", "tattoos down both forearms", "one blind eye", "long braided hair",
    "unusually long fingers", "a broken nose", "freckles all over", "a wooden leg",
    "an expensive but threadbare cloak", "mud under the fingernails", "burn scars on one hand", "an earring set with a gem",
    "an unusually deep voice", "a permanent frown", "clothes several sizes too small", "a necklace of animal teeth",
    "thick spectacles with a cracked lens", "hands that never stop trembling", "ink stains on every finger"
  ],
  trait: [
    "talks too much and too fast", "listens far more than they speak", "laughs at the wrong moments",
    "corrects everyone who gets a detail wrong", "avoids eye contact", "touches people while talking",
    "has an anecdote for everything", "counts things out loud", "swears in a language nobody recognises",
    "is exhaustingly polite", "hums while talking", "cannot say no",
    "keeps to a rigid daily routine", "would rather improvise than plan",
    "loves a wager", "reads meaning into every omen", "distrusts anyone who won't drink"
  ],
  ideal: [
    "Honour - a promise given is a promise kept.", "Freedom - chains exist to be broken.",
    "Power - those who don't climb, fall.", "Knowledge - everything is worth understanding.",
    "Community - we are stronger together.", "Justice - the law applies to everyone.",
    "Mercy - everyone deserves a second chance.", "Change - standing still is falling behind.",
    "Profit - every conversation is a negotiation.", "Faith - the gods have a plan.",
    "Self-preservation - a dead hero helps no one.", "Beauty - the world deserves something lovely."
  ],
  bond: [
    "a younger brother who vanished without trace", "the tavern their family held for generations",
    "a debt owed to exactly the wrong people", "a lost locket that belonged to their mother",
    "the town that once cast them out", "an old mentor who is now an enemy",
    "a child who knows nothing of this life", "a grave visited every week",
    "a stolen book they never returned", "an oath sworn to a lord who is long dead",
    "an animal they take everywhere", "a village they failed to save"
  ],
  flaw: [
    "drinks too much when things go wrong", "cannot keep a secret", "is terrified of deep water",
    "gambles away everything", "lies out of sheer habit", "is hopelessly in love with the wrong person",
    "holds a grudge to the grave", "trusts authority blindly", "takes offence easily",
    "faints at the sight of blood", "greedy to the bone", "believes they are irreplaceable",
    "panics around magic", "walks away from every confrontation"
  ],
  secret: [
    "secretly works for the thieves' guild", "is the illegitimate heir to a noble house",
    "killed someone and never admitted it", "is in truth a doppelganger",
    "hides a talent for magic out of fear", "is fleeing an arranged marriage",
    "smuggles goods through the cellar", "keeps the real ledgers somewhere else",
    "is cursed and counting the days", "knows the way to a hidden tomb",
    "has struck a pact with a fey", "forges documents for anyone who pays",
    "spies for a neighbouring realm", "has a relative rotting in the dungeons"
  ],
  voice: [
    "hoarse and cracking", "sing-song with a heavy accent", "soft, almost a whisper",
    "loud and booming", "flat and businesslike", "fast and stammering",
    "slow and deliberate", "friendly but clipped", "nasal and sharp", "warm and low"
  ],
  attitude: [
    { label: "Hostile", w: 2 }, { label: "Suspicious", w: 4 }, { label: "Indifferent", w: 6 },
    { label: "Helpful", w: 4 }, { label: "Friendly", w: 2 }
  ],
  need: [
    "money to settle a debt", "protection from a threat", "information about a disappearance",
    "a courier who asks no questions", "someone to clear out a cellar", "a witness who will stay quiet",
    "a rare ingredient", "help settling a family feud", "passage out of the city, tonight",
    "a stolen item returned", "a recommendation to the guild", "someone to drive off a monster"
  ]
};

/* Tavern details for the name generator */
window.TAVERN_DATA = {
  mood: ["smoky and crowded", "quiet and nearly empty", "rowdy because of a wedding", "cold, the fire has gone out",
    "cosy, someone is playing a lute", "tense, an argument is brewing", "full of travellers who just arrived",
    "dim, most guests are sitting apart"],
  speciality: ["rabbit stewed with carrots", "thick pea soup", "roasted trout", "black bread with sheep's cheese",
    "spiced pork off the spit", "mushroom pie", "smoked eel", "honey cake",
    "strong herbal brandy", "dark ale from the house cellar"],
  trouble: ["the cellar has flooded", "the cook ran off with the takings", "someone is cheating at table three",
    "a guest hasn't paid in three weeks", "the previous owner haunts the taproom",
    "the watch comes by every night to 'inspect'", "something has fallen down the well", "the ale has turned sour"]
};
