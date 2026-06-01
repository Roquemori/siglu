import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { documentoApi } from '../api/documentoApi';
import { colaboradorApi } from '../api/colaboradorApi';

const DocumentosPage = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedColaboradorId, setSelectedColaboradorId] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);
  
  // Cargar colaboradores para el filtro
  React.useEffect(() => {
    const cargarColaboradores = async () => {
      try {
        const response = await colaboradorApi.getAll(0, 100);
        if (response.data) {
          setColaboradores(response.data.content || []);
        }
      } catch (err) {
        console.error('Error cargando colaboradores:', err);
      }
    };
    cargarColaboradores();
  }, []);
  
  // Cargar documentos según filtros
  const { data, loading, refetch } = useFetch(
    async () => {
      if (selectedColaboradorId) {
        const response = await documentoApi.getByColaborador(selectedColaboradorId, page, 10);
        return response;
      }
      return { data: { content: [], totalElements: 0, totalPages: 0 } };
    },
    [page, selectedColaboradorId]
  );
  
  const documentos = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;
  
  // Filtrar documentos por búsqueda
  const documentosFiltrados = documentos.filter(doc => {
    if (!search.trim()) return true;
    return doc.nombreArchivo?.toLowerCase().includes(search.toLowerCase()) ||
           doc.tipoDocumentoNombre?.toLowerCase().includes(search.toLowerCase());
  });
  
  const handleDownload = async (id) => {
    setDownloading(true);
    try {
      await documentoApi.download(id);
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el documento');
    } finally {
      setDownloading(false);
    }
  };
  
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const from = totalElements === 0 ? 0 : page * 10 + 1;
  const to = Math.min((page + 1) * 10, totalElements);
  
  const getColaboradorNombre = (colaboradorId) => {
    const col = colaboradores.find(c => c.id === colaboradorId);
    if (col) {
      return `${col.nombres} ${col.apellidoPaterno} ${col.apellidoMaterno || ''}`.trim();
    }
    return `ID: ${colaboradorId}`;
  };
  
  return (
    <div>
      {/* Encabezado */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Documentos</h1>
          <p style={styles.pageSubtitle}>
            {loading ? 'Cargando...' : `${totalElements} documento${totalElements !== 1 ? 's' : ''} encontrado${totalElements !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
      
      {/* Barra de herramientas */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <i className="fas fa-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Buscar por nombre de archivo o tipo de documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterGroup}>
          <select
            value={selectedColaboradorId}
            onChange={(e) => {
              setSelectedColaboradorId(e.target.value);
              setPage(0);
            }}
            style={styles.selectFilter}
          >
            <option value="">Todos los colaboradores</option>
            {colaboradores.map(col => (
              <option key={col.id} value={col.id}>
                {col.nombres} {col.apellidoPaterno} {col.apellidoMaterno || ''}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Tabla */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingState}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '20px', color: '#185FA5', marginBottom: '8px' }}></i>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Cargando documentos...</span>
          </div>
        ) : documentosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="fas fa-folder-open" style={{ fontSize: '32px', color: '#d1d5db', marginBottom: '8px' }}></i>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>No se encontraron documentos</span>
            {selectedColaboradorId && (
              <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
                El colaborador seleccionado no tiene documentos subidos
              </span>
            )}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '40px' }}>#</th>
                    <th style={{ ...styles.th, width: '60px' }}>Sección</th>
                    <th style={{ ...styles.th }}>Tipo</th>
                    <th style={{ ...styles.th }}>Nombre del Archivo</th>
                    <th style={{ ...styles.th, width: '150px' }}>Colaborador</th>
                    <th style={{ ...styles.th, width: '80px' }}>Tamaño</th>
                    <th style={{ ...styles.th, width: '100px' }}>Subido</th>
                    <th style={{ ...styles.th, width: '80px' }}>Usuario</th>
                    <th style={{ ...styles.th, width: '80px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {documentosFiltrados.map((doc, idx) => (
                    <tr key={doc.id}>
                      <td style={styles.td}>{idx + 1}</td>
                      <td style={styles.td}>
                        <span style={styles.badgeSeccion}>
                          {doc.tipoDocumentoSeccion}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: '500' }}>{doc.tipoDocumentoNombre}</td>
                      <td style={{ ...styles.td, color: '#185FA5' }}>{doc.nombreArchivo}</td>
                      <td style={styles.td}>{getColaboradorNombre(doc.colaboradorId)}</td>
                      <td style={styles.td}>{formatBytes(doc.tamanoBytes)}</td>
                      <td style={styles.td}>{new Date(doc.fechaSubida).toLocaleDateString()}</td>
                      <td style={styles.td}>{doc.usuarioSubida}</td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            onClick={() => handleDownload(doc.id)}
                            style={styles.actionBtn}
                            title="Descargar"
                            disabled={downloading}
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <span style={styles.pageInfo}>
                  Mostrando {from}–{to} de {totalElements} registros
                </span>
                <div style={styles.pageBtns}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={styles.pageBtn}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                    .reduce((acc, i, idx, arr) => {
                      if (idx > 0 && i - arr[idx - 1] > 1) acc.push('...');
                      acc.push(i);
                      return acc;
                    }, [])
                    .map((i, idx) =>
                      i === '...' ? (
                        <span key={`dots-${idx}`} style={{ padding: '0 4px', color: '#9ca3af' }}>…</span>
                      ) : (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          style={{ ...styles.pageBtn, ...(page === i ? styles.pageBtnActive : {}) }}
                        >
                          {i + 1}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page + 1 >= totalPages}
                    style={styles.pageBtn}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '3px',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
    minWidth: '220px',
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '14px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: '36px',
    padding: '0 12px 0 32px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#111827',
    background: '#fff',
    outline: 'none',
  },
  filterGroup: {
    minWidth: '200px',
  },
  selectFilter: {
    width: '100%',
    height: '36px',
    padding: '0 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#111827',
    background: '#fff',
    outline: 'none',
  },
  tableCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 14px',
    fontSize: '13px',
    color: '#111827',
    borderBottom: '1px solid #f3f4f6',
    whiteSpace: 'nowrap',
  },
  badgeSeccion: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    background: '#EAF3DE',
    color: '#27500A',
  },
  actions: {
    display: 'flex',
    gap: '6px',
  },
  actionBtn: {
    width: '28px',
    height: '28px',
    border: 'none',
    borderRadius: '6px',
    background: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    fontSize: '13px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
  },
  pageInfo: {
    fontSize: '12px',
    color: '#6b7280',
  },
  pageBtns: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  pageBtn: {
    width: '32px',
    height: '32px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    background: '#fff',
    color: '#6b7280',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActive: {
    background: '#185FA5',
    color: '#fff',
    borderColor: '#185FA5',
  },
};

export default DocumentosPage;
