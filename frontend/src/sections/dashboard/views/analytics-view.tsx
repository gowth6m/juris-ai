import { paths } from '@/routes/paths';
import { useQuery } from 'react-query';
import Row from '@/components/core/row';
import ApiClient from '@/services/api-client';
import Column from '@/components/core/column';
import { LoadingTopbar } from '@/components/loading-screen';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import { Card, Alert, Typography } from '@mui/material';

// ----------------------------------------------------------------------

const StatCard = ({ title, value }: { title: string; value: number }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        width: 200,
      }}
    >
      <Column padding={3} height={'100%'}>
        <Typography variant="h6">{title}</Typography>
        <Typography
          variant="h3"
          color={'primary'}
          sx={{
            marginTop: 'auto',
          }}
        >
          {value}
        </Typography>
      </Column>
    </Card>
  );
};

// ----------------------------------------------------------------------

const AnalyticsView = () => {
  const qOverview = useQuery({
    queryKey: ['analytics/overview'],
    queryFn: async () => {
      return ApiClient.analytics.overview();
    },
  });

  const renderHeader = (
    <CustomBreadcrumbs
      heading="Analytics"
      links={[
        {
          name: 'Dashboard',
          href: paths.DASHBOARD.INDEX,
        },
        { name: 'Analytics' },
      ]}
    />
  );

  const renderLoading = (
    <Column>
      <LoadingTopbar />
    </Column>
  );

  const renderError = <Alert severity="error">Error loading analytics data</Alert>;

  const renderOverview = (
    <Row>
      <StatCard title="Total clauses analysed" value={qOverview.data?.data?.total_clauses ?? 0} />
      <StatCard
        title="Total contracts reviewed"
        value={qOverview.data?.data?.total_contracts ?? 0}
      />
      <StatCard title="Total pages scanned" value={qOverview.data?.data?.total_pages ?? 0} />
      <StatCard
        title="Total risks identified"
        value={qOverview.data?.data?.total_risky_clauses ?? 0}
      />
      {/* <StatCard title="Tokens used" value={qOverview.data?.data?.total_tokens_used ?? 0} /> */}
    </Row>
  );

  return (
    <Column>
      {qOverview.isLoading && <LoadingTopbar />}

      {renderHeader}

      {qOverview.isLoading ? renderLoading : qOverview.isError ? renderError : renderOverview}
    </Column>
  );
};

export default AnalyticsView;
