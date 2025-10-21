import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const ActivarCuenta = () => {
  const [correo, setCorreo] = useState('');
  const [token, setToken] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Pre-llenar correo desde navegación o URL
  useEffect(() => {
    // Obtener correo desde la navegación (cuando viene desde registro)
    if (location.state?.correo) {
      setCorreo(location.state.correo);
    }
    
    // Obtener mensaje si viene del registro
    if (location.state?.mensaje) {
      setMensaje(location.state.mensaje);
    }
    
    // Obtener correo desde URL params (cuando viene desde email)
    const urlParams = new URLSearchParams(location.search);
    const correoFromUrl = urlParams.get('correo');
    if (correoFromUrl) {
      setCorreo(decodeURIComponent(correoFromUrl));
    }
  }, [location]);

  // Función para verificar la cuenta con el token
  const handleVerificar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      // ✅ NUEVA RUTA CORRECTA
      const response = await axios.post('http://localhost:5000/api/estudiantes/verificar-cuenta', {
        correo: correo.trim(),
        token: token.trim()
      });

      if (response.data.success) {
        setMensaje('✅ ' + response.data.message);
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.',
              correo: correo 
            } 
          });
        }, 2000);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // Función para reenviar el código de verificación
  const handleReenviar = async () => {
    if (!correo) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    setMensaje('');
    setError('');
    setLoading(true);

    try {
      // ✅ NUEVA RUTA CORRECTA
      const response = await axios.post('http://localhost:5000/api/estudiantes/reenviar-codigo', {
        correo: correo.trim()
      });

      if (response.data.success) {
        setMensaje('✅ ' + response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layoutContent">
      <Header />
      <div className="authContainer">
        <div className="authCard">
          <h1>🔐 Verificar cuenta</h1>
          
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            📧 Revisa tu correo electrónico. Te hemos enviado un código de 6 dígitos.
          </p>

          <form onSubmit={handleVerificar}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="tu@correo.com"
              required
              disabled={loading}
            />

            <label htmlFor="token">Código de verificación</label>
            <input
              type="text"
              id="token"
              name="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="123456"
              maxLength="6"
              pattern="\d{6}"
              title="Debe ser un código de 6 dígitos"
              required
              disabled={loading}
            />

            {error && <p className="errorMessage">{error}</p>}
            {mensaje && <p className="successMessage">{mensaje}</p>}

            <button 
              type="submit" 
              className="authBtn"
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Activar cuenta'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              ¿No recibiste el código?{" "}
              <button 
                type="button" 
                className="authLink" 
                onClick={handleReenviar}
                disabled={loading || !correo}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2E8B57',
                  textDecoration: 'underline',
                  cursor: loading || !correo ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Reenviar código
              </button>
            </p>
          </div>

          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            <a href="/login" className="authLink">Volver al login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActivarCuenta;