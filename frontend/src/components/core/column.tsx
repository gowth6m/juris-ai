import React from 'react';

import { Stack, SxProps, StackProps } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends StackProps {
  children: React.ReactNode;
  onMobile?: 'column' | 'row';
  gap?: number;
  centerContent?: boolean;
  sx?: SxProps;
  flex?: number | string;
  width?: string | number;
}

// ----------------------------------------------------------------------

const Column: React.FC<Props> = ({
  children,
  onMobile = 'column',
  gap = 2,
  centerContent,
  flex,
  sx,
  width,
  ...other
}) => {
  return (
    <Stack
      flex={flex}
      sx={{
        overflow: 'hidden',
        flexDirection: {
          xs: onMobile,
          md: 'column',
        },
        gap: gap,
        ...(centerContent && {
          alignItems: 'center',
          justifyContent: 'center',
        }),
        width: width,
        ...sx,
      }}
      {...other}
    >
      {children}
    </Stack>
  );
};

export default Column;
