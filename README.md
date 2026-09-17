# DnD Tools

Gratis hulpmiddelen voor spelers en Dungeon Masters van Dungeons & Dragons 5e,
in de geest van dndtools.net en dndtools.online. Statische site: geen build-stap,
geen framework, geen server nodig.

## Starten

Dubbelklik `index.html`, of draai een lokale server voor de nette variant:

```bash
python -m http.server 8080
# http://127.0.0.1:8080
```

## De tools

| Tool | Bestand | Wat het doet |
| --- | --- | --- |
| Dobbelsteenroller | `tools/dice.html` | Volledige notatie, geschiedenis, presets |
| Initiatief-tracker | `tools/initiative.html` | Initiatief, HP, condities, rondes; slaat op |
| Encounter builder | `tools/encounter.html` | XP-budget en moeilijkheidsgraad per party |
| Monsterboek | `tools/monsters.html` | 60 statblocks met filters |
| Spreukenlijst | `tools/spells.html` | 83 spreuken met filters op niveau/klasse/school |
| Schatgenerator | `tools/loot.html` | Munten, edelstenen, kunst en magische items |
| NPC-generator | `tools/npc.html` | Complete NPC inclusief geheim en scores |
| Naamgenerator | `tools/names.html` | Namen per volk, herbergen, dorpen, gezelschappen |
| Ability scores | `tools/abilities.html` | Point buy, standard array, 4d6 drop lowest |
| Regelnaslag | `tools/rules.html` | Condities, acties, dekking, rust, reizen |

De tools praten met elkaar: vanuit het monsterboek en de encounter builder zet je
monsters met één klik in de initiatief-tracker, en de builder rolt de bijpassende buit.

## Dobbelsteennotatie

| Schrijfwijze | Betekenis |
| --- | --- |
| `1d20+5` | d20 met modifier |
| `adv` / `dis` | advantage / disadvantage |
| `4d6kh3` / `4d6kl1` | hoogste 3 / laagste 1 houden |
| `4d6dl1` / `4d6dh1` | laagste / hoogste laten vallen |
| `8d6!` | exploderend: een maximum rolt door |
| `4d6r1` / `4d6ro1` | 1'en hergooien (altijd / één keer) |
| `2d10min2` / `2d10max8` | ondergrens / bovengrens per worp |
| `(2d6+3)*2` | haakjes en rekenen |
| `1d%` / `4dF` | percentiel / Fudge-dobbelstenen |
| `6#1d20+3` | zes losse worpen |

## Structuur

```
index.html
tools/            de tien toolpagina's
assets/css/       één stylesheet, donker en licht thema
assets/js/        core.js (nav, thema, helpers) en dice.js (parser)
assets/js/pages/  één script per toolpagina
assets/data/      monsters, spreuken, namen, NPC-bouwstenen, schatten, regels
```

Navigatie en footer worden door `core.js` op elke pagina ingevoegd; het
toolregister bovenin dat bestand is de enige plek waar je een tool hoeft toe
te voegen.

## Data uitbreiden

De datamappen zijn gewone JS-bestanden die een globale variabele zetten
(`window.MONSTERS`, `window.SPELLS`, ...). Nieuwe monsters of spreuken voeg je
toe door een object aan de array te hangen; de filters en tellers passen zich
vanzelf aan. Geen fetch, dus alles werkt ook vanaf `file://`.

## Speldata

Monsters, spreuken en regels komen uit de SRD 5.1 van Wizards of the Coast,
beschikbaar onder CC-BY-4.0. De spreukbeschrijvingen zijn beknopte Nederlandse
samenvattingen, geen volledige vertalingen. De munttabellen in de schatgenerator
volgen de DMG-tabellen; de verdeling van edelstenen, kunst en magische items is
een vereenvoudigde variant met gewogen kansen in plaats van percentielrijen.

Dit is geen officieel Wizards-product.
