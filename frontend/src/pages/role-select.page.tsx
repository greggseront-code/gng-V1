import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, type Role } from '../context/role-context';
import { listCompanies } from '../features/companies/companies.api';
import { apiFetch } from '../lib/api-client';
import type { Company } from '../features/companies/companies.types';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

type Step = 'select' | 'etudiant' | 'entreprise';

const ROLES = [
  { role: 'gestionnaire' as Role, title: 'Gestionnaire', desc: 'Accès complet à toutes les fonctionnalités.' },
  { role: 'lecteur' as Role, title: 'Lecteur', desc: 'Consultation uniquement, sans modification.' },
  { role: 'etudiant' as Role, title: 'Étudiant', desc: 'Recherche de stage et suivi de candidatures.' },
  { role: 'entreprise' as Role, title: 'Entreprise', desc: "Dépôt d'offres et suivi des candidats." },
];

export function RoleSelectPage() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const [step, setStep] = useState<Step>('select');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (step === 'etudiant') {
      setLoading(true);
      setEmpty(false);
      apiFetch<Student[]>('/students')
        .then((data) => { setStudents(data); if (data.length === 0) setEmpty(true); })
        .catch(() => { setStudents([]); setEmpty(true); })
        .finally(() => setLoading(false));
    }
    if (step === 'entreprise') {
      setLoading(true);
      setEmpty(false);
      listCompanies()
        .then((data) => { setCompanies(data); if (data.length === 0) setEmpty(true); })
        .catch(() => { setCompanies([]); setEmpty(true); })
        .finally(() => setLoading(false));
    }
  }, [step]);

  function pickSimpleRole(role: Role) {
    setRole(role);
    navigate('/');
  }

  function handleCard(role: Role) {
    if (role === 'gestionnaire' || role === 'lecteur') {
      pickSimpleRole(role);
    } else {
      setSearch('');
      setStudents([]);
      setCompanies([]);
      setEmpty(false);
      setStep(role);
    }
  }

  const filteredStudents = students.filter((s) =>
    `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="role-select-screen">
      <div className="role-select-container">
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            gnu-gesta
          </div>
          <h1 className="role-select-title">Choisissez votre profil</h1>
          <p className="role-select-subtitle">Sélectionnez votre rôle pour accéder à l'application.</p>
        </div>

        {step === 'select' && (
          <div className="role-grid">
            {ROLES.map(({ role, title, desc }) => (
              <button key={role} className="role-btn" onClick={() => handleCard(role)}>
                <span className="role-btn-title">{title}</span>
                <span className="role-btn-desc">{desc}</span>
              </button>
            ))}
          </div>
        )}

        {(step === 'etudiant' || step === 'entreprise') && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">
                {step === 'etudiant' ? 'Sélectionner votre profil étudiant' : 'Sélectionner votre entreprise'}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={() => setStep('select')}>
                ← Retour
              </button>
            </div>
            <div className="card-body">
              <input
                className="search-input"
                style={{ width: '100%', marginBottom: '1rem' }}
                placeholder={step === 'etudiant' ? 'Rechercher par nom ou email…' : 'Rechercher une entreprise…'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />

              {loading && <p className="text-muted">Chargement…</p>}

              {!loading && empty && step === 'etudiant' && (
                <p className="text-muted">
                  Aucun étudiant enregistré. Demandez à votre gestionnaire d'importer la liste.
                </p>
              )}
              {!loading && empty && step === 'entreprise' && (
                <p className="text-muted">Aucune entreprise enregistrée.</p>
              )}

              {!loading && step === 'etudiant' && filteredStudents.length > 0 && (
                <div className="contact-list">
                  {filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setRole('etudiant', s.id); navigate('/'); }}
                      style={{ all: 'unset', cursor: 'pointer', width: '100%' }}
                    >
                      <div className="contact-item">
                        <div className="contact-avatar">
                          {(s.first_name[0] ?? '').toUpperCase()}{(s.last_name[0] ?? '').toUpperCase()}
                        </div>
                        <div className="contact-info">
                          <div className="contact-name">{s.first_name} {s.last_name}</div>
                          <div className="contact-detail">{s.email}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loading && step === 'entreprise' && filteredCompanies.length > 0 && (
                <div className="contact-list">
                  {filteredCompanies.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setRole('entreprise', c.id); navigate('/'); }}
                      style={{ all: 'unset', cursor: 'pointer', width: '100%' }}
                    >
                      <div className="contact-item">
                        <div className="contact-avatar">
                          {c.name[0].toUpperCase()}
                        </div>
                        <div className="contact-info">
                          <div className="contact-name">{c.name}</div>
                          <div className="contact-detail">{c.general_email}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
