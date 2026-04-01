# Page Library

## Overview

The Page Library provides page components and layouts for the `www.omega2k.de` platform. It includes components for the main page, privacy policy, imprint, and other pages.

## Features

- **Page Components**: Pre-built page components for common use cases.
- **Layouts**: Layout components for structuring the UI.
- **Reusable Components**: Components that can be reused across different pages.

## Architecture

### Components

- **Main Page**: Main page component with content and navigation.
- **Privacy Page**: Privacy policy page component.
- **Imprint Page**: Imprint page component.
- **Controls Page**: Controls and settings page component.
- **Content Page**: Content display page component.

### Services

- **Page Service**: Manages page state and navigation.
- **Content Service**: Fetches and manages content for pages.

### Modules

- **Page Module**: Page components and services.

## Configuration

### Environment Variables

- `API_URL`: URL of the backend API.
- `WS_URL`: URL of the WebSocket server.

### Build Configuration

- **Output Path**: `dist/libs/page`
- **Main File**: `libs/page/src/index.ts`

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
pnpm build:page

# Production build
pnpm build:page:prod
```

### Testing

```bash
# Unit tests
pnpm test:page
```

## Usage

### Main Page

```typescript
import { MainPageComponent } from '@o2k/page';

<!-- Example usage in HTML -->
<o2k-main-page></o2k-main-page>
```

### Privacy Page

```typescript
import { PrivacyPageComponent } from '@o2k/page';

<!-- Example usage in HTML -->
<o2k-privacy-page></o2k-privacy-page>
```

### Imprint Page

```typescript
import { ImprintPageComponent } from '@o2k/page';

<!-- Example usage in HTML -->
<o2k-imprint-page></o2k-imprint-page>
```

### Controls Page

```typescript
import { ControlsPageComponent } from '@o2k/page';

<!-- Example usage in HTML -->
<o2k-controls-page></o2k-controls-page>
```

### Content Page

```typescript
import { ContentPageComponent } from '@o2k/page';

<!-- Example usage in HTML -->
<o2k-content-page [contentId]="'123'"></o2k-content-page>
```

## References

- [Angular Documentation](https://angular.io/docs)
- [Angular Router](https://angular.io/guide/router)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

_Last updated: 2025-04-01_
