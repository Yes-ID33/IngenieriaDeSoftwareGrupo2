import React from 'react';
import PropTypes from 'prop-types';

const RegisterBase = ({ formData, handleChange }) => (
  <>
    <label htmlFor="nombre">Nombre</label>
    <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />

    <label htmlFor="correo">Correo electrónico</label>
    <input type="email" id="correo" name="correo" value={formData.correo} onChange={handleChange} required />

    <label htmlFor="contrasena">Contraseña</label>
    <input type="password" id="contrasena" name="contrasena" value={formData.contrasena} onChange={handleChange} required />

    <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
    <input type="password" id="confirmarContrasena" name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} required />
  </>
);

// Validación de PropTypes
RegisterBase.propTypes = {
  formData: PropTypes.shape({
    nombre: PropTypes.string.isRequired,
    correo: PropTypes.string.isRequired,
    contrasena: PropTypes.string.isRequired,
    confirmarContrasena: PropTypes.string.isRequired
  }).isRequired,
  handleChange: PropTypes.func.isRequired
};

export default RegisterBase;