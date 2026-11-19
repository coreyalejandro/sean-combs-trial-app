# Finale port: notes for the coordinator

No new package was needed: the map runs on the pinned `deck.gl` 9.1.14 (imported from `deck.gl`, loaded only on `/finale/` through `next/dynamic`).

1. **Folder names.** The coordinator's instructions put the finale in `src/viz/finale/` and its data in `public/finale-data/`. `BUILDER_BRIEF.md` and `CONTRIBUTING-VIZ.md` still list `src/components/finale/` and `public/march/`. Please update those two tables when merging.
2. **Data file type.** `public/finale-data/march.qbin` is gzip bytes with a custom extension, so no host adds `Content-Encoding` to it; the browser inflates it with `DecompressionStream`. If a host does inflate it, the engine notices (no gzip header) and reads it as is. Cloudflare Pages needs no setting.
3. **Literal checks.** `scripts/check-viz-literals.mjs` and the `no-magic-numbers` lint rule cover only `src/viz/day-*`. The finale prints only values read from `summary.json` / `meta.json` (written by `prep/prepare_finale_data.py` from the migration build). If you want the finale held to the same scan, widen the scan's folder pattern.
4. **Page tests and WebGL.** The test browser draws WebGL in software; on a busy machine one map frame can take seconds, which can starve input. `tests/e2e/finale.spec.ts` therefore runs its map tests one at a time in the desktop project only, with longer timeouts. The shared `screenshot finale` test in `pages.spec.ts` may time out on a loaded machine for the same reason.
