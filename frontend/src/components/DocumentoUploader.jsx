import React, { useState, useEffect } from 'react';
import { documentoApi } from '../api/documentoApi';
import { tipoDocumentoApi } from '../api/tipoDocumentoApi';

const DocumentoUploader = ({ colaboradorId, onSuccess, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tipoDocumentoId, setTipoDocumentoId] = useState('');
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const cargarTiposDocumento = async () => {
      try {
        const response = await tipoDocumentoApi.getAll();
        if (response.data) {
          setTiposDocumento(response.data);
        }
      } catch (err) {
        console.error('Error cargando tipos de documento:', err);
      }
    };
    cargarTiposDocumento();
  }, []);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo no puede superar los 10MB');
        setSelectedFile(null);
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de archivo no permitido. Use: PDF, JPEG, PNG, DOC, DOCX');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Seleccione un archivo');
      return;
    }
    
    if (!tipoDocumentoId) {
      setError('Seleccione un tipo de documento');
      return;
    }
    
    setUploading(true);
    setError('');
    
    try {
      await documentoApi.upload(selectedFile, colaboradorId, tipoDocumentoId);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir el documento');
      setUploading(false);
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <i className="fas fa-cloud-upload-alt" style={{ marginRight: '8px', color: '#185FA5' }}></i>
        <span style={styles.title}>Subir nuevo documento</span>
      </div>
      
      {error && (
        <div style={styles.error}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>
          {error}
        </div>
      )}
      
      {success && (
        <div style={styles.success}>
          <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>
          Documento subido exitosamente
        </div>
      )}
      
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <i className="fas fa-tag" style={{ marginRight: '6px', color: '#6b7280' }}></i>
          Tipo de Documento *
        </label>
        <select
          value={tipoDocumentoId}
          onChange={(e) => setTipoDocumentoId(e.target.value)}
          style={styles.select}
          disabled={uploading || success}
        >
          <option value="">Seleccionar tipo</option>
          {tiposDocumento.map(tipo => (
            <option key={tipo.id} value={tipo.id}>
              [{tipo.seccion}] {tipo.nombre}
            </option>
          ))}
        </select>
      </div>
      
      <div style={styles.formGroup}>
        <label style={styles.label}>
          <i className="fas fa-file" style={{ marginRight: '6px', color: '#6b7280' }}></i>
          Archivo *
        </label>
        <div style={styles.fileInputWrapper}>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            style={styles.fileInput}
            disabled={uploading || success}
            id="file-upload-doc"
          />
          <label htmlFor="file-upload-doc" style={styles.fileLabel}>
            <i className="fas fa-folder-open"></i> Seleccionar archivo
          </label>
          {selectedFile && (
            <div style={styles.fileInfo}>
              <i className="fas fa-check-circle" style={{ color: '#10b981', marginRight: '6px' }}></i>
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>
      </div>
      
      <div style={styles.buttonGroup}>
        {onCancel && (
          <button onClick={onCancel} style={styles.cancelButton} disabled={uploading}>
            <i className="fas fa-times" style={{ marginRight: '6px' }}></i>
            Cancelar
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile || !tipoDocumentoId || success}
          style={{
            ...styles.submitButton,
            opacity: (uploading || !selectedFile || !tipoDocumentoId || success) ? 0.6 : 1
          }}
        >
          {uploading ? (
            <><i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Subiendo...</>
          ) : (
            <><i className="fas fa-cloud-upload-alt" style={{ marginRight: '6px' }}></i> Subir Documento</>
          )}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '18px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#111827',
    background: '#fff',
    outline: 'none'
  },
  fileInputWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  fileInput: {
    display: 'none'
  },
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    width: 'fit-content'
  },
  fileInfo: {
    padding: '10px 12px',
    backgroundColor: '#e8f4f0',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#0e5c3b',
    display: 'flex',
    alignItems: 'center'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb'
  },
  cancelButton: {
    padding: '8px 18px',
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
  },
  submitButton: {
    padding: '8px 20px',
    backgroundColor: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center'
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center'
  }
};

export default DocumentoUploader;
