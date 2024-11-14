import React, { useEffect } from 'react';
import { useRouter } from '@/routes/hooks';
import { LoadingScreen } from '@/components/loading-screen';
import { useAuthStore } from '@/sections/auth/store/auth-store';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

const PublicGuard: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { token, isLoading } = useAuthStore();

  useEffect(() => {
    if (!token && !isLoading) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{token ? children : null}</>;
};

export default PublicGuard;
