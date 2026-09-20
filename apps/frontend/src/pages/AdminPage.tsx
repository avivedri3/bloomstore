import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
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
  type AdminStatsDto,
  type OrderDto,
  type OrderStatus,
  type ProductDto,
} from '@bloomstore/shared-types';
import { PageHeader } from '../components/layout/PageHeader';
import { PageShell } from '../components/layout/PageShell';
import { SurfaceCard } from '../components/layout/SurfaceCard';
import { api, unwrap } from '../services/api';

export function AdminPage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [status, setStatus] = useState<string>('');
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: 'Beautiful seasonal arrangement.',
    category: 'bouquets',
    price: 120,
    stock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800',
    isActive: true,
  });

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

  return (
    <PageShell>
      <PageHeader title="Admin" subtitle="Manage catalog, orders, and view store analytics." />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Statistics" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack
              component="form"
              spacing={2}
              onSubmit={(e) => {
                e.preventDefault();
                void unwrap(api.post('/products', { ...form, price: Number(form.price), stock: Number(form.stock) })).then(
                  loadProducts,
                );
              }}
            >
              <Typography variant="h6">Add product</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {PRODUCT_CATEGORIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Stock"
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Image URL"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                Add product
              </Button>
            </Stack>
          </Paper>
          {products.map((p) => (
            <SurfaceCard key={p.id}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Typography>
                  {p.name} · ₪{p.price} · stock {p.stock} {p.isActive ? '' : '(inactive)'}
                </Typography>
                <Button size="small" color="error" variant="outlined" onClick={() => void unwrap(api.delete(`/products/${p.id}`)).then(loadProducts)}>
                  Soft delete
                </Button>
              </Stack>
            </SurfaceCard>
          ))}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <TextField
            select
            size="small"
            label="Status"
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
                <Chip label={order.status} size="small" />
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
              ['Revenue', `₪${stats.totalRevenue}`],
              ['Open orders', stats.openOrders],
              ['Sales today', stats.dailySalesCount],
              ['Low stock', stats.lowStockAlerts],
              ['New users (7d)', stats.userGrowth],
            ].map(([label, value]) => (
              <Grid key={String(label)} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="h6">{value}</Typography>
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
