import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompany, addContact } from '../features/companies/companies.api';
import type { CompanyWithContacts, ContactRole } from '../features/companies/companies.types';
import { CONTACT_ROLE_LABELS } from '../features/companies/companies.types';

const ALL_ROLES: ContactRole[] = ['maitre_de_stage', 'responsable_administratif', 'encadrant_technique'];

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

export function AdminCompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyWithContacts | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<ContactRole[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  function load() {
    if (id) getCompany(Number(id)).then(setCompany).catch(console.error);
  }

  useEffect(() => { load(); }, [id]);

  function toggleRole(role: ContactRole) {
    setRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  }

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    try {
      await addContact(Number(id), { first_name: firstName, last_name: lastName, email, phone: phone || undefined, roles });
      setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setRoles([]);
      setFormSuccess(true);
      load();
    } catch (err) {
      setFormError(String(err));
    }
  }

  if (!company) return <p className="text-muted">Chargement…</p>;

  return (
    <div className="stack-lg">
      <div className="page-header">
        <div>
          <h1 className="page-title">{company.name}</h1>
          <p className="page-subtitle"><Link to="/companies">Entreprises</Link> / {company.name}</p>
        </div>
      </div>

      {company.probable_duplicates && company.probable_duplicates.length > 0 && (
        <div className="alert alert-warning">
          <strong>Doublons probables :</strong>
          <ul>
            {company.probable_duplicates.map((d) => (
              <li key={d.id}><Link to={`/admin/companies/${d.id}`}>{d.name}</Link></li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Informations</span>
        </div>
        <div className="card-body">
          <div className="meta-list">
            <div className="meta-item">
              <span className="meta-label">Email général</span>
              <span className="meta-value">{company.general_email}</span>
            </div>
            {company.address && (
              <div className="meta-item">
                <span className="meta-label">Adresse</span>
                <span className="meta-value">{company.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Contacts ({company.contacts.length})</span>
        </div>
        <div className="card-body">
          {company.contacts.length === 0 ? (
            <p className="text-muted">Aucun contact enregistré.</p>
          ) : (
            <div className="contact-list">
              {company.contacts.map((c) => (
                <div key={c.id} className="contact-item">
                  <div className="contact-avatar">{initials(c.first_name, c.last_name)}</div>
                  <div className="contact-info">
                    <div className="contact-name">{c.first_name} {c.last_name}</div>
                    <div className="contact-detail">{c.email}{c.phone && ` · ${c.phone}`}</div>
                    <div className="contact-roles">
                      {c.roles.map((r) => (
                        <span key={r} className="badge badge-primary">{CONTACT_ROLE_LABELS[r]}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Ajouter un contact</span>
        </div>
        <div className="card-body">
          <form onSubmit={handleAddContact} className="form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label form-label-required">Prénom</label>
                <input className="form-input" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Nom</label>
                <input className="form-input" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label form-label-required">Email</label>
                <input className="form-input" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <fieldset className="form-fieldset">
                <legend>Rôles *</legend>
                <div className="form-checkbox-group">
                  {ALL_ROLES.map((role) => (
                    <label key={role} className="form-checkbox-label">
                      <input type="checkbox" checked={roles.includes(role)} onChange={() => toggleRole(role)} />
                      {CONTACT_ROLE_LABELS[role]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            {formSuccess && <div className="alert alert-success">Contact ajouté avec succès.</div>}
            {formError && <div className="alert alert-error">{formError}</div>}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={roles.length === 0}>
                Ajouter le contact
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
