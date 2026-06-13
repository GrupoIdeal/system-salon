import axios, { AxiosInstance, AxiosError } from 'axios';
import { Platform } from 'react-native';

const API_URL = __DEV__ 
  ? 'http://192.168.1.100:3000' // IP local para desenvolvimento
  : 'https://api.salonbooking.com';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
axiosInstance.interceptors.request.use(
  (config) => {
    // O token é adicionado via AuthContext no header Authorization
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - fazer logout
      console.log('Token expirado, fazer logout');
    }
    return Promise.reject(error);
  }
);

// API service para o aplicativo
export const api = {
  // Autenticação
  auth: {
    login: (email: string, password: string) => 
      axiosInstance.post('/auth/login', { email, password }),
    register: (data: any) => 
      axiosInstance.post('/auth/register', data),
    logout: () => 
      axiosInstance.post('/auth/logout'),
    me: () => 
      axiosInstance.get('/auth/me'),
    recoverPassword: (email: string) => 
      axiosInstance.post('/auth/recover-password', { email }),
  },

  // Dashboard
  dashboard: {
    all: (params?: any) => axiosInstance.get('/dashboard/all', { params }),
  },

  // Agendamentos
  appointments: {
    list: (params?: any) => axiosInstance.get('/appointments', { params }),
    create: (data: any) => axiosInstance.post('/appointments', data),
    update: (id: string, data: any) => axiosInstance.put(`/appointments/${id}`, data),
    cancel: (id: string) => axiosInstance.patch(`/appointments/${id}/cancel`),
    complete: (id: string, data?: any) => axiosInstance.patch(`/appointments/${id}/complete`, data),
    getById: (id: string) => axiosInstance.get(`/appointments/${id}`),
  },

  // Clientes
  clients: {
    list: (params?: any) => axiosInstance.get('/clients', { params }),
    create: (data: any) => axiosInstance.post('/clients', data),
    update: (id: string, data: any) => axiosInstance.put(`/clients/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/clients/${id}`),
    getById: (id: string) => axiosInstance.get(`/clients/${id}`),
  },

  // Serviços
  services: {
    list: (params?: any) => axiosInstance.get('/services', { params }),
    create: (data: any) => axiosInstance.post('/services', data),
    update: (id: string, data: any) => axiosInstance.put(`/services/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/services/${id}`),
  },

  // Especialistas
  specialists: {
    list: (params?: any) => axiosInstance.get('/specialists', { params }),
    create: (data: any) => axiosInstance.post('/specialists', data),
    update: (id: string, data: any) => axiosInstance.put(`/specialists/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/specialists/${id}`),
    schedule: (id: string) => axiosInstance.get(`/specialists/${id}/schedule`),
  },

  // Produtos
  products: {
    list: (params?: any) => axiosInstance.get('/products', { params }),
    create: (data: any) => axiosInstance.post('/products', data),
    update: (id: string, data: any) => axiosInstance.put(`/products/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/products/${id}`),
    lowStock: () => axiosInstance.get('/products/low-stock'),
  },

  // Avaliações
  ratings: {
    list: (params?: any) => axiosInstance.get('/ratings', { params }),
    create: (data: any) => axiosInstance.post('/ratings', data),
    getByAppointment: (appointmentId: string) => 
      axiosInstance.get(`/ratings/appointment/${appointmentId}`),
  },

  // Upload de arquivos
  upload: {
    image: (formData: FormData) => 
      axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
  },

  // Notificações push
  notifications: {
    registerToken: (token: string, platform: string) => 
      axiosInstance.post('/notifications/register', { token, platform }),
    unregisterToken: (token: string) => 
      axiosInstance.post('/notifications/unregister', { token }),
  },

  // Pagamentos PIX
  pix: {
    generate: (appointmentId: string) => 
      axiosInstance.post(`/payments/pix/${appointmentId}`),
    verify: (appointmentId: string) => 
      axiosInstance.get(`/payments/pix/${appointmentId}/verify`),
  },
};

export default api;
