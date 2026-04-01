# Core Library

## Overview

The Core Library provides the core logic and data access layer for the `www.omega2k.de` platform. It includes services, repositories, and utilities used across the application.

## Features

- **Content Repository**: Manages content data.
- **Likes Repository**: Manages likes and interactions.
- **WebSocket Services**: Provides WebSocket functionality.
- **Utilities**: Common utilities and helpers.

## Architecture

### Components

- **Repositories**: Data access layer for content and likes.
- **Services**: Core services for WebSocket and HTTP communication.
- **Interfaces**: Type definitions and interfaces.
- **Utilities**: Common utilities and helpers.

### Services

- **Content Service**: Fetches and manages content.
- **Likes Service**: Manages likes and interactions.
- **WebSocket Service**: Manages WebSocket connections and messages.
- **HTTP Bridge Service**: Bridges HTTP requests over WebSocket.

### Modules

- **Core Module**: Core functionality and services.
- **WebSocket Module**: WebSocket-specific functionality.

## Configuration

### Environment Variables

- `API_URL`: URL of the backend API.
- `WS_URL`: URL of the WebSocket server.

### Build Configuration

- **Output Path**: `dist/libs/core`
- **Main File**: `libs/core/src/index.ts`

## Development

### Prerequisites

- Node.js (v20.x or later)
- Angular CLI (v21.x or later)
- pnpm (v8.x or later)

### Installation

```bash
pnpm install
```

### Building the Library

```bash
# Development build
pnpm build:core

# Production build
pnpm build:core:prod
```

### Testing

```bash
# Unit tests
pnpm test:core
```

## Usage

### Content Repository

```typescript
import { ContentRepository } from '@o2k/core';

const contentRepo = await ContentRepository.create();
const content = await contentRepo.getContent('123');
```

### Likes Repository

```typescript
import { LikesRepository } from '@o2k/core';

const likesRepo = await LikesRepository.create();
const likes = await likesRepo.getLikes('123');
```

### WebSocket Service

```typescript
import { WebSocketService } from '@o2k/core';

const wsService = new WebSocketService('wss://api.omega2k.de');
wsService.connect();
```

## References

- [Angular Documentation](https://angular.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

_Last updated: 2025-04-01_
