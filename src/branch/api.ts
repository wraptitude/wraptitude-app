import { fetchAuthSession } from 'aws-amplify/auth';

import { BRANCH_API_URL } from './config';

interface ApiEnvelope<T> {
  data: T;
  message?: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }
  return payload.data;
}

export async function branchApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) {
    throw new Error('Please sign in again.');
  }
  const response = await fetch(`${BRANCH_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...(init.headers || {}),
    },
  });
  return parseResponse<T>(response);
}

export async function publicBranchApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BRANCH_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  return parseResponse<T>(response);
}
