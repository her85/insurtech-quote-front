// src/services/api/coverage.service.ts
import { api } from 'src/boot/axios';

export interface CoverageAdditional {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface Coverage {
  id: string;
  name: string;
  description: string;
  type: string;
  baseMultiplier: number;
  features: string;
  additionals: CoverageAdditional[];
}

export const coverageService = {
  getAll: async (): Promise<Coverage[]> => {
    const { data } = await api.get('/coverages');
    return data;
  },

  getById: async (id: string): Promise<Coverage> => {
    const { data } = await api.get(`/coverages/${id}`);
    return data;
  }
};
