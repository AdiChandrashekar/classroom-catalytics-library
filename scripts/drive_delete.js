const fs = require("fs");
const path = require("path");
const https = require("https");

const { client_id: CLIENT_ID, client_secret: CLIENT_SECRET } = require("./.drive_credentials.json");
const TOKEN_PATH = path.join(__dirname, "..", ".drive_oauth_token.json");

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
function del(accessToken, fileId){
  return new Promise((resolve,reject)=>{
    const req = https.request({
      hostname: "www.googleapis.com",
      path: "/drive/v3/files/" + fileId,
      method: "DELETE",
      headers: { "Authorization": "Bearer " + accessToken }
    }, res=>{
      let data=[];
      res.on("data",d=>data.push(d));
      res.on("end",()=>resolve({status:res.statusCode, body:Buffer.concat(data).toString()}));
    });
    req.on("error", reject);
    req.end();
  });
}
async function main(){
  const accessToken = await refreshAccessToken();
  const ids = process.argv.slice(2);
  for(const id of ids){
    const r = await del(accessToken, id);
    console.log(id, r.status, r.body || "(deleted)");
  }
}
main().catch(e=>{ console.error("FATAL:", e.message); process.exit(1); });
