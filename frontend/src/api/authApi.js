import axiosInstance from './axios';

export const authApi = {
  login: async (nombreUsuario, password) => {
    const response = await axiosInstance.post('/api/auth/login', { nombreUsuario, password });
    return response.data;
  },
};
