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

  useEffect(() => {
    if (location.state?.correo) {
      setCorreo(location.state.correo);
    }
    
    if (location.state?.mensaje) {
      setMensaje(location.state.mensaje);
    }
    
    const urlParams = new URLSearchParams(location.search);
    const correoFromUrl = urlParams.get('correo');
    if (correoFromUrl) {
      setCorreo(decodeURIComponent(correoFromUrl));
    }
  }, [location]);

  const handleVerificar = async (e) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/estudiantes/verificar-cuenta', {
        correo: correo.trim(),
        token: token.trim()
      });

      if (response.data.success) {
        setMensaje('✅ ' + response.data.message);
        
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

  const handleReenviar = async () => {
    if (!correo) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    setMensaje('');
    setError('');
    setLoading(true);

    try {
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
    <div className="fondoParqueTech">
      <div className="contenidoTransparente">
        <Header />
        
        <div className="descriptionContainer">
          <img
            src="/escudo-pascual-bravo_Mesa-de-trabajo-1.png"
            alt="Escudo Universidad Pascual Bravo"
            className="firstpagesImg"
          />
          <h1 className="firstpagesTitle">Verificar cuenta</h1>
          <p>
            Revisa tu correo electrónico. Te hemos enviado un código de 6 dígitos.
          </p>
        </div>

        {/* CONTENEDOR PRINCIPAL - Misma estructura que PaginaInicial */}
        <div className="optionsContainer" style={{ flexDirection: 'column', alignItems: 'center', gap: '0' }}>
          
          {/* TARJETA DE ACTIVACIÓN - Estilo consistente */}
          <div style={{ 
            background: '#fff',
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            width: '100%',
            maxWidth: '480px',
            textAlign: 'center',
            border: '1px solid color-mix(in srgb, var(--color-text) 10%, white 90%)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}>
            <form onSubmit={handleVerificar}>
              <label htmlFor="email" style={{
                display: 'block',
                textAlign: 'left',
                margin: '0.8rem 0 0.3rem',
                fontWeight: '600',
                color: 'var(--color-text)'
              }}>Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="correo"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tu@correo.com"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  marginBottom: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: 'var(--radius)',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
              />

              <label htmlFor="token" style={{
                display: 'block',
                textAlign: 'left',
                margin: '0.8rem 0 0.3rem',
                fontWeight: '600',
                color: 'var(--color-text)'
              }}>Código de verificación</label>
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
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  marginBottom: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: 'var(--radius)',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  letterSpacing: '0.5rem',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
              />

              {error && <p className="errorMessage">{error}</p>}
              {mensaje && <p style={{ 
                color: 'var(--color-support-green)', 
                fontWeight: '600', 
                margin: '0.8rem 0',
                textAlign: 'center'
              }}>{mensaje}</p>}

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  display: 'inline-block',
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                  color: '#fff',
                  padding: '0.9rem',
                  borderRadius: '50px',
                  fontWeight: '600',
                  fontSize: '1rem',
                  marginTop: '1.5rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  border: 'none'
                }}
              >
                {loading ? 'Verificando...' : 'Activar cuenta'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '1rem' }}>
                ¿No recibiste el código?{" "}
                <button 
                  type="button" 
                  onClick={handleReenviar}
                  disabled={loading || !correo}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    textDecoration: 'underline',
                    cursor: loading || !correo ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Reenviar código
                </button>
              </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <a href="/login" style={{
                display: 'inline-block',
                marginTop: '1rem',
                fontSize: '0.95rem',
                color: 'var(--color-primary-dark)',
                textDecoration: 'none',
                transition: 'color 0.2s ease'
              }}>Volver al login</a>
            </div>
          </div>
        </div>

        <footer style={{ 
          position: 'relative', 
          marginTop: '2rem',
          backgroundColor: 'var(--color-primary-dark)',
          color: 'white',
          textAlign: 'center',
          padding: '1rem',
          borderRadius: 'var(--radius)'
        }}>
          <p>© 2025 Institución Universitaria Pascual Bravo</p>
          <p>
            <a href="#" style={{ color: 'var(--color-secondary)' }}>Reglamento</a> | 
            <a href="#" style={{ color: 'var(--color-secondary)' }}> Soporte</a> | 
            <a href="#" style={{ color: 'var(--color-secondary)' }}> Contacto</a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ActivarCuenta;