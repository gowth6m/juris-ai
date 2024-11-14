import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from '@/components/settings';
import AnalyticsView from '@/sections/dashboard/views/analytics-view';

import { Container } from '@mui/material';

// ----------------------------------------------------------------------
export default function AnalyticsPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Analytics</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <AnalyticsView />
      </Container>
    </>
  );
}
