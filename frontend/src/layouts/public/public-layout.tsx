import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';

import Header from '../common/header-simple';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
};

export default function PublicLayout({ children, maxWidth = 'md' }: Props) {
  return (
    <>
      <Header />

      <Container component="main">
        <Stack
          sx={{
            py: 12,
            m: 'auto',
            maxWidth: maxWidth,
            minHeight: '100vh',
            textAlign: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </Stack>
      </Container>
    </>
  );
}
