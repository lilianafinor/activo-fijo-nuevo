import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Ingresos from './pages/Ingresos';
import Activos from './pages/Activos';
import Asignaciones from './pages/Asignaciones';
import Transferencias from './pages/Transferencias';
import Revaluos from './pages/Revaluos';
import Bajas from './pages/Bajas';
import Proveedores from './pages/Proveedores';
import Oficinas from './pages/Oficinas';
import Grupos from './pages/Grupos';
import Marcas from './pages/Marcas';
import './App.css';

function App() {
  const [catalogoOpen, setCatalogoOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="brand-icon">🏛️</span>
            <span className="brand-text">Activos Fijos UAGRM</span>
          </div>
          <ul className="navbar-links">
            <li><NavLink to="/ingresos">Ingresos</NavLink></li>
            <li><NavLink to="/activos">Activos</NavLink></li>
            <li><NavLink to="/asignaciones">Asignaciones</NavLink></li>
            <li><NavLink to="/transferencias">Transferencias</NavLink></li>
            <li><NavLink to="/revaluos">Revalúos</NavLink></li>
            <li><NavLink to="/bajas">Bajas</NavLink></li>
            <li className="dropdown">
              <button className="dropdown-btn" onClick={() => setCatalogoOpen(!catalogoOpen)}>
                Catálogos ▾
              </button>
              {catalogoOpen && (
                <ul className="dropdown-menu">
                  <li><NavLink to="/proveedores" onClick={() => setCatalogoOpen(false)}>Proveedores</NavLink></li>
                  <li><NavLink to="/oficinas" onClick={() => setCatalogoOpen(false)}>Oficinas</NavLink></li>
                  <li><NavLink to="/grupos" onClick={() => setCatalogoOpen(false)}>Grupos</NavLink></li>
                  <li><NavLink to="/marcas" onClick={() => setCatalogoOpen(false)}>Marcas</NavLink></li>
                </ul>
              )}
            </li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Ingresos />} />
            <Route path="/ingresos" element={<Ingresos />} />
            <Route path="/activos" element={<Activos />} />
            <Route path="/asignaciones" element={<Asignaciones />} />
            <Route path="/transferencias" element={<Transferencias />} />
            <Route path="/revaluos" element={<Revaluos />} />
            <Route path="/bajas" element={<Bajas />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/oficinas" element={<Oficinas />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/marcas" element={<Marcas />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;