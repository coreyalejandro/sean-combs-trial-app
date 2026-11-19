# Shared requests from Builder 2 (Days 8 to 14)

Things outside my folders that I did not change. Each says what I did instead.

## 1. Source ids are not unique across days (data / `src/lib/data/sources.ts`)

`fox13` and `nbc13` name different articles on Day 2 and Day 13; `fox14` names different articles on Day 3 and Day 14. `allSources()` and `sourceById()` keep only the first, so a lookup by id from another day can return the wrong article.

**What I did:** my kit (`src/viz/day-08/kit/facts.ts`) matches sources by URL and gives a cross-day source a page id like `fox13-d13` only when its id is ambiguous.
**Request:** rename the colliding ids in the data, or key `allSources()` by URL.

## 2. Pictures that cite other days need their sources listed (shell)

The Sources panel lists only the day's own sources, but Days 8 to 14 draw on other days' records (and on `additions.json`).

**What I did:** each of my pictures renders "Sources from other days used in this picture" under the figure, numbered on from the day's own list, each with `id="source-…"` so every `data-source-ids` resolves on the page.
**Request:** consider a shell slot for this so all builders show it the same way.

## 3. Care rule 3: the Day 14 Sources panel names Mia's later employer

The Day 14 discrepancy "Madonna job: 6 months (Fox) vs 8 months (NBC)" is printed by the shell's Sources panel. Naming her later employer could narrow who Mia is.

**What I did:** my picture says only "she worked for another employer for several months; outlets disagree: 6 months (Fox) or 8 months (NBC)".
**Request:** redact the employer's name in `redactThirdParties()` or in the data, and check `key_points` too.

## 4. Day 11: the mistrial motion is better sourced than the record says

The Day 11 record says the mistrial motion was "reported only by NBC", but the Day 11 source notes for Global News and ABC News 4 (re-opened) both say the motion was denied, and CNN confirms it on Day 20.

**What I did:** `src/viz/day-11/additions.json` cites NBC, Global and ABC for it (high). The fingerprint testimony being struck stays at one outlet (NBC).
**Request:** update the Day 11 discrepancy line when the data is next merged.

## 5. Builder 2 kit location

`src/viz/day-08/kit/` (facts, source book, confidence dot, table, geometry, test helpers) is used by Days 8 to 14. If the coordinator wants it shared, it could move to `src/lib/viz/` unchanged.

## 6. Layout constants

The literal rule leaves only -1, 0, 1 and 2, so sizes such as label columns are derived from `layout` in `kit/geom.ts` (`labelW = margin.left * 4`, `rowH = tap + gap`). A few named constants in `src/lib/viz/layout.ts` (label column width, row height, dial size) would make this easier to read.

## 7. Additions schema: extra fields

Day 9 and Day 14 `additions.json` items carry extra fields (`alias`, `place`, `glyph`, `explained_by`, `end`). The zod schema accepts them (it is not strict). If the schema becomes strict, please allow a `meta` object or these keys.
