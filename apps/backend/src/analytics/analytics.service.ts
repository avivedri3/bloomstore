import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AdminStatsDto } from '@bloomstore/shared-types';
import { Model } from 'mongoose';
import { Order } from '../models/order.schema';
import { Product } from '../models/product.schema';
import { User } from '../models/user.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private readonly orders: Model<Order>,
    @InjectModel(Product.name) private readonly products: Model<Product>,
    @InjectModel(User.name) private readonly users: Model<User>,
  ) {}

  async dashboard(): Promise<AdminStatsDto> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const [revenueAgg, openOrders, dailySalesCount, lowStockAlerts, userGrowth, salesByDay] =
      await Promise.all([
        this.orders.aggregate<{ total: number }>([
          { $match: { status: { $nin: ['cancelled', 'pending_payment'] } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        this.orders.countDocuments({
          status: { $in: ['pending_payment', 'confirmed', 'processing', 'shipped'] },
        }),
        this.orders.countDocuments({
          createdAt: { $gte: startOfDay },
          status: { $ne: 'cancelled' },
        }),
        this.products.countDocuments({ isActive: true, stock: { $lte: 5 } }),
        this.users.countDocuments({ createdAt: { $gte: weekAgo } }),
        this.orders.aggregate<{ _id: string; revenue: number; count: number }>([
          { $match: { createdAt: { $gte: weekAgo }, status: { $nin: ['cancelled'] } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              revenue: { $sum: '$total' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    return {
      totalRevenue: revenueAgg[0]?.total ?? 0,
      openOrders,
      dailySalesCount,
      lowStockAlerts,
      userGrowth,
      salesByDay: salesByDay.map((d) => ({ date: d._id, revenue: d.revenue, count: d.count })),
    };
  }
}
