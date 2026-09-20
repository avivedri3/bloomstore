import { AppBar, Badge, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const count = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar sx={{ gap: 1, flexWrap: 'wrap', py: 1 }}>
        <LocalFloristIcon sx={{ mr: 0.5 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, flexGrow: 1, minWidth: 120 }}
        >
          BloomStore
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button color="inherit" component={RouterLink} to="/">
            Catalog
          </Button>
          {user && (
            <>
              <Button color="inherit" component={RouterLink} to="/orders">
                Orders
              </Button>
              <Badge badgeContent={count} color="secondary" sx={{ mx: 0.5 }}>
                <Button color="inherit" component={RouterLink} to="/cart">
                  Cart
                </Button>
              </Badge>
            </>
          )}
          {user?.role === 'admin' && (
            <Button color="inherit" component={RouterLink} to="/admin">
              Admin
            </Button>
          )}
          {user ? (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: { sm: 1 } }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.fullName}
              </Typography>
              <Button
                color="inherit"
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'inherit' }}
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
              >
                Logout
              </Button>
            </Stack>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'inherit' }}
                component={RouterLink}
                to="/register"
              >
                Register
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
