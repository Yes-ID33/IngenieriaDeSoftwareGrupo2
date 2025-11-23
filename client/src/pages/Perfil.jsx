import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/header.jsx';
import styles from '../styles/perfil.module.css';

const Perfil = () => {
  const [perfilCompleto, setPerfilCompleto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simulación de solicitudes recientes (después puedes traerlo del backend)
  const solicitudesRecientes = [
    { id: 1, vacante: 'Desarrollador Frontend', estado: 'pendiente', fecha: '2025-10-10' },
    { id: 2, vacante: 'Analista QA', estado: 'aceptado', fecha: '2025-10-08' },
    { id: 3, vacante: 'Backend Node.js', estado: 'rechazado', fecha: '2025-10-05' },
    { id: 4, vacante: 'Diseñador UX/UI', estado: 'pendiente', fecha: '2025-10-03' },
    { id: 5, vacante: 'Ingeniero DevOps', estado: 'pendiente', fecha: '2025-10-01' }
  ];

  useEffect(() => {
    obtenerPerfil();
  }, []);

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

        {perfilCompleto?.rol === 'estudiante' && (
          <>
            <h2>Últimas solicitudes</h2>
            <table className={styles.tablaSolicitudes}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vacante</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesRecientes.map((solicitud, index) => (
                  <tr key={solicitud.id}>
                    <td>{index + 1}</td>
                    <td>{solicitud.vacante}</td>
                    <td>
                      <span className={`estado-${solicitud.estado}`}>
                        {solicitud.estado === 'pendiente' && '⏳ Pendiente'}
                        {solicitud.estado === 'aceptado' && '✅ Aceptado'}
                        {solicitud.estado === 'rechazado' && '❌ Rechazado'}
                      </span>
                    </td>
                    <td>{new Date(solicitud.fecha).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '15px' }}>
              <Link to="/historial-estudiante">
                <button className="authBtn">Ver todas las solicitudes</button>
              </Link>
            </div>
          </>
        )}

{perfilCompleto?.rol === 'empresa' && (
  <>
    <h2>Panel de Gestión</h2>
    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
      <Link to="/panel/empresa">
        <button className="authBtn">🏢 Panel de Empresa</button>
      </Link>
    </div>
  </>
)}

        {perfilCompleto?.rol === 'administrador' && (
          <>
            <h2>Panel de administración</h2>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <Link to="/panel/admin/">
                <button className="authBtn">Panel de administracion</button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Perfil;