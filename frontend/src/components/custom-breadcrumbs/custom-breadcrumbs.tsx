import { Fragment } from 'react/jsx-runtime';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import LinkItem from './link-item';
import { CustomBreadcrumbsProps } from './types';

// ----------------------------------------------------------------------

export default function CustomBreadcrumbs({
  links,
  actions,
  heading,
  moreLink,
  activeLast,
  sx,
  ...other
}: CustomBreadcrumbsProps) {
  const lastLink = links[links.length - 1].name;

  return (
    <Box sx={{ ...sx }}>
      <Stack
        sx={{
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
          alignItems: {
            xs: 'flex-start',
            md: 'center',
          },
          gap: {
            xs: 1.5,
            md: 2,
          },
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          {/* HEADING */}
          {heading && <Typography variant="h4">{heading}</Typography>}

          {/* BREADCRUMBS */}
          {!!links.length && (
            <Breadcrumbs separator={<Separator />} {...other}>
              {links.map((link) => (
                <LinkItem
                  key={link.name || ''}
                  link={link}
                  activeLast={activeLast}
                  disabled={link.name === lastLink}
                />
              ))}
            </Breadcrumbs>
          )}
        </Box>

        {actions && (
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'row',
              gap: 2,
            }}
          >
            {' '}
            {actions.map((e, index) => (
              <Fragment key={index}>{e}</Fragment>
            ))}{' '}
          </Box>
        )}
      </Stack>

      {/* MORE LINK */}
      {!!moreLink && (
        <Box sx={{ mt: 2 }}>
          {moreLink.map((href) => (
            <Link
              key={href}
              href={href}
              variant="body2"
              target="_blank"
              rel="noopener"
              sx={{ display: 'table' }}
            >
              {href}
            </Link>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ----------------------------------------------------------------------

function Separator() {
  return (
    <Box
      component="span"
      sx={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        bgcolor: 'text.disabled',
      }}
    />
  );
}
