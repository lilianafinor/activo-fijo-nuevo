import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_ACTIVOS = gql`
  query {
    todosActivos {
      nroActivo codActivo descripcion monto fecAdqui nroSerie aB
      codEstado { desEstado }
      codGrupo { codGrupo desGrupo }
      codMarca { desMarca }
      codModelo { desModelo }
      codCond { desCond }
      codProve { nombre }
      nroIngreso { nroIngreso glosa }
    }
  }
`;

const GET_CATALOGOS = gql`
  query {
    todosEstados { codEstado desEstado }
    todosGrupos { codGrupo desGrupo }
    todasMarcas { codMarca desMarca }
    todosModelos { codModelo desModelo codMarca { codMarca } }
    todosIngresos { nroIngreso glosa gestion }
    todasGestiones { codGest gestIni }
    todasCondiciones { codCond desCond }
    todosProvedores { codProv nombre }
    todasUnidades { codUnidad desUnidad }
  }
`;

const CREAR_ACTIVO = gql`
  mutation CrearActivo(
    $codGest: Int!, $codActivo: String!, $codGrupo: Int!,
    $descripcion: String!, $codEstado: Int!, $nroIngreso: Int!,
    $monto: Float, $fecAdqui: Date, $nroSerie: String,
    $codMarca: Int, $codModelo: Int, $codProve: Int, $codCond: Int, $codUnidad: Int
  ) {
    crearActivo(
      codGest: $codGest, codActivo: $codActivo, codGrupo: $codGrupo,
      descripcion: $descripcion, codEstado: $codEstado, nroIngreso: $nroIngreso,
      monto: $monto, fecAdqui: $fecAdqui, nroSerie: $nroSerie,
      codMarca: $codMarca, codModelo: $codModelo, codProve: $codProve,
      codCond: $codCond, codUnidad: $codUnidad
    ) {
      activo { nroActivo codActivo descripcion }
    }
  }
`;

const ELIMINAR_ACTIVO = gql`
  mutation($nroActivo: Int!) { eliminarActivo(nroActivo: $nroActivo) { ok } }
`;

const GRUPOS_SIMPLES = ['MOBILIARIO', 'MUEBLES', 'ENSERES', 'SILLA', 'MESA', 'ESCRITORIO'];
const esGrupoSimple = (desGrupo: string) =>
  GRUPOS_SIMPLES.some(g => desGrupo?.toUpperCase().includes(g));

const estadoBadge: Record<string, string> = {
  'ACTIVO': 'badge-success', 'BAJA': 'badge-danger', 'EN USO': 'badge-info'
};

const FORM_VACIO = {
  codGest: '', codActivo: '', codGrupo: '', descripcion: '', codEstado: '',
  nroIngreso: '', monto: '', fecAdqui: '', nroSerie: '',
  codMarca: '', codModelo: '', codProve: '', codCond: '', codUnidad: ''
};

