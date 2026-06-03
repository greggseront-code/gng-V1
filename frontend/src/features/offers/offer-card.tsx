import { Link } from 'react-router-dom';
import type { Offer } from './offers.types';
import { StatusBadge } from '../../components/status-badge';

interface OfferCardProps {
  offer: Offer;
  companyName?: string;
}

function truncate(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export function OfferCard({ offer, companyName }: OfferCardProps) {
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            {companyName && (
              <div className="text-muted" style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                {companyName}
              </div>
            )}
            <p style={{ marginBottom: '0.5rem' }}>{truncate(offer.description)}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {offer.location && (
                <span className="text-muted" style={{ fontSize: '0.8125rem' }}>📍 {offer.location}</span>
              )}
              {offer.technologies && (
                <span className="text-muted" style={{ fontSize: '0.8125rem' }}>🛠 {offer.technologies}</span>
              )}
              {offer.remote_allowed ? (
                <span className="text-muted" style={{ fontSize: '0.8125rem' }}>
                  Télétravail{offer.remote_percentage != null ? ` ${offer.remote_percentage}%` : ''}
                </span>
              ) : null}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
            <StatusBadge status={offer.status} />
            <Link to={`/offers/${offer.id}`} className="btn btn-secondary btn-sm">
              Voir l'offre
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
