import { Chip } from '@mui/material';
import type { OrderStatus } from '@bloomstore/shared-types';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../utils/orders';

export function StatusChip({ status }: { status: OrderStatus }) {
  return <Chip size="small" color={ORDER_STATUS_COLORS[status]} label={ORDER_STATUS_LABELS[status]} />;
}
