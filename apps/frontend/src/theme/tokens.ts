/** Design tokens — keep in sync with `theme.ts` and STYLE_GUIDE.md */
export const bloomTokens = {
  color: {
    rose: '#c45c7a', // dusty rose — primary actions
    roseDark: '#a84862',
    roseLight: '#f3d4de',
    leaf: '#3d6b4f', // sage green — accents and links
    leafDark: '#2d5040',
    cream: '#fbf6f0', // warm off-white page wash
    creamDark: '#f0e6da',
    parchment: '#fffaf6',
    ink: '#1f2933', // dark charcoal
    muted: '#5f6b7a',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    pill: 999,
  },
  shadow: {
    card: '0 10px 30px rgba(196, 92, 122, 0.08), 0 2px 8px rgba(31, 41, 51, 0.05)',
    cardHover: '0 18px 40px rgba(196, 92, 122, 0.16), 0 6px 16px rgba(31, 41, 51, 0.08)',
    header: '0 1px 0 rgba(31, 41, 51, 0.06)',
  },
} as const;
