import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css'; // Reutilizamos los estilos del admin

const PanelEmpresa = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState({
    totalVacantes: 0,
    vacantesAprobadas: 0,
    vacantesPendientes: 0,
    totalPostulaciones: 0,
    postulacionesPendientes: 0,
    postulacionesAceptadas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar que sea empresa
    if (usuario && usuario.rol !== 'empresa') {
      navigate('/');
      return;
    }

    // Verificar que la empresa esté verificada
    if (usuario && !usuario.verificado) {
      alert('⚠️ Tu empresa aún no ha sido aprobada por un administrador. Por favor espera la aprobación.');
      navigate('/perfil');
      return;
    }

    obtenerEstadisticas();
  }, [usuario, navigate]);

  const obtenerEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener mis vacantes
      const res = await fetch('http://localhost:5000/api/vacantes/mis-vacantes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (data.success) {
        const vacantes = data.data.vacantes;
        
        // Calcular estadísticas
        const stats = {
          totalVacantes: vacantes.length,
          vacantesAprobadas: vacantes.filter(v => v.aprobada).length,
          vacantesPendientes: vacantes.filter(v => !v.aprobada).length,
          totalPostulaciones: vacantes.reduce((sum, v) => sum + Number.parseInt(v.total_postulaciones || 0), 0),
          postulacionesPendientes: vacantes.reduce((sum, v) => sum + Number.parseInt(v.postulaciones_pendientes || 0), 0),
          postulacionesAceptadas: vacantes.reduce((sum, v) => sum + Number.parseInt(v.postulaciones_aceptadas || 0), 0)
        };
        
        setEstadisticas(stats);
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="layoutContent">
        <Header />
        <div className="adminContainer">
          <p>Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layoutContent">
      <Header />
      <div className="adminContainer">
        <div className="adminHeader">
          <div>
            <h1>🏢 Panel de Empresa</h1>
            <p>Bienvenido, <strong>{usuario?.razon_social || usuario?.nombre}</strong></p>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="statsGrid">
          <div className="statCard vacantes">
            <div className="statIcon">💼</div>
            <div className="statInfo">
              <h3>{estadisticas.totalVacantes}</h3>
              <p>Vacantes Publicadas</p>
              <small>{estadisticas.vacantesAprobadas} activas</small>
            </div>
          </div>

          <div className="statCard pending">
            <div className="statIcon">⏳</div>
            <div className="statInfo">
              <h3>{estadisticas.vacantesPendientes}</h3>
              <p>Vacantes Pendientes</p>
              <small>Esperando aprobación</small>
            </div>
          </div>

          <div className="statCard students">
            <div className="statIcon">📨</div>
            <div className="statInfo">
              <h3>{estadisticas.totalPostulaciones}</h3>
              <p>Total Postulaciones</p>
              <small>{estadisticas.postulacionesPendientes} por revisar</small>
            </div>
          </div>

          <div className="statCard approved">
            <div className="statIcon">✅</div>
            <div className="statInfo">
              <h3>{estadisticas.postulacionesAceptadas}</h3>
              <p>Candidatos Aceptados</p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="quickActions">
          <h2>Acciones Rápidas</h2>
          <div className="actionsGrid">
            <Link to="/panel/empresa/crear-vacante" className="actionCard">
              <div className="actionIcon">➕</div>
              <h3>Publicar Vacante</h3>
              <p>Crear una nueva oferta de práctica</p>
            </Link>

            <Link to="/panel/empresa/mis-vacantes" className="actionCard">
              <div className="actionIcon">📋</div>
              <h3>Mis Vacantes</h3>
              <p>Ver y gestionar mis publicaciones</p>
              {estadisticas.vacantesPendientes > 0 && (
                <span className="badge badge-warning">{estadisticas.vacantesPendientes} pendientes</span>
              )}
            </Link>

            <Link to="/panel/empresa/postulaciones" className="actionCard">
              <div className="actionIcon">👥</div>
              <h3>Ver Postulaciones</h3>
              <p>Revisar candidatos que aplicaron</p>
              {estadisticas.postulacionesPendientes > 0 && (
                <span className="badge badge-warning">{estadisticas.postulacionesPendientes} nuevas</span>
              )}
            </Link>

            <Link to="/perfil" className="actionCard">
              <div className="actionIcon">⚙️</div>
              <h3>Mi Perfil</h3>
              <p>Actualizar información de la empresa</p>
            </Link>
          </div>
        </div>

        {/* Información de estado de cuenta */}
        <div className="quickSummary">
          <h2>Estado de la Cuenta</h2>
          <div className="summaryGrid">
            <div className="summaryItem">
              <span className="summaryLabel">Estado de Verificación:</span>
              <span className="summaryValue">
                {usuario?.verificado ? '✅ Verificada' : '⏳ Pendiente'}
              </span>
            </div>
            <div className="summaryItem">
              <span className="summaryLabel">Razón Social:</span>
              <span className="summaryValue">{usuario?.razon_social}</span>
            </div>
            <div className="summaryItem">
              <span className="summaryLabel">NIT:</span>
              <span className="summaryValue">{usuario?.nit_id}</span>
            </div>
            <div className="summaryItem">
              <span className="summaryLabel">Contacto:</span>
              <span className="summaryValue">{usuario?.contacto_correo}</span>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {estadisticas.vacantesPendientes > 0 && (
          <div className="alertBox">
            <h3>⏳ Vacantes Pendientes de Aprobación</h3>
            <p>Tienes <strong>{estadisticas.vacantesPendientes}</strong> vacante(s) esperando aprobación del administrador.</p>
            <p>Las vacantes aprobadas aparecerán visibles para los estudiantes automáticamente.</p>
          </div>
        )}

        {estadisticas.postulacionesPendientes > 0 && (
          <div className="alertBox" style={{background: 'linear-gradient(135deg, #a8e6cf 0%, #56ab91 100%)'}}>
            <h3>👥 Nuevas Postulaciones</h3>
            <p>Tienes <strong>{estadisticas.postulacionesPendientes}</strong> postulación(es) esperando tu revisión.</p>
            <Link to="/panel/empresa/postulaciones">
              <button className="btnPrimary" style={{marginTop: '10px'}}>
                Ver Postulaciones →
              </button>
            </Link>
          </div>
        )}

        {estadisticas.totalVacantes === 0 && (
          <div className="alertBox" style={{background: 'linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)'}}>
            <h3>🎯 Comienza a Publicar</h3>
            <p>Aún no tienes vacantes publicadas. ¡Publica tu primera oferta de práctica profesional!</p>
            <Link to="/panel/empresa/crear-vacante">
              <button className="btnSuccess" style={{marginTop: '10px'}}>
                ➕ Publicar Mi Primera Vacante
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelEmpresa;