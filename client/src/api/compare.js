import api from './index';

export const compareAPI = {
  compareProducts: (productIds) => {
    return api.post('/compare', { productIds });
  },
};
