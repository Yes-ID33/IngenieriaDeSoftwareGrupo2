import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const Solicitud = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { state } = useLocation();
  const vacante = state?.vacante;

  const [mensajePostulacion, setMensajePostulacion] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Validaciones iniciales
  if (!usuario) {
    return (
      <div className="layoutContent">
        <Header />
        <div className="authContainer">
          <div className="authCard">
            <h1>⚠️ Debes iniciar sesión</h1>
            <p>Para postularte a esta vacante necesitas tener una cuenta de estudiante.</p>
            <button onClick={() => navigate('/login')} className="authBtn">
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!vacante) {
    return (
      <div className="layoutContent">
        <Header />
        <div className="authContainer">
          <div className="authCard">
            <h1>⚠️ No se encontró la vacante</h1>
            <p>Por favor selecciona una vacante desde la página de vacantes.</p>
            <button onClick={() => navigate('/vacantes')} className="authBtn">
              Ver Vacantes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatearSalario = (salario) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salario);
  };

  const handleSolicitud = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:5000/api/estudiantes/postulaciones/postular', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vacante_id: vacante.vacante_id,
          hoja_vida_id: null, // Por ahora sin hoja de vida
          mensaje_postulacion: mensajePostulacion || null
        })
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        navigate('/vacantes');
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      alert('❌ Error de conexión. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fondoParqueTech">
      <div className='layoutContent'>
        <Header />
        <div className="authContainer">
          <div className="authCard" style={{ maxWidth: '600px' }}>
            <h1>📝 Postularse a Vacante</h1>
            
            {/* Información de la vacante */}
            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '25px'
            }}>
              <h3 style={{ margin: 0, marginBottom: '10px' }}>{vacante.titulo}</h3>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Empresa:</strong> {vacante.razon_social}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Modalidad:</strong> {vacante.modalidad}
              </p>
              <p style={{ margin: '5px 0', color: '#666' }}>
                <strong>Salario:</strong> {formatearSalario(vacante.salario)}
              </p>
              {vacante.programa_objetivo && (
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Programa:</strong> {vacante.programa_objetivo}
                </p>
              )}
            </div>

            <form onSubmit={handleSolicitud}>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="mensaje" className="authLabel">
                  Mensaje para la empresa (opcional)
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={mensajePostulacion}
                  onChange={(e) => setMensajePostulacion(e.target.value)}
                  className="authInput"
                  rows="5"
                  placeholder="Cuéntale a la empresa por qué eres el candidato ideal para esta vacante..."
                  style={{ resize: 'vertical' }}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  Este mensaje será visible para el reclutador de la empresa.
                </small>
              </div>

              <div style={{
                background: '#fff3cd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #ffc107'
              }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  ℹ️ <strong>Nota:</strong> Por el momento las postulaciones se realizan sin hoja de vida. 
                  Pronto podrás adjuntar tu CV.
                </p>
              </div>

              <button 
                type="submit" 
                className="authBtn" 
                disabled={enviando}
                style={{ width: '100%' }}
              >
                {enviando ? '⏳ Enviando...' : '📤 Enviar Postulación'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => navigate('/vacantes')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ← Volver a vacantes
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solicitud;