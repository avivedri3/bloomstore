import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

function stripKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripKeys);
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      out[key] = stripKeys(nested);
    }
    return out;
  }
  return value;
}

@Injectable()
export class MongoSanitizeMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    req.body = stripKeys(req.body) as Request['body'];
    req.params = stripKeys(req.params) as Request['params'];
    next();
  }
}
