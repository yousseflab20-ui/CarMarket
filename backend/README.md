# Backend API

Node.js/Express backend for CarMarket application with TypeScript.

## 🚀 Quick Start

### Development
```bash
pnpm dev
```

The server will start on `http://localhost:3000` with:
- 🚀 API endpoints

### Production Build
```bash
pnpm build
pnpm start
```

## 📁 Project Structure

```
backend/
├── src/
│   └── index.ts          # Main application entry point
├── dist/                 # Compiled JavaScript (generated)
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
```

## 📚 API Documentation

OpenAPI/Swagger documentation available at:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

## 🛠️ Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm start` - Start production server
- `pnpm type-check` - Run TypeScript type checking

## 📡 API Endpoints

- `GET /` - API status
- `GET /api/health` - Health check
- `GET /api/cars` - Get all cars (TODO)
