# UI Library

## Overview

The UI Library provides reusable UI components for the `www.omega2k.de` platform. It includes buttons, cards, modals, and other UI elements.

## Features

- **Reusable Components**: Pre-built UI components for common use cases.
- **Responsive Design**: Adapts to different screen sizes and devices.
- **Accessibility**: Follows accessibility best practices.
- **Theming**: Supports custom theming and styling.

## Architecture

### Components

- **Buttons**: Customizable buttons with different styles and sizes.
- **Cards**: Card components for displaying content.
- **Modals**: Modal dialogs for user interactions.
- **Forms**: Form components for user input.
- **Layouts**: Layout components for structuring the UI.

### Services

- **Theme Service**: Manages theme settings and styles.
- **Dialog Service**: Manages modal dialogs and overlays.

### Modules

- **UI Module**: Reusable UI components and services.

## Configuration

### Environment Variables

- `THEME`: Current theme (e.g., light, dark).

### Build Configuration

- **Output Path**: `dist/libs/ui`
- **Main File**: `libs/ui/src/index.ts`

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
pnpm build:ui

# Production build
pnpm build:ui:prod
```

### Testing

```bash
# Unit tests
pnpm test:ui
```

## Usage

### Buttons

```typescript
import { ButtonComponent } from '@o2k/ui';

<!-- Example usage in HTML -->
<o2k-button (click)="handleClick()">Click Me</o2k-button>
```

### Cards

```typescript
import { CardComponent } from '@o2k/ui';

<!-- Example usage in HTML -->
<o2k-card>
  <h2>Card Title</h2>
  <p>Card content goes here.</p>
</o2k-card>
```

### Modals

```typescript
import { ModalComponent } from '@o2k/ui';

<!-- Example usage in HTML -->
<o2k-modal [open]="isOpen" (close)="handleClose()">
  <h2>Modal Title</h2>
  <p>Modal content goes here.</p>
</o2k-modal>
```

## References

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [Tailwind CSS](https://tailwindcss.com/)

---

_Last updated: 2025-04-01_
