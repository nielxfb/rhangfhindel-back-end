require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
const fs = require("fs");

const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

const accountData = fs.readFileSync("service-account-credentials.json");
const serviceAccount = JSON.parse(accountData);
serviceAccount["private_key_id"] = process.env.FIREBASE_PRIVATE_KEY_ID;
serviceAccount["private_key"] = privateKey;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const tokens = new Map();

const checkGeneration = (generation) => {
  const generationRegex = /^[0-9]{2}-[0-9]$/;
  return generationRegex.test(generation);
};

app.post("/api/register-token", (req, res) => {
  const token = req.body.token;
  const generation = req.body.generation;
  if (!token) {
    res.status(400).send({ message: "Token is missing" });
    return;
  }

  if (!generation) {
    res.status(400).send({ message: "Generation is missing" });
    return;
  }

  if (!checkGeneration(generation)) {
    res.status(400).send({ message: "Invalid generation format" });
    return;
  }

  if (!tokens.has(generation)) {
    tokens.set(generation, []);
  }

  if (tokens.get(generation).includes(token)) {
    res.status(400).send({ message: "Token already registered" });
    return;
  }

  tokens.get(generation).push(token);
  res.status(200).send({ message: "Token received" });
});

app.get("/api/get-tokens", (req, res) => {
  const object = Object.fromEntries(tokens);
  res.status(200).send(object);
});

app.post("/api/clear-tokens", (req, res) => {
  tokens.clear();
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
  const onlyForGeneration = req.body.onlyForGeneration;

  if (!title) {
    res.status(400).send({ message: "Title is missing" });
    return;
  }

  if (!body) {
    res.status(400).send({ message: "Body is missing" });
    return;
  }

  if (onlyForGeneration === undefined) {
    tokens.forEach((value, key) => {
      value.forEach((token) => {
        try {
          sendNotification(token, title, body);
        } catch (error) {
          res.status(500).send({ message: "Failed to send notification" });
          return;
        }
      });
    });

    return;
  }

  if (!checkGeneration(onlyForGeneration)) {
    res.status(400).send({ message: "Invalid generation format" });
    return;
  }

  if (!tokens.has(onlyForGeneration)) {
    res.status(400).send({ message: "No tokens for this generation" });
    return;
  }

  tokens.get(onlyForGeneration).forEach((token) => {
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
