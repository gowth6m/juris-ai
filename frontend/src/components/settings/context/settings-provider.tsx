import isEqual from 'lodash/isEqual';
import AppConfig from '@/configs/app-config';
import { useMemo, useState, useCallback } from 'react';

import { useLocalStorage } from 'src/hooks/use-local-storage';

import { SettingsValueProps } from '../types';
import { SettingsContext } from './settings-context';

// ----------------------------------------------------------------------

const STORAGE_KEY = AppConfig.localStorageKeys.settings;

type SettingsProviderProps = {
  children: React.ReactNode;
  defaultSettings: SettingsValueProps;
};

export function SettingsProvider({ children, defaultSettings }: SettingsProviderProps) {
  const { state, update, reset } = useLocalStorage(STORAGE_KEY, defaultSettings);

  const [openDrawer, setOpenDrawer] = useState(false);

  // Drawer
  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(
    {
      themeStretch: state.themeStretch,
      themeMode: state.themeMode,
      themeDirection: state.themeDirection,
      themeLayout: state.themeLayout,
    },
    {
      themeStretch: defaultSettings.themeStretch,
      themeMode: defaultSettings.themeMode,
      themeDirection: defaultSettings.themeDirection,
      themeLayout: defaultSettings.themeLayout,
    }
  );

  const memoizedValue = useMemo(
    () => ({
      ...state,
      onUpdate: update,
      // Reset
      canReset,
      onReset: reset,
      // Drawer
      open: openDrawer,
      onToggle: onToggleDrawer,
      onClose: onCloseDrawer,
    }),
    [reset, update, state, canReset, openDrawer, onCloseDrawer, onToggleDrawer]
  );

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>;
}
