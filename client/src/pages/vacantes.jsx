import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/vacantes.css";
import VacanteTarjeta from '../components/VacanteTarjeta.jsx';

const Vacantes = () => {
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [programaEstudiante, setProgramaEstudiante] = useState('');
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    obtenerVacantes();
  }, []);

  const obtenerVacantes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // ✅ CAMBIO: Usar endpoint que filtra por programa del estudiante
      const res = await fetch('http://localhost:5000/api/estudiantes/postulaciones/vacantes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        setVacantes(data.data.vacantes || []);
        setProgramaEstudiante(data.data.programa_estudiante || '');
        setError('');
      } else {
        setError(data.message || 'Error al cargar vacantes');
      }
    } catch (error) {
      console.error('Error al cargar vacantes:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Verificar que el usuario esté autenticado
  if (!usuario) {
    return (
      <div className="layoutContent">
        <Header />
        <div className="vacantesIntro">
          <h2>⚠️ Debes iniciar sesión</h2>
          <p>Para ver las vacantes disponibles necesitas tener una cuenta de estudiante.</p>
          <button onClick={() => navigate('/login')} className="authBtn">
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="layoutContent">
        <Header />
        <div className="vacantesIntro">
          <p>Cargando vacantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layoutContent">
        <Header />
        <div className="vacantesIntro">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={obtenerVacantes} className="authBtn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="layoutContent">
      <Header />
      <div className="vacantesIntro">
        <h2>Vacantes disponibles para ti</h2>
        {programaEstudiante && (
          <p style={{ color: '#666', marginTop: '10px' }}>
            📚 Tu programa: <strong>{programaEstudiante}</strong>
          </p>
        )}
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '5px' }}>
          Mostrando vacantes compatibles con tu programa y vacantes generales
        </p>
      </div>

      {vacantes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: '#f8f9fa',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h3>📭 No hay vacantes disponibles</h3>
          <p style={{ color: '#666' }}>
            Por el momento no hay vacantes para tu programa. Vuelve pronto para ver nuevas oportunidades.
          </p>
        </div>
      ) : (
        <>
          <div style={{
            padding: '10px 20px',
            background: '#e8f5e9',
            borderRadius: '8px',
            margin: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0 }}>
              ✅ Se encontraron <strong>{vacantes.length}</strong> vacante(s) disponible(s)
            </p>
          </div>

          <div className="vacantesGrid">
            {vacantes.map(vacante => (
              <VacanteTarjeta
                key={vacante.vacante_id}
                vacante={vacante}
                onAplicar={() => {
                  // Verificar si ya se postuló
                  if (vacante.ya_postulado) {
                    alert(`⚠️ Ya te has postulado a esta vacante.\n\nEstado: ${
                      vacante.estado_postulacion === 'pendiente' ? 'Pendiente de revisión' :
                      vacante.estado_postulacion === 'aceptado' ? '✅ Aceptado' :
                      '❌ Rechazado'
                    }`);
                    return;
                  }
                  navigate('/solicitud', { state: { vacante } });
                }}
                yaPostulado={vacante.ya_postulado}
                estadoPostulacion={vacante.estado_postulacion}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Vacantes;