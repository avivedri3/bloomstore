import { z } from 'zod';

export const USER_ROLES = ['customer', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORDER_STATUSES = [
  'pending_payment',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'authorized', 'captured', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PRODUCT_CATEGORIES = [
  'bouquets',
  'roses',
  'seasonal',
  'plants',
  'weddings',
  'sympathy',
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export const apiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess<T> = { success: true; data: T };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const productInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(8),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url(),
  isActive: z.boolean().default(true),
});

export const cartItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const addressInputSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  city: z.string().min(2),
  street: z.string().min(2),
  houseNumber: z.string().min(1),
  apartment: z.string().optional(),
  notes: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1),
  idempotencyKey: z.string().min(8),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthPayload {
  user: PublicUser;
  accessToken: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
}

export interface CartItemDto {
  productId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
}

export interface CartDto {
  id: string;
  userId: string;
  items: CartItemDto[];
  subtotal: number;
}

export interface PriceSnapshot {
  productId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: PriceSnapshot[];
  total: number;
  addressId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStatsDto {
  totalRevenue: number;
  openOrders: number;
  dailySalesCount: number;
  lowStockAlerts: number;
  userGrowth: number;
  salesByDay: { date: string; revenue: number; count: number }[];
}

export const ACCOUNT_LOCKED_CODE = 'ACCOUNT_LOCKED';
export const MAX_FAILED_LOGINS = 5;
