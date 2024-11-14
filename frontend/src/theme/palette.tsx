import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type ColorSchema = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    dialog: string;
    neutral: string;
    box: string;
    contrast: string;
    tableHead: string;
  }
  interface SimplePaletteColorOptions {
    darker: string;
    lighter: string;
  }
  interface PaletteColor {
    darker: string;
    lighter: string;
  }
  interface TextColor {
    disabled: string;
    primary: string;
    secondary: string;
    tertiary: string;
  }
}

// SETUP COLORS

export const grey = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#CCD5DB',
  500: '#9DA8B4',
  600: '#4B5662',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};

// PRIMARY COLORS

export const secondaryLight = {
  lighter: '#FEDCAE',
  light: '#FECA85',
  main: '#FEB95F',
  dark: '#FEA634',
  darker: '#FE950B',
  contrastText: '#212B36',
};

export const primaryDark = {
  lighter: '#FEDCAE',
  light: '#FECA85',
  main: '#FEB95F',
  dark: '#FEA634',
  darker: '#FE950B',
  contrastText: '#212B36',
};

// SECONDARY COLORS

export const primaryLight = {
  lighter: '#7E65A4',
  light: '#6A538D',
  main: '#574474',
  dark: '#44355A',
  darker: '#302640',
  contrastText: '#F8F8F8',
};

export const secondaryDark = {
  lighter: '#D0C0E8FF',
  light: '#BCA8DAFF',
  main: '#A892C8FF',
  dark: '#44355A',
  darker: '#302640',
  contrastText: '#F8F8F8',
};

export const info = {
  lighter: '#CAFDF5',
  light: '#61F3F3',
  main: '#00B8D9',
  dark: '#006C9C',
  darker: '#003768',
  contrastText: '#FFFFFF',
};

export const success = {
  lighter: '#D3FCD2',
  light: '#77ED8B',
  main: '#22C55E',
  dark: '#118D57',
  darker: '#065E49',
  contrastText: '#F8F8F8',
};

export const warning = {
  lighter: '#FFF5CC',
  light: '#FFD666',
  main: '#FFAB00',
  dark: '#B76E00',
  darker: '#7A4100',
  contrastText: grey[800],
};

// ERROR COLORS

export const errorLight = {
  lighter: '#FFE9D5',
  light: '#FFAC82',
  main: '#981B1E',
  dark: '#B71D18',
  darker: '#7A0916',
  contrastText: '#F8F8F8',
};

export const error = {
  lighter: '#E77476',
  light: '#FF0004',
  main: '#981B1E',
  dark: '#791517',
  darker: '#570F10',
  contrastText: '#F8F8F8',
};

export const errorDark = {
  lighter: '#f8f8f8',
  light: '#FFEBEB',
  main: '#FFC7C7',
  dark: '#FFADAD',
  darker: '#FF8585',
  contrastText: '#212B36',
};

// COMMON COLORS

export const common = {
  black: '#080A0D',
  white: '#F8F8F8',
};

export const action = {
  hover: alpha(grey[500], 0.08),
  selected: alpha(grey[500], 0.16),
  disabled: alpha(grey[500], 0.5),
  disabledBackground: alpha(grey[500], 0.24),
  focus: alpha(grey[500], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

const base = {
  primary: primaryLight,
  secondary: secondaryLight,
  info,
  success,
  warning,
  error,
  grey,
  common,
  divider: alpha(grey[500], 0.4),
  action,
};

// ----------------------------------------------------------------------

export function palette(mode: 'light' | 'dark') {
  const light = {
    ...base,
    mode: 'light',
    primary: primaryLight,
    secondary: secondaryLight,
    error: error,
    text: {
      primary: grey[800],
      secondary: grey[600],
      tertiary: grey[600],
      disabled: grey[500],
    },
    background: {
      paper: grey[100],
      default: grey[200],
      neutral: grey[200],
      dialog: grey[200],
      box: grey[300],
      contrast: grey[800],
      tableHead: alpha(grey[300], 0.5),
    },
    action: {
      ...base.action,
      active: grey[600],
    },
  };

  const dark = {
    ...base,
    mode: 'dark',
    primary: primaryDark,
    secondary: secondaryDark,
    error: error,
    text: {
      primary: '#f8f8f8',
      secondary: grey[400],
      tertiary: grey[500],
      disabled: grey[600],
    },
    background: {
      paper: grey[800],
      default: grey[900],
      neutral: alpha(grey[500], 0.12),
      dialog: grey[800],
      box: grey[700],
      contrast: grey[200],
      tableHead: grey[800],
    },
    action: {
      ...base.action,
      active: grey[500],
    },
  };

  return mode === 'light' ? light : dark;
}
