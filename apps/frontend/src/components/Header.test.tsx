import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

function renderHeader() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <Header />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Header', () => {
  it('renders the BloomStore brand without a menu button', () => {
    renderHeader();
    expect(screen.getByText('BloomStore')).toBeInTheDocument();
    expect(screen.getByText('Catalog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /cart/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /open menu/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^admin$/i })).not.toBeInTheDocument();
  });

  it('links guests to login from the header', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
  });
});
