import { Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function tableContainer(_theme: Theme) {
  return {
    MuiTableContainer: {
      styleOverrides: {
        root: {
          width: '100%',
          display: 'table',
          tableLayout: 'fixed',
        },
      },
    },
  };
}
