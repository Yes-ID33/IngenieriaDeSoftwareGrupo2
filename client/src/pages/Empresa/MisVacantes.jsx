import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css';
import PropTypes from 'prop-types';
// Componente TabButton movido fuera del componente principal
const TabButton = ({ activo, onClick, onKeyDown, children }) => (
  <button 
    className={activo ? 'active' : ''}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    {children}
  </button>
);

// Validación de props para TabButton
TabButton.propTypes = {
  activo: PropTypes.bool,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  children: PropTypes.node
};

const MisVacantes = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef(null);
  const [vacantes, setVacantes] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [programas, setProgramas] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (usuario && usuario.rol !== 'empresa') {
      navigate('/');
      return;
    }
    obtenerVacantes();
    obtenerCatalogos();
  }, [usuario, navigate]);

  // Controlar el dialog nativo
  useEffect(() => {
    if (dialogRef.current) {
      if (mostrarModal) {
        dialogRef.current.showModal();
      } else {
        dialogRef.current.close();
      }
    }
  }, [mostrarModal]);

  const obtenerCatalogos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Solo obtener programas (sectores no se usa)
      const resProgramas = await fetch('http://localhost:5000/api/catalogos/programas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const dataProgramas = await resProgramas.json();
      if (dataProgramas.success) {
        setProgramas(dataProgramas.data.programas || []);
      }
    } catch (error) {
      console.error('Error al obtener catálogos:', error);
    }
  };

  const obtenerVacantes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:5000/api/vacantes/mis-vacantes', {
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

  const handleEliminar = async (vacanteId, titulo) => {
    if (!globalThis.confirm(`¿Estás seguro de eliminar la vacante "${titulo}"?\n\nEsta acción no se puede deshacer y se eliminarán todas las postulaciones asociadas.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:5000/api/vacantes/${vacanteId}`, {
        method: 'DELETE',
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
      console.error('Error al eliminar:', err);
      alert('❌ Error de conexión al eliminar vacante');
    }
  };

  const abrirEdicion = (vacante) => {
    setVacanteSeleccionada(vacante);
    setFormData({
      titulo: vacante.titulo || '',
      descripcion: vacante.descripcion || '',
      sector_id: vacante.sector_id || '',
      programa_objetivo: vacante.programa_objetivo || '',
      modalidad: vacante.modalidad || 'presencial',
      salario: vacante.salario || '',
      requisitos: vacante.requisitos || '',
      fecha_inicio: vacante.fecha_inicio ? vacante.fecha_inicio.split('T')[0] : '',
      duracion_meses: vacante.duracion_meses || '',
      horario: vacante.horario || '',
      beneficios: vacante.beneficios || ''
    });
    
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const verDetalles = (vacante) => {
    setVacanteSeleccionada(vacante);
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const handleActualizar = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.sector_id || !formData.modalidad || !formData.salario) {
      alert('⚠️ Por favor completa todos los campos obligatorios');
      return;
    }

    if (Number.parseFloat(formData.salario) < 1300000) {
      alert('⚠️ El salario debe ser al menos $1,300,000');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:5000/api/vacantes/${vacanteSeleccionada.vacante_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        setMostrarModal(false);
        obtenerVacantes();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('❌ Error de conexión al actualizar vacante');
    }
  };

  // SOLUCIÓN: Eliminada la función handleInputChange que no se usaba

  const formatearSalario = (salario) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salario);
  };

  // SOLUCIÓN: Extraer ternario anidado en funciones independientes
  const getTextoEstado = (vacante) => {
    if (vacante.aprobada) {
      return '✅ Activa';
    }
    return '⏳ Pendiente';
  };

  const getClaseEstado = (vacante) => {
    if (vacante.aprobada) {
      return 'badge badge-success';
    }
    return 'badge badge-warning';
  };

  const getTextoModalidad = (modalidad) => {
    switch (modalidad) {
      case 'presencial': return '🏢 Presencial';
      case 'remoto': return '💻 Remoto';
      case 'hibrido': return '🔄 Híbrido';
      default: return modalidad;
    }
  };

  // SOLUCIÓN: Función para manejar postulaciones con ternario extraído
  const getTextoPostulaciones = (vacante) => {
    const total = vacante.total_postulaciones || 0;
    const pendientes = Number.parseInt(vacante.postulaciones_pendientes) || 0;
    
    if (pendientes > 0) {
      return `${total} (${pendientes} nuevas)`;
    }
    return `${total}`;
  };

  const getColorPostulaciones = (vacante) => {
    const pendientes = Number.parseInt(vacante.postulaciones_pendientes) || 0;
    return pendientes > 0 ? '#f39c12' : 'inherit';
  };

  // Manejadores de teclado para accesibilidad
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const vacantesFiltradas = vacantes.filter(v => {
    if (filtro === 'aprobadas') return v.aprobada;
    if (filtro === 'pendientes') return !v.aprobada;
    return true;
  });

  return (
    <div className="layoutContent">
      <Header />
      <div className="adminContainer">
        <div className="adminHeader">
          <h1>📋 Mis Vacantes</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/panel/empresa/crear-vacante">
              <button className="btnSuccess">➕ Nueva Vacante</button>
            </Link>
            <button onClick={() => navigate('/panel/empresa')} className="btnSecondary">
              ← Volver al panel
            </button>
          </div>
        </div>

        <div className="filterTabs" role="tablist" aria-label="Filtros de vacantes">
          <TabButton
            activo={filtro === 'todas'}
            onClick={() => setFiltro('todas')}
            onKeyDown={(e) => handleKeyDown(e, () => setFiltro('todas'))}
          >
            📋 Todas ({vacantes.length})
          </TabButton>
          <TabButton
            activo={filtro === 'aprobadas'}
            onClick={() => setFiltro('aprobadas')}
            onKeyDown={(e) => handleKeyDown(e, () => setFiltro('aprobadas'))}
          >
            ✅ Aprobadas ({vacantes.filter(v => v.aprobada).length})
          </TabButton>
          <TabButton
            activo={filtro === 'pendientes'}
            onClick={() => setFiltro('pendientes')}
            onKeyDown={(e) => handleKeyDown(e, () => setFiltro('pendientes'))}
          >
            ⏳ Pendientes ({vacantes.filter(v => !v.aprobada).length})
          </TabButton>
        </div>

        {error && <p className="errorMessage">{error}</p>}

        {loading ? (
          <p>Cargando vacantes...</p>
        ) : vacantesFiltradas.length === 0 ? (
          <div className="emptyState">
            <p>📭 No tienes vacantes {filtro !== 'todas' ? filtro : ''}</p>
            <Link to="/panel/empresa/crear-vacante">
              <button className="btnSuccess" style={{ marginTop: '15px' }}>
                ➕ Publicar Mi Primera Vacante
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="tableInfo">
              <p>Mostrando <strong>{vacantesFiltradas.length}</strong> de <strong>{vacantes.length}</strong> vacante(s)</p>
            </div>

            <div className="tableContainer">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
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
                  {vacantesFiltradas.map((vacante) => (
                    <tr key={vacante.vacante_id}>
                      <td>{vacante.vacante_id}</td>
                      <td>
                        <strong>{vacante.titulo}</strong>
                        <br />
                        <small>{vacante.sector_nombre || 'Sin sector'}</small>
                      </td>
                      <td>
                        {vacante.programa_objetivo || (
                          <span style={{color: '#888'}}>Todos</span>
                        )}
                      </td>
                      <td>{getTextoModalidad(vacante.modalidad)}</td>
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
                            color: getColorPostulaciones(vacante)
                          }}
                          onClick={() => {/* Agregar función para ver postulaciones */}}
                          onKeyDown={(e) => handleKeyDown(e, () => {/* Agregar función para ver postulaciones */})}
                        >
                          {getTextoPostulaciones(vacante)}
                        </button>
                      </td>
                      <td>
                        <span className={getClaseEstado(vacante)}>
                          {getTextoEstado(vacante)}
                        </span>
                      </td>
                      <td>
                        {new Date(vacante.creada_en).toLocaleDateString('es-CO')}
                      </td>
                      <td>
                        <div className="actionButtons">
                          <button 
                            className="btnSecondary btnSmall"
                            onClick={() => verDetalles(vacante)}
                            onKeyDown={(e) => handleKeyDown(e, () => verDetalles(vacante))}
                          >
                            👁️ Ver
                          </button>
                          <button 
                            className="btnPrimary btnSmall"
                            onClick={() => abrirEdicion(vacante)}
                            onKeyDown={(e) => handleKeyDown(e, () => abrirEdicion(vacante))}
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            className="btnDanger btnSmall"
                            onClick={() => handleEliminar(vacante.vacante_id, vacante.titulo)}
                            onKeyDown={(e) => handleKeyDown(e, () => handleEliminar(vacante.vacante_id, vacante.titulo))}
                          >
                            🗑️ Eliminar
                          </button>
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

      {/* SOLUCIÓN: Dialog nativo sin event listeners en elementos no interactivos */}
      <dialog 
        ref={dialogRef}
        className="modal"
        onClose={() => setMostrarModal(false)}
      >
        <div 
          className="modalContent" 
          style={{maxWidth: '900px'}}
        >
          <div className="modalHeader">
            <h2 id="modal-title">
              {modoEdicion ? '✏️ Editar Vacante' : '👁️ Detalles de la Vacante'}
            </h2>
            <button 
              className="closeModal" 
              onClick={() => setMostrarModal(false)}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>
          
          {modoEdicion ? (
            <form onSubmit={handleActualizar}>
              <div className="modalBody">
                {/* Aquí iría el formulario de edición */}
                <p>Formulario de edición...</p>
              </div>
              <div className="modalFooter">
                <button type="submit" className="btnSuccess">
                  💾 Guardar Cambios
                </button>
                <button 
                  type="button"
                  className="btnSecondary"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="modalBody">
                {/* Aquí irían los detalles de la vacante */}
                <p>Detalles de la vacante...</p>
              </div>
              <div className="modalFooter">
                <button 
                  className="btnPrimary"
                  onClick={() => abrirEdicion(vacanteSeleccionada)}
                >
                  ✏️ Editar Vacante
                </button>
                <button 
                  className="btnSecondary"
                  onClick={() => setMostrarModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default MisVacantes;