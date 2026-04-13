// src/services/api/vehicle.service.ts
import { api } from 'src/boot/axios';

export interface Brand {
  id: string;
  name: string;
  logo: string | null;
}

export interface Model {
  id: string;
  name: string;
  type: string;
  brand: Brand;
}

export interface Version {
  id: string;
  year: number;
  fiscalValue: number;
  fuelType: string;
  engineSize: number;
  model: Model;
}

export const vehicleService = {
  getBrands: async (): Promise<Brand[]> => {
    const { data } = await api.get('/vehicles/brands');
    return data;
  },

  getModelsByBrand: async (brandId: string): Promise<Model[]> => {
    const { data } = await api.get(`/vehicles/brands/${brandId}/models`);
    return data;
  },

  getVersionsByModel: async (modelId: string): Promise<Version[]> => {
    const { data } = await api.get(`/vehicles/models/${modelId}/versions`);
    return data;
  },

  searchVehicles: async (params: {
    brandId?: string;
    modelId?: string;
    year?: number;
    type?: string;
  }): Promise<Version[]> => {
    const { data } = await api.get('/vehicles/search', { params });
    return data;
  }
};