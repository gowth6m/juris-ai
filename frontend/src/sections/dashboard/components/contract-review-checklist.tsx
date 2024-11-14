import React from 'react';
import Iconify from '@/components/iconify';

import { Box, List, Divider, ListItem, Typography, ListItemText } from '@mui/material';

function parseChecklist(text: string) {
  // Extract the heading (text before the first "- ")
  const headingMatch = text.match(/^(.*?) - \*\*/);
  const heading = headingMatch ? headingMatch[1].replace(/^#\s*/, '').trim() : '';

  // Extract the footer (text after the last item)
  const footerMatch = text.match(/This checklist covers.*$/);
  const footer = footerMatch ? footerMatch[0].trim() : '';

  // Remove heading and footer from the text to isolate items
  const itemsText = text.replace(headingMatch ? headingMatch[0] : '', '').replace(footer, '');

  // Regular expression to match each item
  const regex = /- \*\*(.*?)\*\* - (.*?)(?= - \*\*|$)/gs;
  const items = [];
  let match;
  while ((match = regex.exec(itemsText)) !== null) {
    const title = match[1].trim();
    const description = match[2].trim();
    items.push({ title, description });
  }

  return { heading, items, footer };
}

const ContractReviewChecklist = ({ text }: { text: string }) => {
  const { heading, items, footer } = parseChecklist(text);

  return (
    <Box sx={{ padding: 4 }}>
      {heading && (
        <Typography variant="h4" gutterBottom>
          {heading}
        </Typography>
      )}
      <List>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem alignItems="flex-start">
              <Iconify icon="mdi:check-circle" />
              <ListItemText
                primary={
                  <Typography variant="h6" component="span">
                    {item.title}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="textSecondary">
                    {item.description}
                  </Typography>
                }
              />
            </ListItem>
            {index < items.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
      {footer && (
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          {footer}
        </Typography>
      )}
    </Box>
  );
};

export default ContractReviewChecklist;
