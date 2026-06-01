import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { colaboradorApi } from '../api/colaboradorApi';
import ColaboradorForm from '../components/ColaboradorForm';
import ColaboradorEditForm from '../components/ColaboradorEditForm';
import HistorialModal from '../components/HistorialModal';

const ColaboradoresPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [activo, setActivo] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const { data, loading, refetch } = useFetch(
    () => colaboradorApi.getAll(page, 10, search, activo),
    [page, search, activo]
  );

  const colaboradores = data?.data?.content || [];
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleActivoFilter = (value) => {
    setActivo(value);
    setPage(0);
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortAsc(v => !v);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  const sortedColaboradores = useMemo(() => {
    if (!sortCol) return colaboradores;
    return [...colaboradores].sort((a, b) => {
      let av = a[sortCol] ?? '';
      let bv = b[sortCol] ?? '';
      if (typeof av === 'boolean') { av = av ? 1 : 0; bv = bv ? 1 : 0; }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [colaboradores, sortCol, sortAsc]);

  const handleEdit = (colaborador) => {
    setSelectedColaborador(colaborador);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de desactivar este colaborador?')) {
      try {
        await colaboradorApi.delete(id);
        refetch();
      } catch {
        alert('Error al desactivar el colaborador');
      }
    }
  };

  const handleReactivar = async (id) => {
    if (window.confirm('¿Estás seguro de reactivar este colaborador?')) {
      try {
        await colaboradorApi.reactivar(id);
        refetch();
      } catch {
        alert('Error al reactivar el colaborador');
      }
    }
  };

  const handleHistorial = (colaborador) => {
    setSelectedColaborador(colaborador);
    setShowHistorialModal(true);
  };

  const handleDocumentos = (colaborador) => {
    console.log('Navegando a documentos del colaborador:', colaborador.id);
    navigate(`/colaboradores/${colaborador.id}/documentos`);
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

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <i className="fas fa-sort" style={styles.sortIcon}></i>;
    return <i className={`fas fa-sort-${sortAsc ? 'up' : 'down'}`} style={{ ...styles.sortIcon, color: '#185FA5' }}></i>;
  };

  const from = totalElements === 0 ? 0 : page * 10 + 1;
  const to = Math.min((page + 1) * 10, totalElements);

  return (
    <div>
      {/* Encabezado */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Colaboradores</h1>
          <p style={styles.pageSubtitle}>
            {loading ? 'Cargando...' : `${totalElements} registro${totalElements !== 1 ? 's' : ''} encontrado${totalElements !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={styles.btnPrimary}>
          <i className="fas fa-plus" style={{ marginRight: '6px' }}></i>
          Nuevo colaborador
        </button>
      </div>

      {/* Barra de herramientas */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <i className="fas fa-search" style={styles.searchIcon}></i>
          <input
            type="text"
            placeholder="Buscar por DNI, nombres o apellidos..."
            value={search}
            onChange={handleSearch}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterGroup}>
          {[
            { label: 'Activos', value: true },
            { label: 'Inactivos', value: false },
            { label: 'Todos', value: null },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleActivoFilter(value)}
              style={{
                ...styles.filterBtn,
                ...(activo === value ? styles.filterBtnActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingState}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '20px', color: '#185FA5', marginBottom: '8px' }}></i>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>Cargando colaboradores...</span>
          </div>
        ) : colaboradores.length === 0 ? (
          <div style={styles.emptyState}>
            <i className="fas fa-users" style={{ fontSize: '32px', color: '#d1d5db', marginBottom: '8px' }}></i>
            <span style={{ color: '#6b7280', fontSize: '14px' }}>No se encontraron colaboradores</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    { label: 'ID', col: 'id', width: '52px' },
                    { label: 'DNI', col: 'dni', width: '96px' },
                    { label: 'Nombre completo', col: 'nombres' },
                    { label: 'Correo', col: 'correoPersonal', width: '190px' },
                    { label: 'Teléfono', col: null, width: '110px' },
                    { label: 'Estado', col: 'activo', width: '90px' },
                    { label: 'Acciones', col: null, width: '120px' },
                  ].map(({ label, col, width }) => (
                    <th
                      key={label}
                      style={{ ...styles.th, width: width || 'auto', cursor: col ? 'pointer' : 'default' }}
                      onClick={() => col && handleSort(col)}
                    >
                      <span style={styles.thInner}>
                        {label}
                        {col && <SortIcon col={col} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedColaboradores.map((col) => (
                  <tr key={col.id} style={styles.tr}>
                    <td style={styles.td}>{col.id}</td>
                    <td style={styles.td}>{col.dni}</td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>{nombreCompleto(col)}</td>
                    <td style={{ ...styles.td, color: col.correoPersonal ? '#185FA5' : '#9ca3af' }}>
                      {col.correoPersonal || '—'}
                    </td>
                    <td style={{ ...styles.td, color: col.telefono ? 'inherit' : '#9ca3af' }}>
                      {col.telefono || '—'}
                    </td>
                    <td style={styles.td}>
                      <span style={col.activo ? styles.badgeActive : styles.badgeInactive}>
                        {col.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleEdit(col)}
                          style={styles.actionBtn}
                          title="Editar"
                        >
                          <i className="fas fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleHistorial(col)}
                          style={styles.actionBtn}
                          title="Historial"
                        >
                          <i className="fas fa-history"></i>
                        </button>
                        <button
                          onClick={() => handleDocumentos(col)}
                          style={styles.actionBtn}
                          title="Documentos"
                        >
                          <i className="fas fa-folder-open"></i>
                        </button>
                        {col.activo ? (
                          <button
                            onClick={() => handleDelete(col.id)}
                            style={{ ...styles.actionBtn, ...styles.actionBtnDanger }}
                            title="Desactivar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivar(col.id)}
                            style={{ ...styles.actionBtn, ...styles.actionBtnSuccess }}
                            title="Reactivar"
                          >
                            <i className="fas fa-rotate-right"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
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
                aria-label="Anterior"
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
                    <span key={`dots-${idx}`} style={{ padding: '0 4px', color: '#9ca3af', fontSize: '13px' }}>…</span>
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
                aria-label="Siguiente"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
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
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '9px 18px',
    backgroundColor: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
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
    display: 'flex',
    gap: '4px',
  },
  filterBtn: {
    padding: '0 14px',
    height: '36px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    background: '#fff',
    color: '#6b7280',
    fontWeight: '500',
  },
  filterBtnActive: {
    background: '#185FA5',
    color: '#fff',
    borderColor: '#185FA5',
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
    fontWeight: '500',
    color: '#6b7280',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  thInner: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
  },
  sortIcon: {
    fontSize: '11px',
    color: '#d1d5db',
  },
  tr: {
    transition: 'background 0.1s',
  },
  td: {
    padding: '10px 14px',
    fontSize: '13px',
    color: '#111827',
    borderBottom: '1px solid #f3f4f6',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badgeActive: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 9px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
    background: '#EAF3DE',
    color: '#27500A',
  },
  badgeInactive: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 9px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
    background: '#FCEBEB',
    color: '#791F1F',
  },
  actions: {
    display: 'flex',
    gap: '2px',
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
  actionBtnDanger: {
    color: '#dc2626',
  },
  actionBtnSuccess: {
    color: '#16a34a',
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

export default ColaboradoresPage;
