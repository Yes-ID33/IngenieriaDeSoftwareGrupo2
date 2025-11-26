import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/header.css';

const Header = () => {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <header>
      <div className="navLeft">
        <nav>
          <ul>
            {!usuario && <li><Link to="/">Inicio</Link></li>}
            
            {/* 👤 NAVEGACIÓN PARA ESTUDIANTES */}
            {usuario && usuario.rol === 'estudiante' && (
              <>
                <li><Link to="/vacantes">Vacantes</Link></li>
                
              </>
            )}

            {/* 🏢 NAVEGACIÓN PARA EMPRESAS */}
            {usuario && usuario.rol === 'empresa' && (
              <>
                <li><Link to="/panel/empresa">Panel</Link></li>
                <li><Link to="/panel/empresa/mis-vacantes">Mis Vacantes</Link></li>
                <li><Link to="/panel/empresa/crear-vacante">Crear Vacante</Link></li>
                <li><Link to="/panel/empresa/postulaciones">Postulaciones</Link></li>
              </>
            )}

            {/* 🛡️ NAVEGACIÓN PARA ADMINISTRADORES */}
            {usuario && usuario.rol === 'administrador' && (
              <>
                <li><Link to="/panel/admin">Panel Admin</Link></li>
                <li><Link to="/panel/admin/empresas">Empresas</Link></li>
                <li><Link to="/panel/admin/vacantes">Vacantes</Link></li>
                <li><Link to="/panel/admin/usuarios">Usuarios</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>

      <div className="navRight">
        <nav>
          <ul>
            {usuario ? (
              <li className="dropdown">
                <button className="dropdownToggle">
                  {usuario.rol === 'estudiante' && '👤'}
                  {usuario.rol === 'empresa' && '🏢'}
                  {usuario.rol === 'administrador' && '🛡️'}
                  {' '}
                  {usuario.nombre}
                </button>
                <ul className="dropdownMenu">
                  <li><Link to="/perfil">Mi perfil</Link></li>
                  
                  {/* Opciones específicas para estudiantes */}
                  {usuario.rol === 'estudiante' && (
                    <>
                      <li><Link to="/hojas/crear">Crear Hoja de Vida</Link></li>
                      
                    </>
                  )}
                  
                  {/* Opciones específicas para empresas */}
                  {usuario.rol === 'empresa' && (
                    <>
                      <li><Link to="/panel/empresa">Panel de Empresa</Link></li>
                      <li><Link to="/panel/empresa/crear-vacante">Publicar Vacante</Link></li>
                    </>
                  )}
                  
                  {/* Opciones específicas para admin */}
                  {usuario.rol === 'administrador' && (
                    <>
                      <li><Link to="/panel/admin">Panel de Admin</Link></li>
                      <li><Link to="/panel/admin/empresas">Gestionar Empresas</Link></li>
                    </>
                  )}
                  
                  <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                </ul>
              </li>
            ) : (
              <>
                <li><Link to="/login">Iniciar Sesión</Link></li>
                <li><Link to="/register">Registrarse</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;