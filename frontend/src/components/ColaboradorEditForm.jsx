import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { colaboradorApi } from '../api/colaboradorApi';

const ColaboradorEditForm = ({ colaborador, onClose, onSuccess }) => {
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm();
  
  useEffect(() => {
    if (colaborador) {
      reset({
        dni: colaborador.dni,
        nombres: colaborador.nombres,
        apellidoPaterno: colaborador.apellidoPaterno,
        apellidoMaterno: colaborador.apellidoMaterno || '',
        correoPersonal: colaborador.correoPersonal || '',
        telefono: colaborador.telefono || '',
        fechaNacimiento: colaborador.fechaNacimiento || '',
        sexo: colaborador.sexo || '',
        estadoCivil: colaborador.estadoCivil || '',
        direccion: colaborador.direccion || ''
      });
    }
  }, [colaborador, reset]);
  
  const onSubmit = async (data) => {
    setError('');
    setValidationErrors({});
    
    try {
      const response = await colaboradorApi.update(colaborador.id, data);
      if (response.status === 200 || response.status === 200) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.data?.message === 'Error de validación' && err.response?.data?.data) {
        setValidationErrors(err.response.data.data);
      } else {
        setError(err.response?.data?.message || 'Error al actualizar colaborador');
      }
    }
  };
  
  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Editar Colaborador</h2>
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
              <input 
                {...register('dni', { required: 'DNI es requerido', pattern: { value: /^\d{8}$/, message: 'DNI debe tener 8 dígitos' } })} 
                style={inputStyle} 
              />
              {validationErrors.dni && <span style={errorTextStyle}>{validationErrors.dni}</span>}
            </div>
            <div>
              <label>Nombres *</label>
              <input {...register('nombres', { required: 'Nombres es requerido' })} style={inputStyle} />
              {validationErrors.nombres && <span style={errorTextStyle}>{validationErrors.nombres}</span>}
            </div>
            <div>
              <label>Apellido Paterno *</label>
              <input {...register('apellidoPaterno', { required: 'Apellido paterno es requerido' })} style={inputStyle} />
              {validationErrors.apellidoPaterno && <span style={errorTextStyle}>{validationErrors.apellidoPaterno}</span>}
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
            <div style={{ gridColumn: 'span 2' }}>
              <label>Dirección</label>
              <textarea {...register('direccion')} rows="2" style={inputStyle} />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} style={submitButtonStyle}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar'}
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

const errorTextStyle = {
  color: '#dc2626',
  fontSize: '12px',
  display: 'block',
  marginTop: '5px'
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

export default ColaboradorEditForm;
