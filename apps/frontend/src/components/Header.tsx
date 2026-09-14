import { AppBar, Badge, Box, Button, Toolbar, Typography } from '@mui/material';
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
    <AppBar position="sticky" color="primary" elevation={0}>
      <Toolbar className="gap-3">
        <LocalFloristIcon />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, flexGrow: 1 }}
        >
          BloomStore
        </Typography>
        <Button color="inherit" component={RouterLink} to="/">
          Catalog
        </Button>
        {user && (
          <>
            <Button color="inherit" component={RouterLink} to="/orders">
              Orders
            </Button>
            <Badge badgeContent={count} color="secondary">
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
          <Box className="flex items-center gap-2">
            <Typography variant="body2">{user.fullName}</Typography>
            <Button
              color="inherit"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
