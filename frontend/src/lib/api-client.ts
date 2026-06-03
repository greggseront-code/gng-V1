import { ROLE_STORAGE_KEY, type RoleState } from '../context/role-context';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ROLE_STORAGE_KEY);
    if (!raw) return {};
    const { role, entityId } = JSON.parse(raw) as RoleState;
    const headers: Record<string, string> = {};
    if (role) headers['x-role'] = role;
    if (entityId != null) headers['x-entity-id'] = String(entityId);
    return headers;
  } catch {
    return {};
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}
