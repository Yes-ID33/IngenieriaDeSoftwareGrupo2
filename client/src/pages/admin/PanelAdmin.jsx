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
    vacantesPendientes: 0,
    vacantesAprobadas: 0,
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
      
      // Obtener empresas
      const resEmpresas = await fetch('http://localhost:5000/api/admin/empresas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const dataEmpresas = await resEmpresas.json();

      // Obtener vacantes
      const resVacantes = await fetch('http://localhost:5000/api/admin/vacantes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const dataVacantes = await resVacantes.json();

      // Obtener usuarios (para contar estudiantes)
      const resUsuarios = await fetch('http://localhost:5000/api/admin/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const dataUsuarios = await resUsuarios.json();
      
      if (dataEmpresas.success && dataVacantes.success && dataUsuarios.success) {
        const estudiantes = dataUsuarios.data.usuarios.filter(u => u.rol === 'estudiante').length;

        setEstadisticas({
          empresasPendientes: dataEmpresas.data.pendientes || 0,
          empresasAprobadas: dataEmpresas.data.aprobadas || 0,
          totalEstudiantes: estudiantes,
          vacantesPendientes: dataVacantes.data.pendientes || 0,
          vacantesAprobadas: dataVacantes.data.aprobadas || 0,
          totalVacantes: dataVacantes.data.total || 0
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
              <p>Vacantes Totales</p>
              <small>{estadisticas.vacantesPendientes} pendientes</small>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="quickActions">
          <h2>Acciones Rápidas</h2>
          <div className="actionsGrid">
            <Link to="/panel/admin/empresas" className="actionCard">
              <div id="IrAlPanelEmpresas" className="actionIcon">🏢</div>
              <h3>Gestionar Empresas</h3>
              <p>Aprobar o rechazar empresas pendientes</p>
              {estadisticas.empresasPendientes > 0 && (
                <span className="badge badge-warning">{estadisticas.empresasPendientes} pendientes</span>
              )}
            </Link>

            <Link to="/panel/admin/vacantes" className="actionCard">
              <div className="actionIcon">💼</div>
              <h3>Gestionar Vacantes</h3>
              <p>Revisar y aprobar vacantes publicadas</p>
              {estadisticas.vacantesPendientes > 0 && (
                <span className="badge badge-warning">{estadisticas.vacantesPendientes} pendientes</span>
              )}
            </Link>

            <Link to="/panel/admin/usuarios" className="actionCard">
              <div className="actionIcon">👥</div>
              <h3>Gestionar Usuarios</h3>
              <p>Ver, editar y administrar usuarios</p>
            </Link>

            <Link to="/panel/admin/metricas" className="actionCard">
              <div className="actionIcon">📊</div>
              <h3>Ver Métricas</h3>
              <p>Estadísticas y reportes del sistema</p>
            </Link>
          </div>
        </div>

        {/* Resumen Rápido */}
        <div className="quickSummary">
          <h2>Resumen del Sistema</h2>
          <div className="summaryGrid">
            <div className="summaryItem">
              <span className="summaryLabel">Total Empresas:</span>
              <span className="summaryValue">{estadisticas.empresasAprobadas + estadisticas.empresasPendientes}</span>
            </div>
            <div className="summaryItem">
              <span className="summaryLabel">Vacantes Activas:</span>
              <span className="summaryValue">{estadisticas.vacantesAprobadas}</span>
            </div>
            <div className="summaryItem">
              <span className="summaryLabel">Estudiantes:</span>
              <span className="summaryValue">{estadisticas.totalEstudiantes}</span>
            </div>
            <div className="summaryItem">
              <span className="summaryLabel">Tareas Pendientes:</span>
              <span className="summaryValue highlight">
                {estadisticas.empresasPendientes + estadisticas.vacantesPendientes}
              </span>
            </div>
          </div>
        </div>

        {/* Alertas si hay pendientes */}
        {(estadisticas.empresasPendientes > 0 || estadisticas.vacantesPendientes > 0) && (
          <div className="alertBox">
            <h3>⚠️ Atención Requerida</h3>
            {estadisticas.empresasPendientes > 0 && (
              <p>• Hay <strong>{estadisticas.empresasPendientes}</strong> empresa(s) esperando aprobación</p>
            )}
            {estadisticas.vacantesPendientes > 0 && (
              <p>• Hay <strong>{estadisticas.vacantesPendientes}</strong> vacante(s) esperando revisión</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelAdmin;