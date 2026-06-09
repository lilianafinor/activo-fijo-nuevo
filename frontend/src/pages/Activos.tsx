import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const permisos = ['ver_activos', 'crear_activo', 'eliminar_activo'];

// ==================== QUERIES & MUTATIONS ====================
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
    todosGrupos {
      codGrupo
      codHijo
      desGrupo
      nivel
      codPadre {
        codGrupo
        codHijo
        nivel
        codPadre {
          codGrupo
          codHijo
          nivel
        }
      }
    }
    todasMarcas { codMarca desMarca }
    todosModelos { codModelo desModelo codMarca { codMarca } }
    todosIngresos {
      nroIngreso
      glosa
      gestion
      codOficDest {
        codOfic
        codDpto
        nivel
        codPadre {
          codOfic
          codDpto
          nivel
          codPadre {
            codOfic
            codDpto
            nivel
          }
        }
      }
    }
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

const GET_SPECS_DATA = gql`
  query GetSpecsData($codGrupo: Int!, $nroActivo: Int!) {
    atributosPorGrupo(codGrupo: $codGrupo, soloActivos: true) {
      codAtrib
      des
      inDetAtribSet {
        codDetAtrib
        nroAtrib
        des
        aB
      }
    }
    atribActivosPorActivo(nroActivo: $nroActivo) {
      codDetAtrib {
        codDetAtrib
        codAtrib {
          codAtrib
        }
      }
      ok
      valor
    }
  }
`;

const ASIGNAR_ATRIB_ACTIVO = gql`
  mutation AsignarAtribActivo($codDetAtrib: Int!, $nroActivo: Int!, $ok: String, $valor: String) {
    asignarAtribActivo(codDetAtrib: $codDetAtrib, nroActivo: $nroActivo, ok: $ok, valor: $valor) {
      atribActivo {
        codDetAtrib {
          codDetAtrib
        }
        ok
        valor
      }
    }
  }
`;

const EDITAR_ATRIB_ACTIVO = gql`
  mutation EditarAtribActivo($codDetAtrib: Int!, $nroActivo: Int!, $ok: String, $valor: String) {
    editarAtribActivo(codDetAtrib: $codDetAtrib, nroActivo: $nroActivo, ok: $ok, valor: $valor) {
      atribActivo {
        codDetAtrib {
          codDetAtrib
        }
        ok
        valor
      }
    }
  }
`;

const GRUPOS_SIMPLES = ['MOBILIARIO', 'MUEBLES', 'ENSERES', 'SILLA', 'MESA', 'ESCRITORIO'];
const esGrupoSimple = (desGrupo: string) =>
  GRUPOS_SIMPLES.some(g => desGrupo?.toUpperCase().includes(g));

// Helper functions for office/group codes
function getOfficeUnifiedCode(ofic: any): string {
  if (!ofic) return '';
  const parts = [];
  let current = ofic;
  while (current) {
    parts.unshift(current.codDpto);
    current = current.codPadre;
  }
  return parts.join('');
}

function getGroupFullCode(grupo: any): string {
  if (!grupo) return '';
  const parts = [];
  let current = grupo;
  while (current) {
    parts.unshift(current.codHijo);
    current = current.codPadre;
  }
  return parts.join('-');
}

function getGroupUnifiedCode(grupo: any): string {
  if (!grupo) return '';
  const parts = [];
  let current = grupo;
  while (current) {
    parts.unshift(current.codHijo);
    current = current.codPadre;
  }
  return parts.join('');
}

const FORM_VACIO = {
  codGest: '', codActivo: '', codGrupo: '', descripcion: '', codEstado: '',
  nroIngreso: '', monto: '', fecAdqui: '', nroSerie: '',
  codMarca: '', codModelo: '', codProve: '', codCond: '', codUnidad: ''
};

const ITEMS_POR_PAGINA = 8;

