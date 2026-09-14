# Documentation-to-code synchronization protocol

BloomStore is both a running product and an ORT diploma artifact. The Hebrew project book in `docs/project-book.md` must stay aligned with the repository.

## When this protocol applies

Update the project book in the **same change set** as the code when you:

- add, rename, or remove a MongoDB collection or Mongoose field
- change an HTTP route, status code, or `ApiResponse` envelope
- add a design pattern (Price Snapshot, Write-Through Cache, State Machine, Token Versioning, Account Lockout)
- change CI/CD workflows or deployment targets
- change the testing plan (unit / E2E)

## Mapping (chapter → source of truth)

| Chapter | Code / config source |
| --- | --- |
| 1 מבוא | `README.md` |
| 2 תיאור המערכת | `AGENTS.md`, frontend routes, backend modules |
| 3 ניתוח | Use cases in `docs/project-book.md` ↔ controllers |
| 4 עיצוב | 3-tier folders under `apps/backend/src` |
| 5 מסד נתונים | `apps/backend/src/**/models` (11 collections) |
| 6 מימוש | Services + `libs/shared-types` |
| 7 ממשק | `apps/frontend/src/pages` |
| 8 בדיקות | `*.spec.ts`, `*.test.tsx`, STP chapter |
| 9 הדרכה | README + seed users |
| 10 סיכום | Keep lessons learned current |

## Live documentation

- Markdown source: `docs/project-book.md`
- API: `GET /api/docs` (NestJS streams the file)
- Static: GitHub Pages copies converted HTML next to the SPA during `deploy-gh-pages.yml`

## Checklist before merge

1. Enums in shared-types match Mongoose enums.
2. Sequence diagrams still match the auth / checkout / cancel-restock flows.
3. Collection count remains 11 unless the book is updated first.
4. Hebrew chapter numbering stays 1–10.
