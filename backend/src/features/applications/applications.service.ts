import { getDb } from '../../db/db.connection';
import type { Application } from './applications.types';
import type { Offer } from '../offers/offers.types';
import {
  insertApplication,
  listApplicationsByOffer as listByOfferQuery,
  listApplicationsByStudent as listByStudentQuery,
  findApplicationById as findByIdQuery,
  findApplicationByStudentAndOffer as findByStudentAndOfferQuery,
  selectCandidateAndCloseOffer as selectCandidateQuery,
} from './applications.queries';

export {
  DuplicateApplicationError,
  ApplicationOfferMismatchError,
  OfferAlreadyTakenError,
} from './applications.queries';

export function createApplication(offerId: number, studentId: number): Application {
  return insertApplication(getDb(), offerId, studentId);
}

export function getApplicationsByOffer(offerId: number): Application[] {
  return listByOfferQuery(getDb(), offerId);
}

export function getApplicationsByStudent(studentId: number): Application[] {
  return listByStudentQuery(getDb(), studentId);
}

export function getApplicationById(id: number): Application | null {
  return findByIdQuery(getDb(), id);
}

export function getApplicationByStudentAndOffer(offerId: number, studentId: number): Application | null {
  return findByStudentAndOfferQuery(getDb(), offerId, studentId);
}

export function selectCandidate(applicationId: number, offerId: number): Offer {
  return selectCandidateQuery(getDb(), applicationId, offerId);
}
