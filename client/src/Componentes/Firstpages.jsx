
import { Link } from 'react-router-dom';


const Firstpages = () => {
  return (
    <div className="firstpages-main">
      <header>
        <div className="nav-left">
          <nav>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/">Placeholder</a></li>
            </ul>
          </nav>
        </div>
        <div className="nav-right">
          <nav>
            <ul>
              <li><a href="/login">Iniciar Sesión</a></li>
              <li><a href="/register">Registrarse</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className='description-conatiner'>
          <img src="" alt="Foto Pascual" className="firstpages-img"/>
          <h1 className="firstpages-title">Gestion de practicas profesionales pascualinas</h1>
          <p>Este sitio esta creado para que los estudiiantes puedan 
              ver ofertas de empresas que estan buscando practicantes,
              y a su vez las empresas puedan publicar sus ofertas de practicas
              profesionales para que los estudiantes puedan postularse.
          </p>
      </div>
        
      <div className='options-container'>
          <div className="firstpages-buttons">
              <h2>Ir a registrarse</h2>
              <Link to="/register" className="firstpages-btn">Entra aqui</Link>
          </div>
           
          <div className="firstpages-buttons">
                <h2>Iniciar sesion</h2>
                <Link to="/login" className="firstpages-btn">Entra aqui</Link>
          </div>
      </div>
    </div>
  )
}

export default Firstpages