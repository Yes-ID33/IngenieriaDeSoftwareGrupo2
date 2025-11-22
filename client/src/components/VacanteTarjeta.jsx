import React from 'react';
import PropTypes from 'prop-types';
import "../styles/vacantes.css";

const VacanteTarjeta = ({ Vacante, onAplicar }) => {
    const {
        empresa,
        titulo,
        sector,
        modalidad,
        salario,
        requisitos
    } = Vacante;

    return(
        <div className="vacanteCard">
            <h3>{titulo}</h3>
            <p><strong>Empresa:</strong> {empresa}</p>
            <p><strong>Sector:</strong> {sector}</p>
            <p><strong>Modalidad:</strong> {modalidad}</p>
            <p><strong>Salario:</strong> {salario}</p>
            <p className="descripcion"><strong>Requisitos:</strong> {requisitos}</p>
            <button className="aplicarBtn" onClick={onAplicar}>Aplicar!</button>
        </div>
    );
};

// Validación de PropTypes
VacanteTarjeta.propTypes = {
    Vacante: PropTypes.shape({
        empresa: PropTypes.string.isRequired,
        titulo: PropTypes.string.isRequired,
        sector: PropTypes.string.isRequired,
        modalidad: PropTypes.string.isRequired,
        salario: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        requisitos: PropTypes.string.isRequired
    }).isRequired,
    onAplicar: PropTypes.func.isRequired
};

// Valores por defecto (opcional)
VacanteTarjeta.defaultProps = {
    onAplicar: () => console.warn('onAplicar function not provided')
};

export default VacanteTarjeta;