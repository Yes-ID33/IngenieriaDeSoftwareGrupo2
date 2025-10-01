import { Link } from 'react-router-dom';
import styles from '../styles/paginainicial.module.css'; // asegúrate que el nombre del archivo sea singular y correcto
import Header from '../components/header.jsx';

const Perfil = () =>{
    return(
        <div className='layoutContent'>
            <Header />

            <div className='statsPerfil'>
                <h1>Hola perfil</h1>
            </div>
        </div>
    )
}

export default Perfil;