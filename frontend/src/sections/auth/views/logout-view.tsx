import { useEffect } from 'react';
import { LoadingTopbar } from '@/components/loading-screen';

import { useAuthContext } from '../context';

const LogoutView = () => {
  const { logoutMutation } = useAuthContext();

  useEffect(() => {
    logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return (
    <>
      <LoadingTopbar />
    </>
  );
};

export default LogoutView;
