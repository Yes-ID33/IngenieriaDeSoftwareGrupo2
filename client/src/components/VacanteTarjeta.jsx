import  React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/vacantes.css";

const VacanteTarjeta = ({Vacante, onAplicar}) => {
    const{ //campos necesarios desde la tabla vacante
        empresa,
        titulo,
        sector,
        modalidad,
        salario,
        requisitos
    } = Vacante

    return(
        <div className="vacanteCard">
            <h3>{titulo}</h3>
            <p><strong>Empresa:</strong>{empresa}</p>
            <p><strong>Sector:</strong>{sector}</p>
            <p><strong>Modalidad:</strong>{modalidad}</p>
            <p><strong>Salario:</strong>{salario}</p>
            <p className="descripcion"><strong>Requisitos:</strong>{requisitos}</p>
            <button className="aplicarBtn" onClick={onAplicar}>Aplicar!</button>
        </div>
    );
};

export default VacanteTarjeta

 