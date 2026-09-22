import type { ChipProps } from '@mui/material';
import type { OrderStatus } from '@bloomstore/shared-types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, ChipProps['color']> = {
  pending_payment: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'default',
};
