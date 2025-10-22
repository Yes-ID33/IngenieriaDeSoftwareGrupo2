import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css';

const PanelAdmin = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState({
    empresasPendientes: 0,
    empresasAprobadas: 0,
    totalEstudiantes: 0,
    totalVacantes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar que sea administrador
    if (usuario && usuario.rol !== 'administrador') {
      navigate('/');
      return;
    }
    obtenerEstadisticas();
  }, [usuario, navigate]);

  const obtenerEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener empresas pendientes
      const resEmpresas = await fetch('http://localhost:5000/api/admin/empresas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const dataEmpresas = await resEmpresas.json();
      
      if (dataEmpresas.success) {
        setEstadisticas({
          empresasPendientes: dataEmpresas.data.pendientes,
          empresasAprobadas: dataEmpresas.data.aprobadas,
          totalEstudiantes: 0, // Por ahora mock, después conectar con backend
          totalVacantes: 0 // Por ahora mock, después conectar con backend
        });
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
          <h1>🛡️ Panel de Administración</h1>
          <p>Bienvenido, <strong>{usuario?.nombre}</strong></p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="statsGrid">
          <div className="statCard pending">
            <div className="statIcon">⏳</div>
            <div className="statInfo">
              <h3>{estadisticas.empresasPendientes}</h3>
              <p>Empresas Pendientes</p>
            </div>
          </div>

          <div className="statCard approved">
            <div className="statIcon">✅</div>
            <div className="statInfo">
              <h3>{estadisticas.empresasAprobadas}</h3>
              <p>Empresas Aprobadas</p>
            </div>
          </div>

          <div className="statCard students">
            <div className="statIcon">👨‍🎓</div>
            <div className="statInfo">
              <h3>{estadisticas.totalEstudiantes}</h3>
              <p>Estudiantes Registrados</p>
            </div>
          </div>

          <div className="statCard vacantes">
            <div className="statIcon">💼</div>
            <div className="statInfo">
              <h3>{estadisticas.totalVacantes}</h3>
              <p>Vacantes Publicadas</p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="quickActions">
          <h2>Acciones Rápidas</h2>
          <div className="actionsGrid">
            <Link to="/panel/admin/empresas-pendientes" className="actionCard">
              <div className="actionIcon">🏢</div>
              <h3>Gestionar Empresas</h3>
              <p>Aprobar o rechazar empresas pendientes</p>
              {estadisticas.empresasPendientes > 0 && (
                <span className="badge">{estadisticas.empresasPendientes} pendientes</span>
              )}
            </Link>

            <Link to="/panel/admin/usuarios" className="actionCard">
              <div className="actionIcon">👥</div>
              <h3>Gestionar Usuarios</h3>
              <p>Ver, editar y eliminar usuarios</p>
            </Link>

            <Link to="/panel/admin/vacantes" className="actionCard">
              <div className="actionIcon">📋</div>
              <h3>Gestionar Vacantes</h3>
              <p>Revisar y aprobar vacantes</p>
            </Link>

            <Link to="/panel/admin/metricas" className="actionCard">
              <div className="actionIcon">📊</div>
              <h3>Ver Métricas</h3>
              <p>Estadísticas y reportes del sistema</p>
            </Link>
          </div>
        </div>

        {/* Actividad reciente (opcional) */}
        <div className="recentActivity">
          <h2>Actividad Reciente</h2>
          <div className="activityList">
            <div className="activityItem">
              <span className="activityIcon">🆕</span>
              <div className="activityInfo">
                <p><strong>Nueva empresa registrada</strong></p>
                <p className="activityTime">Hace 2 horas</p>
              </div>
            </div>
            <div className="activityItem">
              <span className="activityIcon">👨‍🎓</span>
              <div className="activityInfo">
                <p><strong>Nuevo estudiante verificado</strong></p>
                <p className="activityTime">Hace 5 horas</p>
              </div>
            </div>
            <div className="activityItem">
              <span className="activityIcon">💼</span>
              <div className="activityInfo">
                <p><strong>Vacante publicada</strong></p>
                <p className="activityTime">Hace 1 día</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelAdmin;