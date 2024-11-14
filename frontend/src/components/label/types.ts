import { BoxProps } from '@mui/material/Box';

// ----------------------------------------------------------------------

export type LabelColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type LabelVariant = 'filled' | 'outlined' | 'soft';

export interface LabelProps extends BoxProps {
  color?: LabelColor;
  endIcon?: React.ReactElement | null;
  startIcon?: React.ReactElement | null;
  variant?: LabelVariant;
}
