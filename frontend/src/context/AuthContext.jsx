import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('siglu_token');
    const userData = localStorage.getItem('siglu_user');
    console.log('AuthProvider init - token:', !!token, 'userData:', !!userData);
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }
    setLoading(false);
  }, []);
  
  const login = async (nombreUsuario, password) => {
    try {
      console.log('Intentando login:', nombreUsuario);
      const response = await axios.post('/api/auth/login', { nombreUsuario, password });
      console.log('Respuesta login:', response.data);
      
      if (response.data && response.data.data) {
        const { token, ...userData } = response.data.data;
        localStorage.setItem('siglu_token', token);
        localStorage.setItem('siglu_user', JSON.stringify(userData));
        setUser(userData);
        console.log('Login exitoso, token guardado');
        return { success: true };
      }
      return { success: false, error: 'Respuesta inválida' };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.response?.data?.message || 'Error de conexión' };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('siglu_token');
    localStorage.removeItem('siglu_user');
    setUser(null);
  };
  
  const hasRole = (role) => {
    return user?.rol?.toUpperCase() === role.toUpperCase();
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
