// src/services/api/customer.service.ts
import { api } from 'src/boot/axios';
import { isAxiosError } from 'axios';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'X';
  address: string;
  postalCode: string;
  city: string;
  province: string;
  licenseDate: string;
  licenseNumber: string;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'X';
  address: string;
  postalCode: string;
  city: string;
  province: string;
  licenseDate: string;
  licenseNumber: string;
}

export const customerService = {
  create: async (data: CreateCustomerInput): Promise<Customer> => {
    const { data: customer } = await api.post('/customers', data);
    return customer;
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },

 getByDni: async (dni: string): Promise<Customer | false> => {
    if (!dni) return false;

    try {
      const { data } = await api.get(`/customers/dni/${dni}`);
      return data;
    } catch (error: unknown) {
      let status: number | undefined;

      if (isAxiosError(error)) {
        status = error.response?.status;
      }

      // 404 = cliente no encontrado (caso esperado) -> no loguear error
      if (status === 404) {
        return false;
      }

      console.error('Error fetching customer by DNI:', error);
      return false;
    }
  },
};