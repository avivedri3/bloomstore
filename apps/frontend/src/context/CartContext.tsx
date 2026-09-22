import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartDto } from '@bloomstore/shared-types';
import { api, unwrap } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextValue {
  cart: CartDto | null;
  refresh: () => Promise<void>;
  add: (productId: string) => Promise<void>;
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
    try {
      setCart(await unwrap<CartDto>(api.get('/cart')));
    } catch {
      setCart(null);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const remove = useCallback(async (productId: string) => {
    setCart(await unwrap<CartDto>(api.delete(`/cart/items/${productId}`)));
  }, []);

  const upsert = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1) {
        await remove(productId);
        return;
      }
      setCart(await unwrap<CartDto>(api.put('/cart/items', { productId, quantity })));
    },
    [remove],
  );

  const cartRef = useRef(cart);
  cartRef.current = cart;

  const add = useCallback(
    async (productId: string) => {
      const current = cartRef.current?.items.find((item) => item.productId === productId)?.quantity ?? 0;
      await upsert(productId, current + 1);
    },
    [upsert],
  );

  const value = useMemo(() => ({ cart, refresh, add, upsert, remove }), [cart, refresh, add, upsert, remove]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
