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
      paper: '#ffffff',
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
    h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    h4: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: bloomTokens.color.cream,
          color: bloomTokens.color.ink,
        },
        a: {
          color: bloomTokens.color.leaf,
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(135deg, ${bloomTokens.color.rose} 0%, ${bloomTokens.color.roseDark} 100%)`,
          boxShadow: bloomTokens.shadow.header,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: bloomTokens.radius.pill, paddingInline: 20 },
        containedPrimary: {
          '&:hover': { backgroundColor: bloomTokens.color.roseDark },
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
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: bloomTokens.radius.lg },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        filled: {
          backgroundColor: alpha(bloomTokens.color.leaf, 0.12),
          color: bloomTokens.color.leafDark,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: 3 },
      },
    },
  },
});
