import { useRouter } from '@/routes/hooks';
import { Contract } from '@/services/types/contract';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Stack, { StackProps } from '@mui/material/Stack';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import { fDateTime } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

interface Props extends StackProps {
  file: Contract;
  onDelete: VoidFunction;
}

export default function FileRecentItem({ file, onDelete, sx, ...other }: Props) {
  const router = useRouter();

  const smUp = useResponsive('up', 'sm');

  const popover = usePopover();

  const details = useBoolean();

  const renderAction = (
    <Box
      sx={{
        top: 0,
        right: 8,
        position: 'absolute',
        ...(smUp && {
          flexShrink: 0,
          position: 'unset',
        }),
      }}
    >
      <IconButton
        color={popover.open ? 'inherit' : 'default'}
        onClick={(e) => {
          e.stopPropagation();
          popover.onOpen(e);
        }}
      >
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </Box>
  );

  const renderText = (
    <ListItemText
      onClick={details.onTrue}
      primary={file.title}
      secondary={
        <>
          {file._id}
          <Box
            sx={{
              mx: 0.75,
              width: 2,
              height: 2,
              borderRadius: '50%',
              bgcolor: 'currentColor',
            }}
          />
          {fDateTime(file.created_at)}
        </>
      }
      primaryTypographyProps={{
        noWrap: true,
        typography: 'subtitle2',
      }}
      secondaryTypographyProps={{
        mt: 0.5,
        component: 'span',
        alignItems: 'center',
        typography: 'caption',
        color: 'text.disabled',
        display: 'inline-flex',
      }}
    />
  );

  return (
    <>
      <Stack
        component={Paper}
        variant="outlined"
        spacing={1}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'unset', sm: 'center' }}
        sx={{
          borderRadius: 2,
          bgcolor: 'unset',
          cursor: 'pointer',
          position: 'relative',
          p: { xs: 2.5, sm: 2 },
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          },
          ...sx,
        }}
        {...other}
      >
        <Avatar>
          <Iconify icon="solar:file-bold-duotone" width={24} height={24} />
        </Avatar>

        {renderText}

        {renderAction}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            router.push(`/dashboard/contract/${file._id}`);
          }}
        >
          <Iconify icon="solar:file-bold-duotone" />
          Review again
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          disabled
          onClick={() => {
            popover.onClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
}
