# rHang fHiNDel Notification Services Server

## Overview

This project, `rhangfhindel-back-end`, is a Node.js server application designed to handle notification services using Firebase Cloud Messaging (FCM). It registers device tokens, organizes them by generation, and sends notifications to the registered devices.

## Features

- **Token Registration**: Register device tokens along with a generation identifier.
- **Token Retrieval**: Retrieve all registered tokens.
- **Token Clearing**: Clear all registered tokens.
- **Notification Sending**: Send notifications to all devices or specific generations.

## Requirements

- Node.js
- Firebase Admin SDK
- Service account credentials for Firebase
- Environment variables set in a `.env` file

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/nielxfb/rhangfhindel-back-end.git
   cd rhangfhindel-back-end
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the .env.example into a .env file:
   ```bash
   cp .env.example .env
   ```

4. Place your Firebase service account credentials file in the root directory and name it `service-account-credentials.json`.

## Running the Server

Start the server with the following command:
```bash
node index.js
```

The server will run on the port specified in the `.env` file or default to port 3000.

## API Endpoints

### Register Token

**Endpoint**: `/api/register-token`

**Method**: `POST`

**Description**: Registers a device token with a generation identifier.

**Request Body**:
```json
{
  "token": "device_token",
  "generation": "generation_identifier"
}
```

**Responses**:
- `200 OK`: Token received.
- `400 Bad Request`: Token is missing, Generation is missing, Invalid generation format, or Token already registered.

### Get Tokens

**Endpoint**: `/api/get-tokens`

**Method**: `GET`

**Description**: Retrieves all registered tokens organized by generation.

**Responses**:
- `200 OK`: A JSON object containing tokens.

### Clear Tokens

**Endpoint**: `/api/clear-tokens`

**Method**: `POST`

**Description**: Clears all registered tokens.

**Responses**:
- `200 OK`: Tokens cleared.

### Send Notification

**Endpoint**: `/api/send-notification`

**Method**: `POST`

**Description**: Sends a notification to all devices or specific generation.

**Request Body**:
```json
{
  "title": "Notification Title",
  "body": "Notification Body",
  "onlyForGeneration": "generation_identifier" (optional)
}
```

**Responses**:
- `200 OK`: Notification sent.
- `400 Bad Request`: Title is missing, Body is missing, Invalid generation format, or No tokens for this generation.
- `500 Internal Server Error`: Failed to send notification.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgements

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Express](https://expressjs.com/)

---
