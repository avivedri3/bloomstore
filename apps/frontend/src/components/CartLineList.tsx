import { useState } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import type { CartItemDto } from '@bloomstore/shared-types';
import { SurfaceCard } from './layout/SurfaceCard';
import { useCart } from '../context/CartContext';

type CartLineListProps = {
  embedded?: boolean;
};

function CartLineRow({
  item,
  busy,
  removing,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItemDto;
  busy: boolean;
  removing: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
        <Box
          component="img"
          src={item.imageUrl}
          alt={item.name}
          sx={{
            width: { xs: 64, sm: 88 },
            height: { xs: 64, sm: 88 },
            objectFit: 'cover',
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={600}>{item.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            ₪{item.unitPrice} each
          </Typography>
        </Stack>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
        flexWrap="wrap"
        useFlexGap
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 999,
            px: 0.5,
          }}
        >
          <Button
            size="small"
            aria-label={item.quantity <= 1 ? `Remove ${item.name}` : `Decrease ${item.name}`}
            disabled={busy}
            onClick={onDecrease}
            sx={{ minWidth: 36 }}
          >
            −
          </Button>
          <Typography sx={{ minWidth: 24, textAlign: 'center' }} aria-live="polite">
            {item.quantity}
          </Typography>
          <Button
            size="small"
            aria-label={`Increase ${item.name}`}
            disabled={busy}
            onClick={onIncrease}
            sx={{ minWidth: 36 }}
          >
            +
          </Button>
        </Box>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteOutlineRoundedIcon />}
          disabled={busy}
          onClick={onRemove}
        >
          {removing ? 'Removing…' : 'Remove'}
        </Button>
      </Stack>
    </Stack>
  );
}

export function CartLineList({ embedded = false }: CartLineListProps) {
  const { cart, upsert, remove } = useCart();
  const items = cart?.items ?? [];
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<{ id: string; kind: 'remove' | 'update' } | null>(null);

  const run = async (productId: string, kind: 'remove' | 'update', action: () => Promise<void>) => {
    setError(null);
    setBusy({ id: productId, kind });
    try {
      await action();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (items.length === 0) {
    return error ? (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    ) : null;
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {items.map((item, index) => {
        const itemBusy = busy?.id === item.productId;
        const row = (
          <CartLineRow
            item={item}
            busy={itemBusy}
            removing={itemBusy && busy?.kind === 'remove'}
            onDecrease={() =>
              void run(item.productId, item.quantity <= 1 ? 'remove' : 'update', () =>
                upsert(item.productId, item.quantity - 1),
              )
            }
            onIncrease={() => void run(item.productId, 'update', () => upsert(item.productId, item.quantity + 1))}
            onRemove={() => void run(item.productId, 'remove', () => remove(item.productId))}
          />
        );
        if (embedded) {
          return (
            <Box
              key={item.productId}
              sx={{
                py: 1.5,
                borderBottom: index < items.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              {row}
            </Box>
          );
        }
        return <SurfaceCard key={item.productId}>{row}</SurfaceCard>;
      })}
    </>
  );
}
