import AppConfig from '@/configs/app-config';
import { AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '@/sections/auth/store/auth-store';

import {
  ContractResponse,
  ContractReviewPayload,
  ContractResponseWithReview,
} from '../types/contract';

// ------------------------------------------------------------------------

const baseURL = AppConfig.endpoints.api + '/v1';

export default class ContractClient {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async uploadContract({
    file,
    title,
  }: {
    file: File;
    title: string;
  }): Promise<AxiosResponse<ContractResponse>> {
    const payload = new FormData();
    payload.append('file', file);
    payload.append('title', title);

    return this.client.post('/upload', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getAllContracts({
    page,
    limit,
  }: {
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ContractResponse[]>> {
    const query = new URLSearchParams();
    if (page && limit) {
      query.append('page', page.toString());
      query.append('limit', limit.toString());
    }

    const queryStr = query.size ? `?${query.toString()}` : '';
    return this.client.get(`/all${queryStr}`);
  }

  async getContractById({
    contractId,
  }: {
    contractId: string;
  }): Promise<AxiosResponse<ContractResponse>> {
    return this.client.get(`/${contractId}`);
  }

  async reviewContract({
    contractId,
    jurisdiction,
    industry,
    contractType,
  }: ContractReviewPayload): Promise<AxiosResponse<ContractResponseWithReview>> {
    const payload = {
      jurisdiction,
      industry,
      contract_type: contractType,
    };

    return this.client.post(`/${contractId}/review`, payload);
  }

  async getContractReview({
    contractId,
  }: {
    contractId: string;
  }): Promise<AxiosResponse<ContractResponseWithReview>> {
    return this.client.get(`/${contractId}/review`);
  }

  async explainClause(
    { contractId, clause }: { contractId: string; clause: string },
    onChunkReceived: (chunk: string) => void
  ): Promise<void> {
    const { token } = useAuthStore.getState();

    try {
      const response = await this.client.post(
        `${baseURL}/contract/${contractId}/explain-clause`,
        { clause },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          responseType: 'text',
        }
      );

      const text = response.data;

      // Remove newlines from the response and split the text into chunks
      const strippedText = text.replace(/\n/g, ' '); // Replace newline characters with spaces
      const chunks = strippedText.split(/\s+/); // Split the text by whitespace

      // Process each chunk and call onChunkReceived
      chunks.forEach((chunk: string, index: number) => {
        onChunkReceived(chunk + (index < chunks.length - 1 ? ' ' : '')); // Add a space between chunks
      });
    } catch (error: any) {
      console.error('Error explaining clause:', error.message || error);
      throw error;
    }
  }
}
