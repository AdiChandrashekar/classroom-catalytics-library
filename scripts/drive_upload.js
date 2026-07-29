const fs = require("fs");
const path = require("path");
const https = require("https");

const { client_id: CLIENT_ID, client_secret: CLIENT_SECRET } = require("./.drive_credentials.json");
const TOKEN_PATH = path.join(__dirname, "..", ".drive_oauth_token.json");
const FOLDER_ID = "1R6PlK0nFmdtMqIqYpRg28wi1r3ageNux";

function post(hostname, pathName, headers, body){
  return new Promise((resolve,reject)=>{
    const req = https.request({ hostname, path: pathName, method: "POST", headers }, res=>{
      let data = [];
      res.on("data", d=>data.push(d));
      res.on("end", ()=>resolve({ status: res.statusCode, body: Buffer.concat(data).toString() }));
    });
    req.on("error", reject);
    if(body) req.write(body);
    req.end();
  });
}

async function refreshAccessToken(){
  const tok = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  const body = new URLSearchParams({
    client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
    refresh_token: tok.refresh_token, grant_type: "refresh_token"
  }).toString();
  const res = await post("oauth2.googleapis.com", "/token", {
    "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body)
  }, body);
  const json = JSON.parse(res.body);
  if(!json.access_token) throw new Error("refresh failed: " + res.body);
  return json.access_token;
}

function uploadFile(accessToken, filePath, mimeType){
  return new Promise((resolve,reject)=>{
    const name = path.basename(filePath);
    const fileData = fs.readFileSync(filePath);
    const metadata = JSON.stringify({ name, parents: [FOLDER_ID] });
    const boundary = "ccl_boundary_" + Date.now();
    const preamble =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
    const closing = `\r\n--${boundary}--`;
    const body = Buffer.concat([Buffer.from(preamble), fileData, Buffer.from(closing)]);

    const req = https.request({
      hostname: "www.googleapis.com",
      path: "/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      method: "POST",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": body.length
      }
    }, res=>{
      let data = [];
      res.on("data", d=>data.push(d));
      res.on("end", ()=>resolve({ status: res.statusCode, body: Buffer.concat(data).toString(), name }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main(){
  const accessToken = await refreshAccessToken();
  console.log("Got fresh access token.");

  const files = process.argv.slice(2);
  for(const f of files){
    const mime = f.endsWith(".pdf") ? "application/pdf" : (f.endsWith(".md") ? "text/markdown" : "application/octet-stream");
    const result = await uploadFile(accessToken, f, mime);
    console.log(result.status, result.name, "->", result.body.slice(0,150));
  }
}
main().catch(e=>{ console.error("FATAL:", e.message); process.exit(1); });
