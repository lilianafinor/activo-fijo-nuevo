import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_PROVEDORES = gql`
  query { todosProvedores { codProv nombre direccion telefono ruc ciudad } }
`;
const CREAR_PROV = gql`
  mutation CrearProvedor($nombre: String!, $direccion: String, $telefono: String, $ruc: String, $ciudad: String) {
    crearProvedor(nombre: $nombre, direccion: $direccion, telefono: $telefono, ruc: $ruc, ciudad: $ciudad) {
      provedor { codProv nombre }
    }
  }
`;
const EDITAR_PROV = gql`
  mutation EditarProvedor($codProv: Int!, $nombre: String, $direccion: String, $telefono: String, $ruc: String, $ciudad: String) {
    editarProvedor(codProv: $codProv, nombre: $nombre, direccion: $direccion, telefono: $telefono, ruc: $ruc, ciudad: $ciudad) {
      provedor { codProv nombre }
    }
  }
`;
const ELIMINAR_PROV = gql`
  mutation($codProv: Int!) { eliminarProvedor(codProv: $codProv) { ok } }
`;

const VACIO = { nombre: '', direccion: '', telefono: '', ruc: '', ciudad: '' };

export default function Proveedores() {
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState<any>(VACIO);

  const { data, loading, error, refetch } = useQuery(GET_PROVEDORES);
  const [crearProv] = useMutation(CREAR_PROV);
  const [editarProv] = useMutation(EDITAR_PROV);
  const [eliminarProv] = useMutation(ELIMINAR_PROV);

  const abrirNuevo = () => { setEditando(null); setForm(VACIO); setShowModal(true); };
  const abrirEditar = (p: any) => {
    setEditando(p);
    setForm({ nombre: p.nombre, direccion: p.direccion || '', telefono: p.telefono || '', ruc: p.ruc || '', ciudad: p.ciudad || '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editando) {
        await editarProv({ variables: { codProv: editando.codProv, ...form } });
      } else {
        await crearProv({ variables: form });
      }
      setShowModal(false); refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏢 Proveedores</h1>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo Proveedor</button>
      </div>
      <div className="table-container">
        <table>
          <thead><tr><th>Nro.</th><th>Nombre</th><th>RUC/NIT</th><th>Teléfono</th><th>Ciudad</th><th>Dirección</th><th>Acciones</th></tr></thead>
          <tbody>
            {data?.todosProvedores?.length === 0 && <tr><td colSpan={7} className="empty">No hay proveedores</td></tr>}
            {data?.todosProvedores?.map((p: any) => (
              <tr key={p.codProv}>
                <td><strong>#{p.codProv}</strong></td>
                <td>{p.nombre}</td>
                <td>{p.ruc || '-'}</td>
                <td>{p.telefono || '-'}</td>
                <td>{p.ciudad || '-'}</td>
                <td>{p.direccion || '-'}</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-warning btn-sm" onClick={() => abrirEditar(p)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={async () => { if (window.confirm('¿Eliminar?')) { await eliminarProv({ variables: { codProv: p.codProv } }); refetch(); } }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
            <div className="form-grid">
              <div className="form-group form-group-full"><label>Nombre *</label><input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
              <div className="form-group"><label>RUC / NIT</label><input value={form.ruc} onChange={e => setForm({...form, ruc: e.target.value})} /></div>
              <div className="form-group"><label>Teléfono</label><input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} /></div>
              <div className="form-group"><label>Ciudad</label><input value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} /></div>
              <div className="form-group form-group-full"><label>Dirección</label><input value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}