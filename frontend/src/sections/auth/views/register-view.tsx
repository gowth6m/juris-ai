import { useState } from 'react';
import { useFormik } from 'formik';
import Row from '@/components/core/row';
import { useMutation } from 'react-query';
import Iconify from '@/components/iconify';
import { useRouter } from '@/routes/hooks';
import Column from '@/components/core/column';
import ApiClient from '@/services/api-client';
import { RouterLink } from '@/routes/components';
import { UserCreate } from '@/services/types/auth';
import { useSnackbar } from '@/components/snackbar';
import CoreButton from '@/components/core/core-button';
import { LoadingTopbar } from '@/components/loading-screen';

import {
  Card,
  Link,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';

// ----------------------------------------------------------------------

const RegisterView = () => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    },
    onSubmit: async (input) => {
      registerMutation.mutate(input);
    },
  });

  const registerMutation = useMutation({
    mutationKey: ['register'],
    mutationFn: async (input: UserCreate) => {
      return await ApiClient.user.register(input);
    },
    onSuccess: () => {
      router.push('/login');
    },
    onError: () => {
      enqueueSnackbar('Failed to register', { variant: 'error' });
    },
  });

  return (
    <Column
      sx={{ width: '100%' }}
      component={'form'}
      onSubmit={(e) => {
        e.preventDefault();
        formik.handleSubmit();
      }}
    >
      {registerMutation.isLoading && <LoadingTopbar />}
      <Card
        variant="outlined"
        sx={{
          padding: 3,
          maxWidth: 'sm',
          width: '100%',
          marginX: 'auto',
        }}
      >
        <Typography variant={'h4'}>Sign Up to Juris AI</Typography>
        <Typography variant={'body2'}>
          Sign Up to access your account and start using Juris AI
        </Typography>

        <Column gap={0} maxWidth={'md'}>
          <TextField
            margin={'normal'}
            name="first_name"
            label={'First Name'}
            value={formik.values.first_name}
            onChange={formik.handleChange}
          />
          <TextField
            margin={'normal'}
            name="last_name"
            label={'Last Name'}
            value={formik.values.last_name}
            onChange={formik.handleChange}
          />
          <TextField
            margin={'normal'}
            name="email"
            label={'Email'}
            value={formik.values.email}
            onChange={formik.handleChange}
          />
          <TextField
            margin={'normal'}
            name="password"
            label={'Password'}
            value={formik.values.password}
            onChange={formik.handleChange}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? (
                      <Iconify icon="mdi:eye" width={24} />
                    ) : (
                      <Iconify icon="mdi:eye-off" width={24} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Column>

        <Column marginTop={1}>
          <Row alignItems={'center'} gap={1}>
            <Checkbox value={acceptTerms} onClick={() => setAcceptTerms(!acceptTerms)} />
            <Typography variant={'body2'}>
              I agree to the Terms and Conditions and Privacy Policy
            </Typography>
          </Row>

          <CoreButton
            buttonVariant={'primary'}
            type={'submit'}
            buttonWidth={'full'}
            disabled={!acceptTerms}
            disabledTooltipText="Please accept the terms and conditions"
          >
            Sign Up
          </CoreButton>

          <Typography variant={'body2'}>
            {`Already have an account?`}
            <Link
              component={RouterLink}
              href={'/login'}
              variant={'body2'}
              color={'primary'}
              marginX={1}
            >{`Sign In`}</Link>
          </Typography>
        </Column>
      </Card>
    </Column>
  );
};

export default RegisterView;
