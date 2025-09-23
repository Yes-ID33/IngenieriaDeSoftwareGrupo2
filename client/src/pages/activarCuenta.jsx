import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // AGREGADO
import axios from 'axios';
import "../styles/index.css";
import "../styles/auth.css";

const ActivarCuenta = () => {
  const [correo, setCorreo] = useState('');
  const [token, setToken] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  
  // AGREGADO: Para obtener datos de navegación y URL
  const location = useLocation();
  const navigate = useNavigate();

  // AGREGADO: Pre-llenar correo desde navegación o URL
  useEffect(() => {
    // Obtener correo desde la navegación (cuando viene desde registro)
    if (location.state?.correo) {
      setCorreo(location.state.correo);
    }
    
    // Obtener correo desde URL params (cuando viene desde email)
    const urlParams = new URLSearchParams(location.search);
    const correoFromUrl = urlParams.get('correo');
    if (correoFromUrl) {
      setCorreo(correoFromUrl);
    }
  }, [location]);

  // Función para verificar la cuenta con el token
  const handleVerificar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/verificar-cuenta', {
        correo,
        token
      });

      setMensaje(response.data.message);
      
      // AGREGADO: Redirigir al login después de verificar
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.',
            correo: correo 
          } 
        });
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar la cuenta');
    }
  };

  // Función para reenviar el código de verificación
  const handleReenviar = async () => {
    setMensaje('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/reenviar-codigo', {
        correo
      });

      setMensaje(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código');
    }
  };

  return (
    <div className="layoutContent">
      <header>
        <div className="navLeft">
          <nav>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/">Convocatorias</a></li>
            </ul>
          </nav>
        </div>
        <div className="navRight">
          <nav>
            <ul>
              <li><a href="/login">Iniciar Sesión</a></li>
              <li><a href="/register">Registrarse</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="authContainer">
        <div className="authCard">
          <h1>Verificar cuenta</h1>
          <form onSubmit={handleVerificar}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <label htmlFor="token">Código de verificación</label>
            <input
              type="text"
              id="token"
              name="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />

            {error && <p className="errorMessage">{error}</p>}
            {mensaje && <p className="successMessage">{mensaje}</p>}

            <button type="submit" className="authBtn">Activar cuenta</button>
          </form>

          <p>
            ¿No tienes el código?{" "}
            <button type="button" className="authLink" onClick={handleReenviar}>
              Reenviar código
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivarCuenta;