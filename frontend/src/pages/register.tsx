import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from '@/components/settings';
import RegisterView from '@/sections/auth/views/register-view';

import { Container } from '@mui/material';

// ----------------------------------------------------------------------

export default function RegisterPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Register</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <RegisterView />
      </Container>
    </>
  );
}
