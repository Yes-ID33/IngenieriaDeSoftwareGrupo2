import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Header from '../components/header.jsx';
import "../styles/index.css";
import "../styles/vacantes.css";
import VacanteTarjeta from '../components/VacanteTarjeta.jsx';

const Vacantes = () => {
    const [vacantes, setVacantes] = useState([]);
    const navigate = useNavigate();

    useEffect(() =>{
        const obtenerVacantes = async () =>{
            try{
                const res = await fetch('http://localhost:5000/api/vacantes/publicas');
                const data = await res.json();
                if (data.success){
                    setVacantes(data.data.vacantes)
                }
            }catch(error){
                console.error('Error al cargar vacantes: ', error);
            }
        };
        obtenerVacantes();
    }, []);

    return(
        <div className="layoutContent">
            <Header />
            <div className="vacantesIntro">
                <h2>Estas son las vacantes disponibles para los estudiantes del Pascual Bravo</h2>
            </div>
            
            <div className="vacantesGrid">
                {vacantes.map(vacante =>(
                    <VacanteTarjeta 
                        key={vacante.vacante_id}
                        vacante={vacante}
                        onAplicar={() => navigate('./Solicitud.jsx', { state: {vacante} })}
                    />
                ))}
            </div>
        </div>
    );
};

export default Vacantes