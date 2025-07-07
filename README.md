# Notification System Microservice

A simple, scalable notification microservice built with Node.js, TypeScript, Express, and BullMQ (Redis-based queue). Supports user-preference-based notification delivery and pluggable providers.

---

## Features
- Queue-based notification delivery (BullMQ + Redis)
- User preferences fetched via webhook
- Channel-specific consumers (Email, SMS, Push)
- Easily extensible for new providers
- Dockerized Redis setup

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (for Redis)

---

## Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd notification-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Redis using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the server (consumers start automatically):**
   ```bash
   npm start
   ```

---

## API Usage

### POST `/api/notify`
Enqueue a notification for delivery based on user preferences or explicit channels.

**Request Body Example (with explicit channels):**
```json
{
  "notification": {
    "id": "notif-123",
    "userId": "user-456",
    "message": "Your order has shipped!",
    "priority": "normal",
    "timestamp": "2024-06-01T12:00:00Z"
  },
  "channels": ["sms", "email"],
  "successWebhook": "http://localhost:8080/webhook/success",
  "errorWebhook": "http://localhost:8080/webhook/error"
}
```

**Request Body Example (with userPrefWebhook):**
```json
{
  "notification": {
    "id": "notif-456",
    "userId": "user-789",
    "message": "Your package is out for delivery!",
    "priority": "high",
    "timestamp": "2024-06-01T13:00:00Z"
  },
  "userPrefWebhook": "http://localhost:4000/user-preferences",
  "successWebhook": "http://localhost:8080/webhook/success",
  "errorWebhook": "http://localhost:8080/webhook/error"
}
```

**Request Body Example (error case):**
```json
{
  "notification": {
    "id": "notif-789",
    "userId": "user-123",
    "message": "This should trigger an error.",
    "priority": "normal",
    "timestamp": "2024-06-01T14:00:00Z"
  },
  "errorWebhook": "http://localhost:8080/webhook/error"
}
```

**Response Example:**
```json
{
  "success": true
}
```

---

## How It Works
1. The API enqueues the notification to the main queue.
2. The main consumer fetches user preferences from a webhook (see `mainConsumer.ts`).
3. The notification is routed to the appropriate channel queue(s) (email, sms, push) based on preferences.
4. Channel consumers process and "send" the notification (currently logs to console; replace with real provider logic).

---

## Customization
- **User Preferences Webhook:**
  - Update the webhook URL in `src/consumers/mainConsumer.ts` to point to your user preferences service.
- **Add Providers:**
  - Implement new providers in `src/providers/` and add new queues/consumers as needed.
- **Persistence/Monitoring:**
  - Integrate with a database or add BullMQ UI for monitoring if desired.

---

## Development
- To run in development mode with TypeScript:
  ```bash
  npx ts-node src/index.ts
  ```
- To rebuild and restart:
  ```bash
  rm -rf dist
  npm run build
  npm start
  ```

---

## Twilio SMS Integration

To enable SMS notifications using Twilio, set the following environment variables in your environment or a .env file:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

The system will use these credentials to send SMS notifications via Twilio.

---

# Docker Compose Usage

## Development

1. Start the development environment:
   ```sh
   docker compose --profile dev up --build
   ```

   This will start both the app (in watch mode with live reload) and a Redis server on port 6380.

2. The app will connect to Redis at `redis-dev:6380` using the environment variables set in `docker-compose.yml`.

> **Note:**
> - Only the development environment is supported via Docker Compose in this setup.
> - For production, use your own deployment pipeline or extend the Docker setup as needed. 