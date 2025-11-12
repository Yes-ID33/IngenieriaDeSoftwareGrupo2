import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/index.css";
import "../styles/auth.css";

const RegisterEmpresa = () => {
  const [formData, setFormData] = useState({
    nit: '',
    razon_social: '',
    nombre_reclutador: '',
    contacto_correo: '',
    contacto_telefono: '',
    contrasena: '',
    confirmarContrasena: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setError('');

    // Validar contraseñas
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud de contraseña
    if (formData.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/empresas/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nit: parseInt(formData.nit),
          razon_social: formData.razon_social,
          nombre_reclutador: formData.nombre_reclutador,
          contacto_correo: formData.contacto_correo,
          contacto_telefono: formData.contacto_telefono,
          contrasena: formData.contrasena
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Empresa registrada exitosamente!\n\n' + data.data.mensaje_adicional);
        navigate('/login');
      } else {
        setError(data.message || 'Error al registrar empresa');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px', textAlign: 'center' }}>
        📋 Tu cuenta será revisada por un administrador antes de ser activada
      </p>
      
      <form onSubmit={handleSubmit}>
        <label htmlFor="nit">NIT *</label>
        <input 
          type="text" 
          id="nit" 
          name="nit" 
          value={formData.nit} 
          onChange={handleChange}
          placeholder="900123456"
          required 
        />

        <label htmlFor="razon_social">Razón Social *</label>
        <input 
          type="text" 
          id="razon_social" 
          name="razon_social" 
          value={formData.razon_social} 
          onChange={handleChange}
          placeholder="Tech Solutions S.A.S"
          required 
        />

        <label htmlFor="nombre_reclutador">Nombre del Reclutador *</label>
        <input 
          type="text" 
          id="nombre_reclutador" 
          name="nombre_reclutador" 
          value={formData.nombre_reclutador} 
          onChange={handleChange}
          placeholder="María González"
          required 
        />

        <label htmlFor="contacto_correo">Correo de Contacto *</label>
        <input 
          type="email" 
          id="contacto_correo" 
          name="contacto_correo" 
          value={formData.contacto_correo} 
          onChange={handleChange}
          placeholder="reclutamiento@empresa.com"
          required 
        />

        <label htmlFor="contacto_telefono">Teléfono de Contacto</label>
        <input 
          type="text" 
          id="contacto_telefono" 
          name="contacto_telefono" 
          value={formData.contacto_telefono} 
          onChange={handleChange}
          placeholder="3001234567"
          pattern="\d{10}"
          title="Debe ser un número de 10 dígitos"
        />

        <label htmlFor="contrasena">Contraseña *</label>
        <input 
          type="password" 
          id="contrasena" 
          name="contrasena" 
          value={formData.contrasena} 
          onChange={handleChange}
          minLength="8"
          required 
        />

        <label htmlFor="confirmarContrasena">Confirmar Contraseña *</label>
        <input 
          type="password" 
          id="confirmarContrasena" 
          name="confirmarContrasena" 
          value={formData.confirmarContrasena} 
          onChange={handleChange}
          minLength="8"
          required 
        />

        {error && <p className="errorMessage">{error}</p>}
        
        <button 
          type="submit" 
          className="authBtn" 
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar empresa'}
        </button>
      </form>
    </div>
  );
};

export default RegisterEmpresa;