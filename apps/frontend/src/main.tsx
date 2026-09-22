import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { bloomTheme } from './theme/theme';
import './index.css';

const basename = import.meta.env.VITE_BASE_URL || '/bloomstore/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={bloomTheme}>
      <CssBaseline />
      <BrowserRouter basename={basename.endsWith('/') && basename !== '/' ? basename.slice(0, -1) : basename}>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
