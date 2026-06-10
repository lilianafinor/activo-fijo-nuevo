import React, { useState, useMemo } from 'react';
import { useQuery, gql } from '@apollo/client';

// ==================== QUERY DE REPORTES GLOBALES ====================
const GET_REPORTES_DATA = gql`
  query GetReportesData {
    todosActivos(soloActivos: false) {
      nroActivo
      codActivo
      descripcion
      monto
      fecAdqui
      nroSerie
      aB
      codEstado { desEstado }
      codGrupo { codGrupo desGrupo }
      codMarca { desMarca }
      codModelo { desModelo }
      codCond { desCond }
      codProve { nombre }
    }
    ultimasDepreciaciones {
      nroSerie
      nroActivo {
        nroActivo
        codActivo
        descripcion
        monto
        codGrupo { desGrupo }
      }
      depresiacion
      acumulada
      valorActual
      valorRevaluo
    }
    todasAsignaciones(estado: "A") {
      codAsig
      fechaAsig
      fechaFin
      estado
      tipoResp
      codResp
      tipoAsig { tipoAsig des }
      codOfic {
        codOfic
        codDpto
        desDpto
        nivel
      }
      inDetAsigSet {
        cantidad
        nroActivo {
          nroActivo
          codActivo
          descripcion
          monto
        }
      }
    }
    todasTransferencias {
      codTransf
      fechaTransf
      estado
      codOfiRem { desDpto }
      codOfiDest { desDpto }
      inDetTranfSet {
        nroActivo {
          codActivo
          descripcion
        }
      }
    }
    todasSolicitudes(soloActivas: false) {
      nroSol
      gestion
      codEstprog
      glosa
      fecha
      aB
      empSol {
        codResp
        codEmp {
          nombre
          apellido
        }
      }
      empResp {
        codResp
        codEmp {
          nombre
          apellido
        }
      }
    }
    todosGrupos(soloActivos: false) {
      codGrupo
      desGrupo
    }
    todosEstados {
      codEstado
      desEstado
    }
    todasCondiciones {
      codCond
      desCond
    }
    todasOficinas(soloActivas: false) {
      codOfic
      desDpto
    }
  }
`;

// Helper: Formato de moneda local (Bolivianos)
const formatBs = (value: number) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(value);
};

