import { paths } from '@/routes/paths';
import Row from '@/components/core/row';
import Column from '@/components/core/column';
import CustomBreadcrumbs from '@/components/custom-breadcrumbs';

import { TextField, Typography } from '@mui/material';

import { useAuthContext } from '../context';

// ----------------------------------------------------------------------

const ProfileView = () => {
  const { user } = useAuthContext();

  const renderHeader = (
    <CustomBreadcrumbs
      heading="Profile"
      links={[
        {
          name: 'Dashboard',
          href: paths.DASHBOARD.INDEX,
        },
        { name: 'Profile' },
      ]}
    />
  );

  const renderDetails = (
    <Column width={500}>
      <Row alignItems={'center'} justifyContent={'space-between'}>
        <Typography variant="subtitle2">Email</Typography>
        <TextField variant="outlined" value={user?.email ?? ''} />
      </Row>
      <Row alignItems={'center'} justifyContent={'space-between'}>
        <Typography variant="subtitle2">First name</Typography>
        <TextField variant="outlined" value={user?.first_name ?? ''} />
      </Row>
      <Row alignItems={'center'} justifyContent={'space-between'}>
        <Typography variant="subtitle2">Last name</Typography>
        <TextField variant="outlined" value={user?.last_name ?? ''} />
      </Row>
    </Column>
  );

  return (
    <Column>
      {renderHeader}
      {renderDetails}
    </Column>
  );
};

export default ProfileView;
