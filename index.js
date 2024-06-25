require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
const fs = require("fs");

const accountData = fs.readFileSync("rhang-fhindel-9cefdb21ebbb.json");
const serviceAccount = JSON.parse(accountData);
serviceAccount["private_key_id"] = process.env.FIREBASE_PRIVATE_KEY_ID
serviceAccount["private_key"] = process.env.FIREBASE_PRIVATE_KEY


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const tokens = [];

app.post("/api/register-token", (req, res) => {
  const token = req.body.token;
  if (!token) {
    res.status(400).send({ message: "Token is missing" });
    return;
  }

  if (tokens.includes(token)) {
    res.status(400).send({ message: "Token already registered" });
    return;
  }

  tokens.push(token);
  res.status(200).send({ message: "Token received" });
});

app.get("/api/get-tokens", (req, res) => {
  res.status(200).send({ tokens: tokens });
});

app.post("/api/clear-tokens", (req, res) => {
  tokens.length = 0;
  res.status(200).send({ message: "Tokens cleared" });
});

function sendNotification(token, title, body) {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };

  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
      throw error;
    });
}

app.post("/api/send-notification", (req, res) => {
  const title = req.body.title;
  const body = req.body.body;
  if (!title) {
    res.status(400).send({ message: "Title is missing" });
    return;
  }

  if (!body) {
    res.status(400).send({ message: "Body is missing" });
    return;
  }

  tokens.forEach((token) => {
    try {
      sendNotification(token, title, body);
    } catch (error) {
      res.status(500).send({ message: "Failed to send notification" });
      return;
    }
  });

  res.status(200).send({ message: "Notification sent" });
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
