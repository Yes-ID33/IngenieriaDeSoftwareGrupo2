import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const Solicitud = () => { //para redirigir a la página inicial en el 5173 y no al json feo del 5000
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [hojaDeVida, setHojaDeVida] = useState('');
  const estudianteID = usuario?.cedula_id;
  const vacanteID = useAuth();
  
  const handleSolicitud = async (e) => {
    e.preventDefault();

    if (!hojaDeVida || !estudianteID || !vacanteID) {
      alert('Faltan datos para enviar la solicitud');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('hojaDeVida', hojaDeVida);
      formData.append('estudiante_id', estudianteID);
      formData.append('vacante_id', vacanteID);

      const res = await fetch('http://localhost:5000/api/solicitudes', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        alert('Solicitud enviada correctamente');
        navigate('/perfil'); // o donde quieras redirigir
      } else {
        alert(data.message || 'No se pudo enviar la solicitud');
      }
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      alert('Error de conexión');
    }
  };

  return (
    <div className="fondoParqueTech">
    
    <div className='layoutContent'>
      <Header />
      <div className="authContainer">
        <div className="authCard">
          <h1>Iniciar Sesión</h1>
          <form onSubmit={handleSolicitud}>
            <label htmlFor="hojaDeVida">Cargue su hoja de vida en formato PDF</label>
            <input 
              type="file" id="hojaDeVida" 
              name="hojaDeVida" accept="application/pdf" 
              onChange={e => setHojaDeVida(e.target.files[0])} 
              required 
            />

            <button type="submit" className="authBtn">Enviar solicitud</button>
          </form>
          <p>
            ¿Ver más vacantes?{" "}
            <a href="/vacantes" className="authLink">Ir a vacantes</a>
          </p>
        </div>
      </div>
    </div>
    </div>
   
  );
};

export default Solicitud;
