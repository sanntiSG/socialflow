import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Attach JWT if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sf_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  connectNetwork: (data: any) => api.post('/auth/connect-network', data),
  disconnectNetwork: (network: string) => api.delete(`/auth/disconnect-network/${network}`),
  getGoogleLoginUrl: () => `${API_URL}/api/auth/google`,
};

export const postsAPI = {
  create: (data: any) => api.post('/posts', data),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/posts/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getAll: (params?: any) => api.get('/posts', { params }),
  getOne: (id: string) => api.get(`/posts/${id}`),
  update: (id: string, data: any) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
};

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
};

export const networksAPI = {
  getSupported: () => api.get('/networks/supported'),
};

export const getSocialAuthUrl = (network: string) => `${API_URL}/api/social/${network}/auth`;

export default api;
