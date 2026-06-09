import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

// ==================== QUERIES & MUTATIONS ====================
const GET_USUARIOS_DATA = gql`
  query GetUsuariosData {
    todosUsuarios {
      idUsuario
      correo
      estado
      twoFactorEnabled
      idEmpleado {
        idEmpleado
        nombre
        apellido
        numeroDocumento
        tipoDocumento
        fechaIngreso
        salario
        telefono
        cargo
      }
      rolesPermisos {
        id
        estado
        idRol {
          idRol
          nombre
          descripcion
        }
        idPermiso {
          idPermiso
          nombre
        }
      }
    }
    todosRoles {
      idRol
      nombre
      descripcion
    }
    todosPermisos {
      idPermiso
      nombre
    }
    todosResponsables {
      codResp
      codEstprog
      codEmp {
        idEmpleado
      }
      aB
    }
  }
`;

const REGISTRAR_EMPLEADO_USUARIO = gql`
  mutation RegistrarEmpleadoUsuario(
    $nombre: String!, $apellido: String!, $numeroDocumento: String!,
    $tipoDocumento: String!, $fechaIngreso: Date!, $salario: Decimal!,
    $correo: String!, $contrasena: String!
  ) {
    registrarEmpleadoUsuario(
      nombre: $nombre, apellido: $apellido, numeroDocumento: $numeroDocumento,
      tipoDocumento: $tipoDocumento, fechaIngreso: $fechaIngreso, salario: $salario,
      correo: $correo, contrasena: $contrasena
    ) {
      usuario {
        idUsuario
        correo
        idEmpleado {
          idEmpleado
        }
      }
    }
  }
`;

const CREAR_RESPONSABLE = gql`
  mutation CrearResponsable($codEstprog: String!, $codEmp: Int!, $tipoPer: String!, $fecha: Date!) {
    crearResponsable(codEstprog: $codEstprog, codEmp: $codEmp, tipoPer: $tipoPer, fecha: $fecha) {
      responsable {
        codResp
      }
    }
  }
`;

const DAR_DE_BAJA_RESPONSABLE = gql`
  mutation DarDeBajaResponsable($codResp: Int!) {
    darDeBajaResponsable(codResp: $codResp) {
      responsable {
        codResp
        aB
      }
    }
  }
`;

const EDITAR_USUARIO = gql`
  mutation EditarUsuario($idUsuario: Int!, $estado: String) {
    editarUsuario(idUsuario: $idUsuario, estado: $estado) {
      usuario {
        idUsuario
        estado
      }
    }
  }
`;

const ASIGNAR_ROL_PERMISO_USUARIO = gql`
  mutation AsignarRolPermisoUsuario($idUsuario: Int!, $idRol: Int!, $idPermiso: Int!, $estado: Boolean) {
    asignarRolPermisoUsuario(idUsuario: $idUsuario, idRol: $idRol, idPermiso: $idPermiso, estado: $estado) {
      rolPermisoUsuario {
        id
        estado
      }
    }
  }
`;

const TIPO_DOCS = [
  { value: 'DNI', label: 'DNI (Cédula de Identidad)' },
  { value: 'CE', label: 'Carné de Extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' }
];

