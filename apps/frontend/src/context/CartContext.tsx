import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartDto } from '@bloomstore/shared-types';
import { api, unwrap } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: CartDto | null;
  refresh: () => Promise<void>;
  upsert: (productId: string, quantity: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartDto | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setCart(await unwrap<CartDto>(api.get('/cart')));
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsert = useCallback(async (productId: string, quantity: number) => {
    setCart(await unwrap<CartDto>(api.put('/cart/items', { productId, quantity })));
  }, []);

  const remove = useCallback(async (productId: string) => {
    setCart(await unwrap<CartDto>(api.delete(`/cart/items/${productId}`)));
  }, []);

  const value = useMemo(() => ({ cart, refresh, upsert, remove }), [cart, refresh, upsert, remove]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
