import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { addressInputSchema, type AddressDto } from '@bloomstore/shared-types';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { api, unwrap } from '../services/api';
import { useCart } from '../context/CartContext';
import { fieldErrorsFromZod } from '../utils/form';

const emptyAddress = {
  fullName: '',
  phone: '',
  city: '',
  street: '',
  houseNumber: '',
};

function addressIdOf(row: AddressDto & { _id?: string }): string {
  return row.id || (row._id ? String(row._id) : '');
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, refresh } = useCart();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [addressId, setAddressId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savingAddress, setSavingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState(emptyAddress);

  useEffect(() => {
    unwrap<AddressDto[]>(api.get('/addresses'))
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setAddresses(list);
        const firstId = list[0] ? addressIdOf(list[0]) : '';
        if (firstId) setAddressId(firstId);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const addAddress = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const parsed = addressInputSchema.safeParse({ ...form, isDefault: true });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});
    setSavingAddress(true);
    try {
      const created = await unwrap<AddressDto>(api.post('/addresses', parsed.data));
      const id = addressIdOf(created);
      if (!id) {
        setError('Address saved, but the server did not return an id. Refresh and try again.');
        return;
      }
      setAddresses((prev) => [created, ...prev]);
      setAddressId(id);
      setForm(emptyAddress);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingAddress(false);
    }
  };

  const placeOrder = async () => {
    setError(null);
    if (!addressId) {
      setError('Choose or save a delivery address first.');
      return;
    }
    setPlacing(true);
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
    } finally {
      setPlacing(false);
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
        id="checkout-address"
        name="shipping-address"
        select
        fullWidth
        label="Ship to"
        autoComplete="off"
        value={addressId}
        onChange={(e) => setAddressId(e.target.value)}
        sx={{ mb: 3 }}
      >
        {addresses.length === 0 ? (
          <MenuItem value="" disabled>
            Save an address below
          </MenuItem>
        ) : (
          <MenuItem value="" disabled>
            Choose an address
          </MenuItem>
        )}
        {addresses.map((a) => (
          <MenuItem key={addressIdOf(a)} value={addressIdOf(a)}>
            {a.fullName}, {a.street} {a.houseNumber}, {a.city}
          </MenuItem>
        ))}
      </TextField>
      <Divider sx={{ mb: 3 }} />
      <Stack component="form" spacing={2} autoComplete="shipping" onSubmit={(e) => void addAddress(e)} sx={{ mb: 3 }}>
        <Typography variant="h6">New address</Typography>
        <TextField
          id="shipping-name"
          name="name"
          label="Full name"
          autoComplete="shipping name"
          value={form.fullName}
          onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
          error={Boolean(fieldErrors.fullName)}
          helperText={fieldErrors.fullName}
          required
          fullWidth
        />
        <TextField
          id="shipping-tel"
          name="tel"
          label="Phone"
          type="tel"
          autoComplete="shipping tel"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          error={Boolean(fieldErrors.phone)}
          helperText={fieldErrors.phone}
          required
          fullWidth
          slotProps={{ htmlInput: { inputMode: 'tel', minLength: 7 } }}
        />
        <TextField
          id="shipping-city"
          name="city"
          label="City"
          autoComplete="shipping address-level2"
          value={form.city}
          onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
          error={Boolean(fieldErrors.city)}
          helperText={fieldErrors.city}
          required
          fullWidth
        />
        <TextField
          id="shipping-street"
          name="address-line1"
          label="Street"
          autoComplete="shipping address-line1"
          value={form.street}
          onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
          error={Boolean(fieldErrors.street)}
          helperText={fieldErrors.street}
          required
          fullWidth
        />
        <TextField
          id="shipping-house-number"
          name="address-line2"
          label="House number"
          autoComplete="shipping address-line2"
          value={form.houseNumber}
          onChange={(e) => setForm((prev) => ({ ...prev, houseNumber: e.target.value }))}
          error={Boolean(fieldErrors.houseNumber)}
          helperText={fieldErrors.houseNumber}
          required
          fullWidth
        />
        <Button type="submit" variant="outlined" disabled={savingAddress}>
          {savingAddress ? 'Saving…' : 'Save address'}
        </Button>
      </Stack>
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={!addressId || (cart?.items.length ?? 0) === 0 || placing}
        onClick={() => void placeOrder()}
      >
        {placing ? 'Placing order…' : 'Place order (price snapshot)'}
      </Button>
    </PageShell>
  );
}
