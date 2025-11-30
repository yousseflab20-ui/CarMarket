# CarMarket Monorepo

A modern monorepo for the CarMarket application, containing a React Native mobile app and Node.js backend, managed with pnpm workspaces.

## 📁 Project Structure

```
CarMarket/
├── mobile/              # React Native mobile application
├── backend/             # Node.js/Express backend server
├── packages/
│   └── shared/         # Shared types, utilities, and constants
├── pnpm-workspace.yaml # Workspace configuration
└── package.json        # Root package with workspace scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- pnpm 10.23.0 or higher
- For mobile development: Xcode (iOS) or Android Studio (Android)

### Installation

Install all dependencies across the monorepo:

```bash
pnpm install
```

## 📜 Available Scripts

### Development

```bash
# Run both backend and mobile concurrently
pnpm dev

# Run mobile app only
pnpm mobile

# Run mobile on specific platform
pnpm mobile:android
pnpm mobile:ios

# Run backend only
pnpm backend:dev
```

### Building

```bash
# Build all packages
pnpm build

# Build backend only
pnpm backend:build
```

### Testing

```bash
# Run tests in all packages
pnpm test

# Run tests in specific package
pnpm mobile:test
pnpm backend:test
```

### Type Checking & Linting

```bash
# Type check all packages
pnpm type-check

# Lint all packages
pnpm lint
```

### Cleaning

```bash
# Clean all node_modules, dist, and coverage
pnpm clean

# Clean only build outputs
pnpm clean:build
```

## 📦 Packages

### Mobile (`/mobile`)

React Native application for iOS and Android.

**Key scripts:**
- `pnpm mobile` - Start Metro bundler
- `pnpm mobile:android` - Run on Android
- `pnpm mobile:ios` - Run on iOS

### Backend (`/backend`)

Node.js/Express backend server with TypeScript.

**Key scripts:**
- `pnpm backend:dev` - Development with nodemon and ts-node
- `pnpm backend:start` - Production start
- `pnpm backend:build` - TypeScript compilation



### Shared (`/packages/shared`)

Shared TypeScript types, utilities, and constants.

**Usage in other packages:**

```typescript
import { Car, User, API_ENDPOINTS } from '@carmarket/shared';
```

## 🔧 Working with the Monorepo

### Adding Dependencies

```bash
# Add to root (dev dependencies only)
pnpm add -D <package> -w

# Add to specific package
pnpm add <package> --filter mobile
pnpm add <package> --filter backend
pnpm add <package> --filter @carmarket/shared
```

### Running Commands in Specific Packages

```bash
# Run any script in a specific package
pnpm --filter <package-name> <script>

# Examples:
pnpm --filter mobile start
pnpm --filter backend dev
```

### Running Commands in All Packages

```bash
# Run script in all packages (recursive)
pnpm -r <script>

# Examples:
pnpm -r build
pnpm -r test
```

## 🏗️ Adding a New Package

1. Create a new directory under `packages/` or at root level
2. Add a `package.json` with a unique name
3. The package will automatically be recognized by pnpm workspaces
4. Add scripts to root `package.json` if needed

## 🔗 Workspace Dependencies

To use one workspace package in another:

1. Add to `package.json` dependencies:
   ```json
   {
     "dependencies": {
       "@carmarket/shared": "workspace:*"
     }
   }
   ```

2. Run `pnpm install` to link the packages

## 📝 Best Practices

- **Keep shared code in `packages/shared`** - Types, utilities, and constants used by multiple packages
- **Use workspace protocol** - Reference workspace packages with `workspace:*`
- **Run from root** - Use root scripts for common operations
- **Type safety** - Leverage TypeScript across all packages
- **Consistent tooling** - Use the same versions of TypeScript, ESLint, etc.

## 🐛 Troubleshooting

### Clean install
```bash
pnpm clean
pnpm install
```

### Workspace not recognized
Ensure the package is listed in `pnpm-workspace.yaml` and has a valid `package.json`.

### TypeScript errors
```bash
pnpm type-check
```

## 📚 Learn More

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [React Native Documentation](https://reactnative.dev/)
- [Express.js Documentation](https://expressjs.com/)
