import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css';

// Componente TabButton
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
  activo: PropTypes.bool,
  onClick: PropTypes.func,
  onKeyDown: PropTypes.func,
  children: PropTypes.node
};

// Componente FilaVacante para separar la lógica de cada fila
const FilaVacante = ({ 
  vacante, 
  onVerDetalles, 
  onEditar, 
  onEliminar, 
  onKeyDown 
}) => {
  const getTextoEstado = (vacante) => {
    return vacante.aprobada ? '✅ Activa' : '⏳ Pendiente';
  };

  const getClaseEstado = (vacante) => {
    return vacante.aprobada ? 'badge badge-success' : 'badge badge-warning';
  };

  const getTextoModalidad = (modalidad) => {
    const modalidades = {
      'presencial': '🏢 Presencial',
      'remoto': '💻 Remoto',
      'hibrido': '🔄 Híbrido'
    };
    return modalidades[modalidad] || modalidad;
  };

  const getTextoPostulaciones = (vacante) => {
    const total = vacante.total_postulaciones || 0;
    const pendientes = Number.parseInt(vacante.postulaciones_pendientes) || 0;
    return pendientes > 0 ? `${total} (${pendientes} nuevas)` : `${total}`;
  };

  const getColorPostulaciones = (vacante) => {
    const pendientes = Number.parseInt(vacante.postulaciones_pendientes) || 0;
    return pendientes > 0 ? '#f39c12' : 'inherit';
  };

  const getTextoPrograma = (vacante) => {
    return vacante.programa_objetivo || <span style={{color: '#888'}}>Todos</span>;
  };

  const formatearSalario = (salario) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salario);
  };

  return (
    <tr key={vacante.vacante_id}>
      <td>{vacante.vacante_id}</td>
      <td>
        <strong>{vacante.titulo}</strong>
        <br />
        <small>{vacante.sector_nombre || 'Sin sector'}</small>
      </td>
      <td>{getTextoPrograma(vacante)}</td>
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
          onKeyDown={(e) => onKeyDown(e, () => {/* Agregar función para ver postulaciones */})}
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
            onClick={() => onVerDetalles(vacante)}
            onKeyDown={(e) => onKeyDown(e, () => onVerDetalles(vacante))}
          >
            👁️ Ver
          </button>
          <button 
            className="btnPrimary btnSmall"
            onClick={() => onEditar(vacante)}
            onKeyDown={(e) => onKeyDown(e, () => onEditar(vacante))}
          >
            ✏️ Editar
          </button>
          <button 
            className="btnDanger btnSmall"
            onClick={() => onEliminar(vacante.vacante_id, vacante.titulo)}
            onKeyDown={(e) => onKeyDown(e, () => onEliminar(vacante.vacante_id, vacante.titulo))}
          >
            🗑️ Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
};

FilaVacante.propTypes = {
  vacante: PropTypes.object.isRequired,
  onVerDetalles: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired
};

