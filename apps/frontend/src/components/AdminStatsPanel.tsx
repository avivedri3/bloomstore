import type { ReactNode } from 'react';
import { Box, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AdminStatsDto, OrderStatus, ProductCategory } from '@bloomstore/shared-types';
import { Price } from './Price';
import { StatusChip } from './StatusChip';
import { SurfaceCard } from './layout/SurfaceCard';
import { CATEGORY_LABELS } from '../utils/categories';
import { ORDER_STATUS_LABELS } from '../utils/orders';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Catalog',
  '/contact': 'Contact',
  '/login': 'Login',
  '/register': 'Register',
  '/cart': 'Cart',
  '/checkout': 'Checkout',
  '/orders': 'My orders',
  '/admin': 'Admin',
};

function pageLabel(path: string): string {
  if (PAGE_LABELS[path]) {
    return PAGE_LABELS[path];
  }
  if (path.startsWith('/products/')) {
    return 'Product page';
  }
  return path;
}

function shortDate(iso: string): string {
  const [, month, day] = iso.split('-');
  return `${Number(day)}/${Number(month)}`;
}

function orderWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: 340 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ height: 280 }}>{children}</Box>
    </Paper>
  );
}

export function AdminStatsPanel({ stats }: { stats: AdminStatsDto }) {
  const theme = useTheme();
  const rose = theme.palette.primary.main;
  const leaf = theme.palette.secondary.main;
  const grid = theme.palette.divider;

  const traffic = stats.traffic.viewsByDay.map((day) => ({
    ...day,
    label: shortDate(day.date),
  }));
  const sales = stats.salesByDay.map((day) => ({
    ...day,
    label: shortDate(day.date),
  }));
  const statuses = stats.ordersByStatus.map((row) => ({
    ...row,
    label: ORDER_STATUS_LABELS[row.status],
  }));
  const products = stats.topProducts.map((row) => ({
    ...row,
    label: row.name.length > 22 ? `${row.name.slice(0, 20)}…` : row.name,
  }));
  const categories = stats.revenueByCategory.map((row) => ({
    ...row,
    label: CATEGORY_LABELS[row.category as ProductCategory] ?? row.category,
  }));
  const pages = stats.traffic.topPages.map((page) => ({
    ...page,
    label: pageLabel(page.path),
  }));

  const cards: Array<{ label: string; value: number; money?: boolean }> = [
    { label: 'Revenue', value: stats.totalRevenue, money: true },
    { label: 'Average order', value: stats.averageOrder, money: true },
    { label: 'Open orders', value: stats.openOrders },
    { label: 'Sales today', value: stats.dailySalesCount },
    { label: 'Views today', value: stats.traffic.viewsToday },
    { label: 'Visitors (30d)', value: stats.traffic.uniqueVisitors30d },
    { label: 'Page views (30d)', value: stats.traffic.views30d },
    { label: 'Low stock', value: stats.lowStockAlerts },
    { label: 'New users (7d)', value: stats.userGrowth },
  ];

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Store traffic, sales, and recent orders for the last 30 days. Page views update as people move through the shop.
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
              <Typography variant="overline" color="text.secondary">
                {card.label}
              </Typography>
              {card.money ? (
                <Price value={card.value} variant="h5" color="text.primary" />
              ) : (
                <Typography variant="h5">{card.value}</Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Site traffic">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={traffic}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="views" name="Page views" stroke={rose} fill={rose} fillOpacity={0.2} />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke={leaf} fill={leaf} fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Sales">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, _name, item) => {
                    const count = (item as { payload?: { count?: number } }).payload?.count;
                    const orders = typeof count === 'number' ? ` · ${count} orders` : '';
                    return [`₪${value}${orders}`, 'Revenue'];
                  }}
                />
                <Bar dataKey="revenue" name="Revenue" fill={rose} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Orders by status">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statuses}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Orders" fill={leaf} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Top products">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => [name === 'revenue' ? `₪${value}` : value, name === 'revenue' ? 'Revenue' : 'Stems']} />
                <Bar dataKey="revenue" name="Revenue" fill={rose} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Revenue by collection">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`₪${value}`, 'Revenue']} />
                <Bar dataKey="revenue" name="Revenue" fill={rose} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ChartCard title="Most visited pages">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pages} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="views" name="Views" fill={leaf} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Recent orders
      </Typography>
      {stats.recentOrders.length === 0 ? (
        <Typography color="text.secondary">No orders yet.</Typography>
      ) : (
        stats.recentOrders.map((order) => (
          <SurfaceCard key={order.id}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <Typography fontWeight={700}>{order.orderNumber}</Typography>
              <StatusChip status={order.status as OrderStatus} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {orderWhen(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} · {order.summary}
            </Typography>
            <Price value={order.total} variant="body1" sx={{ mt: 1 }} />
          </SurfaceCard>
        ))
      )}
    </Box>
  );
}
