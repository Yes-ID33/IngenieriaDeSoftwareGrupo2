import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PaginaInicial from './pages/PaginaInicial';
import Login from './pages/Login';
import Register from './pages/Register';
import ActivarCuenta from './pages/ActivarCuenta';
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
        </Routes>
    </BrowserRouter>
    </div>
      
   
  )
}

export default App
