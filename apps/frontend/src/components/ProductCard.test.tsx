import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ProductDto } from '@bloomstore/shared-types';
import { ProductCard } from './ProductCard';

const base: ProductDto = {
  id: 'p1',
  name: 'Sunset Bouquet',
  description: 'Orange tulips, gerberas and spray roses.',
  category: 'bouquets',
  price: 165,
  stock: 0,
  imageUrl: 'https://example.com/sunset.jpg',
  isActive: true,
};

describe('ProductCard', () => {
  it('shows out-of-stock flowers with a notify action instead of add to cart', () => {
    render(
      <MemoryRouter>
        <ProductCard product={base} onAddToCart={() => undefined} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Out of stock').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /email me/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
  });

  it('shows add to cart for in-stock flowers', () => {
    render(
      <MemoryRouter>
        <ProductCard product={{ ...base, stock: 8, name: 'Garden Rose Hand-Tied' }} onAddToCart={() => undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /email me/i })).not.toBeInTheDocument();
  });
});
