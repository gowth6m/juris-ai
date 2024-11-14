/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import PublicLayout from '@/layouts/public/public-layout';

import { LoadingScreen } from 'src/components/loading-screen';

import PublicGuard from '../guards/public-guard';

// ----------------------------------------------------------------------

const LoginPage = lazy(() => import('src/pages/login'));
const RegisterPage = lazy(() => import('src/pages/register'));

// ----------------------------------------------------------------------

export const publicRoutes = [
  {
    path: '/',
    element: (
      <PublicGuard>
        <PublicLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </PublicLayout>
      </PublicGuard>
    ),
    children: [
      {
        element: <Navigate to="/login" replace />,
        index: true,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
];
