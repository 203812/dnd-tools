# DnD Tools

Free tools for players and Dungeon Masters of Dungeons & Dragons 5e, in the spirit of
dndtools.net and dndtools.online. A static site: no build step, no framework, no server
required.

**Live:** https://203812.github.io/dnd-tools/

## Running it locally

Open `index.html` directly, or serve the folder for the tidier version:

```bash
python -m http.server 8080
# http://127.0.0.1:8080
```

## The tools

| Tool | File | What it does |
| --- | --- | --- |
| Dice Roller | `tools/dice.html` | Full notation, roll history, presets |
| Initiative Tracker | `tools/initiative.html` | Initiative, hit points, conditions, rounds; saves automatically |
| Encounter Builder | `tools/encounter.html` | XP budget and difficulty per party |
| Bestiary | `tools/monsters.html` | 60 stat blocks with filters |
| Spell List | `tools/spells.html` | 83 spells filtered by level, class and school |
| Treasure Generator | `tools/loot.html` | Coins, gems, art objects and magic items |
| NPC Generator | `tools/npc.html` | A full NPC including a secret and ability scores |
| Name Generator | `tools/names.html` | Names by ancestry, taverns, villages, companies |
| Ability Scores | `tools/abilities.html` | Point buy, standard array, 4d6 drop lowest |
| Rules Reference | `tools/rules.html` | Conditions, actions, cover, resting, travel |

The tools talk to each other: send monsters from the bestiary or the encounter builder
straight into the initiative tracker with one click, and let the builder roll the matching loot.

## Dice notation

| Written as | Meaning |
| --- | --- |
| `1d20+5` | d20 with a modifier |
| `adv` / `dis` | advantage / disadvantage |
| `4d6kh3` / `4d6kl1` | keep the highest 3 / lowest 1 |
| `4d6dl1` / `4d6dh1` | drop the lowest / highest |
| `8d6!` | exploding: a maximum rolls again |
| `4d6r1` / `4d6ro1` | reroll 1s (always / once) |
| `2d10min2` / `2d10max8` | floor / ceiling per die |
| `(2d6+3)*2` | brackets and arithmetic |
| `1d%` / `4dF` | percentile / Fudge dice |
| `6#1d20+3` | six separate rolls |

## Structure

```
index.html
tools/            the ten tool pages
assets/css/       one stylesheet, dark and light themes
assets/js/        core.js (nav, theme, helpers) and dice.js (parser)
assets/js/pages/  one script per tool page
assets/data/      monsters, spells, names, NPC building blocks, treasure, rules
```

Navigation and footer are injected by `core.js` on every page; the tool registry at the top
of that file is the only place you need to touch to add a tool.

## Extending the data

The data files are plain JS files that set a global (`window.MONSTERS`, `window.SPELLS`, ...).
Add a monster or spell by appending an object to the array; the filters and counters adjust
themselves. No fetch is involved, so everything also works straight from `file://`.

## Game data

Monsters, spells and rules come from the SRD 5.1 by Wizards of the Coast, available under
CC-BY-4.0. Spell descriptions are condensed summaries rather than the full text. The coin
tables in the treasure generator follow the DMG tables; the distribution of gems, art objects
and magic items is a simplified variant using weighted chances instead of percentile rows.

This is not an official Wizards product.
