# General Guidelines for working with Nx (BloomStore)

- When running tasks (build, lint, test, e2e), prefer `npx nx run`, `npx nx run-many`, or `npx nx affected`.
- Prefix nx commands with the workspace package manager (`npx nx …`) — do not rely on a globally installed CLI.
- NEVER guess CLI flags — check `--help` first when unsure.

## Architecture rules

1. **Strict 3-tier backend**: controllers extract HTTP params and return `ApiResponse` / `ApiError` envelopes. Business rules live in `services/`. Persistence lives in `models/` (Mongoose). Controllers MUST NOT contain business logic.
2. **Shared contracts**: DTOs, enums, and Zod schemas belong in `libs/shared-types`. Do not duplicate request/response shapes between frontend and backend.
3. **Eleven MongoDB collections**: `users`, `products`, `carts`, `orders`, `payments`, `addresses`, `sequences`, `auditlogs`, `webhookevents`, `failedwebhooks`, `idempotencykeys`.
4. **Security pipeline**: Helmet, CORS whitelist, rate limiting, NoSQL sanitization, JWT with `tokenVersion` revocation, account lockout after 5 failed logins (`ACCOUNT_LOCKED`, HTTP 423).
5. **Catalog**: public listings must hide `isActive: false` and `stock === 0`.
6. **Orders**: state machine `pending_payment → confirmed → processing → shipped → delivered` (or `cancelled`). Restock inventory in a transaction when cancelling before `shipped`.
7. **Price snapshot**: lock unit price and product details on the order document at creation time.
8. **Cart cache**: write-through — MongoDB is source of truth; Redis (or in-memory fallback) is a cache, never the only copy.
9. **Docs sync**: follow `DOCS_SYNC.md` whenever domain models or APIs change. Academic copy lives in `docs/project-book.md` and is served by `GET /api/docs`.

## Project map

| Project | Path | Role |
| --- | --- | --- |
| `@bloomstore/frontend` | `apps/frontend` | React 19 SPA |
| `@bloomstore/backend` | `apps/backend` | NestJS REST API |
| `@bloomstore/shared-types` | `libs/shared-types` | DTOs + Zod |

## Scaffolding

For new Nx apps/libs, prefer official generators (`npx nx g @nx/react:app`, `npx nx g @nx/nest:app`) after checking current flags with `--help`.
