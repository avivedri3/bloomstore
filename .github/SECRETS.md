# GitHub Actions secrets and variables

BloomStore does not need Docker Hub. Render builds the backend image from this repository.

## Secrets (Settings → Secrets and variables → Actions → Secrets)

| Secret | Required | Used by |
| --- | --- | --- |
| `RENDER_DEPLOY_HOOK` | For automatic API deploys | `deploy-backend.yml` |

Create the hook in Render → BloomStore web service → **Settings → Deploy Hook**.

`GITHUB_TOKEN` is provided by Actions; do not add it yourself.

## Variables (Settings → Secrets and variables → Actions → Variables)

| Variable | Required | Used by |
| --- | --- | --- |
| `VITE_API_BASE_URL` | For a working live catalog | `deploy-gh-pages.yml`, `ci.yml` |

Example: `https://bloomstore.onrender.com/api` (no trailing slash issues — include `/api`).

The SPA bakes this URL in at build time. After you set or change it, rerun **Deploy to GitHub Pages**.
