import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css';

const VerPostulaciones = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [postulaciones, setPostulaciones] = useState([]);
  const [vacantes, setVacantes] = useState([]);
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [postulacionDetalle, setPostulacionDetalle] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (usuario && usuario.rol !== 'empresa') {
      navigate('/');
      return;
    }
    obtenerVacantes();
  }, [usuario, navigate]);

  useEffect(() => {
    if (vacanteSeleccionada) {
      obtenerPostulaciones(vacanteSeleccionada);
    }
  }, [vacanteSeleccionada, filtro]);

  const obtenerVacantes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/vacantes/mis-vacantes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (data.success) {
        const vacantesAprobadas = data.data.vacantes.filter(v => v.aprobada);
        setVacantes(vacantesAprobadas);
        
        // Si viene de una vacante específica (desde MisVacantes)
        const vacanteId = location.state?.vacanteId;
        if (vacanteId) {
          setVacanteSeleccionada(vacanteId);
        } else if (vacantesAprobadas.length > 0) {
          setVacanteSeleccionada(vacantesAprobadas[0].vacante_id);
        }
      }
    } catch (error) {
      console.error('Error al obtener vacantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerPostulaciones = async (vacanteId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `http://localhost:5000/api/vacantes/${vacanteId}/postulaciones`;
      if (filtro !== 'todas') {
        url += `?estado=${filtro}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (data.success) {
        setPostulaciones(data.data.postulaciones || []);
      }
    } catch (error) {
      console.error('Error al obtener postulaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const responderPostulacion = async (postulacionId, estado, notas = '') => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:5000/api/vacantes/postulaciones/${postulacionId}/responder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          estado,
          notas_empresa: notas
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        obtenerPostulaciones(vacanteSeleccionada);
        setMostrarModal(false);
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Error al responder:', error);
      alert('❌ Error de conexión');
    }
  };

  const abrirDetalle = (postulacion) => {
    setPostulacionDetalle(postulacion);
    setMostrarModal(true);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': { class: 'badge badge-warning', text: '⏳ Pendiente' },
      'aceptado': { class: 'badge badge-success', text: '✅ Aceptado' },
      'rechazado': { class: 'badge badge-danger', text: '❌ Rechazado' }
    };
    return badges[estado] || badges['pendiente'];
  };

  const vacantesConPostulaciones = vacantes.filter(v => 
    Number.parseInt(v.total_postulaciones) > 0
  );

  if (loading && vacantes.length === 0) {
    return (
      <div className="layoutContent">
        <Header />
        <div className="adminContainer">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layoutContent">
      <Header />
      <div className="adminContainer">
        <div className="adminHeader">
          <h1>👥 Postulaciones Recibidas</h1>
          <button onClick={() => navigate('/panel/empresa')} className="btnSecondary">
            ← Volver al panel
          </button>
        </div>

        {vacantesConPostulaciones.length === 0 ? (
          <div className="emptyState">
            <p>📭 Aún no has recibido postulaciones</p>
            <p>Las postulaciones aparecerán aquí cuando los estudiantes se postulen a tus vacantes.</p>
          </div>
        ) : (
          <>
            {/* Selector de Vacante */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                📋 Selecciona una vacante:
              </label>
              <select
                value={vacanteSeleccionada || ''}
                onChange={(e) => setVacanteSeleccionada(Number.parseInt(e.target.value))}
                className="authInput"
                style={{ maxWidth: '500px' }}
              >
                {vacantesConPostulaciones.map(v => (
                  <option key={v.vacante_id} value={v.vacante_id}>
                    {v.titulo} ({v.total_postulaciones} postulaciones)
                  </option>
                ))}
              </select>
            </div>

            {/* Filtros */}
            <div className="filterTabs">
              <button
                className={filtro === 'todas' ? 'active' : ''}
                onClick={() => setFiltro('todas')}
              >
                📋 Todas
              </button>
              <button
                className={filtro === 'pendiente' ? 'active' : ''}
                onClick={() => setFiltro('pendiente')}
              >
                ⏳ Pendientes
              </button>
              <button
                className={filtro === 'aceptado' ? 'active' : ''}
                onClick={() => setFiltro('aceptado')}
              >
                ✅ Aceptadas
              </button>
              <button
                className={filtro === 'rechazado' ? 'active' : ''}
                onClick={() => setFiltro('rechazado')}
              >
                ❌ Rechazadas
              </button>
            </div>

            {/* Tabla de Postulaciones */}
            {loading ? (
              <p>Cargando postulaciones...</p>
            ) : postulaciones.length === 0 ? (
              <div className="emptyState">
                <p>No hay postulaciones con el filtro seleccionado</p>
              </div>
            ) : (
              <div className="tableContainer">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Programa</th>
                      <th>Contacto</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postulaciones.map(p => {
                      const badge = getEstadoBadge(p.estado);
                      return (
                        <tr key={p.aplicacion_id}>
                          <td>
                            <strong>{p.estudiante_nombre} {p.estudiante_apellido}</strong>
                            <br />
                            <small>CC: {p.cedula_id}</small>
                          </td>
                          <td>
                            {p.programa_nombre || p.programa_texto_legacy}
                            {p.programa_facultad && (
                              <>
                                <br />
                                <small>{p.programa_facultad}</small>
                              </>
                            )}
                          </td>
                          <td>
                            <small>{p.estudiante_correo}</small>
                            {p.estudiante_celular && (
                              <>
                                <br />
                                <small>📱 {p.estudiante_celular}</small>
                              </>
                            )}
                          </td>
                          <td>
                            <small>{formatearFecha(p.fecha_aplicacion)}</small>
                          </td>
                          <td>
                            <span className={badge.class}>{badge.text}</span>
                          </td>
                          <td>
                            <div className="actionButtons">
                              <button
                                className="btnSecondary btnSmall"
                                onClick={() => abrirDetalle(p)}
                              >
                                👁️ Ver
                              </button>
                              {p.estado === 'pendiente' && (
                                <>
                                  <button
                                    className="btnSuccess btnSmall"
                                    onClick={() => {
                                      if (window.confirm('¿Aceptar esta postulación?')) {
                                        responderPostulacion(p.aplicacion_id, 'aceptado');
                                      }
                                    }}
                                  >
                                    ✅ Aceptar
                                  </button>
                                  <button
                                    className="btnDanger btnSmall"
                                    onClick={() => {
                                      if (window.confirm('¿Rechazar esta postulación?')) {
                                        responderPostulacion(p.aplicacion_id, 'rechazado');
                                      }
                                    }}
                                  >
                                    ❌ Rechazar
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalle */}
      {mostrarModal && postulacionDetalle && (
        <div className="modal" onClick={() => setMostrarModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>👤 Detalle de Postulación</h2>
              <button className="closeModal" onClick={() => setMostrarModal(false)}>✕</button>
            </div>
            
            <div className="modalBody">
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <strong>Estudiante:</strong>
                  <p>{postulacionDetalle.estudiante_nombre} {postulacionDetalle.estudiante_apellido}</p>
                </div>

                <div>
                  <strong>Documento:</strong>
                  <p>CC {postulacionDetalle.cedula_id}</p>
                </div>

                <div>
                  <strong>Programa:</strong>
                  <p>{postulacionDetalle.programa_nombre || postulacionDetalle.programa_texto_legacy}</p>
                  {postulacionDetalle.programa_facultad && (
                    <small style={{ color: '#666' }}>
                      Facultad: {postulacionDetalle.programa_facultad}
                    </small>
                  )}
                </div>

                <div>
                  <strong>Contacto:</strong>
                  <p>
                    📧 {postulacionDetalle.estudiante_correo}
                    {postulacionDetalle.estudiante_celular && (
                      <>
                        <br />
                        📱 {postulacionDetalle.estudiante_celular}
                      </>
                    )}
                  </p>
                </div>

                <div>
                  <strong>Fecha de postulación:</strong>
                  <p>{formatearFecha(postulacionDetalle.fecha_aplicacion)}</p>
                </div>

                <div>
                  <strong>Estado:</strong>
                  <p>
                    <span className={getEstadoBadge(postulacionDetalle.estado).class}>
                      {getEstadoBadge(postulacionDetalle.estado).text}
                    </span>
                  </p>
                </div>

                {postulacionDetalle.mensaje_postulacion && (
                  <div>
                    <strong>Mensaje del estudiante:</strong>
                    <p style={{
                      background: '#f8f9fa',
                      padding: '15px',
                      borderRadius: '8px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {postulacionDetalle.mensaje_postulacion}
                    </p>
                  </div>
                )}

                {postulacionDetalle.creditos_aprobados && (
                  <div>
                    <strong>Créditos aprobados:</strong>
                    <p>{postulacionDetalle.creditos_aprobados}</p>
                  </div>
                )}

                {postulacionDetalle.notas_empresa && (
                  <div>
                    <strong>Notas internas:</strong>
                    <p style={{
                      background: '#fff3cd',
                      padding: '15px',
                      borderRadius: '8px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {postulacionDetalle.notas_empresa}
                    </p>
                  </div>
                )}

                {postulacionDetalle.hoja_vida_id === null && (
                  <div style={{
                    background: '#e8f5e9',
                    padding: '15px',
                    borderRadius: '8px'
                  }}>
                    <p style={{ margin: 0 }}>
                      ℹ️ Este estudiante aún no ha adjuntado hoja de vida
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="modalFooter">
              {postulacionDetalle.estado === 'pendiente' && (
                <>
                  <button
                    className="btnSuccess"
                    onClick={() => {
                      const notas = prompt('Notas internas (opcional):');
                      responderPostulacion(postulacionDetalle.aplicacion_id, 'aceptado', notas || '');
                    }}
                  >
                    ✅ Aceptar Postulación
                  </button>
                  <button
                    className="btnDanger"
                    onClick={() => {
                      const notas = prompt('Motivo del rechazo (opcional):');
                      responderPostulacion(postulacionDetalle.aplicacion_id, 'rechazado', notas || '');
                    }}
                  >
                    ❌ Rechazar Postulación
                  </button>
                </>
              )}
              <button className="btnSecondary" onClick={() => setMostrarModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerPostulaciones;