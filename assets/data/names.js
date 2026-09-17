/* ============================================================
   names.js - name lists per ancestry and word lists for places
   ============================================================ */
window.NAMES = {
  ancestries: {
    Human: {
      m: ["Aldric", "Bram", "Cedric", "Darian", "Edmund", "Faelan", "Garrick", "Halvard", "Ivar", "Joren", "Kaspar", "Lucan", "Merrick", "Nolan", "Osric", "Perrin", "Quentin", "Roderick", "Soren", "Tobias", "Ulric", "Varian", "Willem", "Yorick"],
      f: ["Adela", "Brienne", "Cerys", "Dara", "Elowen", "Fenna", "Gwendolyn", "Helena", "Isolde", "Jessa", "Katrien", "Liesel", "Mirela", "Nyssa", "Orla", "Petra", "Rosalind", "Seraphine", "Thalia", "Ursula", "Vera", "Wilhelmina", "Yvette"],
      family: ["Ashdown", "Brackwater", "Coldwell", "Dunmore", "Everhart", "Fairwind", "Greymoor", "Holloway", "Ironwood", "Karsten", "Lockridge", "Marsh", "Northgate", "Oakhurst", "Pellham", "Ravenscroft", "Stonebrook", "Thorne", "Vance", "Winterbourne"]
    },
    Elf: {
      m: ["Adran", "Aelar", "Beiro", "Carric", "Erdan", "Gennal", "Heian", "Immeral", "Ivellios", "Laucian", "Mindartis", "Paelias", "Peren", "Riardon", "Rolen", "Soveliss", "Thamior", "Theren", "Varis"],
      f: ["Adrie", "Althaea", "Anastrianna", "Andraste", "Antinua", "Bethrynna", "Birel", "Caelynn", "Drusilia", "Enna", "Felosial", "Ielenia", "Jelenneth", "Keyleth", "Leshanna", "Lia", "Meriele", "Mialee", "Naivara", "Quelenna", "Sariel", "Shanairra", "Thia", "Valanthe", "Xanaphia"],
      family: ["Amakiir", "Amastacia", "Galanodel", "Holimion", "Ilphelkiir", "Liadon", "Meliamne", "Nailo", "Siannodel", "Xiloscient"]
    },
    Dwarf: {
      m: ["Adrik", "Baern", "Darrak", "Delg", "Eberk", "Fargrim", "Gardain", "Harbek", "Kildrak", "Morgran", "Orsik", "Rangrim", "Rurik", "Taklinn", "Thoradin", "Thorin", "Tordek", "Traubon", "Ulfgar", "Veit"],
      f: ["Amber", "Bardryn", "Diesa", "Eldeth", "Falkrunn", "Gunnloda", "Gurdis", "Helja", "Hlin", "Kathra", "Kristryd", "Ilde", "Liftrasa", "Mardred", "Riswynn", "Sannl", "Torbera", "Vistra"],
      family: ["Balderk", "Battlehammer", "Brawnanvil", "Dankil", "Fireforge", "Frostbeard", "Gorunn", "Holderhek", "Ironfist", "Loderr", "Lutgehr", "Rumnaheim", "Strakeln", "Torunn", "Ungart"]
    },
    Halfling: {
      m: ["Alton", "Ander", "Cade", "Corrin", "Eldon", "Errich", "Finnan", "Garret", "Lindal", "Lyle", "Merric", "Milo", "Osborn", "Perrin", "Reed", "Roscoe", "Wellby"],
      f: ["Andry", "Bree", "Callie", "Cora", "Euphemia", "Jillian", "Kithri", "Lavinia", "Lidda", "Merla", "Nedda", "Paela", "Portia", "Seraphina", "Shaena", "Trym", "Vani", "Verna"],
      family: ["Brushgather", "Goodbarrel", "Greenbottle", "High-hill", "Hilltopple", "Leagallow", "Tealeaf", "Thorngage", "Tosscobble", "Underbough"]
    },
    Gnome: {
      m: ["Alston", "Boddynock", "Brocc", "Burgell", "Dimble", "Eldon", "Erky", "Fonkin", "Frug", "Gerbo", "Gimble", "Glim", "Jebeddo", "Kellen", "Namfoodle", "Roondar", "Seebo", "Sindri", "Warryn", "Zook"],
      f: ["Bimpnottin", "Breena", "Caramip", "Carlin", "Donella", "Duvamil", "Ella", "Ellyjobell", "Loopmottin", "Lorilla", "Mardnab", "Nissa", "Nyx", "Oda", "Orla", "Roywyn", "Shamil", "Tana", "Waywocket", "Zanna"],
      family: ["Beren", "Daergel", "Folkor", "Garrick", "Nackle", "Murnig", "Ningel", "Raulnor", "Scheppen", "Timbers", "Turen"]
    },
    Orc: {
      m: ["Dench", "Feng", "Gell", "Henk", "Holg", "Imsh", "Keth", "Krusk", "Mhurren", "Ront", "Shump", "Thokk", "Ukurg", "Vrakk"],
      f: ["Baggi", "Emen", "Engong", "Kansif", "Myev", "Neega", "Ovak", "Ownka", "Shautha", "Sutha", "Vola", "Volen", "Yevelda"],
      family: ["Bloodtusk", "Ironjaw", "Gorekin", "Skullcleave", "Manghand", "Bonegrinder"]
    },
    Dragonborn: {
      m: ["Arjhan", "Balasar", "Bharash", "Donaar", "Ghesh", "Heskan", "Kriv", "Medrash", "Mehen", "Nadarr", "Pandjed", "Patrin", "Rhogar", "Shamash", "Torinn"],
      f: ["Akra", "Biri", "Daar", "Farideh", "Harann", "Havilar", "Jheri", "Kava", "Korinn", "Mishann", "Nala", "Perra", "Raiann", "Sora", "Surina", "Thava", "Uadjit"],
      family: ["Clethtinthiallor", "Daardendrian", "Delmirev", "Drachedandion", "Kepeshkmolik", "Kerrhylon", "Linxakasendalor", "Myastan", "Prexijandilin", "Shestendeliath", "Turnuroth", "Verthisathurgiesh", "Yarjerit"]
    },
    Tiefling: {
      m: ["Akmenos", "Amnon", "Barakas", "Damakos", "Ekemon", "Iados", "Kairon", "Leucis", "Melech", "Mordai", "Morthos", "Pelaios", "Skamos", "Therai"],
      f: ["Akta", "Anakis", "Bryseis", "Criella", "Damaia", "Ea", "Kallista", "Lerissa", "Makaria", "Nemeia", "Orianna", "Phelaia", "Rieta"],
      family: ["Hope", "Piety", "Regret", "Yearning", "Nemesis", "Truth", "Portent", "Dread", "Sorrow", "Virtue", "Vengeance"]
    },
    "Half-elf": {
      m: ["Corvin", "Elrik", "Fenris", "Jareth", "Kaelen", "Lorien", "Rian", "Sylas", "Talion", "Varen"],
      f: ["Arwyn", "Celia", "Delphine", "Eirlys", "Faye", "Liora", "Maevis", "Nerys", "Sylvaine", "Vaela"],
      family: ["Duskwalker", "Everlight", "Halfmoon", "Silverbrook", "Thornwood", "Winterleaf"]
    },
    "Half-orc": {
      m: ["Brakk", "Drogan", "Gorm", "Haldr", "Karsk", "Morg", "Rurg", "Tharok", "Ugarth", "Zorn"],
      f: ["Brenna", "Grisla", "Hulda", "Karga", "Murna", "Sagra", "Torga", "Urda", "Yelka"],
      family: ["Halfhand", "Strongarm", "Grimjaw", "Stonefist", "Wolfborn"]
    }
  },

  /* --- Parts for place and business names --- */
  tavernAdjective: ["The Drunken", "The Laughing", "The Resting", "The Golden", "The Silver", "The Bleeding", "The Sleeping", "The Dancing", "The Limping", "The Proud", "The Last", "The Green", "The Black", "The Red", "The Lost", "The Thirsty", "The Crooked", "The Merry"],
  tavernBeast: ["Dragon", "Unicorn", "Griffon", "Boar", "Raven", "Wolf", "Bear", "Rooster", "Steed", "Swan", "Fox", "Toad", "Eel", "Gull", "Stag", "Cat", "Nightingale", "Serpent"],
  tavernThing: ["Crown", "Goblet", "Kettle", "Anchor", "Lantern", "Shield", "Axe", "Barrel", "Coin", "Key", "Rose", "Star", "Moon", "Hammer", "Cloak", "Compass", "Feather", "Bell"],

  shopType: ["Smithy", "Apothecary", "Grocery", "Weaponry", "Bookshop", "Alchemist", "Jeweller", "Tannery", "Bakery", "Chandlery", "Tailor", "Pawnshop", "Curiosity Shop", "Stables", "Herbalist"],
  shopAdjective: ["Reliable", "Capable", "Old", "Honest", "Patient", "Inventive", "Renowned", "Thrifty", "Meticulous", "Generous", "Surly", "Helpful"],

  placePrefix: ["North", "South", "East", "West", "High", "Deep", "Stone", "Iron", "Winter", "Summer", "Raven", "Wolf", "Oak", "Mist", "Silver", "Dusk", "Thorn", "Bridge", "Well", "Ash"],
  placeSuffix: ["haven", "burgh", "hold", "dale", "ford", "bridge", "hill", "rest", "wick", "hollow", "march", "brook", "stead", "camp", "garde", "gate", "wood", "cliff"],

  companyPrefix: ["The Iron", "The Silent", "The Golden", "The Grey", "The Lost", "The Shadow", "The Crimson", "The Last", "The Free", "The Whispering"],
  companySuffix: ["Watch", "Talon", "Rose", "Hand", "Brotherhood", "Company", "Order", "Circle", "Oath", "Band", "Fleet", "Fist"]
};
