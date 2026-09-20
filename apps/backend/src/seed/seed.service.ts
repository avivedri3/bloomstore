import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderStatus, PaymentStatus, ProductCategory } from '@bloomstore/shared-types';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { Address } from '../models/address.schema';
import { AuditLog } from '../models/audit-log.schema';
import { Cart } from '../models/cart.schema';
import { FailedWebhook } from '../models/failed-webhook.schema';
import { IdempotencyKey } from '../models/idempotency-key.schema';
import { Order } from '../models/order.schema';
import { Payment } from '../models/payment.schema';
import { Product } from '../models/product.schema';
import { Sequence } from '../models/sequence.schema';
import { User } from '../models/user.schema';
import { WebhookEvent } from '../models/webhook-event.schema';

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const pexels = (path: string) =>
  `https://images.pexels.com/photos/${path}?auto=compress&cs=tinysrgb&w=900`;

const CATALOG: Array<{
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
}> = [
  {
    name: 'Classic Red Rose Bouquet',
    description: 'A dozen long-stem red roses wrapped in kraft paper.',
    category: 'roses',
    price: 189,
    stock: 24,
    imageUrl: unsplash('photo-1496062031456-07b8f162a322'),
    isActive: true,
  },
  {
    name: 'Pink Rose Romance',
    description: 'Soft pink roses with ruscus and a silk ribbon — a classic date-night bouquet.',
    category: 'roses',
    price: 175,
    stock: 20,
    imageUrl: unsplash('photo-1582794543139-8ac9cb0f7b11'),
    isActive: true,
  },
  {
    name: 'White Rose Elegance',
    description: 'Crisp white roses with eucalyptus, suited for anniversaries and hotels.',
    category: 'roses',
    price: 195,
    stock: 14,
    imageUrl: unsplash('photo-1591886960571-74d43a9d4166'),
    isActive: true,
  },
  {
    name: 'Spring Meadow Mix',
    description: 'Seasonal wildflowers with eucalyptus and ranunculus.',
    category: 'seasonal',
    price: 149,
    stock: 18,
    imageUrl: pexels('250591/pexels-photo-250591.jpeg'),
    isActive: true,
  },
  {
    name: 'Autumn Harvest Bunch',
    description: 'Warm dahlias, chrysanthemums and dried wheat for fall tables.',
    category: 'seasonal',
    price: 159,
    stock: 11,
    imageUrl: pexels('1477166/pexels-photo-1477166.jpeg'),
    isActive: true,
  },
  {
    name: 'Winter Berry Arrangement',
    description: 'Evergreen, hypericum berries and white blooms for winter gifting.',
    category: 'seasonal',
    price: 179,
    stock: 7,
    imageUrl: unsplash('photo-1487530811176-3780de880c2d'),
    isActive: true,
  },
  {
    name: 'Ivory Wedding Cascade',
    description: 'White peonies, roses and baby’s breath for ceremonies.',
    category: 'weddings',
    price: 420,
    stock: 6,
    imageUrl: unsplash('photo-1563241527-3004b7be0ffd'),
    isActive: true,
  },
  {
    name: 'Bridal Peony Hand-Tied',
    description: 'Garden peonies and spray roses tied for the aisle walk.',
    category: 'weddings',
    price: 380,
    stock: 4,
    imageUrl: pexels('931162/pexels-photo-931162.jpeg'),
    isActive: true,
  },
  {
    name: 'Rose & Orchid Corsage',
    description: 'Wrist corsage with a mini rose, orchid and pearl pin.',
    category: 'weddings',
    price: 89,
    stock: 15,
    imageUrl: pexels('736230/pexels-photo-736230.jpeg'),
    isActive: true,
  },
  {
    name: 'Peace Lily Plant',
    description: 'Low-maintenance indoor plant in a ceramic pot.',
    category: 'plants',
    price: 99,
    stock: 12,
    imageUrl: unsplash('photo-1501004318641-b39e6451bec6'),
    isActive: true,
  },
  {
    name: 'Monstera Deliciosa',
    description: 'Statement split-leaf plant in a matte planter.',
    category: 'plants',
    price: 129,
    stock: 9,
    imageUrl: unsplash('photo-1614594975525-e45190c55d0b'),
    isActive: true,
  },
  {
    name: 'Mini Succulent Garden',
    description: 'Three mixed succulents in a wooden crate — desk-friendly.',
    category: 'plants',
    price: 79,
    stock: 22,
    imageUrl: unsplash('photo-1459411552884-841db9b3cc2a'),
    isActive: true,
  },
  {
    name: 'Sympathy White Lilies',
    description: 'Elegant white lilies arranged for condolence.',
    category: 'sympathy',
    price: 210,
    stock: 8,
    imageUrl: pexels('757889/pexels-photo-757889.jpeg'),
    isActive: true,
  },
  {
    name: 'Quiet Garden Wreath',
    description: 'Circular white wreath with olive and lisianthus.',
    category: 'sympathy',
    price: 245,
    stock: 3,
    imageUrl: pexels('807598/pexels-photo-807598.jpeg'),
    isActive: true,
  },
  {
    name: 'White Carnation Tribute',
    description: 'Classic white carnations with fern for memorial services.',
    category: 'sympathy',
    price: 155,
    stock: 10,
    imageUrl: unsplash('photo-1522673607200-164d1b6ce486'),
    isActive: true,
  },
  {
    name: 'Sunset Bouquet',
    description: 'Orange tulips, gerberas and spray roses.',
    category: 'bouquets',
    price: 165,
    stock: 0,
    imageUrl: pexels('2058498/pexels-photo-2058498.jpeg'),
    isActive: true,
  },
  {
    name: 'Pastel Dream Bouquet',
    description: 'Blush ranunculus, lisianthus and pale hydrangea.',
    category: 'bouquets',
    price: 169,
    stock: 16,
    imageUrl: pexels('931177/pexels-photo-931177.jpeg'),
    isActive: true,
  },
  {
    name: 'Lavender & Daisy Mix',
    description: 'Fragrant lavender stems mixed with white daisies.',
    category: 'bouquets',
    price: 139,
    stock: 19,
    imageUrl: pexels('1166869/pexels-photo-1166869.jpeg'),
    isActive: true,
  },
  {
    name: 'Birthday Bright Mix',
    description: 'Gerberas, alstroemeria and yellow roses for celebrations.',
    category: 'bouquets',
    price: 155,
    stock: 13,
    imageUrl: pexels('74512/pexels-photo-74512.jpeg'),
    isActive: true,
  },
  {
    name: 'Draft Protea Arrangement',
    description: 'Admin-only draft: king protea with banksia (not listed publicly).',
    category: 'seasonal',
    price: 210,
    stock: 3,
    imageUrl: pexels('39517/rose-flower-blossom-bloom-39517.jpeg'),
    isActive: false,
  },
];

