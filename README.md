# ACD Studio Website

Next.js (App Router) + Prisma + TypeScript website for ACD Studio.

## Architecture

```mermaid
graph TD
  A[Browser] --> B[Next.js App Router]
  B --> C[Public Pages]
  B --> D[Admin CMS]
  B --> E[API Routes]
  E --> F[Prisma]
  F --> G[(PostgreSQL)]
  E --> H[Media Proxy]
  H --> I[Google Drive / External]
```

## Structure

- `app/` — routes (public, admin, API)
  - `app/(public)/` — customer-facing pages
  - `app/admin/` — CMS admin pages
  - `app/api/` — API routes
- `components/` — UI components
- `lib/` — utilities (Prisma, media, catalog, auth, storage)
- `prisma/` — schema & migrations
- `public/` — static assets

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npx tsc --noEmit` — typecheck

## Env

See `.env`.
