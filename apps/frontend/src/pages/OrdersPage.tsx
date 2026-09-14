import { useEffect, useState } from 'react';
import { Button, Chip, Container, Typography } from '@mui/material';
import type { OrderDto } from '@bloomstore/shared-types';
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
    <Container className="py-8 max-w-3xl">
      <Typography variant="h4" className="mb-4">
        My orders
      </Typography>
      {orders.length === 0 && <Typography>No orders yet.</Typography>}
      {orders.map((order) => (
        <div key={order.id} className="mb-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <Typography fontWeight={700}>{order.orderNumber}</Typography>
            <Chip label={order.status} />
          </div>
          <Typography variant="body2">₪{order.total}</Typography>
          {order.items.map((item) => (
            <Typography key={item.productId} variant="caption" display="block">
              {item.name} · snapshot ₪{item.unitPrice} × {item.quantity}
            </Typography>
          ))}
          {['pending_payment', 'confirmed', 'processing'].includes(order.status) && (
            <Button
              size="small"
              className="mt-2"
              onClick={() => void unwrap(api.post(`/orders/${order.id}/cancel`)).then(load)}
            >
              Cancel & restock
            </Button>
          )}
        </div>
      ))}
    </Container>
  );
}
