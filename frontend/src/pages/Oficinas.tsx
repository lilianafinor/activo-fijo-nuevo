import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_OFICINAS } from '../graphql/queries';
import { CREAR_OFIC, ELIMINAR_OFIC } from '../graphql/mutations';

const buildTree = (oficinas: any[]) => {
  const map: Record<number, any> = {};
  const roots: any[] = [];
  oficinas.forEach(o => { map[o.codOfic] = { ...o, children: [] }; });
  oficinas.forEach(o => {
    if (o.codPadre) {
      map[o.codPadre.codOfic]?.children.push(map[o.codOfic]);
    } else {
      roots.push(map[o.codOfic]);
    }
  });
  return roots;
};

const nivelNombre: Record<number, string> = {
  1: 'Campus / Institución',
  2: 'Edificio / Facultad',
  3: 'Unidad / Departamento',
};

const OficinFila = ({ oficina, onEliminar }: { oficina: any; onEliminar: (id: number) => void }) => {
  const sangria = ((oficina.nivel || 1) - 1) * 28;
  const prefijos = ['', '├─ ', '└── '];
  const prefijo = prefijos[Math.min((oficina.nivel || 1) - 1, 2)];

  return (
    <>
      <tr style={{ backgroundColor: oficina.nivel === 1 ? '#f0f4ff' : oficina.nivel === 2 ? '#f8fff8' : 'white' }}>
        <td>
          <div style={{ paddingLeft: sangria, fontWeight: oficina.nivel === 1 ? 700 : 400, color: oficina.nivel === 1 ? '#1a3c6e' : oficina.nivel === 2 ? '#2d6a4f' : '#333' }}>
            <span style={{ color: '#bbb', marginRight: 4 }}>{prefijo}</span>
            {oficina.desDpto}
          </div>
        </td>
        <td>{oficina.codDpto}</td>
        <td>
          <span className={`badge ${oficina.nivel === 1 ? 'badge-info' : oficina.nivel === 2 ? 'badge-success' : 'badge-secondary'}`}>
            {nivelNombre[oficina.nivel] || `Nivel ${oficina.nivel}`}
          </span>
        </td>
        <td><span className={`badge ${oficina.aB === 'A' ? 'badge-success' : 'badge-danger'}`}>{oficina.aB === 'A' ? 'Activo' : 'Baja'}</span></td>
        <td>
          <button className="btn btn-danger btn-sm" onClick={() => onEliminar(oficina.codOfic)}>Eliminar</button>
        </td>
      </tr>
      {oficina.children?.map((hijo: any) => (
        <OficinFila key={hijo.codOfic} oficina={hijo} onEliminar={onEliminar} />
      ))}
    </>
  );
};

export default function Oficinas() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ codDpto: '', desDpto: '', codPadre: '', nivel: '1', aB: 'A' });

  const { data, loading, error, refetch } = useQuery(GET_OFICINAS);
  const [crearOfic] = useMutation(CREAR_OFIC);
  const [eliminarOfic] = useMutation(ELIMINAR_OFIC);

  const handleSubmit = async () => {
    if (!form.codDpto || !form.desDpto) { alert('Complete los campos obligatorios'); return; }
    try {
      await crearOfic({ variables: {
        codDpto: form.codDpto, desDpto: form.desDpto, codGest: 1,
        codPadre: form.codPadre ? parseInt(form.codPadre) : null,
        nivel: parseInt(form.nivel), aB: form.aB
      }});
      setShowModal(false); setForm({ codDpto: '', desDpto: '', codPadre: '', nivel: '1', aB: 'A' }); refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleEliminar = async (codOfic: number) => {
    if (!window.confirm('¿Eliminar esta oficina?')) return;
    await eliminarOfic({ variables: { codOfic } }); refetch();
  };

  const tree = data ? buildTree(data.todasOficinas) : [];

  if (loading) return <div className="loading">Cargando oficinas...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏛️ Oficinas / Unidades</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nueva Oficina</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <span className="badge badge-info">Nivel 1 — Campus / Institución</span>
        <span className="badge badge-success">Nivel 2 — Edificio / Facultad</span>
        <span className="badge badge-secondary">Nivel 3 — Unidad / Departamento</span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Código</th>
              <th>Nivel</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tree.length === 0 && <tr><td colSpan={5} className="empty">No hay oficinas registradas</td></tr>}
            {tree.map((o: any) => <OficinFila key={o.codOfic} oficina={o} onEliminar={handleEliminar} />)}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Nueva Oficina / Unidad</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nivel *</label>
                <select value={form.nivel} onChange={e => setForm({...form, nivel: e.target.value, codPadre: ''})}>
                  <option value="1">Nivel 1 — Campus / Institución</option>
                  <option value="2">Nivel 2 — Edificio / Facultad</option>
                  <option value="3">Nivel 3 — Unidad / Departamento</option>
                </select>
              </div>
              <div className="form-group">
                <label>Código *</label>
                <input value={form.codDpto} onChange={e => setForm({...form, codDpto: e.target.value})} placeholder="Ej: 01" />
              </div>
              <div className="form-group form-group-full">
                <label>Descripción *</label>
                <input value={form.desDpto} onChange={e => setForm({...form, desDpto: e.target.value})} placeholder="Nombre de la oficina" />
              </div>
              {parseInt(form.nivel) > 1 && (
                <div className="form-group form-group-full">
                  <label>Oficina Padre *</label>
                  <select value={form.codPadre} onChange={e => setForm({...form, codPadre: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {data?.todasOficinas?.filter((o: any) => o.nivel === parseInt(form.nivel) - 1).map((o: any) => (
                      <option key={o.codOfic} value={o.codOfic}>{o.desDpto}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Estado</label>
                <select value={form.aB} onChange={e => setForm({...form, aB: e.target.value})}>
                  <option value="A">Activo</option>
                  <option value="B">Baja</option>
                </select>
              </div>
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