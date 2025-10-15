import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterBase from './RegisterBase.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const RegisterAdmin = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    cargo: '',
    departamento: ''
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
      const res = await fetch('http://localhost:5000/api/usuarios/registro-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        navigate('/activar-cuenta', { state: { correo: formData.correo } });
        setError('');
      } else {
        setError(data.message || 'Error al registrar administrador');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión');
    }
  };

  return (
    <div className="authContainer">
      <div className="authCard">
        <h2>Registro de Administrador</h2>
        <form onSubmit={handleSubmit}>
          <RegisterBase formData={formData} handleChange={handleChange} />

          <label htmlFor="cargo">Cargo</label>
          <input type="text" id="cargo" name="cargo" value={formData.cargo} onChange={handleChange} required />

          <label htmlFor="departamento">Departamento</label>
          <input type="text" id="departamento" name="departamento" value={formData.departamento} onChange={handleChange} required />

          {error && <p className="errorMessage">{error}</p>}
          <button type="submit" className="authBtn">Registrar administrador</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;
