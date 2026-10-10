import {
  ORDER_STATUSES,
  type AdminStatsDto,
  type OrderDto,
  type OrderStatus,
  type ProductCategory,
  type ProductDto,
} from '@bloomstore/shared-types';
import { isProductCategory } from './categories';

const RANGE_DAYS = 30;
const SHOP_TZ = 'Asia/Jerusalem';
const OPEN_STATUSES: OrderStatus[] = ['pending_payment', 'confirmed', 'processing', 'shipped'];

export function completeAdminStats(
  stats: Partial<AdminStatsDto> | null,
  orders: OrderDto[],
  products: ProductDto[],
): AdminStatsDto {
  const derived = deriveFromOrders(orders, products);
  const source = stats ?? {};
  const rich = Array.isArray(source.ordersByStatus) && Array.isArray(source.recentOrders);
  if (rich) {
    return {
      ...derived,
      ...source,
      traffic: source.traffic?.viewsByDay ? source.traffic : derived.traffic,
    };
  }
  return {
    ...derived,
    totalRevenue: numberOr(source.totalRevenue, derived.totalRevenue),
    openOrders: numberOr(source.openOrders, derived.openOrders),
    dailySalesCount: numberOr(source.dailySalesCount, derived.dailySalesCount),
    lowStockAlerts: numberOr(source.lowStockAlerts, derived.lowStockAlerts),
    userGrowth: numberOr(source.userGrowth, 0),
  };
}

function deriveFromOrders(orders: OrderDto[], products: ProductDto[]): AdminStatsDto {
  const days = dayKeys(RANGE_DAYS);
  const today = days[days.length - 1];
  const categoryByProduct = new Map(products.map((product) => [product.id, product.category]));
  const paid = orders.filter((order) => order.status !== 'cancelled' && order.status !== 'pending_payment');
  const counted = orders.filter((order) => order.status !== 'cancelled');
  const salesMap = new Map(days.map((date) => [date, { revenue: 0, count: 0 }]));
  for (const order of counted) {
    const bucket = salesMap.get(shopDay(new Date(order.createdAt)));
    if (!bucket) {
      continue;
    }
    bucket.revenue += order.total;
    bucket.count += 1;
  }

  const statusMap = new Map<OrderStatus, number>(ORDER_STATUSES.map((status) => [status, 0]));
  for (const order of orders) {
    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
  }

  const productTotals = new Map<string, { quantity: number; revenue: number }>();
  const categoryTotals = new Map<ProductCategory, number>();
  for (const order of paid) {
    for (const item of order.items) {
      const current = productTotals.get(item.name) ?? { quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += item.unitPrice * item.quantity;
      productTotals.set(item.name, current);
      const category = categoryByProduct.get(item.productId);
      if (category && isProductCategory(category)) {
        categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + item.unitPrice * item.quantity);
      }
    }
  }

  const totalRevenue = paid.reduce((sum, order) => sum + order.total, 0);
  return {
    totalRevenue,
    averageOrder: paid.length === 0 ? 0 : Math.round(totalRevenue / paid.length),
    openOrders: orders.filter((order) => OPEN_STATUSES.includes(order.status)).length,
    dailySalesCount: counted.filter((order) => shopDay(new Date(order.createdAt)) === today).length,
    lowStockAlerts: products.filter((product) => product.isActive && product.stock <= 5).length,
    userGrowth: 0,
    salesByDay: days.map((date) => ({
      date,
      revenue: salesMap.get(date)?.revenue ?? 0,
      count: salesMap.get(date)?.count ?? 0,
    })),
    ordersByStatus: ORDER_STATUSES.map((status) => ({ status, count: statusMap.get(status) ?? 0 })),
    topProducts: [...productTotals.entries()]
      .map(([name, totals]) => ({ name, ...totals }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6),
    revenueByCategory: [...categoryTotals.entries()]
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue),
    recentOrders: [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8)
      .map((order) => {
        const names = order.items.map((item) => item.name);
        const summary = names.length <= 1 ? (names[0] ?? '') : `${names[0]} +${names.length - 1}`;
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          summary,
        };
      }),
    traffic: {
      viewsToday: 0,
      views30d: 0,
      uniqueVisitors30d: 0,
      viewsByDay: days.map((date) => ({ date, views: 0, visitors: 0 })),
      topPages: [],
    },
  };
}

function numberOr(value: number | undefined, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

function shopDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TZ }).format(date);
}

function dayKeys(count: number): string[] {
  const [year, month, day] = shopDay(new Date()).split('-').map(Number);
  return Array.from({ length: count }, (_, index) => {
    const utc = new Date(Date.UTC(year, month - 1, day));
    utc.setUTCDate(utc.getUTCDate() - (count - 1 - index));
    return utc.toISOString().slice(0, 10);
  });
}
