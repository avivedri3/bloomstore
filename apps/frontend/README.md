# BloomStore frontend

React 19 SPA with **MUI v7**: catalog, auth, cart, checkout, orders, and admin dashboard.

```bash
npx nx serve frontend
```

Local app: http://localhost:3000/bloomstore/

The client calls `VITE_API_BASE_URL` when that variable is set, and `http://localhost:3030/api` otherwise.

## UI & style

- **Style guide:** [STYLE_GUIDE.md](./STYLE_GUIDE.md) — tokens, layout primitives, MUI patterns.
- **Theme:** `src/theme/theme.ts` (Fraunces + DM Sans, rose/leaf/cream palette).
- **Layout helpers:** `src/components/layout/` (`PageShell`, `PageHeader`, `SurfaceCard`).
