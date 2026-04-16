// src/boot/axios.ts
import { boot } from 'quasar/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { Loading, Notify } from 'quasar';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: 'https://insurtech-quote-api.onrender.com/api', // import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
/*
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  withCredentials: true
});*/

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

export default boot(async ({ app }) => {
  // expose axios instances globally
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  // show a global loader until we confirm the backend is reachable
  Loading.show({ message: 'Cargando...' });

  try {
    // quick ping to the API base. If the server responds (even 4xx),
    // consider the backend reachable. Only network errors (no response)
    // or 5xx will trigger a user notification.
    await api.get('/', { timeout: 100000 }).catch((err) => {
      if (axios.isAxiosError(err) && err.response) {
        // server responded (e.g., 404) -> backend reachable
        return;
      }
      // rethrow network errors so they are handled below
      throw err;
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        Notify.create({ type: 'negative', message: 'La conexion con el servidor puede tardar mas de lo habitual.' });
      } else if (error.response.status >= 500) {
        Notify.create({ type: 'negative', message: `Error en el servidor (${error.response.status}). Intenta más tarde.` });
      }
    } else {
      Notify.create({ type: 'negative', message: 'Error inesperado al conectar con el servidor.' });
    }
    // log for debugging
    console.error('Server connection error:', error);
  } finally {
    Loading.hide();
  }
});

export { api };
