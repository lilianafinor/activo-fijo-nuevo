import PageLayout from '../components/ui/PageLayout';
import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_ACTIVOS_BAJA = gql`
  query {
    todosActivos(soloActivos: false) { nroActivo codActivo descripcion aB codEstado { desEstado } }
  }
`;

const DAR_BAJA = gql`
  mutation DarDeBajaActivo($nroActivo: Int!) {
    darDeBajaActivo(nroActivo: $nroActivo) {
      activo { nroActivo codActivo aB }
    }
  }
`;

export default function Bajas() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nroActivo: '' });

  const { data, loading, error, refetch } = useQuery(GET_ACTIVOS_BAJA);
  const [darBaja] = useMutation(DAR_BAJA);

  const activosBaja = data?.todosActivos?.filter((a: any) => a.aB === 'B') || [];
  const activosDisponibles = data?.todosActivos?.filter((a: any) => a.aB !== 'B') || [];

  const handleSubmit = async () => {
    if (!form.nroActivo) { alert('Seleccione un activo'); return; }
    try {
      await darBaja({ variables: { nroActivo: parseInt(form.nroActivo) } });
      alert('✅ Activo dado de baja correctamente');
      setShowModal(false);
      setForm({ nroActivo: '' });
      refetch();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  if (loading) return <div className="loading">Cargando bajas...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <PageLayout
      title="Baja de Activos"
      actions={[
        { label: 'Nuevo', icon: '+', variant: 'primary' as const, onClick: () => setShowModal(true) },
        { label: 'Actualizar', icon: '↺', onClick: () => refetch() },
      ]}
    >

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nro.</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {activosBaja.length === 0 && (
              <tr><td colSpan={4} className="empty">No hay activos dados de baja</td></tr>
            )}
            {activosBaja.map((b: any) => (
              <tr key={b.nroActivo}>
                <td><strong>#{b.nroActivo}</strong></td>
                <td>{b.codActivo}</td>
                <td>{b.descripcion}</td>
                <td><span className="badge badge-danger">BAJA</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Registrar Baja de Activo</h2>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label>Activo *</label>
                <select value={form.nroActivo} onChange={e => setForm({ ...form, nroActivo: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {activosDisponibles.map((a: any) => (
                    <option key={a.nroActivo} value={a.nroActivo}>
                      {a.codActivo} — {a.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleSubmit}>Registrar Baja</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}