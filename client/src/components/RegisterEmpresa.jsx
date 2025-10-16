import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterEmpresa = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    nit_id: '',
    razon_social: '',
    nombre_reclutador: '',
    contacto_correo: '',
    contacto_telefono: ''
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
      await axios.post('http://localhost:5000/api/usuarios/registro', {
        nombre: formData.nombre,
        celular: formData.celular,
        correo: formData.correo,
        contrasena: formData.contrasena,
        rol: 'empresa',
        nit_id: formData.nit_id,
        razon_social: formData.razon_social,
        nombre_reclutador: formData.nombre_reclutador,
        contacto_correo: formData.contacto_correo,
        contacto_telefono: formData.contacto_telefono
      });
      navigate('/activar-cuenta', { state: { correo: formData.correo } });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Nombre</label>
      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
      <label>Celular</label>
      <input type="text" name="celular" value={formData.celular} onChange={handleChange} required />
      <label>Correo electrónico</label>
      <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
      <label>Contraseña</label>
      <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
      <label>Confirmar contraseña</label>
      <input type="password" name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} required />
      <label>NIT</label>
      <input type="text" name="nit_id" value={formData.nit_id} onChange={handleChange} required />
      <label>Razón social</label>
      <input type="text" name="razon_social" value={formData.razon_social} onChange={handleChange} required />
      <label>Nombre del reclutador</label>
      <input type="text" name="nombre_reclutador" value={formData.nombre_reclutador} onChange={handleChange} required />
      <label>Correo de contacto</label>
      <input type="email" name="contacto_correo" value={formData.contacto_correo} onChange={handleChange} required />
      <label>Teléfono de contacto</label>
      <input type="text" name="contacto_telefono" value={formData.contacto_telefono} onChange={handleChange} required />
      {error && <p className="errorMessage">{error}</p>}
      <button type="submit" className="authBtn">Crear cuenta empresa</button>
    </form>
  );
};

export default RegisterEmpresa;