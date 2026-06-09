import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_TRANSFERENCIAS = gql`
  query {
    todasTransferencias {
      codTransf fechaTransf estado
      codOfiRem { desDpto }
      codOfiDest { desDpto }
    }
  }
`;

const GET_CATS = gql`
  query {
    todosActivos { nroActivo codActivo descripcion }
    todasOficinas { codOfic desDpto }
  }
`;

const CREAR_TRANSF = gql`
  mutation CrearTransferencia(
    $tipoTransf: String!, $codOfiRem: Int!, $codOfiDest: Int!, $fechaTransf: Date!
  ) {
    crearTransferencia(
      tipoTransf: $tipoTransf, codOfiRem: $codOfiRem, codOfiDest: $codOfiDest,
      fechaTransf: $fechaTransf
    ) { transferido { codTransf fechaTransf } }
  }
`;

const AGREGAR_ACT_TRANSF = gql`
  mutation AgregarActivoTransferencia($codTransf: Int!, $nroActivo: Int!, $cantidad: Int) {
    agregarActivoTransferencia(codTransf: $codTransf, nroActivo: $nroActivo, cantidad: $cantidad) {
      detTranf { codTransf { codTransf } }
    }
  }
`;

const estadoLabel: Record<string, string> = { 'P': 'Pendiente', 'A': 'Aprobado', 'C': 'Completado', 'R': 'Rechazado' };
const estadoClass: Record<string, string> = { 'P': 'badge-warning', 'A': 'badge-success', 'C': 'badge-info', 'R': 'badge-danger' };

export default function Transferencias() {
  const [showModal, setShowModal] = useState(false);
  const [transfCreada, setTransfCreada] = useState<number | null>(null);
  const [form, setForm] = useState({ codOfiRem: '', codOfiDest: '', fechaTransf: '' });
  const [nroActivoTransf, setNroActivoTransf] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_TRANSFERENCIAS);
  const { data: cats } = useQuery(GET_CATS);
  const [crearTransf] = useMutation(CREAR_TRANSF);
  const [agregarActivo] = useMutation(AGREGAR_ACT_TRANSF);

  // Abrir modal para transferencia EXISTENTE
  const handleAbrirExistente = (codTransf: number) => {
    setTransfCreada(codTransf);
    setNroActivoTransf('');
    setShowModal(true);
  };

  // Abrir modal para transferencia NUEVA
  const handleNueva = () => {
    setTransfCreada(null);
    setNroActivoTransf('');
    setForm({ codOfiRem: '', codOfiDest: '', fechaTransf: '' });
    setShowModal(true);
  };

  const handleCrear = async () => {
    if (!form.codOfiRem || !form.codOfiDest || !form.fechaTransf) { alert('Complete los campos obligatorios'); return; }
    try {
      const res = await crearTransf({ variables: {
        tipoTransf: 'T',
        codOfiRem: parseInt(form.codOfiRem),
        codOfiDest: parseInt(form.codOfiDest),
        fechaTransf: form.fechaTransf,
      }});
      setTransfCreada(res.data?.crearTransferencia?.transferido?.codTransf);
      refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleAgregar = async () => {
    if (!transfCreada || !nroActivoTransf) { alert('Seleccione un activo'); return; }
    try {
      await agregarActivo({ variables: { codTransf: parseInt(String(transfCreada)), nroActivo: parseInt(nroActivoTransf), cantidad: 1 }});
      alert('Activo agregado a la transferencia #' + transfCreada);
      setShowModal(false);
      setTransfCreada(null);
      setForm({ codOfiRem: '', codOfiDest: '', fechaTransf: '' });
      setNroActivoTransf('');
      refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setTransfCreada(null);
    setForm({ codOfiRem: '', codOfiDest: '', fechaTransf: '' });
    setNroActivoTransf('');
  };

  if (loading) return <div className="loading">Cargando transferencias...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔄 Transferencias</h1>
        <button className="btn btn-primary" onClick={handleNueva}>+ Nueva Transferencia</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nro.</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.todasTransferencias?.length === 0 && (
              <tr><td colSpan={6} className="empty">No hay transferencias</td></tr>
            )}
            {data?.todasTransferencias?.map((t: any) => (
              <tr key={t.codTransf}>
                <td><strong>#{t.codTransf}</strong></td>
                <td>{t.codOfiRem?.desDpto || '-'}</td>
                <td>{t.codOfiDest?.desDpto || '-'}</td>
                <td>{t.fechaTransf || '-'}</td>
                <td>
                  <span className={`badge ${estadoClass[t.estado] || 'badge-secondary'}`}>
                    {estadoLabel[t.estado] || t.estado}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => handleAbrirExistente(t.codTransf)}
                  >
                    + Agregar Activo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCerrarModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              {transfCreada ? `Transferencia #${transfCreada} — Agregar Activo` : 'Nueva Transferencia'}
            </h2>

            {!transfCreada ? (
              <>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Oficina Origen *</label>
                    <select value={form.codOfiRem} onChange={e => setForm({...form, codOfiRem: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      {cats?.todasOficinas?.map((o: any) => (
                        <option key={o.codOfic} value={o.codOfic}>{o.desDpto}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Oficina Destino *</label>
                    <select value={form.codOfiDest} onChange={e => setForm({...form, codOfiDest: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      {cats?.todasOficinas?.map((o: any) => (
                        <option key={o.codOfic} value={o.codOfic}>{o.desDpto}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha *</label>
                    <input type="date" value={form.fechaTransf} onChange={e => setForm({...form, fechaTransf: e.target.value})} />
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={handleCerrarModal}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleCrear}>Crear →</button>
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Activo *</label>
                  <select value={nroActivoTransf} onChange={e => setNroActivoTransf(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {cats?.todosActivos?.map((a: any) => (
                      <option key={a.nroActivo} value={a.nroActivo}>{a.codActivo} — {a.descripcion}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={handleCerrarModal}>Cerrar</button>
                  <button className="btn btn-primary" onClick={handleAgregar}>Agregar Activo</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}