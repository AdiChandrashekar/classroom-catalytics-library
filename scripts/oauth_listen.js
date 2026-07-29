const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const { client_id: CLIENT_ID, client_secret: CLIENT_SECRET } = require("./.drive_credentials.json");
const PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const TOKEN_PATH = path.join(__dirname, "..", ".drive_oauth_token.json");

const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope: "https://www.googleapis.com/auth/drive",
  access_type: "offline",
  prompt: "consent"
}).toString();

console.log("AUTH_URL: " + authUrl);
console.log("Waiting for redirect on " + REDIRECT_URI + " ...");

function exchangeCode(code){
  const body = new URLSearchParams({
    code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI, grant_type: "authorization_code"
  }).toString();
  const req = https.request("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) }
  }, res=>{
    let data = "";
    res.on("data", d=>data+=d);
    res.on("end", ()=>{
      try{
        const json = JSON.parse(data);
        if(json.refresh_token){
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(json, null, 2));
          console.log("SUCCESS: token saved to " + TOKEN_PATH);
        } else {
          console.log("NO_REFRESH_TOKEN: " + data);
        }
      }catch(e){
        console.log("EXCHANGE_ERROR: " + e.message + " raw=" + data);
      }
      server.close();
    });
  });
  req.on("error", e=>console.log("REQUEST_ERROR: "+e.message));
  req.write(body);
  req.end();
}

const server = http.createServer((req,res)=>{
  const url = new URL(req.url, REDIRECT_URI);
  if(url.pathname === "/callback"){
    const code = url.searchParams.get("code");
    const err = url.searchParams.get("error");
    if(err){
      console.log("OAUTH_ERROR: " + err);
      res.end("Error: " + err + ". You can close this tab.");
      server.close();
      return;
    }
    res.end("Success! Drive access granted — you can close this tab and go back to the chat.");
    exchangeCode(code);
  } else {
    res.end("waiting...");
  }
});
server.listen(PORT, "127.0.0.1", ()=>{
  console.log("LISTENING on port " + PORT);
});
