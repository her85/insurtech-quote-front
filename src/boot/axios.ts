// src/boot/axios.ts
import { boot } from 'quasar/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Aquí podrías agregar tokens de autenticación si fuera necesario
    return config;
  },
  (error: unknown) => {
    if (error instanceof Error) {
      return Promise.reject(error);
    }
    return Promise.reject(new Error(String(error)));
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      // try to extract a meaningful message from the response body
      const data = error.response?.data as Record<string, unknown> | undefined;
      const message = (data && typeof data.message === 'string') ? data.message : error.message || 'Error en la solicitud';
      // attach a normalized message (AxiosError already contains response)
      const axiosErr = error as AxiosError;
      axiosErr.message = message;
      return Promise.reject(axiosErr);
    }

    const err = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(err);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
