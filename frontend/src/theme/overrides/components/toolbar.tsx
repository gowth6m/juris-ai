import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function toolBar(_theme: Theme) {
  return {
    MuiToolbar: {
      styleOverrides: {
        root: {
          height: {
            xs: 64,
            md: 80,
          },
        },
      },
    },
  };
}
