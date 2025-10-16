import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterEstudiante = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    cedula_id: '',
    creditos_aprobados: '',
    modulo_empleabilidad: false
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
        ...formData,
        rol: 'estudiante'
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
      <label>Apellido</label>
      <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
      <label>Celular</label>
      <input type="text" name="celular" value={formData.celular} onChange={handleChange} required />
      <label>Correo electrónico</label>
      <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
      <label>Contraseña</label>
      <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
      <label>Confirmar contraseña</label>
      <input type="password" name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} required />
      <label>Cédula</label>
      <input type="text" name="cedula_id" value={formData.cedula_id} onChange={handleChange} required />
      <label>Créditos aprobados</label>
      <input type="number" name="creditos_aprobados" value={formData.creditos_aprobados} onChange={handleChange} required />
      <label>
        <input type="checkbox" name="modulo_empleabilidad" checked={formData.modulo_empleabilidad} onChange={handleChange} />
        ¿Ha cursado el módulo de empleabilidad?
      </label>
      {error && <p className="errorMessage">{error}</p>}
      <button type="submit" className="authBtn">Crear cuenta estudiante</button>
    </form>
  );
};

export default RegisterEstudiante;