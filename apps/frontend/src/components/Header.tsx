import { useState } from 'react';
import { AppBar, Avatar, Badge, Button, Divider, IconButton, Menu, MenuItem, Stack, Toolbar, Typography } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { bloomTokens } from '../theme/tokens';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [accountEl, setAccountEl] = useState<null | HTMLElement>(null);
  const count = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const accountOpen = Boolean(accountEl);

  const closeAccount = () => setAccountEl(null);

  return (
    <AppBar position="sticky">
      <Toolbar
        sx={{
          gap: { xs: 1, md: 2 },
          px: { xs: 2, md: 4 },
          py: { xs: 1, md: 1.25 },
          minHeight: { xs: 64, md: 80 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          component={RouterLink}
          to="/"
          sx={{ color: 'inherit', textDecoration: 'none' }}
        >
          <LocalFloristIcon sx={{ color: bloomTokens.color.rose, fontSize: 26 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, letterSpacing: '-0.02em', fontSize: { xs: '1.15rem', md: '1.35rem' } }}
          >
            BloomStore
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 'auto' }}>
          <Button color="inherit" component={RouterLink} to="/" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
            Catalog
          </Button>
          <Button color="inherit" component={RouterLink} to="/contact">
            Contact us
          </Button>
          {user && (
            <Button color="inherit" component={RouterLink} to="/orders" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              Orders
            </Button>
          )}
          <IconButton color="inherit" component={RouterLink} to="/cart" aria-label="Cart">
            <Badge badgeContent={count} color="primary">
              <ShoppingBagOutlinedIcon />
            </Badge>
          </IconButton>
          {user ? (
            <>
              <IconButton
                color="inherit"
                aria-label="Account menu"
                aria-haspopup="true"
                aria-expanded={accountOpen ? 'true' : undefined}
                onClick={(event) => setAccountEl(event.currentTarget)}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: bloomTokens.color.leaf,
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: '"DM Sans", sans-serif',
                  }}
                >
                  {initials(user.fullName)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={accountEl}
                open={accountOpen}
                onClose={closeAccount}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { mt: 1.5, minWidth: 200, borderRadius: 2 } } }}
              >
                <MenuItem disabled sx={{ opacity: '1 !important', py: 1.25 }}>
                  <Stack>
                    <Typography variant="body2" fontWeight={700} color="text.primary">
                      {user.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.role === 'admin' ? 'Store admin' : 'Customer'}
                    </Typography>
                  </Stack>
                </MenuItem>
                <Divider />
                <MenuItem component={RouterLink} to="/orders" onClick={closeAccount} sx={{ display: { sm: 'none' } }}>
                  Orders
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem component={RouterLink} to="/admin" onClick={closeAccount}>
                    Admin
                  </MenuItem>
                )}
                <MenuItem
                  onClick={async () => {
                    closeAccount();
                    await logout();
                    navigate('/');
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
