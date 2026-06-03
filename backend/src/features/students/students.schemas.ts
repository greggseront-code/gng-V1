import { z } from 'zod';

export const StudentInputSchema = z.object({
  matricule: z.string().optional(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  date_naissance: z.string().optional(),
});

export const StudentsImportSchema = z.array(StudentInputSchema).min(1, 'La liste ne peut pas être vide');
