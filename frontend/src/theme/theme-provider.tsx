import React from 'react';
import { merge } from 'lodash';
import { useMemo } from 'react';
import { useSettingsContext } from '@/components/settings';

import {
  createTheme,
  CssBaseline,
  ThemeOptions,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material';

import { palette } from './palette';
import { typography } from './typography';
import { customShadows } from './custom-shadows';
import { componentsOverrides } from './overrides';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  forceTheme?: 'light' | 'dark';
};

export default function ThemeProvider({ children, forceTheme }: Props) {
  const settings = useSettingsContext();

  const themeToUse = forceTheme ?? settings.themeMode;

  const memoizedValue = useMemo(
    () =>
      ({
        palette: {
          ...palette(themeToUse),
        },
        customShadows: {
          ...customShadows(themeToUse),
        },
        shape: { borderRadius: 8 },
        typography: typography,
        direction: settings.themeDirection,
      }) as ThemeOptions,
    [settings.themeDirection, themeToUse]
  );

  const themeObj = createTheme(memoizedValue);
  themeObj.components = merge(componentsOverrides(themeObj));

  return (
    <MuiThemeProvider theme={themeObj}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
