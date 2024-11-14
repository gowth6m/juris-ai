import Box from '@mui/material/Box';
import { Tooltip } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import { Theme, SxProps } from '@mui/material/styles';
import TableSortLabel from '@mui/material/TableSortLabel';

import Iconify from '../iconify';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// ----------------------------------------------------------------------

type Props = {
  order?: 'asc' | 'desc';
  orderBy?: string;
  headLabel: any[];
  rowCount?: number;
  numSelected?: number;
  onSort?: (id: string) => void;
  onSelectAllRows?: (checked: boolean) => void;
  sx?: SxProps<Theme>;
};

export default function TableHeadCustom({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
}: Props) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={!!numSelected && numSelected < rowCount}
              checked={!!rowCount && numSelected === rowCount}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onSelectAllRows(event.target.checked)
              }
            />
          </TableCell>
        )}

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            {onSort ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onSort(headCell.id)}
              >
                (
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  gap={1}
                  justifyContent={
                    headCell.align === 'right'
                      ? 'flex-end'
                      : headCell.align === 'center'
                        ? 'center'
                        : 'flex-start'
                  }
                >
                  {headCell.label}
                  {headCell.info ? (
                    <Tooltip title={headCell.info}>
                      <Iconify
                        icon="mdi:info-circle"
                        sx={{ fontSize: 12 }}
                        width={16}
                        height={16}
                      />
                    </Tooltip>
                  ) : null}
                </Box>
                )
                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              <Box
                display={'flex'}
                alignItems={'center'}
                gap={1}
                justifyContent={
                  headCell.align === 'right'
                    ? 'flex-end'
                    : headCell.align === 'center'
                      ? 'center'
                      : 'flex-start'
                }
              >
                {headCell.label}
                {headCell.info ? (
                  <Tooltip title={headCell.info}>
                    <Iconify icon="mdi:info-circle" sx={{ fontSize: 12 }} width={16} height={16} />
                  </Tooltip>
                ) : null}
              </Box>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
