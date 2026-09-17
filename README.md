# DnD Tools

Free tools for players and Dungeon Masters of Dungeons & Dragons 5e, in the spirit of
dndtools.net and dndtools.online. A static site: no build step, no framework, no server
required.

**Live:** https://203812.github.io/dnd-tools/

## Running it locally

Serve the folder and open it in a browser:

```bash
python -m http.server 8080
# http://127.0.0.1:8080
```

Opening `index.html` directly works too, but some browsers refuse `localStorage` on
`file://` origins, so saved fights, maps and calendars may not survive a refresh that way.

## The tools

### Combat
| Tool | File | What it does |
| --- | --- | --- |
| Initiative Tracker | `tools/initiative.html` | Initiative order, hit points, temp HP, concentration, conditions, inline stat blocks |
| Encounter Builder | `tools/encounter.html` | XP budget and difficulty, environment filter, random encounter to a chosen difficulty |
| Battle Map | `tools/battlemap.html` | Map image, snapping grid, tokens, fog of war, distance measuring, pings |
| Bestiary | `tools/monsters.html` | 60 stat blocks with filters for CR, type and environment |

### Dice
| Tool | File | What it does |
| --- | --- | --- |
| Dice Roller | `tools/dice.html` | Full notation, roll history, presets |
| Dice Probability | `tools/probability.html` | Exact distributions, averages, chance to beat a target, attack and DPR maths |

### Reference
| Tool | File | What it does |
| --- | --- | --- |
| Spell List | `tools/spells.html` | 83 spells filtered by level, class and school |
| Rules Reference | `tools/rules.html` | Conditions, actions, cover, hazards, resting, travel |
| DM Screen | `tools/screen.html` | A dashboard of twelve panels you pick and arrange yourself |

### Generators
| Tool | File | What it does |
| --- | --- | --- |
| NPC Generator | `tools/npc.html` | A full NPC including a secret and ability scores |
| Name Generator | `tools/names.html` | Names by ancestry, taverns, villages, companies |
| Treasure Generator | `tools/loot.html` | Coins, gems, art objects and magic items by CR |
| Token Maker | `tools/tokens.html` | Crop any picture into a bordered token, ready for the map or the printer |
| Ability Scores | `tools/abilities.html` | Point buy, standard array, 4d6 drop lowest |

### At the table
| Tool | File | What it does |
| --- | --- | --- |
| Campaign Calendar | `tools/calendar.html` | Custom months and moons, event journal, time tracking, weather by climate |
| Ambience Mixer | `tools/ambience.html` | Twelve procedurally generated sound channels plus your own audio files |

The tools talk to each other: send monsters from the bestiary or the encounter builder into the
initiative tracker, push a whole fight onto the battle map, drop a freshly made token straight
onto that map, and let the builder roll the matching loot.

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
tools/            the sixteen tool pages
assets/css/       one stylesheet, dark and light themes
assets/js/        core.js (nav, theme, helpers), dice.js (parser),
                  prob.js (distributions), ambience.js (Web Audio)
assets/js/pages/  one script per tool page
assets/data/      monsters, spells, names, NPC blocks, treasure, rules, calendar
```

Navigation and footer are injected by `core.js` on every page. The tool registry at the top of
that file is the only place you need to touch to add a tool: it drives the category menus in the
header and the cards on the home page.

## Extending the data

The data files are plain JS files that set a global (`window.MONSTERS`, `window.SPELLS`, ...).
Add a monster or spell by appending an object to the array; the filters and counters adjust
themselves. No fetch is involved, so the data also loads straight from disk.

## Notes on the borrowed ideas

The battle map takes its cues from Owlbear Rodeo but runs on a single screen: there is no server
behind this site, so players cannot join from their own devices. It is built for a laptop at the
table or for sharing your screen on a call.

The ambience mixer is inspired by Syrinscape, but where that service ships professionally recorded
audio, every channel here is synthesised live with the Web Audio API. That costs nothing and works
offline; it also sounds like what it is.

The probability tool follows AnyDice. Plain sums are convolved and keep/drop terms are enumerated
over every combination of faces, so those answers are exact. Exploding dice, rerolls and very large
pools fall back to simulating 200,000 rolls, and the interface says which method produced the
numbers.

## Game data

Monsters, spells and rules come from the SRD 5.1 by Wizards of the Coast, available under
CC-BY-4.0. Spell descriptions are condensed summaries rather than the full text. The coin tables
in the treasure generator follow the DMG tables; the distribution of gems, art objects and magic
items is a simplified variant using weighted chances instead of percentile rows.

This is not an official Wizards product.
