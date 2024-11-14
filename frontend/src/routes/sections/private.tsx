/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '@/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import PrivateGuard from '../guards/private-guard';

// ----------------------------------------------------------------------

const DashboardIndexPage = lazy(() => import('src/pages/dashboard/index'));
const ProfilePage = lazy(() => import('src/pages/dashboard/profile'));
const LogoutPage = lazy(() => import('src/pages/dashboard/logout'));
const HistoryPage = lazy(() => import('src/pages/dashboard/history'));
const AnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const ContractIndexPage = lazy(() => import('src/pages/dashboard/contract/[id]/index'));
const ContractReviewPage = lazy(() => import('src/pages/dashboard/contract/[id]/review'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: '/dashboard',
    element: (
      <PrivateGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </PrivateGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardIndexPage />,
      },
      {
        path: 'contract/:id',
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <ContractIndexPage />,
          },
        ],
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },

      /****************************************
       ***************** USER *****************
       ****************************************/
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'logout',
        element: <LogoutPage />,
      },
    ],
  },
  {
    path: '/dashboard/contract/:id/review',
    element: (
      <DashboardLayout fullscreen>
        <ContractReviewPage />
      </DashboardLayout>
    ),
  },
];
