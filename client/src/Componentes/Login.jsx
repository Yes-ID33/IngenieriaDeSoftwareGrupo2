import React from 'react';
import "../index.css";   // estilos globales
import "../auth.css";    // estilos de login y registro

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

      <div className="auth-container">
  <div className="auth-card">
    <h1>Iniciar Sesión</h1>
    <form action="http://localhost:5000/api/usuarios/login" method="POST">
      <label htmlFor="email">Correo electrónico</label>
      <input type="email" id="email" name="correo" required />

      <label htmlFor="password">Contraseña</label>
      <input type="password" id="password" name="contrasena" required />

      <button type="submit" className="auth-btn">Entrar</button>
    </form>
    <p>
      ¿No tienes cuenta?{" "}
      <a href="/register" className="auth-link">Regístrate aquí</a>
    </p>
  </div>
</div>
    </>
  );
};

export default Login;