export default function Activos() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(FORM_VACIO);
  const [grupoSelDes, setGrupoSelDes] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_ACTIVOS);
  const { data: cats } = useQuery(GET_CATALOGOS);
  const [crearActivo] = useMutation(CREAR_ACTIVO);
  const [eliminarActivo] = useMutation(ELIMINAR_ACTIVO);

  const modelosFiltrados = cats?.todosModelos?.filter(
    (m: any) => !form.codMarca || m.codMarca?.codMarca === parseInt(form.codMarca)
  ) || [];

  const esSimple = esGrupoSimple(grupoSelDes);

  const handleGrupoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const grupo = cats?.todosGrupos?.find((g: any) => g.codGrupo === parseInt(val));
    setForm({ ...form, codGrupo: val, codMarca: '', codModelo: '' });
    setGrupoSelDes(grupo?.desGrupo || '');
  };

  const handleSubmit = async () => {
    if (!form.codGest || !form.codActivo || !form.codGrupo || !form.descripcion || !form.codEstado || !form.nroIngreso) {
      alert('Complete los campos obligatorios (*)');
      return;
    }
    try {
      await crearActivo({ variables: {
        codGest: parseInt(form.codGest),
        codActivo: form.codActivo,
        codGrupo: parseInt(form.codGrupo),
        descripcion: form.descripcion,
        codEstado: parseInt(form.codEstado),
        nroIngreso: parseInt(form.nroIngreso),
        monto: form.monto ? parseFloat(form.monto) : null,
        fecAdqui: form.fecAdqui || null,
        nroSerie: form.nroSerie || null,
        codMarca: form.codMarca ? parseInt(form.codMarca) : null,
        codModelo: form.codModelo ? parseInt(form.codModelo) : null,
        codProve: form.codProve ? parseInt(form.codProve) : null,
        codCond: form.codCond ? parseInt(form.codCond) : null,
        codUnidad: form.codUnidad ? parseInt(form.codUnidad) : null,
      }});
      setShowModal(false);
      setForm(FORM_VACIO);
      setGrupoSelDes('');
      refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleEliminar = async (nroActivo: number) => {
    if (!window.confirm('¿Eliminar este activo?')) return;
    await eliminarActivo({ variables: { nroActivo } });
    refetch();
  };

  if (loading) return <div className="loading">Cargando activos...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Activos Fijos</h1>
        <button className="btn btn-primary" onClick={() => { setForm(FORM_VACIO); setGrupoSelDes(''); setShowModal(true); }}>
          + Nuevo Activo
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Grupo</th>
              <th>Marca / Modelo</th>
              <th>Monto (Bs.)</th>
              <th>Fecha Adq.</th>
              <th>Condición</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.todosActivos?.length === 0 && (
              <tr><td colSpan={9} className="empty">No hay activos registrados</td></tr>
            )}
            {data?.todosActivos?.map((a: any) => (
              <tr key={a.nroActivo}>
                <td><strong>{a.codActivo}</strong></td>
                <td>{a.descripcion}</td>
                <td>{a.codGrupo?.desGrupo || '-'}</td>
                <td>{a.codMarca?.desMarca ? `${a.codMarca.desMarca}${a.codModelo?.desModelo ? ' / ' + a.codModelo.desModelo : ''}` : '-'}</td>
                <td>{a.monto ? parseFloat(a.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 }) : '-'}</td>
                <td>{a.fecAdqui || '-'}</td>
                <td>{a.codCond?.desCond || '-'}</td>
                <td>
                  <span className={`badge ${estadoBadge[a.codEstado?.desEstado?.toUpperCase()] || 'badge-secondary'}`}>
                    {a.codEstado?.desEstado || '-'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(a.nroActivo)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              Registrar Activo {esSimple && grupoSelDes ? '(Simple)' : grupoSelDes ? '(Detallado)' : ''}
            </h2>

            <div className="form-grid">
              <div className="section-label">Datos Generales *</div>

              <div className="form-group">
                <label>Gestión *</label>
                <select value={form.codGest} onChange={e => setForm({...form, codGest: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {cats?.todasGestiones?.map((g: any) => (
                    <option key={g.codGest} value={g.codGest}>{g.gestIni}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ingreso *</label>
                <select value={form.nroIngreso} onChange={e => setForm({...form, nroIngreso: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {cats?.todosIngresos?.map((i: any) => (
                    <option key={i.nroIngreso} value={i.nroIngreso}>#{i.nroIngreso} - {i.glosa || 'Sin glosa'}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Código Activo *</label>
                <input value={form.codActivo} onChange={e => setForm({...form, codActivo: e.target.value})} placeholder="Ej: U101010001" />
              </div>

              <div className="form-group">
                <label>Grupo *</label>
                <select value={form.codGrupo} onChange={handleGrupoChange}>
                  <option value="">Seleccionar...</option>
                  {cats?.todosGrupos?.map((g: any) => (
                    <option key={g.codGrupo} value={g.codGrupo}>{g.desGrupo}</option>
                  ))}
                </select>
              </div>

              <div className="form-group form-group-full">
                <label>Descripción *</label>
                <input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Descripción del activo" />
              </div>

              <div className="form-group">
                <label>Monto (Bs.)</label>
                <input type="number" value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} placeholder="0.00" />
              </div>

              <div className="form-group">
                <label>Fecha Adquisición</label>
                <input type="date" value={form.fecAdqui} onChange={e => setForm({...form, fecAdqui: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Estado *</label>
                <select value={form.codEstado} onChange={e => setForm({...form, codEstado: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {cats?.todosEstados?.map((e: any) => (
                    <option key={e.codEstado} value={e.codEstado}>{e.desEstado}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Condición</label>
                <select value={form.codCond} onChange={e => setForm({...form, codCond: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {cats?.todasCondiciones?.map((c: any) => (
                    <option key={c.codCond} value={c.codCond}>{c.desCond}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Unidad</label>
                <select value={form.codUnidad} onChange={e => setForm({...form, codUnidad: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {cats?.todasUnidades?.map((u: any) => (
                    <option key={u.codUnidad} value={u.codUnidad}>{u.desUnidad}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Proveedor</label>
                <select value={form.codProve} onChange={e => setForm({...form, codProve: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {cats?.todosProvedores?.map((p: any) => (
                    <option key={p.codProv} value={p.codProv}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {!esSimple && <>
                <div className="section-label">Datos Técnicos (Equipo Detallado)</div>

                <div className="form-group">
                  <label>Nro. Serie</label>
                  <input value={form.nroSerie} onChange={e => setForm({...form, nroSerie: e.target.value})} placeholder="Número de serie" />
                </div>

                <div className="form-group">
                  <label>Marca</label>
                  <select value={form.codMarca} onChange={e => setForm({...form, codMarca: e.target.value, codModelo: ''})}>
                    <option value="">Seleccionar...</option>
                    {cats?.todasMarcas?.map((m: any) => (
                      <option key={m.codMarca} value={m.codMarca}>{m.desMarca}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Modelo</label>
                  <select value={form.codModelo} onChange={e => setForm({...form, codModelo: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {modelosFiltrados.map((m: any) => (
                      <option key={m.codModelo} value={m.codModelo}>{m.desModelo}</option>
                    ))}
                  </select>
                </div>
              </>}
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Registrar Activo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}