import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_REVALUOS = gql`
  query {
    todosRevaluos {
      codReval tipoReval documento fechaIni fechaFin estado
    }
  }
`;

const GET_CATALOGOS = gql`
  query {
    todosActivos { nroActivo codActivo descripcion monto codGrupo { codGrupo desGrupo } }
    todosGrupos { codGrupo desGrupo }
  }
`;

const CREAR_REVALUO = gql`
  mutation CrearRevaluo($tipoReval: Int!, $documento: String, $fechaIni: Date!) {
    crearRevaluo(tipoReval: $tipoReval, documento: $documento, fechaIni: $fechaIni) {
      revaluo { codReval tipoReval fechaIni }
    }
  }
`;

const AGREGAR_DET_REVAL = gql`
  mutation AgregarDetRevalConDepreciacion(
    $codReval: Int!, $nroActivo: Int!, $vidaUtilMes: Int!,
    $vidaUtilAno: Int!, $costo: Decimal!, $fechaReval: Date!, $nroSerie: Int!
  ) {
    agregarDetRevalConDepreciacion(
      codReval: $codReval, nroActivo: $nroActivo, vidaUtilMes: $vidaUtilMes,
      vidaUtilAno: $vidaUtilAno, costo: $costo, fechaReval: $fechaReval,
      nroSerie: $nroSerie
    ) {
      detReval { vidaUtilAno costo fechaReval }
      depAcumulada { depresiacion acumulada valorActual }
    }
  }
`;

