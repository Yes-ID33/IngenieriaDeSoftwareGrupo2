import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ NUEVA URL CORRECTA
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await res.json();

      if (data.success) {
        // Guardar token y usuario
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
        
        // Actualizar contexto
        iniciarSesion(data.data.usuario);

        // ✅ Redirigir según el rol
        const rol = data.data.usuario.rol;
        
        if (rol === 'administrador') {
          navigate('/panel/admin');
        } else if (rol === 'estudiante') {
          navigate('/panel/estudiante');
        } else if (rol === 'empresa') {
          navigate('/panel/empresa');
        } else {
          navigate('/');
        }
      } else {
        // ✅ Manejo de errores específicos
        if (data.codigo === 'CUENTA_NO_VERIFICADA') {
          setError('⚠️ Debes verificar tu cuenta. Revisa tu correo electrónico.');
          // Opcional: redirigir a verificación
          setTimeout(() => {
            navigate('/activar-cuenta', { state: { correo } });
          }, 2000);
        } else if (data.codigo === 'CUENTA_PENDIENTE_APROBACION') {
          setError('⏳ Tu cuenta está pendiente de aprobación por un administrador.');
        } else {
          setError(data.message || 'Credenciales incorrectas');
        }
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fondoParqueTech">
      <div className='layoutContent'>
        <Header />
        <div className="authContainer">
          <div className="authCard">
            <h1>Iniciar Sesión</h1>
            <form onSubmit={handleLogin}>
              <label htmlFor="email">Correo electrónico</label>
              <input 
                type="email" 
                id="email" 
                name="correo" 
                value={correo} 
                onChange={e => setCorreo(e.target.value)} 
                required 
                disabled={loading}
              />

              <label htmlFor="password">Contraseña</label>
              <input 
                type="password" 
                id="password" 
                name="contrasena" 
                value={contrasena} 
                onChange={e => setContrasena(e.target.value)} 
                required 
                disabled={loading}
              />

              {error && <p className="errorMessage">{error}</p>}

              <button 
                type="submit" 
                className="authBtn"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Entrar'}
              </button>
            </form>

            <p>
              ¿No tienes cuenta?{" "}
              <a href="/register" className="authLink">Regístrate aquí</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;