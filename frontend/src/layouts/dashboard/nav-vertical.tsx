import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { Divider, useTheme } from '@mui/material';

import { usePathname } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import Logo from 'src/components/logo';
import Scrollbar from 'src/components/scrollbar';
import { NavSectionVertical } from 'src/components/nav-section';

import { NAV } from '../config-layout';
import NavToggleButton from '../common/nav-toggle-button';
import { useNavData, useNavBottomData } from './config-navigation';

// ----------------------------------------------------------------------

type Props = {
  openNav: boolean;
  onCloseNav: VoidFunction;
};

export default function NavVertical({ openNav, onCloseNav }: Props) {
  const pathname = usePathname();

  const theme = useTheme();

  const lgUp = useResponsive('up', 'lg');

  const navData = useNavData();

  const navBottomData = useNavBottomData();

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Logo sx={{ ml: 9, mr: 9, mt: 4, mb: 2 }} />

      <NavSectionVertical
        data={navData}
        slotProps={{
          currentRole: undefined,
        }}
        sx={{ flexGrow: 1 }}
      />

      <Divider flexItem variant={'middle'} />

      <NavSectionVertical
        data={navBottomData}
        slotProps={{
          currentRole: undefined,
        }}
        sx={{
          my: 2,
        }}
      />
    </Scrollbar>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_VERTICAL },
      }}
    >
      <NavToggleButton />

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.W_VERTICAL,
            borderRight: (theme) => `solid 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Stack>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          slotProps={{
            backdrop: { invisible: true },
          }}
          PaperProps={{
            sx: {
              width: NAV.W_VERTICAL,
              backgroundColor: theme.palette.background.dialog,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
