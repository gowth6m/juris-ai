import React, { useEffect } from 'react';
import { LoadingScreen } from '@/components/loading-screen';
import { useAuthStore } from '@/sections/auth/store/auth-store';

import { useRouter } from '../hooks';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

const PublicGuard: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
};

export default PublicGuard;
