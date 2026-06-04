import { apiFetch } from '../../lib/api-client';
import type { Offer } from '../offers/offers.types';

export interface Application {
  id: number;
  offer_id: number;
  student_id: number;
  selected: number;
  created_at: string;
}

export function applyToOffer(offerId: number, studentId: number): Promise<void> {
  return apiFetch<void>(`/offers/${offerId}/applications`, {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId }),
  });
}

export function listApplications(offerId: number): Promise<Application[]> {
  return apiFetch<Application[]>(`/offers/${offerId}/applications`);
}

export function listStudentApplications(studentId: number): Promise<Application[]> {
  return apiFetch<Application[]>(`/students/${studentId}/applications`);
}

export function selectCandidate(offerId: number, applicationId: number): Promise<Offer> {
  return apiFetch<Offer>(`/offers/${offerId}/select-candidate`, {
    method: 'POST',
    body: JSON.stringify({ application_id: applicationId }),
  });
}
