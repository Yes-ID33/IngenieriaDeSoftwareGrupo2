import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PaginaInicial from './pages/PaginaInicial';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivarCuenta from './pages/ActivarCuenta.jsx';
import Perfil from './pages/Perfil'
import Solicitud from './pages/Solicitud';

//Rutas Admin
import EmpresasPendientes from './pages/admin/EmpresasPendientes.jsx';
import "./styles/index.css";
import "./styles/auth.css";

function App() {

  return (
    
    <div>
       <BrowserRouter>
        <Routes>
            <Route path="/" element={<PaginaInicial />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/activar-cuenta" element={<ActivarCuenta />} />
            <Route path="/perfil" element={<Perfil />} />
            {/*<Route path="/vacantes" element={<Vacantes />} />
            <Route path="/empresas" element={<Empresas />} />*/}
            <Route path="/solicitud" element={<Solicitud />} />
            <Route path="/panel/admin/empresas-pendientes" element={<EmpresasPendientes />} />
        </Routes>
    </BrowserRouter>
    </div>
      
   
  )
}

export default App
