import React from 'react';
import PropTypes from 'prop-types';
import "../styles/vacantes.css";

const VacanteTarjeta = ({ vacante, onAplicar }) => {
    const {
        razon_social,
        titulo,
        sector,
        modalidad,
        salario,
        requisitos
    } = vacante;

    return(
        <div className="vacanteCard">
            <h3>{titulo}</h3>
            <p><strong>Empresa:</strong> {razon_social}</p>
            <p><strong>Sector:</strong> {sector}</p>
            <p><strong>Modalidad:</strong> {modalidad}</p>
            <p><strong>Salario:</strong> {salario}</p>
            <p className="descripcion"><strong>Requisitos:</strong> {requisitos}</p>
            <button className="aplicarBtn" onClick={onAplicar}>Aplicar!</button>
        </div>
    );
};

// Validación de PropTypes - SOLUCIÓN: Eliminar defaultProps o cambiar isRequired
VacanteTarjeta.propTypes = {
    vacante: PropTypes.shape({
        razon_social: PropTypes.string.isRequired,
        titulo: PropTypes.string.isRequired,
        sector: PropTypes.string.isRequired,
        modalidad: PropTypes.string.isRequired,
        salario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        requisitos: PropTypes.string.isRequired
    }).isRequired,
    onAplicar: PropTypes.func // SOLUCIÓN: Quitamos .isRequired
};

// SOLUCIÓN: Mantenemos defaultProps pero quitamos isRequired en PropTypes
VacanteTarjeta.defaultProps = {
    onAplicar: () => console.warn('onAplicar function not provided')
};

export default VacanteTarjeta;