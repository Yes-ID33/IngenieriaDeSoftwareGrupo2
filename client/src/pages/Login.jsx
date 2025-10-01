import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const Login = () => { //para redirigir a la página inicial en el 5173 y no al json feo del 5000
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
        //cambiar el contexto
        iniciarSesion(data.data.usuario);
        //página inicial
        navigate('/'); // Ruta de la página inicial
      } else {
        alert('Credenciales incorrectas');
      }
    } catch (err) {
      console.error('Error en login:', err);
      alert('Error de conexión');
    }
  };

  return (
    <div className='layoutContent'>
      <Header />
      <div className="authContainer">
        <div className="authCard">
          <h1>Iniciar Sesión</h1>
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" name="correo" value={correo} onChange={e => setCorreo(e.target.value)} required />

            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="contrasena" value={contrasena} onChange={e => setContrasena(e.target.value)} required />

            <button type="submit" className="authBtn">Entrar</button>
          </form>
          <p>
            ¿No tienes cuenta?{" "}
            <a href="/register" className="authLink">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
