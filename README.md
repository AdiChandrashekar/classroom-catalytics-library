# Classroom Catalytics Library

A live, self-syncing dashboard for browsing a research bibliography — part wiki, part
mind-map, part literature-review browser. Built around a Google Drive folder as the
source archive, with the site staying current automatically as files are added to it.

**Live site:** https://adichandrashekar.github.io/classroom-catalytics-library/

---

## What's in here

A 110-source bibliography on teacher motivation, behaviour, and demotivation (global,
with a deep focus on India and Uttar Pradesh). Every entry is tagged across five axes —
theme, geography, method, construct, and access type — and classified into 24
bibliography sections, plus an "Unsorted / Needs Review" bucket for anything freshly
added that hasn't been classified yet.

| | |
|---|---|
| Full-text PDFs archived | 46 |
| Landing/catalog pages catalogued (paywalled or book-only sources) | 30 |
| Paywalled/blocked, catalogued by citation only | 31 |
| Cross-referenced duplicates with no independent link | 3 |

Sources without a retrievable full text are documented in
[`link_stubs_combined.md`](link_stubs_combined.md) with complete bibliographic detail
and the original link.

---

## Using the library

**Four tabs, one dataset.** Whatever you search or filter in the top bar applies across
all of them at once:

- **Mind Map** — two switchable layouts (toggle at the top of the tab):
  - *Radial Map*: the 24 sections branch from a root node, sources as leaves. Scroll to
    zoom, drag to pan, hover any node for a quick preview card, and hovering highlights
    the path back to root while dimming everything unrelated — click a node for full
    detail in the side panel.
  - *Concept Network*: a force-directed alternate view where sources cluster around
    shared *constructs* (burnout, morale, self-efficacy, etc.) instead of sections —
    useful for spotting thematic overlap across parts of the bibliography that would
    never sit next to each other in the radial view.
- **Wiki / Library** — card-based browsing. Each card shows tags, an access-status
  badge, and a personal **Unread / Reading / Studied** dropdown that persists in your
  browser's local storage — a private reading tracker, not shared or synced anywhere.
- **Lit-Review Table** — a dense, sortable spreadsheet view. Click any column header to
  sort; combine with the filter bar for things like "UP + qualitative + open access."
- **Bibliography** — an auto-formatted reference list generated live from whatever's
  currently filtered (clear filters first for the complete list). Two download buttons:
  Markdown (`.md`) and Word (`.doc`) — both generated entirely in your browser, no
  server involved.

**Opening a source:** click "Open" anywhere and it loads in an embedded pop-up. PDFs
render inline via Google Drive's viewer; sources with no downloadable PDF (a paywalled
or book-only citation) open their original page instead — some external sites block
being shown inside another page, in which case "Open in new tab ↗" (always available in
the pop-up) is the reliable fallback.

**Filters** live as compact dropdown pills (Theme / Geography / Method / Construct /
Access) rather than a permanently expanded wall of chips — click one to open its
checklist, "done" or click outside to close.

**Staying current:** the 🔄 button next to the header forces an immediate sync with the
Drive folder. You don't usually need it — the page also syncs on load, whenever you
switch back to the tab, and quietly every two minutes in the background.

---

## The Google Drive folder

Every source in this library — its PDF, or a note if no PDF exists — lives in one
shared Google Drive folder, which the dashboard reads from live:

**📁 [Open the Drive folder](https://drive.google.com/drive/folders/1R6PlK0nFmdtMqIqYpRg28wi1r3ageNux)**

You can also get there anytime from inside the dashboard — click the **📁** icon next to
the sync button in the header, which opens the folder in the same in-page pop-up used
for everything else (with "open in new tab" available too).

**Adding a new source:** just drop a file in — any filename works, there's no naming
convention you need to follow. On the next sync, it shows up automatically, tagged by
keyword matching wherever it can be, and filed under "⚑ Unsorted / Needs Review" in the
mind map otherwise (so it's never silently mis-tagged, just flagged for a proper pass
later). The `<id>_short-title` naming pattern you'll notice on the existing files is
only relevant for linking a file back to a specific pre-written citation already in the
bibliography — it's an internal convention for the maintainer, not a requirement for
anyone adding new material.

---

## Credits

Bibliography compiled and maintained by Aditya Chandrashekar. Sources span foundational
motivation theory (Deci & Ryan, Bandura, Maslach), the India/Uttar Pradesh governance
literature (Kingdon, Béteille, Ramachandran, Muralidharan & Sundararaman), and the
broader global teacher-motivation and demotivation research base.
