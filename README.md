# Schedulify Frontend

Frontend application for Schedulify timetable management system.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Environment Variables

Create `.env` for local development:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

For production (Netlify), set:

```env
VITE_API_BASE_URL=https://schedulify-backend-new-1.onrender.com/api
```

## Netlify Deployment

This project includes `netlify.toml` with:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect: `/* -> /index.html` (status 200)

Netlify settings:
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Environment variable: `VITE_API_BASE_URL` to your backend `/api` URL

Example:
`https://your-render-backend.onrender.com/api`