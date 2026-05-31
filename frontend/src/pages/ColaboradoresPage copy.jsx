import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { colaboradorApi } from '../api/colaboradorApi';
import ColaboradorForm from '../components/ColaboradorForm';
import ColaboradorEditForm from '../components/ColaboradorEditForm';
import HistorialModal from '../components/HistorialModal';

const ColaboradoresPage = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activo, setActivo] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  
  const { data, loading, refetch } = useFetch(
    () => colaboradorApi.getAll(page, 10, search, activo),
    [page, search, activo]
  );
  
  const colaboradores = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };
  
  const handleActivoFilter = (value) => {
    setActivo(value);
    setPage(0);
  };
  
  const handleEdit = (colaborador) => {
    setSelectedColaborador(colaborador);
    setShowEditModal(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desactivar este colaborador?')) {
      try {
        await colaboradorApi.delete(id);
        refetch();
      } catch (error) {
        alert('Error al desactivar el colaborador');
      }
    }
  };
  
  const handleReactivar = async (id) => {
    if (window.confirm('¿Estás seguro de reactivar este colaborador?')) {
      try {
        await colaboradorApi.reactivar(id);
        refetch();
      } catch (error) {
        alert('Error al reactivar el colaborador');
      }
    }
  };
  
  const handleHistorial = (colaborador) => {
    setSelectedColaborador(colaborador);
    setShowHistorialModal(true);
  };
  
  const handleSuccess = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    refetch();
  };
  
  const nombreCompleto = (col) => {
    let nombre = `${col.nombres} ${col.apellidoPaterno}`;
    if (col.apellidoMaterno) nombre += ` ${col.apellidoMaterno}`;
    return nombre;
  };
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ color: '#1e293b' }}>Colaboradores</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={buttonStyle}
        >
          + Nuevo Colaborador
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por DNI, nombres o apellidos..."
          value={search}
          onChange={handleSearch}
          style={searchInputStyle}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleActivoFilter(true)}
            style={{ ...filterButtonStyle, backgroundColor: activo === true ? '#3b82f6' : '#e2e8f0', color: activo === true ? 'white' : '#475569' }}
          >
            Activos
          </button>
          <button
            onClick={() => handleActivoFilter(false)}
            style={{ ...filterButtonStyle, backgroundColor: activo === false ? '#3b82f6' : '#e2e8f0', color: activo === false ? 'white' : '#475569' }}
          >
            Inactivos
          </button>
          <button
            onClick={() => handleActivoFilter(null)}
            style={{ ...filterButtonStyle, backgroundColor: activo === null ? '#3b82f6' : '#e2e8f0', color: activo === null ? 'white' : '#475569' }}
          >
            Todos
          </button>
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Cargando...</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>DNI</th>
                  <th>Nombres Completos</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((col) => (
                  <tr key={col.id}>
                    <td>{col.id}</td>
                    <td>{col.dni}</td>
                    <td>{nombreCompleto(col)}</td>
                    <td>{col.correoPersonal || '-'}</td>
                    <td>{col.telefono || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: col.activo ? '#dcfce7' : '#fee2e2',
                        color: col.activo ? '#166534' : '#991b1b'
                      }}>
                        {col.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleEdit(col)}
                          style={actionButtonStyle}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleHistorial(col)}
                          style={actionButtonStyle}
                          title="Historial"
                        >
                          📜
                        </button>
                        {col.activo ? (
                          <button
                            onClick={() => handleDelete(col.id)}
                            style={{ ...actionButtonStyle, color: '#dc2626' }}
                            title="Desactivar"
                          >
                            🗑️
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivar(col.id)}
                            style={{ ...actionButtonStyle, color: '#10b981' }}
                            title="Reactivar"
                          >
                            🔄
                          </button>
                        )}
                      </div>
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
      
      {showCreateModal && (
        <ColaboradorForm
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSuccess}
        />
      )}
      
      {showEditModal && selectedColaborador && (
        <ColaboradorEditForm
          colaborador={selectedColaborador}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSuccess}
        />
      )}
      
      {showHistorialModal && selectedColaborador && (
        <HistorialModal
          isOpen={showHistorialModal}
          onClose={() => setShowHistorialModal(false)}
          colaboradorId={selectedColaborador.id}
          colaboradorNombre={nombreCompleto(selectedColaborador)}
        />
      )}
    </div>
  );
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const searchInputStyle = {
  flex: 1,
  padding: '10px',
  border: '1px solid #cbd5e1',
  borderRadius: '5px',
  fontSize: '14px',
  minWidth: '250px'
};

const filterButtonStyle = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '500'
};

const actionButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '5px'
};

const paginationButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default ColaboradoresPage;
