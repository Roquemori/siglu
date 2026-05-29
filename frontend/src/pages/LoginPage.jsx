import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  
  const onSubmit = async (data) => {
    setError('');
    const result = await login(data.nombreUsuario, data.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Credenciales inválidas');
    }
  };
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#e2e8f0'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#1e293b' }}>
          SIGLU
        </h1>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px', color: '#64748b' }}>
          Sistema de Gestión de Legajos
        </h2>
        
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#334155' }}>
              Usuario
            </label>
            <input
              type="text"
              {...register('nombreUsuario', { required: true })}
              style={inputStyle}
              placeholder="Ingrese su usuario"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#334155' }}>
              Contraseña
            </label>
            <input
              type="password"
              {...register('password', { required: true })}
              style={inputStyle}
              placeholder="Ingrese su contraseña"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          <p>Demo: admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #cbd5e1',
  borderRadius: '5px',
  fontSize: '14px'
};

export default LoginPage;
