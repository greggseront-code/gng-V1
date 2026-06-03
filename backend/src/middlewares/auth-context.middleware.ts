import type { Request, Response, NextFunction } from 'express';

export type Role = 'gestionnaire' | 'lecteur' | 'etudiant' | 'entreprise';

const VALID_ROLES: Role[] = ['gestionnaire', 'lecteur', 'etudiant', 'entreprise'];

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth: {
        role: Role | null;
        entityId: number | null;
      };
    }
  }
}

export function authContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const rawRole = req.headers['x-role'];
  const rawEntityId = req.headers['x-entity-id'];

  const role =
    typeof rawRole === 'string' && VALID_ROLES.includes(rawRole as Role)
      ? (rawRole as Role)
      : null;

  const entityId =
    typeof rawEntityId === 'string' && rawEntityId !== '' ? Number(rawEntityId) : null;

  req.auth = { role, entityId };
  next();
}
