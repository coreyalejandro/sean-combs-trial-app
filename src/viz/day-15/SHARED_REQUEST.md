# Shared requests from Builder 3 (Days 15 to 21)

Nothing here blocks Days 15 to 21; each is worked around inside the day folders. The scaffold owner decides.

1. **Sources from other days on the page's sources panel.** Days 16 to 21 draw facts from other days and from
   `additions.json`, but `SourcesPanel` lists only `day.sources`. To keep every `data-source-ids` anchor
   resolvable, each picture renders its own list ("Also drawn from other days and added facts",
   `src/viz/day-15/kit/sources.tsx`, `ExtraSources`), folded into a `<details>` when long. Request: let a day
   module export extra sources (for example `meta.extraSources` or an `extraSources(day)` function) and have
   `SourcesPanel` list them, so all sources sit in one place.
2. **`formatValue` rounds cents away.** `formatValue(10.5, 'USD/hour')` prints "$11" (it uses `formatUSD`, zero
   decimals). Day 15's own text uses a cents formatter, but `NumbersTable` on any page with a wage shows "$11".
   Request: keep cents when a USD value is not a whole number.
3. **Builder 3's kit could become shared.** `src/viz/day-15/kit/` (time helpers that derive hours/days/months
   from d3's calendar, `citedIn()` that turns "(NBC; CNN.)" in a day's text into sources and a confidence
   level, the single-table `VizTable`, `ExtraSources`, in-chart confidence marks, a "calculated" tag) is used by
   Days 15 to 21 only. If other builders want it, it could move to `src/lib/viz/` and `src/components/viz/`.
4. **Witness table: where each immunity order is recorded.** Day 20 finds each immunity order in the day files
   by the witness's name; Jonathan Perez's order is not in the day files' text, so his entry rests on the
   witness table alone and is marked "one outlet, unconfirmed". A `immunity_day` and source id in
   `witnesses.json` would make it exact.
5. **Layout constants.** `no-magic-numbers` plus the literal scan mean every size is derived from
   `layout` (for example `layout.tap * (2 + 2)`). A few named constants (label column width, row height,
   axis height) in `src/lib/viz/layout.ts` would make chart code easier to read.
