import React, { useState } from 'react';
import Header from '../components/header.jsx';
import RegisterEstudiante from '../components/RegisterEstudiante.jsx';
import RegisterEmpresa from '../components/RegisterEmpresa.jsx';
import "../styles/index.css";
import "../styles/auth.css";

const Register = () => {
  const [tipoUsuario, setTipoUsuario] = useState('');

  const handleTipoUsuario = (tipo) => {
    setTipoUsuario(tipo);
  };

  const renderFormulario = () => {
    switch (tipoUsuario) {
      case 'estudiante':
        return <RegisterEstudiante />;
      case 'empresa':
        return <RegisterEmpresa />;
      default:
        return null;
    }
  };

  return (
    <div className="fondoParqueTech">
      <div className='layoutContent'>
        <Header />
        <div className="authContainer">
          <div className="authCard">
            <h2>Crear cuenta</h2>
            {!tipoUsuario && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <button className="authBtn" onClick={() => handleTipoUsuario('estudiante')}>Registro Estudiante</button>
                <button className="authBtn" onClick={() => handleTipoUsuario('empresa')}>Registro Empresa</button>
              </div>
            )}
            {renderFormulario()}
            <p>
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="authLink">Inicia sesión aquí</a>
            </p>
            {tipoUsuario && (
              <button className="authBtn" style={{ marginTop: '10px' }} onClick={() => setTipoUsuario('')}>
                Volver
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
