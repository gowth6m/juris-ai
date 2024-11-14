/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import CompactLayout from '@/layouts/compact';
import { SplashScreen } from '@/components/loading-screen';

// ----------------------------------------------------------------------

const Page404 = lazy(() => import('@/pages/404'));

// ----------------------------------------------------------------------

export const mainRoutes = [
  {
    element: (
      <CompactLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </CompactLayout>
    ),
    children: [{ path: '404', element: <Page404 /> }],
  },
];
