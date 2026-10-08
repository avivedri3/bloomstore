import { CallHandler, ExecutionContext, Injectable, NestInterceptor, mixin } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PRODUCT_IMAGE_MAX_BYTES } from '@bloomstore/shared-types';
import { Request } from 'express';
import { Observable } from 'rxjs';

/** Parses an image file only when the admin sends multipart. JSON patches, such as stock, stay intact. */
export function OptionalProductImageInterceptor() {
  @Injectable()
  class OptionalProductImageMixin implements NestInterceptor {
    private readonly upload = new (FileInterceptor('image', {
      limits: { fileSize: PRODUCT_IMAGE_MAX_BYTES, files: 1 },
    }))();

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> | Promise<Observable<unknown>> {
      const req = context.switchToHttp().getRequest<Request>();
      if (!req.is('multipart/form-data')) {
        return next.handle();
      }
      return this.upload.intercept(context, next);
    }
  }

  return mixin(OptionalProductImageMixin);
}
