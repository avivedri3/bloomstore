import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PageLoading } from './components/layout/PageLoading';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminPage } from './pages/AdminPage';
import { useAuth } from './context/AuthContext';

function Private({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/cart"
            element={
              <Private>
                <CartPage />
              </Private>
            }
          />
          <Route
            path="/checkout"
            element={
              <Private>
                <CheckoutPage />
              </Private>
            }
          />
          <Route
            path="/orders"
            element={
              <Private>
                <OrdersPage />
              </Private>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminOnly>
                <AdminPage />
              </AdminOnly>
            }
          />
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}
