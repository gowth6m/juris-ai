import { Box, Alert, CardMedia } from '@mui/material';

import Column from './column';

interface Props {
  message: string;
}

const ErrorView: React.FC<Props> = ({ message }) => {
  return (
    <Column
      sx={{
        gap: 2,
        padding: 8,
        height: '100%',
        width: '100%',
        display: 'flex',
        borderRadius: 2,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: 'auto',
          height: 180,
          display: 'inline-flex',
        }}
      >
        <CardMedia
          component="img"
          image="/assets/floating.svg"
          alt={'Error illustration'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
      <Alert severity="error" variant="filled">
        {message}
      </Alert>
    </Column>
  );
};

export default ErrorView;
