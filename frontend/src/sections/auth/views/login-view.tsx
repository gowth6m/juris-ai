import { useState } from 'react';
import { useFormik } from 'formik';
import Row from '@/components/core/row';
import { useMutation } from 'react-query';
import Iconify from '@/components/iconify';
import { useRouter } from '@/routes/hooks';
import { User } from '@/services/types/auth';
import Column from '@/components/core/column';
import ApiClient from '@/services/api-client';
import { RouterLink } from '@/routes/components';
import CoreButton from '@/components/core/core-button';
import { enqueueSnackbar } from '@/components/snackbar';
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

import { useAuthStore } from '../store/auth-store';

// ----------------------------------------------------------------------

const LoginView = () => {
  const router = useRouter();

  const { setToken, setUser } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: async () => {
      await loginMutation.mutateAsync(formik.values);
    },
  });

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async (input: User) => await ApiClient.user.login(input),
    onSuccess: (res) => {
      setToken(res.data.access_token);
      setUser({ email: formik.values.email });
      router.push('/dashboard');
    },
    onError: () => {
      enqueueSnackbar('Invalid credentials', { variant: 'error' });
    },
  });

  return (
    <Column
      component={'form'}
      onSubmit={(e) => {
        e.preventDefault();
        formik.handleSubmit();
      }}
    >
      {loginMutation.isLoading && <LoadingTopbar />}
      <Card
        sx={{
          padding: 3,
          maxWidth: 'sm',
          width: '100%',
          marginX: 'auto',
        }}
      >
        <Typography variant={'h4'}>Welcome back!</Typography>
        <Typography variant={'body2'}>
          Sign in to access your account and start using Juris AI
        </Typography>

        <Column gap={0}>
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
            <Checkbox />
            <Typography variant={'body2'}>Keep me signed in</Typography>
            <Link
              component={RouterLink}
              href={'/forgot-password'}
              variant={'body2'}
              color={'primary'}
              sx={{ marginLeft: 'auto' }}
            >
              Forgot Password?
            </Link>
          </Row>

          <CoreButton buttonVariant={'primary'} type={'submit'} buttonWidth={'full'}>
            Sign In
          </CoreButton>

          <Typography variant={'body2'}>
            {`Don't have an account?`}
            <Link
              component={RouterLink}
              href={'/register'}
              variant={'body2'}
              color={'primary'}
              marginX={1}
            >{`Sign Up`}</Link>
          </Typography>
        </Column>
      </Card>
    </Column>
  );
};

export default LoginView;
