import { Button, Container, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function CartPage() {
  const { cart, upsert, remove } = useCart();
  const items = cart?.items ?? [];

  return (
    <Container className="py-8 max-w-3xl">
      <Typography variant="h4" className="mb-4">
        Shopping cart
      </Typography>
      {items.length === 0 && <Typography>Your cart is empty.</Typography>}
      {items.map((item) => (
        <div key={item.productId} className="mb-3 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
          <div>
            <Typography fontWeight={600}>{item.name}</Typography>
            <Typography variant="body2">
              ₪{item.unitPrice} × {item.quantity}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Button size="small" onClick={() => void upsert(item.productId, Math.max(1, item.quantity - 1))}>
              -
            </Button>
            <Button size="small" onClick={() => void upsert(item.productId, item.quantity + 1)}>
              +
            </Button>
            <IconButton onClick={() => void remove(item.productId)}>
              <DeleteIcon />
            </IconButton>
          </div>
        </div>
      ))}
      {items.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <Typography variant="h6">Subtotal ₪{cart?.subtotal ?? 0}</Typography>
          <Button variant="contained" component={RouterLink} to="/checkout">
            Checkout
          </Button>
        </div>
      )}
    </Container>
  );
}
