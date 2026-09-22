import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AddressesController } from './addresses/addresses.controller';
import { AddressesService } from './addresses/addresses.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';
import { AuditService } from './audit/audit.service';
import { AdminGuard } from './auth/admin.guard';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { TokenVersionGuard } from './auth/token-version.guard';
import { CacheService } from './cache/cache.service';
import { CartsController } from './carts/carts.controller';
import { CartsService } from './carts/carts.service';
import { MongoSanitizeMiddleware } from './common/mongo-sanitize.middleware';
import { DocsController } from './docs/docs.controller';
import { HealthController } from './health/health.controller';
import { Address, AddressSchema } from './models/address.schema';
import { AuditLog, AuditLogSchema } from './models/audit-log.schema';
import { Cart, CartSchema } from './models/cart.schema';
import { FailedWebhook, FailedWebhookSchema } from './models/failed-webhook.schema';
import { IdempotencyKey, IdempotencyKeySchema } from './models/idempotency-key.schema';
import { Order, OrderSchema } from './models/order.schema';
import { Payment, PaymentSchema } from './models/payment.schema';
import { Product, ProductSchema } from './models/product.schema';
import { Sequence, SequenceSchema } from './models/sequence.schema';
import { User, UserSchema } from './models/user.schema';
import { WebhookEvent, WebhookEventSchema } from './models/webhook-event.schema';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { MailService } from './mail/mail.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { SeedService } from './seed/seed.service';
import { SequencesService } from './sequences/sequences.service';
import { WebhooksController } from './webhooks/webhooks.controller';
import { WebhooksService } from './webhooks/webhooks.service';

const models = [
  { name: User.name, schema: UserSchema },
  { name: Product.name, schema: ProductSchema },
  { name: Cart.name, schema: CartSchema },
  { name: Order.name, schema: OrderSchema },
  { name: Payment.name, schema: PaymentSchema },
  { name: Address.name, schema: AddressSchema },
  { name: Sequence.name, schema: SequenceSchema },
  { name: AuditLog.name, schema: AuditLogSchema },
  { name: WebhookEvent.name, schema: WebhookEventSchema },
  { name: FailedWebhook.name, schema: FailedWebhookSchema },
  { name: IdempotencyKey.name, schema: IdempotencyKeySchema },
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/backend/.env', '.env'],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
        dbName: config.get<string>('DB_NAME', 'bloomstore'),
      }),
    }),
    MongooseModule.forFeature(models),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '8h') as `${number}h` | `${number}s`,
        },
      }),
    }),
  ],
  controllers: [
    HealthController,
    DocsController,
    AuthController,
    ProductsController,
    CartsController,
    AddressesController,
    OrdersController,
    AnalyticsController,
    WebhooksController,
  ],
  providers: [
    JwtStrategy,
    TokenVersionGuard,
    AdminGuard,
    CacheService,
    AuditService,
    MailService,
    SequencesService,
    AuthService,
    ProductsService,
    CartsService,
    AddressesService,
    OrdersService,
    AnalyticsService,
    WebhooksService,
    SeedService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MongoSanitizeMiddleware).forRoutes('*');
  }
}
