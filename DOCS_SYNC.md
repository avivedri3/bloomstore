# Documentation-to-code synchronization protocol

BloomStore is both a running product and an ORT Software Technician diploma artifact (מכללת אורט סינגאלובסקי, מסלול טכנאי תוכנה). The Hebrew project book in `docs/project-book.md` must stay aligned with the repository.

The conversion procedure lives in the `docs/` folder, not in this file:

| Role | Path |
| --- | --- |
| Procedure | `docs/book-conversion-guide.md` |
| Appendix A — identity | `docs/student-qa-appendix.md` |
| Appendix B — code-to-chapter map | `docs/appendices/source-map.md` |
| Appendix C — required outline | `docs/appendices/book-outline.md` |
| Word design | `docs/docx-style-guide.md` |

Follow that guide when editing the book. Do not keep a second chapter map here.

## When this protocol applies

Update the project book in the **same change set** as the code when you:

- add, rename, or remove a MongoDB collection or Mongoose field
- change an HTTP route, status code, or `ApiResponse` envelope
- add a design pattern (Price Snapshot, Write-Through Cache, State Machine, Token Versioning, Account Lockout)
- change a screen, `App.tsx` route, or admin tab
- change a style token in `STYLE_GUIDE.md` or `tokens.ts`
- change CI/CD workflows or deployment targets
- change the testing plan (unit / E2E)
- change an identity fact in `docs/student-qa-appendix.md`

## Mapping

Chapter → source files: `docs/appendices/source-map.md`. Required headings: `docs/appendices/book-outline.md`.

## Live documentation

- Markdown source: `docs/project-book.md`
- API: `GET /api/docs` (NestJS streams the file)
- REST reference: `apps/backend/README.md`, served at `GET /api/docs/readme`
- OpenAPI: Swagger UI at `/api/swagger`, spec at `/api/swagger-json`
- Static HTML: GitHub Pages copies converted HTML next to the SPA during `deploy-gh-pages.yml` (source: GitHub Actions). Backend deploys via `deploy-backend.yml`.
- Word export: an additional Pages step, after the HTML conversion, writes `project-book.docx` from `docs/project-book.md` using `docs/docx-style-guide.md`. Regenerate with `python3 scripts/convert-project-book-docx.py`. Do not hand-edit the docx.

## Checklist before merge

1. Enums in shared-types match Mongoose enums.
2. Sequence diagrams still match the auth / checkout / cancel-restock flows.
3. Collection count remains 11 unless the book is updated first.
4. Hebrew chapter numbering stays 1–10.
