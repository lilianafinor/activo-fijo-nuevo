import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_INGRESOS = gql`
  query {
    todosIngresos {
      nroIngreso
      gestion
      actaRecep
      glosa
      estado
      fechaRecep
      nroFactura
      fechaFactura
      nroEgreso
      codProv { nombre }
      codOficDest { desDpto }
    }
  }
`;

const GET_CATALOGOS = gql`
  query {
    todosProvedores { codProv nombre }
    todasOficinas { codOfic desDpto }
    todosEmpleados { idEmpleado nombre apellido cargo }
  }
`;

const CREAR_INGRESO = gql`
  mutation CrearIngreso(
    $gestion: Int, $tipoIngreso: Int, $actaRecep: String,
    $fechaRecep: Date, $codProv: Int, $codOficDest: Int,
    $codEmpRecep: Int, $tipoEmpRecep: Int,
    $codEmpDest: Int, $tipoEmpDest: Int,
    $glosa: String, $nroFactura: Int, $fechaFactura: Date,
    $nroEgreso: Int, $fechaEgreso: Date, $estado: String
  ) {
    crearIngreso(
      gestion: $gestion, tipoIngreso: $tipoIngreso, actaRecep: $actaRecep,
      fechaRecep: $fechaRecep, codProv: $codProv, codOficDest: $codOficDest,
      codEmpRecep: $codEmpRecep, tipoEmpRecep: $tipoEmpRecep,
      codEmpDest: $codEmpDest, tipoEmpDest: $tipoEmpDest,
      glosa: $glosa, nroFactura: $nroFactura, fechaFactura: $fechaFactura,
      nroEgreso: $nroEgreso, fechaEgreso: $fechaEgreso, estado: $estado
    ) {
      ingreso { nroIngreso glosa estado }
    }
  }
`;

const EDITAR_INGRESO = gql`
  mutation EditarIngreso($nroIngreso: Int!, $glosa: String, $estado: String, $nroFactura: Int, $actaRecep: String) {
    editarIngreso(nroIngreso: $nroIngreso, glosa: $glosa, estado: $estado, nroFactura: $nroFactura, actaRecep: $actaRecep) {
      ingreso { nroIngreso glosa estado }
    }
  }
`;

const ELIMINAR_INGRESO = gql`
  mutation($nroIngreso: Int!) {
    eliminarIngreso(nroIngreso: $nroIngreso) { ok }
  }
`;

const estadoLabel: Record<string, string> = { 'E': 'Elaborado', 'A': 'Aprobado', 'C': 'Cerrado' };
const estadoClass: Record<string, string> = { 'E': 'badge-warning', 'A': 'badge-success', 'C': 'badge-info' };

const FORM_VACIO = {
  gestion: '', actaRecep: '', glosa: '', codProv: '', codOficDest: '',
  codEmpRecep: '', codEmpDest: '', nroFactura: '', fechaFactura: '',
  fechaRecep: '', nroEgreso: '', estado: 'E'
};

