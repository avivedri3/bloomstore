import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { api, unwrap } from '../services/api';
import { useCart } from '../context/CartContext';
import type { AddressDto } from '@bloomstore/shared-types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, refresh } = useCart();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [addressId, setAddressId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    street: '',
    houseNumber: '1',
  });

  useEffect(() => {
    unwrap<AddressDto[]>(api.get('/addresses'))
      .then((rows) => {
        setAddresses(rows);
        const first = rows[0];
        if (first?.id) setAddressId(first.id);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const addAddress = async (e: FormEvent) => {
    e.preventDefault();
    const created = await unwrap<AddressDto>(api.post('/addresses', { ...form, isDefault: true }));
    setAddresses((prev) => [created, ...prev]);
    setAddressId(created.id);
  };

  const placeOrder = async () => {
    setError(null);
    try {
      await unwrap(
        api.post('/orders/checkout', {
          addressId,
          idempotencyKey: crypto.randomUUID(),
        }),
      );
      await refresh();
      navigate('/orders');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <PageShell maxWidth="sm">
      <PageHeader title="Checkout" subtitle="Choose a delivery address and confirm your order." />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <SurfaceCard>
        <Typography variant="subtitle1" fontWeight={600}>
          Order summary
        </Typography>
        <Typography color="text.secondary">Cart total ₪{cart?.subtotal ?? 0}</Typography>
      </SurfaceCard>
      <TextField
        select
        fullWidth
        label="Ship to"
        value={addressId}
        onChange={(e) => setAddressId(e.target.value)}
        sx={{ mb: 3 }}
      >
        {addresses.map((a) => (
          <MenuItem key={a.id} value={a.id}>
            {a.fullName}, {a.street} {a.houseNumber}, {a.city}
          </MenuItem>
        ))}
      </TextField>
      <Divider sx={{ mb: 3 }} />
      <Stack component="form" spacing={2} onSubmit={(e) => void addAddress(e)} sx={{ mb: 3 }}>
        <Typography variant="h6">New address</Typography>
        {(['fullName', 'phone', 'city', 'street', 'houseNumber'] as const).map((field) => (
          <TextField
            key={field}
            label={field}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            required
            fullWidth
          />
        ))}
        <Button type="submit" variant="outlined">
          Save address
        </Button>
      </Stack>
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={!addressId || (cart?.items.length ?? 0) === 0}
        onClick={() => void placeOrder()}
      >
        Place order (price snapshot)
      </Button>
    </PageShell>
  );
}
