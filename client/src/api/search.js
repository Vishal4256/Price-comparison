import api from './index';

export const searchAPI = {
  searchProducts: (query, filters = {}, page = 1) => {
    const params = new URLSearchParams({ q: query, page, ...filters });
    return api.get(`/search?${params.toString()}`);
  },
};
