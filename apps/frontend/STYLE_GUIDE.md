# BloomStore frontend style guide

Modern, calm e-commerce UI built on **MUI v7** and a small custom theme. Prefer MUI layout and `sx` over ad-hoc CSS.

## Principles

1. **MUI first** — `Box`, `Stack`, `Grid`, `Paper`, `Typography`, `Button`, `TextField`, `Card`.
2. **Theme tokens** — colors, radius, and typography come from `src/theme/theme.ts` and `src/theme/tokens.ts`.
3. **Consistent pages** — wrap screens in `PageShell`, titles in `PageHeader`, list rows in `SurfaceCard`.
4. **Accessible defaults** — visible focus rings (MUI), semantic headings (`h1` on page titles), sufficient contrast on cream background.
5. **Tailwind** — limited to legacy utilities; new UI should not add Tailwind classes.

## Brand

| Token | Value | Usage |
| --- | --- | --- |
| Rose | `#c45c7a` | Primary actions, app bar gradient |
| Leaf | `#3d6b4f` | Secondary accents, links, success chips |
| Cream | `#fbf6f0` | Page background |
| Ink | `#1f2933` | Body text |

**Typography:** [Fraunces](https://fonts.google.com/specimen/Fraunces) for headings, [DM Sans](https://fonts.google.com/specimen/DM+Sans) for UI copy.

## Layout

| Component | When to use |
| --- | --- |
| `PageShell` | Default page container (`maxWidth="lg"`, vertical padding) |
| `PageHeader` | Title + optional subtitle + toolbar actions |
| `SurfaceCard` | Cart lines, orders, admin rows |
| `PageLoading` | Auth gate / async shell |

**App shell:** `AppBar` (sticky) → `main` (flex grow) → `Footer`.

## Components

- **Buttons:** `variant="contained"` for primary CTA, `outlined` for secondary, `text` in app bar. No ALL CAPS (`textTransform: 'none'` globally).
- **Forms:** `TextField` `outlined`, full width on narrow pages (`maxWidth="sm"` shell).
- **Feedback:** `Alert` for errors, `Chip` for status, `CircularProgress` for loading.
- **Catalog:** `Card` + `CardMedia` (200px height) + `Chip` category + `CardActions`.
- **Spacing:** use theme spacing (`sx={{ mt: 2 }}`) or `Stack spacing={2}` — prefer `2`, `3`, `4` for rhythm.

## `sx` examples

```tsx
<Stack direction="row" spacing={2} alignItems="center">
  <Typography variant="h6">₪{price}</Typography>
</Stack>

<Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }} />
```

## Files

| Path | Role |
| --- | --- |
| `src/theme/tokens.ts` | Raw design tokens |
| `src/theme/theme.ts` | MUI `createTheme` + component overrides |
| `src/main.tsx` | `ThemeProvider` + `CssBaseline` |
| `src/components/layout/*` | Shared layout primitives |

## Checklist for new screens

- [ ] Uses `PageShell` + `PageHeader`
- [ ] No new hard-coded hex colors (use `theme.palette` or tokens)
- [ ] Loading and empty states use MUI typography / progress
- [ ] Primary action is a contained button at the end of the flow
