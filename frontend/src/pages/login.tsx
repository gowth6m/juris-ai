import { Helmet } from 'react-helmet-async';
import LoginView from '@/sections/auth/views/login-view';
import { useSettingsContext } from '@/components/settings';

import { Container } from '@mui/material';

// ----------------------------------------------------------------------

export default function LoginPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <LoginView />
      </Container>
    </>
  );
}
