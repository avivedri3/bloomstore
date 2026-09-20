# BloomStore API (`@bloomstore/backend`)

NestJS REST API for the BloomStore monorepo. Controllers are thin; business rules live in `services/`; persistence in `models/`.

## Base URL

| Environment | URL |
| --- | --- |
| Local | `http://localhost:3030/api` |

## Documentation

| Resource | URL |
| --- | --- |
| **Swagger UI** (try endpoints) | [http://localhost:3030/api/swagger](http://localhost:3030/api/swagger) |
| **OpenAPI JSON** | [http://localhost:3030/api/swagger-json](http://localhost:3030/api/swagger-json) |
| **This readme (raw markdown)** | [http://localhost:3030/api/docs/readme](http://localhost:3030/api/docs/readme) |
| **Hebrew project book** | [http://localhost:3030/api/docs](http://localhost:3030/api/docs) |

## Response envelope

Success:

```json
{ "success": true, "data": { } }
```

Error:

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { } }
}
```

Common HTTP status codes: `400` validation, `401` unauthorized, `403` forbidden, `404` not found, `423` account locked (`ACCOUNT_LOCKED`), `429` rate limit on auth routes.

## Authentication

1. `POST /api/auth/login` or `POST /api/auth/register` → `data.accessToken` (JWT).
2. Send `Authorization: Bearer <accessToken>` on protected routes.
3. `POST /api/auth/logout` increments `tokenVersion` and invalidates existing tokens.

Rate limit: ~20 login/register attempts per IP per minute.

## Endpoints (summary)

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | — | Service liveness |

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | — | Create customer account |
| POST | `/auth/login` | — | Obtain JWT |
| POST | `/auth/logout` | JWT | Revoke session |
| GET | `/auth/me` | JWT | Current user profile |

### Products

Public listings hide `isActive: false` and `stock === 0`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/products` | — | Public catalog (`?category=`) |
| GET | `/products/:id` | — | Public product detail |
| GET | `/products/admin` | Admin | All products |
| POST | `/products` | Admin | Create product |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Soft-delete (deactivate) |

### Cart

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/cart` | JWT | Get cart |
| PUT | `/cart/items` | JWT | Add/update line item |
| DELETE | `/cart/items/:productId` | JWT | Remove line item |

### Addresses

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/addresses` | JWT | List user addresses |
| POST | `/addresses` | JWT | Add address |

### Orders

State machine: `pending_payment → confirmed → processing → shipped → delivered` (or `cancelled`). Prices are snapshotted on the order at checkout.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/orders/checkout` | JWT | Create order from cart |
| GET | `/orders/mine` | JWT | Customer order history |
| GET | `/orders/:id` | JWT | Order detail (owner or admin) |
| POST | `/orders/:id/cancel` | JWT | Cancel (restock if before `shipped`) |
| GET | `/orders/admin` | Admin | All orders (`?status=`) |
| PATCH | `/orders/:id/status` | Admin | Advance order status |

### Admin analytics

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/admin/stats` | Admin | Dashboard metrics |

### Webhooks

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/webhooks/payments` | — | Idempotent payment events |

### Documentation

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/docs` | — | Project book (`docs/project-book.md`) |
| GET | `/docs/readme` | — | This file |

## Request bodies (Zod)

Shared schemas live in `libs/shared-types` (`registerSchema`, `loginSchema`, `productInputSchema`, `cartItemInputSchema`, `addressInputSchema`, `checkoutSchema`, `orderStatusUpdateSchema`). See Swagger UI for examples.

## Local setup

```bash
cp apps/backend/.env.example apps/backend/.env
# MONGODB_URI, JWT_SECRET required
npm install
npx nx serve backend
```

From repo root: `npm run dev` runs frontend and backend together.

## Security (pipeline)

Helmet, CORS whitelist (`CORS_ORIGINS`), NoSQL sanitization, JWT + `tokenVersion`, account lockout after 5 failed logins.
