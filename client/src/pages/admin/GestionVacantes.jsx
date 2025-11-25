import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css';

// Componente TabButton externo
const TabButton = ({ activo, onClick, onKeyDown, children }) => (
  <button 
    className={activo ? 'active' : ''}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    {children}
  </button>
);

TabButton.propTypes = {
  activo: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

// Componente Modal de Detalles
const ModalDetalles = ({ 
  vacanteSeleccionada, 
  mostrarModal, 
  setMostrarModal, 
  handleAprobar, 
  handleRechazar,
  formatearSalario,
  handleKeyDown 
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (dialogRef.current) {
      if (mostrarModal) {
        dialogRef.current.showModal();
      } else {
        dialogRef.current.close();
      }
    }
  }, [mostrarModal]);

  if (!vacanteSeleccionada) return null;

  return (
    <dialog 
      ref={dialogRef}
      className="modal"
      onClose={() => setMostrarModal(false)}
    >
      <div 
        className="modalContent"
        aria-labelledby="modal-title-detalles"
        aria-describedby="modal-description-detalles"
      >
        <div className="modalHeader">
          <h2 id="modal-title-detalles">📋 Detalles de la Vacante</h2>
          <button 
            className="closeModal" 
            onClick={() => setMostrarModal(false)}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
        
        <div id="modal-description-detalles" className="modalBody">
          <div className="detailGroup">
            <h3>Información General</h3>
            <p><strong>Título:</strong> {vacanteSeleccionada.titulo}</p>
            <p><strong>Empresa:</strong> {vacanteSeleccionada.razon_social}</p>
            <p><strong>Sector:</strong> {vacanteSeleccionada.sector_icono} {vacanteSeleccionada.sector_nombre || 'No especificado'}</p>
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
                onKeyDown={(e) => handleKeyDown(e, () => {
                  setMostrarModal(false);
                  handleAprobar(vacanteSeleccionada.vacante_id, vacanteSeleccionada.titulo);
                })}
              >
                ✅ Aprobar Vacante
              </button>
              <button 
                className="btnDanger"
                onClick={() => {
                  setMostrarModal(false);
                  handleRechazar(vacanteSeleccionada.vacante_id, vacanteSeleccionada.titulo);
                }}
                onKeyDown={(e) => handleKeyDown(e, () => {
                  setMostrarModal(false);
                  handleRechazar(vacanteSeleccionada.vacante_id, vacanteSeleccionada.titulo);
                })}
              >
                ❌ Rechazar Vacante
              </button>
            </>
          )}
          <button 
            className="btnSecondary"
            onClick={() => setMostrarModal(false)}
            onKeyDown={(e) => handleKeyDown(e, () => setMostrarModal(false))}
          >
            Cerrar
          </button>
        </div>
      </div>
    </dialog>
  );
};

ModalDetalles.propTypes = {
  vacanteSeleccionada: PropTypes.object,
  mostrarModal: PropTypes.bool.isRequired,
  setMostrarModal: PropTypes.func.isRequired,
  handleAprobar: PropTypes.func.isRequired,
  handleRechazar: PropTypes.func.isRequired,
  formatearSalario: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired
};

