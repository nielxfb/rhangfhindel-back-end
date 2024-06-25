const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const serviceAccount = require("./rhang-fhindel-805af72d693a.json");
const cors = require("cors");

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
    sendNotification(token, title, body);
  });

  res.status(200).send({ message: "Notification sent" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
