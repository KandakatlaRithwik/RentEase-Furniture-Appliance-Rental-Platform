import axios from 'axios';

const API = axios.create({
  // ✅ FIX: uses env var — not hardcoded localhost
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('rentease_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('rentease_token');
      localStorage.removeItem('rentease_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (d)    => API.post('/auth/register', d),
  login:    (d)    => API.post('/auth/login', d),
  getMe:    ()     => API.get('/auth/me'),
  updateMe: (d)    => API.put('/auth/me', d),
  changePassword: (d) => API.post('/auth/change-password', d),
  getAdminProfile: () => API.get('/auth/admin/profile'),
  updateAdminProfile: (d) => API.put('/auth/admin/profile', d),
};
export const productAPI = {
  getAll:  (p)    => API.get('/products', { params: p }),
  getOne:  (id)   => API.get(`/products/${id}`),
  create:  (d)    => API.post('/products', d),
  update:  (id,d) => API.put(`/products/${id}`, d),
  delete:  (id)   => API.delete(`/products/${id}`),
};
export const orderAPI = {
  checkAvailability: (d)    => API.post('/orders/check-availability', d),
  create:            (d)    => API.post('/orders', d),
  getMy:             ()     => API.get('/orders/my'),
  getOne:            (id)   => API.get(`/orders/${id}`),
  cancel:            (id)   => API.patch(`/orders/${id}/cancel`),
  extend:            (id,d) => API.patch(`/orders/${id}/extend`, d),
  updateStatus:      (id,d) => API.patch(`/orders/${id}/status`, d),
};
export const maintenanceAPI = {
  create: (d)    => API.post('/maintenance', d),
  getMy:  ()     => API.get('/maintenance/my'),
  getAll: (p)    => API.get('/maintenance', { params: p }),
  update: (id,d) => API.put(`/maintenance/${id}`, d),
};
export const adminAPI = {
  getAnalytics: ()  => API.get('/admin/analytics'),
  getAllOrders:  (p) => API.get('/admin/orders', { params: p }),
  getAllUsers:   ()  => API.get('/admin/users'),
  getAllMaintenance: (p) => API.get('/admin/maintenance', { params: p }),
};
export const notificationAPI = {
  getMy: () => API.get('/notifications/my'),
  markRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllRead: () => API.patch('/notifications/read-all'),
};
export default API;
