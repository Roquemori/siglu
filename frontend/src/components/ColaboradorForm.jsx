import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { colaboradorApi } from '../api/colaboradorApi';

const ColaboradorForm = ({ onClose, onSuccess }) => {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  
  const onSubmit = async (data) => {
    setError('');
    try {
      await colaboradorApi.create(data);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar colaborador');
    }
  };
  
  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Registrar Colaborador</h2>
          <button onClick={onClose} style={closeButtonStyle}>✕</button>
        </div>
        
        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>DNI *</label>
              <input {...register('dni', { required: true, pattern: /^\d{8}$/ })} style={inputStyle} />
            </div>
            <div>
              <label>Nombres *</label>
              <input {...register('nombres', { required: true })} style={inputStyle} />
            </div>
            <div>
              <label>Apellido Paterno *</label>
              <input {...register('apellidoPaterno', { required: true })} style={inputStyle} />
            </div>
            <div>
              <label>Apellido Materno</label>
              <input {...register('apellidoMaterno')} style={inputStyle} />
            </div>
            <div>
              <label>Correo Electrónico</label>
              <input type="email" {...register('correoPersonal')} style={inputStyle} />
            </div>
            <div>
              <label>Teléfono</label>
              <input {...register('telefono')} style={inputStyle} />
            </div>
            <div>
              <label>Fecha Nacimiento</label>
              <input type="date" {...register('fechaNacimiento')} style={inputStyle} />
            </div>
            <div>
              <label>Sexo</label>
              <select {...register('sexo')} style={inputStyle}>
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
            <div>
              <label>Estado Civil</label>
              <select {...register('estadoCivil')} style={inputStyle}>
                <option value="">Seleccionar</option>
                <option value="SOLTERO">Soltero</option>
                <option value="CASADO">Casado</option>
                <option value="CONVIVIENTE">Conviviente</option>
                <option value="DIVORCIADO">Divorciado</option>
                <option value="VIUDO">Viudo</option>
              </select>
            </div>
            <div>
              <label>Dirección</label>
              <textarea {...register('direccion')} rows="2" style={inputStyle} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} style={submitButtonStyle}>
              {isSubmitting ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
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
  width: '700px',
  maxWidth: '90%',
  maxHeight: '80vh',
  overflowY: 'auto'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  marginTop: '5px'
};

const errorStyle = {
  backgroundColor: '#fee2e2',
  color: '#dc2626',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '20px'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer'
};

const cancelButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#94a3b8',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const submitButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

export default ColaboradorForm;
