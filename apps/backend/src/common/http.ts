import { ApiError, ApiSuccess } from '@bloomstore/shared-types';

export function ok<T>(data: T): ApiSuccess<T> {
  return { success: true, data };
}

export function fail(code: string, message: string, details?: unknown): ApiError {
  return { success: false, error: { code, message, details } };
}
