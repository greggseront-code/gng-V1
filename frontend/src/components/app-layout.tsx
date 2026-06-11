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
          <div className="sidebar-brand-name">GNG</div>
          <div className="sidebar-brand-sub">GNG is not Gesta</div>
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

          {(role === 'gestionnaire' || role === 'lecteur') && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Étudiants</div>
              <NavLink to="/admin/students" className={link}>Liste</NavLink>
              {role === 'gestionnaire' && (
                <NavLink to="/admin/students/import" className={link}>Importer</NavLink>
              )}
            </div>
          )}

          {role === 'entreprise' && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Mon entreprise</div>
              <NavLink to="/company/dashboard" className={link}>Espace entreprise</NavLink>
              <NavLink to="/companies" className={link}>Répertoire</NavLink>
            </div>
          )}

          {role === 'etudiant' && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Mon espace</div>
              <NavLink to="/student/applications" className={link}>Mes candidatures</NavLink>
            </div>
          )}

          <div className="sidebar-section">
            <div className="sidebar-section-title">Stages</div>
            <NavLink to="/offers" end className={link}>Offres</NavLink>
            {(role === 'gestionnaire' || role === 'lecteur') && (
              <NavLink to="/admin/offers" className={link}>Admin offres</NavLink>
            )}
            {(role === 'gestionnaire' || role === 'lecteur') && (
              <NavLink to="/admin/applications" className={link}>Candidatures</NavLink>
            )}
            {role === 'entreprise' && (
              <NavLink to="/offers/new" className={link}>+ Déposer une offre</NavLink>
            )}
            {role === 'etudiant' && (
              <NavLink to="/offers/proposal" className={link}>+ Proposer un stage</NavLink>
            )}
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
