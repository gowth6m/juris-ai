import { forwardRef } from 'react';
import { RouterLink } from '@/routes/components';

import { Box, Chip, SxProps, Typography, Link as MuiLink } from '@mui/material';

interface LogoProps {
  disabledLink?: boolean;
  squareLogo?: boolean;
  sx?: SxProps;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, squareLogo = false, sx, ...other }, ref) => {
    const logo = (
      <Box
        ref={ref}
        component="div"
        sx={{
          width: 'fit-content',
          height: 50,
          display: 'flex',
          flexDirection: squareLogo ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          ...sx,
        }}
        {...other}
      >
        <Typography
          variant="h5"
          color="primary.main"
          sx={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Juris
        </Typography>
        <Chip label="AI" color="secondary" size="small" variant="soft" />
        {/* <CardMedia
          component={'img'}
          src={AppConfig.assets.drawerLogo}
          alt={'Juris AI logo'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        /> */}
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <MuiLink component={RouterLink} href="/" sx={{ display: 'contents' }}>
        {logo}
      </MuiLink>
    );
  }
);

Logo.displayName = 'Logo';
export default Logo;
