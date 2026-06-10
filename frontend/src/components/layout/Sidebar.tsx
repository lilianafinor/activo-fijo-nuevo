import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/* ─── Definición de grupos y rutas ─────────────────────────── */
interface NavItem {
  label: string;
  to: string;
  icon: string;
  permission?: string;
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'gestion',
    label: 'Gestión de Activos',
    icon: '▣',
    items: [
      { label: 'Ingresos',        to: '/ingresos',       icon: '↓' },
      { label: 'Activos Fijos',   to: '/activos',        icon: '◈' },
      { label: 'Asignaciones',    to: '/asignaciones',   icon: '→' },
      { label: 'Transferencias',  to: '/transferencias', icon: '⇄' },
      { label: 'Bajas',           to: '/bajas',          icon: '↥' },
      { label: 'Vehículos',       to: '/vehiculos',      icon: '◻' },
    ],
  },
  {
    id: 'contabilidad',
    label: 'Contabilidad',
    icon: '≡',
    items: [
      { label: 'Depreciaciones',  to: '/depreciaciones', icon: '▽' },
      { label: 'Revalúos',        to: '/revaluos',       icon: '△' },
      { label: 'Tasas UFV',       to: '/ufvs',           icon: '$' },
    ],
  },
  {
    id: 'adquisiciones',
    label: 'Adquisiciones',
    icon: '⊕',
    items: [
      { label: 'Adquisiciones',   to: '/adquisiciones',  icon: '⊕' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes y Auditoría',
    icon: '▤',
    items: [
      { label: 'Reportes',        to: '/reportes',       icon: '▤' },
      { label: 'Bitácora',        to: '/logs',           icon: '≣' },
    ],
  },
  {
    id: 'admin',
    label: 'Administración',
    icon: '◆',
    items: [
      { label: 'Usuarios',        to: '/usuarios',       icon: '◉' },
      { label: 'Roles y Permisos',to: '/roles',          icon: '◐' },
    ],
  },
  {
    id: 'catalogos',
    label: 'Catálogos',
    icon: '▦',
    items: [
      { label: 'Grupos',          to: '/grupos',         icon: '▥' },
      { label: 'Oficinas',        to: '/oficinas',       icon: '▣' },
      { label: 'Proveedores',     to: '/proveedores',    icon: '◫' },
      { label: 'Marcas',          to: '/marcas',         icon: '™' },
      { label: 'Condiciones',     to: '/condiciones',    icon: '◈' },
      { label: 'Est. de Activo',  to: '/estados',        icon: '●' },
      { label: 'Unidades',        to: '/unidades',       icon: '▭' },
      { label: 'Gestiones',       to: '/gestiones',      icon: '◷' },
      { label: 'Partes',          to: '/partes',         icon: '◧' },
      { label: 'Atributos',       to: '/atributos',      icon: '◈' },
      { label: 'Tipos',           to: '/tipos',          icon: '◇' },
      { label: 'Materiales',      to: '/materiales',     icon: '◼' },
      { label: 'Funciones Adm.',  to: '/funciones',      icon: '◑' },
    ],
  },
];

/* ─── Props ─────────────────────────────────────────────────── */
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/* ─── Componente ─────────────────────────────────────────────── */
export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    gestion: true,
    contabilidad: false,
    adquisiciones: false,
    reportes: false,
    admin: false,
    catalogos: false,
  });

  /* Auto-abrir el grupo que contiene la ruta activa */
  React.useEffect(() => {
    NAV_GROUPS.forEach(group => {
      const hasActive = group.items.some(item => location.pathname === item.to);
      if (hasActive) {
        setOpenGroups(prev => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (id: string) => {
    if (collapsed) return;
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon" style={{ fontWeight: 900, fontSize: '1rem', color: '#7ab8f5' }}>AF</span>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">Activos Fijos</span>
            <span className="sidebar-brand-sub">UAGRM · Adm. de Bienes</span>
          </div>
        )}
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expandir' : 'Colapsar'}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {NAV_GROUPS.map(group => {
          const groupHasActive = group.items.some(item => location.pathname === item.to);
          const isOpen = openGroups[group.id];

          return (
            <div key={group.id} className="sidebar-group">
              {/* Group Header */}
              <button
                className={`sidebar-group-header ${groupHasActive ? 'has-active' : ''}`}
                onClick={() => toggleGroup(group.id)}
                title={collapsed ? group.label : undefined}
              >
                <span className="sidebar-group-icon">{group.icon}</span>
                {!collapsed && (
                  <>
                    <span className="sidebar-group-label">{group.label}</span>
                    <span className={`sidebar-group-arrow ${isOpen ? 'open' : ''}`}>›</span>
                  </>
                )}
              </button>

              {/* Group Items */}
              {(isOpen || collapsed) && (
                <div className={`sidebar-items ${collapsed ? 'sidebar-items-tooltip' : ''}`}>
                  {group.items.map(item => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
                      }
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="sidebar-item-icon">{item.icon}</span>
                      {!collapsed && (
                        <span className="sidebar-item-label">{item.label}</span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <span className="sidebar-footer-text">SIAEF v2.0 · MEFP</span>
        </div>
      )}
    </aside>
  );
}
