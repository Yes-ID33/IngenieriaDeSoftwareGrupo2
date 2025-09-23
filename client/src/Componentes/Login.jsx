import React from 'react';
import "../index.css";
import "../auth.css";

const Login = () => {
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
