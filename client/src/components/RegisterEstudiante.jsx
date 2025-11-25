import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterBase from './RegisterBase.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const RegisterEstudiante = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    celular: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
    cedula: '',
    programa_id: '', // ✅ Guardar ID del programa
    creditos_aprobados: '',
    modulo_empleabilidad: false
  });
  
  const [programas, setProgramas] = useState([]);
  const [loadingProgramas, setLoadingProgramas] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Cargar programas al montar el componente
  useEffect(() => {
    const cargarProgramas = async () => {
      try {
        // ✅ Usa la ruta correcta de tu backend
        const res = await fetch('http://localhost:5000/api/catalogos/programas');
        const data = await res.json();
        
        if (data.success) {
          // ✅ Tu backend devuelve data.data.programas
          setProgramas(data.data.programas);
        } else {
          setError('Error al cargar programas');
        }
      } catch (err) {
        console.error('Error al cargar programas:', err);
        setError('Error de conexión al cargar programas');
      } finally {
        setLoadingProgramas(false);
      }
    };

    cargarProgramas();
  }, []);

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

    // ✅ Validar que se haya seleccionado un programa
    if (!formData.programa_id) {
      setError('Debes seleccionar un programa');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/estudiantes/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          celular: formData.celular,
          correo: formData.correo,
          contrasena: formData.contrasena,
          cedula: parseInt(formData.cedula),
          programa_id: parseInt(formData.programa_id), // ✅ Enviar ID del programa
          creditos_aprobados: parseInt(formData.creditos_aprobados) || 0,
          modulo_empleabilidad: formData.modulo_empleabilidad
        })
      });

      const data = await res.json();

      if (data.success) {
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

  // ✅ Agrupar programas por facultad
  const programasPorFacultad = programas.reduce((acc, programa) => {
    const facultad = programa.facultad || 'Sin Facultad';
    if (!acc[facultad]) {
      acc[facultad] = [];
    }
    acc[facultad].push(programa);
    return acc;
  }, {});

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

          {/* ✅ SELECT DE PROGRAMAS CON AGRUPACIÓN POR FACULTAD */}
          <label htmlFor="programa_id">Programa Académico</label>
          <select 
            id="programa_id" 
            name="programa_id" 
            value={formData.programa_id} 
            onChange={handleChange}
            disabled={loadingProgramas}
            required
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              fontSize: '14px',
              width: '100%',
              backgroundColor: loadingProgramas ? '#f0f0f0' : 'white'
            }}
          >
            <option value="">
              {loadingProgramas ? 'Cargando programas...' : '-- Selecciona tu programa --'}
            </option>
            
            {/* ✅ Agrupar por facultad usando optgroup */}
            {Object.entries(programasPorFacultad).map(([facultad, progs]) => (
              <optgroup key={facultad} label={`📚 ${facultad.toUpperCase()}`}>
                {progs.map(programa => (
                  <option key={programa.id} value={programa.id}>
                    {programa.nombre} • {programa.nivel.charAt(0).toUpperCase() + programa.nivel.slice(1)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <label htmlFor="creditos_aprobados">Créditos Aprobados</label>
          <input 
            type="number" 
            id="creditos_aprobados" 
            name="creditos_aprobados" 
            value={formData.creditos_aprobados} 
            onChange={handleChange}
            min="0"
            placeholder="Ej: 45"
            required 
          />

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            <input 
              type="checkbox" 
              name="modulo_empleabilidad" 
              checked={formData.modulo_empleabilidad} 
              onChange={handleChange}
              style={{ cursor: 'pointer' }}
            />
            <span>¿Ha completado el módulo de empleabilidad?</span>
          </label>

          {error && (
            <div style={{
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              color: '#721c24',
              padding: '10px',
              borderRadius: '5px',
              marginTop: '15px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="authBtn" 
            disabled={loading || loadingProgramas}
            style={{
              marginTop: '20px',
              opacity: (loading || loadingProgramas) ? 0.6 : 1,
              cursor: (loading || loadingProgramas) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Registrando...' : '✅ Registrar estudiante'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="authLink">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterEstudiante;