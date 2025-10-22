import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Rutas generales
import PaginaInicial from './pages/PaginaInicial';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivarCuenta from './pages/activarCuenta';
import Perfil from './pages/Perfil';

// Rutas admin
import PanelAdmin from './pages/admin/PanelAdmin';
import GestionEmpresas from './pages/admin/GestionEmpresas';
import GestionUsuarios from './pages/admin/GestionUsuarios';

import "./styles/index.css";
import "./styles/auth.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 🌍 Rutas generales */}
          <Route path="/" element={<PaginaInicial />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/activar-cuenta" element={<ActivarCuenta />} />
          <Route path="/perfil" element={<Perfil />} />
          
          {/* 🛡️ Rutas admin */}
          <Route path="/panel/admin" element={<PanelAdmin />} />
          <Route path="/panel/admin/empresas-pendientes" element={<GestionEmpresas />} />
          <Route path="/panel/admin/usuarios" element={<GestionUsuarios />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;