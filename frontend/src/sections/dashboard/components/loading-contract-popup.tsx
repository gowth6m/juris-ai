import React from 'react';
import { LoadingTopbar } from '@/components/loading-screen';

import { Box, Dialog, DialogProps, CircularProgress } from '@mui/material';

import TypingText from './typing-text';

// ----------------------------------------------------------------------

interface LoadingContractPopupProps extends DialogProps {}

const LoadingContractPopup: React.FC<LoadingContractPopupProps> = ({ ...props }) => {
  return (
    <Dialog {...props} fullWidth maxWidth="xs">
      <LoadingTopbar />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          margin: 3,
          gap: 3,
        }}
      >
        <CircularProgress size={64} />
        <TypingText
          sx={{
            fontSize: 16,
          }}
        />
      </Box>
    </Dialog>
  );
};

export default LoadingContractPopup;
