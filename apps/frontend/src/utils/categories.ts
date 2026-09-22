import { PRODUCT_CATEGORIES, type ProductCategory } from '@bloomstore/shared-types';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bouquets: 'Bouquets',
  roses: 'Roses',
  seasonal: 'Seasonal',
  plants: 'Plants',
  weddings: 'Weddings',
  sympathy: 'Sympathy',
};

export function isProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}
