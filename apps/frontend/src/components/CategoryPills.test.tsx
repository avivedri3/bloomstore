import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CategoryPills } from './CategoryPills';

describe('CategoryPills', () => {
  it('renders elegant filters for the shop collections', () => {
    render(
      <MemoryRouter>
        <CategoryPills category="" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'All' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Bouquets' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Seasonal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Weddings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plants' })).toBeInTheDocument();
  });
});
