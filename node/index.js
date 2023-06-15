const express = require("express");
const os = require("os");

// Constants
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

// App
const app = express();
app.get("/", (req, res) => {
  const infos = {
    path: req.path,
    headers: req.headers,
    method: req.method,
    body: req.body,
    cookies: req.cookies,
    fresh: req.fresh,
    hostname: req.hostname,
    ip: req.ip,
    ips: req.ips,
    protocol: req.protocol,
    query: req.query,
    subdomains: req.subdomains,
    xhr: req.xhr,
    os: {
      hostname: os.hostname(),
    },
  };
  res.json(infos);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
