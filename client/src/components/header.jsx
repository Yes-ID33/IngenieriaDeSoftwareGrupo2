import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Asegúrate de tener este contexto creado
import '../styles/header.css'; // Estilos específicos para el dropdown

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
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/convocatorias">Convocatorias</Link></li>
          </ul>
        </nav>
      </div>

      <div className="navRight">
        <nav>
          <ul>
            {!usuario ? (
              <>
                <li><Link to="/login">Iniciar Sesión</Link></li>
                <li><Link to="/register">Registrarse</Link></li>
              </>
            ) : (
              <li className="dropdown">
                <button className="dropdownToggle">Perfil ▾</button>
                <ul className="dropdownMenu">
                  <li><Link to="/perfil">Mi perfil</Link></li>
                  <li><Link to="/solicitudes">Mis solicitudes</Link></li>
                  <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                </ul>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;