const EXTRA_CUSTOMERS = [
  { email: 'noa.cohen@bloomstore.com', fullName: 'Noa Cohen', password: 'Customer123!' },
  { email: 'yoni.levy@bloomstore.com', fullName: 'Yoni Levy', password: 'Customer123!' },
];

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Product.name) private readonly products: Model<Product>,
    @InjectModel(Address.name) private readonly addresses: Model<Address>,
    @InjectModel(Cart.name) private readonly carts: Model<Cart>,
    @InjectModel(Order.name) private readonly orders: Model<Order>,
    @InjectModel(Payment.name) private readonly payments: Model<Payment>,
    @InjectModel(Sequence.name) private readonly sequences: Model<Sequence>,
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLog>,
    @InjectModel(WebhookEvent.name) private readonly webhookEvents: Model<WebhookEvent>,
    @InjectModel(FailedWebhook.name) private readonly failedWebhooks: Model<FailedWebhook>,
    @InjectModel(IdempotencyKey.name) private readonly idempotencyKeys: Model<IdempotencyKey>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureConfiguredAccounts();
    await this.ensureDemoUsers();
    await this.ensureCatalog();
    await this.ensureStorefrontDemo();
  }

  /** Idempotent upsert for local/demo accounts (passwords from env, not committed). */
  private async ensureConfiguredAccounts(): Promise<void> {
    const accounts: Array<{
      email: string;
      password: string;
      fullName: string;
      role: 'admin' | 'customer';
    }> = [];

    const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      accounts.push({
        email: adminEmail,
        password: adminPassword,
        fullName: process.env.SEED_ADMIN_FULL_NAME?.trim() || 'Aviv Edri',
        role: 'admin',
      });
    }

    const demo1Email = process.env.SEED_DEMO1_EMAIL?.trim().toLowerCase();
    const demo1Password = process.env.SEED_DEMO1_PASSWORD;
    if (demo1Email && demo1Password) {
      accounts.push({
        email: demo1Email,
        password: demo1Password,
        fullName: process.env.SEED_DEMO1_FULL_NAME?.trim() || 'Maya Demo',
        role: 'customer',
      });
    }

    const demo2Email = process.env.SEED_DEMO2_EMAIL?.trim().toLowerCase();
    const demo2Password = process.env.SEED_DEMO2_PASSWORD;
    if (demo2Email && demo2Password) {
      accounts.push({
        email: demo2Email,
        password: demo2Password,
        fullName: process.env.SEED_DEMO2_FULL_NAME?.trim() || 'Alex Demo',
        role: 'customer',
      });
    }

    for (const account of accounts) {
      const passwordHash = await bcrypt.hash(account.password, 10);
      await this.users.findOneAndUpdate(
        { email: account.email },
        {
          $set: {
            passwordHash,
            fullName: account.fullName,
            role: account.role,
          },
          $setOnInsert: {
            tokenVersion: 0,
            failedLoginAttempts: 0,
            lockUntil: null,
          },
        },
        { upsert: true },
      );
    }

    if (accounts.length > 0) {
      this.log.log(`Ensured ${accounts.length} configured account(s)`);
    }
  }

  private async ensureDemoUsers(): Promise<void> {
    const defaults: Array<{
      email: string;
      password: string;
      fullName: string;
      role: 'admin' | 'customer';
    }> = [
      {
        email: 'admin@bloomstore.com',
        password: 'Admin123!',
        fullName: 'Bloom Admin',
        role: 'admin',
      },
      {
        email: 'customer@bloomstore.com',
        password: 'Customer123!',
        fullName: 'Maya Bloom',
        role: 'customer',
      },
      ...EXTRA_CUSTOMERS.map((c) => ({ ...c, role: 'customer' as const })),
    ];

    let created = 0;
    for (const account of defaults) {
      const existing = await this.users.findOne({ email: account.email });
      if (existing) {
        continue;
      }
      await this.users.create({
        email: account.email,
        passwordHash: await bcrypt.hash(account.password, 10),
        fullName: account.fullName,
        role: account.role,
      });
      created += 1;
    }
    if (created > 0) {
      this.log.log(`Seeded ${created} demo user(s)`);
    }
  }

  private async ensureCatalog(): Promise<void> {
    const ops = CATALOG.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: product },
        upsert: true,
      },
    }));
    const result = await this.products.bulkWrite(ops);
    const upserts = result.upsertedCount + result.modifiedCount;
    if (upserts > 0) {
      this.log.log(`Catalog upserted (${CATALOG.length} flowers, ${result.upsertedCount} new)`);
    }
  }

  private async ensureStorefrontDemo(): Promise<void> {
    const byEmail = await this.loadUsersByEmail();
    await this.ensureDemoAddresses(byEmail);
    await this.ensureDemoCarts(byEmail);

    const orderCount = await this.orders.estimatedDocumentCount();
    if (orderCount > 0) {
      return;
    }

    const catalog = await this.products.find({ name: { $in: CATALOG.map((p) => p.name) } });
    const productByName = new Map(catalog.map((p) => [p.name, p]));
    const pick = (name: string) => {
      const product = productByName.get(name);
      if (!product) {
        throw new Error(`Seed product missing: ${name}`);
      }
      return product;
    };

    const addressByUser = await this.addresses.find({
      userId: { $in: [...byEmail.values()].map((u) => u._id) },
    });
    const defaultAddress = (email: string) => {
      const user = byEmail.get(email)!;
      const owned = addressByUser.filter((a) => a.userId.equals(user._id));
      return owned.find((a) => a.isDefault) ?? owned[0];
    };

    type SeedOrder = {
      email: string;
      status: OrderStatus;
      daysAgo: number;
      lines: Array<{ name: string; quantity: number }>;
    };

    const allSpecs: SeedOrder[] = [
      {
        email: 'customer@bloomstore.com',
        status: 'delivered',
        daysAgo: 6,
        lines: [{ name: 'Classic Red Rose Bouquet', quantity: 1 }],
      },
      {
        email: 'customer@bloomstore.com',
        status: 'shipped',
        daysAgo: 5,
        lines: [{ name: 'Peace Lily Plant', quantity: 1 }],
      },
      {
        email: 'demo.maya@bloomstore.com',
        status: 'delivered',
        daysAgo: 5,
        lines: [{ name: 'Spring Meadow Mix', quantity: 2 }],
      },
      {
        email: 'demo.alex@bloomstore.com',
        status: 'processing',
        daysAgo: 4,
        lines: [{ name: 'Ivory Wedding Cascade', quantity: 1 }],
      },
      {
        email: 'customer@bloomstore.com',
        status: 'confirmed',
        daysAgo: 3,
        lines: [
          { name: 'Pastel Dream Bouquet', quantity: 1 },
          { name: 'Mini Succulent Garden', quantity: 1 },
        ],
      },
      {
        email: 'noa.cohen@bloomstore.com',
        status: 'delivered',
        daysAgo: 3,
        lines: [{ name: 'Birthday Bright Mix', quantity: 1 }],
      },
      {
        email: 'yoni.levy@bloomstore.com',
        status: 'cancelled',
        daysAgo: 2,
        lines: [{ name: 'White Rose Elegance', quantity: 1 }],
      },
      {
        email: 'demo.maya@bloomstore.com',
        status: 'processing',
        daysAgo: 2,
        lines: [{ name: 'Monstera Deliciosa', quantity: 1 }],
      },
      {
        email: 'demo.alex@bloomstore.com',
        status: 'pending_payment',
        daysAgo: 1,
        lines: [{ name: 'Sympathy White Lilies', quantity: 1 }],
      },
      {
        email: 'customer@bloomstore.com',
        status: 'delivered',
        daysAgo: 1,
        lines: [{ name: 'Lavender & Daisy Mix', quantity: 2 }],
      },
      {
        email: 'noa.cohen@bloomstore.com',
        status: 'shipped',
        daysAgo: 0,
        lines: [{ name: 'Pink Rose Romance', quantity: 1 }],
      },
      {
        email: 'yoni.levy@bloomstore.com',
        status: 'confirmed',
        daysAgo: 0,
        lines: [{ name: 'Autumn Harvest Bunch', quantity: 1 }],
      },
      {
        email: 'demo.maya@bloomstore.com',
        status: 'pending_payment',
        daysAgo: 0,
        lines: [{ name: 'Bridal Peony Hand-Tied', quantity: 1 }],
      },
    ];

    const specs = allSpecs.filter((spec) => byEmail.has(spec.email) && defaultAddress(spec.email));
    if (specs.length === 0) {
      this.log.warn('Skipping order demo — no matching customers with addresses');
      return;
    }

    const admin = byEmail.get('admin@bloomstore.com') ?? byEmail.get('avivedri3@gmail.com');
    let seq = 1000;
    const orderDocs = [];
    const paymentDocs = [];
    const auditDocs = [];
    const webhookDocs = [];
    const keyDocs = [];

    for (const spec of specs) {
      seq += 1;
      const user = byEmail.get(spec.email)!;
      const address = defaultAddress(spec.email);
      if (!address) {
        throw new Error(`Seed address missing for ${spec.email}`);
      }
      const items = spec.lines.map((line) => {
        const product = pick(line.name);
        return {
          productId: product._id,
          name: product.name,
          imageUrl: product.imageUrl,
          unitPrice: product.price,
          quantity: line.quantity,
        };
      });
      const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const createdAt = this.daysAgo(spec.daysAgo);
      const orderId = new Types.ObjectId();
      const orderNumber = `BLM-${seq}`;
      orderDocs.push({
        _id: orderId,
        orderNumber,
        userId: user._id,
        status: spec.status,
        items,
        total,
        addressId: address._id,
        createdAt,
        updatedAt: createdAt,
      });
      paymentDocs.push({
        orderId,
        userId: user._id,
        amount: total,
        status: this.paymentStatusFor(spec.status),
        provider: 'simulated',
        providerRef: `sim_${orderNumber.toLowerCase()}`,
        createdAt,
        updatedAt: createdAt,
      });
      auditDocs.push({
        actorId: user._id,
        action: 'order.create',
        entity: 'orders',
        entityId: String(orderId),
        metadata: { orderNumber, seed: true },
        createdAt,
        updatedAt: createdAt,
      });
      if (spec.status !== 'pending_payment') {
        auditDocs.push({
          actorId: admin?._id,
          action: 'order.status',
          entity: 'orders',
          entityId: String(orderId),
          metadata: { status: spec.status, seed: true },
          createdAt,
          updatedAt: createdAt,
        });
      }
      if (spec.status !== 'pending_payment' && spec.status !== 'cancelled') {
        webhookDocs.push({
          eventId: `evt_seed_${orderNumber.toLowerCase()}`,
          type: 'payment.captured',
          payload: { orderNumber, amount: total, provider: 'simulated' },
          status: 'processed',
          createdAt,
          updatedAt: createdAt,
        });
      }
      keyDocs.push({
        key: `seed-checkout-${orderNumber}`,
        userId: user._id,
        orderId,
        response: { orderNumber, total },
        createdAt,
        updatedAt: createdAt,
      });
    }

    await this.orders.insertMany(orderDocs);
    await this.payments.insertMany(paymentDocs);
    await this.auditLogs.insertMany(auditDocs);
    await this.webhookEvents.insertMany(webhookDocs);
    await this.idempotencyKeys.insertMany(keyDocs);
    await this.sequences.findOneAndUpdate(
      { name: 'orders' },
      { $set: { value: seq } },
      { upsert: true },
    );
    await this.failedWebhooks.create({
      eventId: 'evt_seed_malformed',
      type: 'payment.failed',
      payload: { reason: 'card_declined_demo' },
      reason: 'Unknown order number on simulated capture',
      retryCount: 2,
    });
    this.log.log(`Seeded storefront demo (${orderDocs.length} orders across all statuses)`);
  }

  private async ensureDemoAddresses(byEmail: Map<string, { _id: Types.ObjectId; fullName: string }>): Promise<void> {
    const templates: Array<{
      email: string;
      city: string;
      street: string;
      houseNumber: string;
      phone: string;
      apartment?: string;
      notes?: string;
    }> = [
      {
        email: 'customer@bloomstore.com',
        city: 'Tel Aviv',
        street: 'Rothschild',
        houseNumber: '12',
        phone: '0501234567',
      },
      {
        email: 'demo.maya@bloomstore.com',
        city: 'Haifa',
        street: 'HaNassi',
        houseNumber: '8',
        phone: '0525550101',
        notes: 'Leave with the doorman',
      },
      {
        email: 'demo.alex@bloomstore.com',
        city: 'Jerusalem',
        street: 'King George',
        houseNumber: '22',
        phone: '0545550202',
        apartment: '5',
      },
      {
        email: 'noa.cohen@bloomstore.com',
        city: 'Beer Sheva',
        street: 'Rager',
        houseNumber: '41',
        phone: '0535550303',
      },
      {
        email: 'yoni.levy@bloomstore.com',
        city: 'Herzliya',
        street: 'Ben Gurion',
        houseNumber: '3',
        phone: '0505550404',
        apartment: '12',
      },
    ];

    for (const row of templates) {
      const user = byEmail.get(row.email);
      if (!user) {
        continue;
      }
      const count = await this.addresses.countDocuments({ userId: user._id });
      if (count > 0) {
        continue;
      }
      await this.addresses.create({
        userId: user._id,
        fullName: user.fullName,
        phone: row.phone,
        city: row.city,
        street: row.street,
        houseNumber: row.houseNumber,
        apartment: row.apartment,
        notes: row.notes,
        isDefault: true,
      });
    }
  }

  private async ensureDemoCarts(byEmail: Map<string, { _id: Types.ObjectId }>): Promise<void> {
    const pink = await this.products.findOne({ name: 'Pink Rose Romance' });
    const succulent = await this.products.findOne({ name: 'Mini Succulent Garden' });
    const corsage = await this.products.findOne({ name: 'Rose & Orchid Corsage' });
    if (!pink || !succulent || !corsage) {
      return;
    }

    const plans: Array<{ email: string; items: Array<{ productId: Types.ObjectId; quantity: number }> }> = [
      {
        email: 'demo.maya@bloomstore.com',
        items: [
          { productId: pink._id, quantity: 1 },
          { productId: succulent._id, quantity: 2 },
        ],
      },
      {
        email: 'demo.alex@bloomstore.com',
        items: [{ productId: corsage._id, quantity: 1 }],
      },
    ];

    for (const plan of plans) {
      const user = byEmail.get(plan.email);
      if (!user) {
        continue;
      }
      await this.carts.findOneAndUpdate(
        { userId: user._id },
        { $setOnInsert: { userId: user._id, items: plan.items } },
        { upsert: true },
      );
    }
  }

  private async loadUsersByEmail(): Promise<Map<string, { _id: Types.ObjectId; fullName: string }>> {
    const rows = await this.users.find({}, { email: 1, fullName: 1 }).lean();
    return new Map(rows.map((u) => [u.email, { _id: u._id as Types.ObjectId, fullName: u.fullName }]));
  }

  private paymentStatusFor(status: OrderStatus): PaymentStatus {
    if (status === 'pending_payment') {
      return 'pending';
    }
    if (status === 'cancelled') {
      return 'refunded';
    }
    return 'captured';
  }

  private daysAgo(days: number): Date {
    const date = new Date();
    date.setHours(11, 30, 0, 0);
    date.setDate(date.getDate() - days);
    return date;
  }
}
