import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Rutas generales
import PaginaInicial from './pages/PaginaInicial';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivarCuenta from './pages/activarCuenta';
import Perfil from './pages/Perfil';
import Vacantes from './pages/vacantes';
import Hojas from './pages/Hojas'; // nueva importación
import Solicitud from './pages/Solicitud';

// Rutas admin
import PanelAdmin from './pages/admin/PanelAdmin';
import GestionEmpresas from './pages/admin/GestionEmpresas';
import GestionUsuarios from './pages/admin/GestionUsuarios';
import GestionVacantes from './pages/admin/GestionVacantes';

// Rutas empresa
import PanelEmpresa from './pages/Empresa/PanelEmpresa';
import MisVacantes from './pages/Empresa/MisVacantes';
import CrearVacante from './pages/Empresa/CrearVacante';
import VerPostulaciones from './pages/Empresa/VerPostulaciones';

import "./styles/index.css";
import "./styles/auth.css";

import Footer from './components/footer'; // componente Footer

// Wrapper que decide mostrar footer según la ruta actual
function AppRoutes() {
  const location = useLocation();
  const path = location.pathname;

  // Rutas exactas donde quieres mostrar el footer
  const exactRoutes = new Set([
    '/',                // PaginaInicial
    '/login',           // Login
    '/register',        // Register
    '/register/empresa',// si usas esta ruta para RegisterEmpresa
    '/register/estudiante' // si usas esta ruta para RegisterEstudiante
  ]);

  // Prefijos: útil cuando hay subrutas (por ejemplo /register/empresa/editar)
  const prefixRoutes = [
    '/register/empresa',
    '/register/estudiante'
  ];

  const showFooter =
    exactRoutes.has(path) ||
    prefixRoutes.some(prefix => path.startsWith(prefix));

  return (
    <>
      <Routes>
        {/* 🌍 Rutas generales */}
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activar-cuenta" element={<ActivarCuenta />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/vacantes" element= {<Vacantes />} />
        <Route path="/solicitud" element= {<Solicitud />} />
        
        {/* 🛡️ Rutas admin */}
        <Route path="/panel/admin" element={<PanelAdmin />} />
        <Route path="/panel/admin/empresas" element={<GestionEmpresas />} />
        <Route path="/panel/admin/usuarios" element={<GestionUsuarios />} />
        <Route path="/panel/admin/vacantes" element={<GestionVacantes />} />

        {/* 🏢 Rutas empresa */}
        <Route path="/panel/Empresa" element={<PanelEmpresa />} />
        <Route path="/panel/Empresa/mis-vacantes" element={<MisVacantes />} />
        <Route path="/panel/Empresa/crear-vacante" element={<CrearVacante />} />
        <Route path="/panel/empresa/postulaciones" element={<VerPostulaciones />} />

        {/* Ejemplo: si RegisterEmpresa/RegisterEstudiante son páginas bajo /register/... */}
        <Route path="/register/empresa" element={/* tu componente */ null} />
        <Route path="/register/estudiante" element={/* tu componente */ null} />
        
        {/* 🗂️ Ruta para crear hoja de vida */}
        <Route path="/hojas/crear" element={<Hojas />} />
      </Routes>

      {showFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-root">
          <main className="main-content">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
