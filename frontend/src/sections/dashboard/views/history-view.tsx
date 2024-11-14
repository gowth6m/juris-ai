import { paths } from '@/routes/paths';
import { useQuery } from 'react-query';
import { useRouter } from '@/routes/hooks';
import ApiClient from '@/services/api-client';
import { LoadingTopbar } from '@/components/loading-screen';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import { Alert, Stack } from '@mui/material';

import FileRecentItem from '../components/file-recent-item';

// ----------------------------------------------------------------------

const HistoryView = () => {
  const router = useRouter();

  const historyQuery = useQuery({
    queryKey: ['getAllContracts'],
    queryFn: async () => {
      return await ApiClient.contract.getAllContracts({});
    },
  });

  const renderHeader = (
    <CustomBreadcrumbs
      heading="History"
      links={[
        {
          name: 'Dashboard',
          href: paths.DASHBOARD.INDEX,
        },
        { name: 'History' },
      ]}
      sx={{
        mb: 3,
      }}
    />
  );

  return (
    <div>
      {historyQuery.isLoading && <LoadingTopbar />}

      {renderHeader}

      {historyQuery.isLoading ? (
        <Alert severity="info">Loading...</Alert>
      ) : historyQuery.isError ? (
        <Alert severity="error">Error loading history</Alert>
      ) : !historyQuery?.data?.data?.length ? (
        <Alert severity="info">No contracts found</Alert>
      ) : (
        <Stack spacing={2}>
          {historyQuery?.data?.data?.map((file) => (
            <FileRecentItem
              key={file._id}
              file={file}
              onClick={() => {
                if (file.has_review) {
                  router.push(`/dashboard/contract/${file._id}/review`);
                } else {
                  router.push(`/dashboard/contract/${file._id}`);
                }
              }}
              onDelete={() => console.info('DELETE', file._id)}
            />
          ))}
        </Stack>
      )}
    </div>
  );
};

export default HistoryView;
