// Applies Claude's classification decisions (read from classification.json) to
// sources.json + data.js. Each item in classification.json:
// { drive_id, filename, title, authors, year, venue, note, theme:[...], geography, method, construct, access_type }
// Run: node scripts/apply_classification.js
const fs = require("fs");
const path = require("path");

const SOURCES_PATH = path.join(__dirname, "..", "data", "sources.json");
const DATA_JS_PATH = path.join(__dirname, "..", "data", "data.js");
const CLASS_PATH = path.join(__dirname, "..", "classification.json");

const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf8"));
const classifications = JSON.parse(fs.readFileSync(CLASS_PATH, "utf8"));

let nextId = Math.max(0, ...sources.map(s=>s.id)) + 1;
// keep ids stable/incrementing but never collide with the 0-1000 "unsorted" range convention
if(nextId < 200) nextId = 200;

classifications.forEach(c=>{
  const id = nextId++;
  sources.push({
    id, section: c.section || 0, section_name: c.section_name || "Unsorted / Needs Review",
    authors: c.authors || "", year: c.year || null, title: c.title, venue: c.venue || "",
    note: c.note || "", url: c.url || "",
    theme: c.theme || ["unsorted"], geography: c.geography || "unsorted",
    method: c.method || "unsorted", construct: c.construct || "unsorted",
    access_type: c.access_type || "other",
    download_status: "downloaded_pdf", local_file: null,
    drive_id: c.drive_id, study_status: "unread"
  });
  console.log("added id", id, "->", c.title);
});

fs.writeFileSync(SOURCES_PATH, JSON.stringify(sources, null, 2));
fs.writeFileSync(DATA_JS_PATH, "const SOURCES = " + JSON.stringify(sources) + ";\n");
console.log("Done. Total sources:", sources.length);