export default function Ingresos() {
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState<any>(FORM_VACIO);

  const { data, loading, error, refetch } = useQuery(GET_INGRESOS);
  const { data: cats } = useQuery(GET_CATALOGOS);
  const [crearIngreso] = useMutation(CREAR_INGRESO);
  const [editarIngreso] = useMutation(EDITAR_INGRESO);
  const [eliminarIngreso] = useMutation(ELIMINAR_INGRESO);

  const abrirNuevo = () => { setEditando(null); setForm(FORM_VACIO); setShowModal(true); };
  const abrirEditar = (i: any) => {
    setEditando(i);
    setForm({ ...FORM_VACIO, glosa: i.glosa || '', estado: i.estado || 'E', nroFactura: i.nroFactura || '', actaRecep: i.actaRecep || '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editando) {
        await editarIngreso({ variables: {
          nroIngreso: editando.nroIngreso,
          glosa: form.glosa || null,
          estado: form.estado,
          nroFactura: form.nroFactura ? parseInt(form.nroFactura) : null,
          actaRecep: form.actaRecep || null,
        }});
      } else {
        await crearIngreso({ variables: {
          gestion: form.gestion ? parseInt(form.gestion) : null,
          actaRecep: form.actaRecep || null,
          codProv: form.codProv ? parseInt(form.codProv) : null,
          codOficDest: form.codOficDest ? parseInt(form.codOficDest) : null,
          codEmpRecep: form.codEmpRecep ? parseInt(form.codEmpRecep) : null,
          tipoEmpRecep: form.codEmpRecep ? 1 : null,
          codEmpDest: form.codEmpDest ? parseInt(form.codEmpDest) : null,
          tipoEmpDest: form.codEmpDest ? 1 : null,
          glosa: form.glosa || null,
          nroFactura: form.nroFactura ? parseInt(form.nroFactura) : null,
          fechaFactura: form.fechaFactura || null,
          fechaRecep: form.fechaRecep || null,
          nroEgreso: form.nroEgreso ? parseInt(form.nroEgreso) : null,
          estado: form.estado,
        }});
      }
      setShowModal(false);
      refetch();
    } catch (e: any) { alert('Error: ' + e.message); }
  };

  const handleEliminar = async (nroIngreso: number) => {
    if (!window.confirm('¿Eliminar este ingreso?')) return;
    await eliminarIngreso({ variables: { nroIngreso } });
    refetch();
  };

  if (loading) return <div className="loading">Cargando ingresos...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📥 Ingresos de Bienes</h1>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Nuevo Ingreso</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nro.</th>
              <th>Gestión</th>
              <th>Acta Recep.</th>
              <th>Glosa</th>
              <th>Proveedor</th>
              <th>Oficina Destino</th>
              <th>Fecha Recep.</th>
              <th>Nro. Factura</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.todosIngresos?.length === 0 && (
              <tr><td colSpan={10} className="empty">No hay ingresos registrados</td></tr>
            )}
            {data?.todosIngresos?.map((i: any) => (
              <tr key={i.nroIngreso}>
                <td><strong>#{i.nroIngreso}</strong></td>
                <td>{i.gestion || '-'}</td>
                <td>{i.actaRecep || '-'}</td>
                <td>{i.glosa || '-'}</td>
                <td>{i.codProv?.nombre || '-'}</td>
                <td>{i.codOficDest?.desDpto || '-'}</td>
                <td>{i.fechaRecep || '-'}</td>
                <td>{i.nroFactura || '-'}</td>
                <td>
                  <span className={`badge ${estadoClass[i.estado] || 'badge-secondary'}`}>
                    {estadoLabel[i.estado] || i.estado || '-'}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-warning btn-sm" onClick={() => abrirEditar(i)}>Editar</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(i.nroIngreso)}>Eliminar</button>
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
            <h2 className="modal-title">{editando ? 'Editar Ingreso' : 'Registrar Nuevo Ingreso'}</h2>

            <div className="form-grid">
              {!editando && <>
                <div className="form-group">
                  <label>Gestión (año)</label>
                  <input type="number" value={form.gestion} onChange={e => setForm({...form, gestion: e.target.value})} placeholder="2025" />
                </div>
                <div className="form-group">
                  <label>Acta de Recepción</label>
                  <input value={form.actaRecep} onChange={e => setForm({...form, actaRecep: e.target.value})} placeholder="Nro. acta" />
                </div>
              </>}

              <div className="form-group form-group-full">
                <label>Glosa / Descripción</label>
                <input value={form.glosa} onChange={e => setForm({...form, glosa: e.target.value})} placeholder="Descripción del ingreso" />
              </div>

              {!editando && <>
                <div className="section-label">Proveedor y Destino</div>
                <div className="form-group">
                  <label>Proveedor</label>
                  <select value={form.codProv} onChange={e => setForm({...form, codProv: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {cats?.todosProvedores?.map((p: any) => (
                      <option key={p.codProv} value={p.codProv}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Oficina Destino</label>
                  <select value={form.codOficDest} onChange={e => setForm({...form, codOficDest: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {cats?.todasOficinas?.map((o: any) => (
                      <option key={o.codOfic} value={o.codOfic}>{o.desDpto}</option>
                    ))}
                  </select>
                </div>

                <div className="section-label">Empleados</div>
                <div className="form-group">
                  <label>Empleado que Recepciona</label>
                  <select value={form.codEmpRecep} onChange={e => setForm({...form, codEmpRecep: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {cats?.todosEmpleados?.map((e: any) => (
                      <option key={e.idEmpleado} value={e.idEmpleado}>{e.nombre} {e.apellido}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Empleado Destino</label>
                  <select value={form.codEmpDest} onChange={e => setForm({...form, codEmpDest: e.target.value})}>
                    <option value="">Seleccionar...</option>
                    {cats?.todosEmpleados?.map((e: any) => (
                      <option key={e.idEmpleado} value={e.idEmpleado}>{e.nombre} {e.apellido}</option>
                    ))}
                  </select>
                </div>

                <div className="section-label">Documentos</div>
                <div className="form-group">
                  <label>Fecha Recepción</label>
                  <input type="date" value={form.fechaRecep} onChange={e => setForm({...form, fechaRecep: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Nro. Factura</label>
                  <input type="number" value={form.nroFactura} onChange={e => setForm({...form, nroFactura: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Fecha Factura</label>
                  <input type="date" value={form.fechaFactura} onChange={e => setForm({...form, fechaFactura: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Nro. Egreso</label>
                  <input type="number" value={form.nroEgreso} onChange={e => setForm({...form, nroEgreso: e.target.value})} />
                </div>
              </>}

              {editando && <>
                <div className="form-group">
                  <label>Nro. Factura</label>
                  <input type="number" value={form.nroFactura} onChange={e => setForm({...form, nroFactura: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Acta Recepción</label>
                  <input value={form.actaRecep} onChange={e => setForm({...form, actaRecep: e.target.value})} />
                </div>
              </>}

              <div className="form-group">
                <label>Estado</label>
                <select value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
                  <option value="E">Elaborado</option>
                  <option value="A">Aprobado</option>
                  <option value="C">Cerrado</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editando ? 'Guardar Cambios' : 'Registrar Ingreso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}