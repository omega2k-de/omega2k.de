# WebSocket API Reference

This document describes the WebSocket API for real-time communication between the frontend and backend.

## Overview

The WebSocket API provides real-time updates for the following features:

- Live likes counter
- Notifications
- Collaborative editing
- Pointer and touch events
- Health and metrics monitoring

## Endpoints

### WebSocket Server

- **URL**: `wss://api.omega2k.de`
- **Protocol**: `websocket`

## Message Structure

The WebSocket API distinguishes between two types of messages:

1. **Commands** ([`WsCommands`](../../libs/core/src/lib/core/websocket/interfaces/ws-command.interface.ts)): Messages sent from the client to the server to trigger actions.
2. **Messages** ([`WsMessages`](../../libs/core/src/lib/core/websocket/interfaces/ws-message.interface.ts)): Messages sent from the server to the client in response to commands or events.

### Common Fields

All messages include the following fields:

- `uuid` (string): Unique identifier for the message.
- `created` (number): Timestamp when the message was created.
- `author` (object, optional): Author of the message (e.g., user UUID and name).
- `message` (string, optional): Additional message text.

## Commands (Client to Server)

Commands are sent from the client to the server to trigger specific actions.

### Open Socket

Open a WebSocket connection.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "open-socket",
  "created": 1234567890,
  "url": "wss://api.omega2k.de"
}
```

**Fields**:

- `command` (string): `open-socket`.
- `url` (string, optional): URL to open.

### Close Socket

Close the WebSocket connection.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "close-socket",
  "created": 1234567890
}
```

**Fields**:

- `command` (string): `close-socket`.

### Chat

Send a chat message.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "chat",
  "created": 1234567890,
  "author": {
    "uuid": "user-123",
    "name": "User Name"
  },
  "message": "Hello, world!"
}
```

**Fields**:

- `command` (string): `chat`.
- `message` (string): Chat message text.

### Ping

Send a ping to the server.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "ping",
  "created": 1234567890
}
```

**Fields**:

- `command` (string): `ping`.

### Version

Request the current version and hash of the application.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "version",
  "created": 1234567890,
  "current": {
    "version": "0.1.0",
    "hash": "abc123"
  }
}
```

**Fields**:

- `command` (string): `version`.
- `current` (object, optional): Current version and hash.

### Me

Request information about the current client.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "me",
  "created": 1234567890
}
```

**Fields**:

- `command` (string): `me`.

### Update Me

Update the current client's information.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "updateMe",
  "created": 1234567890,
  "data": {
    "username": "New User Name"
  }
}
```

**Fields**:

- `command` (string): `updateMe`.
- `data` (object): Updated user data.
  - `username` (string): New username.

### Mouse

Send mouse event data.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "mouse",
  "created": 1234567890,
  "data": {
    "x": 100,
    "y": 200,
    "button": 0
  }
}
```

**Fields**:

- `command` (string): `mouse`.
- `data` (object): Mouse event data.

### Touch

Send touch event data.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "touch",
  "created": 1234567890,
  "data": {
    "x": 100,
    "y": 200,
    "identifier": 1
  }
}
```

**Fields**:

- `command` (string): `touch`.
- `data` (object): Touch event data.

### Pointer State

Start or stop sending pointer data.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "pointer-start",
  "created": 1234567890
}
```

**Fields**:

- `command` (string): `pointer-start` or `pointer-stop`.

### Metrics

Request metrics about connected clients.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "metrics",
  "created": 1234567890
}
```

**Fields**:

- `command` (string): `metrics`.

### HTTP Request

Send an HTTP request through the WebSocket bridge.

**Command**:

```json
{
  "uuid": "unique-id-123",
  "command": "http-request",
  "created": 1234567890,
  "request": {
    "requestId": "req-123",
    "method": "GET",
    "url": "/api/content/123",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "key": "value"
    },
    "withCredentials": true
  }
}
```

**Fields**:

- `command` (string): `http-request`.
- `request` (object): HTTP request details.
  - `requestId` (string): Unique request ID.
  - `method` (string): HTTP method (`GET`, `POST`, etc.).
  - `url` (string): Request URL.
  - `headers` (object, optional): Request headers.
  - `body` (object, optional): Request body.
  - `withCredentials` (boolean, optional): Include credentials.

## Messages (Server to Client)

Messages are sent from the server to the client in response to commands or events.

### Open

WebSocket connection opened.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "open",
  "created": 1234567890,
  "state": 1,
  "url": "wss://api.omega2k.de"
}
```

