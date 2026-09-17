/* ============================================================
   names.js - naamlijsten per volk en woordenlijsten voor plaatsen
   ============================================================ */
window.NAMES = {
  volken: {
    Mens: {
      m: ["Aldric", "Bram", "Cedric", "Darian", "Edmund", "Faelan", "Garrick", "Halvard", "Ivar", "Joren", "Kaspar", "Lucan", "Merrick", "Nolan", "Osric", "Perrin", "Quentin", "Roderick", "Soren", "Tobias", "Ulric", "Varian", "Willem", "Yorick"],
      v: ["Adela", "Brienne", "Cerys", "Dara", "Elowen", "Fenna", "Gwendolyn", "Helena", "Isolde", "Jessa", "Katrien", "Liesel", "Mirela", "Nyssa", "Orla", "Petra", "Rosalind", "Seraphine", "Thalia", "Ursula", "Vera", "Wilhelmina", "Yvette"],
      achter: ["Ashdown", "Brackwater", "Coldwell", "Dunmore", "Everhart", "Fairwind", "Greymoor", "Holloway", "Ironwood", "Karsten", "Lockridge", "Marsh", "Northgate", "Oakhurst", "Pellham", "Ravenscroft", "Stonebrook", "Thorne", "Vance", "Winterbourne"]
    },
    Elf: {
      m: ["Adran", "Aelar", "Beiro", "Carric", "Erdan", "Gennal", "Heian", "Immeral", "Ivellios", "Laucian", "Mindartis", "Paelias", "Peren", "Riardon", "Rolen", "Soveliss", "Thamior", "Theren", "Varis"],
      v: ["Adrie", "Althaea", "Anastrianna", "Andraste", "Antinua", "Bethrynna", "Birel", "Caelynn", "Drusilia", "Enna", "Felosial", "Ielenia", "Jelenneth", "Keyleth", "Leshanna", "Lia", "Meriele", "Mialee", "Naivara", "Quelenna", "Sariel", "Shanairra", "Thia", "Valanthe", "Xanaphia"],
      achter: ["Amakiir", "Amastacia", "Galanodel", "Holimion", "Ilphelkiir", "Liadon", "Meliamne", "Naïlo", "Siannodel", "Xiloscient"]
    },
    Dwerg: {
      m: ["Adrik", "Baern", "Darrak", "Delg", "Eberk", "Fargrim", "Gardain", "Harbek", "Kildrak", "Morgran", "Orsik", "Rangrim", "Rurik", "Taklinn", "Thoradin", "Thorin", "Tordek", "Traubon", "Ulfgar", "Veit"],
      v: ["Amber", "Bardryn", "Diesa", "Eldeth", "Falkrunn", "Gunnloda", "Gurdis", "Helja", "Hlin", "Kathra", "Kristryd", "Ilde", "Liftrasa", "Mardred", "Riswynn", "Sannl", "Torbera", "Vistra"],
      achter: ["Balderk", "Battlehammer", "Brawnanvil", "Dankil", "Fireforge", "Frostbeard", "Gorunn", "Holderhek", "Ironfist", "Loderr", "Lutgehr", "Rumnaheim", "Strakeln", "Torunn", "Ungart"]
    },
    Halfling: {
      m: ["Alton", "Ander", "Cade", "Corrin", "Eldon", "Errich", "Finnan", "Garret", "Lindal", "Lyle", "Merric", "Milo", "Osborn", "Perrin", "Reed", "Roscoe", "Wellby"],
      v: ["Andry", "Bree", "Callie", "Cora", "Euphemia", "Jillian", "Kithri", "Lavinia", "Lidda", "Merla", "Nedda", "Paela", "Portia", "Seraphina", "Shaena", "Trym", "Vani", "Verna"],
      achter: ["Brushgather", "Goodbarrel", "Greenbottle", "High-hill", "Hilltopple", "Leagallow", "Tealeaf", "Thorngage", "Tosscobble", "Underbough"]
    },
    Gnoom: {
      m: ["Alston", "Boddynock", "Brocc", "Burgell", "Dimble", "Eldon", "Erky", "Fonkin", "Frug", "Gerbo", "Gimble", "Glim", "Jebeddo", "Kellen", "Namfoodle", "Roondar", "Seebo", "Sindri", "Warryn", "Zook"],
      v: ["Bimpnottin", "Breena", "Caramip", "Carlin", "Donella", "Duvamil", "Ella", "Ellyjobell", "Loopmottin", "Lorilla", "Mardnab", "Nissa", "Nyx", "Oda", "Orla", "Roywyn", "Shamil", "Tana", "Waywocket", "Zanna"],
      achter: ["Beren", "Daergel", "Folkor", "Garrick", "Nackle", "Murnig", "Ningel", "Raulnor", "Scheppen", "Timbers", "Turen"]
    },
    Ork: {
      m: ["Dench", "Feng", "Gell", "Henk", "Holg", "Imsh", "Keth", "Krusk", "Mhurren", "Ront", "Shump", "Thokk", "Ukurg", "Vrakk"],
      v: ["Baggi", "Emen", "Engong", "Kansif", "Myev", "Neega", "Ovak", "Ownka", "Shautha", "Sutha", "Vola", "Volen", "Yevelda"],
      achter: ["Bloodtusk", "Ironjaw", "Gorekin", "Skullcleave", "Manghand", "Bonegrinder"]
    },
    Dragonborn: {
      m: ["Arjhan", "Balasar", "Bharash", "Donaar", "Ghesh", "Heskan", "Kriv", "Medrash", "Mehen", "Nadarr", "Pandjed", "Patrin", "Rhogar", "Shamash", "Torinn"],
      v: ["Akra", "Biri", "Daar", "Farideh", "Harann", "Havilar", "Jheri", "Kava", "Korinn", "Mishann", "Nala", "Perra", "Raiann", "Sora", "Surina", "Thava", "Uadjit"],
      achter: ["Clethtinthiallor", "Daardendrian", "Delmirev", "Drachedandion", "Kepeshkmolik", "Kerrhylon", "Linxakasendalor", "Myastan", "Prexijandilin", "Shestendeliath", "Turnuroth", "Verthisathurgiesh", "Yarjerit"]
    },
    Tiefling: {
      m: ["Akmenos", "Amnon", "Barakas", "Damakos", "Ekemon", "Iados", "Kairon", "Leucis", "Melech", "Mordai", "Morthos", "Pelaios", "Skamos", "Therai"],
      v: ["Akta", "Anakis", "Bryseis", "Criella", "Damaia", "Ea", "Kallista", "Lerissa", "Makaria", "Nemeia", "Orianna", "Phelaia", "Rieta"],
      achter: ["Hoop", "Vroomheid", "Berouw", "Verlangen", "Nemesis", "Waarheid", "Voorteken", "Vrees", "Zorg", "Deugd", "Wraak"]
    },
    Halfelf: {
      m: ["Corvin", "Elrik", "Fenris", "Jareth", "Kaelen", "Lorien", "Rian", "Sylas", "Talion", "Varen"],
      v: ["Arwyn", "Celia", "Delphine", "Eirlys", "Faye", "Liora", "Maevis", "Nerys", "Sylvaine", "Vaela"],
      achter: ["Duskwalker", "Everlight", "Halfmoon", "Silverbrook", "Thornwood", "Winterleaf"]
    },
    Halfork: {
      m: ["Brakk", "Drogan", "Gorm", "Haldr", "Karsk", "Morg", "Rurg", "Tharok", "Ugarth", "Zorn"],
      v: ["Brenna", "Grisla", "Hulda", "Karga", "Murna", "Sagra", "Torga", "Urda", "Yelka"],
      achter: ["Halfhand", "Strongarm", "Grimjaw", "Steenvuist", "Wolfsbroed"]
    }
  },

  /* --- Onderdelen voor plaats- en zaaknamen --- */
  herbergVoor: ["De Dronken", "De Lachende", "De Rustende", "De Gouden", "De Zilveren", "De Bloedende", "De Slapende", "De Dansende", "De Kreupele", "De Trotse", "De Laatste", "De Groene", "De Zwarte", "De Rode", "Het Verloren", "Het Dorstige", "Het Kromme", "De Vrolijke"],
  herbergDier: ["Draak", "Eenhoorn", "Griffioen", "Everzwijn", "Raaf", "Wolf", "Beer", "Haan", "Ros", "Zwaan", "Vos", "Pad", "Aal", "Meeuw", "Hert", "Kat", "Nachtegaal", "Slang"],
  herbergDing: ["Kroon", "Beker", "Ketel", "Anker", "Lantaarn", "Schild", "Bijl", "Vat", "Munt", "Sleutel", "Roos", "Ster", "Maan", "Hamer", "Mantel", "Kompas", "Veer", "Klok"],

  winkelType: ["Smederij", "Apotheek", "Kruidenier", "Wapenhandel", "Boekhandel", "Alchemist", "Juwelier", "Leerlooier", "Bakkerij", "Kaarsenmakerij", "Kleermaker", "Pandjeshuis", "Curiosazaak", "Stalhouderij", "Herbalist"],
  winkelBijvoeglijk: ["Betrouwbare", "Bekwame", "Oude", "Eerlijke", "Geduldige", "Vindingrijke", "Vermaarde", "Zuinige", "Nauwgezette", "Gulle", "Norse", "Behulpzame"],

  plaatsVoor: ["Noord", "Zuid", "Oost", "West", "Hoog", "Diep", "Steen", "IJzer", "Winter", "Zomer", "Raven", "Wolf", "Eik", "Mist", "Zilver", "Schemer", "Doorn", "Brug", "Bron", "As"],
  plaatsAchter: ["haven", "burg", "veste", "dal", "voorde", "brug", "heuvel", "rust", "wijk", "hoven", "marke", "beek", "stede", "kamp", "gaard", "poort", "woud", "klif"],

  gezelschapVoor: ["De IJzeren", "De Stille", "De Gouden", "De Grijze", "De Verloren", "De Schaduw", "De Karmozijnen", "De Laatste", "De Vrije", "De Zwijgende"],
  gezelschapAchter: ["Wacht", "Klauw", "Roos", "Hand", "Broederschap", "Compagnie", "Orde", "Kring", "Eed", "Bende", "Vloot", "Vuist"]
};
