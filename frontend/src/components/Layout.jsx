import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '20px'
      }}>
        <h2 style={{ marginBottom: '20px' }}>SIGLU</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <button onClick={() => navigate('/')} style={navButtonStyle}>
                Dashboard
              </button>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <button onClick={() => navigate('/colaboradores')} style={navButtonStyle}>
                Colaboradores
              </button>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <button onClick={() => navigate('/documentos')} style={navButtonStyle}>
                Documentos
              </button>
            </li>
            {hasRole('ADMIN') && (
              <li style={{ marginBottom: '10px' }}>
                <button onClick={() => navigate('/usuarios')} style={navButtonStyle}>
                  Usuarios
                </button>
              </li>
            )}
          </ul>
        </nav>
        <div style={{ marginTop: 'auto', position: 'absolute', bottom: '20px' }}>
          <p>{user?.nombreUsuario}</p>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Cerrar Sesión
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px', backgroundColor: '#f1f5f9' }}>
        <Outlet />
      </main>
    </div>
  );
};

const navButtonStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: 'transparent',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: '16px'
};

const logoutButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default Layout;
