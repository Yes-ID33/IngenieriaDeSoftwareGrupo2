import { Link } from 'react-router-dom';
import styles from '../styles/paginainicial.module.css';
import Header from '../components/header.jsx';


const PaginaInicial = () => {
  return (
    <div className="fondoParqueTech">
      <div className="contenidoTransparente">
        <div className={styles.firstpagesMain}>
          <Header />

          <div className={styles.descriptionContainer}>
            <img
              src="/escudo-pascual-bravo_Mesa-de-trabajo-1.png"
              alt="Escudo Universidad Pascual Bravo"
              className={styles.firstpagesImg}
            />
            <h1 className={styles.firstpagesTitle}>
              Gestión de prácticas profesionales 
            </h1>
            <p>
              Este sitio está creado para que los estudiantes puedan ver ofertas de
              empresas que buscan practicantes, y a su vez las empresas puedan publicar
              sus ofertas de prácticas profesionales para que los estudiantes se postulen.
            </p>
          </div>

          <div className={styles.optionsContainer}>
            <div className={styles.firstpagesButtons}>
              <h2>Registrarse</h2>
              <Link to="/register" id='registerBtn' className={styles.firstpagesBtn}>Entra aquí</Link>
            </div>

            <div className={styles.firstpagesButtons}>
              <h2>Iniciar sesión</h2>
              <Link to="/login" id='loginBtn' className={styles.firstpagesBtn}>Entra aquí</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaginaInicial;