import React from 'react';

import { Stack, SxProps, StackProps } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends StackProps {
  children: React.ReactNode;
  onMobile?: 'column' | 'row' | 'row-reverse' | 'column-reverse';
  gap?: number;
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  centerContent?: boolean;
  sx?: SxProps;
  width?: number | string;
}

// ----------------------------------------------------------------------

const Row: React.FC<Props> = ({
  children,
  onMobile,
  gap = 2,
  flexDirection = 'row',
  centerContent,
  width,
  sx,
  ...other
}) => {
  return (
    <Stack
      flexDirection={{ xs: onMobile ?? flexDirection, md: flexDirection }}
      gap={gap}
      sx={{
        gap: gap,
        width: width,
        ...(centerContent && {
          alignItems: 'center',
          justifyContent: 'center',
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Stack>
  );
};

export default Row;
