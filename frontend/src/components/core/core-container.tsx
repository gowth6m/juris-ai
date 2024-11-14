import React from 'react';

import { Card, SxProps } from '@mui/material';

// ----------------------------------------------------------------------

interface Props {
  children: React.ReactNode;
  sx?: SxProps;
}

const CoreContainer: React.FC<Props> = ({ children, sx, ...other }) => {
  return (
    <Card
      variant={'outlined'}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3, ...sx }}
      {...other}
    >
      {children}
    </Card>
  );
};

export default CoreContainer;
