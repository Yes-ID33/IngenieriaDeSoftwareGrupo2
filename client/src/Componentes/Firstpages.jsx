import { Link } from 'react-router-dom';
import styles from '../firstpages.module.css'; // asegúrate que el nombre del archivo sea singular y correcto

const FirstPages = () => {
  return (
  <div className='layoutContent'>
    <div className={styles.firstpagesMain}>
      <header>
        <div className="navLeft">
          <nav>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/">Convocatorias</a></li>
              <li><a href="/">Empresas</a></li>
            </ul>
          </nav>
        </div>
        <div className="navRight">
          <nav>
            <ul>
              <li>
                <Link to="/register" className={`${styles.firstpagesBtn} ${styles.primary}`}>Registrarse</Link>
              </li>
              <li>
                <Link to="/login" className={`${styles.firstpagesBtn} ${styles.outline}`}>Iniciar sesión</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <div className={styles.descriptionContainer}>
        <img
          src="/escudo-pascual-bravo_Mesa-de-trabajo-1.png"
          alt="Escudo Universidad Pascual Bravo"
          className={styles.firstpagesImg}
        />
        <h1 className={styles.firstpagesTitle}>
          Gestión de prácticas profesionales pascualinas
        </h1>
        <p>
          Este sitio está creado para que los estudiantes puedan ver ofertas de
          empresas que buscan practicantes, y a su vez las empresas puedan publicar
          sus ofertas de prácticas profesionales para que los estudiantes se postulen.
        </p>
      </div>

      <div className={styles.optionsContainer}>
        <div className={styles.firstpagesButtons}>
          <h2>Ir a registrarse</h2>
          <Link to="/register" className={styles.firstpagesBtn}>Entra aquí</Link>
        </div>

        <div className={styles.firstpagesButtons}>
          <h2>Iniciar sesión</h2>
          <Link to="/login" className={styles.firstpagesBtn}>Entra aquí</Link>
        </div>
      </div>

      <footer>
        <p>© 2025 Institución Universitaria Pascual Bravo</p>
        <p>
          <a href="#">Reglamento</a> | <a href="#">Soporte</a> | <a href="#">Contacto</a>
        </p>
      </footer>
    </div>
  </div>
  );
};

export default FirstPages;
