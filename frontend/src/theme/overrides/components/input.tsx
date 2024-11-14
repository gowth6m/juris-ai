import { Theme } from '@mui/material';

export function input(_theme: Theme) {
  return {
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&:-webkit-autofill': {
            transitionDelay: '9999s',
            transitionProperty: 'background-color, color',
          },
        },
      },
    },
  };
}
