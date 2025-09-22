import React from 'react';
import "../App.css";
import "../index.css"

const Login = () => {
  return (
    <>
      <header>
        <div className="nav-left">
          <nav>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/">Placeholder</a></li>
            </ul>
          </nav>
        </div>
        <div className="nav-right">
          <nav>
            <ul>
              <li><a href="/login">Iniciar Sesión</a></li>
              <li><a href="/register">Registrarse</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="container">
        <h1>Iniciar sesión / Registro</h1>
        <form action="http://localhost:5000/api/usuarios/login" method="POST">
          <label htmlFor="email">Correo electrónico</label>
          <input type="email" id="email" name="correo" required />

          <label htmlFor="password">Contraseña</label>
          <input type="password" id="password" name="contrasena" required />

          <button type="submit">Iniciar sesión</button>
        </form>
        <p>¿No tienes cuenta? <a href="/register">Regístrate aquí</a></p>
      </div>
    </>
  );
};

export default Login;
