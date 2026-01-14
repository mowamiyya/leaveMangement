# API Configuration Guide

## Overview

The frontend is now configured to use the production API URL: `https://leavemangement-1.onrender.com/api`

## How It Works

### Development Mode
- When running `npm run dev`, the app uses Vite's proxy configuration
- API requests to `/api/*` are automatically proxied to `http://localhost:8080`
- No base URL is set for axios, allowing relative URLs to work with the proxy

### Production Mode
- When building for production (`npm run build`), axios uses the full production URL
- All API requests go directly to `https://leavemangement-1.onrender.com/api`
- The base URL is set in `src/config/api.ts`

## Configuration Files

### `src/config/api.ts`
- Sets `axios.defaults.baseURL` based on environment
- Development: Empty string (uses Vite proxy)
- Production: `https://leavemangement-1.onrender.com/api`

### `vite.config.ts`
- Proxy configuration for development only
- Routes `/api/*` to `http://localhost:8080` during dev

## Environment Variables

You can override the API URL using environment variables:

```bash
# Create .env file in frontend directory
VITE_API_BASE_URL=https://your-custom-api-url.com/api
```

## Usage

All axios requests in the codebase will automatically use the configured base URL:

```typescript
// This will use the configured base URL
await axios.get('/auth/login')  // → https://leavemangement-1.onrender.com/api/auth/login (production)
                                 // → http://localhost:8080/api/auth/login (development via proxy)
```

## Testing

1. **Development**: Run `npm run dev` and verify API calls go through proxy
2. **Production**: Run `npm run build` and `npm run preview` to test production build

## Notes

- The API base URL is set before axios interceptors are initialized
- All existing API calls will work without modification
- The configuration is environment-aware and switches automatically
