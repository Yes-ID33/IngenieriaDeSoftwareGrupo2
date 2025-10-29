import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css';

const GestionVacantes = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [vacantes, setVacantes] = useState([]);
  const [filtro, setFiltro] = useState('pendientes'); // 'pendientes', 'aprobadas', 'todas'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (usuario && usuario.rol !== 'administrador') {
      navigate('/');
      return;
    }
    obtenerVacantes();
  }, [usuario, navigate, filtro]);

  const obtenerVacantes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Construir query params según filtro
      let url = 'http://localhost:5000/api/admin/vacantes';
      if (filtro === 'pendientes') {
        url += '?aprobada=false';
      } else if (filtro === 'aprobadas') {
        url += '?aprobada=true';
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        setVacantes(data.data.vacantes || []);
        setError('');
      } else {
        setError(data.message || 'Error al obtener vacantes');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (vacanteId, titulo) => {
    if (!window.confirm(`¿Estás seguro de aprobar la vacante "${titulo}"?\n\nLa vacante será visible para los estudiantes.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:5000/api/admin/vacantes/aprobar/${vacanteId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        obtenerVacantes(); // Recargar lista
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al aprobar:', err);
      alert('❌ Error de conexión al aprobar vacante');
    }
  };

  const handleRechazar = async (vacanteId, titulo) => {
    const motivo = window.prompt(
      `¿Por qué rechazas la vacante "${titulo}"?\n\n` +
      `Ejemplo: "No cumple con requisitos institucionales", "Salario muy bajo", etc.\n\n` +
      `(Este mensaje se enviará a la empresa)`
    );
    
    if (motivo === null) return; // Usuario canceló

    if (!motivo.trim()) {
      alert('⚠️ Debes proporcionar un motivo para el rechazo');
      return;
    }

    if (!window.confirm(`¿Estás seguro de rechazar y eliminar la vacante "${titulo}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:5000/api/admin/vacantes/rechazar/${vacanteId}`, {
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
        obtenerVacantes(); // Recargar lista
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al rechazar:', err);
      alert('❌ Error de conexión al rechazar vacante');
    }
  };

  const verDetalles = (vacante) => {
    setVacanteSeleccionada(vacante);
    setMostrarModal(true);
  };

  const formatearSalario = (salario) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salario);
  };

  return (
    <div className="layoutContent">
      <Header />
      <div className="adminContainer">
        <div className="adminHeader">
          <h1>💼 Gestión de Vacantes</h1>
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
            ⏳ Pendientes de Aprobación
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

        {loading ? (
          <p>Cargando vacantes...</p>
        ) : vacantes.length === 0 ? (
          <div className="emptyState">
            <p>📭 No hay vacantes {filtro !== 'todas' ? filtro : ''} en este momento</p>
          </div>
        ) : (
          <>
            <div className="tableInfo">
              <p>Mostrando <strong>{vacantes.length}</strong> vacante(s)</p>
            </div>

            <div className="tableContainer">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Empresa</th>
                    <th>Programa</th>
                    <th>Modalidad</th>
                    <th>Salario</th>
                    <th>Postulaciones</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vacantes.map((vacante) => (
                    <tr key={vacante.vacante_id}>
                      <td>{vacante.vacante_id}</td>
                      <td>
                        <strong>{vacante.titulo}</strong>
                        <br />
                        <small>{vacante.sector}</small>
                      </td>
                      <td>{vacante.razon_social}</td>
                      <td>
                        {vacante.programa_objetivo || (
                          <span style={{color: '#888'}}>Todos los programas</span>
                        )}
                      </td>
                      <td>
                        {vacante.modalidad === 'presencial' && '🏢 Presencial'}
                        {vacante.modalidad === 'remoto' && '💻 Remoto'}
                        {vacante.modalidad === 'hibrido' && '🔄 Híbrido'}
                      </td>
                      <td>{formatearSalario(vacante.salario)}</td>
                      <td>
                        <span className="badge">{vacante.total_postulaciones}</span>
                      </td>
                      <td>
                        {vacante.aprobada ? (
                          <span className="badge badge-success">✅ Aprobada</span>
                        ) : (
                          <span className="badge badge-warning">⏳ Pendiente</span>
                        )}
                      </td>
                      <td>
                        {new Date(vacante.creada_en).toLocaleDateString('es-CO')}
                      </td>
                      <td>
                        <div className="actionButtons">
                          <button 
                            className="btnSecondary btnSmall"
                            onClick={() => verDetalles(vacante)}
                          >
                            👁️ Ver
                          </button>
                          {!vacante.aprobada && (
                            <>
                              <button 
                                className="btnSuccess btnSmall"
                                onClick={() => handleAprobar(vacante.vacante_id, vacante.titulo)}
                              >
                                ✅ Aprobar
                              </button>
                              <button 
                                className="btnDanger btnSmall"
                                onClick={() => handleRechazar(vacante.vacante_id, vacante.titulo)}
                              >
                                ❌ Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalles */}
      {mostrarModal && vacanteSeleccionada && (
        <div className="modal" onClick={() => setMostrarModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>📋 Detalles de la Vacante</h2>
              <button className="closeModal" onClick={() => setMostrarModal(false)}>✕</button>
            </div>
            
            <div className="modalBody">
              <div className="detailGroup">
                <h3>Información General</h3>
                <p><strong>Título:</strong> {vacanteSeleccionada.titulo}</p>
                <p><strong>Empresa:</strong> {vacanteSeleccionada.razon_social}</p>
                <p><strong>Sector:</strong> {vacanteSeleccionada.sector}</p>
                <p><strong>Programa Objetivo:</strong> {vacanteSeleccionada.programa_objetivo || 'Todos los programas'}</p>
              </div>

              <div className="detailGroup">
                <h3>Condiciones</h3>
                <p><strong>Modalidad:</strong> {vacanteSeleccionada.modalidad}</p>
                <p><strong>Salario:</strong> {formatearSalario(vacanteSeleccionada.salario)}</p>
                <p><strong>Duración:</strong> {vacanteSeleccionada.duracion_meses ? `${vacanteSeleccionada.duracion_meses} meses` : 'No especificada'}</p>
                <p><strong>Horario:</strong> {vacanteSeleccionada.horario || 'No especificado'}</p>
                {vacanteSeleccionada.fecha_inicio && (
                  <p><strong>Fecha de Inicio:</strong> {new Date(vacanteSeleccionada.fecha_inicio).toLocaleDateString('es-CO')}</p>
                )}
              </div>

              {vacanteSeleccionada.descripcion && (
                <div className="detailGroup">
                  <h3>Descripción</h3>
                  <p>{vacanteSeleccionada.descripcion}</p>
                </div>
              )}

              {vacanteSeleccionada.requisitos && (
                <div className="detailGroup">
                  <h3>Requisitos</h3>
                  <p>{vacanteSeleccionada.requisitos}</p>
                </div>
              )}

              {vacanteSeleccionada.beneficios && (
                <div className="detailGroup">
                  <h3>Beneficios</h3>
                  <p>{vacanteSeleccionada.beneficios}</p>
                </div>
              )}

              <div className="detailGroup">
                <h3>Contacto de la Empresa</h3>
                <p><strong>Reclutador:</strong> {vacanteSeleccionada.nombre_reclutador}</p>
                <p><strong>Correo:</strong> {vacanteSeleccionada.contacto_correo}</p>
                <p><strong>Teléfono:</strong> {vacanteSeleccionada.contacto_telefono || 'No especificado'}</p>
              </div>

              <div className="detailGroup">
                <h3>Estadísticas</h3>
                <p><strong>Total de Postulaciones:</strong> {vacanteSeleccionada.total_postulaciones}</p>
                <p><strong>Estado:</strong> {vacanteSeleccionada.aprobada ? '✅ Aprobada' : '⏳ Pendiente de aprobación'}</p>
                <p><strong>Fecha de Creación:</strong> {new Date(vacanteSeleccionada.creada_en).toLocaleString('es-CO')}</p>
              </div>
            </div>

            <div className="modalFooter">
              {!vacanteSeleccionada.aprobada && (
                <>
                  <button 
                    className="btnSuccess"
                    onClick={() => {
                      setMostrarModal(false);
                      handleAprobar(vacanteSeleccionada.vacante_id, vacanteSeleccionada.titulo);
                    }}
                  >
                    ✅ Aprobar Vacante
                  </button>
                  <button 
                    className="btnDanger"
                    onClick={() => {
                      setMostrarModal(false);
                      handleRechazar(vacanteSeleccionada.vacante_id, vacanteSeleccionada.titulo);
                    }}
                  >
                    ❌ Rechazar Vacante
                  </button>
                </>
              )}
              <button 
                className="btnSecondary"
                onClick={() => setMostrarModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionVacantes;