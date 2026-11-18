import api from './index';

export const homeAPI = {
  getHomeData: () => api.get('/home'),
};
