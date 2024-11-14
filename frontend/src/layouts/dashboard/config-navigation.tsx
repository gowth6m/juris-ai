/* eslint-disable react-refresh/only-export-components */

import Iconify from '@/components/iconify';

import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const ICONS = {
  dashboard: <Iconify icon="solar:home-2-bold" width={1} height={1} />,
  history: <Iconify icon="solar:history-outline" width={1} height={1} />,
  analytics: <Iconify icon="solar:graph-bold-duotone" width={1} height={1} />,
  contracts: <Iconify icon="solar:documents-bold-duotone" width={1} height={1} />,
  profile: <Iconify icon="solar:user-bold-duotone" width={1} height={1} />,
  logout: <Iconify icon="solar:logout-2-bold-duotone" width={1} height={1} />,
};

// ----------------------------------------------------------------------

export function useNavData() {
  // MAIN MENU
  const mainMenuData = {
    subheader: '',
    items: [
      { title: 'Dashboard', path: paths.DASHBOARD.INDEX, icon: ICONS.dashboard },
      { title: 'History', path: paths.DASHBOARD.HISTORY, icon: ICONS.history, disabled: false },
      {
        title: 'Analytics',
        path: paths.DASHBOARD.ANALYTICS,
        icon: ICONS.analytics,
        disabled: false,
      },
    ],
  };

  return [mainMenuData];
}

// ----------------------------------------------------------------------

export function useNavBottomData() {
  // BOTTOM MENU
  const bottomMenuData = {
    subheader: '',
    items: [
      { title: 'Profile', path: paths.DASHBOARD.PROFILE, icon: ICONS.profile },
      {
        title: 'Logout',
        path: paths.DASHBOARD.LOGOUT,
        icon: ICONS.logout,
      },
    ],
  };

  return [bottomMenuData];
}
