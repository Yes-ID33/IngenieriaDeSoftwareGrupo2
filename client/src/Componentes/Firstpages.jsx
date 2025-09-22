import { Link } from 'react-router-dom'

const Firstpages = () => {
  return (
    <div className="firstpages-main">
      <header>
        <div className="nav-left">
          <nav>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/">Convocatorias</a></li>
              <li><a href="/">Empresas</a></li>
            </ul>
          </nav>
        </div>
        <div className="nav-right">
          <nav>
            <ul>
            <Link to="/register" className="firstpages-btn primary">Registrarse</Link>
            <Link to="/login" className="firstpages-btn outline">Iniciar sesión</Link> 
            </ul>
          </nav>
        </div>
      </header>

      <div className="description-conatiner">
  <img
    src="/escudo-pascual-bravo_Mesa-de-trabajo-1.png"
    alt="Escudo Universidad Pascual Bravo"
    className="logo-universidad"
  />
  <h1 className="firstpages-title">
    Gestión de prácticas profesionales pascualinas
  </h1>
  <p>
    Este sitio está creado para que los estudiantes puedan ver ofertas de
    empresas que buscan practicantes, y a su vez las empresas puedan publicar
    sus ofertas de prácticas profesionales para que los estudiantes se postulen.
  </p>
</div>


      <div className="options-container">
        <div className="firstpages-buttons">
          <h2>Ir a registrarse</h2>
          <Link to="/register" className="firstpages-btn">Entra aquí</Link>
        </div>

        <div className="firstpages-buttons">
          <h2>Iniciar sesión</h2>
          <Link to="/login" className="firstpages-btn">Entra aquí</Link>
        </div>
      </div>

      <footer>
        <p>© 2025 Institución Universitaria Pascual Bravo</p>
        <p>
          <a href="#">Reglamento</a> | <a href="#">Soporte</a> | <a href="#">Contacto</a>
        </p>
      </footer>
    </div>
  )
}

export default Firstpages
