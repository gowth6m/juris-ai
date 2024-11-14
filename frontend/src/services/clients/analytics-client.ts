import { AxiosInstance, AxiosResponse } from 'axios';

import { Analytics } from '../types/analytics';

// ------------------------------------------------------------------------

export default class AnalyticsClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async overview(): Promise<AxiosResponse<Analytics>> {
    return this.client.get('/overview');
  }
}
