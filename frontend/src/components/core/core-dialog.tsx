import React from 'react';

import {
  Dialog,
  Divider,
  SxProps,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import Column from './column';

// ----------------------------------------------------------------------

interface Props {
  id?: string;
  children: React.ReactNode;
  open: boolean;
  onClose: (e: any) => void;
  title: string;
  titleSize?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  subtitle?: string;
  onSubmit?: (e: React.FormEvent<HTMLDivElement>) => void;
  dialogActions?: React.ReactNode;
  divider?: boolean;
  scroll?: 'paper' | 'body';
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  useForm?: boolean;
  noValidate?: boolean;
  sx?: SxProps;
}

const CoreDialog: React.FC<Props> = ({
  id,
  open,
  onClose,
  children,
  onSubmit,
  title,
  titleSize = 'h5',
  subtitle,
  dialogActions,
  divider = false,
  scroll = 'paper',
  maxWidth = 'sm',
  fullWidth = true,
  useForm = true,
  noValidate = true,
  sx,
}) => {
  const renderDialogTitle = (
    <DialogTitle>
      <Column gap={0} padding={0}>
        <Typography variant={titleSize} color={'text.secondary'}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color={'text.tertiary'}>
            {subtitle}
          </Typography>
        )}
      </Column>
    </DialogTitle>
  );

  const renderDialogActions = (
    <React.Fragment>
      {divider && <Divider sx={{ borderStyle: 'dashed' }} />}
      <DialogActions
        id={`${id}-dialog-actions`}
        sx={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {dialogActions}
      </DialogActions>
    </React.Fragment>
  );

  return (
    <Dialog
      id={id}
      open={open}
      onClose={onClose}
      component={useForm ? 'form' : undefined}
      onSubmit={useForm ? onSubmit : undefined}
      disableScrollLock={true}
      scroll={scroll}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...(useForm && { noValidate: noValidate })}
    >
      {renderDialogTitle}

      {divider && <Divider sx={{ borderStyle: 'dashed' }} />}

      <DialogContent sx={sx}>{children}</DialogContent>

      {dialogActions && renderDialogActions}
    </Dialog>
  );
};

export default CoreDialog;
