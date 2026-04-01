# Frontend (Angular)

## Overview

The frontend is an Angular-based application with Server-Side Rendering (SSR) support. It provides the user interface for the `www.omega2k.de` platform.

## Features

- **Server-Side Rendering (SSR)**: Improves SEO and performance by rendering the initial HTML on the server.
- **Real-Time Updates**: Uses WebSocket for real-time communication with the backend.
- **Responsive Design**: Adapts to different screen sizes and devices.
- **Accessibility**: Follows accessibility best practices to ensure inclusivity.

## Architecture

### Components

- **App Component**: Root component of the application.
- **Page Components**: Reusable page components (e.g., Main, Privacy, Imprint).
- **UI Components**: Reusable UI components (e.g., Buttons, Cards).

### Services

- **WebSocket Service**: Manages WebSocket connections and real-time updates.
- **Content Service**: Fetches and manages content from the backend.
- **Likes Service**: Manages likes and interactions.

### Modules

- **Core Module**: Core functionality and services.
- **UI Module**: Reusable UI components.
- **Page Module**: Page components and layouts.

## Configuration

### Environment Variables

- `API_URL`: URL of the backend API.
- `WS_URL`: URL of the WebSocket server.
- `ENVIRONMENT`: Current environment (e.g., development, production).

### Build Configuration

- **Output Path**: `dist/apps/www`
- **Base Href**: `/`
- **Deployment URL**: `https://www.omega2k.de`

## Development

### Prerequisites

- Node.js (v20.x or later)
- Angular CLI (v21.x or later)
- pnpm (v8.x or later)

### Installation

```bash
pnpm install
```

### Running the Application

```bash
# Development server
pnpm start

# Production build
pnpm build
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm e2e
```

## Deployment

### Docker

The frontend is deployed using Docker. The Dockerfile is located at `docker/Dockerfile.ssr`.

### CI/CD

The frontend is automatically deployed to production when changes are merged into the `main` branch. The CI/CD pipeline is defined in `.gitlab-ci.yml`.

## References

- [Angular Documentation](https://angular.io/docs)
- [Angular SSR Guide](https://angular.io/guide/universal)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

_Last updated: 2025-04-01_
