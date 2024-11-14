import { Theme } from '@mui/material';

// ----------------------------------------------------------------------

export function tableHead(theme: Theme) {
  return {
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            color: theme.palette.text.secondary,
            backgroundColor: theme.palette.background.tableHead,
          },
        },
      },
    },
  };
}
