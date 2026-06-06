# Cold Piano

*An olfactive elegy for the Arctic.*

A navigable, single-page visual experience presenting the fragrance composition
**Cold Piano** — an olfactive translation of Ludovico Einaudi's
[“Elegy for the Arctic”](https://www.youtube.com/watch?v=2DLnhdnSUVs), performed
on a floating platform before a glacier in Svalbard.

The site presents the full creative brief, the twelve-material formula, the
dilution-adjusted cost, and the IFRA Category 4 calculation — everything shown.

## The brief

| Constraint | Target | Result |
|---|---|---|
| Maximum raw materials | 12 | **12 / 12** |
| Budget | 60 €/kg | **36.02 €/kg** (40% under) |
| IFRA | Category 4, 10% EDT | **Compliant** — no restricted materials |

## Cost convention

Each material is priced from the raw-material sheet **as-is**, except where
Cold Piano dilutes it further than the sheet's reference dilution — in which case
the price is scaled down by the extra dilution factor:

| Material | Sheet dil. | Used | Adjustment |
|---|---|---|---|
| Calone | 10% | 1% | ÷10 (125 → 12.5) |
| Aldehyde C12 MNA | 1% | 0.1% | ÷10 (18 → 1.8) |
| Rose Oxide | 1% | 0.1% | ÷10 (65 → 6.5) |

`cost in formula (€/kg) = parts × adjusted €/kg ÷ 1000`

## Project structure

```
index.html          markup & section scaffold
assets/
  styles.css        all styling (no framework)
  data.js           the formula, prices, IFRA data + derived figures
  main.js           builds the data-driven sections, scroll behaviour, ice canvas
```

No build step, no dependencies. To edit the formula, change `assets/data.js`;
every table, card, cost figure and IFRA row recomputes automatically.

## Run locally

Any static server works, e.g.:

```bash
python -m http.server 5500
# then open http://localhost:5500
```

## Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `cold-piano`).
2. Push this folder to it (see the commands printed at setup).
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)`.
4. The site goes live at `https://<username>.github.io/cold-piano/`.

## Credits

Composition & concept by the perfumer. The reference performance is Ludovico
Einaudi's “Elegy for the Arctic” for Greenpeace; all visuals here are original
(generative canvas, CSS, type) and do not reproduce the video.
