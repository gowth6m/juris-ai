import axios, { AxiosInstance } from 'axios';
import AppConfig from '@/configs/app-config';
import { useAuthStore } from '@/sections/auth/store/auth-store';

import UserClient from './clients/user-client';
import ContractClient from './clients/contract-client';
import AnalyticsClient from './clients/analytics-client';

// ------------------------------------------------------------------------

const baseURL = AppConfig.endpoints.api + '/v1';

const createAxiosInstance = (prefix: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${baseURL}${prefix}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const { token } = useAuthStore.getState();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('Unauthorized, please log in.');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// ------------------------------------------------------------------------

class ApiClient {
  static user = new UserClient(createAxiosInstance(`/user`));
  static contract = new ContractClient(createAxiosInstance(`/contract`));
  static analytics = new AnalyticsClient(createAxiosInstance(`/analytics`));
}

export default ApiClient;
