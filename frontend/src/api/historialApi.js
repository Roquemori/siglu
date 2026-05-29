import axiosInstance from './axios';

export const historialApi = {
  getByTablaAndRegistroId: async (tabla, registroId, page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    const response = await axiosInstance.get(`/historial/${tabla}/${registroId}?${params}`);
    return response.data;
  }
};
