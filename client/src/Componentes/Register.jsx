import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/registro', {
        nombre: formData.nombre,
        apellido: formData.apellido,
        celular: formData.celular,
        correo: formData.correo,
        contrasena: formData.contrasena
      });

      alert(response.data.message);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  return (
    <>
      <header>
        <div className="nav-left">
          <nav>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/servicios.html">Servicios</a></li>
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
        <h2>Crear cuenta</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="nombre">Nombre:</label>
          <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />

          <label htmlFor="apellido">Apellido:</label>
          <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />

          <label htmlFor="celular">Celular:</label>
          <input type="text" id="celular" name="celular" value={formData.celular} onChange={handleChange} required />

          <label htmlFor="correo">Correo electrónico:</label>
          <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} required />

          <label htmlFor="contrasena">Contraseña:</label>
          <input type="password" id="contrasena" name="contrasena" value={formData.contrasena} onChange={handleChange} required />

          <label htmlFor="confirmarContrasena">Confirmar Contraseña:</label>
          <input type="password" id="confirmarContrasena" name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} required />

          {error && <p className="error-message">{error}</p>}

          <button type="submit">Crear cuenta</button>
        </form>
        <p>¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a></p>
      </div>
    </>
  );
};

export default Register;