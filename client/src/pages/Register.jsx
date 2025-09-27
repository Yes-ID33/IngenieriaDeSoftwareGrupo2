import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/auth.css";

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
  const navigate = useNavigate();

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

      navigate('/activar-cuenta', { 
        state: { 
          correo: formData.correo
        } 
      });

      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  return (
    <div className='layoutContent'>
      <Header />

      <div className="authContainer">
        <div className="authCard">
          <h2>Crear cuenta</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />

            <label htmlFor="apellido">Apellido</label>
            <input type="text" id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />

            <label htmlFor="celular">Celular</label>
            <input type="text" id="celular" name="celular" value={formData.celular} onChange={handleChange} required />

            <label htmlFor="correo">Correo electrónico</label>
            <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} required />

            <label htmlFor="contrasena">Contraseña</label>
            <input type="password" id="contrasena" name="contrasena" value={formData.contrasena} onChange={handleChange} required />

            <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
            <input type="password" id="confirmarContrasena" name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} required />

            {error && <p className="errorMessage">{error}</p>}

            <button type="submit" className="authBtn">Crear cuenta</button>
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
