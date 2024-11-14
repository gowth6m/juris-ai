import { Box, Alert, CardMedia } from '@mui/material';

import Column from './column';

interface Props {
  message: string;
  hideInfoIcon?: boolean;
}

const EmptyView: React.FC<Props> = ({ message }) => {
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
          image="/assets/empty.svg"
          alt={'Empty illustration'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
      <Alert severity="info">{message}</Alert>
    </Column>
  );
};

export default EmptyView;
