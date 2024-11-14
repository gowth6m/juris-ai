import Cookies from 'js-cookie';
import { useRouter } from '@/routes/hooks';
import ApiClient from '@/services/api-client';
import { useQuery, useMutation } from 'react-query';

import { AuthContext } from './auth-context';
import { useAuthStore } from '../store/auth-store';

// ----------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const { token, setToken, setUser, setLoading, user, isLoading } = useAuthStore();

  // ------------------------------------------------

  const currentSessionQuery = useQuery({
    queryKey: ['current'],
    queryFn: async () => {
      setLoading(true);
      return await ApiClient.user.current();
    },
    onSettled: () => setLoading(false),
    onSuccess: (res) => {
      setUser(res.data);
    },
    onError: () => {
      setToken(null);
      setUser(null);
    },
    enabled: token !== null,
  });

  // ------------------------------------------------

  const logoutMutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      setToken(null);
      setUser(null);
      Cookies.remove('access_token');
      router.reload();
    },
  });

  // ------------------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        logoutMutation,
        currentSessionQuery,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
