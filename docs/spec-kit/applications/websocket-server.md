# WebSocket Server

## Overview

The WebSocket server is a Node.js application that provides real-time communication between the frontend and backend. It uses the `ws` library for WebSocket connections and Express for HTTP requests.

## Features

- **Real-Time Communication**: Uses WebSocket for bidirectional communication.
- **Authentication**: Supports JWT authentication for secure connections.
- **Rate Limiting**: Enforces rate limiting to prevent abuse.
- **Health Monitoring**: Provides health and metrics endpoints.

## Architecture

### Components

- **WebSocket Server**: Manages WebSocket connections and real-time updates.
- **HTTP Server**: Handles HTTP requests and provides REST endpoints.
- **Content Repository**: Manages content data.
- **Likes Repository**: Manages likes and interactions.

### Services

- **WebSocket Service**: Manages WebSocket connections and messages.
- **Content Service**: Fetches and manages content.
- **Likes Service**: Manages likes and interactions.

### Modules

- **Core Module**: Core functionality and services.
- **WebSocket Module**: WebSocket-specific functionality.

## Configuration

### Environment Variables

- `API_PORT`: Port for the WebSocket server (default: 80).
- `API_HOST`: Host for the WebSocket server (default: `0.0.0.0`).
- `API_ORIGIN`: Origin for the WebSocket server (default: `https://www.omega2k.de`).
- `API_SSL`: Whether to use SSL (default: `false`).

### Build Configuration

- **Output Path**: `dist/apps/websocket`
- **Main File**: `apps/websocket/src/main.ts`
- **Dockerfile**: `docker/Dockerfile.api`

## Development

### Prerequisites

- Node.js (v20.x or later)
- pnpm (v8.x or later)

### Installation

```bash
pnpm install
```

### Running the Server

```bash
# Development server
pnpm serve:websocket

# Production build
pnpm build:websocket
```

### Testing

```bash
# Unit tests
pnpm test:websocket
```

## Deployment

### Docker

The WebSocket server is deployed using Docker. The Dockerfile is located at `docker/Dockerfile.api`.

### CI/CD

The WebSocket server is automatically deployed to production when changes are merged into the `main` branch. The CI/CD pipeline is defined in `.gitlab-ci.yml`.

## API Reference

### WebSocket Endpoints

- **URL**: `wss://api.omega2k.de`
- **Protocol**: `websocket`

### HTTP Endpoints

- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics`

## References

- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [ws Library](https://github.com/websockets/ws)
- [Express Documentation](https://expressjs.com/)

---

_Last updated: 2025-04-01_
