/* ============================================================
   rules.js - naslagdata: condities, acties, dekking, rust, reizen
   Samengevat uit de SRD 5.1 (CC-BY-4.0).
   ============================================================ */
window.RULES = {

  condities: [
    { n: "Blinded", nl: "Verblind", p: [
      "Je kunt niet zien en faalt automatisch elke check waarvoor zicht nodig is.",
      "Aanvalsworpen tegen jou hebben advantage, jouw aanvalsworpen hebben disadvantage."
    ] },
    { n: "Charmed", nl: "Betoverd", p: [
      "Je kunt de betoveraar niet aanvallen en hem niet als doel kiezen voor schadelijke effecten.",
      "De betoveraar heeft advantage op CHA-checks om sociaal met je om te gaan."
    ] },
    { n: "Deafened", nl: "Doof", p: [
      "Je kunt niet horen en faalt automatisch elke check waarvoor gehoor nodig is."
    ] },
    { n: "Exhaustion", nl: "Uitputting", p: [
      "Niveau 1: disadvantage op ability checks.",
      "Niveau 2: snelheid gehalveerd.",
      "Niveau 3: disadvantage op aanvalsworpen en saving throws.",
      "Niveau 4: HP-maximum gehalveerd.",
      "Niveau 5: snelheid tot 0.",
      "Niveau 6: dood. Een lange rust verwijdert één niveau, mits je eet en drinkt."
    ] },
    { n: "Frightened", nl: "Bang", p: [
      "Disadvantage op ability checks en aanvalsworpen zolang de bron van je angst in zicht is.",
      "Je kunt niet vrijwillig dichter naar de bron toe bewegen."
    ] },
    { n: "Grappled", nl: "Vastgegrepen", p: [
      "Je snelheid wordt 0 en je kunt niet profiteren van bonussen op snelheid.",
      "Eindigt als de grijper incapacitated raakt of als jullie uit elkaars bereik worden gehaald."
    ] },
    { n: "Incapacitated", nl: "Uitgeschakeld", p: [
      "Je kunt geen acties of reacties uitvoeren."
    ] },
    { n: "Invisible", nl: "Onzichtbaar", p: [
      "Je bent niet te zien zonder magie of een speciaal zintuig; je positie kan verraden worden door geluid of sporen.",
      "Aanvalsworpen tegen jou hebben disadvantage, jouw aanvalsworpen hebben advantage."
    ] },
    { n: "Paralyzed", nl: "Verlamd", p: [
      "Je bent incapacitated, kunt niet bewegen of spreken.",
      "Je faalt automatisch STR- en DEX-saves. Aanvallen tegen jou hebben advantage.",
      "Elke treffer binnen 5 ft. is automatisch een critical hit."
    ] },
    { n: "Petrified", nl: "Versteend", p: [
      "Je bent veranderd in steen: incapacitated, je kunt niet bewegen of spreken en bent je omgeving niet bewust.",
      "Je gewicht wordt tien keer zo groot en je veroudert niet.",
      "Aanvallen tegen jou hebben advantage; je faalt STR- en DEX-saves automatisch.",
      "Je hebt resistance tegen alle schade en bent immuun voor vergif en ziekte."
    ] },
    { n: "Poisoned", nl: "Vergiftigd", p: [
      "Disadvantage op aanvalsworpen en ability checks."
    ] },
    { n: "Prone", nl: "Liggend", p: [
      "Je kunt alleen kruipen, tenzij je opstaat (kost de helft van je snelheid).",
      "Disadvantage op aanvalsworpen.",
      "Aanvallen tegen jou hebben advantage binnen 5 ft., anders disadvantage."
    ] },
    { n: "Restrained", nl: "Beknot", p: [
      "Je snelheid wordt 0.",
      "Aanvallen tegen jou hebben advantage, jouw aanvallen hebben disadvantage.",
      "Disadvantage op DEX-saves."
    ] },
    { n: "Stunned", nl: "Verdoofd", p: [
      "Je bent incapacitated, kunt niet bewegen en spreekt alleen haperend.",
      "Je faalt automatisch STR- en DEX-saves; aanvallen tegen jou hebben advantage."
    ] },
    { n: "Unconscious", nl: "Bewusteloos", p: [
      "Je bent incapacitated, bewust van niets, laat alles vallen en valt prone.",
      "Je faalt automatisch STR- en DEX-saves; aanvallen tegen jou hebben advantage.",
      "Elke treffer binnen 5 ft. is een critical hit."
    ] }
  ],

  acties: [
    { n: "Attack", d: "Eén wapenaanval (meer met Extra Attack). Je mag je beweging over de aanvallen verdelen." },
    { n: "Cast a Spell", d: "Spreek een spreuk uit; de casting time bepaalt of het een actie, bonusactie of reactie is." },
    { n: "Dash", d: "Verdubbel je beweging voor deze beurt." },
    { n: "Disengage", d: "Je beweging lokt deze beurt geen opportunity attacks uit." },
    { n: "Dodge", d: "Aanvallen tegen jou hebben disadvantage en je hebt advantage op DEX-saves tot je volgende beurt. Vervalt als je incapacitated raakt of je snelheid 0 wordt." },
    { n: "Help", d: "Geef een bondgenoot advantage op zijn volgende check, of op zijn volgende aanval tegen een vijand binnen 5 ft. van jou." },
    { n: "Hide", d: "Doe een DEX (Stealth)-check om je te verbergen." },
    { n: "Ready", d: "Kies een trigger en een reactie. Je houdt concentratie vast op een voorbereide spreuk." },
    { n: "Search", d: "Zoek actief: WIS (Perception) of INT (Investigation)." },
    { n: "Use an Object", d: "Bedien een voorwerp dat een actie vergt, of gebruik een tweede voorwerp in dezelfde beurt." },
    { n: "Grapple (deel van Attack)", d: "Athletics tegen Athletics of Acrobatics van het doel; bij succes is het grappled." },
    { n: "Shove (deel van Attack)", d: "Athletics tegen Athletics of Acrobatics; bij succes 5 ft. wegduwen of prone maken." },
    { n: "Opportunity Attack (reactie)", d: "Als een vijand je bereik uit beweegt, mag je één melee-aanval doen." },
    { n: "Two-Weapon Fighting (bonusactie)", d: "Met twee lichte wapens: één extra aanval met de offhand, zonder ability-modifier op de schade (tenzij negatief)." }
  ],

  dekking: [
    { n: "Halve dekking", d: "+2 AC en +2 op DEX-saves. Bijvoorbeeld achter een laag muurtje of een ander wezen." },
    { n: "Driekwart dekking", d: "+5 AC en +5 op DEX-saves. Bijvoorbeeld door een schietgat of achter een boomstam." },
    { n: "Volledige dekking", d: "Kan niet direct als doel gekozen worden." }
  ],

  rusten: [
    { n: "Korte rust", d: "Minstens 1 uur licht bezig. Je mag Hit Dice uitgeven om HP te herstellen (worp + CON-modifier per die)." },
    { n: "Lange rust", d: "Minstens 8 uur, waarvan hooguit 2 uur wacht lopen. Je herstelt al je HP en de helft van je Hit Dice (minimaal 1), en verliest één niveau exhaustion. Maximaal één lange rust per 24 uur." }
  ],

  dcs: [
    { dc: 5, n: "Heel makkelijk" }, { dc: 10, n: "Makkelijk" }, { dc: 15, n: "Gemiddeld" },
    { dc: 20, n: "Lastig" }, { dc: 25, n: "Heel lastig" }, { dc: 30, n: "Bijna onmogelijk" }
  ],

  reizen: [
    { tempo: "Langzaam", perUur: "2 mijl", perDag: "18 mijl", effect: "Kan tijdens het reizen sluipen (Stealth)." },
    { tempo: "Normaal", perUur: "3 mijl", perDag: "24 mijl", effect: "Geen bijzonderheden." },
    { tempo: "Snel", perUur: "4 mijl", perDag: "30 mijl", effect: "-5 op passieve Perception." }
  ],

  vallen: [
    { n: "Vallen", d: "1d6 bludgeoning per 10 ft. gevallen, maximaal 20d6. Je landt prone tenzij je de schade volledig vermijdt." },
    { n: "Verstikking", d: "Je kunt je adem 1 + CON-modifier minuten inhouden (minimaal 30 seconden). Daarna hou je nog CON-modifier rondes vol en val je dan naar 0 HP." },
    { n: "Verbranden/lava", d: "Richtlijn: 10d10 vuurschade per beurt in lava, 1d10 voor een fakkel of open vuur." },
    { n: "Honger en dorst", d: "Zonder genoeg water: één niveau exhaustion per dag. Zonder eten: één niveau per dag na een aantal dagen gelijk aan 3 + CON-modifier." }
  ],

  /* Snelle DC- en aanvalsrichtlijnen per gemiddeld partyniveau */
  vaardigheden: [
    { n: "STR", skills: "Athletics" },
    { n: "DEX", skills: "Acrobatics, Sleight of Hand, Stealth" },
    { n: "INT", skills: "Arcana, History, Investigation, Nature, Religion" },
    { n: "WIS", skills: "Animal Handling, Insight, Medicine, Perception, Survival" },
    { n: "CHA", skills: "Deception, Intimidation, Performance, Persuasion" },
    { n: "CON", skills: "geen vaardigheden - alleen saving throws" }
  ]
};
