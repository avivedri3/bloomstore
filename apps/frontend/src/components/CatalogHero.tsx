import { Box, Button, Stack, Typography } from '@mui/material';

const HERO_IMAGE =
  'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=1800';

export function CatalogHero() {
  const shopFlowers = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Box
      component="section"
      aria-label="BloomStore introduction"
      sx={{
        position: 'relative',
        minHeight: { xs: 520, sm: 580, md: 'min(82vh, 720px)' },
        overflow: 'hidden',
        color: '#fffaf6',
      }}
    >
      <Box
        component="img"
        src={HERO_IMAGE}
        alt="Hand-tied bouquet of blush peonies and garden roses"
        loading="eager"
        fetchPriority="high"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: 'linear-gradient(to top, rgba(31, 41, 51, 0.62) 0%, rgba(31, 41, 51, 0.18) 48%, rgba(31, 41, 51, 0.08) 100%)',
            md: 'linear-gradient(90deg, rgba(31, 41, 51, 0.5) 0%, rgba(31, 41, 51, 0.18) 42%, transparent 72%)',
          },
        }}
      />
      <Stack
        spacing={2}
        justifyContent={{ xs: 'flex-end', md: 'center' }}
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: { xs: 520, sm: 580, md: 'min(82vh, 720px)' },
          px: { xs: 3, sm: 5, md: 8, lg: 12 },
          py: { xs: 5, md: 8 },
          maxWidth: 720,
        }}
      >
        <Typography variant="overline" sx={{ color: 'rgba(255, 250, 246, 0.82)', letterSpacing: '0.22em' }}>
          Atelier florist
        </Typography>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: '2.6rem', sm: '3.4rem', md: '4.25rem' },
            lineHeight: 1.05,
            fontWeight: 500,
            color: '#fffaf6',
          }}
        >
          Flowers for every moment
        </Typography>
        <Typography sx={{ fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 420, lineHeight: 1.75, color: 'rgba(255, 250, 246, 0.88)' }}>
          Hand-tied bouquets and seasonal stems, arranged with care.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={shopFlowers}
          sx={{
            alignSelf: 'flex-start',
            mt: 1,
            px: 3.5,
            bgcolor: '#fffaf6',
            color: 'text.primary',
            '&:hover': { bgcolor: '#f3e7dc' },
          }}
        >
          Shop Flowers
        </Button>
      </Stack>
    </Box>
  );
}
