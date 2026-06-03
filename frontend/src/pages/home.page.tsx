import { Link } from 'react-router-dom';
import { useRole } from '../context/role-context';

export function HomePage() {
  const { role } = useRole();
  const canCreate = role === 'gestionnaire' || role === 'etudiant' || role === 'entreprise';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Bienvenue dans la gestion des stages.</p>
        </div>
      </div>
      <div className="dashboard-grid">
        <Link to="/companies" className="dashboard-card">
          <div className="dashboard-card-icon">🏢</div>
          <div className="dashboard-card-title">Entreprises</div>
          <div className="dashboard-card-desc">Consulter et gérer l'annuaire des entreprises partenaires.</div>
        </Link>
        <Link to="/offers" className="dashboard-card">
          <div className="dashboard-card-icon">📋</div>
          <div className="dashboard-card-title">Offres de stage</div>
          <div className="dashboard-card-desc">Parcourir les offres de stage disponibles.</div>
        </Link>
        {canCreate && (
          <Link to="/admin/companies/new" className="dashboard-card">
            <div className="dashboard-card-icon">➕</div>
            <div className="dashboard-card-title">Nouvelle entreprise</div>
            <div className="dashboard-card-desc">Ajouter une entreprise et ses contacts au répertoire.</div>
          </Link>
        )}
      </div>
    </div>
  );
}
