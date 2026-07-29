// Re-downloads the HTML landing-page archives from Drive (they were removed from git
// but never deleted from Drive) into archived_pages/, and updates sources.json's
// local_file to point there. Run: node scripts/restore_archived_pages.js
const fs = require("fs");
const path = require("path");
const https = require("https");

const API_KEY = "AIzaSyBWR8Bk_PZ5Xz8XwUX-R-xlrxP8SFQnJjk";
const FOLDER_ID = "1R6PlK0nFmdtMqIqYpRg28wi1r3ageNux";
const OUT_DIR = path.join(__dirname, "..", "archived_pages");
const SOURCES_PATH = path.join(__dirname, "..", "data", "sources.json");
const DATA_JS_PATH = path.join(__dirname, "..", "data", "data.js");

function get(url){
  return new Promise((resolve,reject)=>{
    https.get(url, res=>{
      let chunks = [];
      res.on("data", d=>chunks.push(d));
      res.on("end", ()=>resolve(Buffer.concat(chunks)));
    }).on("error", reject);
  });
}

async function main(){
  fs.mkdirSync(OUT_DIR, { recursive:true });
  const listUrl = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&pageSize=1000&key=${API_KEY}`;
  const files = JSON.parse((await get(listUrl)).toString()).files || [];
  const htmlFiles = files.filter(f=>/html/i.test(f.mimeType) || /\.html$/i.test(f.name));

  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf8"));
  let restored = 0;
  for(const f of htmlFiles){
    const buf = await get(`https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&key=${API_KEY}`);
    fs.writeFileSync(path.join(OUT_DIR, f.name), buf);
    const m = f.name.match(/^(\d+)_/);
    if(m){
      const entry = sources.find(s=>s.id===parseInt(m[1]));
      if(entry){
        entry.local_file = "archived_pages/" + f.name;
        restored++;
      }
    }
  }
  fs.writeFileSync(SOURCES_PATH, JSON.stringify(sources, null, 2));
  fs.writeFileSync(DATA_JS_PATH, "const SOURCES = " + JSON.stringify(sources) + ";\n");
  console.log("Restored", htmlFiles.length, "files to archived_pages/, relinked", restored, "sources.");
}
main().catch(e=>{ console.error("FATAL:", e.message); process.exit(1); });
