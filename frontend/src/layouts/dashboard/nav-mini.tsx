import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Divider } from '@mui/material';

import { hideScroll } from 'src/theme/css';

import Logo from 'src/components/logo';
import { NavSectionMini } from 'src/components/nav-section';

import { NAV } from '../config-layout';
import NavToggleButton from '../common/nav-toggle-button';
import { useNavData, useNavBottomData } from './config-navigation';

// ----------------------------------------------------------------------

export default function NavMini() {
  const navData = useNavData();

  const navBottomData = useNavBottomData();

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.W_MINI },
      }}
    >
      <NavToggleButton
        sx={{
          top: 22,
          left: NAV.W_MINI - 12,
        }}
      />

      <Stack
        sx={{
          height: 1,
          position: 'fixed',
          width: NAV.W_MINI,
          borderRight: (theme) => `solid 1px ${theme.palette.divider}`,
          ...hideScroll.x,
        }}
      >
        <Logo squareLogo sx={{ mx: 'auto', my: 2, p: 2 }} />

        <NavSectionMini
          data={navData}
          slotProps={{
            currentRole: undefined,
          }}
          sx={{
            flexGrow: 1,
          }}
        />

        <Divider flexItem variant={'middle'} />

        <NavSectionMini
          data={navBottomData}
          slotProps={{
            currentRole: undefined,
          }}
          sx={{
            my: 2,
          }}
        />
      </Stack>
    </Box>
  );
}
