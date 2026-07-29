# Classroom Catalytics Library

A dashboard (`dashboard.html`) for browsing a research bibliography, synced live against
a public Google Drive folder. See `data/sources.json` for the source of truth on every
entry's metadata/tags; `data/data.js` is the same data pre-serialized for the page to load.

## Sorting new files added to Drive — run this exact procedure when asked

Trigger phrases from the user: "sort the new files", "check the drive for new sources",
"run a sort pass", or similar. Always follow these steps in order, don't skip or reorder:

1. **Detect.** Run `node scripts/detect_new.js` from the project root. It diffs the live
   Drive folder listing against `data/sources.json` by leading `id_` filename prefix and
   writes any unrecognized files' extracted text (PDF via `pdftotext`, `.md` as-is) to
   `new_files_report.json`. If it prints `NO_NEW_FILES`, stop here and tell the user.

2. **Read and classify.** Read `new_files_report.json` yourself — actually read the
   excerpt text, don't guess from the filename. For each entry decide:
   - `title`, `authors`, `year`, `venue`, `note` (one-line summary) — pull from the text.
   - `theme` (array), `geography`, `method`, `construct` — use existing values from
     `LABELS` in `dashboard.html` where the concept genuinely fits. If it doesn't fit
     anything existing, it's fine to introduce a new tag value — see step 4.
   - `section_name` — reuse an existing section if it fits, otherwise leave it under
     `"Unsorted / Needs Review"` (section 0) rather than inventing a new section number.
   Write your decisions to `classification.json` as an array of objects matching the
   shape documented at the top of `scripts/apply_classification.js`. Include `drive_id`
   and `access_type` (`open_pdf` for PDFs, `markdown_note` for `.md`).

3. **Apply.** Run `node scripts/apply_classification.js`. This appends the new entries to
   `data/sources.json`, regenerates `data/data.js`, and prints the new total count.

4. **Teach the auto-sorter (only if you introduced a genuinely new tag/concept).** If step 2
   required a tag value that doesn't already exist in `LABELS` inside `dashboard.html`,
   add it there (with a human-readable label) AND add a matching regex to `KEYWORD_RULES`
   in the same file, so the client-side classifier recognizes that concept automatically
   next time without needing you. If you only reused existing tags, skip this step.

5. **Report back.** Tell the user how many new sources were added, their titles, and
   whether you had to extend the taxonomy in step 4.

## Credentials — never commit these

- `.drive_oauth_token.json` — full read/write OAuth token for the owner's entire Drive.
- `scripts/.drive_credentials.json` — OAuth Client ID + Secret for the Desktop app client.

Both are gitignored. The read-only Drive API key hardcoded in `dashboard.html` is
intentionally public (restricted to Drive API only, folder is already publicly viewable)
— that one is fine to ship.

## Uploading/deleting files in Drive on the user's behalf

`scripts/drive_upload.js <files...>` and `scripts/drive_delete.js <fileIds...>` handle
this via the saved OAuth refresh token — no need to re-authenticate. If `.drive_oauth_token.json`
is ever missing (e.g. fresh clone of the repo, or the user revoked access), re-run
`scripts/oauth_listen.js` and walk the user through re-authorizing — see prior conversation
for the exact Google Cloud Console steps if needed.
