import { useRouter } from '@/routes/hooks';
import { Upload } from '@/components/upload';
import Column from '@/components/core/column';
import ApiClient from '@/services/api-client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useSnackbar } from '@/components/snackbar';
import { LoadingTopbar } from '@/components/loading-screen';

import { Alert, Stack, Typography } from '@mui/material';

import FileRecentItem from '../components/file-recent-item';

// --------------------------------------------------

const DashboardIndexView = () => {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const [file, setFile] = useState<File | string>('');

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      return await ApiClient.contract.uploadContract({ file, title: file.name });
    },
    onError: () => {
      enqueueSnackbar('Error uploading file', { variant: 'error' });
      setFile('');
    },
    onSuccess: (res) => {
      router.push(`/dashboard/contract/${res.data._id}`);
    },
  });

  const handleDropSingleFile = useCallback(
    (acceptedFiles: File[]) => {
      const newFile = acceptedFiles[0];
      if (newFile) {
        setFile(
          Object.assign(newFile, {
            preview: URL.createObjectURL(newFile),
          })
        );
        uploadFileMutation.mutate(newFile as File);
      }
    },
    [uploadFileMutation]
  );

  const handleRemoveFile = (_inputFile: File | string) => {
    setFile('');
  };

  const recentQuery = useQuery({
    queryKey: ['getAllContracts', { page: 1, limit: 5 }],
    queryFn: async () => {
      return await ApiClient.contract.getAllContracts({
        page: 1,
        limit: 5,
      });
    },
  });

  return (
    <Column>
      {recentQuery.isLoading && <LoadingTopbar />}

      <Typography variant="h5">Dashboard</Typography>

      <Upload
        file={file}
        onDrop={handleDropSingleFile}
        onRemove={handleRemoveFile}
        accept={{
          'application/pdf': ['.pdf'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        }}
      />

      <Typography variant="h5">Recent</Typography>

      {recentQuery.isLoading ? (
        <Alert severity="info">Loading...</Alert>
      ) : recentQuery.isError ? (
        <Alert severity="error">Error loading history</Alert>
      ) : !recentQuery?.data?.data?.length ? (
        <Alert severity="info">No contracts found</Alert>
      ) : (
        <Stack spacing={2}>
          {recentQuery?.data?.data?.map((file) => (
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
    </Column>
  );
};

export default DashboardIndexView;
