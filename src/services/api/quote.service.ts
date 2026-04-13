// src/services/api/quote.service.ts
import { api } from 'src/boot/axios';
import { type Customer } from './customer.service';
import { type Version } from './vehicle.service';
import { type Coverage } from './coverage.service';

export interface QuoteCalculationInput {
  customerId: string;
  versionId: string;
  coverageId: string;
  vehiclePlate?: string;
  vehicleUsage: 'particular' | 'comercial' | 'rideshare';
  insuredValue: number;
  selectedAdditionals?: string[];
}

export interface RiskFactors {
  ageFactor: number;
  vehicleAgeFactor: number;
  zoneFactor: number;
  usageFactor: number;
  genderFactor: number;
  claimsHistoryFactor: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  totalMonthly: number;
  totalAnnual: number;
  basePremium: number;
  riskPremium: number;
  additionalsCost: number;
  factors: RiskFactors;
  customer: Customer;
  version: Version;
  coverage: Coverage;
  expiresAt: string;
  createdAt: string;
  vehiclePlate?: string;
  vehicleUsage: 'particular' | 'comercial' | 'rideshare';
  insuredValue: number;
}

export const quoteService = {
  calculate: async (input: QuoteCalculationInput): Promise<Quote> => {
    const { data } = await api.post('/quotes/calculate', input);
    return data;
  },

  getById: async (id: string): Promise<Quote> => {
    const { data } = await api.get(`/quotes/${id}`);
    return data;
  },

  list: async (params?: {
    customerId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ quotes: Quote[]; pagination: number }> => {
    const { data } = await api.get('/quotes', { params });
    return data;
  }
};