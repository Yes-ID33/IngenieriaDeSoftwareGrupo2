import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/header.jsx';
import styles from '../styles/perfil.module.css';

const Perfil = () => {
  const { usuario } = useAuth();
  const [perfilCompleto, setPerfilCompleto] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerPerfil();
  }, []);

  useEffect(() => {
    // Solo obtener postulaciones si el usuario es estudiante
    if (perfilCompleto && perfilCompleto.rol === 'estudiante') {
      obtenerPostulaciones();
    }
  }, [perfilCompleto]);

  const obtenerPerfil = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/auth/perfil', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        setPerfilCompleto(data.data.usuario);
      } else {
        setError(data.message || 'Error al obtener perfil');
      }
    } catch (err) {
      console.error('Error al obtener perfil:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const obtenerPostulaciones = async () => {
    try {
      setLoadingPostulaciones(true);
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/estudiantes/postulaciones/mis-postulaciones', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        // Tomar solo las últimas 5 postulaciones
        setPostulaciones(data.data.postulaciones.slice(0, 5));
      }
    } catch (err) {
      console.error('Error al obtener postulaciones:', err);
    } finally {
      setLoadingPostulaciones(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { emoji: '⏳', text: 'Pendiente', class: 'estado-pendiente' },
      'aceptado': { emoji: '✅', text: 'Aceptado', class: 'estado-aceptado' },
      'rechazado': { emoji: '❌', text: 'Rechazado', class: 'estado-rechazado' }
    };
    return badges[estado] || badges['pendiente'];
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="layoutContent">
        <Header />
        <div className={styles.statsPerfil}>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layoutContent">
        <Header />
        <div className={styles.statsPerfil}>
          <p className="errorMessage">{error}</p>
          <button onClick={obtenerPerfil} className="authBtn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="layoutContent">
      <Header />
      <div className={styles.statsPerfil}>
        <h1>Perfil del usuario</h1>
        
        {perfilCompleto ? (
          <div className={styles.perfilInfo}>
            <h2>Información Personal</h2>
            <p><strong>Nombre:</strong> {perfilCompleto.nombre} {perfilCompleto.apellido || ''}</p>
            <p><strong>Correo:</strong> {perfilCompleto.correo}</p>
            <p><strong>Rol:</strong> {perfilCompleto.rol}</p>
            
            {perfilCompleto.rol === 'estudiante' && (
              <>
                <p><strong>Cédula:</strong> {perfilCompleto.cedula_id}</p>
                <p><strong>Celular:</strong> {perfilCompleto.celular}</p>
                
                {/* Información del programa */}
                {perfilCompleto.programa ? (
                  <>
                    <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>📚 Programa Académico</h3>
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6',
                      marginBottom: '15px'
                    }}>
                      <p><strong>Programa:</strong> {perfilCompleto.programa.nombre}</p>
                      <p><strong>Facultad:</strong> {perfilCompleto.programa.facultad}</p>
                      <p><strong>Nivel:</strong> {perfilCompleto.programa.nivel.charAt(0).toUpperCase() + perfilCompleto.programa.nivel.slice(1)}</p>
                      {perfilCompleto.programa.sector && (
                        <p>
                          <strong>Sector:</strong> {perfilCompleto.programa.sector_icono} {perfilCompleto.programa.sector}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#856404', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                    ⚠️ No se encontró información del programa
                  </p>
                )}
                
                <p><strong>Créditos aprobados:</strong> {perfilCompleto.creditos_aprobados}</p>
                <p><strong>Módulo de empleabilidad:</strong> {perfilCompleto.modulo_empleabilidad ? '✅ Completado' : '❌ Pendiente'}</p>
              </>
            )}

            {perfilCompleto.rol === 'empresa' && (
              <>
                <p><strong>NIT:</strong> {perfilCompleto.nit_id}</p>
                <p><strong>Razón Social:</strong> {perfilCompleto.razon_social}</p>
                <p><strong>Reclutador:</strong> {perfilCompleto.nombre_reclutador}</p>
                <p><strong>Correo de contacto:</strong> {perfilCompleto.contacto_correo}</p>
                <p><strong>Teléfono:</strong> {perfilCompleto.contacto_telefono}</p>
              </>
            )}

            {perfilCompleto.rol === 'administrador' && (
              <>
                <p><strong>Cargo:</strong> {perfilCompleto.cargo}</p>
                <p><strong>Departamento:</strong> {perfilCompleto.departamento}</p>
                <p><strong>Estado:</strong> {perfilCompleto.activo ? '✅ Activo' : '❌ Inactivo'}</p>
              </>
            )}

            <p><strong>Cuenta verificada:</strong> {perfilCompleto.verificado ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Fecha de registro:</strong> {new Date(perfilCompleto.fecha_creacion).toLocaleDateString('es-CO')}</p>
            {perfilCompleto.ultimo_acceso && (
              <p><strong>Último acceso:</strong> {new Date(perfilCompleto.ultimo_acceso).toLocaleString('es-CO')}</p>
            )}
          </div>
        ) : (
          <p>No hay información de usuario disponible.</p>
        )}

        {/* POSTULACIONES REALES PARA ESTUDIANTES */}
        {perfilCompleto && perfilCompleto.rol === 'estudiante' && (
          <>
            <h2>Últimas Postulaciones</h2>
            
            {loadingPostulaciones ? (
              <p>Cargando postulaciones...</p>
            ) : postulaciones.length === 0 ? (
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <p>📭 Aún no te has postulado a ninguna vacante</p>
                <Link to="/vacantes">
                  <button className="authBtn" style={{ marginTop: '10px' }}>
                    Ver Vacantes Disponibles
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <table className={styles.tablaSolicitudes}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vacante</th>
                      <th>Empresa</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postulaciones.map((postulacion, index) => {
                      const badge = getEstadoBadge(postulacion.estado);
                      return (
                        <tr key={postulacion.aplicacion_id}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{postulacion.vacante_titulo}</strong>
                            {postulacion.vacante_sector && (
                              <div style={{ fontSize: '0.85em', color: '#666' }}>
                                {postulacion.vacante_sector}
                              </div>
                            )}
                          </td>
                          <td>{postulacion.razon_social}</td>
                          <td>
                            <span className={badge.class}>
                              {badge.emoji} {badge.text}
                            </span>
                          </td>
                          <td>{formatearFecha(postulacion.fecha_aplicacion)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                

              </>
            )}
          </>
        )}

        {/* PANEL DE EMPRESA */}
        {perfilCompleto && perfilCompleto.rol === 'empresa' && (
          <>
            <h2>Panel de Gestión</h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <Link to="/panel/empresa">
                <button className="authBtn">🏢 Panel de Empresa</button>
              </Link>
            </div>
          </>
        )}

        {/* PANEL DE ADMINISTRADOR */}
        {perfilCompleto && perfilCompleto.rol === 'administrador' && (
          <>
            <h2>Panel de administración</h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <Link to="/panel/admin/">
                <button className="authBtn">Panel de administración</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Perfil;