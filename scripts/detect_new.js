// Scans the Drive folder for files that aren't in sources.json yet, extracts their
// text (PDF via pdftotext, .md as-is), and writes a report for Claude to read and
// classify. Run: node scripts/detect_new.js
const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const API_KEY = "AIzaSyBWR8Bk_PZ5Xz8XwUX-R-xlrxP8SFQnJjk";
const FOLDER_ID = "1R6PlK0nFmdtMqIqYpRg28wi1r3ageNux";
const SOURCES_PATH = path.join(__dirname, "..", "data", "sources.json");
const REPORT_PATH = path.join(__dirname, "..", "new_files_report.json");
const TMP_DIR = path.join(__dirname, "..", ".tmp_detect");

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
  const sources = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf8"));
  const knownIds = new Set(sources.map(s=>s.id));

  const listUrl = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType)&pageSize=1000&key=${API_KEY}`;
  const listBuf = await get(listUrl);
  const files = JSON.parse(listBuf.toString()).files || [];

  const newFiles = files.filter(f=>{
    const m = f.name.match(/^(\d+)_/);
    if(m && knownIds.has(parseInt(m[1]))) return false;
    if(f.name === "link_stubs_combined.md") return false;
    return true;
  });

  if(newFiles.length === 0){
    console.log("NO_NEW_FILES");
    if(fs.existsSync(REPORT_PATH)) fs.unlinkSync(REPORT_PATH);
    return;
  }

  fs.mkdirSync(TMP_DIR, { recursive:true });
  const report = [];
  for(const f of newFiles){
    const isPdf = /pdf$/i.test(f.mimeType) || /\.pdf$/i.test(f.name);
    const isMd = /\.md$/i.test(f.name);
    const dlUrl = `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media&key=${API_KEY}`;
    const buf = await get(dlUrl);
    let excerpt = "";
    if(isPdf){
      const tmpFile = path.join(TMP_DIR, f.id + ".pdf");
      fs.writeFileSync(tmpFile, buf);
      try{
        excerpt = execSync(`pdftotext "${tmpFile}" - 2>/dev/null | head -c 3000`, { encoding:"utf8", shell: "/bin/bash" });
      }catch(e){ excerpt = "(pdftotext failed: " + e.message + ")"; }
    } else if(isMd){
      excerpt = buf.toString("utf8").slice(0, 3000);
    } else {
      excerpt = "(unsupported file type: " + f.mimeType + ")";
    }
    report.push({ drive_id: f.id, filename: f.name, mimeType: f.mimeType, excerpt });
  }
  fs.rmSync(TMP_DIR, { recursive:true, force:true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log("FOUND", newFiles.length, "new file(s) -> report written to", REPORT_PATH);
}
main().catch(e=>{ console.error("FATAL:", e.message); process.exit(1); });
