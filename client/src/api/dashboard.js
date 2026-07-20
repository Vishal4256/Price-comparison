import api from './index';

export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard'),
};
