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
import Condiciones from './pages/Condiciones';
import Unidades from './pages/Unidades';
import Gestiones from './pages/Gestiones';
import Partes from './pages/Partes';
import Usuarios from './pages/Usuarios';
import Roles from './pages/Roles';
import Tipos from './pages/Tipos';
import Materiales from './pages/Materiales';
import Funciones from './pages/Funciones';
import Estados from './pages/Estados';
import Adquisiciones from './pages/Adquisiciones';
import Atributos from './pages/Atributos';
import Depreciaciones from './pages/Depreciaciones';
import Login from './pages/Login';
import './App.css';

function App() {
  const [catalogoOpen, setCatalogoOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');

  const handleLoginSuccess = (token: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userEmail', email);
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setUserEmail('');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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
            <li><NavLink to="/adquisiciones">Adquisiciones</NavLink></li>
            <li><NavLink to="/depreciaciones">Depreciaciones</NavLink></li>
            <li><NavLink to="/usuarios">Usuarios</NavLink></li>
            <li><NavLink to="/roles">Roles</NavLink></li>
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
                  <li><NavLink to="/condiciones" onClick={() => setCatalogoOpen(false)}>Condiciones</NavLink></li>
                  <li><NavLink to="/estados" onClick={() => setCatalogoOpen(false)}>Estados de Activo</NavLink></li>
                  <li><NavLink to="/unidades" onClick={() => setCatalogoOpen(false)}>Unidades de Medida</NavLink></li>
                  <li><NavLink to="/gestiones" onClick={() => setCatalogoOpen(false)}>Gestiones</NavLink></li>
                  <li><NavLink to="/partes" onClick={() => setCatalogoOpen(false)}>Partes / Componentes</NavLink></li>
                  <li><NavLink to="/atributos" onClick={() => setCatalogoOpen(false)}>Atributos Técnicos</NavLink></li>
                  <li><NavLink to="/tipos" onClick={() => setCatalogoOpen(false)}>Tipos de Activo</NavLink></li>
                  <li><NavLink to="/materiales" onClick={() => setCatalogoOpen(false)}>Tipos de Material</NavLink></li>
                  <li><NavLink to="/funciones" onClick={() => setCatalogoOpen(false)}>Funciones Adm.</NavLink></li>
                </ul>
              )}
            </li>
          </ul>
          <div className="navbar-user">
            <span className="user-email">👤 {userEmail}</span>
            <button className="logout-btn" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
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
            <Route path="/condiciones" element={<Condiciones />} />
            <Route path="/unidades" element={<Unidades />} />
            <Route path="/gestiones" element={<Gestiones />} />
            <Route path="/partes" element={<Partes />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/tipos" element={<Tipos />} />
            <Route path="/materiales" element={<Materiales />} />
            <Route path="/funciones" element={<Funciones />} />
            <Route path="/estados" element={<Estados />} />
            <Route path="/adquisiciones" element={<Adquisiciones />} />
            <Route path="/depreciaciones" element={<Depreciaciones />} />
            <Route path="/atributos" element={<Atributos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;