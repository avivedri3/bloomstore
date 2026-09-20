import { Button, IconButton, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { useCart } from '../context/CartContext';

export function CartPage() {
  const { cart, upsert, remove } = useCart();
  const items = cart?.items ?? [];

  return (
    <PageShell maxWidth="md">
      <PageHeader title="Shopping cart" subtitle="Review items before checkout." />
      {items.length === 0 && <Typography color="text.secondary">Your cart is empty.</Typography>}
      {items.map((item) => (
        <SurfaceCard key={item.productId}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack spacing={0.5}>
              <Typography fontWeight={600}>{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                ₪{item.unitPrice} × {item.quantity}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Button size="small" onClick={() => void upsert(item.productId, Math.max(1, item.quantity - 1))}>
                −
              </Button>
              <Button size="small" onClick={() => void upsert(item.productId, item.quantity + 1)}>
                +
              </Button>
              <IconButton color="error" aria-label="Remove item" onClick={() => void remove(item.productId)}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Stack>
        </SurfaceCard>
      ))}
      {items.length > 0 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2} sx={{ mt: 2 }}>
          <Typography variant="h6">Subtotal ₪{cart?.subtotal ?? 0}</Typography>
          <Button variant="contained" size="large" component={RouterLink} to="/checkout">
            Checkout
          </Button>
        </Stack>
      )}
    </PageShell>
  );
}
