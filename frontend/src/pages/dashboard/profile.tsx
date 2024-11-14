import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from '@/components/settings';
import ProfileView from '@/sections/auth/views/profile-view';

import { Container } from '@mui/material';

// ----------------------------------------------------------------------
export default function ProfilePage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Profile</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <ProfileView />
      </Container>
    </>
  );
}
