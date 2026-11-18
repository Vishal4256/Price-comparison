import api from './index';

export const productAPI = {
  getProductDetails: (id) => api.get(`/product/${id}`),
};
