import React from 'react';
import { RouterLink } from '@/routes/components';
import { useResponsive } from '@/hooks/use-responsive';

import { Box, Button, SxProps, Tooltip, ButtonProps } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends ButtonProps {
  buttonVariant?: 'primary' | 'secondary';
  buttonWidth?: 'full' | 'auto' | 'fixed' | 'fixed-desktop' | 'fixed-full';
  disabledTooltipText?: string;
  sx?: SxProps;
  tooltipText?: string;
  disabled?: boolean;
  width?: number | string;
  type?: 'button' | 'reset' | 'submit' | undefined;
  target?: string;
  fullWidth?: boolean;
  smallButton?: boolean;
}

const CoreButton: React.FC<Props> = ({
  buttonVariant = 'primary',
  tooltipText,
  disabledTooltipText,
  sx,
  buttonWidth = 'fixed',
  width,
  disabled,
  type = 'button',
  target,
  children,
  smallButton,
  fullWidth,
  ...otherProps
}) => {
  const isMobile = useResponsive('down', 'md');

  // Tooltip text based on the disabled state
  const finalTooltipText = disabled && disabledTooltipText ? disabledTooltipText : tooltipText;

  // Button styles based on buttonWidth prop
  const buttonSx = {
    width: width
      ? width
      : buttonWidth === 'full' || fullWidth
        ? '100%'
        : smallButton
          ? 120
          : buttonWidth === 'fixed'
            ? 160
            : buttonWidth === 'fixed-full'
              ? !isMobile
                ? 160
                : '100%'
              : buttonWidth === 'fixed-desktop'
                ? isMobile
                  ? 'auto'
                  : 160
                : 'auto',
    ...sx,
  };

  // Button variant styles
  const variant = buttonVariant === 'primary' ? 'contained' : 'outlined';
  const color = buttonVariant === 'primary' ? 'primary' : 'primary';
  const size = smallButton ? 'small' : otherProps.size;

  return (
    <Tooltip title={finalTooltipText || ''} arrow>
      <Box sx={buttonSx}>
        <Button
          type={type}
          variant={variant}
          color={color}
          size={size}
          sx={buttonSx}
          disabled={disabled}
          {...(otherProps.component === RouterLink && { component: RouterLink, target: target })}
          {...otherProps}
        >
          {children}
        </Button>
      </Box>
    </Tooltip>
  );
};

export default CoreButton;
