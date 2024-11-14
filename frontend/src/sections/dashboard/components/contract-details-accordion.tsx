import React from 'react';
import Iconify from '@/components/iconify';

import { alpha } from '@mui/material/styles';
import { SxProps, Accordion, Typography, AccordionDetails, AccordionSummary } from '@mui/material';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  sx?: SxProps;
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

const ContractDetailsAccordion: React.FC<AccordionProps> = ({
  sx,
  title,
  children,
  expanded,
  onChange,
}) => {
  return (
    <Accordion
      elevation={0}
      disableGutters
      style={{ boxShadow: 'none' }}
      expanded={expanded}
      onChange={onChange}
      sx={{
        '&:before': {
          display: 'none',
        },
        borderRadius: 1,
        borderWidth: 1,
        borderColor: 'divider',
        borderStyle: 'solid',
        position: 'relative',
        p: { xs: 1.5, sm: 1 },
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
        transition: (theme) => theme.transitions.create(['opacity', 'padding']),
        ...sx,
      }}
    >
      <AccordionSummary
        expandIcon={<Iconify icon="mdi:chevron-down" />}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.72,
          },
        }}
      >
        <Typography variant="subtitle1">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

export default ContractDetailsAccordion;