// Componente Fila de Vacante
const FilaVacante = ({ 
  vacante, 
  verDetalles, 
  handleAprobar, 
  handleRechazar, 
  handleKeyDown,
  formatearSalario 
}) => {
  const getTextoPrograma = () => {
    if (vacante.programa_objetivo) {
      return vacante.programa_objetivo;
    }
    return <span style={{color: '#888'}}>Todos los programas</span>;
  };

  const getTextoModalidad = () => {
    switch (vacante.modalidad) {
      case 'presencial': return '🏢 Presencial';
      case 'remoto': return '💻 Remoto';
      case 'hibrido': return '🔄 Híbrido';
      default: return vacante.modalidad;
    }
  };

  const getTextoEstado = () => {
    if (vacante.aprobada) {
      return <span className="badge badge-success">✅ Aprobada</span>;
    }
    return <span className="badge badge-warning">⏳ Pendiente</span>;
  };

  return (
    <tr key={vacante.vacante_id}>
      <td>{vacante.vacante_id}</td>
      <td>
        <strong>{vacante.titulo}</strong>
        <br />
        <small>{vacante.sector_icono} {vacante.sector_nombre || 'Sin sector'}</small>
      </td>
      <td>{vacante.razon_social}</td>
      <td>{getTextoPrograma()}</td>
      <td>{getTextoModalidad()}</td>
      <td>{formatearSalario(vacante.salario)}</td>
      <td>
        <button 
          className="badge"
          style={{ 
            cursor: 'pointer', 
            border: 'none', 
            background: 'transparent',
            padding: 0,
            font: 'inherit',
            color: 'inherit'
          }}
          onClick={() => {/* Agregar función para ver postulaciones */}}
          onKeyDown={(e) => handleKeyDown(e, () => {/* Agregar función para ver postulaciones */})}
        >
          {vacante.total_postulaciones}
        </button>
      </td>
      <td>{getTextoEstado()}</td>
      <td>{new Date(vacante.creada_en).toLocaleDateString('es-CO')}</td>
      <td>
        <div className="actionButtons">
          <button 
            className="btnSecondary btnSmall"
            onClick={() => verDetalles(vacante)}
            onKeyDown={(e) => handleKeyDown(e, () => verDetalles(vacante))}
          >
            👁️ Ver
          </button>
          {!vacante.aprobada && (
            <>
              <button 
                className="btnSuccess btnSmall"
                onClick={() => handleAprobar(vacante.vacante_id, vacante.titulo)}
                onKeyDown={(e) => handleKeyDown(e, () => handleAprobar(vacante.vacante_id, vacante.titulo))}
              >
                ✅ Aprobar
              </button>
              <button 
                className="btnDanger btnSmall"
                onClick={() => handleRechazar(vacante.vacante_id, vacante.titulo)}
                onKeyDown={(e) => handleKeyDown(e, () => handleRechazar(vacante.vacante_id, vacante.titulo))}
              >
                ❌ Rechazar
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

FilaVacante.propTypes = {
  vacante: PropTypes.object.isRequired,
  verDetalles: PropTypes.func.isRequired,
  handleAprobar: PropTypes.func.isRequired,
  handleRechazar: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  formatearSalario: PropTypes.func.isRequired
};

// Componente Tabla de Vacantes
const TablaVacantes = ({ 
  vacantes, 
  verDetalles, 
  handleAprobar, 
  handleRechazar, 
  handleKeyDown,
  formatearSalario 
}) => {
  if (vacantes.length === 0) {
    return (
      <div className="emptyState">
        <p>📭 No hay vacantes en este momento</p>
      </div>
    );
  }

  return (
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
              <FilaVacante
                key={vacante.vacante_id}
                vacante={vacante}
                verDetalles={verDetalles}
                handleAprobar={handleAprobar}
                handleRechazar={handleRechazar}
                handleKeyDown={handleKeyDown}
                formatearSalario={formatearSalario}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

TablaVacantes.propTypes = {
  vacantes: PropTypes.array.isRequired,
  verDetalles: PropTypes.func.isRequired,
  handleAprobar: PropTypes.func.isRequired,
  handleRechazar: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  formatearSalario: PropTypes.func.isRequired
};

// Componente Principal
const GestionVacantes = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [vacantes, setVacantes] = useState([]);
  const [filtro, setFiltro] = useState('pendientes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Manejador de Escape
  const handleEscapeKey = useCallback((e) => {
    if (e.key === 'Escape' && mostrarModal) {
      setMostrarModal(false);
    }
  }, [mostrarModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

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
    if (!globalThis.confirm(`¿Estás seguro de aprobar la vacante "${titulo}"?\n\nLa vacante será visible para los estudiantes.`)) {
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
        obtenerVacantes();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al aprobar:', err);
      alert('❌ Error de conexión al aprobar vacante');
    }
  };

  const handleRechazar = async (vacanteId, titulo) => {
    const motivo = globalThis.prompt(
      `¿Por qué rechazas la vacante "${titulo}"?\n\n` +
      `Ejemplo: "No cumple con requisitos institucionales", "Salario muy bajo", etc.\n\n` +
      `(Este mensaje se enviará a la empresa)`
    );
    
    if (motivo === null) return;

    if (!motivo.trim()) {
      alert('⚠️ Debes proporcionar un motivo para el rechazo');
      return;
    }

    if (!globalThis.confirm(`¿Estás seguro de rechazar y eliminar la vacante "${titulo}"?`)) {
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
        obtenerVacantes();
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

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const renderContenido = () => {
    if (loading) {
      return <p>Cargando vacantes...</p>;
    }

    return (
      <TablaVacantes
        vacantes={vacantes}
        verDetalles={verDetalles}
        handleAprobar={handleAprobar}
        handleRechazar={handleRechazar}
        handleKeyDown={handleKeyDown}
        formatearSalario={formatearSalario}
      />
    );
  };

  return (
    <div className="layoutContent">
      <Header />
      <div className="adminContainer">
        <div className="adminHeader">
          <h1>💼 Gestión de Vacantes</h1>
          <button 
            onClick={() => navigate('/panel/admin')} 
            className="btnSecondary"
            onKeyDown={(e) => handleKeyDown(e, () => navigate('/panel/admin'))}
          >
            ← Volver al panel
          </button>
        </div>

        <div className="filterTabs" role="tablist" aria-label="Filtros de vacantes">
          <TabButton
            activo={filtro === 'pendientes'}
            onClick={() => setFiltro('pendientes')}
            onKeyDown={(e) => handleKeyDown(e, () => setFiltro('pendientes'))}
          >
            ⏳ Pendientes de Aprobación
          </TabButton>
          <TabButton
            activo={filtro === 'aprobadas'}
            onClick={() => setFiltro('aprobadas')}
            onKeyDown={(e) => handleKeyDown(e, () => setFiltro('aprobadas'))}
          >
            ✅ Aprobadas
          </TabButton>
          <TabButton
            activo={filtro === 'todas'}
            onClick={() => setFiltro('todas')}
            onKeyDown={(e) => handleKeyDown(e, () => setFiltro('todas'))}
          >
            📋 Todas
          </TabButton>
        </div>

        {error && <p className="errorMessage">{error}</p>}

        {renderContenido()}
      </div>

      <ModalDetalles
        vacanteSeleccionada={vacanteSeleccionada}
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        handleAprobar={handleAprobar}
        handleRechazar={handleRechazar}
        formatearSalario={formatearSalario}
        handleKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default GestionVacantes;