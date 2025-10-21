import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterBase from './RegisterBase.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const RegisterEstudiante = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '', // ✅ AGREGADO (Opcional)
    celular: '', // ✅ AGREGADO
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    cedula: '', // ✅ CAMBIADO de cedula_id a cedula
    programa: '',
    creditos_aprobados: '',
    modulo_empleabilidad: false
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setError('');
    
    // ✅ VALIDAR DOMINIO INSTITUCIONAL
    const dominioInstitucional = '@pascualbravo.edu.co';
    if (!formData.correo.toLowerCase().endsWith(dominioInstitucional)) {
      setError(`❌ El correo debe ser institucional (${dominioInstitucional})`);
      return;
    }

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
      // ✅ NUEVA URL CORRECTA
      const res = await fetch('http://localhost:5000/api/estudiantes/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          celular: formData.celular,
          correo: formData.correo,
          contrasena: formData.contrasena,
          cedula: parseInt(formData.cedula), // Convertir a número
          programa: formData.programa,
          creditos_aprobados: parseInt(formData.creditos_aprobados) || 0,
          modulo_empleabilidad: formData.modulo_empleabilidad
        })
      });

      const data = await res.json();

      if (data.success) {
        // ✅ Redirigir a activación de cuenta
        navigate('/activar-cuenta', { 
          state: { 
            correo: formData.correo,
            mensaje: data.message 
          } 
        });
      } else {
        setError(data.message || 'Error al registrar estudiante');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authContainer">
      <div className="authCard">
        <h2>Registro de Estudiante</h2>
        <form onSubmit={handleSubmit}>
          <RegisterBase formData={formData} handleChange={handleChange} />
          
          {/* ⚠️ MENSAJE IMPORTANTE SOBRE EL CORREO */}
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeeba',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '15px',
            fontSize: '14px',
            color: '#856404'
          }}>
            ⚠️ <strong>Importante:</strong> Debes usar tu correo institucional (@pascualbravo.edu.co)
          </div>

          {/* ✅ CAMPOS ADICIONALES */}
          <label htmlFor="apellido">Apellido</label>
          <input 
            type="text" 
            id="apellido" 
            name="apellido" 
            value={formData.apellido} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="celular">Celular (10 dígitos)</label>
          <input 
            type="text" 
            id="celular" 
            name="celular" 
            value={formData.celular} 
            onChange={handleChange}
            pattern="\d{10}"
            title="Debe ser un número de 10 dígitos"
            required 
          />

          <label htmlFor="cedula">Cédula</label>
          <input 
            type="text" 
            id="cedula" 
            name="cedula" 
            value={formData.cedula} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="programa">Programa</label>
          <input 
            type="text" 
            id="programa" 
            name="programa" 
            value={formData.programa} 
            onChange={handleChange} 
            required 
          />

          <label htmlFor="creditos_aprobados">Créditos aprobados</label>
          <input 
            type="number" 
            id="creditos_aprobados" 
            name="creditos_aprobados" 
            value={formData.creditos_aprobados} 
            onChange={handleChange}
            min="0"
            required 
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              name="modulo_empleabilidad" 
              checked={formData.modulo_empleabilidad} 
              onChange={handleChange} 
            />
            ¿Ha completado el módulo de empleabilidad?
          </label>

          {error && <p className="errorMessage">{error}</p>}
          
          <button 
            type="submit" 
            className="authBtn" 
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar estudiante'}
          </button>
        </form>
        
        <p>
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="authLink">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterEstudiante;