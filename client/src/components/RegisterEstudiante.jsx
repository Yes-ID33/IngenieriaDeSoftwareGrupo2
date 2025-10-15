import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterBase from './RegisterBase.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const RegisterEstudiante = () => {
  const [formData, setFormData] = useState({
    nombre: '',
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
      const res = await fetch('http://localhost:5000/api/usuarios/registro-estudiante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        navigate('/activar-cuenta', { state: { correo: formData.correo } });
        setError('');
      } else {
        setError(data.message || 'Error al registrar estudiante');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    }
  };

  return (
    <div className="authContainer">
      <div className="authCard">
        <h2>Registro de Estudiante</h2>
        <form onSubmit={handleSubmit}>
          <RegisterBase formData={formData} handleChange={handleChange} />

          <label htmlFor="cedula_id">Cédula</label>
          <input type="text" id="cedula_id" name="cedula_id" value={formData.cedula_id} onChange={handleChange} required />

          <label htmlFor="creditos_aprobados">Créditos aprobados</label>
          <input type="number" id="creditos_aprobados" name="creditos_aprobados" value={formData.creditos_aprobados} onChange={handleChange} required />

          <label>
            <input type="checkbox" name="modulo_empleabilidad" checked={formData.modulo_empleabilidad} onChange={handleChange} />
            ¿Ha completado el módulo de empleabilidad?
          </label>

          {error && <p className="errorMessage">{error}</p>}
          <button type="submit" className="authBtn">Registrar estudiante</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterEstudiante;
