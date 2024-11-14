import { AxiosInstance, AxiosResponse } from 'axios';

import { User, UserCreate, UserLoginResponse } from '../types/auth';

// ------------------------------------------------------------------------

export default class UserClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async login(payload: User): Promise<AxiosResponse<UserLoginResponse>> {
    return this.client.post('/login', payload);
  }

  async register(payload: UserCreate): Promise<AxiosResponse<User>> {
    return this.client.post('/register', payload);
  }

  async current(): Promise<AxiosResponse<User>> {
    return this.client.get('/current');
  }
}
