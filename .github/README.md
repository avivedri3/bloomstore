# GitHub Workflows

Automated CI/CD for BloomStore, based on the iAgent pipeline and updated for this shop: official GitHub Pages actions, Node 24, and Render building the backend Dockerfile itself.

## Available workflows

### Continuous Integration (`ci.yml`)

- **Triggers:** Push to `main` / `develop`, pull requests to `main`, manual dispatch
- **Jobs:**
  - Quality — affected lint + typecheck
  - Test — affected unit tests
  - Build — affected production build
  - Security — `npm audit --audit-level=high`

### Deploy Backend to Render (`deploy-backend.yml`)

- **Triggers:** Push to `main` (when `@bloomstore/backend` is affected), manual dispatch
- **Purpose:** Verify the NestJS production build, then POST the Render deploy hook
- Render still builds from `apps/backend/Dockerfile` with context `.` (see `RENDER_DEPLOYMENT.md`)

### Deploy to GitHub Pages (`deploy-gh-pages.yml`)

- **Triggers:** After a successful backend deploy workflow (including backend-unaffected skips), or manual dispatch
- **Purpose:** Build the React SPA + project-book HTML and publish with GitHub Actions Pages
- **Live:** https://avivedri3.github.io/bloomstore/
- **Docs:** https://avivedri3.github.io/bloomstore/docs/

## Deployment process

1. Push to `main`
2. CI runs quality, tests, build, and audit
3. If the backend changed, Render is triggered via `RENDER_DEPLOY_HOOK`
4. GitHub Pages then rebuilds the storefront (same chain as iAgent: backend workflow → Pages)

Manual:

```bash
gh workflow run ci.yml
gh workflow run deploy-backend.yml
gh workflow run deploy-gh-pages.yml
```

## Configuration

| Name | Where | Purpose |
| --- | --- | --- |
| `VITE_BASE_URL` | workflow env | `/bloomstore/` |
| `VITE_API_BASE_URL` | repo **variable** (optional) | API base including `/api`. Unset builds call `http://localhost:3030/api` |
| `RENDER_DEPLOY_HOOK` | repo **secret** | Render deploy hook URL |

GitHub → **Settings → Pages → Source: GitHub Actions**.

## Troubleshooting

**Build fails** — read the Actions log for TypeScript / Nx errors; confirm `npm ci` can install from `package-lock.json`.

**Pages fails** — Pages source must be GitHub Actions; the workflow needs `pages: write` and `id-token: write`.

**Catalog calls localhost** — that is the fallback when `VITE_API_BASE_URL` is unset. Set the variable to the live API, then rerun **Deploy to GitHub Pages**.

**Render not updating** — add `RENDER_DEPLOY_HOOK`, or deploy from the Render dashboard as in `RENDER_DEPLOYMENT.md`.
