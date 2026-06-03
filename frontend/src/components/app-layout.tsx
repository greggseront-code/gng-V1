import { NavLink, Outlet } from 'react-router-dom';

function link({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link active' : 'nav-link';
}

export function AppLayout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">gnu-gesta</div>
          <div className="sidebar-brand-sub">Gestion des stages</div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <NavLink to="/" end className={link}>Accueil</NavLink>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-section-title">Répertoire</div>
            <NavLink to="/companies" className={link}>Entreprises</NavLink>
            <NavLink to="/admin/companies/new" className={link}>+ Nouvelle entreprise</NavLink>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-section-title">Stages</div>
            <NavLink to="/offers" className={link}>Offres</NavLink>
          </div>
        </nav>
      </aside>
      <main className="main">
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
