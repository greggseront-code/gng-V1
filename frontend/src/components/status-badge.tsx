import type { OfferStatus } from '../features/offers/offers.types';
import { OFFER_STATUS_LABELS } from '../features/offers/offers.types';

const STATUS_BADGE_CLASS: Record<OfferStatus, string> = {
  soumise: 'badge badge-warning',
  validee_et_visible: 'badge badge-success',
  prise: 'badge badge-primary',
  non_disponible: 'badge badge-gray',
  refusee: 'badge badge-error',
};

interface StatusBadgeProps {
  status: OfferStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={STATUS_BADGE_CLASS[status]}>
      {OFFER_STATUS_LABELS[status]}
    </span>
  );
}