export default function Revaluos() {
  const [showModal, setShowModal] = useState(false);
  const [showDetModal, setShowDetModal] = useState(false);
  const [revaluoSeleccionado, setRevaluoSeleccionado] = useState<any>(null);
  const [activoSeleccionado, setActivoSeleccionado] = useState<any>(null);
  const [depCalculada, setDepCalculada] = useState<any>(null);

  const [formRevaluo, setFormRevaluo] = useState({ tipoReval: '1', documento: '', fechaIni: '' });
  const [formDet, setFormDet] = useState({ nroActivo: '', vidaUtilMes: '', vidaUtilAno: '', costo: '', fechaReval: '', nroSerie: '1' });

  const { data, loading, error, refetch } = useQuery(GET_REVALUOS);
  const { data: cats } = useQuery(GET_CATALOGOS);
  const [crearRevaluo] = useMutation(CREAR_REVALUO);
  const [agregarDetReval] = useMutation(AGREGAR_DET_REVAL);

  const calcularDep = (costo: string, vidaUtilAno: string, vidaUtilMes: string) => {
    const c = parseFloat(costo);
    const anos = parseInt(vidaUtilAno) || 0;
    const meses = parseInt(vidaUtilMes) || 0;
    const totalMeses = (anos * 12) + meses;
    if (c > 0 && totalMeses > 0) {
      const depMensual = c / totalMeses;
      const depAnual = depMensual * 12;
      setDepCalculada({ depMensual: depMensual.toFixed(2), depAnual: depAnual.toFixed(2), totalMeses });
    } else {
      setDepCalculada(null);
    }
  };

  const handleActivoChange = (nroActivoStr: string) => {
    setFormDet({ ...formDet, nroActivo: nroActivoStr, costo: '', vidaUtilMes: '', vidaUtilAno: '' });
    setDepCalculada(null);
    const activo = cats?.todosActivos?.find((a: any) => a.nroActivo === parseInt(nroActivoStr));
    setActivoSeleccionado(activo);
    if (activo?.monto) {
      const costoLimpio = String(parseFloat(activo.monto));
      setFormDet(prev => ({ ...prev, nroActivo: nroActivoStr, costo: costoLimpio }));
    }
  };

  const handleCrearRevaluo = async () => {
    if (!formRevaluo.fechaIni) { alert('Ingrese la fecha de inicio'); return; }
    try {
      await crearRevaluo({ variables: {
        tipoReval: parseInt(formRevaluo.tipoReval),
        documento: formRevaluo.documento || null,
        fechaIni: formRevaluo.fechaIni,
      }});
      setShowModal(false);
      setFormRevaluo({ tipoReval: '1', documento: '', fechaIni: '' });
      refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleAgregarDet = async () => {
    if (!formDet.nroActivo || !formDet.costo || !formDet.fechaReval) {
      alert('Complete los campos obligatorios');
      return;
    }
    try {
      const res = await agregarDetReval({ variables: {
        codReval: parseInt(revaluoSeleccionado.codReval),
        nroActivo: parseInt(formDet.nroActivo),
        vidaUtilMes: parseInt(formDet.vidaUtilMes) || 0,
        vidaUtilAno: parseInt(formDet.vidaUtilAno) || 0,
        costo: parseFloat(formDet.costo),
        fechaReval: formDet.fechaReval,
        nroSerie: parseInt(formDet.nroSerie),
      }});
      const dep = res.data?.agregarDetRevalConDepreciacion?.depAcumulada;
      if (dep) {
        alert(
          `✅ Revalúo registrado\n` +
          `Depreciación mensual: Bs. ${parseFloat(dep.depresiacion).toFixed(2)}\n` +
          `Acumulada: Bs. ${parseFloat(dep.acumulada).toFixed(2)}\n` +
          `Valor actual: Bs. ${parseFloat(dep.valorActual).toFixed(2)}`
        );
      }
      setShowDetModal(false);
      setFormDet({ nroActivo: '', vidaUtilMes: '', vidaUtilAno: '', costo: '', fechaReval: '', nroSerie: '1' });
      setDepCalculada(null);
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  if (loading) return <div className="loading">Cargando revalúos...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Revalúos y Depreciación</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nuevo Revalúo</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nro.</th>
              <th>Tipo</th>
              <th>Documento</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.todosRevaluos?.length === 0 && (
              <tr><td colSpan={7} className="empty">No hay revalúos registrados</td></tr>
            )}
            {data?.todosRevaluos?.map((r: any) => (
              <tr key={r.codReval}>
                <td><strong>#{r.codReval}</strong></td>
                <td>{r.tipoReval}</td>
                <td>{r.documento || '-'}</td>
                <td>{r.fechaIni || '-'}</td>
                <td>{r.fechaFin || '-'}</td>
                <td>
                  <span className={`badge ${r.estado === 'A' ? 'badge-success' : 'badge-secondary'}`}>
                    {r.estado === 'A' ? 'Activo' : 'Cerrado'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => { setRevaluoSeleccionado(r); setShowDetModal(true); }}
                  >
                    + Agregar Activo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo revalúo */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Nuevo Revalúo</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Tipo Revalúo</label>
                <select value={formRevaluo.tipoReval} onChange={e => setFormRevaluo({...formRevaluo, tipoReval: e.target.value})}>
                  <option value="1">Revalúo Técnico</option>
                  <option value="2">Revalúo Contable</option>
                  <option value="3">Actualización</option>
                </select>
              </div>
              <div className="form-group">
                <label>Documento</label>
                <input
                  value={formRevaluo.documento}
                  onChange={e => setFormRevaluo({...formRevaluo, documento: e.target.value})}
                  placeholder="Nro. resolución"
                />
              </div>
              <div className="form-group">
                <label>Fecha Inicio *</label>
                <input
                  type="date"
                  value={formRevaluo.fechaIni}
                  onChange={e => setFormRevaluo({...formRevaluo, fechaIni: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCrearRevaluo}>Crear Revalúo</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar activo al revalúo */}
      {showDetModal && revaluoSeleccionado && (
        <div className="modal-overlay" onClick={() => setShowDetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Revalúo #{revaluoSeleccionado.codReval} — Agregar Activo</h2>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label>Activo *</label>
                <select value={formDet.nroActivo} onChange={e => handleActivoChange(e.target.value)}>
                  <option value="">Seleccionar activo...</option>
                  {cats?.todosActivos?.map((a: any) => (
                    <option key={a.nroActivo} value={a.nroActivo}>
                      {a.codActivo} — {a.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Costo (Bs.) *</label>
                <input
                  type="number"
                  value={formDet.costo}
                  onChange={e => { setFormDet({...formDet, costo: e.target.value}); calcularDep(e.target.value, formDet.vidaUtilAno, formDet.vidaUtilMes); }}
                  placeholder="Valor actual del activo"
                />
              </div>

              <div className="form-group">
                <label>Fecha Revalúo *</label>
                <input
                  type="date"
                  value={formDet.fechaReval}
                  onChange={e => setFormDet({...formDet, fechaReval: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Vida Útil (años)</label>
                <input
                  type="number"
                  value={formDet.vidaUtilAno}
                  onChange={e => { setFormDet({...formDet, vidaUtilAno: e.target.value}); calcularDep(formDet.costo, e.target.value, formDet.vidaUtilMes); }}
                  placeholder="Ej: 5"
                />
              </div>

              <div className="form-group">
                <label>Vida Útil (meses adicionales)</label>
                <input
                  type="number"
                  value={formDet.vidaUtilMes}
                  onChange={e => { setFormDet({...formDet, vidaUtilMes: e.target.value}); calcularDep(formDet.costo, formDet.vidaUtilAno, e.target.value); }}
                  placeholder="Ej: 0"
                />
              </div>

              <div className="form-group">
                <label>Nro. Serie</label>
                <input
                  type="number"
                  value={formDet.nroSerie}
                  onChange={e => setFormDet({...formDet, nroSerie: e.target.value})}
                />
              </div>

              {depCalculada && (
                <div className="form-group form-group-full" style={{background:'#f0fdf4', padding:'1rem', borderRadius:'8px', border:'1px solid #86efac'}}>
                  <h4 style={{margin:'0 0 0.5rem 0', color:'#166534'}}>📉 Depreciación Calculada</h4>
                  <p style={{margin:'0.2rem 0'}}>Vida útil total: <strong>{depCalculada.totalMeses} meses</strong></p>
                  <p style={{margin:'0.2rem 0'}}>Depreciación mensual: <strong>Bs. {depCalculada.depMensual}</strong></p>
                  <p style={{margin:'0.2rem 0'}}>Depreciación anual: <strong>Bs. {depCalculada.depAnual}</strong></p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDetModal(false)}>Cancelar</button>
              <button className="btn btn-success" onClick={handleAgregarDet}>Registrar con Depreciación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}