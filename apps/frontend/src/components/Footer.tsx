import { Box, Container, Divider, Link, Stack, Typography } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import { Link as RouterLink } from 'react-router-dom';
import { PRODUCT_CATEGORIES } from '@bloomstore/shared-types';
import { bloomTokens } from '../theme/tokens';
import { CATEGORY_LABELS } from '../utils/categories';

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: { xs: 4, md: 6 },
        pb: 3,
        px: 2,
        bgcolor: bloomTokens.color.creamDark,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Stack spacing={1} sx={{ maxWidth: 360 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <LocalFloristIcon sx={{ color: bloomTokens.color.rose }} />
              <Typography variant="h6" fontWeight={500}>
                BloomStore
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Fresh flowers, plants, and occasion arrangements — an ORT diploma flower shop.
            </Typography>
          </Stack>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={2}>
            <Link component={RouterLink} to="/contact" underline="hover" color="text.secondary" variant="body2">
              Contact us
            </Link>
            {PRODUCT_CATEGORIES.map((category) => (
              <Link
                key={category}
                component={RouterLink}
                to={`/?category=${category}`}
                underline="hover"
                color="text.secondary"
                variant="body2"
              >
                {CATEGORY_LABELS[category]}
              </Link>
            ))}
          </Stack>
        </Stack>
        <Divider sx={{ my: 3, opacity: 0.7 }} />
        <Typography variant="body2" color="text.secondary" textAlign={{ xs: 'left', md: 'center' }}>
          BloomStore · ORT diploma project · {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  );
}
