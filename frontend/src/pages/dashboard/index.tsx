import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from '@/components/settings';
import DashboardIndexView from '@/sections/dashboard/views/dashboard-index-view';

import { Container } from '@mui/material';

// ----------------------------------------------------------------------

export default function DashboardIndexPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <DashboardIndexView />
      </Container>
    </>
  );
}
