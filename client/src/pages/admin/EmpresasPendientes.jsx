import React, { useEffect, useState } from 'react';
import Header from '../../components/header.jsx';
import styles from '../../styles/adminEmpresas.module.css';

const EmpresasPendientes = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const token = localStorage.getItem('token');

  // Obtener empresas pendientes
  const obtenerEmpresas = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/empresas/pendientes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        setEmpresas(data.data.empresas);
      } else {
        setError(data.message || 'Error al cargar empresas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerEmpresas();
  }, []);

  // Aprobar empresa
  const aprobarEmpresa = async (id) => {
    if (!window.confirm('¿Seguro que deseas aprobar esta empresa?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/empresas/aprobar/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        obtenerEmpresas(); // refrescar la lista
      } else {
        alert(data.message || 'Error al aprobar empresa');
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    }
  };

  // Rechazar empresa
  const rechazarEmpresa = async (id) => {
    const motivo = prompt('Ingresa el motivo del rechazo:');
    if (!motivo) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/empresas/rechazar/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo })
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        obtenerEmpresas();
      } else {
        alert(data.message || 'Error al rechazar empresa');
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    }
  };

  if (loading) return <p className="layoutContent">Cargando...</p>;
  if (error) return <p className="layoutContent errorMessage">{error}</p>;

  return (
    <div className="layoutContent">
      <Header />
      <div className={styles.container}>
        <h1>Empresas Pendientes de Aprobación</h1>

        {empresas.length === 0 ? (
          <p>No hay empresas pendientes.</p>
        ) : (
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>NIT</th>
                <th>Razón Social</th>
                <th>Reclutador</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Registrada en</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.usuario_id}>
                  <td>{empresa.nit_id}</td>
                  <td>{empresa.razon_social}</td>
                  <td>{empresa.nombre_reclutador}</td>
                  <td>{empresa.correo}</td>
                  <td>{empresa.telefono}</td>
                  <td>{new Date(empresa.fecha_creacion).toLocaleDateString('es-CO')}</td>
                  <td>
                    <button
                      onClick={() => aprobarEmpresa(empresa.usuario_id)}
                      className={styles.btnAprobar}
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      onClick={() => rechazarEmpresa(empresa.usuario_id)}
                      className={styles.btnRechazar}
                    >
                      ❌ Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmpresasPendientes;
