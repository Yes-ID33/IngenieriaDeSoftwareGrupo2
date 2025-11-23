import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
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

  const authValue = useMemo(() => ({
  usuario,
  iniciarSesion,
  cerrarSesion
}), [usuario, iniciarSesion, cerrarSesion]);
  
  return (
     <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Agregar validación de PropTypes
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => useContext(AuthContext);