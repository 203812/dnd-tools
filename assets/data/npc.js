/* ============================================================
   npc.js - bouwstenen voor de NPC-generator
   ============================================================ */
window.NPC_DATA = {
  beroepen: [
    "herbergier", "smid", "wachter", "boer", "handelaar", "schipper", "priester", "dief", "bard", "kruidenvrouw",
    "jager", "molenaar", "visser", "scribent", "alchemist", "lijfwacht", "stalknecht", "bedelaar", "gokker", "bode",
    "mijnwerker", "houthakker", "wever", "pottenbakker", "leerlooier", "slager", "brouwer", "kaartenmaker", "gravendelver",
    "belastinginner", "gildemeester", "huurling", "straatmuzikant", "waarzegger", "kluizenaar", "ratvanger", "kok", "kroniekschrijver"
  ],
  uiterlijk: [
    "een litteken dwars over de wang", "opvallend groene ogen", "een kaalgeschoren hoofd", "een verwilderde baard",
    "een gouden voortand", "tatoeages op beide onderarmen", "één blind oog", "lange, vlechtige haren",
    "extreem lange vingers", "een gebroken neus", "sproeten over het hele gezicht", "een houten been",
    "een dure maar versleten mantel", "modder onder de nagels", "brandwonden op één hand", "een oorring met een edelsteen",
    "een ongewoon diepe stem", "een permanente frons", "veel te kleine kleren", "een halsketting van dierentanden",
    "een dikke bril met gebarsten glas", "voortdurend trillende handen", "vlekken inkt op de vingers"
  ],
  karaktertrek: [
    "praat te veel en te snel", "luistert meer dan hij zegt", "lacht op ongepaste momenten",
    "corrigeert iedereen die iets fout zegt", "vermijdt oogcontact", "raakt mensen aan bij het praten",
    "vertelt overal een anekdote bij", "telt alles hardop", "vloekt in een vreemde taal",
    "is overdreven beleefd", "neuriet onder het praten", "kan geen nee zeggen",
    "houdt er een strikte dagindeling op na", "improviseert liever dan te plannen",
    "houdt van weddenschappen", "gelooft in elk voorteken", "vertrouwt niemand die niet drinkt"
  ],
  ideaal: [
    "Eer - een woord is een woord.", "Vrijheid - ketenen zijn er om te breken.",
    "Macht - wie niet klimt, valt.", "Kennis - alles is het waard om begrepen te worden.",
    "Gemeenschap - samen sta je sterker.", "Rechtvaardigheid - de wet geldt voor iedereen.",
    "Genade - iedereen verdient een tweede kans.", "Verandering - stilstand is achteruitgang.",
    "Winst - elk gesprek is een onderhandeling.", "Geloof - de goden hebben een plan.",
    "Zelfbehoud - een dode held helpt niemand.", "Schoonheid - de wereld verdient iets moois."
  ],
  band: [
    "een jongere broer die spoorloos is", "de kroeg die zijn familie generaties bezat",
    "een schuld bij de verkeerde mensen", "een verloren medaillon van zijn moeder",
    "de stad die hem ooit uitstootte", "een oude mentor die nu vijand is",
    "een kind dat niets van dit leven weet", "een graf dat elke week bezocht wordt",
    "een gestolen boek dat hij nooit teruggaf", "de eed aan een heer die al dood is",
    "een dier dat hij overal meeneemt", "een dorp dat hij ooit niet kon redden"
  ],
  zwakte: [
    "drinkt te veel als het tegenzit", "kan geen geheim bewaren", "is doodsbang voor water",
    "gokt alles weg", "liegt uit gewoonte", "is hopeloos verliefd op de verkeerde persoon",
    "houdt wrok tot in het graf", "vertrouwt autoriteit blindelings", "is snel beledigd",
    "kan niet tegen bloed", "hebzuchtig tot op het bot", "gelooft dat hij onmisbaar is",
    "raakt in paniek bij magie", "loopt weg van elk conflict"
  ],
  geheim: [
    "werkt in het geheim voor de dievengilde", "is de onwettige erfgenaam van een adellijk huis",
    "heeft iemand vermoord en het nooit toegegeven", "is in werkelijkheid een doppelganger",
    "verbergt een magisch talent uit angst", "is op de vlucht voor een huwelijk",
    "smokkelt goederen via de kelder", "houdt de echte belastingboeken apart",
    "is vervloekt en telt de dagen", "kent de weg naar een verborgen tombe",
    "heeft een pact met een fey gesloten", "vervalst documenten voor wie betaalt",
    "spioneert voor een naburig rijk", "heeft een familielid in de kerker zitten"
  ],
  stem: [
    "hees en krakend", "zangerig met een zwaar accent", "zacht, bijna fluisterend",
    "luid en bulderend", "monotoon en zakelijk", "snel en hakkelend",
    "traag en bedachtzaam", "vriendelijk maar afgemeten", "nasaal en scherp", "warm en laag"
  ],
  houding: [
    { label: "Vijandig", w: 2 }, { label: "Wantrouwig", w: 4 }, { label: "Onverschillig", w: 6 },
    { label: "Behulpzaam", w: 4 }, { label: "Hartelijk", w: 2 }
  ],
  behoefte: [
    "geld voor een schuld", "bescherming tegen een bedreiging", "informatie over een verdwijning",
    "een koerier die niets vraagt", "iemand die een kelder leeghaalt", "een getuige die zwijgt",
    "een zeldzaam ingrediënt", "hulp bij een familieruzie", "vervoer uit de stad, vannacht nog",
    "een gestolen voorwerp terug", "een aanbeveling bij het gilde", "iemand die een monster verjaagt"
  ]
};

/* Herbergdetails voor de naamgenerator */
window.TAVERN_DATA = {
  sfeer: ["rokerig en druk", "stil en bijna leeg", "luidruchtig door een bruiloft", "kil, het vuur is uit",
    "gezellig, iemand speelt luit", "gespannen, er hangt ruzie in de lucht", "vol reizigers die net aankwamen",
    "schemerig, de meeste gasten zitten apart"],
  specialiteit: ["gestoofd konijn met wortel", "dikke erwtensoep", "geroosterde forel", "zwart brood met schapenkaas",
    "gekruid varkensvlees aan het spit", "paddenstoelenpastei", "gerookte aal", "honingkoek",
    "sterke kruidenbrandewijn", "donker bier uit eigen kelder"],
  probleem: ["de kelder is ondergelopen", "de kok is er vandoor met het geld", "er wordt vals gespeeld aan tafel drie",
    "een gast betaalt al drie weken niet", "de vorige eigenaar spookt in de gelagkamer",
    "de wacht komt elke avond 'controleren'", "er is iets in de put gevallen", "het bier is zuur geworden"]
};
