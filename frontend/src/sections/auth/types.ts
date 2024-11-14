import { AxiosResponse } from 'axios';
import { User } from '@/services/types/auth';
import { UseQueryResult, UseMutationResult } from 'react-query';

export type AuthContextProps = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logoutMutation: UseMutationResult<void, unknown, void, unknown>;
  currentSessionQuery: UseQueryResult<AxiosResponse<User, any>, unknown>;
};
