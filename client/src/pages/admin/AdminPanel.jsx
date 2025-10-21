
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Header from '../../components/header.jsx';
import '../../styles/adminPanel.css';

const AdminPanel = () => {
  return (
    <div className="adminLayout">
      <Header />
      <div className="adminPanelContainer">
        <aside className="adminSidebar">
          <h2>Panel de Administración</h2>
          <nav>
            <ul>
              <li><Link to="/panel/admin/empresas-pendientes">Empresas Pendientes</Link></li>
              <li><Link to="/panel/admin/usuarios">Gestión de Usuarios</Link></li>
            </ul>
          </nav>
        </aside>

        <main className="adminContent">
          {/* Aquí se renderizan las subrutas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
