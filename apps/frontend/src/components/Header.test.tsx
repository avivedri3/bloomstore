import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

describe('Header', () => {
  it('renders the BloomStore brand', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('BloomStore')).toBeInTheDocument();
    expect(screen.getByText('Catalog')).toBeInTheDocument();
  });
});
