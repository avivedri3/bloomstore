import { alpha, createTheme } from '@mui/material/styles';
import { bloomTokens } from './tokens';

export const bloomTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: bloomTokens.color.rose,
      dark: bloomTokens.color.roseDark,
      light: bloomTokens.color.roseLight,
      contrastText: '#ffffff',
    },
    secondary: {
      main: bloomTokens.color.leaf,
      dark: bloomTokens.color.leafDark,
      contrastText: '#ffffff',
    },
    background: {
      default: bloomTokens.color.cream,
      paper: bloomTokens.color.parchment,
    },
    text: {
      primary: bloomTokens.color.ink,
      secondary: bloomTokens.color.muted,
    },
    divider: alpha(bloomTokens.color.ink, 0.08),
  },
  shape: { borderRadius: bloomTokens.radius.md },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif',
    h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, letterSpacing: '-0.03em' },
    h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, letterSpacing: '-0.03em' },
    h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    h6: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
    overline: { letterSpacing: '0.14em', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: bloomTokens.color.cream,
          backgroundImage: [
            `radial-gradient(ellipse 80% 50% at 0% -10%, ${alpha(bloomTokens.color.rose, 0.16)} 0%, transparent 55%)`,
            `radial-gradient(ellipse 60% 40% at 100% 0%, ${alpha(bloomTokens.color.leaf, 0.1)} 0%, transparent 50%)`,
            `radial-gradient(ellipse 50% 30% at 50% 100%, ${alpha(bloomTokens.color.rose, 0.08)} 0%, transparent 55%)`,
          ].join(', '),
          backgroundAttachment: 'fixed',
          color: bloomTokens.color.ink,
        },
        a: {
          color: bloomTokens.color.leaf,
          fontWeight: 600,
        },
        html: {
          scrollBehavior: 'smooth',
        },
        '@media (prefers-reduced-motion: reduce)': {
          html: { scrollBehavior: 'auto' },
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          backgroundColor: alpha(bloomTokens.color.parchment, 0.9),
          backdropFilter: 'blur(20px)',
          color: bloomTokens.color.ink,
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha(bloomTokens.color.ink, 0.06)}`,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
          '@media (min-width: 600px)': {
            minHeight: 72,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: bloomTokens.radius.pill,
          paddingInline: 20,
          transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        },
        containedPrimary: {
          '&:hover': { backgroundColor: bloomTokens.color.roseDark },
        },
        sizeLarge: {
          paddingBlock: 12,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease, transform 0.2s ease',
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: bloomTokens.radius.lg,
          border: `1px solid ${alpha(bloomTokens.color.ink, 0.06)}`,
          boxShadow: bloomTokens.shadow.card,
          backgroundColor: bloomTokens.color.parchment,
          overflow: 'hidden',
          transition: 'box-shadow 0.22s ease, transform 0.22s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: bloomTokens.radius.lg },
        outlined: {
          borderColor: alpha(bloomTokens.color.ink, 0.08),
          backgroundColor: bloomTokens.color.parchment,
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: bloomTokens.radius.md,
          backgroundColor: '#fff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
      variants: [
        {
          props: { variant: 'filled', color: 'default' },
          style: {
            backgroundColor: alpha(bloomTokens.color.leaf, 0.12),
            color: bloomTokens.color.leafDark,
          },
        },
      ],
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: 3 },
      },
    },
  },
});
