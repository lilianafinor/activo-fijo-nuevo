import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

// ==================== QUERIES & MUTATIONS ====================
const GET_VEHICULOS_AND_ACTIVOS = gql`
  query GetVehiculosAndActivos {
    todosVehiculos {
      nroActivo {
        nroActivo
        codActivo
        descripcion
        monto
        fecAdqui
        nroSerie
      }
      tipo
      marca
      modelo
      anio
      color
      placa
      motor
      chasis
      cilindrada
      industria
      ruat
      carnetProp
      poliza
      factura
      resMin
      resAdm
      infTec
      leyEstado
      ds
      docTransf
      docCompVen
      minuta
      actaCoVe
      imagen
    }
    todosActivos {
      nroActivo
      codActivo
      descripcion
    }
  }
`;

const GUARDAR_VEHICULO = gql`
  mutation GuardarVehiculo(
    $nroActivo: Int!, $tipo: String, $marca: String, $modelo: String,
    $anio: Int, $color: String, $placa: String, $motor: String, $chasis: String,
    $cilindrada: Int, $industria: String, $ruat: String, $carnetProp: String,
    $poliza: String, $factura: Int, $resMin: String, $resAdm: String,
    $infTec: String, $leyEstado: String, $ds: String, $docTransf: String,
    $docCompVen: String, $minuta: String, $actaCoVe: String, $imagen: String
  ) {
    guardarVehiculo(
      nroActivo: $nroActivo, tipo: $tipo, marca: $marca, modelo: $modelo,
      anio: $anio, color: $color, placa: $placa, motor: $motor, chasis: $chasis,
      cilindrada: $cilindrada, industria: $industria, ruat: $ruat, carnetProp: $carnetProp,
      poliza: $poliza, factura: $factura, resMin: $resMin, resAdm: $resAdm,
      infTec: $infTec, leyEstado: $leyEstado, ds: $ds, docTransf: $docTransf,
      docCompVen: $docCompVen, minuta: $minuta, actaCoVe: $actaCoVe, imagen: $imagen
    ) {
      vehiculo {
        nroActivo {
          nroActivo
        }
        placa
      }
    }
  }
`;

