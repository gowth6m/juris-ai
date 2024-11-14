import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from '@/components/settings';
import HistoryView from '@/sections/dashboard/views/history-view';

import { Container } from '@mui/material';

// ----------------------------------------------------------------------
export default function HistoryPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>History</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <HistoryView />
      </Container>
    </>
  );
}
