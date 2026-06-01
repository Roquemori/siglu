import axiosInstance from './axios';

export const documentoApi = {
  upload: async (file, colaboradorId, tipoDocumentoId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('colaboradorId', colaboradorId);
    formData.append('tipoDocumentoId', tipoDocumentoId);
    
    const response = await axiosInstance.post('/documentos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  download: async (id) => {
    const token = localStorage.getItem('siglu_token');
    
    // IMPORTANTE: Usar fetch con el token en el HEADER, no en la URL
    const response = await fetch(`http://localhost:8080/api/documentos/download/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Extraer nombre del archivo
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `documento_${id}`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
      if (match) {
        filename = decodeURIComponent(match[1]);
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return true;
  },
  
  getByColaborador: async (colaboradorId, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/documentos/colaborador/${colaboradorId}?page=${page}&size=${size}`);
    return response.data;
  },
  
  getAllByColaborador: async (colaboradorId) => {
    const response = await axiosInstance.get(`/documentos/colaborador/${colaboradorId}/all`);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await axiosInstance.delete(`/documentos/${id}`);
    return response.data;
  },
  
  countByColaborador: async (colaboradorId) => {
    const response = await axiosInstance.get(`/documentos/colaborador/${colaboradorId}/count`);
    return response.data;
  }
};