export default function Activos() {  
  // ==================== PERMISOS ====================
  const puedeVer = permisos.includes('ver_activos');
  const puedeCrear = permisos.includes('crear_activo');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(FORM_VACIO);
  const [grupoSelDes, setGrupoSelDes] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [selectedActivoSpecs, setSelectedActivoSpecs] = useState<any>(null);
  const [showSpecsModal, setShowSpecsModal] = useState(false);

  // Autocomplete search states for groups
  const [grupoSearch, setGrupoSearch] = useState('');
  const [showGruposDropdown, setShowGruposDropdown] = useState(false);

  // Estado para creación en lote
  const [cantidadLote, setCantidadLote] = useState(1);
  const [creandoLote, setCreandoLote] = useState(false);
  const [progresoLote, setProgresoLote] = useState({ actual: 0, total: 0 });

  const { data, loading, error: queryError, refetch } = useQuery(GET_ACTIVOS);
  const { data: cats } = useQuery(GET_CATALOGOS);
  const [crearActivo] = useMutation(CREAR_ACTIVO);

  const modelosFiltrados = cats?.todosModelos?.filter(
    (m: any) => !form.codMarca || String(m.codMarca?.codMarca) === String(form.codMarca)
  ) || [];

  const esSimple = esGrupoSimple(grupoSelDes);

  // ==================== FILTROS Y PAGINACIÓN ====================
  const activosFiltrados = useMemo(() => {
    let lista = data?.todosActivos || [];
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      lista = lista.filter((a: any) => 
        a.codActivo?.toLowerCase().includes(term) || 
        a.descripcion?.toLowerCase().includes(term) ||
        a.nroSerie?.toLowerCase().includes(term)
      );
    }
    return lista;
  }, [data, busqueda]);

  const totalPaginas = Math.ceil(activosFiltrados.length / ITEMS_POR_PAGINA);
  const paginaActualSegura = Math.min(paginaActual, totalPaginas || 1);
  const activosPaginados = activosFiltrados.slice((paginaActualSegura - 1) * ITEMS_POR_PAGINA, paginaActualSegura * ITEMS_POR_PAGINA);

  // ==================== HANDLERS ====================
  const handleSelectGrupo = (g: any) => {
    setForm({ ...form, codGrupo: g.codGrupo.toString(), codMarca: '', codModelo: '' });
    setGrupoSelDes(g.desGrupo || '');
    const unified = getGroupUnifiedCode(g);
    setGrupoSearch(`[${unified}] ${g.desGrupo}`);
    setShowGruposDropdown(false);
  };

  const filteredGrupos = cats?.todosGrupos?.filter((g: any) => {
    const fullCode = getGroupFullCode(g).toLowerCase();
    const unifiedCode = getGroupUnifiedCode(g).toLowerCase();
    const text = g.desGrupo.toLowerCase();
    const query = grupoSearch.toLowerCase();
    return text.includes(query) || fullCode.includes(query) || unifiedCode.includes(query);
  }) || [];

  // Autocomplete code generator
  useEffect(() => {
    if (form.nroIngreso && form.codGrupo && cats?.todosIngresos && cats?.todosGrupos) {
      const selectedIngreso = cats.todosIngresos.find((i: any) => String(i.nroIngreso) === String(form.nroIngreso));
      const selectedGroup = cats.todosGrupos.find((g: any) => String(g.codGrupo) === String(form.codGrupo));
      
      if (selectedIngreso?.codOficDest && selectedGroup) {
        const officeCode = getOfficeUnifiedCode(selectedIngreso.codOficDest);
        const groupCode = getGroupUnifiedCode(selectedGroup);
        
        let combined = (officeCode + groupCode).replace(/[^0-9A-Z]/gi, '');
        if (combined.length > 7) {
          combined = combined.substring(0, 7);
        } else {
          combined = combined.padEnd(7, '0');
        }
        
        const generated = `U${combined}0001`;
        setForm((prev: any) => ({ ...prev, codActivo: generated }));
      }
    }
  }, [form.nroIngreso, form.codGrupo, cats?.todosIngresos, cats?.todosGrupos]);

  // Creación en lote
  const handleSubmitLote = async () => {
    if (!puedeCrear) {
      setError('No tienes permiso para crear activos');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    const cantidad = cantidadLote || 1;
    if (cantidad < 1) {
      setError('La cantidad debe ser al menos 1');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!form.codGest || !form.codActivo || !form.codGrupo || !form.descripcion || !form.codEstado || !form.nroIngreso) {
      setError('Complete los campos obligatorios (*)');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setCreandoLote(true);
    setProgresoLote({ actual: 0, total: cantidad });

    let exitos = 0;
    let fallos = 0;

    const base8 = form.codActivo.substring(0, 8);
    const prefix8 = base8.padEnd(8, '0');

    for (let i = 0; i < cantidad; i++) {
      try {
        const seqStr = (i + 1).toString().padStart(4, '0');
        const codigoCompleto = `${prefix8}${seqStr}`;
        
        await crearActivo({
          variables: {
            codGest: parseInt(form.codGest),
            codActivo: codigoCompleto,
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
          }
        });
        exitos++;
      } catch (err) {
        fallos++;
      }
      setProgresoLote({ actual: i + 1, total: cantidad });
    }

    setCreandoLote(true);
    setTimeout(() => {
      setCreandoLote(false);
      setMensaje(`Lote completado: ${exitos} creados, ${fallos} errores`);
      setShowModal(false);
      setForm(FORM_VACIO);
      setGrupoSelDes('');
      setGrupoSearch('');
      refetch();
      setTimeout(() => setMensaje(''), 4000);
    }, 500);
  };

  const handleSubmitIndividual = async () => {
    if (!puedeCrear) {
      setError('No tienes permiso para crear activos');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!form.codGest || !form.codActivo || !form.codGrupo || !form.descripcion || !form.codEstado || !form.nroIngreso) {
      setError('Complete los campos obligatorios (*)');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      await crearActivo({
        variables: {
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
        }
      });
      setMensaje('Activo creado correctamente');
      setShowModal(false);
      setForm(FORM_VACIO);
      setGrupoSelDes('');
      setGrupoSearch('');
      refetch();
      setTimeout(() => setMensaje(''), 3000);
    } catch (e: any) {
      setError('Error: ' + e.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ==================== RENDER ====================
  if (!puedeVer) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3 opacity-50">🔒</div>
        <h3 className="text-red-400 text-lg font-medium mb-1">Acceso denegado</h3>
        <p className="text-slate-500 text-sm">No tienes permisos para ver los activos</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Cargando activos...</div>;
  if (queryError) return <div className="error">Error: {queryError.message}</div>;

  return (
    <div>
      {/* Mensajes */}
      {mensaje && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl mb-4">
          {mensaje}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="page-header flex justify-between items-center mb-6">
        <h1 className="page-title text-2xl font-bold text-white">📋 Activos Fijos</h1>
        {puedeCrear && (
          <button className="btn btn-primary" onClick={() => { setForm(FORM_VACIO); setGrupoSelDes(''); setGrupoSearch(''); setShowModal(true); }}>
            + Nuevo Activo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por código, descripción o serie..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-x-auto shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-700 border-b border-slate-600">
            <tr>
              <th className="px-4 py-3 text-slate-300 text-sm font-semibold">Código</th>
              <th className="px-4 py-3 text-slate-300 text-sm font-semibold">Descripción</th>
              <th className="px-4 py-3 text-slate-300 text-sm font-semibold">Grupo</th>
              <th className="px-4 py-3 text-slate-300 text-sm font-semibold">Marca / Modelo</th>
              <th className="px-4 py-3 text-slate-300 text-sm font-semibold">Monto (Bs.)</th>
              <th className="px-4 py-3 text-slate-300 text-sm font-semibold">Fecha Adq.</th>
              <th className="px-4 py-3 text-slate-300 text-sm font-semibold">Condición</th>
              <th className="px-4 py-3 text-slate-300 text-sm font-semibold">Estado</th>
              <th className="px-4 py-3 text-slate-300 text-sm font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {activosPaginados.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">No hay activos registrados</td></tr>
            )}
            {activosPaginados.map((a: any) => (
              <tr key={a.nroActivo} className="border-b border-slate-700 hover:bg-slate-750 transition">
                <td className="px-4 py-3 font-mono text-blue-400 text-sm">{a.codActivo}</td>
                <td className="px-4 py-3 text-slate-300 text-sm">{a.descripcion}</td>
                <td className="px-4 py-3 text-slate-300 text-sm">{a.codGrupo?.desGrupo || '-'}</td>
                <td className="px-4 py-3 text-slate-300 text-sm">
                  {a.codMarca?.desMarca ? `${a.codMarca.desMarca}${a.codModelo?.desModelo ? ' / ' + a.codModelo.desModelo : ''}` : '-'}
                </td>
                <td className="px-4 py-3 text-emerald-400 font-medium text-sm">
                  {a.monto ? parseFloat(a.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 }) : '-'}
                </td>
                <td className="px-4 py-3 text-slate-300 text-sm">{a.fecAdqui || '-'}</td>
                <td className="px-4 py-3 text-slate-300 text-sm">{a.codCond?.desCond || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    a.codEstado?.desEstado === 'ACTIVO' ? 'bg-emerald-500/10 text-emerald-400' :
                    a.codEstado?.desEstado === 'BAJA' ? 'bg-red-500/10 text-red-400' :
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {a.codEstado?.desEstado || '-'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="btn btn-info btn-sm"
                    style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                    onClick={() => {
                      setSelectedActivoSpecs(a);
                      setShowSpecsModal(true);
                    }}
                  >
                    ⚙️ Specs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-6 bg-slate-800/80 border border-slate-700/60 rounded-2xl px-5 py-4">
          <span className="text-slate-400 text-sm">
            Página {paginaActualSegura} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))} 
              disabled={paginaActualSegura === 1} 
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Anterior
            </button>
            <button 
              onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} 
              disabled={paginaActualSegura === totalPaginas} 
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-container" onClick={e => e.stopPropagation()}>
      
      {/* Header */}
      <div className="modal-header">
        <h2>Registrar Activo</h2>
        <button className="modal-close" onClick={() => setShowModal(false)}>
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="modal-body">
        <div className="space-y-4">
          <div className="form-grid">
            <div className="form-group">
              <label>Gestión *</label>
              <select name="codGest" value={form.codGest} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {cats?.todasGestiones?.map((g: any) => (
                  <option key={g.codGest} value={g.codGest}>{g.gestIni}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ingreso *</label>
              <select name="nroIngreso" value={form.nroIngreso} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {cats?.todosIngresos?.map((i: any) => (
                  <option key={i.nroIngreso} value={i.nroIngreso}>#{i.nroIngreso} - {i.glosa || 'Sin glosa'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group form-group-full">
            <label>Código Activo *</label>
            <input name="codActivo" value={form.codActivo} onChange={handleChange} placeholder="Ej: U101010001" />
          </div>

          <div className="form-group form-group-full">
            <label>Descripción *</label>
            <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción del activo" />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Grupo *</label>
              <div className="autocomplete-container">
                <input
                  type="text"
                  value={grupoSearch}
                  onChange={e => {
                    setGrupoSearch(e.target.value);
                    setForm({ ...form, codGrupo: '' });
                    setShowGruposDropdown(true);
                  }}
                  onFocus={() => setShowGruposDropdown(true)}
                  onBlur={() => setTimeout(() => setShowGruposDropdown(false), 200)}
                  placeholder="Buscar código o descripción..."
                />
                {showGruposDropdown && (
                  <ul className="autocomplete-dropdown">
                    {filteredGrupos.slice(0, 20).map((g: any) => {
                      const unified = getGroupUnifiedCode(g);
                      return (
                        <li
                          key={g.codGrupo}
                          className="autocomplete-item"
                          onClick={() => handleSelectGrupo(g)}
                        >
                          [{unified}] {g.desGrupo}
                        </li>
                      );
                    })}
                    {filteredGrupos.length === 0 && (
                      <li className="autocomplete-no-results">No se encontraron grupos</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Estado *</label>
              <select name="codEstado" value={form.codEstado} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {cats?.todosEstados?.map((e: any) => (
                  <option key={e.codEstado} value={e.codEstado}>{e.desEstado}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Monto (Bs.)</label>
              <input type="number" name="monto" value={form.monto} onChange={handleChange} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Fecha Adquisición</label>
              <input type="date" name="fecAdqui" value={form.fecAdqui} onChange={handleChange} />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Condición</label>
              <select name="codCond" value={form.codCond} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {cats?.todasCondiciones?.map((c: any) => (
                  <option key={c.codCond} value={c.codCond}>{c.desCond}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Unidad</label>
              <select name="codUnidad" value={form.codUnidad} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {cats?.todasUnidades?.map((u: any) => (
                  <option key={u.codUnidad} value={u.codUnidad}>{u.desUnidad}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group form-group-full">
            <label>Proveedor</label>
            <select name="codProve" value={form.codProve} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              {cats?.todosProvedores?.map((p: any) => (
                <option key={p.codProv} value={p.codProv}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {!esSimple && (
            <>
              <hr className="section-divider" />
              <h3 className="section-title">Datos Técnicos (Equipo Detallado)</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nro. Serie</label>
                  <input name="nroSerie" value={form.nroSerie} onChange={handleChange} placeholder="Número de serie" />
                </div>
                <div className="form-group">
                  <label>Marca</label>
                  <select name="codMarca" value={form.codMarca} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    {cats?.todasMarcas?.map((m: any) => (
                      <option key={m.codMarca} value={m.codMarca}>{m.desMarca}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group form-group-full">
                <label>Modelo</label>
                <select name="codModelo" value={form.codModelo} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {modelosFiltrados.map((m: any) => (
                    <option key={m.codModelo} value={m.codModelo}>{m.desModelo}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-group form-group-full">
            <label>Cantidad a crear</label>
            <input 
              type="number" 
              min="1" 
              value={String(cantidadLote)} 
              onChange={e => setCantidadLote(parseInt(e.target.value) || 1)} 
              placeholder="1" 
            />
            {creandoLote && (
              <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                <p className="text-blue-400 text-sm">Creando {progresoLote.actual} de {progresoLote.total}...</p>
                <div className="mt-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(progresoLote.actual / progresoLote.total) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={cantidadLote > 1 ? handleSubmitLote : handleSubmitIndividual}>
              Registrar Activo
            </button>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      {showSpecsModal && selectedActivoSpecs && (
        <SpecsModal
          activo={selectedActivoSpecs}
          onClose={() => {
            setShowSpecsModal(false);
            setSelectedActivoSpecs(null);
          }}
        />
      )}
    </div>
  );
}

// ==================== SPECS MODAL SUBCOMPONENT ====================
function SpecsModal({ activo, onClose }: { activo: any; onClose: () => void }) {
  const codGrupo = activo.codGrupo?.codGrupo;
  const nroActivo = activo.nroActivo;

  const { data, loading, error, refetch } = useQuery(GET_SPECS_DATA, {
    variables: { codGrupo: parseInt(codGrupo), nroActivo: parseInt(nroActivo) },
    skip: !codGrupo || !nroActivo
  });

  const [asignarAtrib] = useMutation(ASIGNAR_ATRIB_ACTIVO);
  const [editarAtrib] = useMutation(EDITAR_ATRIB_ACTIVO);

  // Keep track of values being modified
  const [tempValues, setTempValues] = useState<Record<number, { codDetAtrib: string; valor: string }>>({});
  const [savingAtribId, setSavingAtribId] = useState<number | null>(null);

  if (loading) return <div className="modal-overlay"><div className="modal" style={{ background: '#1e293b', color: 'white' }}>Cargando especificaciones...</div></div>;
  if (error) return <div className="modal-overlay"><div className="modal" style={{ background: '#1e293b', color: 'white' }}>Error: {error.message}</div></div>;

  const activeSpecs = data?.atribActivosPorActivo || [];
  const groupAttributes = data?.atributosPorGrupo || [];

  const handleSave = async (atribId: number, codDetAtrib: string, valor: string) => {
    if (!codDetAtrib) {
      alert('Por favor seleccione una opción');
      return;
    }
    setSavingAtribId(atribId);
    try {
      // Check if there is already an active assignment for this specific detail
      const existingAssignment = activeSpecs.find(
        (spec: any) => spec.codDetAtrib?.codDetAtrib === parseInt(codDetAtrib)
      );

      // We also check if there is an active assignment for any OTHER detail belonging to the same attribute
      const otherDetailAssignment = activeSpecs.find(
        (spec: any) =>
          spec.codDetAtrib?.codAtrib?.codAtrib === atribId &&
          spec.codDetAtrib?.codDetAtrib !== parseInt(codDetAtrib) &&
          spec.ok === 'S'
      );

      // If there is an assignment for another detail, set ok = 'N' for it first
      if (otherDetailAssignment) {
        await editarAtrib({
          variables: {
            codDetAtrib: parseInt(otherDetailAssignment.codDetAtrib.codDetAtrib),
            nroActivo: parseInt(nroActivo),
            ok: 'N',
            valor: otherDetailAssignment.valor
          }
        });
      }

      if (existingAssignment) {
        // Just update ok='S' and valor
        await editarAtrib({
          variables: {
            codDetAtrib: parseInt(codDetAtrib),
            nroActivo: parseInt(nroActivo),
            ok: 'S',
            valor: valor
          }
        });
      } else {
        // Create new assignment
        await asignarAtrib({
          variables: {
            codDetAtrib: parseInt(codDetAtrib),
            nroActivo: parseInt(nroActivo),
            ok: 'S',
            valor: valor
          }
        });
      }
      refetch();
      alert('✅ Especificación guardada correctamente');
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setSavingAtribId(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '95vw', background: '#1e293b', color: 'white', border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6', margin: 0 }}>
            ⚙️ Especificaciones Técnicas
          </h2>
          <button style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }} onClick={onClose}>×</button>
        </div>

        <div style={{ marginBottom: '1rem', background: '#0f172a', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: '#94a3b8' }}>Activo Fijo:</p>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>[{activo.codActivo}] {activo.descripcion}</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Grupo: {activo.codGrupo?.desGrupo}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
          {groupAttributes.length === 0 ? (
            <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
              Este grupo de activos no tiene atributos configurados. Configúralos en Catálogos &gt; Atributos.
            </p>
          ) : (
            groupAttributes.map((atrib: any) => {
              // Find if this attribute is already assigned to the asset
              const assigned = activeSpecs.find(
                (spec: any) => spec.codDetAtrib?.codAtrib?.codAtrib === atrib.codAtrib && spec.ok === 'S'
              );

              const currentVal = tempValues[atrib.codAtrib] || {
                codDetAtrib: assigned?.codDetAtrib?.codDetAtrib?.toString() || '',
                valor: assigned?.valor || ''
              };

              const options = atrib.inDetAtribSet?.filter((o: any) => o.aB === 'A') || [];

              return (
                <div key={atrib.codAtrib} style={{ background: '#111827', border: '1px solid #334155', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
                    {atrib.des}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    {/* Selector de Detalle/Opción */}
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Opción *</label>
                      <select
                        value={currentVal.codDetAtrib}
                        onChange={e => setTempValues({
                          ...tempValues,
                          [atrib.codAtrib]: { ...currentVal, codDetAtrib: e.target.value }
                        })}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', background: '#1f2937', border: '1px solid #374151', color: 'white' }}
                      >
                        <option value="">Seleccione...</option>
                        {options.map((o: any) => (
                          <option key={o.codDetAtrib} value={o.codDetAtrib}>{o.des}</option>
                        ))}
                      </select>
                    </div>

                    {/* Campo Valor Manual */}
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <label style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Valor Libre / Unidad</label>
                      <input
                        type="text"
                        placeholder="Ej: 16 GB, Intel i7, etc."
                        value={currentVal.valor}
                        onChange={e => setTempValues({
                          ...tempValues,
                          [atrib.codAtrib]: { ...currentVal, valor: e.target.value }
                        })}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', background: '#1f2937', border: '1px solid #374151', color: 'white' }}
                      />
                    </div>

                    {/* Botón Guardar */}
                    <div>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.45rem 0.85rem' }}
                        disabled={savingAtribId === atrib.codAtrib}
                        onClick={() => handleSave(atrib.codAtrib, currentVal.codDetAtrib, currentVal.valor)}
                      >
                        {savingAtribId === atrib.codAtrib ? '...' : 'Guardar'}
                      </button>
                    </div>
                  </div>

                  {assigned && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#34d399', display: 'flex', gap: '0.4rem', background: '#064e3b/30', padding: '4px 8px', borderRadius: '4px' }}>
                      <span>Valor asignado actual:</span>
                      <strong>{assigned.codDetAtrib?.des} {assigned.valor ? ` — ${assigned.valor}` : ''}</strong>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="modal-actions" style={{ borderTop: '1px solid #334155', marginTop: '1.25rem', paddingTop: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}