**Fields**:

- `event` (string): `open`.
- `state` (number): WebSocket ready state.
- `url` (string): WebSocket URL.

### Close

WebSocket connection closed.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "close",
  "created": 1234567890,
  "state": 3,
  "code": 1000,
  "reason": "Normal closure",
  "wasClean": true
}
```

**Fields**:

- `event` (string): `close`.
- `state` (number): WebSocket ready state.
- `code` (number): Close code.
- `reason` (string): Close reason.
- `wasClean` (boolean): Whether the connection closed cleanly.

### Error

WebSocket error.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "error",
  "created": 1234567890,
  "state": 2,
  "message": "Connection failed"
}
```

**Fields**:

- `event` (string): `error`.
- `state` (number): WebSocket ready state.
- `message` (string): Error message.

### Reconnect

WebSocket reconnection attempt.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "reconnect",
  "created": 1234567890,
  "state": 2,
  "disabled": false,
  "retry": 1,
  "retries": 3,
  "interval": 5000
}
```

**Fields**:

- `event` (string): `reconnect`.
- `state` (number): WebSocket ready state.
- `disabled` (boolean): Whether reconnection is disabled.
- `retry` (number): Current retry attempt.
- `retries` (number): Maximum retry attempts.
- `interval` (number): Reconnection interval (ms).

### Ready State

WebSocket ready state change.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "readyState",
  "created": 1234567890,
  "state": 1
}
```

**Fields**:

- `event` (string): `readyState`.
- `state` (number): WebSocket ready state.

### Chat

Chat message received.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "chat",
  "created": 1234567890,
  "author": {
    "uuid": "user-123",
    "name": "User Name"
  },
  "message": "Hello, world!"
}
```

**Fields**:

- `event` (string): `chat`.
- `message` (string): Chat message text.

### Pong

Response to a ping command.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "pong",
  "created": 1234567890,
  "rtt": 10
}
```

**Fields**:

- `event` (string): `pong`.
- `rtt` (number, optional): Round-trip time (ms).

### Me

Current client information.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "me",
  "created": 1234567890,
  "message": "current",
  "data": {
    "uuid": "client-123",
    "created": 1234567890,
    "seq": 1,
    "rtt": 10,
    "user": {
      "uuid": "user-123",
      "name": "User Name"
    }
  }
}
```

**Fields**:

- `event` (string): `me`.
- `message` (string): Message type (`current`).
- `data` (object): Client data.

### Clients

Number of connected clients.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "clients",
  "created": 1234567890,
  "count": 5
}
```

**Fields**:

- `event` (string): `clients`.
- `count` (number): Number of connected clients.

### Pointer

Pointer data from connected clients.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "pointer",
  "created": 1234567890,
  "message": "PointersData",
  "pointers": [
    {
      "uuid": "client-123",
      "user": {
        "uuid": "user-123"
      },
      "pointer": {
        "x": 100,
        "y": 200,
        "button": 0
      }
    }
  ]
}
```

**Fields**:

- `event` (string): `pointer`.
- `message` (string): Message type (`PointersData`).
- `pointers` (array): Array of pointer data.

### Health

Server health status.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "health",
  "created": 1234567890,
  "health": {
    "status": "ok",
    "memory": {
      "rss": 1024,
      "heapTotal": 2048,
      "heapUsed": 512
    },
    "clients": 5
  }
}
```

**Fields**:

- `event` (string): `health`.
- `health` (object): Health status data.

### Heartbeat

Regular heartbeat message.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "heartbeat",
  "created": 1234567890,
  "interval": 15000,
  "health": {
    "status": "ok",
    "memory": {
      "rss": 1024,
      "heapTotal": 2048,
      "heapUsed": 512
    },
    "clients": 5
  }
}
```

**Fields**:

- `event` (string): `heartbeat`.
- `interval` (number): Heartbeat interval (ms).
- `health` (object): Health status data.

### Update

Application update status.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "update",
  "created": 1234567890,
  "message": "current",
  "update": false,
  "current": {
    "version": "0.1.0",
    "hash": "abc123"
  }
}
```

