import axiosInstance from './axios';

export const colaboradorApi = {
  getAll: async (page = 0, size = 10, search = '', activo = null) => {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    if (activo !== null) params.append('activo', activo);
    const response = await axiosInstance.get(`/colaboradores?${params}`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axiosInstance.get(`/colaboradores/${id}`);
    return response.data;
  },
  
  getByDni: async (dni) => {
    const response = await axiosInstance.get(`/colaboradores/dni/${dni}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await axiosInstance.post('/colaboradores', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await axiosInstance.put(`/colaboradores/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/colaboradores/${id}`);
    return response.data;
  },
  
  reactivar: async (id) => {
    const response = await axiosInstance.patch(`/colaboradores/${id}/reactivar`);
    return response.data;
  }
};
