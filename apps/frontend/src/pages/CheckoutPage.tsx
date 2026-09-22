import { useEffect, useState, type FormEvent } from 'react';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { addressInputSchema, type AddressDto } from '@bloomstore/shared-types';
import { CartLineList } from '../components/CartLineList';
import { EmptyState } from '../components/layout/EmptyState';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { Price } from '../components/Price';
import { api, unwrap } from '../services/api';
import { useCart } from '../context/CartContext';
import { fieldErrorsFromZod, telInputAttrs } from '../utils/form';

const emptyAddress = {
  fullName: '',
  phone: '',
  city: '',
  street: '',
  houseNumber: '',
  apartment: '',
};

function addressIdOf(row: AddressDto & { _id?: string }): string {
  return row.id || (row._id ? String(row._id) : '');
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, refresh } = useCart();
  const items = cart?.items ?? [];
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
    const parsed = addressInputSchema.safeParse({
      ...form,
      apartment: form.apartment.trim() || undefined,
      isDefault: true,
    });
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
    <PageShell maxWidth="md">
      <PageHeader
        eyebrow="Almost there"
        title="Checkout"
        subtitle="Adjust quantities, choose a delivery address, then confirm. Unit prices lock when you place the order."
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBagOutlinedIcon />}
          title="Your cart is empty"
          description="Add flowers before placing an order."
          action={
            <Button variant="contained" component={RouterLink} to="/">
              Browse flowers
            </Button>
          }
        />
      ) : (
        <>
          <SurfaceCard>
            <Typography variant="overline" color="primary.main">
              Order summary
            </Typography>
            <CartLineList embedded />
            <Stack spacing={0.5} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Price value={cart?.subtotal ?? 0} variant="h5" />
            </Stack>
          </SurfaceCard>
          <SurfaceCard>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Delivery address
            </Typography>
            <TextField
              id="checkout-address"
              name="shipping-address"
              select
              fullWidth
              label="Ship to"
              autoComplete="off"
              value={addressId}
              onChange={(e) => setAddressId(e.target.value)}
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
          </SurfaceCard>
          <SurfaceCard>
            <Stack component="form" method="post" spacing={2} autoComplete="on" onSubmit={(e) => void addAddress(e)}>
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
                slotProps={{ htmlInput: { minLength: 2, autoCapitalize: 'words' } }}
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
                slotProps={{ htmlInput: telInputAttrs }}
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
                slotProps={{ htmlInput: { minLength: 2 } }}
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
                slotProps={{ htmlInput: { minLength: 2 } }}
              />
              <TextField
                id="shipping-house-number"
                name="house-number"
                label="House number"
                autoComplete="off"
                value={form.houseNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, houseNumber: e.target.value }))}
                error={Boolean(fieldErrors.houseNumber)}
                helperText={fieldErrors.houseNumber}
                required
                fullWidth
                slotProps={{ htmlInput: { minLength: 1 } }}
              />
              <TextField
                id="shipping-apartment"
                name="address-line2"
                label="Apartment (optional)"
                autoComplete="shipping address-line2"
                value={form.apartment}
                onChange={(e) => setForm((prev) => ({ ...prev, apartment: e.target.value }))}
                error={Boolean(fieldErrors.apartment)}
                helperText={fieldErrors.apartment}
                fullWidth
              />
              <Button type="submit" variant="outlined" disabled={savingAddress} sx={{ alignSelf: 'flex-start' }}>
                {savingAddress ? 'Saving…' : 'Save address'}
              </Button>
            </Stack>
          </SurfaceCard>
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!addressId || placing}
            onClick={() => void placeOrder()}
          >
            {placing ? 'Placing order…' : 'Place order'}
          </Button>
        </>
      )}
    </PageShell>
  );
}
