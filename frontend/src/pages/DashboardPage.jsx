import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1 style={{ marginBottom: '20px', color: '#1e293b' }}>
        Dashboard
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={cardStyle}>
          <h3>Total Legajos</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>0</p>
        </div>
        <div style={cardStyle}>
          <h3>Legajos Activos</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>0</p>
        </div>
        <div style={cardStyle}>
          <h3>Documentos</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>0</p>
        </div>
      </div>
      
      <div style={cardStyle}>
        <h3>Bienvenido, {user?.nombreUsuario}</h3>
        <p>Rol: {user?.rol}</p>
        <p>Correo: {user?.correo}</p>
      </div>
    </div>
  );
};

const cardStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

export default DashboardPage;
