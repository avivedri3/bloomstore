import { Box, Typography, type TypographyProps } from '@mui/material';

type PriceProps = {
  value: number;
  prefix?: string;
} & Pick<TypographyProps, 'variant' | 'color' | 'sx' | 'component'>;

export function Price({ value, prefix, variant = 'h6', color = 'primary.main', sx, ...rest }: PriceProps) {
  return (
    <Typography
      variant={variant}
      color={color}
      sx={{ fontFamily: '"DM Sans", "Segoe UI", system-ui, sans-serif', letterSpacing: 0, ...sx }}
      {...rest}
    >
      {prefix}
      <Box component="span" sx={{ fontFamily: 'system-ui, "Segoe UI", sans-serif' }}>
        ₪
      </Box>
      {value}
    </Typography>
  );
}
