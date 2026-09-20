/** Design tokens — keep in sync with `theme.ts` and STYLE_GUIDE.md */
export const bloomTokens = {
  color: {
    rose: '#c45c7a',
    roseDark: '#a84862',
    roseLight: '#f3d4de',
    leaf: '#3d6b4f',
    leafDark: '#2d5040',
    cream: '#fbf6f0',
    creamDark: '#f0e6da',
    ink: '#1f2933',
    muted: '#5f6b7a',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  shadow: {
    card: '0 4px 24px rgba(31, 41, 51, 0.08)',
    header: '0 1px 0 rgba(31, 41, 51, 0.06)',
  },
} as const;
