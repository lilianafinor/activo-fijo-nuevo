import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_ASIGNACIONES = gql`
  query {
    todasAsignaciones {
      codAsig fechaAsig fechaFin estado
      tipoAsig { des }
      codOfic { desDpto }
    }
  }
`;

const GET_CATS = gql`
  query {
    todosActivos { nroActivo codActivo descripcion }
    todasOficinas { codOfic desDpto }
  }
`;

const CREAR_ASIG = gql`
  mutation CrearAsignacion($tipoAsig: Int!, $tipoResp: Int!, $codResp: Int!, $codOfic: Int!, $fechaAsig: Date!) {
    crearAsignacion(tipoAsig: $tipoAsig, tipoResp: $tipoResp, codResp: $codResp, codOfic: $codOfic, fechaAsig: $fechaAsig) {
      asignado { codAsig fechaAsig }
    }
  }
`;

const ASIGNAR_ACTIVO = gql`
  mutation AsignarActivo($codAsig: Int!, $nroActivo: Int!, $cantidad: Int) {
    asignarActivo(codAsig: $codAsig, nroActivo: $nroActivo, cantidad: $cantidad) {
      detAsig { codAsig { codAsig } nroActivo { codActivo } }
    }
  }
`;

export default function Asignaciones() {
  const [showModal, setShowModal] = useState(false);
  const [codAsigCreado, setCodAsigCreado] = useState<number | null>(null);
  const [form, setForm] = useState({ codOfic: '', fechaAsig: '' });
  const [nroActivoAsig, setNroActivoAsig] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_ASIGNACIONES);
  const { data: cats } = useQuery(GET_CATS);
  const [crearAsig] = useMutation(CREAR_ASIG);
  const [asignarActivo] = useMutation(ASIGNAR_ACTIVO);

  const handleCrear = async () => {
    if (!form.codOfic || !form.fechaAsig) { alert('Complete los campos obligatorios'); return; }
    try {
      const res = await crearAsig({ variables: {
        tipoAsig: 1, tipoResp: 1, codResp: 1,
        codOfic: parseInt(form.codOfic),
        fechaAsig: form.fechaAsig,
      }});
      setCodAsigCreado(res.data?.crearAsignacion?.asignado?.codAsig);
      refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleAsignarActivo = async () => {
    if (!codAsigCreado || !nroActivoAsig) { alert('Seleccione un activo'); return; }
    try {
      await asignarActivo({ variables: { codAsig: parseInt(String(codAsigCreado)), nroActivo: parseInt(nroActivoAsig), cantidad: 1 }});
      alert('✅ Activo asignado correctamente');
      setShowModal(false);
      setCodAsigCreado(null);
      setForm({ codOfic: '', fechaAsig: '' });
      setNroActivoAsig('');
      refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  if (loading) return <div className="loading">Cargando asignaciones...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📌 Asignaciones</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setCodAsigCreado(null); }}>
          + Nueva Asignación
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nro.</th>
              <th>Oficina</th>
              <th>Tipo Asig.</th>
              <th>Fecha Asig.</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {data?.todasAsignaciones?.length === 0 && (
              <tr><td colSpan={5} className="empty">No hay asignaciones registradas</td></tr>
            )}
            {data?.todasAsignaciones?.map((a: any) => (
              <tr key={a.codAsig}>
                <td><strong>#{a.codAsig}</strong></td>
                <td>{a.codOfic?.desDpto || '-'}</td>
                <td>{a.tipoAsig?.des || '-'}</td>
                <td>{a.fechaAsig || '-'}</td>
                <td>
                  <span className={`badge ${a.estado === 'A' ? 'badge-success' : 'badge-secondary'}`}>
                    {a.estado === 'A' ? 'Activo' : a.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Nueva Asignación</h2>

            {!codAsigCreado ? (
              <>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Oficina *</label>
                    <select value={form.codOfic} onChange={e => setForm({...form, codOfic: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      {cats?.todasOficinas?.map((o: any) => (
                        <option key={o.codOfic} value={o.codOfic}>{o.desDpto}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha Asignación *</label>
                    <input type="date" value={form.fechaAsig} onChange={e => setForm({...form, fechaAsig: e.target.value})} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleCrear}>Crear Asignación →</button>
                </div>
              </>
            ) : (
              <>
                <p style={{color: '#2d6a4f', marginBottom: '1rem'}}>
                  ✅ Asignación #{codAsigCreado} creada. Ahora selecciona el activo:
                </p>
                <div className="form-group">
                  <label>Activo a asignar *</label>
                  <select value={nroActivoAsig} onChange={e => setNroActivoAsig(e.target.value)}>
                    <option value="">Seleccionar activo...</option>
                    {cats?.todosActivos?.map((a: any) => (
                      <option key={a.nroActivo} value={a.nroActivo}>{a.codActivo} — {a.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                  <button className="btn btn-success" onClick={handleAsignarActivo}>Asignar Activo</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}