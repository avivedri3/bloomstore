import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { Product } from '../models/product.schema';
import { User } from '../models/user.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Product.name) private readonly products: Model<Product>,
  ) {}

  async onModuleInit(): Promise<void> {
    const userCount = await this.users.estimatedDocumentCount();
    if (userCount === 0) {
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      const customerHash = await bcrypt.hash('Customer123!', 10);
      await this.users.create([
        {
          email: 'admin@bloomstore.com',
          passwordHash,
          fullName: 'Bloom Admin',
          role: 'admin',
        },
        {
          email: 'customer@bloomstore.com',
          passwordHash: customerHash,
          fullName: 'Maya Bloom',
          role: 'customer',
        },
      ]);
      this.log.log('Seeded demo users');
    }
    const productCount = await this.products.estimatedDocumentCount();
    if (productCount === 0) {
      await this.products.create([
        {
          name: 'Classic Red Rose Bouquet',
          description: 'A dozen long-stem red roses wrapped in kraft paper.',
          category: 'roses',
          price: 189,
          stock: 24,
          imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800',
          isActive: true,
        },
        {
          name: 'Spring Meadow Mix',
          description: 'Seasonal wildflowers with eucalyptus and ranunculus.',
          category: 'seasonal',
          price: 149,
          stock: 18,
          imageUrl: 'https://images.unsplash.com/photo-1468327768560-75b60c6b73f7?w=800',
          isActive: true,
        },
        {
          name: 'Ivory Wedding Cascade',
          description: 'White peonies, roses and baby’s breath for ceremonies.',
          category: 'weddings',
          price: 420,
          stock: 6,
          imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
          isActive: true,
        },
        {
          name: 'Peace Lily Plant',
          description: 'Low-maintenance indoor plant in a ceramic pot.',
          category: 'plants',
          price: 99,
          stock: 12,
          imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800',
          isActive: true,
        },
        {
          name: 'Sympathy White Lilies',
          description: 'Elegant white lilies arranged for condolence.',
          category: 'sympathy',
          price: 210,
          stock: 8,
          imageUrl: 'https://images.unsplash.com/photo-1457089328109-1d9ef36f33ce?w=800',
          isActive: true,
        },
        {
          name: 'Sunset Bouquet',
          description: 'Orange tulips, gerberas and spray roses.',
          category: 'bouquets',
          price: 165,
          stock: 0,
          imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
          isActive: true,
        },
      ]);
      this.log.log('Seeded catalog (Sunset Bouquet is out of stock and hidden from public grid)');
    }
  }
}
