import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Container, MenuItem, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api, unwrap } from '../services/api';
import { useCart } from '../context/CartContext';

interface AddressRow {
  _id?: string;
  id?: string;
  city: string;
  street: string;
  houseNumber: string;
  fullName: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, refresh } = useCart();
  const [addresses, setAddresses] = useState<AddressRow[]>([]);
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
    unwrap<AddressRow[]>(api.get('/addresses')).then((rows) => {
      setAddresses(rows);
      const first = rows[0];
      const id = first?._id ?? first?.id;
      if (id) setAddressId(id);
    }).catch((e: Error) => setError(e.message));
  }, []);

  const addAddress = async (e: FormEvent) => {
    e.preventDefault();
    const created = await unwrap<AddressRow>(api.post('/addresses', { ...form, isDefault: true }));
    const id = created._id ?? created.id ?? '';
    setAddresses((prev) => [created, ...prev]);
    setAddressId(id);
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
    <Container className="py-8 max-w-2xl">
      <Typography variant="h4" className="mb-4">
        Checkout
      </Typography>
      {error && (
        <Alert severity="error" className="mb-3">
          {error}
        </Alert>
      )}
      <Typography className="mb-2">Cart total ₪{cart?.subtotal ?? 0}</Typography>
      <TextField
        select
        fullWidth
        label="Ship to"
        value={addressId}
        onChange={(e) => setAddressId(e.target.value)}
        className="mb-4"
      >
        {addresses.map((a) => {
          const id = a._id ?? a.id ?? '';
          return (
            <MenuItem key={id} value={id}>
              {a.fullName}, {a.street} {a.houseNumber}, {a.city}
            </MenuItem>
          );
        })}
      </TextField>
      <form className="mb-6 grid gap-3" onSubmit={(e) => void addAddress(e)}>
        <Typography variant="h6">New address</Typography>
        {(['fullName', 'phone', 'city', 'street', 'houseNumber'] as const).map((field) => (
          <TextField
            key={field}
            label={field}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            required
          />
        ))}
        <Button type="submit" variant="outlined">
          Save address
        </Button>
      </form>
      <Button variant="contained" disabled={!addressId || (cart?.items.length ?? 0) === 0} onClick={() => void placeOrder()}>
        Place order (price snapshot)
      </Button>
    </Container>
  );
}