**Fields**:

- `event` (string): `update`.
- `message` (string): Message type (`current`).
- `update` (boolean): Whether an update is available.
- `current` (object): Current version and hash.

### Metrics

Metrics about connected clients.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "metrics",
  "created": 1234567890,
  "clients": [
    {
      "uuid": "client-123",
      "created": 1234567890,
      "seq": 1,
      "rtt": 10,
      "user": {
        "uuid": "user-123",
        "name": "User Name"
      }
    }
  ]
}
```

**Fields**:

- `event` (string): `metrics`.
- `clients` (array): Array of client data.

### HTTP Response

Response to an HTTP request.

**Message**:

```json
{
  "uuid": "unique-id-123",
  "event": "http-response",
  "created": 1234567890,
  "requestId": "req-123",
  "ok": true,
  "status": 200,
  "url": "/api/content/123",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "key": "value"
  }
}
```

**Fields**:

- `event` (string): `http-response`.
- `requestId` (string): Request ID.
- `ok` (boolean): Whether the request was successful.
- `status` (number): HTTP status code.
- `url` (string): Request URL.
- `headers` (object, optional): Response headers.
- `body` (object, optional): Response body.
- `error` (string, optional): Error message.

## Authentication

The WebSocket connection requires authentication using JWT tokens.

### Authentication Flow

1. **Client**: Connect to the WebSocket server.
2. **Server**: Send an authentication challenge.
3. **Client**: Respond with a JWT token.
4. **Server**: Validate the token and establish the connection.

### Authentication Message

**Client to Server**:

```json
{
  "uuid": "unique-id-123",
  "command": "auth",
  "created": 1234567890,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Fields**:

- `command` (string): `auth`.
- `token` (string): JWT token for authentication.

## Examples

### Subscribe to Pointer Events

**Client**:

```javascript
const socket = new WebSocket('wss://api.omega2k.de');

socket.onopen = () => {
  // Start sending pointer data
  socket.send(
    JSON.stringify({
      uuid: 'unique-id-123',
      command: 'pointer-start',
      created: Date.now(),
    })
  );
};

socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.event === 'pointer') {
    console.log('Pointer data:', message.pointers);
  }
};
```

**Server**:

```json
{
  "uuid": "unique-id-123",
  "event": "pointer",
  "created": 1234567890,
  "message": "PointersData",
  "pointers": [
    {
      "uuid": "client-123",
      "user": {
        "uuid": "user-123"
      },
      "pointer": {
        "x": 100,
        "y": 200,
        "button": 0
      }
    }
  ]
}
```

### Send a Chat Message

**Client**:

```javascript
socket.send(
  JSON.stringify({
    uuid: 'unique-id-123',
    command: 'chat',
    created: Date.now(),
    author: {
      uuid: 'user-123',
      name: 'User Name',
    },
    message: 'Hello, world!',
  })
);
```

**Server**:

```json
{
  "uuid": "unique-id-123",
  "event": "chat",
  "created": 1234567890,
  "author": {
    "uuid": "user-123",
    "name": "User Name"
  },
  "message": "Hello, world!"
}
```

### Request Metrics

**Client**:

```javascript
socket.send(
  JSON.stringify({
    uuid: 'unique-id-123',
    command: 'metrics',
    created: Date.now(),
  })
);
```

**Server**:

```json
{
  "uuid": "unique-id-123",
  "event": "metrics",
  "created": 1234567890,
  "clients": [
    {
      "uuid": "client-123",
      "created": 1234567890,
      "seq": 1,
      "rtt": 10,
      "user": {
        "uuid": "user-123",
        "name": "User Name"
      }
    }
  ]
}
```

## Security

### CSRF Protection

The WebSocket API uses CSRF tokens to prevent cross-site request forgery attacks. Include the CSRF token in the authentication message.

### Rate Limiting

The WebSocket server enforces rate limiting to prevent abuse. Clients that exceed the rate limit will receive an error message.

### Encryption

All WebSocket connections use TLS encryption (`wss://`) to ensure data privacy and integrity.

## References

- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [JWT Authentication](https://jwt.io/)
- [CSRF Protection](https://owasp.org/www-community/attacks/csrf)
