import axiosInstance from './axios';

export const tipoDocumentoApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/tipos-documento');
    return response.data;
  },
  
  getBySeccion: async (seccion) => {
    const response = await axiosInstance.get(`/tipos-documento/seccion/${seccion}`);
    return response.data;
  }
};
