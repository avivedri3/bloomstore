import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';

async function bootstrap(): Promise<void> {
  const logger = new Logger('BloomStore');
  const jwt = process.env.JWT_SECRET;
  const mongo = process.env.MONGODB_URI;
  if (!jwt) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  if (!mongo) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new ApiExceptionFilter());
  app.use(helmet());
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins, credentials: true });

  const hits = new Map<string, { count: number; reset: number }>();
  app.use((req: { ip?: string; path?: string }, res: { status: (n: number) => { json: (b: unknown) => void } }, next: () => void) => {
    const path = req.path ?? '';
    if (!path.includes('/auth/login') && !path.includes('/auth/register')) {
      next();
      return;
    }
    const key = `${req.ip}:${path}`;
    const now = Date.now();
    const slot = hits.get(key);
    if (!slot || slot.reset < now) {
      hits.set(key, { count: 1, reset: now + 60_000 });
      next();
      return;
    }
    slot.count += 1;
    if (slot.count > 20) {
      res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many attempts, try again later' },
      });
      return;
    }
    next();
  });

  const port = Number(process.env.PORT ?? 3030);
  logger.log(`Connecting to MongoDB...`);
  logger.log(`Database: ${process.env.DB_NAME ?? 'bloomstore'}`);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
}

void bootstrap();
