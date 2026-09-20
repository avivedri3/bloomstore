# BloomStore

Full-stack flower shop e-commerce for the ORT Software Technician diploma. Nx monorepo: React 19 SPA, NestJS REST API, shared TypeScript contracts, and a 10-chapter Hebrew project book.

## Stack

| Layer | Technology |
| --- | --- |
| Workspace | Nx 22, TypeScript 5.9 |
| Frontend | React 19, Vite, React Router 7, Axios, MUI + Tailwind |
| Backend | NestJS (Express), Mongoose, Zod, Helmet, rate limit |
| Data | MongoDB (11 collections) + optional Redis write-through |
| CI/CD | GitHub Actions → [GitHub Pages](https://avivedri3.github.io/bloomstore/) (SPA + docs) + Render (API) |

## Quick start

```bash
cp apps/backend/.env.example apps/backend/.env
# set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3030/api
- Swagger UI: http://localhost:3030/api/swagger
- API readme: http://localhost:3030/api/docs/readme (see also [apps/backend/README.md](./apps/backend/README.md))
- Live project book: http://localhost:3030/api/docs

### Demo users (seeded when the database is empty)

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@bloomstore.com | Admin123! |
| Customer | customer@bloomstore.com | Customer123! |

## Workspace layout

```
apps/frontend    React SPA
apps/backend     NestJS 3-tier API
libs/shared-types
docs/project-book.md
.github/workflows
```

Useful commands:

```bash
npx nx serve frontend
npx nx serve backend
npx nx test backend
npx nx build frontend --configuration=production
```

## Architecture (enforced)

Presentation (`controllers`) → business (`services`) → data (`models`). Controllers return `{ success, data }` or `{ success: false, error }`. Public catalog filters `isActive === false` and `stock === 0`. Orders use a status state machine and price snapshots. Logout increments `tokenVersion` so existing JWTs are rejected.

Academic documentation: [docs/project-book.md](./docs/project-book.md). Agent rules: [AGENTS.md](./AGENTS.md). Render: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md). Docs sync: [DOCS_SYNC.md](./DOCS_SYNC.md).

## GitHub Pages

CI/CD follows the iAgent-style pipeline (see [`.github/README.md`](./.github/README.md)): quality checks, Render for the API, GitHub Actions Pages for the SPA.

Live site: https://avivedri3.github.io/bloomstore/  
Project book: https://avivedri3.github.io/bloomstore/docs/

GitHub → **Settings → Pages → Source: GitHub Actions**. Set `VITE_API_BASE_URL` (repo variable) and `RENDER_DEPLOY_HOOK` (repo secret) as in [`.github/SECRETS.md`](./.github/SECRETS.md).
