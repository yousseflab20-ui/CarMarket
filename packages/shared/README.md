# Shared Package

This package contains shared code used across the CarMarket monorepo.

## Contents

- **Types**: Common TypeScript interfaces and types
- **Constants**: Shared constants like API endpoints
- **Utilities**: Shared utility functions

## Usage

### In Backend

```typescript
import { Car, User, API_ENDPOINTS } from '@carmarket/shared';
```

### In Mobile

```typescript
import { Car, User, API_ENDPOINTS } from '@carmarket/shared';
```

## Adding New Shared Code

1. Add your types, constants, or utilities to `src/`
2. Export them from `src/index.ts`
3. Run `pnpm type-check` to verify TypeScript compilation
