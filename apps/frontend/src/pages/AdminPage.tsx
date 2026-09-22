import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  canTransition,
  productInputSchema,
  type AdminStatsDto,
  type OrderDto,
  type OrderStatus,
  type ProductDto,
} from '@bloomstore/shared-types';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { StatusChip } from '../components/StatusChip';
import { Price } from '../components/Price';
import { api, unwrap } from '../services/api';
import { fieldErrorsFromZod } from '../utils/form';

const emptyProductForm = {
  name: '',
  description: '',
  category: 'bouquets' as (typeof PRODUCT_CATEGORIES)[number],
  price: '',
  stock: '',
  imageUrl: '',
  isActive: true,
};

export function AdminPage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [status, setStatus] = useState<string>('');
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [form, setForm] = useState(emptyProductForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = () => unwrap<ProductDto[]>(api.get('/products/admin')).then(setProducts);
  const loadOrders = () =>
    unwrap<OrderDto[]>(api.get(`/orders/admin${status ? `?status=${status}` : ''}`)).then(setOrders);
  const loadStats = () => unwrap<AdminStatsDto>(api.get('/admin/stats')).then(setStats);

  useEffect(() => {
    void loadProducts();
    void loadStats();
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [status]);

  const addProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const parsed = productInputSchema.safeParse({
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      imageUrl: form.imageUrl,
      isActive: form.isActive,
    });
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await unwrap(api.post('/products', parsed.data));
      setForm(emptyProductForm);
      await loadProducts();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Store" title="Admin" subtitle="Manage catalog, orders, and view store analytics." />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Statistics" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack component="form" method="post" spacing={2} autoComplete="off" onSubmit={(e) => void addProduct(e)}>
              <Typography variant="h6">Add product</Typography>
              {formError && <Alert severity="error">{formError}</Alert>}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="product-name"
                    name="product-name"
                    fullWidth
                    required
                    label="Name"
                    autoComplete="off"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    error={Boolean(fieldErrors.name)}
                    helperText={fieldErrors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="product-category"
                    name="product-category"
                    select
                    fullWidth
                    required
                    label="Category"
                    autoComplete="off"
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value as (typeof PRODUCT_CATEGORIES)[number] }))
                    }
                    error={Boolean(fieldErrors.category)}
                    helperText={fieldErrors.category}
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <TextField
                    id="product-description"
                    name="product-description"
                    fullWidth
                    required
                    multiline
                    minRows={2}
                    label="Description"
                    autoComplete="off"
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    error={Boolean(fieldErrors.description)}
                    helperText={fieldErrors.description}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="product-price"
                    name="product-price"
                    fullWidth
                    required
                    label="Price"
                    type="number"
                    autoComplete="off"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    error={Boolean(fieldErrors.price)}
                    helperText={fieldErrors.price}
                    slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    id="product-stock"
                    name="product-stock"
                    fullWidth
                    required
                    label="Stock"
                    type="number"
                    autoComplete="off"
                    value={form.stock}
                    onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                    error={Boolean(fieldErrors.stock)}
                    helperText={fieldErrors.stock}
                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    id="product-image-url"
                    name="product-image-url"
                    fullWidth
                    required
                    label="Image URL"
                    type="url"
                    autoComplete="off"
                    value={form.imageUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    error={Boolean(fieldErrors.imageUrl)}
                    helperText={fieldErrors.imageUrl}
                  />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ alignSelf: 'flex-start' }}>
                {submitting ? 'Adding…' : 'Add product'}
              </Button>
            </Stack>
          </Paper>
          {products.map((p) => (
            <SurfaceCard key={p.id}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Typography>
                  {p.name} · ₪{p.price} · stock {p.stock} {p.stock === 0 ? '· out of stock' : ''}{' '}
                  {p.isActive ? '' : '(inactive)'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {p.stock === 0 ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        void unwrap(api.patch(`/products/${p.id}`, { stock: 12 })).then(loadProducts)
                      }
                    >
                      Restock
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() =>
                        void unwrap(api.patch(`/products/${p.id}`, { stock: 0 })).then(loadProducts)
                      }
                    >
                      Mark out of stock
                    </Button>
                  )}
                  <Button size="small" color="error" variant="outlined" onClick={() => void unwrap(api.delete(`/products/${p.id}`)).then(loadProducts)}>
                    Soft delete
                  </Button>
                </Stack>
              </Stack>
            </SurfaceCard>
          ))}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <TextField
            id="admin-order-status"
            name="order-status"
            select
            size="small"
            label="Status"
            autoComplete="off"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ mb: 3, minWidth: 220 }}
          >
            <MenuItem value="">all</MenuItem>
            {ORDER_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          {orders.map((order) => (
            <SurfaceCard key={order.id}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography fontWeight={700}>{order.orderNumber}</Typography>
                <StatusChip status={order.status} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                ₪{order.total}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {ORDER_STATUSES.filter((s) => canTransition(order.status, s as OrderStatus)).map((next) => (
                  <Button
                    key={next}
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      void unwrap(api.patch(`/orders/${order.id}/status`, { status: next })).then(loadOrders)
                    }
                  >
                    {next}
                  </Button>
                ))}
              </Stack>
            </SurfaceCard>
          ))}
        </Box>
      )}

      {tab === 2 && stats && (
        <Box>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              ['Revenue', stats.totalRevenue, true],
              ['Open orders', stats.openOrders, false],
              ['Sales today', stats.dailySalesCount, false],
              ['Low stock', stats.lowStockAlerts, false],
              ['New users (7d)', stats.userGrowth, false],
            ].map(([label, value, money]) => (
              <Grid key={String(label)} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
                  <Typography variant="overline" color="text.secondary">
                    {label}
                  </Typography>
                  {money ? (
                    <Price value={Number(value)} variant="h5" color="text.primary" />
                  ) : (
                    <Typography variant="h5">{value}</Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      )}
    </PageShell>
  );
}
