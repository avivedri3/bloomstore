import { useEffect, useState } from 'react';
import { Button, Chip, Stack, Typography } from '@mui/material';
import type { OrderDto } from '@bloomstore/shared-types';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { api, unwrap } from '../services/api';

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);

  const load = () => {
    unwrap<OrderDto[]>(api.get('/orders/mine')).then(setOrders);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell maxWidth="md">
      <PageHeader title="My orders" subtitle="Price snapshots are locked at checkout time." />
      {orders.length === 0 && <Typography color="text.secondary">No orders yet.</Typography>}
      {orders.map((order) => (
        <SurfaceCard key={order.id}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
            <Typography fontWeight={700}>{order.orderNumber}</Typography>
            <Chip label={order.status} size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Total ₪{order.total}
          </Typography>
          {order.items.map((item) => (
            <Typography key={item.productId} variant="caption" display="block" color="text.secondary">
              {item.name} · snapshot ₪{item.unitPrice} × {item.quantity}
            </Typography>
          ))}
          {['pending_payment', 'confirmed', 'processing'].includes(order.status) && (
            <Button size="small" sx={{ mt: 2 }} onClick={() => void unwrap(api.post(`/orders/${order.id}/cancel`)).then(load)}>
              Cancel & restock
            </Button>
          )}
        </SurfaceCard>
      ))}
    </PageShell>
  );
}
