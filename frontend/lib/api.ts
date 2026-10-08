const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("preppilot_token");
}

function getHeaders(hasBody: boolean = false): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T>(path: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: getHeaders(false),
    });
    const json = await response.json();
    if (!response.ok) {
      const errMsg = json.error?.message || json.detail || `HTTP error: ${response.status}`;
      return { data: null, error: errMsg };
    }
    return { data: json.data !== undefined ? json.data : json, error: json.error?.message || null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function apiPost<T>(path: string, body: any): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (!response.ok) {
      const errMsg = json.error?.message || json.detail || `HTTP error: ${response.status}`;
      return { data: null, error: errMsg };
    }
    return { data: json.data !== undefined ? json.data : json, error: json.error?.message || null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function apiPut<T>(path: string, body: any): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (!response.ok) {
      const errMsg = json.error?.message || json.detail || `HTTP error: ${response.status}`;
      return { data: null, error: errMsg };
    }
    return { data: json.data !== undefined ? json.data : json, error: json.error?.message || null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<{ data: T | null; error: string | null }> {
  try {
    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const json = await response.json();
    if (!response.ok) {
      const errMsg = json.error?.message || json.detail || `HTTP error: ${response.status}`;
      return { data: null, error: errMsg };
    }
    return { data: json.data !== undefined ? json.data : json, error: json.error?.message || null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

