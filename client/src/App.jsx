import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Rutas generales
import PaginaInicial from './pages/PaginaInicial';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivarCuenta from './pages/activarCuenta';
import Perfil from './pages/Perfil';

// Rutas admin
import EmpresasPendientes from './pages/admin/EmpresasPendientes.jsx';


import "./styles/index.css";
import "./styles/auth.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🌍 Rutas generales */}
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activar-cuenta" element={<ActivarCuenta />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/panel/admin/empresas-pendientes" element={<EmpresasPendientes />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
