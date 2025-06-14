import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';


dotenv.config();

const app = express();
const port = process.env.APP_PORT || 2000;
const _interval = process.env.WEBHOOK_INTERVAL || "5"
const send_interval = parseInt(_interval) * 1000;
const webhookUrl = process.env.WEBHOOK_URL

const serverStart = Date.now();

const orderCreateFilePath = path.join(__dirname, 'data/order-create.json');
const refundCreateFilePath = path.join(__dirname, 'data/refund-create.json');

function intervalFunc() {

  fs.readFile(orderCreateFilePath, 'utf8', (err, data) => {
    if (err) {
      return console.error("Failed to read JSON file:", err.message);
    }

    let payload;
    try {
      payload = JSON.parse(data);
    } catch (parseErr) {
      return console.error("Invalid JSON format:", parseErr.message);
    }


    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.error("Failed to send webhook:", err.message);
    });

    console.log("Order Create: Webhook POST sent with payload");
  });

  fs.readFile(refundCreateFilePath, 'utf8', (err, data) => {
    if (err) {
      return console.error("Failed to read JSON file:", err.message);
    }

    let payload;
    try {
      payload = JSON.parse(data);
    } catch (parseErr) {
      return console.error("Invalid JSON format:", parseErr.message);
    }

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.error("Failed to send webhook:", err.message);
    });

    console.log("Order Refund: Webhook POST sent with payload");
  });
}

setInterval(intervalFunc, send_interval);

app.get('/', (_req, res) => {
  const uptimeSeconds = process.uptime();
  res.json({
    status: "up",
    uptime: uptimeSeconds,
    since: new Date(serverStart).toISOString()
  });
});

app.listen(port, () => {
  console.log(`Express is listening at http://localhost:${port}`);
});
