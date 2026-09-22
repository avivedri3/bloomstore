import { render, screen } from '@testing-library/react';
import { CatalogHero } from './CatalogHero';

describe('CatalogHero', () => {
  it('renders a florist headline and Shop Flowers call to action', () => {
    render(<CatalogHero />);
    expect(screen.getByRole('heading', { name: /flowers for every moment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shop flowers/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /peonies/i })).toBeInTheDocument();
  });
});
