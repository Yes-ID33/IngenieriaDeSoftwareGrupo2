import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../index.css";
import "../auth.css";

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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Limpiar error al cambiar los campos
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
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

      // Redirigir a la página de verificación con el correo
      navigate('/verify-account', { 
        state: { 
          correo: formData.correo,
          nombre: formData.nombre,
          message: response.data.message 
        } 
      });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
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
          <h2>Crear cuenta</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="nombre">Nombre</label>
            <input 
              type="text" 
              id="nombre" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              required 
            />

            <label htmlFor="apellido">Apellido</label>
            <input 
              type="text" 
              id="apellido" 
              name="apellido" 
              value={formData.apellido} 
              onChange={handleChange} 
              required 
            />

            <label htmlFor="celular">Celular</label>
            <input 
              type="text" 
              id="celular" 
              name="celular" 
              value={formData.celular} 
              onChange={handleChange} 
              placeholder="1234567890"
              required 
            />

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

            <label htmlFor="contrasena">Contraseña</label>
            <input 
              type="password" 
              id="contrasena" 
              name="contrasena" 
              value={formData.contrasena} 
              onChange={handleChange} 
              placeholder="Mínimo 8 caracteres"
              required 
            />

            <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
            <input 
              type="password" 
              id="confirmarContrasena" 
              name="confirmarContrasena" 
              value={formData.confirmarContrasena} 
              onChange={handleChange} 
              placeholder="Repite tu contraseña"
              required 
            />

            {error && <p className="errorMessage">{error}</p>}

            <button 
              type="submit" 
              className="authBtn"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
          <p>
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className="authLink">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;