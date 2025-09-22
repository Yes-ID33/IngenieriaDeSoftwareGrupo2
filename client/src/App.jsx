import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Firstpages from './Componentes/Firstpages';
import Login from './Componentes/Login';
import Register from './Componentes/Register';
import './App.css';
import "./index.css";

function App() {

  return (
    
    <div>
       <BrowserRouter>
        <Routes>
            <Route path="/" element={<Firstpages />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    </BrowserRouter>
    </div>
      
   
  )
}

export default App
