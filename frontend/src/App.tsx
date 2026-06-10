import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';

// Pages
import Ingresos from './pages/Ingresos';
import Activos from './pages/Activos';
import Vehiculos from './pages/Vehiculos';
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
import Reportes from './pages/Reportes';
import Logs from './pages/Logs';
import Ufvs from './pages/Ufvs';
import Login from './pages/Login';
import './App.css';

/* ─── Inner App (requires auth context) ─────────────────────── */
function AppInner() {
  const { isAuthenticated, login, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLoginSuccess = (token: string, email: string) => {
    // For now permisos=[] and esAdmin=true until backend returns them
    login(token, email, [], true);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />
      <div className="app-main">
        <Topbar onLogout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/"              element={<Ingresos />} />
            <Route path="/ingresos"      element={<Ingresos />} />
            <Route path="/activos"       element={<Activos />} />
            <Route path="/vehiculos"     element={<Vehiculos />} />
            <Route path="/asignaciones"  element={<Asignaciones />} />
            <Route path="/transferencias"element={<Transferencias />} />
            <Route path="/revaluos"      element={<Revaluos />} />
            <Route path="/bajas"         element={<Bajas />} />
            <Route path="/proveedores"   element={<Proveedores />} />
            <Route path="/oficinas"      element={<Oficinas />} />
            <Route path="/grupos"        element={<Grupos />} />
            <Route path="/marcas"        element={<Marcas />} />
            <Route path="/condiciones"   element={<Condiciones />} />
            <Route path="/unidades"      element={<Unidades />} />
            <Route path="/gestiones"     element={<Gestiones />} />
            <Route path="/partes"        element={<Partes />} />
            <Route path="/usuarios"      element={<Usuarios />} />
            <Route path="/roles"         element={<Roles />} />
            <Route path="/tipos"         element={<Tipos />} />
            <Route path="/materiales"    element={<Materiales />} />
            <Route path="/funciones"     element={<Funciones />} />
            <Route path="/estados"       element={<Estados />} />
            <Route path="/adquisiciones" element={<Adquisiciones />} />
            <Route path="/depreciaciones"element={<Depreciaciones />} />
            <Route path="/reportes"      element={<Reportes />} />
            <Route path="/logs"          element={<Logs />} />
            <Route path="/atributos"     element={<Atributos />} />
            <Route path="/ufvs"          element={<Ufvs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ─── Root (provides context + router) ──────────────────────── */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;