import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css';

const MisVacantes = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [vacantes, setVacantes] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [sectores, setSectores] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [programasFiltrados, setProgramasFiltrados] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (usuario && usuario.rol !== 'empresa') {
      navigate('/');
      return;
    }
    obtenerVacantes();
    obtenerCatalogos();
  }, [usuario, navigate]);

  // Filtrar programas cuando cambia el sector en modo edición
  useEffect(() => {
    if (modoEdicion && formData.sector_id) {
      const filtrados = programas.filter(
        p => p.sector_id === parseInt(formData.sector_id)
      );
      setProgramasFiltrados(filtrados);
    } else {
      setProgramasFiltrados([]);
    }
  }, [formData.sector_id, programas, modoEdicion]);

  const obtenerCatalogos = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener sectores
      const resSectores = await fetch('http://localhost:5000/api/catalogos/sectores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const dataSectores = await resSectores.json();
      if (dataSectores.success) {
        setSectores(dataSectores.data.sectores || []);
      }

      // Obtener programas
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
    if (!window.confirm(`¿Estás seguro de eliminar la vacante "${titulo}"?\n\nEsta acción no se puede deshacer y se eliminarán todas las postulaciones asociadas.`)) {
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

    if (parseFloat(formData.salario) < 1300000) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el sector, limpiar programa
    if (name === 'sector_id') {
      setFormData(prev => ({
        ...prev,
        sector_id: value,
        programa_objetivo: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatearSalario = (salario) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(salario);
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

        <div className="filterTabs">
          <button 
            className={filtro === 'todas' ? 'active' : ''}
            onClick={() => setFiltro('todas')}
          >
            📋 Todas ({vacantes.length})
          </button>
          <button 
            className={filtro === 'aprobadas' ? 'active' : ''}
            onClick={() => setFiltro('aprobadas')}
          >
            ✅ Aprobadas ({vacantes.filter(v => v.aprobada).length})
          </button>
          <button 
            className={filtro === 'pendientes' ? 'active' : ''}
            onClick={() => setFiltro('pendientes')}
          >
            ⏳ Pendientes ({vacantes.filter(v => !v.aprobada).length})
          </button>
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
                      <td>
                        {vacante.modalidad === 'presencial' && '🏢 Presencial'}
                        {vacante.modalidad === 'remoto' && '💻 Remoto'}
                        {vacante.modalidad === 'hibrido' && '🔄 Híbrido'}
                      </td>
                      <td>{formatearSalario(vacante.salario)}</td>
                      <td>
                        <span className="badge" style={{cursor: 'pointer'}}>
                          {vacante.total_postulaciones || 0}
                          {parseInt(vacante.postulaciones_pendientes) > 0 && (
                            <span style={{color: '#f39c12'}}> ({vacante.postulaciones_pendientes} nuevas)</span>
                          )}
                        </span>
                      </td>
                      <td>
                        {vacante.aprobada ? (
                          <span className="badge badge-success">✅ Activa</span>
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
                          <button 
                            className="btnPrimary btnSmall"
                            onClick={() => abrirEdicion(vacante)}
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            className="btnDanger btnSmall"
                            onClick={() => handleEliminar(vacante.vacante_id, vacante.titulo)}
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

      {/* Modal */}
      {mostrarModal && vacanteSeleccionada && (
        <div className="modal" onClick={() => setMostrarModal(false)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()} style={{maxWidth: '900px'}}>
            <div className="modalHeader">
              <h2>{modoEdicion ? '✏️ Editar Vacante' : '👁️ Detalles de la Vacante'}</h2>
              <button className="closeModal" onClick={() => setMostrarModal(false)}>✕</button>
            </div>
            
            {modoEdicion ? (
              <form onSubmit={handleActualizar}>
                <div className="modalBody">
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                    <div>
                      <label><strong>Título *</strong></label>
                      <input
                        type="text"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        className="authInput"
                        required
                      />
                    </div>
                    <div>
                      <label><strong>Sector *</strong></label>
                      <select
                        name="sector_id"
                        value={formData.sector_id}
                        onChange={handleInputChange}
                        className="authInput"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {sectores.map(sector => (
                          <option key={sector.id} value={sector.id}>
                            {sector.icono} {sector.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{marginTop: '15px'}}>
                    <label><strong>Descripción</strong></label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      className="authInput"
                      rows="3"
                    />
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
                    <div>
                      <label><strong>Programa Objetivo</strong></label>
                      <select
                        name="programa_objetivo"
                        value={formData.programa_objetivo}
                        onChange={handleInputChange}
                        className="authInput"
                        disabled={!formData.sector_id}
                      >
                        <option value="">
                          {!formData.sector_id 
                            ? 'Selecciona un sector primero' 
                            : 'Todos los programas del sector'}
                        </option>
                        {programasFiltrados.map(programa => (
                          <option key={programa.id} value={programa.nombre}>
                            {programa.nombre} ({programa.nivel})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label><strong>Modalidad *</strong></label>
                      <select
                        name="modalidad"
                        value={formData.modalidad}
                        onChange={handleInputChange}
                        className="authInput"
                        required
                      >
                        <option value="presencial">🏢 Presencial</option>
                        <option value="remoto">💻 Remoto</option>
                        <option value="hibrido">🔄 Híbrido</option>
                      </select>
                    </div>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px'}}>
                    <div>
                      <label><strong>Salario Mensual *</strong></label>
                      <input
                        type="number"
                        name="salario"
                        value={formData.salario}
                        onChange={handleInputChange}
                        className="authInput"
                        min="1300000"
                        required
                      />
                    </div>
                    <div>
                      <label><strong>Duración (meses)</strong></label>
                      <input
                        type="number"
                        name="duracion_meses"
                        value={formData.duracion_meses}
                        onChange={handleInputChange}
                        className="authInput"
                        min="1"
                      />
                    </div>
                    <div>
                      <label><strong>Fecha de Inicio</strong></label>
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={handleInputChange}
                        className="authInput"
                      />
                    </div>
                  </div>

                  <div style={{marginTop: '15px'}}>
                    <label><strong>Horario</strong></label>
                    <input
                      type="text"
                      name="horario"
                      value={formData.horario}
                      onChange={handleInputChange}
                      className="authInput"
                    />
                  </div>

                  <div style={{marginTop: '15px'}}>
                    <label><strong>Requisitos</strong></label>
                    <textarea
                      name="requisitos"
                      value={formData.requisitos}
                      onChange={handleInputChange}
                      className="authInput"
                      rows="3"
                    />
                  </div>

                  <div style={{marginTop: '15px'}}>
                    <label><strong>Beneficios</strong></label>
                    <textarea
                      name="beneficios"
                      value={formData.beneficios}
                      onChange={handleInputChange}
                      className="authInput"
                      rows="3"
                    />
                  </div>
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
                  <div className="detailGroup">
                    <h3>Información General</h3>
                    <p><strong>Título:</strong> {vacanteSeleccionada.titulo}</p>
                    <p><strong>Sector:</strong> {vacanteSeleccionada.sector_icono} {vacanteSeleccionada.sector_nombre || 'No especificado'}</p>
                    <p><strong>Programa Objetivo:</strong> {vacanteSeleccionada.programa_objetivo || 'Todos los programas del sector'}</p>
                  </div>

                  {vacanteSeleccionada.descripcion && (
                    <div className="detailGroup">
                      <h3>Descripción</h3>
                      <p>{vacanteSeleccionada.descripcion}</p>
                    </div>
                  )}

                  <div className="detailGroup">
                    <h3>Condiciones</h3>
                    <p><strong>Modalidad:</strong> {vacanteSeleccionada.modalidad}</p>
                    <p><strong>Salario:</strong> {formatearSalario(vacanteSeleccionada.salario)}</p>
                    {vacanteSeleccionada.duracion_meses && (
                      <p><strong>Duración:</strong> {vacanteSeleccionada.duracion_meses} meses</p>
                    )}
                    {vacanteSeleccionada.horario && (
                      <p><strong>Horario:</strong> {vacanteSeleccionada.horario}</p>
                    )}
                    {vacanteSeleccionada.fecha_inicio && (
                      <p><strong>Fecha de Inicio:</strong> {new Date(vacanteSeleccionada.fecha_inicio).toLocaleDateString('es-CO')}</p>
                    )}
                  </div>

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
                    <h3>Estadísticas</h3>
                    <p><strong>Total de Postulaciones:</strong> {vacanteSeleccionada.total_postulaciones}</p>
                    <p><strong>Pendientes:</strong> {vacanteSeleccionada.postulaciones_pendientes}</p>
                    <p><strong>Aceptadas:</strong> {vacanteSeleccionada.postulaciones_aceptadas}</p>
                    <p><strong>Rechazadas:</strong> {vacanteSeleccionada.postulaciones_rechazadas}</p>
                    <p><strong>Estado:</strong> {vacanteSeleccionada.aprobada ? '✅ Aprobada' : '⏳ Pendiente de aprobación'}</p>
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
                    onClick={() => setMostrarModal(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MisVacantes;