export default function Usuarios() {
  const currentUserEmail = localStorage.getItem('userEmail') || '';

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [showRespModal, setShowRespModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null);
  const [empleadoParaResponsable, setEmpleadoParaResponsable] = useState<any>(null);

  // Form states
  const [formUsr, setFormUsr] = useState({
    nombre: '',
    apellido: '',
    numeroDocumento: '',
    tipoDocumento: 'DNI',
    fechaIngreso: '',
    salario: '',
    correo: '',
    contrasena: '',
    hacerResponsable: false,
    codEstprog: ''
  });

  const [formResp, setFormResp] = useState({
    codEstprog: '',
    tipoPer: '2', // 2 = Responsable
    fecha: new Date().toISOString().split('T')[0]
  });

  const [formPerm, setFormPerm] = useState({
    idRol: '',
    idPermiso: ''
  });

  // Apollo queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_USUARIOS_DATA);

  const [registrarEmpleadoUsuario] = useMutation(REGISTRAR_EMPLEADO_USUARIO);
  const [crearResponsable] = useMutation(CREAR_RESPONSABLE);
  const [darDeBajaResponsable] = useMutation(DAR_DE_BAJA_RESPONSABLE);
  const [editarUsuario] = useMutation(EDITAR_USUARIO);
  const [asignarRolPermisoUsuario] = useMutation(ASIGNAR_ROL_PERMISO_USUARIO);

  // Submit new employee + user creation
  const handleRegistrar = async () => {
    const { nombre, apellido, numeroDocumento, tipoDocumento, fechaIngreso, salario, correo, contrasena, hacerResponsable, codEstprog } = formUsr;
    
    if (!nombre || !apellido || !numeroDocumento || !tipoDocumento || !fechaIngreso || !salario || !correo || !contrasena) {
      alert('Por favor complete todos los campos obligatorios (*).');
      return;
    }

    if (hacerResponsable && !codEstprog) {
      alert('Por favor especifique el código de programa para el responsable.');
      return;
    }

    try {
      const res = await registrarEmpleadoUsuario({
        variables: {
          nombre,
          apellido,
          numeroDocumento,
          tipoDocumento,
          fechaIngreso,
          salario: parseFloat(salario),
          correo,
          contrasena
        }
      });

      const nuevoUsrObj = res.data?.registrarEmpleadoUsuario?.usuario;
      const nuevoEmpId = nuevoUsrObj?.idEmpleado?.idEmpleado;

      // Si se activó "Hacer Responsable", crear el responsable inmediatamente
      if (hacerResponsable && nuevoEmpId) {
        await crearResponsable({
          variables: {
            codEstprog,
            codEmp: parseInt(String(nuevoEmpId)),
            tipoPer: '2',
            fecha: fechaIngreso
          }
        });
      }

      setShowModal(false);
      setFormUsr({
        nombre: '',
        apellido: '',
        numeroDocumento: '',
        tipoDocumento: 'DNI',
        fechaIngreso: '',
        salario: '',
        correo: '',
        contrasena: '',
        hacerResponsable: false,
        codEstprog: ''
      });
      refetch();
      alert('✅ Empleado y usuario registrados exitosamente.');
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Convert employee to responsible
  const handleAsignarResponsable = async () => {
    if (!formResp.codEstprog) {
      alert('Ingrese el código de programa.');
      return;
    }

    try {
      await crearResponsable({
        variables: {
          codEstprog: formResp.codEstprog,
          codEmp: parseInt(String(empleadoParaResponsable.idEmpleado)),
          tipoPer: formResp.tipoPer,
          fecha: formResp.fecha
        }
      });

      setShowRespModal(false);
      setEmpleadoParaResponsable(null);
      setFormResp({
        codEstprog: '',
        tipoPer: '2',
        fecha: new Date().toISOString().split('T')[0]
      });
      refetch();
      alert('✅ El empleado ahora es responsable de programa.');
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Decommission responsible (Dar de baja)
  const handleBajaResponsable = async (codResp: number) => {
    if (!window.confirm('¿Está seguro de dar de baja a este responsable de programa?')) return;
    try {
      await darDeBajaResponsable({
        variables: {
          codResp: parseInt(String(codResp))
        }
      });
      refetch();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Edit User account status
  const handleCambiarEstado = async (idUsuario: number, nuevoEstado: string, correo: string) => {
    if (correo === currentUserEmail) {
      alert('No puedes desactivar o bloquear tu propia cuenta de usuario.');
      return;
    }

    try {
      await editarUsuario({
        variables: {
          idUsuario: parseInt(String(idUsuario)),
          estado: nuevoEstado
        }
      });
      refetch();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Assign Role and Permission to a User
  const handleAsignarPermiso = async () => {
    if (!usuarioSeleccionado) return;
    if (!formPerm.idRol || !formPerm.idPermiso) {
      alert('Por favor seleccione un Rol y un Permiso.');
      return;
    }

    try {
      await asignarRolPermisoUsuario({
        variables: {
          idUsuario: parseInt(String(usuarioSeleccionado.idUsuario)),
          idRol: parseInt(formPerm.idRol),
          idPermiso: parseInt(formPerm.idPermiso),
          estado: true
        }
      });
      
      // Actualizar el estado local para ver el cambio reflejado de inmediato
      const prevSelId = usuarioSeleccionado.idUsuario;
      refetch().then((newVal) => {
        const updatedUsr = newVal.data?.todosUsuarios?.find((u: any) => u.idUsuario === prevSelId);
        if (updatedUsr) setUsuarioSeleccionado(updatedUsr);
      });
      
      setFormPerm({ idRol: '', idPermiso: '' });
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Revoke Role and Permission from a User
  const handleRevocarPermiso = async (idRol: number, idPermiso: number, nombreRol: string) => {
    if (!usuarioSeleccionado) return;

    // Medida de seguridad: impedir que el usuario actual se quite su rol de Administrador
    if (usuarioSeleccionado.correo === currentUserEmail && nombreRol.toLowerCase() === 'administrador') {
      if (!window.confirm('⚠️ Está a punto de revocar su propio permiso de Administrador. Esto podría dejarlo sin acceso a ciertas secciones del sistema. ¿Desea continuar?')) {
        return;
      }
    }

    try {
      await asignarRolPermisoUsuario({
        variables: {
          idUsuario: parseInt(String(usuarioSeleccionado.idUsuario)),
          idRol: parseInt(String(idRol)),
          idPermiso: parseInt(String(idPermiso)),
          estado: false
        }
      });
      
      const prevSelId = usuarioSeleccionado.idUsuario;
      refetch().then((newVal) => {
        const updatedUsr = newVal.data?.todosUsuarios?.find((u: any) => u.idUsuario === prevSelId);
        if (updatedUsr) setUsuarioSeleccionado(updatedUsr);
      });
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Helpers to check if user's employee is active responsible
  const getResponsableStatus = (idEmpleado: number) => {
    if (!data?.todosResponsables) return null;
    return data.todosResponsables.find(
      (r: any) => r.codEmp?.idEmpleado === idEmpleado && r.aB === 'A'
    );
  };

  if (loading) return <div className="loading">Cargando personal, usuarios y permisos...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 Personal, Usuarios y Permisos</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Registrar Personal
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: usuarioSeleccionado ? '1.5fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Tabla principal de usuarios */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Correo Usuario</th>
                <th>Empleado Asociado</th>
                <th>Cargo</th>
                <th>Responsable Programa</th>
                <th>Estado Cuenta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data?.todosUsuarios?.map((u: any) => {
                const isMe = u.correo === currentUserEmail;
                const respObj = getResponsableStatus(u.idEmpleado?.idEmpleado);
                const isSelected = usuarioSeleccionado?.idUsuario === u.idUsuario;

                return (
                  <tr
                    key={u.idUsuario}
                    onClick={() => setUsuarioSeleccionado(u)}
                    style={{ cursor: 'pointer', background: isSelected ? '#e8f4fd' : 'white' }}
                  >
                    <td><strong>#{u.idUsuario}</strong></td>
                    <td>
                      {u.correo} {isMe && <strong style={{ color: '#3b82f6', fontSize: '0.8rem' }}>(Tú)</strong>}
                    </td>
                    <td>
                      {u.idEmpleado ? `${u.idEmpleado.nombre} ${u.idEmpleado.apellido}` : '-'}
                    </td>
                    <td>{u.idEmpleado?.cargo || 'Sin definir'}</td>
                    <td>
                      {respObj ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                            Prog. {respObj.codEstprog}
                          </span>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '1px 5px', fontSize: '0.7rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBajaResponsable(respObj.codResp);
                            }}
                          >
                            Dar de Baja
                          </button>
                        </div>
                      ) : u.idEmpleado ? (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmpleadoParaResponsable(u.idEmpleado);
                            setFormResp(prev => ({ ...prev, codEstprog: '' }));
                            setShowRespModal(true);
                          }}
                        >
                          Hacer Responsable
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        value={u.estado}
                        className="badge"
                        style={{
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.75rem',
                          background: u.estado === 'ACTIVO' ? '#d4edda' : u.estado === 'INACTIVO' ? '#e2e3e5' : '#f8d7da',
                          color: u.estado === 'ACTIVO' ? '#155724' : u.estado === 'INACTIVO' ? '#383d41' : '#721c24',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isMe ? 'not-allowed' : 'pointer'
                        }}
                        disabled={isMe}
                        onChange={(e) => handleCambiarEstado(u.idUsuario, e.target.value, u.correo)}
                      >
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                        <option value="BLOQUEADO">Bloqueado</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-info btn-sm">Permisos</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Panel lateral derecho de permisos */}
        {usuarioSeleccionado && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a3c6e', margin: 0 }}>
                🛡️ Permisos de {usuarioSeleccionado.idEmpleado?.nombre}
              </h3>
              <button
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer' }}
                onClick={() => setUsuarioSeleccionado(null)}
              >
                ×
              </button>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Correo de cuenta: <strong>{usuarioSeleccionado.correo}</strong>
            </p>

            {/* Listado de roles y permisos activos */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="section-title" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                Roles y Permisos Asignados:
              </div>
              
              {(!usuarioSeleccionado.rolesPermisos || usuarioSeleccionado.rolesPermisos.filter((rp: any) => rp.estado).length === 0) ? (
                <p style={{ fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic', margin: '0.5rem 0' }}>
                  El usuario no tiene ningún rol o permiso asignado.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {(() => {
                    const activeRp = usuarioSeleccionado.rolesPermisos.filter((rp: any) => rp.estado);
                    const groupedByRol: Record<number, { rol: any; permisos: { idPermiso: number; nombre: string }[] }> = {};
                    
                    activeRp.forEach((rp: any) => {
                      const rolId = rp.idRol.idRol;
                      if (!groupedByRol[rolId]) {
                        groupedByRol[rolId] = {
                          rol: rp.idRol,
                          permisos: []
                        };
                      }
                      if (!groupedByRol[rolId].permisos.some(p => p.idPermiso === rp.idPermiso.idPermiso)) {
                        groupedByRol[rolId].permisos.push({
                          idPermiso: rp.idPermiso.idPermiso,
                          nombre: rp.idPermiso.nombre
                        });
                      }
                    });

                    return Object.values(groupedByRol).map((group: any) => (
                      <div
                        key={group.rol.idRol}
                        style={{
                          background: '#f8fafc',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a3c6e', marginBottom: '0.4rem' }}>
                          🔑 {group.rol.nombre}
                          {group.rol.descripcion && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#64748b', marginLeft: '0.4rem' }}>
                              ({group.rol.descripcion})
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {group.permisos.map((perm: any) => (
                            <span
                              key={perm.idPermiso}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                backgroundColor: '#e2faf0',
                                color: '#065f46',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 500,
                                border: '1px solid #a7f3d0'
                              }}
                            >
                              {perm.nombre}
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#047857',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  padding: 0,
                                  lineHeight: 1,
                                  marginLeft: '2px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '12px',
                                  height: '12px'
                                }}
                                title={`Revocar permiso ${perm.nombre}`}
                                onClick={() => handleRevocarPermiso(group.rol.idRol, perm.idPermiso, group.rol.nombre)}
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Asignación rápida de Rol + Permiso */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <div className="section-title" style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px' }}>
                Asignar Nuevo Rol y Permiso:
              </div>
              
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Seleccionar Rol *</label>
                <select
                  value={formPerm.idRol}
                  onChange={e => setFormPerm({ ...formPerm, idRol: e.target.value })}
                >
                  <option value="">Seleccione...</option>
                  {data?.todosRoles?.map((r: any) => (
                    <option key={r.idRol} value={r.idRol}>
                      {r.nombre} ({r.descripcion || 'Sin descripción'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Seleccionar Permiso *</label>
                <select
                  value={formPerm.idPermiso}
                  onChange={e => setFormPerm({ ...formPerm, idPermiso: e.target.value })}
                >
                  <option value="">Seleccione...</option>
                  {data?.todosPermisos?.map((p: any) => (
                    <option key={p.idPermiso} value={p.idPermiso}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.55rem' }}
                onClick={handleAsignarPermiso}
              >
                + Asignar Permiso
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MODAL: NUEVO EMPLEADO Y USUARIO ==================== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: '650px', maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Registrar Nuevo Empleado y Cuenta</h2>
            
            <div className="form-grid">
              <div className="section-label" style={{ gridColumn: '1 / -1', margin: '0.25rem 0' }}>Datos Personales del Empleado</div>
              
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej. Juan"
                  value={formUsr.nombre}
                  onChange={e => setFormUsr({ ...formUsr, nombre: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Apellido *</label>
                <input
                  type="text"
                  placeholder="Ej. Pérez"
                  value={formUsr.apellido}
                  onChange={e => setFormUsr({ ...formUsr, apellido: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Tipo Documento *</label>
                <select
                  value={formUsr.tipoDocumento}
                  onChange={e => setFormUsr({ ...formUsr, tipoDocumento: e.target.value })}
                >
                  {TIPO_DOCS.map(td => (
                    <option key={td.value} value={td.value}>{td.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Nro. de Documento *</label>
                <input
                  type="text"
                  placeholder="Ej. 1234567"
                  value={formUsr.numeroDocumento}
                  onChange={e => setFormUsr({ ...formUsr, numeroDocumento: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Fecha de Ingreso *</label>
                <input
                  type="date"
                  value={formUsr.fechaIngreso}
                  onChange={e => setFormUsr({ ...formUsr, fechaIngreso: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Salario Mensual (Bs.) *</label>
                <input
                  type="number"
                  placeholder="Ej. 6500"
                  value={formUsr.salario}
                  onChange={e => setFormUsr({ ...formUsr, salario: e.target.value })}
                />
              </div>

              <div className="section-label" style={{ gridColumn: '1 / -1', margin: '0.5rem 0 0.25rem 0' }}>Datos de la Cuenta de Acceso</div>

              <div className="form-group">
                <label>Correo Electrónico *</label>
                <input
                  type="email"
                  placeholder="juan@activo.com"
                  value={formUsr.correo}
                  onChange={e => setFormUsr({ ...formUsr, correo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  placeholder="Escriba contraseña temporal"
                  value={formUsr.contrasena}
                  onChange={e => setFormUsr({ ...formUsr, contrasena: e.target.value })}
                />
              </div>

              {/* Opción Responsable */}
              <div className="form-group form-group-full" style={{ flexDirection: 'row', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="chkResp"
                  style={{ width: 'auto', cursor: 'pointer' }}
                  checked={formUsr.hacerResponsable}
                  onChange={e => setFormUsr({ ...formUsr, hacerResponsable: e.target.checked })}
                />
                <label htmlFor="chkResp" style={{ cursor: 'pointer', margin: 0 }}>
                  <strong>¿Asignar inmediatamente como Responsable de Programa?</strong>
                </label>
              </div>

              {formUsr.hacerResponsable && (
                <div className="form-group form-group-full" style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label>Código de Programa (Estudio Programático) *</label>
                  <input
                    type="text"
                    placeholder="Ej. 1221"
                    value={formUsr.codEstprog}
                    onChange={e => setFormUsr({ ...formUsr, codEstprog: e.target.value })}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Esto creará el registro del responsable de programa para que el empleado pueda recibir asignaciones.
                  </span>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleRegistrar}>
                Registrar Empleado y Cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ASIGNAR RESPONSABLE POST-CREACIÓN ==================== */}
      {showRespModal && empleadoParaResponsable && (
        <div className="modal-overlay" onClick={() => setShowRespModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Asignar como Responsable</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Convertir al empleado: <strong>{empleadoParaResponsable.nombre} {empleadoParaResponsable.apellido}</strong> en responsable.
            </p>

            <div className="form-group">
              <label>Código de Programa (Estudio Programático) *</label>
              <input
                type="text"
                placeholder="Ej. 1221"
                value={formResp.codEstprog}
                onChange={e => setFormResp({ ...formResp, codEstprog: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Fecha de Asignación *</label>
              <input
                type="date"
                value={formResp.fecha}
                onChange={e => setFormResp({ ...formResp, fecha: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRespModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleAsignarResponsable}>
                Asignar Responsable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
