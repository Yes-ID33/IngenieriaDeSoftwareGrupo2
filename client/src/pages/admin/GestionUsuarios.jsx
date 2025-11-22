import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Header from '../../components/header.jsx';
import '../../styles/index.css';
import '../../styles/admin.css';

const GestionUsuarios = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [filtroRol, setFiltroRol] = useState('todos'); // 'todos', 'estudiante', 'empresa', 'administrador'
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuario && usuario.rol !== 'administrador') {
      navigate('/');
      return;
    }
    obtenerUsuarios();
  }, [usuario, navigate]);

  const obtenerUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Por ahora endpoint simulado, necesitarás crear este endpoint en el backend
      const res = await fetch('http://localhost:5000/api/admin/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        setUsuarios(data.data.usuarios || []);
        setError('');
      } else {
        setError(data.message || 'Error al obtener usuarios');
      }
    } catch (err) {
      console.error('Error:', err);
      // Si el endpoint no existe aún, mostrar datos mock
      setError('Endpoint no implementado aún. Mostrando datos de ejemplo.');
      setUsuarios([
        {
          id: 2,
          nombre: 'Juan',
          apellido: 'Pérez',
          correo: 'juan.perez@pascualbravo.edu.co',
          rol: 'estudiante',
          verificado: true,
          fecha_creacion: '2025-10-15'
        },
        {
          id: 3,
          nombre: 'María',
          apellido: 'González',
          correo: 'reclutamiento@techsolutions.com',
          rol: 'empresa',
          verificado: true,
          fecha_creacion: '2025-10-16'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!globalThis.confirm(`¿Estás seguro de eliminar el usuario "${nombre}"?\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`http://localhost:5000/api/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Usuario eliminado exitosamente`);
        obtenerUsuarios(); // Recargar lista
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      alert('❌ Error de conexión al eliminar usuario');
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(u => {
    const coincideBusqueda = busqueda === '' || 
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (u.apellido && u.apellido.toLowerCase().includes(busqueda.toLowerCase()));
    
    const coincideRol = filtroRol === 'todos' || u.rol === filtroRol;
    
    return coincideBusqueda && coincideRol;
  });

  return (
    <div className="layoutContent">
      <Header />
      <div className="adminContainer">
        <div className="adminHeader">
          <h1>👥 Gestión de Usuarios</h1>
          <button onClick={() => navigate('/panel/admin')} className="btnSecondary">
            ← Volver al panel
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="searchBar">
          <input 
            type="text"
            placeholder="🔍 Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="searchInput"
          />
          
          <select 
            value={filtroRol} 
            onChange={(e) => setFiltroRol(e.target.value)}
            className="filterSelect"
          >
            <option value="todos">Todos los roles</option>
            <option value="estudiante">👨‍🎓 Estudiantes</option>
            <option value="empresa">🏢 Empresas</option>
            <option value="administrador">🛡️ Administradores</option>
          </select>
        </div>

        {error && <p className="errorMessage">{error}</p>}

        {loading ? (
          <p>Cargando usuarios...</p>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="emptyState">
            <p>📭 No se encontraron usuarios con los filtros seleccionados</p>
          </div>
        ) : (
          <>
            <div className="tableInfo">
              <p>Mostrando <strong>{usuariosFiltrados.length}</strong> de <strong>{usuarios.length}</strong> usuarios</p>
            </div>
            
            <div className="tableContainer">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>
                        <strong>{u.nombre} {u.apellido || ''}</strong>
                      </td>
                      <td>{u.correo}</td>
                      <td>
                        {u.rol === 'estudiante' && '👨‍🎓 Estudiante'}
                        {u.rol === 'empresa' && '🏢 Empresa'}
                        {u.rol === 'administrador' && '🛡️ Admin'}
                      </td>
                      <td>
                        {u.verificado ? (
                          <span className="badge badge-success">✅ Verificado</span>
                        ) : (
                          <span className="badge badge-warning">⏳ Pendiente</span>
                        )}
                      </td>
                      <td>{new Date(u.fecha_creacion).toLocaleDateString('es-CO')}</td>
                      <td>
                        <div className="actionButtons">
                          <button 
                            className="btnSecondary btnSmall"
                            onClick={() => alert('Ver detalles (próximamente)')}
                          >
                            👁️ Ver
                          </button>
                          <button 
                            className="btnPrimary btnSmall"
                            onClick={() => alert('Editar (próximamente)')}
                          >
                            ✏️ Editar
                          </button>
                          {u.rol !== 'administrador' && (
                            <button 
                              className="btnDanger btnSmall"
                              onClick={() => handleEliminar(u.id, `${u.nombre} ${u.apellido || ''}`)}
                            >
                              🗑️ Eliminar
                            </button>
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
    </div>
  );
};

export default GestionUsuarios;