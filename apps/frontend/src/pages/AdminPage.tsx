import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
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
import { api, unwrap } from '../services/api';

export function AdminPage() {
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
    <Container className="py-8">
      <Typography variant="h4" className="mb-4">
        Admin
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-4">
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Statistics" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <form
            className="mb-6 grid gap-3 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void unwrap(api.post('/products', { ...form, price: Number(form.price), stock: Number(form.stock) })).then(
                loadProducts,
              );
            }}
          >
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField
              select
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
            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
            <TextField
              label="Stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            />
            <TextField
              className="md:col-span-2"
              label="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
            <Button type="submit" variant="contained">
              Add product
            </Button>
          </form>
          {products.map((p) => (
            <div key={p.id} className="mb-2 flex items-center justify-between rounded-lg bg-white p-3">
              <span>
                {p.name} · ₪{p.price} · stock {p.stock} {p.isActive ? '' : '(inactive)'}
              </span>
              <Button size="small" onClick={() => void unwrap(api.delete(`/products/${p.id}`)).then(loadProducts)}>
                Soft delete
              </Button>
            </div>
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
            className="mb-4 w-56"
          >
            <MenuItem value="">all</MenuItem>
            {ORDER_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          {orders.map((order) => (
            <div key={order.id} className="mb-3 rounded-xl bg-white p-4">
              <div className="flex items-center justify-between">
                <Typography fontWeight={700}>{order.orderNumber}</Typography>
                <Chip label={order.status} />
              </div>
              <Typography variant="body2">₪{order.total}</Typography>
              <div className="mt-2 flex flex-wrap gap-2">
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
              </div>
            </div>
          ))}
        </Box>
      )}

      {tab === 2 && stats && (
        <Box>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Revenue', `₪${stats.totalRevenue}`],
              ['Open orders', stats.openOrders],
              ['Sales today', stats.dailySalesCount],
              ['Low stock', stats.lowStockAlerts],
              ['New users (7d)', stats.userGrowth],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl bg-white p-4 shadow-sm">
                <Typography variant="caption">{label}</Typography>
                <Typography variant="h6">{value}</Typography>
              </div>
            ))}
          </div>
          <div className="h-72 rounded-xl bg-white p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#c45c7a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Box>
      )}
    </Container>
  );
}
