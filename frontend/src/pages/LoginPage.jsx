import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import '../assets/css/login-layout.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    const result = await login(data.nombreUsuario, data.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Credenciales inválidas. Verifica tus datos.');
    }
  };

  return (
    <div className="login-wrapper">

      {/* Columna Izquierda — Formulario */}
      <div className="login-form-column">
        <div className="login-form-container">

          <div className="login-logo-box">
            <center> <img src="/assets/img/logo_diredsaa.webp" alt="Logo DIRESA" className="login-logo" /></center>
          </div>

          <h1 className="login-title">Bienvenido de nuevo</h1>
          <p className="login-subtitle">Ingresa tus credenciales para acceder al sistema</p>

          {error && (
            <div className="login-alert">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="login-field">
              <label htmlFor="nombreUsuario">Usuario</label>
              <input
                id="nombreUsuario"
                type="text"
                className="login-input"
                placeholder="Ej. jperez"
                autoComplete="username"
                {...register('nombreUsuario', { required: true })}
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Contraseña</label>
              <div className="login-password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password', { required: true })}
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="login-spinner"></span>
                  Validando...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Columna Derecha — Información institucional */}
      <div className="login-image-column">
        <div className="login-info-content">
          <h1 className="login-info-title">
            Dirección de Red de Salud<br />Alto Amazonas
          </h1>
          <p className="login-info-desc">
            Sistema Integral de Gestión de Legajos Únicos administración
            digital de expedientes de personal y escalafón.
          </p>
          <ul className="login-features">
            <li>
              <i className="fas fa-folder-open"></i>
              <span>Digitalización y gestión centralizada de legajos</span>
            </li>
            <li>
              <i className="fas fa-cloud-arrow-up"></i>
              <span>Subida, clasificación y descarga de documentos</span>
            </li>
            <li>
              <i className="fas fa-shield-halved"></i>
              <span>Autenticación segura con roles diferenciados</span>
            </li>
            <li>
              <i className="fas fa-clock-rotate-left"></i>
              <span>Historial de cambios con trazabilidad inmutable</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
