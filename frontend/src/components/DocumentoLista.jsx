import React, { useState } from 'react';
import { documentoApi } from '../api/documentoApi';
import { useFetch } from '../hooks/useFetch';

const DocumentoLista = ({ colaboradorId, colaboradorNombre, onRefresh }) => {
  const [page, setPage] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [previewDocumento, setPreviewDocumento] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  const { data, loading, refetch } = useFetch(
    () => documentoApi.getByColaborador(colaboradorId, page, 10),
    [colaboradorId, page]
  );
  
  const documentos = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;
  
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
  
  const handlePreview = async (doc) => {
    setPreviewDocumento(doc);
    setLoadingPreview(true);
    
    try {
      const token = localStorage.getItem('siglu_token');
      const response = await fetch(`http://localhost:8080/api/documentos/download/${doc.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        console.error('Error al cargar preview');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingPreview(false);
    }
  };
  
  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewDocumento(null);
    setPreviewUrl(null);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este documento?')) {
      try {
        await documentoApi.delete(id);
        refetch();
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el documento');
      }
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
  
  const getFileIcon = (mimeType, nombreArchivo) => {
    if (mimeType === 'application/pdf') return 'fa-file-pdf';
    if (mimeType?.startsWith('image/')) return 'fa-file-image';
    if (mimeType?.includes('word')) return 'fa-file-word';
    if (nombreArchivo?.toLowerCase().includes('.xls')) return 'fa-file-excel';
    return 'fa-file-alt';
  };
  
  if (loading) {
    return (
      <div style={styles.loadingState}>
        <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '20px', color: '#185FA5', marginBottom: '8px' }}></i>
        <span style={{ color: '#6b7280', fontSize: '14px' }}>Cargando documentos...</span>
      </div>
    );
  }
  
  return (
    <div>
      <div style={styles.header}>
        <div>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            <i className="fas fa-file-alt"></i> {totalElements} documento{totalElements !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {documentos.length === 0 ? (
        <div style={styles.emptyState}>
          <i className="fas fa-folder-open" style={{ fontSize: '32px', color: '#d1d5db', marginBottom: '8px' }}></i>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>No hay documentos subidos</span>
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
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th style={{ width: '80px' }}>Tamaño</th>
                  <th style={{ width: '100px' }}>Subido</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc, idx) => (
                  <tr key={doc.id}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>
                      <span style={styles.badgeSeccion}>
                        {doc.tipoDocumentoSeccion}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>{doc.tipoDocumentoNombre}</td>
                    <td style={{ ...styles.td, color: '#185FA5' }}>
                      <i className={`fas ${getFileIcon(doc.mimeType, doc.nombreArchivo)}`} style={{ marginRight: '6px' }}></i>
                      {doc.nombreArchivo}
                    </td>
                    <td style={{ ...styles.td, maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {doc.descripcion || '—'}
                    </td>
                    <td style={styles.td}>{formatBytes(doc.tamanoBytes)}</td>
                    <td style={styles.td}>{new Date(doc.fechaSubida).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => handlePreview(doc)}
                          style={styles.actionBtn}
                          title="Vista previa"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => handleDownload(doc.id)}
                          style={styles.actionBtn}
                          title="Descargar"
                          disabled={downloading}
                        >
                          <i className="fas fa-download"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
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
              <span style={styles.pageInfo}>Mostrando {from}–{to} de {totalElements}</span>
              <div style={styles.pageBtns}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={styles.pageBtn}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter(i => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1)
                  .map((i, idx, arr) => {
                    if (idx > 0 && i - arr[idx - 1] > 1) return <span key={`dots-${idx}`}>…</span>;
                    return (
                      <button key={i} onClick={() => setPage(i)} style={{ ...styles.pageBtn, ...(page === i ? styles.pageBtnActive : {}) }}>
                        {i + 1}
                      </button>
                    );
                  })}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page + 1 >= totalPages} style={styles.pageBtn}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Modal de vista previa */}
      {previewDocumento && (
        <div style={modalOverlayStyle} onClick={closePreview}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>
                <i className={`fas ${getFileIcon(previewDocumento.mimeType, previewDocumento.nombreArchivo)}`} style={{ marginRight: '8px', color: '#185FA5' }}></i>
                {previewDocumento.nombreArchivo}
              </h3>
              <button onClick={closePreview} style={closeButtonStyle}>✕</button>
            </div>
            
            <div style={modalBodyStyle}>
              {loadingPreview ? (
                <div style={styles.loadingState}>
                  <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '24px', color: '#185FA5' }}></i>
                  <span>Cargando...</span>
                </div>
              ) : previewDocumento.mimeType === 'application/pdf' && previewUrl ? (
                <iframe
                  src={previewUrl}
                  style={previewIframeStyle}
                  title="Vista previa PDF"
                />
              ) : previewDocumento.mimeType?.startsWith('image/') && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={previewDocumento.nombreArchivo}
                  style={previewImageStyle}
                />
              ) : (
                <div style={noPreviewStyle}>
                  <i className="fas fa-file-alt" style={{ fontSize: '48px', color: '#9ca3af', marginBottom: '16px' }}></i>
                  <p>Vista previa no disponible para este tipo de archivo</p>
                  <button onClick={() => handleDownload(previewDocumento.id)} style={downloadButtonStyle}>
                    <i className="fas fa-download" style={{ marginRight: '8px' }}></i>
                    Descargar archivo
                  </button>
                </div>
              )}
            </div>
            
            {previewDocumento.descripcion && (
              <div style={modalFooterStyle}>
                <strong>Descripción:</strong> {previewDocumento.descripcion}
              </div>
            )}
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
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1001
};

const modalStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '900px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb'
};

const modalTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b',
  margin: 0
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#6b7280'
};

const modalBodyStyle = {
  padding: '20px',
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '300px'
};

const previewIframeStyle = {
  width: '100%',
  height: '500px',
  border: 'none',
  borderRadius: '8px'
};

const previewImageStyle = {
  maxWidth: '100%',
  maxHeight: '500px',
  objectFit: 'contain'
};

const noPreviewStyle = {
  textAlign: 'center',
  padding: '40px'
};

const downloadButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#185FA5',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  marginTop: '16px'
};

const modalFooterStyle = {
  padding: '12px 20px',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
  fontSize: '13px',
  color: '#374151'
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    fontSize: '13px'
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
    color: '#111827',
    borderBottom: '1px solid #f3f4f6'
  },
  badgeSeccion: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    background: '#EAF3DE',
    color: '#27500A'
  },
  actions: {
    display: 'flex',
    gap: '6px'
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
    fontSize: '13px'
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderTop: '1px solid #e5e7eb',
    marginTop: '16px'
  },
  pageInfo: {
    fontSize: '12px',
    color: '#6b7280'
  },
  pageBtns: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
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
    justifyContent: 'center'
  },
  pageBtnActive: {
    background: '#185FA5',
    color: '#fff',
    borderColor: '#185FA5'
  }
};

export default DocumentoLista;
