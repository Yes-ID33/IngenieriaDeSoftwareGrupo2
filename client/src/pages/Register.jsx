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
      <div className="contenidoTransparente">
        <Header />
        
        <div className="descriptionContainer">
          <img
            src="/escudo-pascual-bravo_Mesa-de-trabajo-1.png"
            alt="Escudo Universidad Pascual Bravo"
            className="firstpagesImg"
          />
          <h1 className="firstpagesTitle">Crear Cuenta</h1>
          <p>
            Selecciona el tipo de cuenta que deseas crear
          </p>
        </div>

        <div className="optionsContainer" style={{ flexDirection: 'column', alignItems: 'center', gap: '0' }}>
          <div className="authCard" style={{ 
            maxWidth: '480px', 
            margin: '0 auto',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Crear cuenta</h2>
            
            {!tipoUsuario && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                <button 
                  className="authBtn" 
                  onClick={() => handleTipoUsuario('estudiante')}
                  style={{ margin: 0 }}
                >
                  Registro Estudiante
                </button>
                <button 
                  className="authBtn" 
                  onClick={() => handleTipoUsuario('empresa')}
                  style={{ margin: 0 }}
                >
                  Registro Empresa
                </button>
              </div>
            )}
            
            {renderFormulario()}
            
            <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="authLink">Inicia sesión aquí</a>
            </p>
            
            {tipoUsuario && (
              <button 
                className="authBtn" 
                style={{ marginTop: '15px', background: 'var(--color-muted)' }}
                onClick={() => setTipoUsuario('')}
              >
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