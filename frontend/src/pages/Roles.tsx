import PageLayout from '../components/ui/PageLayout';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

// ==================== QUERIES & MUTATIONS ====================
const GET_ROLES_DATA = gql`
  query GetRolesData {
    todosRoles {
      idRol
      nombre
      descripcion
      permisos {
        id
        estado
        idPermiso {
          idPermiso
          nombre
        }
      }
    }
    todosPermisos {
      idPermiso
      nombre
    }
  }
`;

const CREAR_ROL = gql`
  mutation CrearRol($nombre: String!, $descripcion: String) {
    crearRol(nombre: $nombre, descripcion: $descripcion) {
      rol {
        idRol
        nombre
        descripcion
      }
    }
  }
`;

const EDITAR_ROL = gql`
  mutation EditarRol($idRol: Int!, $nombre: String, $descripcion: String) {
    editarRol(idRol: $idRol, nombre: $nombre, descripcion: $descripcion) {
      rol {
        idRol
        nombre
        descripcion
      }
    }
  }
`;

const CREAR_PERMISO = gql`
  mutation CrearPermiso($nombre: String!) {
    crearPermiso(nombre: $nombre) {
      permiso {
        idPermiso
        nombre
      }
    }
  }
`;

const EDITAR_PERMISO = gql`
  mutation EditarPermiso($idPermiso: Int!, $nombre: String) {
    editarPermiso(idPermiso: $idPermiso, nombre: $nombre) {
      permiso {
        idPermiso
        nombre
      }
    }
  }
`;

const ASIGNAR_ROL_PERMISO = gql`
  mutation AsignarRolPermiso($idRol: Int!, $idPermiso: Int!, $descripcion: String, $estado: Boolean) {
    asignarRolPermiso(idRol: $idRol, idPermiso: $idPermiso, descripcion: $descripcion, estado: $estado) {
      rolPermiso {
        id
        estado
      }
    }
  }
`;

