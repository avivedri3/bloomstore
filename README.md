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

- Frontend: http://localhost:3000/bloomstore/
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
docs/project-book.docx
docs/book-conversion-guide.md
docs/docx-style-guide.md
docs/student-qa-appendix.md
docs/appendices/
.github/workflows
```

Useful commands:

```bash
npx nx serve frontend
npx nx serve backend
npx nx test backend
npx nx build frontend --configuration=production
npm run book:docx
```

## Architecture (enforced)

Presentation (`controllers`) → business (`services`) → data (`models`). Controllers return `{ success, data }` or `{ success: false, error }`. Public catalog hides `isActive === false` (out-of-stock items remain listed). Orders use a status state machine and price snapshots. Logout increments `tokenVersion` so existing JWTs are rejected.

Academic documentation: [docs/project-book.md](./docs/project-book.md). Conversion procedure and appendices: [docs/book-conversion-guide.md](./docs/book-conversion-guide.md). Word design: [docs/docx-style-guide.md](./docs/docx-style-guide.md). Agent rules: [AGENTS.md](./AGENTS.md). Render: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md). Docs sync pointer: [DOCS_SYNC.md](./DOCS_SYNC.md).

## GitHub Pages

CI/CD follows the iAgent-style pipeline (see [`.github/README.md`](./.github/README.md)): quality checks, Render for the API, GitHub Actions Pages for the SPA.

Live site: https://avivedri3.github.io/bloomstore/  
Project book: https://avivedri3.github.io/bloomstore/docs/

GitHub → **Settings → Pages → Source: GitHub Actions**. The Pages build uses the `VITE_API_BASE_URL` repo variable when it is set, and `http://localhost:3030/api` when it is not. `RENDER_DEPLOY_HOOK` is a repo secret — see [`.github/SECRETS.md`](./.github/SECRETS.md).
