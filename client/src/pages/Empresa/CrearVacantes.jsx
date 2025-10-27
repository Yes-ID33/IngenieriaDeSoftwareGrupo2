import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/header.jsx';
import '../../styles/index.css';
import '../../styles/vacantes.css';

const CrearVacantes = () => {
  // Obtener datos del usuario desde el contexto
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Extraer nit_id y verificado desde el objeto usuario
  const empresaID = usuario?.nit_id;
  const estaVerificada = usuario?.verificado;

  // Estados para los campos del formulario
  const [sector, setSector] = useState('');
  const [modalidad, setModalidad] = useState('');
  const [salario, setSalario] = useState('');
  const [requisitos, setRequisitos] = useState('');

  // Si la empresa no está verificada, redirigir o bloquear
  useEffect(() => {
    if (usuario?.rol !== 'empresa' || !estaVerificada) {
      alert('Tu empresa debe estar verificada para crear vacantes');
      navigate('/perfil');
    }
  }, [usuario, estaVerificada, navigate]);

  // Función para enviar la vacante al backend
  const handleCrearVacante = async (e) => {
    e.preventDefault();

    if (!sector || !modalidad || !salario || !requisitos || !empresaID) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/vacantes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          empresa_id: empresaID,
          sector,
          modalidad,
          salario,
          requisitos
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Vacante creada exitosamente');
        navigate('/panel/empresa'); // o donde quieras redirigir
      } else {
        alert(data.message || 'No se pudo crear la vacante');
      }
    } catch (error) {
      console.error('Error al crear vacante:', error);
      alert('Error de conexión');
    }
  };

  return (
    <div className="layoutContent">
      <Header />
      <div className="authContainer">
        <div className="authCard">
          <h1>📋 Crear Vacante</h1>
          <form onSubmit={handleCrearVacante}>
            <label>Sector</label>
            <input 
              type="text" 
              value={sector} 
              onChange={e => setSector(e.target.value)} 
              required 
            />

            <label>Modalidad</label>
            <select 
              value={modalidad} 
              onChange={e => setModalidad(e.target.value)} 
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
            </select>

            <label>Salario</label>
            <input 
              type="number" 
              value={salario} 
              onChange={e => setSalario(e.target.value)} 
              min="1300000"
              required 
            />

            <label>Requisitos</label>
            <textarea 
              value={requisitos} 
              onChange={e => setRequisitos(e.target.value)} 
              rows="4"
              required 
            />

            <button type="submit" className="authBtn">Publicar Vacante</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearVacantes;
