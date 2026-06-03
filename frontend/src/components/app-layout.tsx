import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useRole } from '../context/role-context';

function link({ isActive }: { isActive: boolean }) {
  return isActive ? 'nav-link active' : 'nav-link';
}

const ROLE_LABELS: Record<string, string> = {
  gestionnaire: 'Gestionnaire',
  lecteur: 'Lecteur',
  etudiant: 'Étudiant',
  entreprise: 'Entreprise',
};

export function AppLayout() {
  const { role, clearRole } = useRole();
  const navigate = useNavigate();

  function handleChangeRole() {
    clearRole();
    navigate('/select-role');
  }

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

          {(role === 'gestionnaire' || role === 'lecteur' || role === 'etudiant') && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Répertoire</div>
              <NavLink to="/companies" className={link}>Entreprises</NavLink>
              {role === 'gestionnaire' && (
                <NavLink to="/admin/companies/new" className={link}>+ Nouvelle entreprise</NavLink>
              )}
            </div>
          )}

          {role === 'entreprise' && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Mon entreprise</div>
              <NavLink to="/companies" className={link}>Répertoire</NavLink>
            </div>
          )}

          <div className="sidebar-section">
            <div className="sidebar-section-title">Stages</div>
            <NavLink to="/offers" className={link}>Offres</NavLink>
          </div>
        </nav>

        <div className="sidebar-footer">
          {role && (
            <div className="sidebar-role-badge">
              <strong>{ROLE_LABELS[role]}</strong>
            </div>
          )}
          <button className="nav-btn" onClick={handleChangeRole}>
            Changer de rôle
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="page">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
