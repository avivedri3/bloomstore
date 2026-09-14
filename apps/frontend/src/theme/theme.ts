import { createTheme } from '@mui/material/styles';

export const bloomTheme = createTheme({
  palette: {
    primary: { main: '#c45c7a' },
    secondary: { main: '#3d6b4f' },
    background: { default: '#fbf6f0', paper: '#ffffff' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700 },
  },
});
