import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '@bloomstore/shared-types';

const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

export const api = axios.create({
  baseURL: configuredApiBase || 'http://localhost:3030/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bloomstore.token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  try {
    const { data } = await promise;
    if (!data.success) {
      throw new ApiClientError(data.error.code, data.error.message);
    }
    return data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    const ax = error as AxiosError<ApiResponse<never>>;
    const body = ax.response?.data;
    if (body && body.success === false) {
      throw new ApiClientError(body.error.code, body.error.message);
    }
    throw error;
  }
}
