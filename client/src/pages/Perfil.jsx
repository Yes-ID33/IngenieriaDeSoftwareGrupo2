import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/header.jsx';
import styles from '../styles/perfil.module.css';

const Perfil = () => {
  const { usuario } = useAuth();

  // Simulación de solicitudes recientes
  const solicitudesRecientes = [
    { id: 1, vacante: 'Desarrollador Frontend', estado: 'pendiente', fecha: '2025-10-10' },
    { id: 2, vacante: 'Analista QA', estado: 'aceptado', fecha: '2025-10-08' },
    { id: 3, vacante: 'Backend Node.js', estado: 'rechazado', fecha: '2025-10-05' },
    { id: 4, vacante: 'Diseñador UX/UI', estado: 'pendiente', fecha: '2025-10-03' },
    { id: 5, vacante: 'Ingeniero DevOps', estado: 'pendiente', fecha: '2025-10-01' }
  ];

  return (
    <div className="layoutContent">
      <Header />
      <div className={styles.statsPerfil}>
        <h1>Perfil del usuario</h1>

        {usuario ? (
          <div className={styles.perfilInfo}>
            <p><strong>Nombre:</strong> {usuario.nombre}</p>
            <p><strong>Correo:</strong> {usuario.correo}</p>
            <p><strong>Rol:</strong> {usuario.rol}</p>
            {/* Puedes agregar más campos si están disponibles en el objeto usuario */}
          </div>
        ) : (
          <p>No hay información de usuario disponible.</p>
        )}

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
                <td>{solicitud.estado}</td>
                <td>{solicitud.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '15px' }}>
          <Link to="/historial-estudiante">
            <button className="authBtn">Ver todas</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