// Componente TablaVacantes
const TablaVacantes = ({ 
  vacantes, 
  onVerDetalles, 
  onEditar, 
  onEliminar, 
  onKeyDown 
}) => {
  if (vacantes.length === 0) {
    return null;
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
                onVerDetalles={onVerDetalles}
                onEditar={onEditar}
                onEliminar={onEliminar}
                onKeyDown={onKeyDown}
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
  onVerDetalles: PropTypes.func.isRequired,
  onEditar: PropTypes.func.isRequired,
  onEliminar: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired
};

// Componente EstadoVacio
const EstadoVacio = ({ filtro, totalVacantes }) => {
  const getMensajeEstadoVacio = () => {
    if (filtro !== 'todas') {
      return filtro;
    }
    return '';
  };

  return (
    <div className="emptyState">
      <p>📭 No tienes vacantes {getMensajeEstadoVacio()} (total: {totalVacantes})</p>
      <Link to="/panel/empresa/crear-vacante">
        <button className="btnSuccess" style={{ marginTop: '15px' }}>
          ➕ Publicar Mi Primera Vacante
        </button>
      </Link>
    </div>
  );
};

EstadoVacio.propTypes = {
  filtro: PropTypes.string.isRequired,
  totalVacantes: PropTypes.number.isRequired
};

// Componente principal refactorizado
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
  const [formData, setFormData] = useState({});

  // Efectos y funciones de la lógica principal...
  useEffect(() => {
    if (usuario && usuario.rol !== 'empresa') {
      navigate('/');
      return;
    }
    obtenerVacantes();
  }, [usuario, navigate]);

  useEffect(() => {
    if (dialogRef.current) {
      // ✅ SOLO abrir si HAY vacante seleccionada Y mostrarModal es true
      if (mostrarModal && vacanteSeleccionada) {
        dialogRef.current.showModal();
      } else {
        // Cerrar el modal si no hay vacante o mostrarModal es false
        dialogRef.current.close();

        // ✅ PROTECCIÓN: Si intentó abrir sin vacante, resetear estado
        if (mostrarModal && !vacanteSeleccionada) {
          console.warn('⚠️ Intentando abrir modal sin vacante seleccionada. Cancelando...');
          setMostrarModal(false);
        }
      }
    }
  }, [mostrarModal, vacanteSeleccionada]); // ⚠️ Agregar vacanteSeleccionada como dependencia

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
    console.log('✏️ Abriendo edición de:', vacante?.titulo);
  
    if (!vacante) {
      console.error('❌ No se proporcionó vacante a abrirEdicion');
      alert('⚠️ Error: No se pudo cargar la vacante');
      return;
    }

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
    console.log('👁️ Abriendo detalles de:', vacante?.titulo);
  
    if (!vacante) {
      console.error('❌ No se proporcionó vacante a verDetalles');
      alert('⚠️ Error: No se pudo cargar la vacante');
      return;
    }

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

  // Renderizado simplificado
  const renderContenido = () => {
    if (loading) {
      return <p>Cargando vacantes...</p>;
    }

    if (vacantesFiltradas.length === 0) {
      return <EstadoVacio filtro={filtro} totalVacantes={vacantes.length} />;
    }

    return (
      <TablaVacantes
        vacantes={vacantesFiltradas}
        onVerDetalles={verDetalles}
        onEditar={abrirEdicion}
        onEliminar={handleEliminar}
        onKeyDown={handleKeyDown}
      />
    );
  };

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

        {renderContenido()}

      </div>

      <dialog 
        ref={dialogRef}
  className="modal"
  onClose={() => {
    setMostrarModal(false);
    setVacanteSeleccionada(null);
    setModoEdicion(false);
  }}
  aria-labelledby="modal-title"
>
  {/* PROTECCIÓN: Si no hay vacante seleccionada, mostrar estado de carga */}
  {!vacanteSeleccionada ? (
    <div className="modalContent" style={{maxWidth: '900px'}}>
      <div className="modalHeader">
        <h2>⚠️ Error</h2>
        <button 
          className="closeModal" 
          onClick={() => {
            setMostrarModal(false);
            setVacanteSeleccionada(null);
            setModoEdicion(false);
          }}
          aria-label="Cerrar modal"
        >
          ✕
        </button>
      </div>
      <div className="modalBody">
        <p>No se pudo cargar la información de la vacante.</p>
      </div>
      <div className="modalFooter">
        <button 
          className="btnSecondary"
          onClick={() => {
            setMostrarModal(false);
            setVacanteSeleccionada(null);
            setModoEdicion(false);
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  ) : (
    <div className="modalContent" style={{maxWidth: '900px'}}>
      <div className="modalHeader">
        <h2 id="modal-title">
          {modoEdicion ? '✏️ Editar Vacante' : '👁️ Detalles de la Vacante'}
        </h2>
        <button 
          className="closeModal" 
          onClick={() => {
            setMostrarModal(false);
            setVacanteSeleccionada(null);
            setModoEdicion(false);
          }}
          aria-label="Cerrar modal"
        >
          ✕
        </button>
      </div>
      
      {modoEdicion ? (
        <form onSubmit={handleActualizar}>
          <div className="modalBody">
            {/* Grid de campos del formulario */}
            <div style={{ display: 'grid', gap: '20px' }}>
              
              {/* Título */}
              <div>
                <label className="authLabel">
                  <strong>Título de la Vacante *</strong>
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  className="authInput"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="authLabel">
                  <strong>Descripción</strong>
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="authInput"
                  rows="4"
                />
              </div>

              {/* Grid de 2 columnas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                {/* Programa Objetivo */}
                <div>
                  <label className="authLabel">
                    <strong>Programa Objetivo</strong>
                  </label>
                  <input
                    type="text"
                    name="programa_objetivo"
                    value={formData.programa_objetivo}
                    onChange={(e) => setFormData({...formData, programa_objetivo: e.target.value})}
                    className="authInput"
                  />
                </div>

                {/* Modalidad */}
                <div>
                  <label className="authLabel">
                    <strong>Modalidad *</strong>
                  </label>
                  <select
                    name="modalidad"
                    value={formData.modalidad}
                    onChange={(e) => setFormData({...formData, modalidad: e.target.value})}
                    className="authInput"
                    required
                  >
                    <option value="presencial">🏢 Presencial</option>
                    <option value="remoto">💻 Remoto</option>
                    <option value="hibrido">🔄 Híbrido</option>
                  </select>
                </div>
              </div>

              {/* Grid de 3 columnas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                
                {/* Salario */}
                <div>
                  <label className="authLabel">
                    <strong>Salario (COP) *</strong>
                  </label>
                  <input
                    type="number"
                    name="salario"
                    value={formData.salario}
                    onChange={(e) => setFormData({...formData, salario: e.target.value})}
                    className="authInput"
                    min="1300000"
                    required
                  />
                </div>

                {/* Duración */}
                <div>
                  <label className="authLabel">
                    <strong>Duración (meses)</strong>
                  </label>
                  <input
                    type="number"
                    name="duracion_meses"
                    value={formData.duracion_meses}
                    onChange={(e) => setFormData({...formData, duracion_meses: e.target.value})}
                    className="authInput"
                    min="1"
                  />
                </div>

                {/* Fecha de Inicio */}
                <div>
                  <label className="authLabel">
                    <strong>Fecha de Inicio</strong>
                  </label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                    className="authInput"
                  />
                </div>
              </div>

              {/* Requisitos */}
              <div>
                <label className="authLabel">
                  <strong>Requisitos</strong>
                </label>
                <textarea
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={(e) => setFormData({...formData, requisitos: e.target.value})}
                  className="authInput"
                  rows="3"
                />
              </div>

              {/* Horario */}
              <div>
                <label className="authLabel">
                  <strong>Horario</strong>
                </label>
                <input
                  type="text"
                  name="horario"
                  value={formData.horario}
                  onChange={(e) => setFormData({...formData, horario: e.target.value})}
                  className="authInput"
                />
              </div>

              {/* Beneficios */}
              <div>
                <label className="authLabel">
                  <strong>Beneficios</strong>
                </label>
                <textarea
                  name="beneficios"
                  value={formData.beneficios}
                  onChange={(e) => setFormData({...formData, beneficios: e.target.value})}
                  className="authInput"
                  rows="3"
                />
              </div>

            </div>
          </div>
          
          <div className="modalFooter">
            <button type="submit" className="btnSuccess">
              💾 Guardar Cambios
            </button>
            <button 
              type="button"
              className="btnSecondary"
              onClick={() => {
                setMostrarModal(false);
                setVacanteSeleccionada(null);
                setModoEdicion(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="modalBody">
            {/* Detalles de la vacante */}
            <div style={{ display: 'grid', gap: '20px' }}>
              
              {/* Título y Estado */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: '5px' }}>{vacanteSeleccionada.titulo}</h3>
                  <small style={{ color: '#666' }}>
                    {vacanteSeleccionada.sector_nombre || 'Sin sector'}
                  </small>
                </div>
                <span className={vacanteSeleccionada.aprobada ? 'badge badge-success' : 'badge badge-warning'}>
                  {vacanteSeleccionada.aprobada ? '✅ Activa' : '⏳ Pendiente'}
                </span>
              </div>

              {/* Información General */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px' 
              }}>
                <div>
                  <strong>📋 Programa:</strong>
                  <p>{vacanteSeleccionada.programa_objetivo || 'Todos los programas'}</p>
                </div>
                <div>
                  <strong>💼 Modalidad:</strong>
                  <p>
                    {vacanteSeleccionada.modalidad === 'presencial' && '🏢 Presencial'}
                    {vacanteSeleccionada.modalidad === 'remoto' && '💻 Remoto'}
                    {vacanteSeleccionada.modalidad === 'hibrido' && '🔄 Híbrido'}
                  </p>
                </div>
                <div>
                  <strong>💰 Salario:</strong>
                  <p>{new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                  }).format(vacanteSeleccionada.salario)}</p>
                </div>
                <div>
                  <strong>📅 Creada:</strong>
                  <p>{new Date(vacanteSeleccionada.creada_en).toLocaleDateString('es-CO')}</p>
                </div>
              </div>

              {/* Descripción */}
              {vacanteSeleccionada.descripcion && (
                <div>
                  <strong>📝 Descripción:</strong>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{vacanteSeleccionada.descripcion}</p>
                </div>
              )}

              {/* Requisitos */}
              {vacanteSeleccionada.requisitos && (
                <div>
                  <strong>✅ Requisitos:</strong>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{vacanteSeleccionada.requisitos}</p>
                </div>
              )}

              {/* Detalles Adicionales */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px' 
              }}>
                {vacanteSeleccionada.duracion_meses && (
                  <div>
                    <strong>⏱️ Duración:</strong>
                    <p>{vacanteSeleccionada.duracion_meses} meses</p>
                  </div>
                )}
                {vacanteSeleccionada.fecha_inicio && (
                  <div>
                    <strong>📆 Inicio:</strong>
                    <p>{new Date(vacanteSeleccionada.fecha_inicio).toLocaleDateString('es-CO')}</p>
                  </div>
                )}
                {vacanteSeleccionada.horario && (
                  <div>
                    <strong>🕐 Horario:</strong>
                    <p>{vacanteSeleccionada.horario}</p>
                  </div>
                )}
              </div>

              {/* Beneficios */}
              {vacanteSeleccionada.beneficios && (
                <div>
                  <strong>🎁 Beneficios:</strong>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{vacanteSeleccionada.beneficios}</p>
                </div>
              )}

              {/* Estadísticas de Postulaciones */}
              <div style={{ 
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <strong>📊 Postulaciones:</strong>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <span>Total: {vacanteSeleccionada.total_postulaciones || 0}</span>
                  <span style={{ color: '#f39c12' }}>
                    Pendientes: {vacanteSeleccionada.postulaciones_pendientes || 0}
                  </span>
                  <span style={{ color: '#27ae60' }}>
                    Aceptadas: {vacanteSeleccionada.postulaciones_aceptadas || 0}
                  </span>
                  <span style={{ color: '#e74c3c' }}>
                    Rechazadas: {vacanteSeleccionada.postulaciones_rechazadas || 0}
                  </span>
                </div>
              </div>

            </div>
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
              onClick={() => {
                setMostrarModal(false);
                setVacanteSeleccionada(null);
                setModoEdicion(false);
              }}
            >
              Cerrar
            </button>
          </div>
        </>
      )}
    </div>
  )}
      </dialog>
    </div>
  );
};

export default MisVacantes;