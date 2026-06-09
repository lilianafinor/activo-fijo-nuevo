import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_GRUPOS = gql`
  query { todosGrupos { codGrupo codHijo desGrupo nivel aB codPadre { codGrupo desGrupo } } }
`;
const CREAR_GRUPO = gql`
  mutation CrearGrupo($codHijo: String!, $desGrupo: String, $codGest: Int!, $codPadre: Int, $nivel: Int, $aB: String) {
    crearGrupo(codHijo: $codHijo, desGrupo: $desGrupo, codGest: $codGest, codPadre: $codPadre, nivel: $nivel, aB: $aB) {
      grupo { codGrupo desGrupo }
    }
  }
`;
const ELIMINAR_GRUPO = gql`
  mutation($codGrupo: Int!) { eliminarGrupo(codGrupo: $codGrupo) { ok } }
`;

// Construir árbol desde lista plana
const buildTree = (grupos: any[]) => {
  const map: Record<number, any> = {};
  const roots: any[] = [];
  grupos.forEach(g => { map[g.codGrupo] = { ...g, children: [] }; });
  grupos.forEach(g => {
    if (g.codPadre) {
      map[g.codPadre.codGrupo]?.children.push(map[g.codGrupo]);
    } else {
      roots.push(map[g.codGrupo]);
    }
  });
  return roots;
};

const nivelColores: Record<number, string> = {
  1: '#1a3c6e',
  2: '#2d6a4f',
  3: '#666',
};

const GrupoFila = ({ grupo, onEliminar }: { grupo: any; onEliminar: (id: number) => void }) => {
  const sangria = ((grupo.nivel || 1) - 1) * 24;
  const prefijos = ['', '├─ ', '└── '];
  const prefijo = prefijos[Math.min((grupo.nivel || 1) - 1, 2)];

  return (
    <>
      <tr style={{ backgroundColor: grupo.nivel === 1 ? '#f0f4ff' : grupo.nivel === 2 ? '#f8fff8' : 'white' }}>
        <td>
          <div style={{ paddingLeft: sangria, color: nivelColores[grupo.nivel] || '#333', fontWeight: grupo.nivel === 1 ? 700 : 400 }}>
            <span style={{ color: '#aaa', marginRight: 4 }}>{prefijo}</span>
            {grupo.desGrupo || grupo.codHijo}
          </div>
        </td>
        <td>{grupo.codHijo}</td>
        <td>
          <span className={`badge ${grupo.nivel === 1 ? 'badge-info' : grupo.nivel === 2 ? 'badge-success' : 'badge-secondary'}`}>
            Nivel {grupo.nivel}
          </span>
        </td>
        <td><span className={`badge ${grupo.aB === 'A' ? 'badge-success' : 'badge-danger'}`}>{grupo.aB === 'A' ? 'Activo' : 'Baja'}</span></td>
        <td>
          <button className="btn btn-danger btn-sm" onClick={() => onEliminar(grupo.codGrupo)}>Eliminar</button>
        </td>
      </tr>
      {grupo.children?.map((hijo: any) => (
        <GrupoFila key={hijo.codGrupo} grupo={hijo} onEliminar={onEliminar} />
      ))}
    </>
  );
};

export default function Grupos() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ codHijo: '', desGrupo: '', codPadre: '', nivel: '1', aB: 'A' });

  const { data, loading, error, refetch } = useQuery(GET_GRUPOS);
  const [crearGrupo] = useMutation(CREAR_GRUPO);
  const [eliminarGrupo] = useMutation(ELIMINAR_GRUPO);

  const handleNivelAutomatico = (codPadreId: string) => {
    if (!codPadreId) { setForm(f => ({...f, codPadre: '', nivel: '1'})); return; }
    const padre = data?.todosGrupos?.find((g: any) => g.codGrupo === parseInt(codPadreId));
    const nivelPadre = padre?.nivel || 1;
    setForm(f => ({...f, codPadre: codPadreId, nivel: String(Math.min(nivelPadre + 1, 3))}));
  };

  const handleSubmit = async () => {
    if (!form.codHijo) { alert('El código es obligatorio'); return; }
    try {
      await crearGrupo({ variables: {
        codHijo: form.codHijo, desGrupo: form.desGrupo || null, codGest: 1,
        codPadre: form.codPadre ? parseInt(form.codPadre) : null,
        nivel: parseInt(form.nivel), aB: form.aB
      }});
      setShowModal(false); setForm({ codHijo: '', desGrupo: '', codPadre: '', nivel: '1', aB: 'A' }); refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleEliminar = async (codGrupo: number) => {
    if (!window.confirm('¿Eliminar este grupo?')) return;
    await eliminarGrupo({ variables: { codGrupo } }); refetch();
  };

  const tree = data ? buildTree(data.todosGrupos) : [];

  // Grupos disponibles como padre según nivel seleccionado
  const gruposPadre = data?.todosGrupos?.filter((g: any) => g.nivel < parseInt(form.nivel)) || [];

  if (loading) return <div className="loading">Cargando grupos...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📁 Grupos de Activos</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Grupo</button>
      </div>

      {/* Leyenda de niveles */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <span className="badge badge-info">Nivel 1 — Categoría principal</span>
        <span className="badge badge-success">Nivel 2 — Subcategoría</span>
        <span className="badge badge-secondary">Nivel 3 — Tipo específico</span>
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
            {tree.length === 0 && <tr><td colSpan={5} className="empty">No hay grupos registrados</td></tr>}
            {tree.map((g: any) => <GrupoFila key={g.codGrupo} grupo={g} onEliminar={handleEliminar} />)}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Nuevo Grupo</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nivel *</label>
                <select value={form.nivel} onChange={e => setForm({...form, nivel: e.target.value, codPadre: ''})}>
                  <option value="1">Nivel 1 — Categoría principal</option>
                  <option value="2">Nivel 2 — Subcategoría</option>
                  <option value="3">Nivel 3 — Tipo específico</option>
                </select>
              </div>
              <div className="form-group">
                <label>Código *</label>
                <input value={form.codHijo} onChange={e => setForm({...form, codHijo: e.target.value})} placeholder="Ej: 01" />
              </div>
              <div className="form-group form-group-full">
                <label>Descripción</label>
                <input value={form.desGrupo} onChange={e => setForm({...form, desGrupo: e.target.value})} placeholder="Nombre del grupo" />
              </div>
              {parseInt(form.nivel) > 1 && (
                <div className="form-group form-group-full">
                  <label>Grupo Padre *</label>
                  <select value={form.codPadre} onChange={e => handleNivelAutomatico(e.target.value)}>
                    <option value="">Seleccionar grupo padre...</option>
                    {data?.todosGrupos?.filter((g: any) => g.nivel === parseInt(form.nivel) - 1).map((g: any) => (
                      <option key={g.codGrupo} value={g.codGrupo}>{g.desGrupo || g.codHijo}</option>
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