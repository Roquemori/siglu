import React, { useState, useEffect } from 'react';
import { historialApi } from '../api/historialApi';

const HistorialModal = ({ isOpen, onClose, colaboradorId, colaboradorNombre }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  useEffect(() => {
    if (isOpen && colaboradorId) {
      loadHistorial();
    }
  }, [isOpen, colaboradorId, page]);
  
  const loadHistorial = async () => {
    setLoading(true);
    try {
      const response = await historialApi.getByTablaAndRegistroId('colaborador', colaboradorId, page);
      if (response.data) {
        setHistorial(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getAccionBadge = (accion) => {
    const styles = {
      'INSERT': { bg: '#dcfce7', color: '#166534', text: 'Creación' },
      'UPDATE': { bg: '#dbeafe', color: '#1e40af', text: 'Actualización' },
      'SOFT_DELETE': { bg: '#fee2e2', color: '#991b1b', text: 'Desactivación' },
      'REACTIVATE': { bg: '#fef3c7', color: '#92400e', text: 'Reactivación' }
    };
    const style = styles[accion] || { bg: '#f1f5f9', color: '#334155', text: accion };
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {style.text}
      </span>
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Historial de Cambios</h2>
          <h3 style={{ color: '#64748b' }}>{colaboradorNombre}</h3>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Cargando historial...</div>
        ) : historial.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            No hay cambios registrados
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Acción</th>
                    <th>Usuario</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((item) => (
                    <tr key={item.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(item.fechaCambio).toLocaleString()}
                      </td>
                      <td>{getAccionBadge(item.accion)}</td>
                      <td>{item.nombreUsuario || 'Sistema'}</td>
                      <td>
                        <details>
                          <summary style={{ cursor: 'pointer', color: '#3b82f6' }}>
                            Ver cambios
                          </summary>
                          <div style={{ marginTop: '10px' }}>
                            {item.valorAnterior && (
                              <div>
                                <strong>Anterior:</strong>
                                <pre style={preStyle}>
                                  {JSON.stringify(JSON.parse(item.valorAnterior), null, 2)}
                                </pre>
                              </div>
                            )}
                            {item.valorNuevo && (
                              <div>
                                <strong>Nuevo:</strong>
                                <pre style={preStyle}>
                                  {JSON.stringify(JSON.parse(item.valorNuevo), null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  style={paginationButtonStyle}
                >
                  Anterior
                </button>
                <span style={{ padding: '8px 16px' }}>
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page + 1 >= totalPages}
                  style={paginationButtonStyle}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '10px',
  width: '900px',
  maxWidth: '90%',
  maxHeight: '80vh',
  overflowY: 'auto'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: 'white'
};

const preStyle = {
  backgroundColor: '#f1f5f9',
  padding: '10px',
  borderRadius: '5px',
  overflow: 'auto',
  fontSize: '12px',
  marginTop: '5px'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer'
};

const paginationButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default HistorialModal;
