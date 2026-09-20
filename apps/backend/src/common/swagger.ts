import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

export const API_BEARER = 'access-token';

export function ApiAuth(): MethodDecorator & ClassDecorator {
  return applyDecorators(ApiBearerAuth(API_BEARER));
}

export function ApiEnvelopeOk(description = 'Success'): MethodDecorator {
  return ApiResponse({
    status: 200,
    description,
    schema: {
      example: { success: true, data: {} },
    },
  });
}

export function ApiEnvelopeErrors(): MethodDecorator {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Validation or business rule error',
      schema: { example: { success: false, error: { code: 'VALIDATION_ERROR', message: '...' } } },
    }),
    ApiResponse({
      status: 401,
      description: 'Missing or invalid JWT',
      schema: { example: { success: false, error: { code: 'UNAUTHORIZED', message: '...' } } },
    }),
  );
}
