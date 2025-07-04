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
Enqueue a notification for delivery based on user preferences.

**Request Body Example:**
```json
{
  "notification": {
    "id": "notif-123",
    "userId": "user-456",
    "message": "Your order has shipped!",
    "priority": "normal",
    "timestamp": "2024-06-01T12:00:00Z"
  }
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

## License
MIT 