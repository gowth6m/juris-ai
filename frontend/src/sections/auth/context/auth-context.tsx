/* eslint-disable react-refresh/only-export-components */
import { useContext, createContext } from 'react';

import { AuthContextProps } from '../types';

// ------------------------------------------------

export const AuthContext = createContext<AuthContextProps | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error('useAuthContext must be use inside AuthProvider');

  return context;
};
