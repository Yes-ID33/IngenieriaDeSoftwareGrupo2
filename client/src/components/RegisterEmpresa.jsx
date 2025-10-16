import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterBase from './RegisterBase.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const RegisterEmpresa = () => {
  const [formData, setFormData] = useState({
    nombre: '',
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/usuarios/registro-empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        navigate('/activar-cuenta', { state: { correo: formData.correo } });
        setError('');
      } else {
        setError(data.message || 'Error al registrar empresa');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    }
  };

  return (
    <div className="authContainer">
      <div className="authCard">
        <h2>Registro de Empresa</h2>
        <form onSubmit={handleSubmit}>
          <RegisterBase formData={formData} handleChange={handleChange} />

          <label htmlFor="nit_id">NIT</label>
          <input type="text" id="nit_id" name="nit_id" value={formData.nit_id} onChange={handleChange} required />

          <label htmlFor="razon_social">Razón social</label>
          <input type="text" id="razon_social" name="razon_social" value={formData.razon_social} onChange={handleChange} required />

          <label htmlFor="nombre_reclutador">Nombre del reclutador</label>
          <input type="text" id="nombre_reclutador" name="nombre_reclutador" value={formData.nombre_reclutador} onChange={handleChange} required />

          <label htmlFor="contacto_correo">Correo de contacto</label>
          <input type="email" id="contacto_correo" name="contacto_correo" value={formData.contacto_correo} onChange={handleChange} required />

          <label htmlFor="contacto_telefono">Teléfono de contacto</label>
          <input type="text" id="contacto_telefono" name="contacto_telefono" value={formData.contacto_telefono} onChange={handleChange} required />

          {error && <p className="errorMessage">{error}</p>}
          <button type="submit" className="authBtn">Registrar empresa</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterEmpresa;
