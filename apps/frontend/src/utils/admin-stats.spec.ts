import { describe, expect, it } from 'vitest';
import type { OrderDto, ProductDto } from '@bloomstore/shared-types';
import { completeAdminStats } from './admin-stats';

const products: ProductDto[] = [
  {
    id: 'rose',
    name: 'Garden roses',
    description: 'Roses',
    category: 'roses',
    price: 80,
    stock: 2,
    imageUrl: '/rose.jpg',
    isActive: true,
  },
];

const orders: OrderDto[] = [
  {
    id: 'order-1',
    orderNumber: 'BLM-1001',
    userId: 'user-1',
    status: 'confirmed',
    items: [
      {
        productId: 'rose',
        name: 'Garden roses',
        imageUrl: '/rose.jpg',
        unitPrice: 80,
        quantity: 2,
      },
    ],
    total: 160,
    addressId: 'address-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('completeAdminStats', () => {
  it('builds charts from orders when the live API only returns the old summary', () => {
    const stats = completeAdminStats(
      {
        totalRevenue: 160,
        openOrders: 1,
        dailySalesCount: 1,
        lowStockAlerts: 1,
        userGrowth: 3,
        salesByDay: [{ date: '2026-10-01', revenue: 10, count: 1 }],
      },
      orders,
      products,
    );

    expect(stats.totalRevenue).toBe(160);
    expect(stats.userGrowth).toBe(3);
    expect(stats.averageOrder).toBe(160);
    expect(stats.recentOrders[0]?.orderNumber).toBe('BLM-1001');
    expect(stats.topProducts[0]).toMatchObject({ name: 'Garden roses', quantity: 2, revenue: 160 });
    expect(stats.revenueByCategory[0]).toEqual({ category: 'roses', revenue: 160 });
    expect(stats.ordersByStatus.find((row) => row.status === 'confirmed')?.count).toBe(1);
    expect(stats.salesByDay).toHaveLength(30);
    expect(stats.traffic.viewsByDay).toHaveLength(30);
    expect(stats.traffic.views30d).toBe(0);
  });

  it('keeps the full server payload when the API already includes order detail', () => {
    const stats = completeAdminStats(
      {
        totalRevenue: 500,
        averageOrder: 250,
        openOrders: 2,
        dailySalesCount: 1,
        lowStockAlerts: 0,
        userGrowth: 4,
        salesByDay: [{ date: '2026-10-09', revenue: 500, count: 2 }],
        ordersByStatus: [{ status: 'shipped', count: 2 }],
        topProducts: [{ name: 'Peonies', quantity: 1, revenue: 500 }],
        revenueByCategory: [{ category: 'bouquets', revenue: 500 }],
        recentOrders: [
          {
            id: 'order-9',
            orderNumber: 'BLM-1009',
            status: 'shipped',
            total: 500,
            createdAt: '2026-10-09T10:00:00.000Z',
            itemCount: 1,
            summary: 'Peonies',
          },
        ],
        traffic: {
          viewsToday: 2,
          views30d: 9,
          uniqueVisitors30d: 4,
          viewsByDay: [{ date: '2026-10-09', views: 9, visitors: 4 }],
          topPages: [{ path: '/', views: 9 }],
        },
      },
      orders,
      products,
    );

    expect(stats.recentOrders[0]?.orderNumber).toBe('BLM-1009');
    expect(stats.traffic.views30d).toBe(9);
    expect(stats.topProducts[0]?.name).toBe('Peonies');
  });
});
