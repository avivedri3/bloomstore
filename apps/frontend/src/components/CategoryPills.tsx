import { Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@bloomstore/shared-types';
import { bloomTokens } from '../theme/tokens';
import { CATEGORY_LABELS } from '../utils/categories';

const PILLS: Array<{ id: ProductCategory | ''; label: string }> = [
  { id: '', label: 'All' },
  ...PRODUCT_CATEGORIES.map((id) => ({ id, label: CATEGORY_LABELS[id] })),
];

type CategoryPillsProps = {
  category: ProductCategory | '';
};

export function CategoryPills({ category }: CategoryPillsProps) {
  return (
    <Box
      component="nav"
      aria-label="Shop categories"
      sx={{
        display: 'flex',
        justifyContent: { xs: 'flex-start', md: 'center' },
        gap: { xs: 0.5, md: 1 },
        overflowX: 'auto',
        mb: { xs: 3, md: 5 },
        mx: { xs: -2, sm: 0 },
        px: { xs: 2, sm: 0 },
        pb: 0.5,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {PILLS.map((pill) => {
        const selected = category === pill.id;
        return (
          <Button
            key={pill.id || 'all'}
            component={RouterLink}
            to={pill.id ? `/?category=${pill.id}` : '/'}
            aria-current={selected ? 'page' : undefined}
            sx={{
              flexShrink: 0,
              minHeight: 40,
              px: { xs: 1.5, md: 2 },
              borderRadius: 0,
              border: 'none',
              borderBottom: '1px solid',
              borderColor: selected ? bloomTokens.color.rose : 'transparent',
              bgcolor: 'transparent',
              color: selected ? bloomTokens.color.rose : 'text.secondary',
              boxShadow: 'none',
              fontWeight: selected ? 600 : 500,
              letterSpacing: '0.04em',
              '&:hover': {
                bgcolor: 'transparent',
                color: bloomTokens.color.ink,
                borderColor: selected ? bloomTokens.color.rose : bloomTokens.color.creamDark,
                transform: 'none',
              },
            }}
          >
            {pill.label}
          </Button>
        );
      })}
    </Box>
  );
}
