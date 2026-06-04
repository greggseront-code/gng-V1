import { z } from 'zod';

export const SelectCandidateSchema = z.object({
  application_id: z.number().int().positive(),
});
