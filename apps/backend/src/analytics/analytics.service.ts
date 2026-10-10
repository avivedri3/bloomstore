import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ORDER_STATUSES,
  PRODUCT_CATEGORIES,
  pageViewSchema,
  type AdminStatsDto,
  type OrderStatus,
  type ProductCategory,
} from '@bloomstore/shared-types';
import { Model } from 'mongoose';
import { AuditService } from '../audit/audit.service';
import { AuditLog } from '../models/audit-log.schema';
import { Order } from '../models/order.schema';
import { Product } from '../models/product.schema';
import { User } from '../models/user.schema';

const RANGE_DAYS = 30;
const SHOP_TZ = 'Asia/Jerusalem';

type SalesBucket = { _id: string; revenue: number; count: number };
type StatusBucket = { _id: OrderStatus; count: number };
type ProductBucket = { _id: string; quantity: number; revenue: number };
type CategoryBucket = { _id: string | null; revenue: number };
type TrafficBucket = { _id: string; views: number; visitors: string[] };
type PageBucket = { _id: string; views: number };

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private readonly orders: Model<Order>,
    @InjectModel(Product.name) private readonly products: Model<Product>,
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(AuditLog.name) private readonly logs: Model<AuditLog>,
    private readonly audit: AuditService,
  ) {}

  async recordPageView(input: unknown): Promise<{ recorded: true }> {
    const parsed = pageViewSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid page view' });
    }
    await this.audit.record('page.view', 'page', undefined, parsed.data.path, {
      path: parsed.data.path,
      visitorId: parsed.data.visitorId,
    });
    return { recorded: true };
  }

  async dashboard(): Promise<AdminStatsDto> {
    const today = shopDay(new Date());
    const days = dayKeys(today, RANGE_DAYS);
    const rangeStart = shopMidnight(days[0]);
    const startOfDay = shopMidnight(today);
    const weekAgo = shopMidnight(dayKeys(today, 7)[0]);
    const paid = { status: { $nin: ['cancelled', 'pending_payment'] } };

    const [
      revenueAgg,
      paidCountAgg,
      openOrders,
      dailySalesCount,
      lowStockAlerts,
      userGrowth,
      salesByDay,
      ordersByStatus,
      topProducts,
      revenueByCategory,
      recentOrders,
      trafficByDay,
      topPages,
      viewsToday,
      uniqueVisitors,
    ] = await Promise.all([
      this.orders.aggregate<{ total: number }>([
        { $match: paid },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      this.orders.aggregate<{ count: number }>([{ $match: paid }, { $count: 'count' }]),
      this.orders.countDocuments({
        status: { $in: ['pending_payment', 'confirmed', 'processing', 'shipped'] },
      }),
      this.orders.countDocuments({
        createdAt: { $gte: startOfDay },
        status: { $ne: 'cancelled' },
      }),
      this.products.countDocuments({ isActive: true, stock: { $lte: 5 } }),
      this.users.countDocuments({ createdAt: { $gte: weekAgo } }),
      this.orders.aggregate<SalesBucket>([
        { $match: { createdAt: { $gte: rangeStart }, status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: SHOP_TZ } },
            revenue: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.orders.aggregate<StatusBucket>([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      this.orders.aggregate<ProductBucket>([
        { $match: paid },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 6 },
      ]),
      this.orders.aggregate<CategoryBucket>([
        { $match: paid },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: '$product.category',
            revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
      this.orders.find().sort({ createdAt: -1 }).limit(8).lean(),
      this.logs.aggregate<TrafficBucket>([
        { $match: { action: 'page.view', createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: SHOP_TZ } },
            views: { $sum: 1 },
            visitors: { $addToSet: '$metadata.visitorId' },
          },
        },
      ]),
      this.logs.aggregate<PageBucket>([
        { $match: { action: 'page.view', createdAt: { $gte: rangeStart } } },
        { $group: { _id: '$entityId', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 6 },
      ]),
      this.logs.countDocuments({ action: 'page.view', createdAt: { $gte: startOfDay } }),
      this.logs.aggregate<{ visitors: number }>([
        { $match: { action: 'page.view', createdAt: { $gte: rangeStart } } },
        { $group: { _id: '$metadata.visitorId' } },
        { $count: 'visitors' },
      ]),
    ]);

    const salesMap = new Map(salesByDay.map((day) => [day._id, day]));
    const trafficMap = new Map(trafficByDay.map((day) => [day._id, day]));
    const statusMap = new Map(ordersByStatus.map((row) => [row._id, row.count]));
    const totalRevenue = revenueAgg[0]?.total ?? 0;
    const paidCount = paidCountAgg[0]?.count ?? 0;
    const viewsByDay = days.map((date) => {
      const bucket = trafficMap.get(date);
      return {
        date,
        views: bucket?.views ?? 0,
        visitors: bucket?.visitors.length ?? 0,
      };
    });

    return {
      totalRevenue,
      averageOrder: paidCount === 0 ? 0 : Math.round(totalRevenue / paidCount),
      openOrders,
      dailySalesCount,
      lowStockAlerts,
      userGrowth,
      salesByDay: days.map((date) => ({
        date,
        revenue: salesMap.get(date)?.revenue ?? 0,
        count: salesMap.get(date)?.count ?? 0,
      })),
      ordersByStatus: ORDER_STATUSES.map((status) => ({
        status,
        count: statusMap.get(status) ?? 0,
      })),
      topProducts: topProducts.map((row) => ({
        name: row._id,
        quantity: row.quantity,
        revenue: row.revenue,
      })),
      revenueByCategory: revenueByCategory.flatMap((row) =>
        isCategory(row._id) ? [{ category: row._id, revenue: row.revenue }] : [],
      ),
      recentOrders: recentOrders.map((order) => {
        const names = order.items.map((item) => item.name);
        const summary = names.length <= 1 ? (names[0] ?? '') : `${names[0]} +${names.length - 1}`;
        return {
          id: String(order._id),
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          createdAt: new Date(
            (order as { createdAt?: Date }).createdAt ?? Date.now(),
          ).toISOString(),
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          summary,
        };
      }),
      traffic: {
        viewsToday,
        views30d: viewsByDay.reduce((sum, day) => sum + day.views, 0),
        uniqueVisitors30d: uniqueVisitors[0]?.visitors ?? 0,
        viewsByDay,
        topPages: topPages
          .filter((page) => page._id)
          .map((page) => ({ path: page._id, views: page.views })),
      },
    };
  }
}

function isCategory(value: string | null): value is ProductCategory {
  return !!value && (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

function shopDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TZ }).format(date);
}

function dayKeys(today: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => shiftDay(today, index - (count - 1)));
}

function shiftDay(day: string, delta: number): string {
  const [year, month, date] = day.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, date));
  utc.setUTCDate(utc.getUTCDate() + delta);
  return utc.toISOString().slice(0, 10);
}

function shopMidnight(day: string): Date {
  const probe = new Date(`${day}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SHOP_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(probe);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 12);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  const offsetMinutes = (hour - 12) * 60 + minute;
  return new Date(Date.parse(`${day}T00:00:00Z`) - offsetMinutes * 60_000);
}
