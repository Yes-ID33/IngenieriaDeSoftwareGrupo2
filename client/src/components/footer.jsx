import React from "react";
import "../styles/index.css";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer footer--fullbleed" role="contentinfo">
      <div className="footer-content">
        <div className="footer-brand" aria-hidden={false}>
          <p className="footer-institution">© 2025 Institución Universitaria Pascual Bravo</p>
          <p className="footer-title">Sistema de Gestión de Prácticas Profesionales</p>
        </div>

        <nav className="footer-links" aria-label="Enlaces institucionales">
          <a href="/reglamento">Reglamento</a>
          <span className="footer-separator" aria-hidden="true">|</span>
          <a href="/soporte">Soporte</a>
          <span className="footer-separator" aria-hidden="true">|</span>
          <a href="/contacto">Contacto</a>
        </nav>
      </div>

      <div className="footer-bottom" aria-hidden="false">
        © 2025 Institución Universitaria Pascual Bravo — Todos los derechos reservados
      </div>
    </footer>
  );
};

export default Footer;
