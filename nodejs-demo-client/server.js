"use strict";

const express = require("express");
const client = require("prom-client");
var cors = require('cors')
const collectDefaultMetrics = client.collectDefaultMetrics;
// Probe every 5th second.
collectDefaultMetrics({ timeout: 5000 });

const PORT = 5000;
const HOST = "0.0.0.0";

const app = express();
app.use(cors())

app.get("/", (req, res) => {
    res.sendStatus(200)
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
    res.set('Content-Type', client.register.contentType)
    res.end(client.register.metrics())
})


app.listen(PORT, HOST);

console.log("Server listening...")

