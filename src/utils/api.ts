const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Script generation
  brainstorm: (notes: string, topic: string) =>
    request<{ suggestions: any[] }>('/scripts/brainstorm', {
      method: 'POST',
      body: JSON.stringify({ notes, topic }),
    }),

  generateScript: (topic: string, style: string, outline: any, toneLevel: number) =>
    request<{ id: string; script: string; metrics: any; keywords: string[] }>('/scripts/generate', {
      method: 'POST',
      body: JSON.stringify({ topic, style, outline, toneLevel }),
    }),

  improveScript: (script: string, focus?: string) =>
    request<{ script: string; metrics: any; changes: string[] }>('/scripts/improve', {
      method: 'POST',
      body: JSON.stringify({ script, focus }),
    }),

  improveSection: (section: { title: string; content: string }, context?: string) =>
    request<{ title: string; content: string; metrics: any }>('/scripts/improve-section', {
      method: 'POST',
      body: JSON.stringify({ section, context }),
    }),

  // Script CRUD
  listScripts: () => request<any[]>('/scripts'),
  getScript: (id: string) => request<any>(`/scripts/${id}`),
  updateScript: (id: string, data: any) =>
    request<{ success: boolean }>(`/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteScript: (id: string) =>
    request<{ success: boolean }>(`/scripts/${id}`, { method: 'DELETE' }),

  // Competitor analysis
  analyzeVideo: (videoData: { title: string; description: string; channel: string; metrics: any }) =>
    request<any>('/competitor/analyze', {
      method: 'POST',
      body: JSON.stringify(videoData),
    }),

  // Dashboard
  getDashboardStats: () => request<any>('/dashboard/stats'),
};
