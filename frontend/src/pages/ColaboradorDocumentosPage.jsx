import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { documentoApi } from '../api/documentoApi';
import { colaboradorApi } from '../api/colaboradorApi';
import DocumentoUploader from '../components/DocumentoUploader';

const ColaboradorDocumentosPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Cargar datos del colaborador
  const { data: colaboradorData, loading: loadingColaborador } = useFetch(
    () => colaboradorApi.getById(id),
    [id]
  );
  
  const colaborador = colaboradorData?.data;
  
  // Cargar documentos del colaborador
  const { data, loading, refetch } = useFetch(
    () => documentoApi.getByColaborador(id, page, 10),
    [id, page]
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
  
  const handleDownload = async (docId) => {
    setDownloading(true);
    try {
      await documentoApi.download(docId);
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el documento');
    } finally {
      setDownloading(false);
    }
  };
  
  const handleDelete = async (docId, docName) => {
    if (window.confirm(`¿Estás seguro de eliminar el documento "${docName}"?`)) {
      try {
        await documentoApi.delete(docId);
        refetch();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el documento');
      }
    }
  };
  
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    refetch();
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
  
  const nombreCompleto = colaborador 
    ? `${colaborador.nombres} ${colaborador.apellidoPaterno} ${colaborador.apellidoMaterno || ''}`.trim()
    : 'Cargando...';
  
  return (
    <div>
      {/* Botón Volver */}
      <button onClick={() => navigate('/colaboradores')} style={styles.backButton}>
        <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
        Volver a Colaboradores
      </button>
      
      {/* Encabezado */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>
            <i className="fas fa-folder-open" style={{ marginRight: '10px', color: '#185FA5' }}></i>
            Documentos de {nombreCompleto}
          </h1>
          <p style={styles.pageSubtitle}>
            {loading ? 'Cargando...' : `${totalElements} documento${totalElements !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowUploadModal(true)} style={styles.btnPrimary}>
          <i className="fas fa-plus" style={{ marginRight: '6px' }}></i>
          Subir Documento
        </button>
      </div>
      
      {/* Barra de búsqueda */}
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
      </div>
      
      {/* Tabla de documentos */}
      <div style={styles.tableCard}>
        {loading || loadingColaborador ? (
          <div style={styles.loadingState}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '20px', color: '#185FA5' }}></i>
            <span>Cargando documentos...</span>
          </div>
        ) : documentosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="fas fa-folder-open" style={{ fontSize: '32px', color: '#d1d5db' }}></i>
            <span>No hay documentos subidos</span>
            <button onClick={() => setShowUploadModal(true)} style={styles.btnEmpty}>
              <i className="fas fa-plus" style={{ marginRight: '6px' }}></i>
              Subir primer documento
            </button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th style={{ width: '60px' }}>Sección</th>
                    <th>Tipo</th>
                    <th>Nombre del Archivo</th>
                    <th style={{ width: '80px' }}>Tamaño</th>
                    <th style={{ width: '100px' }}>Subido</th>
                    <th style={{ width: '80px' }}>Usuario</th>
                    <th style={{ width: '80px' }}>Acciones</th>
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
                      <td style={styles.td}>{doc.tipoDocumentoNombre}</td>
                      <td style={{ ...styles.td, color: '#185FA5' }}>{doc.nombreArchivo}</td>
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
                          <button
                            onClick={() => handleDelete(doc.id, doc.nombreArchivo)}
                            style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}
                            title="Eliminar"
                          >
                            <i className="fas fa-trash-alt"></i>
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
                <span>Mostrando {from}–{to} de {totalElements}</span>
                <div>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={styles.pageBtn}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span style={{ margin: '0 8px' }}>Página {page + 1} de {totalPages}</span>
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
      
      {/* Modal de subida */}
      {showUploadModal && (
        <div style={modalOverlayStyle} onClick={() => setShowUploadModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>Subir Documento</h2>
              <button onClick={() => setShowUploadModal(false)} style={closeButtonStyle}>✕</button>
            </div>
            <DocumentoUploader
              colaboradorId={id}
              onSuccess={handleUploadSuccess}
              onCancel={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
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
  width: '550px',
  maxWidth: '90%'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer'
};

const styles = {
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '5px'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  btnEmpty: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '16px'
  },
  toolbar: { marginBottom: '16px' },
  searchWrap: { position: 'relative', maxWidth: '400px' },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  searchInput: {
    width: '100%',
    height: '36px',
    padding: '0 12px 0 32px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none'
  },
  tableCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '10px 12px',
    fontSize: '13px',
    borderBottom: '1px solid #f3f4f6'
  },
  badgeSeccion: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    background: '#EAF3DE',
    color: '#27500A'
  },
  actions: { display: 'flex', gap: '8px' },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '5px',
    color: '#6b7280'
  },
  actionBtnDanger: {
    color: '#dc2626'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb'
  },
  pageBtn: {
    padding: '6px 12px',
    margin: '0 4px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer'
  }
};

export default ColaboradorDocumentosPage;
