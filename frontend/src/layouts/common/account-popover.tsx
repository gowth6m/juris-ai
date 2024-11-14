import { m } from 'framer-motion';
import Iconify from '@/components/iconify';
import { RouterLink } from '@/routes/components';
import { useAuthContext } from '@/sections/auth';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const { user, logoutMutation } = useAuthContext();
  const popover = usePopover();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const handleClickItem = (_path: string) => {
    popover.onClose();
  };

  const OPTIONS = [
    {
      label: 'Profile',
      linkTo: `/`,
      icon: 'solar:user-bold',
      disabled: true,
    },
  ];

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          alt={undefined}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        ></Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              onClick={() => handleClickItem(option.linkTo)}
              component={RouterLink}
              href={option.linkTo}
              target={option.linkTo.startsWith('http') ? '_blank' : undefined}
              disabled={option.disabled}
            >
              <Iconify icon={option.icon} width={20} height={20} color="text.tertiary" />
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          <Iconify icon="bx:bxs-exit" width={20} height={20} color="error" />
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}
