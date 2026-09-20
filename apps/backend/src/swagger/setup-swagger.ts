import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('BloomStore API')
    .setDescription(
      'REST API for the BloomStore flower shop. All successful responses use `{ success: true, data }`; errors use `{ success: false, error: { code, message, details? } }`.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'JWT from POST /api/auth/login' },
      'access-token',
    )
    .addTag('health', 'Liveness')
    .addTag('auth', 'Registration, login, session')
    .addTag('products', 'Catalog (public + admin)')
    .addTag('cart', 'Authenticated shopping cart')
    .addTag('addresses', 'Shipping addresses')
    .addTag('orders', 'Checkout and order lifecycle')
    .addTag('admin', 'Admin analytics')
    .addTag('webhooks', 'Payment webhook ingestion')
    .addTag('documentation', 'Project book and API readme')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Swagger mounts on Express directly (outside Nest global prefix `api`).
  SwaggerModule.setup('api/swagger', app, document, {
    swaggerOptions: { persistAuthorization: true, docExpansion: 'list' },
    customSiteTitle: 'BloomStore API — Swagger UI',
    jsonDocumentUrl: 'api/swagger-json',
  });
}
