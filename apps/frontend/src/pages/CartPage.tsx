import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { CartLineList } from '../components/CartLineList';
import { EmptyState } from '../components/layout/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { Price } from '../components/Price';
import { useCart } from '../context/CartContext';

export function CartPage() {
  const { cart } = useCart();
  const items = cart?.items ?? [];

  return (
    <PageShell maxWidth="md">
      <PageHeader
        eyebrow="Your bag"
        title="Shopping cart"
        subtitle="Review stems and quantities before checkout."
      />
      {items.length === 0 && (
        <EmptyState
          icon={<ShoppingBagOutlinedIcon />}
          title="Your cart is empty"
          description="Browse the catalog and add a bouquet when you find one you love."
          action={
            <Button variant="contained" component={RouterLink} to="/">
              Browse flowers
            </Button>
          }
        />
      )}
      <CartLineList />
      {items.length > 0 && (
        <SurfaceCard sx={{ mt: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Price value={cart?.subtotal ?? 0} variant="h5" color="text.primary" />
            </Stack>
            <Button variant="contained" size="large" component={RouterLink} to="/checkout">
              Checkout
            </Button>
          </Stack>
        </SurfaceCard>
      )}
    </PageShell>
  );
}