export default function Vehiculos() {
  const { data, loading, error, refetch } = useQuery(GET_VEHICULOS_AND_ACTIVOS);
  const [guardarVehiculo] = useMutation(GUARDAR_VEHICULO);

  const [busqueda, setBusqueda] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [marcaFiltro, setMarcaFiltro] = useState('');
  
  // Selection states
  const [selectedVehiculo, setSelectedVehiculo] = useState<any>(null);
  const [editingVehiculo, setEditingVehiculo] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [printTarget, setPrintTarget] = useState<any>(null);

  // Form state for editing/creating
  const [form, setForm] = useState<any>({
    nroActivo: '',
    tipo: '',
    marca: '',
    modelo: '',
    anio: '',
    color: '',
    placa: '',
    motor: '',
    chasis: '',
    cilindrada: '',
    industria: '',
    ruat: '',
    carnetProp: '',
    poliza: '',
    factura: '',
    resMin: '',
    resAdm: '',
    infTec: '',
    leyEstado: '',
    ds: '',
    docTransf: '',
    docCompVen: '',
    minuta: '',
    actaCoVe: '',
    imagen: ''
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Extract unique types and brands for filter dropdowns
  const uniqueTypes = useMemo<string[]>(() => {
    const list = data?.todosVehiculos?.map((v: any) => v.tipo).filter(Boolean) || [];
    return Array.from(new Set(list)) as string[];
  }, [data]);

  const uniqueBrands = useMemo<string[]>(() => {
    const list = data?.todosVehiculos?.map((v: any) => v.marca).filter(Boolean) || [];
    return Array.from(new Set(list)) as string[];
  }, [data]);

  // Filter vehicles
  const filteredVehiculos = useMemo(() => {
    let list = data?.todosVehiculos || [];
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase();
      list = list.filter((v: any) => 
        v.placa?.toLowerCase().includes(term) ||
        v.marca?.toLowerCase().includes(term) ||
        v.modelo?.toLowerCase().includes(term) ||
        v.nroActivo?.codActivo?.toLowerCase().includes(term) ||
        v.nroActivo?.descripcion?.toLowerCase().includes(term)
      );
    }
    if (tipoFiltro) {
      list = list.filter((v: any) => v.tipo === tipoFiltro);
    }
    if (marcaFiltro) {
      list = list.filter((v: any) => v.marca === marcaFiltro);
    }
    return list;
  }, [data, busqueda, tipoFiltro, marcaFiltro]);

  // Get assets that do not have a vehicle file yet
  const availableAssets = useMemo(() => {
    const all = data?.todosActivos || [];
    const usedIds = new Set(data?.todosVehiculos?.map((v: any) => v.nroActivo?.nroActivo) || []);
    return all.filter((a: any) => !usedIds.has(a.nroActivo));
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload_image/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al subir la imagen');
      }

      const result = await response.json();
      setForm((prev: any) => ({ ...prev, imagen: result.filePath }));
      alert('📸 Imagen subida correctamente');
    } catch (err: any) {
      alert('⚠️ Error al subir la imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.nroActivo) {
      alert('Por favor, asocie un Activo Fijo.');
      return;
    }
    setSaving(true);
    try {
      await guardarVehiculo({
        variables: {
          nroActivo: parseInt(form.nroActivo),
          tipo: form.tipo,
          marca: form.marca,
          modelo: form.modelo,
          anio: form.anio ? parseInt(form.anio) : null,
          color: form.color,
          placa: form.placa,
          motor: form.motor,
          chasis: form.chasis,
          cilindrada: form.cilindrada ? parseInt(form.cilindrada) : null,
          industria: form.industria,
          ruat: form.ruat,
          carnetProp: form.carnetProp,
          poliza: form.poliza,
          factura: form.factura ? parseInt(form.factura) : null,
          resMin: form.resMin,
          resAdm: form.resAdm,
          infTec: form.infTec,
          leyEstado: form.leyEstado,
          ds: form.ds,
          docTransf: form.docTransf,
          docCompVen: form.docCompVen,
          minuta: form.minuta,
          actaCoVe: form.actaCoVe,
          imagen: form.imagen
        }
      });
      alert('🚗 Ficha de vehículo guardada correctamente');
      setIsCreating(false);
      setEditingVehiculo(null);
      refetch();
    } catch (err: any) {
      alert('❌ Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (v: any) => {
    setForm({
      nroActivo: v.nroActivo?.nroActivo,
      tipo: v.tipo || '',
      marca: v.marca || '',
      modelo: v.modelo || '',
      anio: v.anio ? String(v.anio) : '',
      color: v.color || '',
      placa: v.placa || '',
      motor: v.motor || '',
      chasis: v.chasis || '',
      cilindrada: v.cilindrada ? String(v.cilindrada) : '',
      industria: v.industria || '',
      ruat: v.ruat || '',
      carnetProp: v.carnetProp || '',
      poliza: v.poliza || '',
      factura: v.factura ? String(v.factura) : '',
      resMin: v.resMin || '',
      resAdm: v.resAdm || '',
      infTec: v.infTec || '',
      leyEstado: v.leyEstado || '',
      ds: v.ds || '',
      docTransf: v.docTransf || '',
      docCompVen: v.docCompVen || '',
      minuta: v.minuta || '',
      actaCoVe: v.actaCoVe || '',
      imagen: v.imagen || ''
    });
    setEditingVehiculo(v);
  };

  const handleCreateClick = () => {
    setForm({
      nroActivo: '',
      tipo: '',
      marca: '',
      modelo: '',
      anio: '',
      color: '',
      placa: '',
      motor: '',
      chasis: '',
      cilindrada: '',
      industria: '',
      ruat: '',
      carnetProp: '',
      poliza: '',
      factura: '',
      resMin: '',
      resAdm: '',
      infTec: '',
      leyEstado: '',
      ds: '',
      docTransf: '',
      docCompVen: '',
      minuta: '',
      actaCoVe: '',
      imagen: ''
    });
    setIsCreating(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'Código Activo', 'Descripción', 'Placa', 'Tipo', 'Marca', 'Modelo',
      'Año', 'Color', 'Motor', 'Chasis', 'Cilindrada', 'Industria', 'RUAT',
      'Factura', 'Póliza', 'Nro Serie'
    ];
    
    const rows = filteredVehiculos.map((v: any) => [
      v.nroActivo?.codActivo || '',
      v.nroActivo?.descripcion || '',
      v.placa || '',
      v.tipo || '',
      v.marca || '',
      v.modelo || '',
      v.anio || '',
      v.color || '',
      v.motor || '',
      v.chasis || '',
      v.cilindrada || '',
      v.industria || '',
      v.ruat || '',
      v.factura || '',
      v.poliza || '',
      v.nroActivo?.nroSerie || ''
    ]);

    const csvContent = "\uFEFF" // UTF-8 BOM
      + [headers.join(';'), ...rows.map((r: any) => r.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(';'))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `flota_vehiculos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = (v: any) => {
    setPrintTarget(v);
  };

  useEffect(() => {
    if (printTarget) {
      const timer = setTimeout(() => {
        window.print();
        setPrintTarget(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printTarget]);

  if (loading) return <div className="loading">Cargando flota de vehículos...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const vehiculosList = filteredVehiculos;

  return (
    <div className="vehiculos-page">
      {/* CSS overrides for print layout */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .navbar, .btn, .no-print, .filters-panel, .vehiculos-page > *:not(.print-container) {
            display: none !important;
          }
          .print-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: white !important;
          }
        }
        .print-container {
          display: none;
        }
      `}</style>

      {/* RENDER NORMAL VIEW */}
      <div className="no-print">
        {/* Header */}
        <div className="page-header flex justify-between items-center mb-6">
          <div>
            <h1 className="page-title text-2xl font-bold text-slate-800">🚗 Flota de Vehículos</h1>
            <p className="text-slate-500 text-sm">Control y ficha técnica de los vehículos y equipo motorizado de la universidad.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-success flex items-center gap-1.5" onClick={handleExportCSV}>
              📥 Exportar CSV
            </button>
            <button className="btn btn-primary" onClick={handleCreateClick}>
              + Registrar Ficha
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm filters-panel">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Búsqueda</label>
              <input
                type="text"
                placeholder="Buscar por placa, marca, modelo, activo..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Tipo de Vehículo</label>
              <select
                value={tipoFiltro}
                onChange={e => setTipoFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos</option>
                {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Marca</label>
              <select
                value={marcaFiltro}
                onChange={e => setMarcaFiltro(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">Todas</option>
                {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Grid cards */}
        {vehiculosList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-sm">
            <span style={{ fontSize: '3rem' }}>🚗</span>
            <h3 className="text-lg font-bold text-slate-700 mt-2">No se encontraron vehículos</h3>
            <p className="text-slate-400 text-sm mt-1">Intente cambiar los filtros o registre un nuevo vehículo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehiculosList.map((v: any) => (
              <div key={v.nroActivo?.nroActivo} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group">
                {/* Card Image */}
                <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {v.imagen ? (
                    <img 
                      src={`http://localhost:8000${v.imagen}`} 
                      alt={`${v.marca} ${v.modelo}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src.includes('http://localhost:8000/media/')) {
                          img.src = v.imagen; 
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-300">
                      <span className="text-5xl">🚗</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Sin Fotografía</span>
                    </div>
                  )}

                  {/* Placa Badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/90 text-white font-mono px-3 py-1 rounded-md text-xs font-bold shadow-md border border-slate-700/50">
                    {v.placa ? v.placa.toUpperCase() : 'SIN PLACA'}
                  </div>

                  {/* Vehicle Type */}
                  {v.tipo && (
                    <div className="absolute bottom-3 left-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                      {v.tipo}
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 text-base leading-tight">
                        {v.marca || 'S/M'} {v.modelo || 'S/Mod'}
                      </h3>
                      {v.anio && <span className="text-xs font-bold text-slate-400">{v.anio}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex justify-between text-xs border-b border-slate-50 pb-1">
                        <span className="text-slate-400">Activo:</span>
                        <span className="font-mono font-bold text-blue-600">{v.nroActivo?.codActivo}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-slate-50 pb-1">
                        <span className="text-slate-400">Chasis:</span>
                        <span className="text-slate-700 font-mono text-[11px]">{v.chasis || '-'}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-slate-50 pb-1">
                        <span className="text-slate-400">Motor:</span>
                        <span className="text-slate-700 font-mono text-[11px]">{v.motor || '-'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Color / Cil.:</span>
                        <span className="text-slate-700 font-medium">{v.color || '-'} {v.cilindrada ? `/ ${v.cilindrada} cc` : ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                    <button 
                      className="btn btn-secondary btn-sm flex-1"
                      onClick={() => setSelectedVehiculo(v)}
                    >
                      👁️ Ficha
                    </button>
                    <button 
                      className="btn btn-warning btn-sm"
                      style={{ backgroundColor: '#f59e0b', color: 'white' }}
                      onClick={() => handleEditClick(v)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                      onClick={() => handlePrint(v)}
                    >
                      🖨️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL (FICHA TÉCNICA VIEW) */}
      {selectedVehiculo && (
        <div className="modal-overlay" onClick={() => setSelectedVehiculo(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '750px', maxWidth: '95vw', background: '#ffffff', color: '#1e293b', padding: '1.5rem' }}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-800">📄 Ficha Técnica Vehicular</h2>
              <button 
                onClick={() => setSelectedVehiculo(null)} 
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Print Area Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-inner overflow-y-auto max-height-[70vh]">
              <PrintableSheet vehicle={selectedVehiculo} />
            </div>

            <div className="modal-actions mt-4 pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button className="btn btn-primary" onClick={() => handlePrint(selectedVehiculo)}>
                🖨️ Imprimir Ficha
              </button>
              <button className="btn btn-secondary" onClick={() => setSelectedVehiculo(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE MODAL */}
      {(editingVehiculo || isCreating) && (
        <div className="modal-overlay" onClick={() => { setEditingVehiculo(null); setIsCreating(false); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ width: '800px', maxWidth: '95vw', padding: '1.5rem', background: '#ffffff', color: '#1e293b' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid #f0f2f5', paddingBottom: '0.5rem', background: '#ffffff' }}>
              <h2 className="modal-title" style={{ margin: 0, color: '#1a3c6e' }}>
                {isCreating ? '🚗 Registrar Ficha Técnica de Vehículo' : '✏️ Editar Ficha Técnica de Vehículo'}
              </h2>
              <button className="modal-close" onClick={() => { setEditingVehiculo(null); setIsCreating(false); }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '6px' }}>
              
              {/* Asset Selector (Only on Creation) */}
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Activo Fijo Relacionado *</label>
                {isCreating ? (
                  <select 
                    name="nroActivo" 
                    value={form.nroActivo} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px' }}
                  >
                    <option value="">Seleccionar activo...</option>
                    {availableAssets.map((a: any) => (
                      <option key={a.nroActivo} value={a.nroActivo}>
                        [{a.codActivo}] {a.descripcion}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a3c6e' }}>
                      [{editingVehiculo?.nroActivo?.codActivo}] {editingVehiculo?.nroActivo?.descripcion}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                {/* Image and Upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Fotografía</span>
                  <div style={{ width: '100%', height: '140px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', position: 'relative' }}>
                    {form.imagen ? (
                      <img 
                        src={`http://localhost:8000${form.imagen}`} 
                        alt="Vehículo" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.includes('http://localhost:8000/media/')) {
                            img.src = form.imagen; 
                          }
                        }}
                      />
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '2.5rem' }}>🚗</span>
                    )}
                    {uploading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(241, 245, 249, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#1a3c6e' }}>
                        Subiendo...
                      </div>
                    )}
                  </div>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', textAlign: 'center', width: '100%', display: 'block' }}>
                    {form.imagen ? 'Cambiar Foto' : 'Subir Foto'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                {/* Grid of Main Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Tipo de Vehículo</label>
                    <input type="text" name="tipo" value={form.tipo} onChange={handleChange} placeholder="Ej: Camioneta, Sedan" />
                  </div>
                  <div className="form-group">
                    <label>Placa</label>
                    <input type="text" name="placa" value={form.placa} onChange={handleChange} placeholder="Ej: 1234ABC" />
                  </div>
                  <div className="form-group">
                    <label>Marca</label>
                    <input type="text" name="marca" value={form.marca} onChange={handleChange} placeholder="Ej: Toyota" />
                  </div>
                  <div className="form-group">
                    <label>Modelo</label>
                    <input type="text" name="modelo" value={form.modelo} onChange={handleChange} placeholder="Ej: Hilux" />
                  </div>
                  <div className="form-group">
                    <label>Año</label>
                    <input type="number" name="anio" value={form.anio} onChange={handleChange} placeholder="Ej: 2020" />
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input type="text" name="color" value={form.color} onChange={handleChange} placeholder="Ej: Blanco" />
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.25rem 0' }} />

              <h3 style={{ fontSize: '0.9rem', color: '#1a3c6e', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Identificación y Mecánica</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Motor</label>
                  <input type="text" name="motor" value={form.motor} onChange={handleChange} placeholder="Nro de Motor" />
                </div>
                <div className="form-group">
                  <label>Chasis</label>
                  <input type="text" name="chasis" value={form.chasis} onChange={handleChange} placeholder="Nro de Chasis" />
                </div>
                <div className="form-group">
                  <label>Cilindrada (cc)</label>
                  <input type="number" name="cilindrada" value={form.cilindrada} onChange={handleChange} placeholder="Ej: 2400" />
                </div>
                <div className="form-group">
                  <label>Industria</label>
                  <input type="text" name="industria" value={form.industria} onChange={handleChange} placeholder="Ej: Japón" />
                </div>
                <div className="form-group">
                  <label>RUAT</label>
                  <input type="text" name="ruat" value={form.ruat} onChange={handleChange} placeholder="Nro RUAT" />
                </div>
                <div className="form-group">
                  <label>Carnet Propietario</label>
                  <input type="text" name="carnetProp" value={form.carnetProp} onChange={handleChange} placeholder="Nro CRP" />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.25rem 0' }} />

              <h3 style={{ fontSize: '0.9rem', color: '#1a3c6e', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Documentación y Resoluciones</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Póliza</label>
                  <input type="text" name="poliza" value={form.poliza} onChange={handleChange} placeholder="Nro de Póliza" />
                </div>
                <div className="form-group">
                  <label>Factura</label>
                  <input type="number" name="factura" value={form.factura} onChange={handleChange} placeholder="Nro de Factura" />
                </div>
                <div className="form-group">
                  <label>Res. Ministerial</label>
                  <input type="text" name="resMin" value={form.resMin} onChange={handleChange} placeholder="Resolución Min." />
                </div>
                <div className="form-group">
                  <label>Res. Administrativa</label>
                  <input type="text" name="resAdm" value={form.resAdm} onChange={handleChange} placeholder="Resolución Adm." />
                </div>
                <div className="form-group">
                  <label>Informe Técnico</label>
                  <input type="text" name="infTec" value={form.infTec} onChange={handleChange} placeholder="Informe Técnico" />
                </div>
                <div className="form-group">
                  <label>Ley del Estado</label>
                  <input type="text" name="leyEstado" value={form.leyEstado} onChange={handleChange} placeholder="Ley del Estado" />
                </div>
                <div className="form-group">
                  <label>D.S. (Decreto Supremo)</label>
                  <input type="text" name="ds" value={form.ds} onChange={handleChange} placeholder="Decreto Supremo" />
                </div>
                <div className="form-group">
                  <label>Doc. Transferencia</label>
                  <input type="text" name="docTransf" value={form.docTransf} onChange={handleChange} placeholder="Doc. Transferencia" />
                </div>
                <div className="form-group">
                  <label>Minuta</label>
                  <input type="text" name="minuta" value={form.minuta} onChange={handleChange} placeholder="Minuta de Compra/Venta" />
                </div>
                <div className="form-group">
                  <label>Doc. Compra Venta</label>
                  <input type="text" name="docCompVen" value={form.docCompVen} onChange={handleChange} placeholder="Doc. Compra/Venta" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Acta Compra Venta</label>
                  <input type="text" name="actaCoVe" value={form.actaCoVe} onChange={handleChange} placeholder="Acta de Compra/Venta" />
                </div>
              </div>

            </div>

            <div className="modal-actions" style={{ borderTop: '1px solid #f0f2f5', marginTop: '1rem', paddingTop: '0.75rem' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Guardando...' : 'Guardar Ficha'}
              </button>
              <button className="btn btn-secondary" onClick={() => { setEditingVehiculo(null); setIsCreating(false); }} disabled={saving}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT COMPONENT */}
      {printTarget && (
        <div className="print-container">
          <PrintableSheet vehicle={printTarget} />
        </div>
      )}
    </div>
  );
}

// ==================== PRINTABLE SHEET COMPONENT ====================
function PrintableSheet({ vehicle }: { vehicle: any }) {
  const v = vehicle;
  return (
    <div style={{ background: 'white', padding: '25px', color: 'black', fontFamily: '"Arial", sans-serif', maxWidth: '780px', margin: '0 auto', fontSize: '11px', lineHeight: '1.3' }}>
      
      {/* Institution Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '15px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '32px' }}>🏛️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO</h1>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#4a5568' }}>Dirección Universitaria de Activos Fijos</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'inline-block', border: '1.5px solid #1a3c6e', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#1a3c6e' }}>
            FICHA TÉCNICA VEHICULAR
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '15px', marginBottom: '15px' }}>
        {/* Left Side: General Asset & Vehicle Identifiers */}
        <div>
          <h2 style={{ background: '#f1f5f9', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase' }}>1. Identificación del Activo Fijo</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 0', fontWeight: 'bold', width: '110px' }}>Código Activo:</td>
                <td style={{ padding: '3px 0', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px' }}>{v.nroActivo?.codActivo}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Descripción:</td>
                <td style={{ padding: '3px 0' }}>{v.nroActivo?.descripcion}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Nro. Serie Activo:</td>
                <td style={{ padding: '3px 0' }}>{v.nroActivo?.nroSerie || 'S/N'}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Monto Adq. / Fecha:</td>
                <td style={{ padding: '3px 0' }}>
                  {v.nroActivo?.monto ? `Bs. ${parseFloat(v.nroActivo.monto).toLocaleString('es-BO', { minimumFractionDigits: 2 })}` : 'S/M'} 
                  {v.nroActivo?.fecAdqui ? ` — ${v.nroActivo.fecAdqui}` : ''}
                </td>
              </tr>
            </tbody>
          </table>

          <h2 style={{ background: '#f1f5f9', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase' }}>2. Especificaciones Principales del Vehículo</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 0', fontWeight: 'bold', width: '110px' }}>Placa de Control:</td>
                <td style={{ padding: '3px 0', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px', color: '#1e3a8a' }}>{v.placa || 'SIN PLACA'}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Tipo:</td>
                <td style={{ padding: '3px 0' }}>{v.tipo || 'No especificado'}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Marca / Modelo:</td>
                <td style={{ padding: '3px 0' }}>{v.marca || 'S/M'} / {v.modelo || 'S/Mod'}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Año / Color:</td>
                <td style={{ padding: '3px 0' }}>{v.anio || 'S/A'} / {v.color || 'S/C'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Side: Vehicle Image */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', height: '150px', border: '1.5px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', marginBottom: '5px' }}>
            {v.imagen ? (
              <img 
                src={`http://localhost:8000${v.imagen}`} 
                alt="Vehículo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src.includes('http://localhost:8000/media/')) {
                    img.src = v.imagen; 
                  }
                }}
              />
            ) : (
              <span style={{ fontSize: '40px' }}>🚗</span>
            )}
          </div>
          <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>FOTOGRAFÍA REGISTRADA</span>
        </div>
      </div>

      {/* Mechanical specifications */}
      <h2 style={{ background: '#f1f5f9', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase' }}>3. Datos Mecánicos e Identificadores</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold', width: '110px' }}>Número de Motor:</td>
              <td style={{ padding: '4px 0', fontFamily: 'monospace' }}>{v.motor || '-'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Número de Chasis:</td>
              <td style={{ padding: '4px 0', fontFamily: 'monospace' }}>{v.chasis || '-'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Cilindrada (cc):</td>
              <td style={{ padding: '4px 0' }}>{v.cilindrada ? `${v.cilindrada} cc` : '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>País Industria:</td>
              <td style={{ padding: '4px 0' }}>{v.industria || '-'}</td>
            </tr>
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold', width: '110px' }}>Nro. RUAT:</td>
              <td style={{ padding: '4px 0', fontFamily: 'monospace' }}>{v.ruat || '-'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>C. Propietario (CRP):</td>
              <td style={{ padding: '4px 0', fontFamily: 'monospace' }}>{v.carnetProp || '-'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Nro. Póliza Import:</td>
              <td style={{ padding: '4px 0' }}>{v.poliza || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Nro. Factura Compra:</td>
              <td style={{ padding: '4px 0' }}>{v.factura || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Resolutions and legal files */}
      <h2 style={{ background: '#f1f5f9', padding: '4px 8px', fontSize: '10px', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase' }}>4. Respaldos Legales y Resoluciones Administrativas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold', width: '130px' }}>Resolución Ministerial:</td>
              <td style={{ padding: '4px 0' }}>{v.resMin || '-'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Resolución Administrativa:</td>
              <td style={{ padding: '4px 0' }}>{v.resAdm || '-'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Informe Técnico:</td>
              <td style={{ padding: '4px 0' }}>{v.infTec || '-'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Ley del Estado:</td>
              <td style={{ padding: '4px 0' }}>{v.leyEstado || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Decreto Supremo (D.S.):</td>
              <td style={{ padding: '4px 0' }}>{v.ds || '-'}</td>
            </tr>
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold', width: '130px' }}>Doc. Transferencia:</td>
              <td style={{ padding: '4px 0' }}>{v.docTransf || '-'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Minuta Compra Venta:</td>
              <td style={{ padding: '4px 0' }}>{v.minuta || '-'}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Doc. Compra Venta:</td>
              <td style={{ padding: '4px 0' }}>{v.docCompVen || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '4px 0', fontWeight: 'bold' }}>Acta Compra Venta:</td>
              <td style={{ padding: '4px 0' }}>{v.actaCoVe || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature blocks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginTop: '60px', textAlign: 'center' }}>
        <div>
          <div style={{ borderTop: '1px solid #4a5568', width: '220px', margin: '0 auto 5px auto' }}></div>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '9px' }}>RESPONSABLE FLOTA VEHICULAR</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '8px', color: '#718096' }}>Dpto. Activos Fijos UAGRM</p>
        </div>
        <div>
          <div style={{ borderTop: '1px solid #4a5568', width: '220px', margin: '0 auto 5px auto' }}></div>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '9px' }}>DIRECTOR ADM. FINANCIERO</p>
          <p style={{ margin: '2px 0 0 0', fontSize: '8px', color: '#718096' }}>Autoridad Universitaria UAGRM</p>
        </div>
      </div>

      {/* Print Footer Metadata */}
      <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '40px', paddingTop: '5px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#718096' }}>
        <span>Fecha de Impresión: {new Date().toLocaleString('es-BO')}</span>
        <span>Sistema de Gestión de Activos Fijos UAGRM v2.0</span>
      </div>

    </div>
  );
}
