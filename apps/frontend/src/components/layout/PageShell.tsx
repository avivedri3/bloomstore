import type { ReactNode } from 'react';
import { Container, type ContainerProps } from '@mui/material';

type PageShellProps = ContainerProps & {
  children: ReactNode;
};

export function PageShell({ children, maxWidth = 'lg', sx, ...rest }: PageShellProps) {
  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 2.5, sm: 4, md: 5 }, ...sx }} {...rest}>
      {children}
    </Container>
  );
}