export default function Roles() {
  const [selectedRol, setSelectedRol] = useState<any>(null);

  // Modal states - Rol
  const [showRolModal, setShowRolModal] = useState(false);
  const [editRolObj, setEditRolObj] = useState<any>(null);
  const [rolName, setRolName] = useState('');
  const [rolDesc, setRolDesc] = useState('');

  // Modal states - Permiso
  const [showPermModal, setShowPermModal] = useState(false);
  const [editPermObj, setEditPermObj] = useState<any>(null);
  const [permName, setPermName] = useState('');

  // Form states - Mapping
  const [selectedPermId, setSelectedPermId] = useState('');

  // Apollo queries
  const { data, loading, error, refetch } = useQuery(GET_ROLES_DATA);

  // Apollo mutations
  const [crearRol] = useMutation(CREAR_ROL);
  const [editarRol] = useMutation(EDITAR_ROL);
  const [crearPermiso] = useMutation(CREAR_PERMISO);
  const [editarPermiso] = useMutation(EDITAR_PERMISO);
  const [asignarRolPermiso] = useMutation(ASIGNAR_ROL_PERMISO);

  if (loading) return <div className="loading">Cargando roles y permisos...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  // ==================== ROL HANDLERS ====================
  const handleSaveRol = async () => {
    if (!rolName.trim()) { alert('El nombre del rol es obligatorio'); return; }
    try {
      if (editRolObj) {
        await editarRol({
          variables: {
            idRol: parseInt(editRolObj.idRol),
            nombre: rolName,
            descripcion: rolDesc
          }
        });
      } else {
        await crearRol({
          variables: {
            nombre: rolName,
            descripcion: rolDesc
          }
        });
      }
      setShowRolModal(false);
      setRolName('');
      setRolDesc('');
      setEditRolObj(null);
      refetch();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // ==================== PERMISO HANDLERS ====================
  const handleSavePermiso = async () => {
    if (!permName.trim()) { alert('El nombre del permiso es obligatorio'); return; }
    try {
      if (editPermObj) {
        await editarPermiso({
          variables: {
            idPermiso: parseInt(editPermObj.idPermiso),
            nombre: permName
          }
        });
      } else {
        await crearPermiso({
          variables: {
            nombre: permName
          }
        });
      }
      setShowPermModal(false);
      setPermName('');
      setEditPermObj(null);
      refetch();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // ==================== MAPPING HANDLERS ====================
  const handleAddPermToRol = async () => {
    if (!selectedRol) return;
    if (!selectedPermId) { alert('Seleccione un permiso para vincular'); return; }
    try {
      await asignarRolPermiso({
        variables: {
          idRol: parseInt(selectedRol.idRol),
          idPermiso: parseInt(selectedPermId),
          estado: true
        }
      });
      // Refresh local selected role mapping
      const prevId = selectedRol.idRol;
      refetch().then(newVal => {
        const updated = newVal.data?.todosRoles?.find((r: any) => r.idRol === prevId);
        if (updated) setSelectedRol(updated);
      });
      setSelectedPermId('');
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleRemovePermFromRol = async (permId: number) => {
    if (!selectedRol) return;
    if (!window.confirm('¿Desvincular este permiso del rol?')) return;
    try {
      await asignarRolPermiso({
        variables: {
          idRol: parseInt(selectedRol.idRol),
          idPermiso: parseInt(String(permId)),
          estado: false
        }
      });
      // Refresh local selected role mapping
      const prevId = selectedRol.idRol;
      refetch().then(newVal => {
        const updated = newVal.data?.todosRoles?.find((r: any) => r.idRol === prevId);
        if (updated) setSelectedRol(updated);
      });
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const activeRolePermissions = selectedRol?.permisos?.filter((rp: any) => rp.estado) || [];

  return (
    <PageLayout
      title="Configuración de Roles y Permisos (RBAC)"
      actions={[
        { label: 'Nuevo Rol', icon: '+', variant: 'primary' as const, onClick: () => { setEditRolObj(null); setRolName(''); setRolDesc(''); setShowRolModal(true); } },
        { label: 'Nuevo Permiso', icon: '+', onClick: () => { setEditPermObj(null); setPermName(''); setShowPermModal(true); } },
        { label: 'Actualizar', icon: '↺', onClick: () => refetch() },
      ]}
    >


      <div style={{ display: 'grid', gridTemplateColumns: selectedRol ? '1.5fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* COLUMNA IZQUIERDA: Tablas de Roles y Permisos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Roles */}
          <div className="table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a3c6e', margin: 0 }}>Roles de Usuario</h3>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditRolObj(null); setRolName(''); setRolDesc(''); setShowRolModal(true); }}>
                + Nuevo Rol
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Rol</th>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.todosRoles?.map((r: any) => {
                  const isSelected = selectedRol?.idRol === r.idRol;
                  return (
                    <tr
                      key={r.idRol}
                      onClick={() => setSelectedRol(r)}
                      style={{ cursor: 'pointer', background: isSelected ? '#e8f4fd' : 'white' }}
                    >
                      <td><strong>#{r.idRol}</strong></td>
                      <td><strong>{r.nombre}</strong></td>
                      <td>{r.descripcion || '-'}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => {
                            setEditRolObj(r);
                            setRolName(r.nombre);
                            setRolDesc(r.descripcion || '');
                            setShowRolModal(true);
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Permisos */}
          <div className="table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a3c6e', margin: 0 }}>Permisos Globales</h3>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditPermObj(null); setPermName(''); setShowPermModal(true); }}>
                + Nuevo Permiso
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Permiso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.todosPermisos?.map((p: any) => (
                  <tr key={p.idPermiso}>
                    <td><strong>#{p.idPermiso}</strong></td>
                    <td><code>{p.nombre}</code></td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => {
                          setEditPermObj(p);
                          setPermName(p.nombre);
                          setShowPermModal(true);
                        }}
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* COLUMNA DERECHA: Mapeo de Permisos del Rol */}
        {selectedRol && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a3c6e', margin: 0 }}>
                🔑 Permisos del Rol: {selectedRol.nombre}
              </h3>
              <button
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer' }}
                onClick={() => setSelectedRol(null)}
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              {selectedRol.descripcion || 'Sin descripción disponible.'}
            </p>

            {/* Listado de permisos activos del rol */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Permisos Asignados al Rol:
              </label>

              {activeRolePermissions.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic', margin: '0.5rem 0' }}>
                  Este rol no tiene ningún permiso asignado actualmente.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {activeRolePermissions.map((rp: any) => (
                    <div
                      key={rp.id}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    >
                      <code style={{ fontSize: '0.8rem', color: '#0f172a' }}>{rp.idPermiso?.nombre}</code>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                        onClick={() => handleRemovePermFromRol(rp.idPermiso.idPermiso)}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vincular nuevo permiso */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                Vincular Nuevo Permiso:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={selectedPermId}
                  onChange={e => setSelectedPermId(e.target.value)}
                  style={{ flex: 1, padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">Seleccione permiso...</option>
                  {data?.todosPermisos?.filter(
                    (p: any) => !activeRolePermissions.some((rp: any) => rp.idPermiso?.idPermiso === p.idPermiso)
                  ).map((p: any) => (
                    <option key={p.idPermiso} value={p.idPermiso}>{p.nombre}</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleAddPermToRol}>
                  Vincular
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ==================== MODAL: ABM ROL ==================== */}
      {showRolModal && (
        <div className="modal-overlay" onClick={() => setShowRolModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editRolObj ? 'Editar Rol' : 'Nuevo Rol'}</h2>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label>Nombre del Rol *</label>
                <input
                  type="text"
                  placeholder="Ej. Auditor, Almacenero"
                  value={rolName}
                  onChange={e => setRolName(e.target.value)}
                />
              </div>
              <div className="form-group form-group-full">
                <label>Descripción</label>
                <input
                  type="text"
                  placeholder="Descripción de responsabilidades del rol"
                  value={rolDesc}
                  onChange={e => setRolDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowRolModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveRol}>Guardar Rol</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ABM PERMISO ==================== */}
      {showPermModal && (
        <div className="modal-overlay" onClick={() => setShowPermModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editPermObj ? 'Editar Permiso' : 'Nuevo Permiso'}</h2>
            <div className="form-group">
              <label>Nombre del Permiso *</label>
              <input
                type="text"
                placeholder="Ej. crear_activo, ver_reportes"
                value={permName}
                onChange={e => setPermName(e.target.value)}
              />
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowPermModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSavePermiso}>Guardar Permiso</button>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  );
}
