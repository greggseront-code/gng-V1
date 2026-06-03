import { useState } from 'react';
import type { OfferInput } from './offers.types';

interface OfferFormProps {
  companyId: number;
  contactId?: number;
  initialValues?: Partial<OfferInput>;
  onSubmit: (data: OfferInput & { file?: File }) => Promise<void>;
  submitLabel: string;
}

export function OfferForm({ companyId, contactId, initialValues, onSubmit, submitLabel }: OfferFormProps) {
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [location, setLocation] = useState(initialValues?.location ?? '');
  const [technologies, setTechnologies] = useState(initialValues?.technologies ?? '');
  const [objectives, setObjectives] = useState(initialValues?.objectives ?? '');
  const [remoteAllowed, setRemoteAllowed] = useState(initialValues?.remote_allowed ?? false);
  const [remotePercentage, setRemotePercentage] = useState<string>(
    initialValues?.remote_percentage != null ? String(initialValues.remote_percentage) : '',
  );
  const [remarks, setRemarks] = useState(initialValues?.remarks ?? '');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const priorityContactId = contactId ?? initialValues?.priority_contact_id ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (priorityContactId == null) {
      setError('Veuillez sélectionner un contact prioritaire.');
      return;
    }

    if (remoteAllowed && remotePercentage === '') {
      setError('Veuillez saisir le pourcentage de télétravail.');
      return;
    }

    const data: OfferInput & { file?: File } = {
      company_id: companyId,
      priority_contact_id: priorityContactId,
      contact_ids: [priorityContactId],
      description,
      location: location || undefined,
      technologies: technologies || undefined,
      objectives: objectives || undefined,
      remote_allowed: remoteAllowed,
      remote_percentage: remoteAllowed && remotePercentage !== '' ? Number(remotePercentage) : undefined,
      remarks: remarks || undefined,
      file,
    };

    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label className="form-label form-label-required">Description du poste</label>
        <textarea
          className="form-textarea"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez le poste, les missions…"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Lieu</label>
          <input
            className="form-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ville, département…"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Technologies</label>
          <input
            className="form-input"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            placeholder="React, Python, SQL…"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Objectifs pédagogiques</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={objectives}
          onChange={(e) => setObjectives(e.target.value)}
          placeholder="Compétences visées, livrables attendus…"
        />
      </div>

      <div className="form-group">
        <label className="form-checkbox-label">
          <input
            type="checkbox"
            checked={remoteAllowed}
            onChange={(e) => {
              setRemoteAllowed(e.target.checked);
              if (!e.target.checked) setRemotePercentage('');
            }}
          />
          Télétravail autorisé
        </label>
      </div>

      {remoteAllowed && (
        <div className="form-group">
          <label className="form-label form-label-required">Pourcentage de télétravail</label>
          <input
            className="form-input"
            type="number"
            min={0}
            max={100}
            required={remoteAllowed}
            value={remotePercentage}
            onChange={(e) => setRemotePercentage(e.target.value)}
            placeholder="Ex. 50"
            style={{ maxWidth: '8rem' }}
          />
          <span className="form-hint">Entre 0 et 100 %</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Remarques</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Informations complémentaires…"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Pièce jointe (PDF ou DOCX, max 5 Mo)</label>
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="form-input"
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Envoi…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
