import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../index.css";
import "../auth.css";

const VerifyAccount = () => {
  const [formData, setFormData] = useState({
    correo: '',
    token: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutos en segundos
  
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener el correo de la navegación anterior (desde el registro)
  useEffect(() => {
    if (location.state?.correo) {
      setFormData(prev => ({
        ...prev,
        correo: location.state.correo
      }));
    }
  }, [location.state]);

  // Contador de tiempo para el código
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  // Formatear tiempo restante
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Limpiar mensajes al cambiar los campos
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.correo || !formData.token) {
      setError('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/verificar-cuenta', {
        correo: formData.correo,
        token: formData.token
      });

      setSuccess(response.data.message);
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.',
            correo: formData.correo 
          } 
        });
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al verificar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.correo) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/reenviar-codigo', {
        correo: formData.correo
      });

      setSuccess(response.data.message);
      setTimeRemaining(900); // Reiniciar timer a 15 minutos
      setFormData(prev => ({ ...prev, token: '' })); // Limpiar código anterior

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al reenviar el código');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className='layoutContent'>
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
          <h2>Verificar tu cuenta</h2>
          <p className="verifyDescription">
            Te hemos enviado un código de verificación de 6 dígitos a tu correo electrónico.
            Ingresa el código para activar tu cuenta.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="correo">Correo electrónico</label>
            <input 
              type="email" 
              id="correo" 
              name="correo" 
              value={formData.correo} 
              onChange={handleChange} 
              placeholder="tu@correo.com"
              required 
            />

            <label htmlFor="token">Código de verificación</label>
            <input 
              type="text" 
              id="token" 
              name="token" 
              value={formData.token} 
              onChange={handleChange} 
              placeholder="Ingresa el código de 6 dígitos"
              maxLength="6"
              className="verifyInput"
              required 
            />

            {timeRemaining > 0 && (
              <p className="timeRemaining">
                El código expira en: {formatTime(timeRemaining)}
              </p>
            )}

            {error && <p className="errorMessage">{error}</p>}
            {success && <p className="successMessage">{success}</p>}

            <button 
              type="submit" 
              className="authBtn" 
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Verificar cuenta'}
            </button>
          </form>

          <div className="resendSection">
            <p>¿No recibiste el código?</p>
            <button 
              type="button" 
              onClick={handleResendCode}
              className="resendBtn"
              disabled={resendLoading || timeRemaining > 840} // Permitir reenvío después de 1 minuto
            >
              {resendLoading ? 'Reenviando...' : 'Reenviar código'}
            </button>
            {timeRemaining > 840 && (
              <p className="resendInfo">
                Podrás solicitar un nuevo código en {formatTime(timeRemaining - 840)}
              </p>
            )}
          </div>

          <p>
            ¿Quieres usar otro correo?{" "}
            <a href="/register" className="authLink">Registrarse de nuevo</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;