import React from 'react';
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const Login = () => {
  return (
    <div className='layoutContent'>
      <Header />

      <div className="authContainer">
        <div className="authCard">
          <h1>Iniciar Sesión</h1>
          <form action="http://localhost:5000/api/usuarios/login" method="POST">
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" name="correo" required />

            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="contrasena" required />

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
