import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/CrearVacante.css';

const CrearVacante = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sectores, setSectores] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [programasFiltrados, setProgramasFiltrados] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    sector_id: '',
    programa_objetivo: '',
    modalidad: 'presencial',
    salario: '',
    requisitos: '',
    fecha_inicio: '',
    duracion_meses: '',
    horario: '',
    beneficios: ''
  });

  // Cargar catálogos al montar el componente
  useEffect(() => {
    obtenerCatalogos();
  }, []);

  // Filtrar programas cuando cambia el sector
  useEffect(() => {
    if (formData.sector_id) {
      const filtrados = programas.filter(
        p => p.sector_id === Number.parseInt(formData.sector_id)
      );
      setProgramasFiltrados(filtrados);
    } else {
      setProgramasFiltrados([]);
    }
  }, [formData.sector_id, programas]);

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
      alert('⚠️ Error al cargar los catálogos. Por favor recarga la página.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el sector, limpiar programa objetivo
    if (name === 'sector_id') {
      setFormData(prev => ({
        ...prev,
        sector_id: value,
        programa_objetivo: '' // Limpiar programa al cambiar sector
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.titulo || !formData.sector_id || !formData.modalidad || !formData.salario) {
      alert('⚠️ Por favor completa todos los campos obligatorios (*)');
      return;
    }
    if (Number.parseFloat(formData.salario) < 1300000) {
      alert('⚠️ El salario debe ser al menos $1,300,000 COP (salario mínimo legal)');
      return;
    }
    if (formData.duracion_meses && Number.parseInt(formData.duracion_meses) < 1) {
      alert('⚠️ La duración debe ser al menos 1 mes');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('http://localhost:5000/api/vacantes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}\n\nTu vacante será revisada por un administrador antes de ser publicada.`);
        navigate('/panel/empresa/mis-vacantes');
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al crear vacante:', err);
      alert('❌ Error de conexión al crear la vacante');
    } finally {
      setLoading(false);
    }
  };

  if (usuario && usuario.rol !== 'empresa') {
    navigate('/');
    return null;
  }

  if (usuario && !usuario.verificado) {
    return (
      <div className="layoutContent">
        <Header />
        <div className="authContainer">
          <div className="authCard">
            <h2>⏳ Empresa No Verificada</h2>
            <p>Tu empresa aún no ha sido aprobada por un administrador.</p>
            <p>No puedes publicar vacantes hasta que tu cuenta sea verificada.</p>
            <button onClick={() => navigate('/perfil')} className="authBtn">
              Volver a Mi Perfil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fondoParqueTech">
      <Header />
      <div className='Container'>
        <div className="authContainer">
          <div className="authCard" style={{ maxWidth: '900px' }}>
            <h2>➕ Publicar Nueva Vacante</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Completa la información de la práctica profesional que ofreces
            </p>
            <form onSubmit={handleSubmit} className=''>
              {/* Información Básica */}
              <div style={{ marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>📋 Información Básica</h3>
                
                <div className="infoBasicaGrid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                  <div>
                    <label htmlFor="titulo" className="authLabel">
                      <strong>Título de la Vacante *</strong>
                    </label>
                    <input
                      type="text"
                      id="titulo"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      className="authInput"
                      placeholder="Ej: Desarrollador Backend Junior"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="sector_id" className="authLabel">
                      <strong>Sector *</strong>
                    </label>
                    <select
                      id="sector_id"
                      name="sector_id"
                      value={formData.sector_id}
                      onChange={handleInputChange}
                      className="authInput"
                      required
                    >
                      <option value="">Seleccionar sector...</option>
                      {sectores.map(sector => (
                        <option key={sector.id} value={sector.id}>
                          {sector.icono} {sector.nombre}
                        </option>
                      ))}
                    </select>
                    <small style={{ color: '#888' }}>
                      El sector determina qué estudiantes verán tu vacante
                    </small>
                  </div>
                </div>
                <div style={{ marginTop: '15px' }}>
                  <label htmlFor="descripcion" className="authLabel">
                    <strong>Descripción de la Vacante</strong>
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className="authInput"
                    rows="4"
                    placeholder="Describe la oportunidad de práctica profesional que ofreces..."
                  />
                  <small style={{ color: '#888' }}>
                    Incluye información sobre tu empresa, el equipo de trabajo y las responsabilidades principales
                  </small>
                </div>
              </div>

              {/* Requisitos y Modalidad */}
              <div style={{ marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>🎯 Requisitos y Modalidad</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label htmlFor="programa_objetivo" className="authLabel">
                      <strong>Programa Académico Objetivo</strong>
                    </label>
                    <select
                      id="programa_objetivo"
                      name="programa_objetivo"
                      value={formData.programa_objetivo}
                      onChange={handleInputChange}
                      className="authInput"
                      disabled={!formData.sector_id}
                    >
                      <option value="">
                        {!formData.sector_id 
                          ? 'Primero selecciona un sector' 
                          : 'Todos los programas del sector'}
                      </option>
                      {programasFiltrados.length > 0 && (
                        <>
                          {[...new Set(programasFiltrados.map(p => p.facultad))].map(facultad => (
                            <optgroup key={facultad} label={facultad}>
                              {programasFiltrados
                                .filter(p => p.facultad === facultad)
                                .map(programa => (
                                  <option key={programa.id} value={programa.nombre}>
                                    {programa.nombre} ({programa.nivel})
                                  </option>
                                ))
                              }
                            </optgroup>
                          ))}
                        </>
                      )}
                    </select>
                    <small style={{ color: formData.sector_id && programasFiltrados.length === 0 ? '#e74c3c' : '#888' }}>
                      {!formData.sector_id 
                        ? 'Selecciona un sector para ver los programas disponibles'
                        : programasFiltrados.length === 0 
                          ? '⚠️ No hay programas disponibles en este sector'
                          : `${programasFiltrados.length} programa(s) disponible(s) en este sector`}
                    </small>
                  </div>
                  
                  <div>
                    <label htmlFor="modalidad" className="authLabel">
                      <strong>Modalidad de Trabajo *</strong>
                    </label>
                    <select
                      id="modalidad"
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
                <div style={{ marginTop: '15px' }}>
                  <label htmlFor="requisitos" className="authLabel">
                    <strong>Requisitos</strong>
                  </label>
                  <textarea
                    id="requisitos"
                    name="requisitos"
                    value={formData.requisitos}
                    onChange={handleInputChange}
                    className="authInput"
                    rows="4"
                    placeholder="Ej: Conocimientos en Node.js, PostgreSQL, trabajo en equipo..."
                  />
                </div>
              </div>

              {/* Condiciones Económicas y Temporales */}
              <div style={{ marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>💰 Condiciones</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                  <div>
                    <label htmlFor="salario" className="authLabel">
                      <strong>Salario Mensual (COP)</strong>
                    </label>
                    <input
                      type="number"
                      id="salario"
                      name="salario"
                      value={formData.salario}
                      onChange={handleInputChange}
                      className="authInput"
                      min="1300000"
                      step="50000"
                      placeholder="1300000"
                      required
                    />
                    <small style={{ color: '#888' }}>
                      Mínimo: $1,300,000 COP
                    </small>
                  </div>
                  
                  <div>
                    <label htmlFor="duracion_meses" className="authLabel">
                      <strong>Duración (meses)</strong>
                    </label>
                    <input
                      type="number"
                      id="duracion_meses"
                      name="duracion_meses"
                      value={formData.duracion_meses}
                      onChange={handleInputChange}
                      className="authInput"
                      min="1"
                      max="24"
                      placeholder="6"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fecha_inicio" className="authLabel">
                      <strong>Fecha de Inicio</strong>
                    </label>
                    <input
                      type="date"
                      id="fecha_inicio"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleInputChange}
                      className="authInput"
                    />
                  </div>
                </div>
                <div style={{ marginTop: '15px' }}>
                  <label htmlFor="horario" className="authLabel">
                    <strong>Horario</strong>
                  </label>
                  <input
                    type="text"
                    id="horario"
                    name="horario"
                    value={formData.horario}
                    onChange={handleInputChange}
                    className="authInput"
                    placeholder="Ej: Lunes a viernes de 8:00 AM a 5:00 PM"
                  />
                </div>
              </div>

              {/* Beneficios */}
              <div style={{ marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>🎁 Beneficios Adicionales</h3>
                
                <label htmlFor="beneficios" className="authLabel">
                  <strong>Beneficios</strong>
                </label>
                <textarea
                  id="beneficios"
                  name="beneficios"
                  value={formData.beneficios}
                  onChange={handleInputChange}
                  className="authInput"
                  rows="3"
                  placeholder="Ej: Transporte, alimentación, ambiente de aprendizaje, capacitaciones..."
                />
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => navigate('/panel/empresa/mis-vacantes')}
                  className="btnSecondary"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="authBtn"
                  disabled={loading}
                >
                  {loading ? '⏳ Publicando...' : '📤 Publicar Vacante'}
                </button>
              </div>
              <p style={{ marginTop: '15px', padding: '10px', background: '#fff3cd', borderRadius: '5px', fontSize: '0.9rem' }}>
                ⚠️ <strong>Nota:</strong> Tu vacante será revisada por un administrador antes de ser publicada. 
                Te notificaremos por correo cuando sea aprobada.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearVacante;