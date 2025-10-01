import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const response = await axios.post("http://localhost:5000/api/usuarios/login", {
        correo,
        contrasena
      });

      setMensaje(response.data.message);
      console.log("Token:", response.data.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className='layoutContent'>
      <Header />
      <div className="authContainer">
        <div className="authCard">
          <h1>Iniciar Sesión</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />

            <button type="submit" className="authBtn">Entrar</button>
          </form>

          {error && <p className="errorMessage">{error}</p>}
          {mensaje && <p className="successMessage">{mensaje}</p>}

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