export default function Reportes() {
  const [selectedReport, setSelectedReport] = useState<'inventario' | 'depreciacion' | 'asignacion' | 'transferencia' | 'solicitud' | 'bajas'>('inventario');

  // Estados de Filtros
  // Reporte 1: Inventario General
  const [filterInvGrupo, setFilterInvGrupo] = useState('');
  const [filterInvEstado, setFilterInvEstado] = useState('');
  const [filterInvCondicion, setFilterInvCondicion] = useState('');
  const [filterInvFechaDesde, setFilterInvFechaDesde] = useState('');
  const [filterInvFechaHasta, setFilterInvFechaHasta] = useState('');

  // Reporte 2: Depreciación
  const [filterDepGrupo, setFilterDepGrupo] = useState('');
  const [filterDepBusqueda, setFilterDepBusqueda] = useState('');

  // Reporte 3: Asignaciones
  const [filterAsigOficina, setFilterAsigOficina] = useState('');
  const [filterAsigResponsable, setFilterAsigResponsable] = useState('');

  // Reporte 4: Transferencias
  const [filterTransfEstado, setFilterTransfEstado] = useState('');
  const [filterTransfFechaDesde, setFilterTransfFechaDesde] = useState('');
  const [filterTransfFechaHasta, setFilterTransfFechaHasta] = useState('');

  // Reporte 5: Solicitudes
  const [filterSolGestion, setFilterSolGestion] = useState('');
  const [filterSolEstado, setFilterSolEstado] = useState('');

  // Reporte 6: Bajas
  const [filterBajaBusqueda, setFilterBajaBusqueda] = useState('');
  const [filterBajaFechaDesde, setFilterBajaFechaDesde] = useState('');
  const [filterBajaFechaHasta, setFilterBajaFechaHasta] = useState('');

  // Carga de datos
  const { data, loading, error } = useQuery(GET_REPORTES_DATA);

  // Mapeos rápidos de catálogos
  const grupos = data?.todosGrupos || [];
  const estados = data?.todosEstados || [];
  const condiciones = data?.todasCondiciones || [];
  const oficinas = data?.todasOficinas || [];

  // ==================== LÓGICA DE FILTRADO Y PROCESAMIENTO ====================

  // 1. Inventario General (Excluye bajas aB === 'B')
  const inventarioFiltrado = useMemo(() => {
    let list = data?.todosActivos || [];
    list = list.filter((a: any) => a.aB !== 'B');

    if (filterInvGrupo) {
      list = list.filter((a: any) => a.codGrupo?.codGrupo === parseInt(filterInvGrupo));
    }
    if (filterInvEstado) {
      list = list.filter((a: any) => a.codEstado?.desEstado === filterInvEstado);
    }
    if (filterInvCondicion) {
      list = list.filter((a: any) => a.codCond?.desCond === filterInvCondicion);
    }
    if (filterInvFechaDesde) {
      list = list.filter((a: any) => a.fecAdqui >= filterInvFechaDesde);
    }
    if (filterInvFechaHasta) {
      list = list.filter((a: any) => a.fecAdqui <= filterInvFechaHasta);
    }
    return list;
  }, [data, filterInvGrupo, filterInvEstado, filterInvCondicion, filterInvFechaDesde, filterInvFechaHasta]);

  // 2. Estado de Depreciación y Libros
  const depreciacionFiltrada = useMemo(() => {
    let list = data?.ultimasDepreciaciones || [];

    if (filterDepGrupo) {
      list = list.filter((d: any) => d.nroActivo?.codGrupo?.desGrupo === filterDepGrupo);
    }
    if (filterDepBusqueda) {
      const q = filterDepBusqueda.toLowerCase();
      list = list.filter((d: any) => 
        d.nroActivo?.descripcion?.toLowerCase().includes(q) || 
        d.nroActivo?.codActivo?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, filterDepGrupo, filterDepBusqueda]);

  // 3. Asignación por Oficina
  const asignacionFiltrada = useMemo(() => {
    let list = data?.todasAsignaciones || [];

    if (filterAsigOficina) {
      list = list.filter((a: any) => a.codOfic?.codOfic === parseInt(filterAsigOficina));
    }
    if (filterAsigResponsable) {
      const q = filterAsigResponsable.toLowerCase();
      list = list.filter((a: any) => String(a.codResp).includes(q)); // En BD se almacena codResp (ID de responsable)
    }
    return list;
  }, [data, filterAsigOficina, filterAsigResponsable]);

  // 4. Historial de Transferencias
  const transferenciaFiltrada = useMemo(() => {
    let list = data?.todasTransferencias || [];

    if (filterTransfEstado) {
      list = list.filter((t: any) => t.estado === filterTransfEstado);
    }
    if (filterTransfFechaDesde) {
      list = list.filter((t: any) => t.fechaTransf >= filterTransfFechaDesde);
    }
    if (filterTransfFechaHasta) {
      list = list.filter((t: any) => t.fechaTransf <= filterTransfFechaHasta);
    }
    return list;
  }, [data, filterTransfEstado, filterTransfFechaDesde, filterTransfFechaHasta]);

  // 5. Control de Solicitudes de Compra
  const solicitudFiltrada = useMemo(() => {
    let list = data?.todasSolicitudes || [];

    if (filterSolGestion) {
      list = list.filter((s: any) => s.gestion === parseInt(filterSolGestion));
    }
    if (filterSolEstado) {
      list = list.filter((s: any) => s.aB === filterSolEstado);
    }
    return list;
  }, [data, filterSolGestion, filterSolEstado]);

  // 6. Bajas de Activos (Retiros)
  const bajasFiltradas = useMemo(() => {
    let list = data?.todosActivos || [];
    list = list.filter((a: any) => a.aB === 'B');

    if (filterBajaBusqueda) {
      const q = filterBajaBusqueda.toLowerCase();
      list = list.filter((a: any) => 
        a.descripcion?.toLowerCase().includes(q) || 
        a.codActivo?.toLowerCase().includes(q)
      );
    }
    if (filterBajaFechaDesde) {
      list = list.filter((a: any) => a.fecAdqui >= filterBajaFechaDesde); // Usamos adquisición a falta de campo fecBaja directo en schema básico
    }
    if (filterBajaFechaHasta) {
      list = list.filter((a: any) => a.fecAdqui <= filterBajaFechaHasta);
    }
    return list;
  }, [data, filterBajaBusqueda, filterBajaFechaDesde, filterBajaFechaHasta]);

  // ==================== OPERACIONES DE EXPORTACIÓN ====================
  const exportarCSV = (tipo: string) => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `Reporte_${tipo}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (tipo === 'inventario') {
      headers = ['Código de Activo', 'Descripción', 'Grupo Contable', 'Marca', 'Modelo', 'Estado Físico', 'Condición', 'Fecha Adquisición', 'Valor Original (Bs)'];
      rows = inventarioFiltrado.map((a: any) => [
        a.codActivo || '-',
        `"${(a.descripcion || '').replace(/"/g, '""')}"`,
        `"${a.codGrupo?.desGrupo || '-'}"`,
        `"${a.codMarca?.desMarca || '-'}"`,
        `"${a.codModelo?.desModelo || '-'}"`,
        a.codEstado?.desEstado || '-',
        a.codCond?.desCond || '-',
        a.fecAdqui || '-',
        String(a.monto || 0)
      ]);
    } else if (tipo === 'depreciacion') {
      headers = ['Código de Activo', 'Descripción', 'Grupo Contable', 'Costo Original (Bs)', 'Depreciación Período (Bs)', 'Depreciación Acumulada (Bs)', 'Valor Residual Neto (Bs)', '% Depreciado'];
      rows = depreciacionFiltrada.map((d: any) => {
        const costo = d.nroActivo?.monto || 0;
        const pct = costo > 0 ? ((d.acumulada / costo) * 100).toFixed(1) : '0.0';
        return [
          d.nroActivo?.codActivo || '-',
          `"${(d.nroActivo?.descripcion || '').replace(/"/g, '""')}"`,
          `"${d.nroActivo?.codGrupo?.desGrupo || '-'}"`,
          String(costo),
          String(d.depresiacion || 0),
          String(d.acumulada || 0),
          String(d.valorActual || 0),
          pct
        ];
      });
    } else if (tipo === 'asignacion') {
      headers = ['Código Asignación', 'Fecha Registro', 'Código Responsable', 'Tipo de Asignación', 'Oficina / Unidad', 'Nivel Oficina', 'Total Activos Custodiados', 'Valor Total Custodiado (Bs)'];
      rows = asignacionFiltrada.map((as: any) => {
        const qty = as.inDetAsigSet?.reduce((acc: number, curr: any) => acc + (curr.cantidad || 1), 0) || 0;
        const val = as.inDetAsigSet?.reduce((acc: number, curr: any) => acc + ((curr.nroActivo?.monto || 0) * (curr.cantidad || 1)), 0) || 0;
        return [
          `#${as.codAsig}`,
          as.fechaAsig || '-',
          `Resp #${as.codResp}`,
          as.tipoAsig?.des || '-',
          `"${as.codOfic?.desDpto || '-'}"`,
          String(as.codOfic?.nivel || 0),
          String(qty),
          String(val)
        ];
      });
    } else if (tipo === 'transferencia') {
      headers = ['Nro Transferencia', 'Fecha Movimiento', 'Estado', 'Oficina Remitente', 'Oficina Destinataria', 'Activos Transferidos'];
      rows = transferenciaFiltrada.map((t: any) => {
        const assetsText = t.inDetTranfSet?.map((d: any) => `${d.nroActivo?.codActivo || ''} (${d.nroActivo?.descripcion || ''})`).join(', ') || '-';
        const labels: Record<string, string> = { 'P': 'Pendiente', 'A': 'Aprobada', 'C': 'Completada', 'R': 'Rechazada' };
        return [
          `#${t.codTransf}`,
          t.fechaTransf || '-',
          labels[t.estado] || t.estado,
          `"${t.codOfiRem?.desDpto || '-'}"`,
          `"${t.codOfiDest?.desDpto || '-'}"`,
          `"${assetsText.replace(/"/g, '""')}"`
        ];
      });
    } else if (tipo === 'solicitud') {
      headers = ['Nro Solicitud', 'Gestión Anual', 'Estructura Prog.', 'Concepto / Glosa', 'Fecha Solicitud', 'Solicitado Por', 'Autorizador Resp.', 'Estado Proceso'];
      rows = solicitudFiltrada.map((s: any) => {
        const labels: Record<string, string> = { 'A': 'Pendiente', 'P': 'Aprobada', 'R': 'Rechazada', 'B': 'Anulada' };
        return [
          `#${s.nroSol}`,
          String(s.gestion),
          s.codEstprog || '-',
          `"${(s.glosa || '').replace(/"/g, '""')}"`,
          s.fecha || '-',
          `"${s.empSol ? `${s.empSol.codEmp?.nombre || ''} ${s.empSol.codEmp?.apellido || ''}`.trim() : '-'}"`,
          `"${s.empResp ? `${s.empResp.codEmp?.nombre || ''} ${s.empResp.codEmp?.apellido || ''}`.trim() : '-'}"`,
          labels[s.aB] || s.aB
        ];
      });
    } else if (tipo === 'bajas') {
      headers = ['Código de Activo', 'Descripción', 'Grupo Contable', 'Marca', 'Modelo', 'Fecha Adquisición', 'Costo Eliminado (Bs)'];
      rows = bajasFiltradas.map((a: any) => [
        a.codActivo || '-',
        `"${(a.descripcion || '').replace(/"/g, '""')}"`,
        `"${a.codGrupo?.desGrupo || '-'}"`,
        `"${a.codMarca?.desMarca || '-'}"`,
        `"${a.codModelo?.desModelo || '-'}"`,
        a.fecAdqui || '-',
        String(a.monto || 0)
      ]);
    }

    // Exportación con BOM de UTF-8 para Excel en español y punto y coma
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((e: string[]) => e.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // ==================== RENDERS DE COMPONENTES DE FILTROS ====================
  const renderFiltros = () => {
    switch (selectedReport) {
      case 'inventario':
        return (
          <div className="report-filters-grid">
            <div className="filter-item">
              <label>Grupo Contable</label>
              <select value={filterInvGrupo} onChange={e => setFilterInvGrupo(e.target.value)}>
                <option value="">Todos los grupos...</option>
                {grupos.map((g: any) => (
                  <option key={g.codGrupo} value={g.codGrupo}>{g.desGrupo}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Estado Físico</label>
              <select value={filterInvEstado} onChange={e => setFilterInvEstado(e.target.value)}>
                <option value="">Todos los estados...</option>
                {estados.map((es: any) => (
                  <option key={es.codEstado} value={es.desEstado}>{es.desEstado}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Condición de Adq.</label>
              <select value={filterInvCondicion} onChange={e => setFilterInvCondicion(e.target.value)}>
                <option value="">Todas las condiciones...</option>
                {condiciones.map((c: any) => (
                  <option key={c.codCond} value={c.desCond}>{c.desCond}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Adquisición Desde</label>
              <input type="date" value={filterInvFechaDesde} onChange={e => setFilterInvFechaDesde(e.target.value)} />
            </div>
            <div className="filter-item">
              <label>Adquisición Hasta</label>
              <input type="date" value={filterInvFechaHasta} onChange={e => setFilterInvFechaHasta(e.target.value)} />
            </div>
          </div>
        );

      case 'depreciacion':
        return (
          <div className="report-filters-grid">
            <div className="filter-item">
              <label>Grupo Contable</label>
              <select value={filterDepGrupo} onChange={e => setFilterDepGrupo(e.target.value)}>
                <option value="">Todos los grupos...</option>
                {grupos.map((g: any) => (
                  <option key={g.codGrupo} value={g.desGrupo}>{g.desGrupo}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Búsqueda Activo</label>
              <input 
                type="text" 
                placeholder="Buscar por descripción o código..." 
                value={filterDepBusqueda} 
                onChange={e => setFilterDepBusqueda(e.target.value)} 
              />
            </div>
          </div>
        );

      case 'asignacion':
        return (
          <div className="report-filters-grid">
            <div className="filter-item">
              <label>Oficina / Unidad</label>
              <select value={filterAsigOficina} onChange={e => setFilterAsigOficina(e.target.value)}>
                <option value="">Todas las oficinas...</option>
                {oficinas.map((o: any) => (
                  <option key={o.codOfic} value={o.codOfic}>{o.desDpto}</option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>ID de Responsable</label>
              <input 
                type="text" 
                placeholder="ID de responsable..." 
                value={filterAsigResponsable} 
                onChange={e => setFilterAsigResponsable(e.target.value)} 
              />
            </div>
          </div>
        );

      case 'transferencia':
        return (
          <div className="report-filters-grid">
            <div className="filter-item">
              <label>Estado Transferencia</label>
              <select value={filterTransfEstado} onChange={e => setFilterTransfEstado(e.target.value)}>
                <option value="">Todos los estados...</option>
                <option value="P">Pendiente</option>
                <option value="A">Aprobado</option>
                <option value="C">Completado</option>
                <option value="R">Rechazado</option>
              </select>
            </div>
            <div className="filter-item">
              <label>Fecha Desde</label>
              <input type="date" value={filterTransfFechaDesde} onChange={e => setFilterTransfFechaDesde(e.target.value)} />
            </div>
            <div className="filter-item">
              <label>Fecha Hasta</label>
              <input type="date" value={filterTransfFechaHasta} onChange={e => setFilterTransfFechaHasta(e.target.value)} />
            </div>
          </div>
        );

      case 'solicitud':
        return (
          <div className="report-filters-grid">
            <div className="filter-item">
              <label>Gestión Fiscal</label>
              <input 
                type="number" 
                placeholder="Ej. 2026" 
                value={filterSolGestion} 
                onChange={e => setFilterSolGestion(e.target.value)} 
              />
            </div>
            <div className="filter-item">
              <label>Estado de Solicitud</label>
              <select value={filterSolEstado} onChange={e => setFilterSolEstado(e.target.value)}>
                <option value="">Todos los estados...</option>
                <option value="A">Pendiente (A)</option>
                <option value="P">Aprobada (P)</option>
                <option value="R">Rechazada (R)</option>
                <option value="B">Anulada (B)</option>
              </select>
            </div>
          </div>
        );

      case 'bajas':
        return (
          <div className="report-filters-grid">
            <div className="filter-item">
              <label>Búsqueda Activo Dado de Baja</label>
              <input 
                type="text" 
                placeholder="Buscar por descripción o código..." 
                value={filterBajaBusqueda} 
                onChange={e => setFilterBajaBusqueda(e.target.value)} 
              />
            </div>
            <div className="filter-item">
              <label>Retiro Desde</label>
              <input type="date" value={filterBajaFechaDesde} onChange={e => setFilterBajaFechaDesde(e.target.value)} />
            </div>
            <div className="filter-item">
              <label>Retiro Hasta</label>
              <input type="date" value={filterBajaFechaHasta} onChange={e => setFilterBajaFechaHasta(e.target.value)} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // ==================== RENDERS DE COMPONENTES KPI ====================
  const renderKPIs = () => {
    if (selectedReport === 'inventario') {
      const totalCount = inventarioFiltrado.length;
      const totalAmount = inventarioFiltrado.reduce((acc: number, curr: any) => acc + (curr.monto || 0), 0);
      const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
      return (
        <div className="kpi-grid">
          <div className="kpi-card blue">
            <div className="kpi-label">Total Activos Registrados</div>
            <div className="kpi-value">{totalCount} uds.</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-label">Valor Total Inventario</div>
            <div className="kpi-value">{formatBs(totalAmount)}</div>
          </div>
          <div className="kpi-card purple">
            <div className="kpi-label">Costo Promedio Unitario</div>
            <div className="kpi-value">{formatBs(avgAmount)}</div>
          </div>
        </div>
      );
    }

    if (selectedReport === 'depreciacion') {
      const totalCount = depreciacionFiltrada.length;
      const originalCost = depreciacionFiltrada.reduce((acc: number, curr: any) => acc + (curr.nroActivo?.monto || 0), 0);
      const accumulatedDep = depreciacionFiltrada.reduce((acc: number, curr: any) => acc + (curr.acumulada || 0), 0);
      const bookValue = depreciacionFiltrada.reduce((acc: number, curr: any) => acc + (curr.valorActual || 0), 0);
      return (
        <div className="kpi-grid">
          <div className="kpi-card blue">
            <div className="kpi-label">Activos Depreciados</div>
            <div className="kpi-value">{totalCount} uds.</div>
          </div>
          <div className="kpi-card orange">
            <div className="kpi-label">Costo de Adquisición</div>
            <div className="kpi-value">{formatBs(originalCost)}</div>
          </div>
          <div className="kpi-card red">
            <div className="kpi-label">Depreciación Acumulada</div>
            <div className="kpi-value">{formatBs(accumulatedDep)}</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-label">Valor Neto Residual (Libros)</div>
            <div className="kpi-value">{formatBs(bookValue)}</div>
          </div>
        </div>
      );
    }

    if (selectedReport === 'asignacion') {
      const officesCount = new Set(asignacionFiltrada.map((a: any) => a.codOfic?.codOfic)).size;
      const totalCustodiado = asignacionFiltrada.reduce((acc: number, curr: any) => {
        const sub = curr.inDetAsigSet?.reduce((subAcc: number, c: any) => subAcc + (c.cantidad || 1), 0) || 0;
        return acc + sub;
      }, 0);
      const totalValorCustodiado = asignacionFiltrada.reduce((acc: number, curr: any) => {
        const subVal = curr.inDetAsigSet?.reduce((subAcc: number, c: any) => subAcc + ((c.nroActivo?.monto || 0) * (c.cantidad || 1)), 0) || 0;
        return acc + subVal;
      }, 0);
      return (
        <div className="kpi-grid">
          <div className="kpi-card blue">
            <div className="kpi-label">Oficinas / Unidades</div>
            <div className="kpi-value">{officesCount} u.</div>
          </div>
          <div className="kpi-card orange">
            <div className="kpi-label">Total Activos Asignados</div>
            <div className="kpi-value">{totalCustodiado} uds.</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-label">Valor en Custodia Directa</div>
            <div className="kpi-value">{formatBs(totalValorCustodiado)}</div>
          </div>
        </div>
      );
    }

    if (selectedReport === 'transferencia') {
      const total = transferenciaFiltrada.length;
      const completed = transferenciaFiltrada.filter((t: any) => t.estado === 'C').length;
      const pending = transferenciaFiltrada.filter((t: any) => t.estado === 'P').length;
      return (
        <div className="kpi-grid">
          <div className="kpi-card blue">
            <div className="kpi-label">Transferencias Totales</div>
            <div className="kpi-value">{total} transacciones</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-label">Completadas e Integradas</div>
            <div className="kpi-value">{completed} uds.</div>
          </div>
          <div className="kpi-card orange">
            <div className="kpi-label">Pendientes de Firma</div>
            <div className="kpi-value">{pending} uds.</div>
          </div>
        </div>
      );
    }

    if (selectedReport === 'solicitud') {
      const total = solicitudFiltrada.length;
      const aprobadas = solicitudFiltrada.filter((s: any) => s.aB === 'P').length;
      const pendientes = solicitudFiltrada.filter((s: any) => s.aB === 'A').length;
      const rechazadaAnulada = solicitudFiltrada.filter((s: any) => s.aB === 'R' || s.aB === 'B').length;
      return (
        <div className="kpi-grid">
          <div className="kpi-card blue">
            <div className="kpi-label">Solicitudes Totales</div>
            <div className="kpi-value">{total} req.</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-label">Aprobadas / Procesando</div>
            <div className="kpi-value">{aprobadas} req.</div>
          </div>
          <div className="kpi-card orange">
            <div className="kpi-label">Pendientes de Aprobación</div>
            <div className="kpi-value">{pendientes} req.</div>
          </div>
          <div className="kpi-card red">
            <div className="kpi-label">Rechazadas o Anuladas</div>
            <div className="kpi-value">{rechazadaAnulada} req.</div>
          </div>
        </div>
      );
    }

    if (selectedReport === 'bajas') {
      const total = bajasFiltradas.length;
      const totalAmount = bajasFiltradas.reduce((acc: number, curr: any) => acc + (curr.monto || 0), 0);
      return (
        <div className="kpi-grid">
          <div className="kpi-card red">
            <div className="kpi-label">Activos Dados de Baja</div>
            <div className="kpi-value">{total} uds.</div>
          </div>
          <div className="kpi-card dark-gray">
            <div className="kpi-label">Total Costo Retirado</div>
            <div className="kpi-value">{formatBs(totalAmount)}</div>
          </div>
        </div>
      );
    }
  };

  // ==================== RENDERS DE COMPONENTES DE TABLA ====================
  const renderTabla = () => {
    if (selectedReport === 'inventario') {
      return (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Grupo Contable</th>
              <th>Marca/Modelo</th>
              <th>Estado Físico</th>
              <th>Condición</th>
              <th>Fec. Adq.</th>
              <th style={{ textAlign: 'right' }}>Valor Original</th>
            </tr>
          </thead>
          <tbody>
            {inventarioFiltrado.length === 0 ? (
              <tr><td colSpan={8} className="empty">No se encontraron activos para los filtros seleccionados</td></tr>
            ) : (
              inventarioFiltrado.map((a: any) => (
                <tr key={a.nroActivo}>
                  <td><strong>{a.codActivo || '-'}</strong></td>
                  <td>{a.descripcion || '-'}</td>
                  <td>{a.codGrupo?.desGrupo || '-'}</td>
                  <td>{a.codMarca?.desMarca || '-'} / {a.codModelo?.desModelo || '-'}</td>
                  <td>
                    <span className="badge badge-info">{a.codEstado?.desEstado || 'Sin estado'}</span>
                  </td>
                  <td>{a.codCond?.desCond || '-'}</td>
                  <td>{a.fecAdqui || '-'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatBs(a.monto || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (selectedReport === 'depreciacion') {
      return (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
              <th>Grupo Contable</th>
              <th style={{ textAlign: 'right' }}>Costo Original</th>
              <th style={{ textAlign: 'right' }}>Dep. Período</th>
              <th style={{ textAlign: 'right' }}>Dep. Acumulada</th>
              <th style={{ textAlign: 'right' }}>Valor Libros</th>
              <th style={{ width: '120px' }}>% Depreciado</th>
            </tr>
          </thead>
          <tbody>
            {depreciacionFiltrada.length === 0 ? (
              <tr><td colSpan={8} className="empty">No se encontraron registros de depreciación</td></tr>
            ) : (
              depreciacionFiltrada.map((d: any) => {
                const costo = d.nroActivo?.monto || 0;
                const pct = costo > 0 ? Math.min(100, Math.round((d.acumulada / costo) * 100)) : 0;
                return (
                  <tr key={d.nroActivo?.nroActivo}>
                    <td><strong>{d.nroActivo?.codActivo || '-'}</strong></td>
                    <td>{d.nroActivo?.descripcion || '-'}</td>
                    <td>{d.nroActivo?.codGrupo?.desGrupo || '-'}</td>
                    <td style={{ textAlign: 'right' }}>{formatBs(costo)}</td>
                    <td style={{ textAlign: 'right', color: '#dc3545' }}>-{formatBs(d.depresiacion || 0)}</td>
                    <td style={{ textAlign: 'right', color: '#dc3545', fontWeight: 500 }}>-{formatBs(d.acumulada || 0)}</td>
                    <td style={{ textAlign: 'right', color: '#2d6a4f', fontWeight: 600 }}>{formatBs(d.valorActual || 0)}</td>
                    <td>
                      <div className="dep-progress-container" title={`${pct}% depreciado`}>
                        <div className="dep-progress-bar" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#dc3545' : pct > 50 ? '#f0a500' : '#2d6a4f' }} />
                        <span className="dep-progress-text">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      );
    }

    if (selectedReport === 'asignacion') {
      return (
        <div className="accordion-print-container">
          {asignacionFiltrada.length === 0 ? (
            <div className="empty" style={{ padding: '2rem', background: 'white', borderRadius: '10px' }}>
              No se encontraron asignaciones de activos activas
            </div>
          ) : (
            asignacionFiltrada.map((as: any) => {
              const subVal = as.inDetAsigSet?.reduce((acc: number, curr: any) => acc + ((curr.nroActivo?.monto || 0) * (curr.cantidad || 1)), 0) || 0;
              const subQty = as.inDetAsigSet?.reduce((acc: number, curr: any) => acc + (curr.cantidad || 1), 0) || 0;
              return (
                <div className="office-card" key={as.codAsig}>
                  <div className="office-card-header">
                    <div>
                      <h3>🏢 {as.codOfic?.desDpto || 'Sin Oficina'}</h3>
                      <p>
                        <span>Código Oficina: <strong>#{as.codOfic?.codOfic}</strong></span>
                        <span style={{ marginLeft: '1.5rem' }}>Responsable Asignación: <strong>Resp #{as.codResp}</strong></span>
                        <span style={{ marginLeft: '1.5rem' }}>Fecha: <strong>{as.fechaAsig}</strong></span>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="office-stats">
                        <span>{subQty} activos custodio</span> | <strong style={{ color: '#2d6a4f' }}>{formatBs(subVal)}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="office-card-body">
                    <table>
                      <thead>
                        <tr>
                          <th>Cod Activo</th>
                          <th>Descripción del Activo</th>
                          <th style={{ textAlign: 'right' }}>Valor Original</th>
                        </tr>
                      </thead>
                      <tbody>
                        {as.inDetAsigSet?.length === 0 ? (
                          <tr><td colSpan={3} className="empty">No hay activos detallados en esta asignación</td></tr>
                        ) : (
                          as.inDetAsigSet.map((det: any) => (
                            <tr key={det.nroActivo?.nroActivo}>
                              <td><strong>{det.nroActivo?.codActivo}</strong></td>
                              <td>{det.nroActivo?.descripcion}</td>
                              <td style={{ textAlign: 'right' }}>{formatBs(det.nroActivo?.monto || 0)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      );
    }

    if (selectedReport === 'transferencia') {
      const labels: Record<string, string> = { 'P': 'Pendiente', 'A': 'Aprobada', 'C': 'Completada', 'R': 'Rechazada' };
      const classes: Record<string, string> = { 'P': 'badge-warning', 'A': 'badge-success', 'C': 'badge-info', 'R': 'badge-danger' };
      return (
        <table>
          <thead>
            <tr>
              <th>Nro.</th>
              <th>Fecha Movimiento</th>
              <th>Oficina Origen (Remitente)</th>
              <th>Oficina Destino (Receptora)</th>
              <th>Activos de la Transferencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {transferenciaFiltrada.length === 0 ? (
              <tr><td colSpan={6} className="empty">No se encontraron transferencias</td></tr>
            ) : (
              transferenciaFiltrada.map((t: any) => (
                <tr key={t.codTransf}>
                  <td><strong>#{t.codTransf}</strong></td>
                  <td>{t.fechaTransf || '-'}</td>
                  <td>{t.codOfiRem?.desDpto || '-'}</td>
                  <td>{t.codOfiDest?.desDpto || '-'}</td>
                  <td>
                    <ul className="mini-assets-list">
                      {t.inDetTranfSet?.map((det: any, index: number) => (
                        <li key={index}>
                          <code>{det.nroActivo?.codActivo}</code> - {det.nroActivo?.descripcion}
                        </li>
                      )) || <li>-</li>}
                    </ul>
                  </td>
                  <td>
                    <span className={`badge ${classes[t.estado] || 'badge-secondary'}`}>
                      {labels[t.estado] || t.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (selectedReport === 'solicitud') {
      const labels: Record<string, string> = { 'A': 'Pendiente', 'P': 'Aprobada', 'R': 'Rechazada', 'B': 'Anulada' };
      const classes: Record<string, string> = { 'A': 'badge-warning', 'P': 'badge-success', 'R': 'badge-danger', 'B': 'badge-secondary' };
      return (
        <table>
          <thead>
            <tr>
              <th>Nro.</th>
              <th>Gestión</th>
              <th>Fecha</th>
              <th>Concepto / Glosa</th>
              <th>Empleado Solicitante</th>
              <th>Autorizador Responsable</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {solicitudFiltrada.length === 0 ? (
              <tr><td colSpan={7} className="empty">No se encontraron solicitudes de compra</td></tr>
            ) : (
              solicitudFiltrada.map((s: any) => (
                <tr key={s.nroSol}>
                  <td><strong>#{s.nroSol}</strong></td>
                  <td>{s.gestion}</td>
                  <td>{s.fecha || '-'}</td>
                  <td>{s.glosa || '-'}</td>
                  <td>{s.empSol ? `${s.empSol.codEmp?.nombre || ''} ${s.empSol.codEmp?.apellido || ''}`.trim() : '-'}</td>
                  <td>{s.empResp ? `${s.empResp.codEmp?.nombre || ''} ${s.empResp.codEmp?.apellido || ''}`.trim() : '-'}</td>
                  <td>
                    <span className={`badge ${classes[s.aB] || 'badge-secondary'}`}>
                      {labels[s.aB] || s.aB}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (selectedReport === 'bajas') {
      return (
        <table>
          <thead>
            <tr>
              <th>Código Activo</th>
              <th>Descripción</th>
              <th>Grupo Contable</th>
              <th>Marca/Modelo</th>
              <th>Fecha Adquisición</th>
              <th style={{ textAlign: 'right' }}>Costo Dado de Baja</th>
            </tr>
          </thead>
          <tbody>
            {bajasFiltradas.length === 0 ? (
              <tr><td colSpan={6} className="empty">No se encontraron activos dados de baja</td></tr>
            ) : (
              bajasFiltradas.map((a: any) => (
                <tr key={a.nroActivo}>
                  <td><strong style={{ color: '#dc3545' }}>{a.codActivo}</strong></td>
                  <td>{a.descripcion || '-'}</td>
                  <td>{a.codGrupo?.desGrupo || '-'}</td>
                  <td>{a.codMarca?.desMarca || '-'} / {a.codModelo?.desModelo || '-'}</td>
                  <td>{a.fecAdqui || '-'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#dc3545' }}>{formatBs(a.monto || 0)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }
  };

  const getReportTitle = () => {
    switch (selectedReport) {
      case 'inventario': return 'Inventario General de Activos';
      case 'depreciacion': return 'Estado de Depreciaciones y Libros';
      case 'asignacion': return 'Asignaciones de Activos por Oficina';
      case 'transferencia': return 'Historial de Transferencias Realizadas';
      case 'solicitud': return 'Control de Solicitudes de Compra';
      case 'bajas': return 'Bajas y Retiros de Activos';
    }
  };

  if (loading) return <div className="loading">Consultando registros y estructurando reportes...</div>;
  if (error) return <div className="error">Error de conexión con el servidor: {error.message}</div>;

  return (
    <div className="reportes-page-wrapper">
      {/* Estilos CSS Inline dinámicos e inyecciones para impresión */}
      <style dangerouslySetInnerHTML={{ __html: `
        .reportes-page-wrapper {
          display: flex;
          gap: 1.5rem;
          min-height: calc(100vh - 100px);
        }

        .reportes-sidebar {
          width: 280px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          padding: 1.5rem;
          flex-shrink: 0;
          height: fit-content;
        }

        .reportes-sidebar h2 {
          font-size: 1.1rem;
          color: #1a3c6e;
          margin-bottom: 1.2rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f0f2f5;
        }

        .reportes-sidebar ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .reportes-sidebar li {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
        }

        .reportes-sidebar li:hover {
          background: #f0f2f5;
          color: #1a3c6e;
        }

        .reportes-sidebar li.active {
          background: linear-gradient(135deg, #1a3c6e 0%, #2a5298 100%);
          color: white;
          box-shadow: 0 4px 10px rgba(26,60,110,0.2);
        }

        .reportes-main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .report-content-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          padding: 2rem;
        }

        .report-header-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1.5px solid #f0f2f5;
        }

        .report-header-title h1 {
          font-size: 1.4rem;
          color: #1a3c6e;
          font-weight: 700;
        }

        .report-header-title p {
          font-size: 0.82rem;
          color: #777;
          margin-top: 0.2rem;
        }

        .report-actions {
          display: flex;
          gap: 0.5rem;
        }

        .report-filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          background: #f8f9fa;
          padding: 1.25rem;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          margin-bottom: 1.5rem;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .filter-item label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #666;
        }

        .filter-item select, .filter-item input {
          padding: 0.4rem 0.6rem;
          font-size: 0.85rem;
          border: 1.5px solid #ddd;
          border-radius: 6px;
          background: white;
        }

        .filter-item select:focus, .filter-item input:focus {
          outline: none;
          border-color: #1a3c6e;
        }

        /* KPIs */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .kpi-card {
          padding: 1.25rem;
          border-radius: 10px;
          background: #fff;
          border-left: 5px solid #6c757d;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .kpi-card.blue { border-left-color: #1a3c6e; background: #f0f4f8; }
        .kpi-card.green { border-left-color: #2d6a4f; background: #eef7f2; }
        .kpi-card.purple { border-left-color: #6f42c1; background: #f6f0fa; }
        .kpi-card.orange { border-left-color: #f0a500; background: #fefcf3; }
        .kpi-card.red { border-left-color: #dc3545; background: #fdf5f6; }
        .kpi-card.dark-gray { border-left-color: #343a40; background: #f1f2f4; }

        .kpi-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .kpi-value {
          font-size: 1.35rem;
          font-weight: 700;
          color: #333;
        }

        /* Progress bars contables */
        .dep-progress-container {
          background-color: #e9ecef;
          border-radius: 10px;
          height: 16px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }

        .dep-progress-bar {
          height: 100%;
          border-radius: 10px;
          transition: width 0.4s ease;
        }

        .dep-progress-text {
          position: absolute;
          width: 100%;
          text-align: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: #333;
        }

        /* Acordeón de Oficinas impreso / listado */
        .accordion-print-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .office-card {
          border: 1px solid #e9ecef;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }

        .office-card-header {
          background: #f8f9fa;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .office-card-header h3 {
          font-size: 0.95rem;
          color: #1a3c6e;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }

        .office-card-header p {
          font-size: 0.78rem;
          color: #666;
          margin: 0;
        }

        .office-stats {
          font-size: 0.82rem;
          color: #555;
        }

        .office-card-body {
          padding: 0.75rem 1rem;
        }

        .office-card-body table {
          box-shadow: none;
          border: none;
        }

        .office-card-body table tr {
          border-bottom: 1px solid #f2f2f2;
        }

        .office-card-body th {
          background: #1a3c6e;
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
        }

        .office-card-body td {
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
        }

        .mini-assets-list {
          padding-left: 1rem;
          margin: 0;
          font-size: 0.8rem;
          color: #555;
        }

        .mini-assets-list code {
          background: #f1f3f5;
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: 600;
          font-family: monospace;
          color: #dc3545;
        }

        /* Membrete e informes de impresión */
        .print-only {
          display: none;
        }

        @media print {
          /* Reset general */
          body {
            background-color: white !important;
            color: black !important;
            font-size: 10px !important;
          }

          .navbar, .reportes-sidebar, .report-filters-grid, .report-actions, .no-print {
            display: none !important;
          }

          .main-content {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }

          .reportes-page-wrapper {
            display: block !important;
            width: 100% !important;
          }

          .report-content-card {
            box-shadow: none !important;
            padding: 0 !important;
            border: none !important;
          }

          /* Mostrar cabecera formal */
          .print-only {
            display: block !important;
          }

          .print-header {
            text-align: center;
            border-bottom: 2px double #000;
            padding-bottom: 0.75rem;
            margin-bottom: 1.5rem;
          }

          .print-header h1 {
            font-size: 1.4rem;
            font-weight: 700;
            margin: 0.5rem 0 0.2rem;
            color: black;
          }

          .print-header h2 {
            font-size: 1.1rem;
            font-weight: 600;
            margin: 0;
            color: black;
          }

          .print-header h3 {
            font-size: 0.9rem;
            font-weight: 500;
            margin: 0;
            color: #444;
          }

          .print-header p {
            font-size: 0.75rem;
            margin: 0.3rem 0 0;
            color: #666;
          }

          /* KPIs en print */
          .kpi-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 5px !important;
            margin-bottom: 1rem !important;
          }

          .kpi-card {
            border: 1px solid #ccc !important;
            border-left: 4px solid #666 !important;
            padding: 8px !important;
            background: #f9f9f9 !important;
            box-shadow: none !important;
          }

          .kpi-value {
            font-size: 1rem !important;
          }

          /* Tablas */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th {
            background: #eee !important;
            color: black !important;
            border: 1px solid #bbb !important;
            font-size: 0.75rem !important;
            padding: 5px !important;
          }

          td {
            border: 1px solid #ddd !important;
            font-size: 0.72rem !important;
            padding: 4px !important;
          }

          tr {
            page-break-inside: avoid !important;
          }

          /* Firmas */
          .print-signatures {
            display: flex !important;
            justify-content: space-around !important;
            margin-top: 3rem !important;
            page-break-inside: avoid !important;
          }

          .signature-box {
            text-align: center !important;
            width: 200px !important;
          }

          .signature-line {
            border-top: 1px solid #000 !important;
            margin-bottom: 0.5rem !important;
            width: 100% !important;
          }

          .signature-box p {
            margin: 0 !important;
            font-size: 0.75rem !important;
          }

          /* Ajuste oficina acordeón para print */
          .office-card {
            border: 1px solid #bbb !important;
            margin-bottom: 1rem !important;
            page-break-inside: avoid !important;
          }

          .office-card-header {
            background: #eee !important;
            border-bottom: 1px solid #bbb !important;
            padding: 6px 10px !important;
          }
        }
      ` }} />

      {/* SIDEBAR DE OPCIONES (NO SE IMPRIME) */}
      <div className="reportes-sidebar no-print">
        <h2>📊 Reportes y Consultas</h2>
        <ul>
          <li className={selectedReport === 'inventario' ? 'active' : ''} onClick={() => setSelectedReport('inventario')}>
            📋 Inventario General
          </li>
          <li className={selectedReport === 'depreciacion' ? 'active' : ''} onClick={() => setSelectedReport('depreciacion')}>
            📉 Estado de Depreciación
          </li>
          <li className={selectedReport === 'asignacion' ? 'active' : ''} onClick={() => setSelectedReport('asignacion')}>
            📦 Asignación por Oficina
          </li>
          <li className={selectedReport === 'transferencia' ? 'active' : ''} onClick={() => setSelectedReport('transferencia')}>
            🔄 Historial Transferencias
          </li>
          <li className={selectedReport === 'solicitud' ? 'active' : ''} onClick={() => setSelectedReport('solicitud')}>
            🛒 Solicitudes de Compra
          </li>
          <li className={selectedReport === 'bajas' ? 'active' : ''} onClick={() => setSelectedReport('bajas')}>
            🗑️ Bajas de Activos
          </li>
        </ul>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="reportes-main">
        {/* CABECERA FORMAL PARA LA IMPRESIÓN */}
        <div className="print-only">
          <div className="print-header">
            <h2>UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO</h2>
            <h3>DIRECCIÓN DE ACTIVOS FIJOS Y CONTROL PATRIMONIAL</h3>
            <h1>REPORTE: {getReportTitle().toUpperCase()}</h1>
            <p>
              Generado el: {new Date().toLocaleDateString('es-BO')} a las {new Date().toLocaleTimeString('es-BO')} | Registros Oficiales UAGRM
            </p>
          </div>
        </div>

        <div className="report-content-card">
          {/* PANEL DE TITULO E IMPRESIÓN / EXPORTACIÓN */}
          <div className="report-header-panel">
            <div className="report-header-title">
              <h1>{getReportTitle()}</h1>
              <p className="no-print">Consulte y filtre la información en tiempo real para generar reportes oficiales.</p>
            </div>
            <div className="report-actions no-print">
              <button className="btn btn-secondary" onClick={handlePrint}>
                🖨️ Imprimir Reporte
              </button>
              <button className="btn btn-success" onClick={() => exportarCSV(selectedReport)}>
                📥 Exportar CSV (Excel)
              </button>
            </div>
          </div>

          {/* FILTROS (NO SE IMPRIMEN) */}
          <div className="no-print">
            {renderFiltros()}
          </div>

          {/* INDICADORES CLAVE (KPIs) */}
          {renderKPIs()}

          {/* TABLA DE CONTENIDO (SE IMPRIME ADAPTADA) */}
          <div className="table-container" style={{ boxShadow: 'none', borderRadius: 0 }}>
            {renderTabla()}
          </div>

          {/* FIRMAS DE RESPONSABILIDAD AL FINAL PARA IMPRESIÓN */}
          <div className="print-only">
            <div className="print-signatures">
              <div className="signature-box">
                <div className="signature-line"></div>
                <p><strong>Elaborado Por:</strong></p>
                <p>Encargado de Inventarios UAGRM</p>
              </div>
              <div className="signature-box">
                <div className="signature-line"></div>
                <p><strong>Autorizado Por:</strong></p>
                <p>Jefe Depto. Activos Fijos UAGRM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
