import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);
  
  const iniciarSesion = (datosUsuario) => {
    setUsuario(datosUsuario);
  };
  
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };
  
  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

// Agregar validación de PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => useContext(AuthContext);