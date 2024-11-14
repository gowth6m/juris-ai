import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from '@/components/settings';
import LogoutView from '@/sections/auth/views/logout-view';

import { Container } from '@mui/material';

// ----------------------------------------------------------------------
export default function LogoutPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Logging out</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <LogoutView />
      </Container>
    </>
  );
}
