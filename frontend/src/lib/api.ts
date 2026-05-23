const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Links API
export const linksApi = {
  getAll: () => fetchWithAuth('/links'),
  getOne: (id: string) => fetchWithAuth(`/links/${id}`),
  create: (data: { originalUrl: string; shortCode?: string; title?: string }) =>
    fetchWithAuth('/links', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { originalUrl?: string; title?: string }) =>
    fetchWithAuth(`/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/links/${id}`, {
      method: 'DELETE',
    }),
};

// QR Codes API
export const qrCodesApi = {
  getAll: () => fetchWithAuth('/qrcodes'),
  getOne: (id: string) => fetchWithAuth(`/qrcodes/${id}`),
  create: (data: { data: string; linkId?: string; fgColor?: string; bgColor?: string }) =>
    fetchWithAuth('/qrcodes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { data?: string; fgColor?: string; bgColor?: string }) =>
    fetchWithAuth(`/qrcodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/qrcodes/${id}`, {
      method: 'DELETE',
    }),
};

// Events API
export const eventsApi = {
  getAll: () => fetchWithAuth('/events'),
  getOne: (id: string) => fetchWithAuth(`/events/${id}`),
  create: (data: any) =>
    fetchWithAuth('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchWithAuth(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchWithAuth(`/events/${id}`, {
      method: 'DELETE',
    }),
};
