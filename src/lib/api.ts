const BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const HEADERS = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export interface Profile {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  sample_size: number;
  age: number;
  age_group: string;
  country_id: string;
  country_probability: number;
  created_at: string;
}

export interface ProfileSummary {
  id: string;
  name: string;
  gender: string;
  age: number;
  age_group: string;
  country_id: string;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
  count?: number;
}

export async function createProfile(name: string): Promise<{ status: number; body: ApiResponse<Profile> }> {
  const res = await fetch(`${BASE_URL}/api/profiles`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

export async function listProfiles(filters: {
  gender?: string;
  country_id?: string;
  age_group?: string;
}): Promise<{ status: number; body: ApiResponse<ProfileSummary[]> }> {
  const params = new URLSearchParams();
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.country_id) params.set('country_id', filters.country_id);
  if (filters.age_group) params.set('age_group', filters.age_group);
  const qs = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${BASE_URL}/api/profiles${qs}`, { headers: HEADERS });
  const body = await res.json();
  return { status: res.status, body };
}

export async function getProfile(id: string): Promise<{ status: number; body: ApiResponse<Profile> }> {
  const res = await fetch(`${BASE_URL}/api/profiles/${id}`, { headers: HEADERS });
  const body = await res.json();
  return { status: res.status, body };
}

export async function deleteProfile(id: string): Promise<{ status: number }> {
  const res = await fetch(`${BASE_URL}/api/profiles/${id}`, {
    method: 'DELETE',
    headers: HEADERS,
  });
  return { status: res.status };
}
