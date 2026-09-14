import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { fail } from './http';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message =
        typeof payload === 'string'
          ? payload
          : ((payload as { message?: string | string[] }).message?.toString() ??
            exception.message);
      const code =
        typeof payload === 'object' && payload && 'code' in payload
          ? String((payload as { code: string }).code)
          : exception.name;
      res.status(status).json(fail(code, message, payload));
      return;
    }
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json(fail('INTERNAL_ERROR', 'Unexpected server error'));
  }
}
