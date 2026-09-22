import { useEffect, useState } from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import { Link as RouterLink } from 'react-router-dom';
import type { OrderDto } from '@bloomstore/shared-types';
import { EmptyState } from '../components/layout/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { StatusChip } from '../components/StatusChip';
import { Price } from '../components/Price';
import { api, unwrap } from '../services/api';

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    unwrap<OrderDto[]>(api.get('/orders/mine'))
      .then(setOrders)
      .catch((e: Error) => setError(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell maxWidth="md">
      <PageHeader
        eyebrow="Account"
        title="My orders"
        subtitle="Prices are locked on the order at checkout."
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!error && orders.length === 0 && (
        <EmptyState
          icon={<LocalMallOutlinedIcon />}
          title="No orders yet"
          description="When you place an order, it will show up here with a price snapshot of each stem."
          action={
            <Button variant="contained" component={RouterLink} to="/">
              Browse flowers
            </Button>
          }
        />
      )}
      {orders.map((order) => (
        <SurfaceCard key={order.id}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1.5 }}>
            <Typography fontWeight={700}>{order.orderNumber}</Typography>
            <StatusChip status={order.status} />
          </Stack>
          <Price value={order.total} sx={{ mb: 1.5 }} />
          <Stack spacing={0.5} sx={{ mb: 1 }}>
            {order.items.map((item) => (
              <Typography key={item.productId} variant="body2" color="text.secondary">
                {item.name} · ₪{item.unitPrice} × {item.quantity}
              </Typography>
            ))}
          </Stack>
          {['pending_payment', 'confirmed', 'processing'].includes(order.status) && (
            <Button
              size="small"
              sx={{ mt: 1 }}
              onClick={() =>
                void unwrap(api.post(`/orders/${order.id}/cancel`))
                  .then(load)
                  .catch((e: Error) => setError(e.message))
              }
            >
              Cancel & restock
            </Button>
          )}
        </SurfaceCard>
      ))}
    </PageShell>
  );
}
