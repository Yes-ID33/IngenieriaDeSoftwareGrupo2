import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css';

const GestionEmpresas = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState('pendientes'); // 'pendientes', 'aprobadas', 'todas'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuario && usuario.rol !== 'administrador') {
      navigate('/');
      return;
    }
    obtenerEmpresas();
  }, [usuario, navigate, filtro]);

  const obtenerEmpresas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const endpoint = filtro === 'pendientes' 
        ? 'http://localhost:5000/api/admin/empresas/pendientes'
        : 'http://localhost:5000/api/admin/empresas';

      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        let listaEmpresas = data.data.empresas || [];
        
        // Filtrar según selección
        if (filtro === 'aprobadas') {
          listaEmpresas = listaEmpresas.filter(e => e.verificado);
        } else if (filtro === 'pendientes') {
          listaEmpresas = listaEmpresas.filter(e => !e.verificado);
        }
        
        setEmpresas(listaEmpresas);
        setError('');
      } else {
        setError(data.message || 'Error al obtener empresas');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (usuarioId, razonSocial) => {
    if (!globalThis.confirm(`¿Estás seguro de aprobar la empresa "${razonSocial}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:5000/api/admin/empresas/aprobar/${usuarioId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        obtenerEmpresas(); // Recargar lista
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al aprobar:', err);
      alert('❌ Error de conexión al aprobar empresa');
    }
  };

  const handleRechazar = async (usuarioId, razonSocial) => {
    const motivo = globalThis.prompt(`¿Por qué rechazas la empresa "${razonSocial}"?\n(Opcional)`);
    
    if (motivo === null) return; // Usuario canceló

    if (!globalThis.confirm(`¿Estás seguro de rechazar y eliminar la empresa "${razonSocial}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:5000/api/admin/empresas/rechazar/${usuarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ motivo })
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        obtenerEmpresas(); // Recargar lista
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al rechazar:', err);
      alert('❌ Error de conexión al rechazar empresa');
    }
  };

  // SOLUCIÓN: Extraer el ternario anidado a una función
  const getMensajeEstadoVacio = () => {
    if (filtro === 'todas') {
      return '';
    }
    return filtro;
  };

  // SOLUCIÓN: Extraer el ternario principal a una función
  const renderContenidoPrincipal = () => {
    if (loading) {
      return <p>Cargando empresas...</p>;
    }

    if (empresas.length === 0) {
      return (
        <div className="emptyState">
          <p>📭 No hay empresas {getMensajeEstadoVacio()} en este momento</p>
        </div>
      );
    }

    return (
      <div className="tableContainer">
        <table className="adminTable">
          <thead>
            <tr>
              <th>NIT</th>
              <th>Razón Social</th>
              <th>Reclutador</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((empresa) => (
              <tr key={empresa.usuario_id}>
                <td>{empresa.nit_id}</td>
                <td><strong>{empresa.razon_social}</strong></td>
                <td>{empresa.nombre_reclutador}</td>
                <td>{empresa.correo}</td>
                <td>{empresa.contacto_telefono || 'N/A'}</td>
                <td>
                  {empresa.verificado ? (
                    <span className="badge badge-success">✅ Aprobada</span>
                  ) : (
                    <span className="badge badge-warning">⏳ Pendiente</span>
                  )}
                </td>
                <td>{new Date(empresa.fecha_creacion).toLocaleDateString('es-CO')}</td>
                <td>
                  <div className="actionButtons">
                    {!empresa.verificado && (
                      <>
                        <button 
                          className="btnSuccess btnSmall"
                          id="AprobarEmpresaAdmin"
                          onClick={() => handleAprobar(empresa.usuario_id, empresa.razon_social)}
                        >
                          ✅ Aprobar
                        </button>
                        <button 
                          className="btnDanger btnSmall"
                          id="RechazarEmpresaAdmin"
                          onClick={() => handleRechazar(empresa.usuario_id, empresa.razon_social)}
                        >
                          ❌ Rechazar
                        </button>
                      </>
                    )}
                    {empresa.verificado && (
                      <button 
                        className="btnSecondary btnSmall"
                        onClick={() => alert('Ver detalles (próximamente)')}
                      >
                        👁️ Ver
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="layoutContent">
      <Header />
      <div className="adminContainer">
        <div className="adminHeader">
          <h1>🏢 Gestión de Empresas</h1>
          <button onClick={() => navigate('/panel/admin')} className="btnSecondary">
            ← Volver al panel
          </button>
        </div>

        {/* Filtros */}
        <div className="filterTabs">
          <button 
            className={filtro === 'pendientes' ? 'active' : ''}
            onClick={() => setFiltro('pendientes')}
          >
            ⏳ Pendientes
          </button>
          <button 
            className={filtro === 'aprobadas' ? 'active' : ''}
            onClick={() => setFiltro('aprobadas')}
          >
            ✅ Aprobadas
          </button>
          <button 
            className={filtro === 'todas' ? 'active' : ''}
            onClick={() => setFiltro('todas')}
          >
            📋 Todas
          </button>
        </div>

        {error && <p className="errorMessage">{error}</p>}

        {/* SOLUCIÓN APLICADA: Reemplazar ternario anidado por función */}
        {renderContenidoPrincipal()}
        
      </div>
    </div>
  );
};

export default GestionEmpresas;